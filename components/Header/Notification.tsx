// components/Header/Notification.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Tab, TabList, TabPanel, TabPanels, Tabs, Text, Flex, Skeleton, SkeletonCircle, Button } from "@chakra-ui/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { LikeIcon, MessagesIcon, RequestIcon } from "@/components/Icons";
import { MessageSquareQuote, Check } from "lucide-react";
import UserImage from "../handleImage/UserImage";
import { NotificationProps } from './Navbar';
import { FiShoppingCart } from "react-icons/fi";

dayjs.extend(relativeTime);

interface UserNotificationProps {
  notification: {
    id: string;
    row_id: string;
    notification_type: string;
    notification_timestamp?: Date;
    created_at?: Date;
    meaningful_text: string;
    title: string;
    media_thumbnail: string;
    activity_id?: string;
    activity_type?: 'event' | 'post';
    action_url?: string;
    read_at: Date | null;
    metadata?: {
      orderId?: string;
    };
  };
  markAsRead: (id?: string, all?: boolean) => Promise<void>;
}

function UserNotification({ notification, markAsRead }: UserNotificationProps) {
  const router = useRouter();
  const [isRead, setIsRead] = useState(!!notification.read_at);

  const handleNotificationClick = async () => {
    console.log("Notification clicked:", notification);
    let meta = notification.metadata;
    if (typeof meta === "string") {
      try { meta = JSON.parse(meta); } catch {}
    }
    console.log("Type:", notification.notification_type, "Meta:", meta);
    // If the notification is not yet read, mark it as read
    if (!isRead && typeof markAsRead === "function") {
      await markAsRead(notification.id);
      setIsRead(true);
    }
    if (notification.notification_type === "order" && meta?.orderId) {
      router.push(`/vendor/dashboard?tab=delivery&orderId=${meta.orderId}`);
      return;
    }
    switch (notification.notification_type) {
      case "message":
        router.push('/messages');
        break;
      case "comment":
      case "like":
        if (notification.activity_id) {
          const path = notification.activity_type === 'event' ? 'event' : 'posts';
          router.push(`/${path}/${notification.activity_id}`);
        } else if (notification.action_url) {
          router.push(notification.action_url);
        }
        break;
      case "activity_join":
      case "join_request_voting":
        router.push('/requests');
        break;
      case "join_request_accepted":
        router.push('/messages');
        break;
      default:
        if (notification.action_url) {
          router.push(notification.action_url);
        } else {
          // console.log('Unknown notification type:', notification.notification_type);
        }
    }
  };

  // Use the timestamp field available (either notification_timestamp or created_at)
  const timestamp = notification.notification_timestamp || notification.created_at || new Date();

  return (
    <Box
      display="flex"
      gap="10px"
      alignItems="center"
      justifyContent="flex-start"
      py="5px"
      px="10px"
      borderBottom="1px solid #E5E7EB"
      cursor="pointer"
      onClick={handleNotificationClick}
      _hover={{ backgroundColor: "#F3F4F6" }}
      transition="background-color 0.2s"
      bg={isRead ? "transparent" : "#F0F9FF"}  // Light blue background for unread
    >
      <UserImage
        imageUrl={notification.media_thumbnail}
        width="48px"
        height="48px"
        borderRadius="50%"
        objectFit="cover"
      />
      <Box display="flex" flexDirection="column" flex="1">
        <Text 
          fontSize="14px" 
          fontWeight={isRead ? "400" : "600"}
        >
          {notification.meaningful_text}
        </Text>
        <Text fontSize="12px" color="#475569">{notification.title}</Text>
        <Text fontSize="12px" color="#F97316">{dayjs(timestamp).fromNow()}</Text>
      </Box>
      {!isRead && (
        <Box w="8px" h="8px" borderRadius="50%" bg="#059669" ml="auto" />
      )}
    </Box>
  );
}

