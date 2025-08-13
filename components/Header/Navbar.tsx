// components/Header/Navbar.tsx
"use client";

import { Image, Box, Flex, Input, InputGroup, InputLeftElement, Text, Menu, MenuButton, MenuList, MenuItem, Tooltip, IconButton, Badge } from "@chakra-ui/react";
import { useEffect, useRef, useState, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  HomeIcon,
  NotificationIcon,
  SearchIcon,
  ActivityIcon,
  AccountIcon
} from "@/components/Icons";
import NotificationDrawer from "@/components/Header/Notification";
import { LogInIcon, MenuIcon } from "lucide-react";
import { useToast } from "@chakra-ui/react";
import { useSocket } from "@/app/socket";
import axios from "axios";
import OrderIcon from "@/components/Icons/OrderIcon";
import VendorIcon from "@/components/Icons/VendorIcon";
import PostEventIcon from "@/components/Icons/PostEventIcon";

interface Notification {
  id: string;
  row_id: string;
  recipient_id: string;
  recipient_type: string;
  triggerer_id: string;
  triggerer_type: string;
  notification_type: string;
  media_thumbnail: string;
  notification_timestamp: Date;
  read_at: Date | null;
  title: string;
  meaningful_text: string;
  activity_id?: string;
  activity_type?: 'event' | 'post';
  action_url?: string;
}

interface GroupedNotifications {
  message: Notification[];
  comment: Notification[];
  like: Notification[];
  activity_join: Notification[];
  order: Notification[];
}

export interface NotificationProps {
  notifications: GroupedNotifications;
  isLoading: boolean;
  markAsRead: (id?: string, all?: boolean) => Promise<void>;
}