function SkeletonNotification() {
  return (
    <Box
      display="flex"
      gap="15px"
      alignItems="center"
      justifyContent="flex-start"
      py="5px"
      px="10px"
      borderBottom="1px solid #E5E7EB"
    >
      <Flex w="full" px="8px" py="6px" gap="15px">
        <SkeletonCircle size="48px" />
        <Box flex="1">
          <Skeleton height="14px" maxW="150px" />
          <Skeleton height="12px" maxW="150px" my="5px" />
          <Skeleton height="12px" maxW="75px" my="5px" />
        </Box>
      </Flex>
    </Box>
  );
}

function EmptyNotificationState({ type }: { type: string }) {
  return (
    <Box py="20px" px="10px" textAlign="center">
      <Text color="#64748B" fontSize="14px">
        {type === 'all' 
          ? 'No notifications yet'
          : `No ${type} notifications yet`}
      </Text>
      <Text color="#94A3B8" fontSize="12px" mt="5px">
        We'll notify you when something happens!
      </Text>
    </Box>
  );
}

const NotificationDrawer = React.forwardRef<HTMLDivElement, NotificationProps>(
  ({ notifications, isLoading, markAsRead }, ref) => {
    const [activeTab, setActiveTab] = useState(0);
    // const [hasNotifications, setHasNotifications] = useState(false);

    // Check if there are any notifications
    useEffect(() => {
      if (!isLoading) {
        const totalCount = 
          notifications.message.length + 
          notifications.comment.length + 
          notifications.like.length + 
          notifications.activity_join.length;
        
        // setHasNotifications(totalCount > 0);
        
        console.log("Notification counts:", {
          message: notifications.message.length,
          comment: notifications.comment.length,
          like: notifications.like.length,
          activity_join: notifications.activity_join.length,
          total: totalCount
        });
      }
    }, [notifications, isLoading]);

    // Function to get appropriate content based on loading state and notifications
    const getTabContent = (notificationList) => {
      if (isLoading) {
        return <SkeletonNotification />;
      }
      
      if (!notificationList || notificationList.length === 0) {
        return <EmptyNotificationState type={
          activeTab === 0 
            ? 'all' 
            : activeTab === 1 
              ? 'message' 
              : activeTab === 2 
                ? 'request' 
                : activeTab === 3 
                  ? 'like' 
                  : 'comment'
        } />;
      }
      
      return notificationList.map((notif) => (
        <UserNotification 
          key={notif.id || notif.row_id} 
          notification={notif} 
          markAsRead={typeof markAsRead === 'function' ? markAsRead : () => {}} 
        />
      ));
    };

    // Handle the "Mark all as read" action
    const handleMarkAllAsRead = async () => {
      await markAsRead(undefined, true);
    };

    // Create a combined list of all notifications for the "All" tab
    const allNotifications = [
      ...notifications.message, 
      ...notifications.comment, 
      ...notifications.like, 
      ...notifications.activity_join,
      ...(notifications.post || []) // Include post notifications
 
    ].sort((a, b) => {
      const dateA = new Date(a.notification_timestamp || a.created_at || 0);
      const dateB = new Date(b.notification_timestamp || b.created_at || 0);
      return dateB.getTime() - dateA.getTime();
    });

    // Check if there are any unread notifications
    const hasUnread = allNotifications.some(notification => !notification.read_at);

    return (
      <Box
        ref={ref}
        pos="absolute"
        top="100%"
        right="0%"
        left={{ base: "0%", md: "auto" }}
        bgColor="#FFFFFF"
        boxShadow="md"
        border="1px solid #E5E7EB"
        w="350px"
        zIndex="500"
        borderRadius="6px"
      >
        <Flex 
          alignItems="center" 
          justifyContent="space-between" 
          py="15px" 
          px="20px"
          borderBottom="1px solid #E5E7EB"
        >
          <Text color="#1E293B" fontWeight="600">Notifications</Text>
          <Button
              variant="link"
              color="#f9690e"
              fontSize="13px"
              px={1}
              onClick={() => {
                window.location.href = '/preferences';
              }}
              _hover={{ textDecoration: 'underline', color: '#f9690e' }}
              title="Set Preferences"
            >
              Set Preferences
            </Button>
          {hasUnread && (
            <Button
              onClick={handleMarkAllAsRead}
              size="sm"
              colorScheme="blue"
              variant="ghost"
              leftIcon={<Check size={16} />}
              _hover={{ bg: "#EDF2F7" }}
            >
              Mark all as read
            </Button>
          )}
        </Flex>

        <Tabs 
          isLazy 
          onChange={(index) => setActiveTab(index)}
          colorScheme="orange"
        >
          <TabList display="flex" borderBottom="none">
            <Tab 
              _selected={{ color: "#f9690e", borderBottom: "2px solid #f9690e" }} 
              color="#64748B" 
              flex="1" 
              py="4px" 
              fontSize="13px"
            >
              All
            </Tab>
            <Tab 
              _selected={{ color: "#f9690e", borderBottom: "2px solid #f9690e" }} 
              color="#64748B" 
              flex="1" 
              py="4px" 
              fontSize="13px"
            >
              <MessagesIcon height="22px" width="22px" stroke="#64748B" />
            </Tab>
            <Tab 
              _selected={{ color: "#f9690e", borderBottom: "2px solid #f9690e" }} 
              color="#64748B" 
              flex="1" 
              py="4px" 
              fontSize="13px"
            >
              <RequestIcon height="22px" width="22px" stroke="#64748B" />
            </Tab>
            <Tab 
              _selected={{ color: "#f9690e", borderBottom: "2px solid #f9690e" }} 
              color="#64748B" 
              flex="1" 
              py="4px" 
              fontSize="13px"
            >
              <LikeIcon height="22px" width="22px" stroke="#64748B" />
            </Tab>
            <Tab 
              _selected={{ color: "#f9690e", borderBottom: "2px solid #f9690e" }} 
              color="#64748B" 
              flex="1" 
              py="4px" 
              fontSize="13px"
            >
              <MessageSquareQuote height="22px" width="22px" stroke="#64748B" />
            </Tab>
            <Tab 
              _selected={{ color: "#f9690e", borderBottom: "2px solid #f9690e" }} 
              color="#64748B" 
              flex="1" 
              py="4px" 
              fontSize="13px"
            >
              <FiShoppingCart size={22} />
            </Tab>
          </TabList>

          <TabPanels maxH="400px" overflowY="auto">
            <TabPanel p="0">
              {getTabContent(allNotifications)}
            </TabPanel>
            <TabPanel p="0">
              {getTabContent(notifications.message)}
            </TabPanel>
            <TabPanel p="0">
              {getTabContent(notifications.activity_join)}
            </TabPanel>
            <TabPanel p="0">
              {getTabContent(notifications.like)}
            </TabPanel>
            <TabPanel p="0">
              {isLoading ? (
                <SkeletonNotification />
              ) : (notifications.comment || []).length > 0 ? (
                (notifications.comment || []).map((notif) => <UserNotification key={notif.row_id} notification={notif} />)
              ) : (
                <>
                  <Text fontWeight="semibold" fontSize="md" color="gray.400" textAlign="center">
                    No comment notifications yet.
                  </Text>
                  <Text fontSize="sm" color="gray.300" textAlign="center">
                    We'll notify you when something happens!
                  </Text>
                </>
              )}
            </TabPanel>
            <TabPanel p="0">
              {isLoading ? (
                <SkeletonNotification />
              ) : (notifications.order || []).length > 0 ? (
                (notifications.order || []).map((notif) => <UserNotification key={notif.row_id} notification={notif} />)
              ) : (
                <>
                  <Text fontWeight="semibold" fontSize="md" color="gray.400" textAlign="center">
                    No order notifications yet.
                  </Text>
                  <Text fontSize="sm" color="gray.300" textAlign="center">
                    We'll notify you when something happens!
                  </Text>
                </>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    );
  }
);

NotificationDrawer.displayName = "NotificationDrawer";

export default NotificationDrawer;