export default function Navbar() {
  const { data: session } = useSession();
  const toast = useToast();
  const { socket, isConnected: socketConnected, unreadCounts, fetchUnreadCounts } = useSocket();

  // States
  const [active, setActive] = useState(false);
  const [activeNotification, setActiveNotification] = useState(false);
  const [isActivitiesDropdownOpen, setIsActivitiesDropdownOpen] = useState(false);
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [notifications, setNotifications] = useState<GroupedNotifications>({
    message: [],
    comment: [],
    like: [],
    activity_join: [],
    order: [],
  });

  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [notificationsLoaded, setNotificationsLoaded] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setIsClient(true); // Set to true after client-side mounting
  }, []);
  useEffect(() => {
  if (activeNotification) {
    markNotificationsAsRead(undefined, true);
  }
}, [activeNotification]);
  // Refs
  const notificationRef = useRef<HTMLDivElement | null>(null);
  const notificationBoxRef = useRef<HTMLDivElement | null>(null);
  const activitiesRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  const pathname = usePathname();
  useEffect(() => {
    if (pathname !== "/search") {
      setSearch("");
    }
  }, [pathname]);

  // Handling logout
  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      toast({
        title: "Logged out",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      router.push('/');
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout failed",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handling search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?title=${encodeURIComponent(search.trim())}`);
    }
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoadingNotifications(true);
      const response = await axios.get("/api/notifications", { withCredentials: true });
      
      if (response.data) {
        setNotifications(response.data);
        setNotificationsLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [session?.user?.id]);

  // Mark notifications as read
  const markNotificationsAsRead = useCallback(async (id?: string, all: boolean = false) => {
    try {
      await axios.put("/api/notifications/mark-read", { 
        id,
        all
      }, { withCredentials: true });
      // Refresh unread counts after marking as read
      await fetchUnreadCounts();
      // If notification drawer is open, update the UI to reflect read status
      if (activeNotification) {
        if (all) {
          // Mark all notifications as read in the UI
          setNotifications(prev => {
            const updatedNotifications = { ...prev };
            Object.keys(updatedNotifications).forEach(key => {
              updatedNotifications[key] = updatedNotifications[key].map(notification => ({
                ...notification,
                read_at: notification.read_at || new Date()
              }));
            });
            return updatedNotifications;
          });
        } else if (id) {
          // Mark a specific notification as read in the UI
          setNotifications(prev => {
            const updatedNotifications = { ...prev };
            Object.keys(updatedNotifications).forEach(key => {
              updatedNotifications[key] = updatedNotifications[key].map(notification => 
                notification.id === id 
                  ? { ...notification, read_at: new Date() }
                  : notification
              );
            });
            return updatedNotifications;
          });
        }
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  }, [activeNotification, fetchUnreadCounts]);

  // Effect to join personal room when session and socket are available
  useEffect(() => {
    if (socket && session) {
      // Only emit if we have both socket and session
      socket.emit("join_personal_room", `user_${session.user.id}`);
    }
  }, [session, socket]);

  // Fetch notifications initially and when connection status changes
  useEffect(() => {
    if (session && socketConnected && !notificationsLoaded) {
      fetchNotifications();
    }
  }, [session, socketConnected, notificationsLoaded, fetchNotifications]);

  // Listen for real-time notification events and update notification list
  useEffect(() => {
    if (!socket) return;
    const handleActivityNotification = () => {
      fetchNotifications();
    };
    const handleNewNotification = () => {
      fetchNotifications();
    };
    socket.on('activity_notification', handleActivityNotification);
    socket.on('new_notification', handleNewNotification);
    return () => {
      socket.off('activity_notification', handleActivityNotification);
      socket.off('new_notification', handleNewNotification);
    };
  }, [socket, fetchNotifications]);

  const handleNotificationClick = () => {
    setActiveNotification(prev => !prev);
    setIsActivitiesDropdownOpen(false);
    setIsAccountDropdownOpen(false);
    
    if (!activeNotification) {
      fetchNotifications();
    }
  };

  const handleActivitiesClick = () => {
    setIsActivitiesDropdownOpen((prev) => !prev);
    setActiveNotification(false);
    setIsAccountDropdownOpen(false);
  };

  const handleAccountClick = () => {
    setIsAccountDropdownOpen((prev) => !prev);
    setActiveNotification(false);
    setIsActivitiesDropdownOpen(false);
  };

  // Handle clicking outside to close dropdowns
  const handleClickOutside = (e: MouseEvent) => {
    if (
      activitiesRef.current &&
      !activitiesRef.current.contains(e.target as Node)
    ) {
      setIsActivitiesDropdownOpen(false);
    }
    if (
      notificationRef.current &&
      !notificationRef.current.contains(e.target as Node) &&
      notificationBoxRef.current &&
      !notificationBoxRef.current.contains(e.target as Node)
    ) {
      setActiveNotification(false);
    }
    if (
      accountRef.current &&
      !accountRef.current.contains(e.target as Node)
    ) {
      setIsAccountDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef, notificationBoxRef, activitiesRef, accountRef]);

  useEffect(() => {
    setActive(false);
    setActiveNotification(false);
    setIsActivitiesDropdownOpen(false);
    setIsAccountDropdownOpen(false);
  }, [pathname]);

  // Fix white space issue with global style
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      body { max-width: 100vw; overflow-x: hidden; }
      #__next, main { max-width: 100vw; overflow-x: hidden; }
      .chakra-menu__menu-list { z-index: 9999 !important; }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Read cart count from localStorage
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.length);
    };
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cartUpdated", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <Box 
      pos="relative" 
      bgColor="#FFF" 
      boxShadow="0 2px 4px 0 rgba(0,0,0,.05)" 
      zIndex="400" 
      w="100%"
      maxW="100%"
      sx={{ 
        ".chakra-menu__menu-list": { zIndex: 9999 } 
      }}
    >
      <Flex
        position="relative"
        flexDir={{ base: "column", md: "row" }}
        height={{ base: "auto", md: "auto" }}
        maxH="85px"
        py={{ base: "4px", md: "4px" }}
        px={{ base: "2px", md: "5px" }}
        alignItems={{ base: "flex-start", md: "center" }}
        justifyContent="space-between"
        w="100%"
      >
        {/* Left Side: Logo and Search Bar */}
        <Box
          display="flex"
          alignItems="center"
          w={{ base: "full", md: "auto" }}
        >
          <Box
            _hover={{ textDecoration: "none" }}
            display="flex"
            justifyContent="flex-start"
            alignItems="center"
            fontSize="24px"
            fontWeight="500"
            maxH="60px"
            py={{ base: "5px", lg: "10px" }}
          >
            <Link href="/">
              <Image src="/logo.webp" width={120} objectFit="contain" alt="logo" />
            </Link>
            <Box flexDir="column" display={{ base: "flex", lg: "flex" }}>
              <Link href="/">
                <Text fontSize={{ base: "0.65em", md: "0.9em", xl: "1em" }} fontFamily="var(--font-mulish)" fontWeight="800" color="#0096E4">
                  99FitnessFriends
                </Text>
                <Text fontSize={{ base: "0.5em", md: "0.6em", xl: "0.6em" }} color="#0096E4" mt={{ base: "-5px", md: "-5px", xl: "-10px" }}>
                  Make Friends for Fitness
                </Text>
              </Link>
            </Box>
          </Box>

          <InputGroup
            ml={{ base: "0px", lg: "10px" }}
            display={{ base: "none", md: "none", lg: "flex" }}
            size="md"
            w="auto"
            maxW="300px"
            bg="#FFF"
            onKeyUp={(e) => { if (e.key === "Enter") router.push(`/search?title=${search}`); }}
          >
            <InputLeftElement>
              <SearchIcon height="16px" width="16px" stroke="#64748B" />
            </InputLeftElement>
            <form onSubmit={handleSearch}>
              <Input
                type="text"
                focusBorderColor="#F9690E"
                w="full"
                minW="300px"
                pl="40px"
                placeholder="search"
                bg="#F8FAFC"
                borderRadius="4px"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
          </InputGroup>
        </Box>

        {/* Right Side: Navigation Items */}
        <Box
          display={{ base: active ? "flex" : "none", md: "flex" }}
          alignItems="center"
          justifyContent={{ base: "space-evenly", md: "flex-end" }}
          h={{ base: active ? "30px" : "0px", md: "100%" }}
          mb={{ base: active ? "20px" : "0px", md: 0 }}
          bg="#FFF"
          position="relative"
        >
          <Flex align="center" gap={3}>
            {/* Home Icon */}
            <Link href="/">
              <Box
                fontWeight="500"
                fontSize={{ base: "0px", lg: "16px" }}
                px={{ md: "5px", lg: "10px" }}
                _hover={{ bgColor: "#F7FAFC" }}
                py={{ base: "5px", lg: "10px" }}
                display="flex"
                justifyContent="center"
                flexDir="column"
                alignItems="center"
                color={pathname === "/" ? "#f9690e" : "#64748B"}
                position={pathname === "/" ? "relative" : "static"}
                h="100%"
              >
                <HomeIcon height="22px" width="22px" stroke={pathname === "/" ? "#f9690e" : "#64748B"} />
                <Text display={{ base: "none", lg: "block" }}>Home</Text>
              </Box>
            </Link>
            {/* Vendor Icon */}
            {session && (
              <Link href="/vendor/dashboard">
                <Box
                  fontWeight="500"
                  fontSize={{ base: "0px", lg: "16px" }}
                  px={{ md: "5px", lg: "10px" }}
                  _hover={{ bgColor: "#F7FAFC" }}
                  py={{ base: "5px", lg: "10px" }}
                  display="flex"
                  justifyContent="center"
                  flexDir="column"
                  alignItems="center"
                  color={pathname === "/vendor/dashboard" ? "#f9690e" : "#64748B"}
                  position={pathname === "/vendor/dashboard" ? "relative" : "static"}
                  h="100%"
                >
                  <VendorIcon height="22px" width="22px" stroke={pathname === "/vendor/dashboard" ? "#f9690e" : "#64748B"} />
                  <Text display={{ base: "none", lg: "block" }}>Vendor</Text>
                </Box>
              </Link>
            )}
            {session && (
              <Link href="/profile/me">
                <Box
                  fontWeight="500"
                  fontSize={{ base: "0px", lg: "16px" }}
                  px={{ md: "5px", lg: "10px" }}
                  _hover={{ bgColor: "#F7FAFC" }}
                  py={{ base: "5px", lg: "10px" }}
                  display="flex"
                  justifyContent="center"
                  flexDir="column"
                  alignItems="center"
                  color={pathname === "/profile/me" ? "#f9690e" : "#64748B"}
                  position={pathname === "/profile/me" ? "relative" : "static"}
                  h="100%"
                >
                  <PostEventIcon height="22px" width="22px" stroke={pathname === "/profile/me" ? "#f9690e" : "#64748B"} />
                  <Text display={{ base: "none", lg: "block" }}>Post/Event</Text>
                </Box>
              </Link>
            )}
          </Flex>
             
          {!session && (
            <>
              <Link href="/activities" style={{ textDecoration: 'none' }}>
                <Box
                  fontWeight="500"
                  fontSize={{ base: "0px", lg: "16px" }}
                  px="10px"
                  py={{ base: "5px", lg: "10px" }}
                  display="flex"
                  justifyContent="center"
                  flexDir="column"
                  alignItems="center"
                  _hover={{ bgColor: "#F7FAFC" }}
                  bg="#fff"
                  color="#64748B"
                  position="static"
                  cursor="pointer"
                  h="100%" 
                >
                  <ActivityIcon height="22px" width="22px" stroke="#64748B" />
                  <Text display={{ base: "none", lg: "block" }}>Activities</Text>
                </Box>
              </Link>
              <Link href={`/login?callbackUrl=${encodeURIComponent(isClient ? window.location.pathname : '/')}`} style={{ textDecoration: 'none' }}>
                <Box
                  fontWeight="500"
                  fontSize={{ base: "0px", lg: "16px" }}
                  px="10px"
                  py={{ base: "5px", lg: "10px" }}
                  display="flex"
                  justifyContent="center"
                  flexDir="column"
                  alignItems="center"
                  _hover={{ bgColor: "#F7FAFC" }}
                  bg="#fff"
                  color="#64748B"
                  position="static"
                  cursor="pointer"
                  h="100%" 
                >
                  <LogInIcon height="22px" width="22px" stroke="#64748B" />
                  <Text display={{ base: "none", lg: "block" }}>Login</Text>
                </Box>
              </Link>
            </>
          )}
          {session && (
            <>
              <Link href="/search">
                <Box
                  fontWeight="500"
                  fontSize={{ base: "0px", lg: "16px" }}
                  px="10px"
                  display={{ base: active ? "flex" : "none", lg: "none" }}
                  _hover={{ bgColor: "#F7FAFC" }}
                  py={{ base: "5px", lg: "10px" }}
                  justifyContent="center"
                  flexDir="column"
                  alignItems="center"
                  color={pathname === "/search" ? "#f9690e" : "#64748B"}
                  position={pathname === "/search" ? "relative" : "static"}
                  h="100%" 
                >
                  <SearchIcon height="22px" width="22px" stroke={pathname === "/search" ? "#f9690e" : "#64748B"} />
                  <Text display={{ base: "none", lg: "block" }}>Search</Text>
                </Box>
              </Link>

              <Box pos="relative" ref={activitiesRef}>
                <Menu 
                  isOpen={isActivitiesDropdownOpen} 
                  onClose={() => setIsActivitiesDropdownOpen(false)}
                  autoSelect={false}
                >
                  <MenuButton
                    as={Box}
                    onClick={handleActivitiesClick}
                    fontWeight="500"
                    fontSize={{ base: "0px", lg: "16px" }}
                    px="10px"
                    py={{ base: "5px", lg: "10px" }}
                    display="flex"
                    _hover={{ bgColor: "#F7FAFC" }}
                    justifyContent="center"
                    flexDir="column"
                    alignItems="center"
                    color="#64748B"
                    cursor="pointer"
                    h="100%" 
                  >
                    <Box display="flex" flexDir="column" alignItems="center">
                      <ActivityIcon height="22px" width="22px" stroke="#64748B" />
                      <Text display={{ base: "none", lg: "block" }} fontSize={{ base: "0px", lg: "16px" }} marginTop="2px">
                        Activities
                      </Text>
                    </Box>
                  </MenuButton>
                  <MenuList zIndex={9999}>
                    <MenuItem as={Link} href="/activities" onClick={() => setIsActivitiesDropdownOpen(false)}>All Activities</MenuItem>
                    <MenuItem as={Link} href="/messages" onClick={() => setIsActivitiesDropdownOpen(false)}>Messages</MenuItem>
                    <MenuItem as={Link} href="/requests" onClick={() => setIsActivitiesDropdownOpen(false)}>Requests</MenuItem>
                    <MenuItem as={Link} href="/posts/create" onClick={() => setIsActivitiesDropdownOpen(false)}>Create Post</MenuItem>
                    <MenuItem as={Link} href="/event/create" onClick={() => setIsActivitiesDropdownOpen(false)}>Create Event</MenuItem>
                  </MenuList>
                </Menu>
              </Box>

              <Box pos="relative">
                <Box
                  ref={notificationRef}
                  onClick={handleNotificationClick}
                  fontWeight="500"
                  fontSize={{ base: "0px", lg: "16px" }}
                  px="10px"
                  py={{ base: "5px", lg: "10px" }}
                  display="flex"
                  _hover={{ bgColor: "#F7FAFC" }}
                  justifyContent="center"
                  flexDir="column"
                  alignItems="center"
                  color="#64748B"
                  cursor="pointer"
                  h="100%" 
                >
                  <NotificationIcon width="24px" height="24px" stroke="#64748B" />
                  {(() => {
                    const notifTotal = (unreadCounts.message || 0) + (unreadCounts.comment || 0) + (unreadCounts.like || 0) + (unreadCounts.activity_join || 0) + (unreadCounts.order || 0);
                    return notifTotal > 0 && (
                      <Box
                        pos="absolute"
                        top="2"
                        right="5"
                        justifyContent="center"
                        alignItems="center"
                        minW="16px"
                        h="16px"
                        borderRadius="50%"
                        bgColor="#059669"
                        color="white"
                        fontSize="10px"
                        fontWeight="bold"
                        textAlign="center"
                        p="2px"
                      >
                        {notifTotal > 99 ? '99+' : notifTotal}
                      </Box>
                    );
                  })()}
                  <Text color="#64748B" display={{ base: "none", lg: "block" }}>Notifications</Text>
                </Box>
                {activeNotification && (
                  <NotificationDrawer
                    ref={notificationBoxRef}
                    notifications={notifications}
                    isLoading={isLoadingNotifications}
                    markAsRead={markNotificationsAsRead}
                  />
                )}
              </Box>

              <Box pos="relative" ref={accountRef}>
                <Menu 
                  isOpen={isAccountDropdownOpen} 
                  onClose={() => setIsAccountDropdownOpen(false)}
                  autoSelect={false}
                >
                  <MenuButton
                    as={Box}
                    onClick={handleAccountClick}
                    fontWeight="500"
                    fontSize={{ base: "0px", lg: "16px" }}
                    px="10px"
                    py={{ base: "5px", lg: "10px" }}
                    display="flex"
                    justifyContent="center"
                    flexDir="column"
                    alignItems="center"
                    _hover={{ bgColor: "#F7FAFC" }}
                    color="#64748B"
                    cursor="pointer"
                    h="100%" 
                  >
                    <Box display="flex" flexDir="column" alignItems="center">
                      <AccountIcon height="24px" width="24px" stroke="#64748B" />
                      <Text display={{ base: "none", lg: "block" }} fontSize={{ base: "0px", lg: "16px" }} marginTop="2px">
                        Account
                      </Text>
                    </Box>
                  </MenuButton>
                  <MenuList zIndex={9999}>
                    <MenuItem onClick={() => { router.push('/profile/me'); setIsAccountDropdownOpen(false); }}>User Account</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </MenuList>
                </Menu>
              </Box>

              {/* Cart Icon */}
              <Box position="relative">
                <Tooltip label="Cart" aria-label="Cart">
                  <IconButton
                    aria-label="Cart"
                    icon={<OrderIcon width="28px" height="28px" />}
                    variant="ghost"
                    onClick={() => router.push("/cart")}
                    ml={2}
                  />
                </Tooltip>
                {cartCount > 0 && (
                  <Badge
                    colorScheme="red"
                    borderRadius="full"
                    position="absolute"
                    top={"-1"}
                    right={"-1"}
                    fontSize="0.8em"
                    px={2}
                    py={0.5}
                    zIndex={1}
                  >
                    {cartCount}
                  </Badge>
                )}
              </Box>
            </>
          )}
        </Box>

        {/* Mobile Menu Toggle */}
        <Box
          display={{ base: "block", lg: "none" }}
          position="absolute"
          onClick={() => setActive(prev => !prev)}
          cursor="pointer"
          top={0}
          right={0}
          p="17px"
        >
          <MenuIcon />
        </Box>
      </Flex>
    </Box>
  );
}