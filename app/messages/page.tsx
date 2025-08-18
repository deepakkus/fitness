/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
//import socket from "@/app/socket";
//import socketClient from "@/app/socket";
import { useSocket } from "@/app/socket";

import QRCode from "react-qr-code";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  Select,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  SkeletonCircle,
  Skeleton,
} from "@chakra-ui/react";
import { Modal, ModalOverlay, ModalContent, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import { KeyboardEvent, useEffect, useRef, useState, Suspense } from "react";
import {
  ChevronDown2Icon,
  CloseIcon,
  DocIcon,
  EventIcon,
  EyeIcon,
  GroupIcon,
  HistoryIcon,
  InfoIcon,
  PeopleIcon,
  PlusIcon,
  PostIcon,
  SearchIcon,
  SendIcon,
  SmileIcon,
  TickMarkIcon,
} from "@/components/Icons";
import CheckIn from "@/components/Icons/CheckIn";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { containsEmoji, isEmojiOnly } from '@/lib/emoji-utils';
dayjs.extend(relativeTime);

import { ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Session } from "next-auth";

import EmojiPicker from 'emoji-picker-react'; // Import EmojiPicker
// import 'emoji-picker-react/dist/styles.css';

const basePath = process.env.NEXT_PUBLIC_BASE_URL ? process.env.NEXT_PUBLIC_BASE_URL : `http://localhost:${process.env.APP_PORT}`;
// const basePath = process.env.APP_URL_PORT ? process.env.APP_URL_PORT : "http://localhost:3000"; // JkWorkz
// console.log("basepath", basePath, "process", process.env.NEXT_PUBLIC_APP_URL)

export interface Message {
  id: string;
  message: string;
  created_at: string;
  sender: {
    id: string;
    name: string;
    profile_picture: string;
  };
  media: {
    name: string;
    url: string;
  }[];
}

export interface Group {
  activity_id: string;
  title: string;
  member_number: string;
  created_at: Date;
  start_time: Date;
  is_event: boolean;
  admin: {
    name: string | null;
    profile_picture: string | null;
  };
  lastMessage: {
    message: string;
    created_at: Date | null;
    sender: {
      profile_picture: string | null;
    };
  } | null;
  activity_media: {
    url: string;
  }[];
}

export interface GroupLastMessage {
  id: string;
  message: string;
  created_at: string;
  sender: LastMessageSender;
}

export interface LastMessageSender {
  id: string;
  name: string;
  profile_picture: string;
}
interface UserData {
  id: string;
  name: string;
  profile_pic: string;
  location: string;
  about_me?: string | null;
  age_group: string | null;
  email: string;
  Profile?: { bio: string | null };
  count: {
    Followers: number;
    Following: number;
    Post: number;
    Events: number;
  };
}

// Skeleton Card Component for loader
function SkeletonCard() {
  return (
    <Box borderBottom="1px solid #E2E8F0" bgColor="#FFF" maxH={"150px"} w="full" maxWidth="300px">
      <Flex w="full" px="16px" py="6px" gap="8px">
        <SkeletonCircle size="48px" />
        <Box flex="1">
          <Skeleton height="16px" mt="4px" mb="4px" maxWidth={"200px"} />
          <Skeleton height="14px" maxWidth={"150px"} />
        </Box>
      </Flex>
    </Box>
  );
}

function SkeletonCardGroups() {
  return (
    <Box borderBottom="1px solid #E2E8F0" bgColor="#FFF" maxH={"150px"} w="full" width={"350px"}>
      <Flex w="full" px="16px" py="6px" gap="8px">
        <SkeletonCircle size="48px" />
        <Box flex="1">
          <Skeleton height="16px" mt="4px" mb="4px" maxWidth={"200px"} />
          <Skeleton height="14px" maxWidth={"150px"} />
        </Box>
      </Flex>
    </Box>
  );
}

function AvailabilityModalTimePicker(props) {
  const { item, index, Availability, setAvailability } = props;
  const [active, setActive] = useState(false);

  return (
    <Box
      key={index}
      display={"flex"}
      gap="10px"
      p="10px"
      borderRadius={"6px"}
      alignItems={"flex-start"}
      flexDir={"column"}
      border={active ? "1px solid #f9690e" : "1px solid #E2E8F0"}
    >
      <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} gap={"10px"} w="full">
        <Box display={"flex"} alignItems={"center"} gap={"10px"}>
          <Box display={"flex"} alignItems={"center"} gap={"10px"}>
            <Switch
              isChecked={item.isAvailable}
              onChange={(e) => {
                let temp = [...Availability];
                temp[index].isAvailable = e.target.checked;
                setAvailability(temp);
              }}
              colorScheme="orange"
            />
            <Text fontSize={"16px"} color={"#475569"}>
              {item.day}
            </Text>
          </Box>
        </Box>
        <Box
          flex="1"
          display={"flex"}
          justifyContent={"flex-end"}
          cursor={"pointer"}
          onClick={() => setActive(!active)}
        >
          <ChevronDown2Icon
            width={"20px"}
            height={"20px"}
            stroke="#f9690e"
            style={{
              transform: active ? "rotate(180deg)" : "",
            }}
          />
        </Box>
      </Box>
      <Box display={active ? "flex" : "none"} alignItems={"center"} gap={"10px"} w={"full"}>
        <Input
          type="time"
          defaultValue={item.startTime}
          onChange={(e) => {
            let temp = [...Availability];
            temp[index].startTime = e.target.value;
            setAvailability(temp);
          }}
          sx={{
            "&::-webkit-calendar-picker-indicator": { display: "none" },
          }}
          textAlign={"center"}
          flex="1"
          fontSize={"14px"}
          bgColor={"#F1F5F9"}
          color={"#475569"}
        />
        <Input
          type="time"
          defaultValue={item.endTime}
          onChange={(e) => {
            let temp = [...Availability];
            temp[index].endTime = e.target.value;
            setAvailability(temp);
          }}
          sx={{
            "&::-webkit-calendar-picker-indicator": { display: "none" },
          }}
          textAlign={"center"}
          flex="1"
          fontSize={"14px"}
          bgColor={"#F1F5F9"}
          color={"#475569"}
        />
        <Button colorScheme="orange" color={"#FFF"} bgColor={"#f9690e"} fontSize={"14px"} px="18px">
          Save
        </Button>
        <Button colorScheme="orange" variant={"outline"} color={"#f9690e"} fontSize={"14px"} px="18px">
          Reset
        </Button>
      </Box>
    </Box>
  );
}

function CheckInModal(props) {
  const { activeCheckIn, setActiveCheckIn } = props;
  const data = {
    bgColor: "rgba(249, 105, 14, 0.40)",
    borderRadius: "10px",
    border: "1px solid #E2E8F0",
    boxShadow: "0px 0px 10px rgba(0,0,0,0.1)",
    textColor: "#000",
    textFontSize: "13px",
    textFontFamily: "var(--font-inter)",
    textMaxW: "240px",
    textAlign: "center",
    textContent: "Are you sure you want to mark your presence?",
    button: {
      cancel: {
        px: "20px",
        py: "10px",
        bgColor: "#FFF",
        borderRadius: "9px",
        fontSize: "12px",
        fontFamily: "var(--font-inter)",
        color: "#f9690e",
        colorScheme: "orange",
        text: "Cancel",
      },
      yes: {
        px: "20px",
        py: "10px",
        borderRadius: "9px",
        fontSize: "12px",
        fontFamily: "var(--font-inter)",
        bgColor: "#f9690e",
        color: "#FFF",
        colorScheme: "orange",
        text: "Yes",
      },
    },
  };

  return (
    <Box
      pos={"fixed"}
      top={"0"}
      left={"0"}
      w={"full"}
      h={"full"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      zIndex={"200"}
    >
      <Box
        p="20px 25px"
        bgColor={data.bgColor}
        borderRadius={data.borderRadius}
        border={data.border}
        boxShadow={data.boxShadow}
      >
        <Text
          color={data.textColor}
          fontSize={data.textFontSize}
          fontFamily={data.textFontFamily}
          maxWidth={data.textMaxW}
          textAlign={data.textAlign}
        >
          {data.textContent}
        </Text>
        <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} gap={"10px"} mt={"20px"}>
          <Button
            px={data.button.cancel.px}
            py={data.button.cancel.py}
            bgColor={data.button.cancel.bgColor}
            borderRadius={data.button.cancel.borderRadius}
            fontSize={data.button.cancel.fontSize}
            fontFamily={data.button.cancel.fontFamily}
            color={data.button.cancel.color}
            variant={"outline"}
            colorScheme={data.button.cancel.colorScheme}
            onClick={() => setActiveCheckIn(false)}
          >
            {data.button.cancel.text}
          </Button>
          <Button
            px={data.button.yes.px}
            py={data.button.yes.py}
            borderRadius={data.button.yes.borderRadius}
            fontSize={data.button.yes.fontSize}
            fontFamily={data.button.yes.fontFamily}
            bgColor={data.button.yes.bgColor}
            color={data.button.yes.color}
            colorScheme={data.button.yes.colorScheme}
            onClick={() => setActiveCheckIn(false)}
          >
            {data.button.yes.text}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function AvailabilityModal(props) {
  const { activeAvailability, setActiveAvailability } = props;

  const [availability, setAvailability] = useState([
    { day: "Monday", isAvailable: true, startTime: "10:00", endTime: "17:00" },
    {
      day: "Tuesday",
      isAvailable: false,
      startTime: "08:00",
      endTime: "15:00",
    },
    {
      day: "Wednesday",
      isAvailable: true,
      startTime: "10:00",
      endTime: "17:00",
    },
  ]);

  const { title, closeButton, dateRange, saveButton, resetButton, days } = {
    title: "Availability",
    closeButton: "Close",
    dateRange: "Date Range",
    saveButton: "Save",
    resetButton: "Reset",
    days: [
      {
        day: "Monday",
        isAvailable: true,
        startTime: "10:00",
        endTime: "17:00",
      },
      {
        day: "Tuesday",
        isAvailable: false,
        startTime: "08:00",
        endTime: "15:00",
      },
      {
        day: "Wednesday",
        isAvailable: true,
        startTime: "10:00",
        endTime: "17:00",
      },
    ],
  };

  return (
    <Box
      pos={"fixed"}
      top={"0"}
      left={"0"}
      w={"full"}
      h={"full"}
      display={"flex"}
      justifyContent={"center"}
      alignItems={"center"}
      zIndex={"200"}
    >
      <Box
        maxWidth={"480px"}
        borderRadius={"6px"}
        bgColor={"#FFF"}
        w={"full"}
        border={"1px solid #E2E8F0"}
        boxShadow={"0px 0px 10px rgba(0,0,0,0.1)"}
      >
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          gap={"15px 20px"}
          p="10px"
          borderBottom={"1px solid #E2E8F0"}
        >
          <Box display={"flex"} alignItems={"center"} gap={"10px"}>
            <EventIcon width={"20px"} height={"20px"} stroke="#334155" />
            {title}
          </Box>
          <CloseIcon
            width="24px"
            height="24px"
            stroke="#000"
            cursor={"pointer"}
            onClick={() => setActiveAvailability(false)}
          />
        </Box>
        <Box display={"flex"} flexDir={"column"} p="20px 25px" gap="10px">
          <Box display={"flex"} gap="10px" alignItems={"flex-start"} flexDir={"column"}>
            <Text fontSize={"16px"} color={"#475569"}>
              {dateRange}
            </Text>
            <Box display={"flex"} alignItems={"center"} gap={"10px"} w={"full"}>
              <Input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                sx={{
                  "&::-webkit-calendar-picker-indicator": { display: "none" },
                }}
                onClick={(e) => e.target.focus()}
                textAlign={"center"}
                flex="1"
                fontSize={"14px"}
                bgColor={"#F1F5F9"}
                color={"#475569"}
              />
              <Input
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                sx={{
                  "&::-webkit-calendar-picker-indicator": { display: "none" },
                }}
                textAlign={"center"}
                flex="1"
                fontSize={"14px"}
                bgColor={"#F1F5F9"}
                color={"#475569"}
              />
              <Button colorScheme="orange" color={"#FFF"} bgColor={"#f9690e"} fontSize={"14px"} px="18px">
                {saveButton}
              </Button>
              <Button colorScheme="orange" variant={"outline"} color={"#f9690e"} fontSize={"14px"} px="18px">
                {resetButton}
              </Button>
            </Box>
          </Box>
          {availability.map((item, index) => (
            <AvailabilityModalTimePicker
              key={index}
              item={item}
              index={index}
              Availability={availability}
              setAvailability={setAvailability}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function ChatMessage({ userId, message }: { userId: string; message: Message }) {
  const isUser = `${message.sender.id}` === userId;
  const messageContent = message.message;
  const isOnlyEmojiMessage = isEmojiOnly(messageContent);
  const baseFontSize = "15px";
  const emojiFontSize = "24px"; // Adjust the size as needed

  return (
    <Box
      borderRadius="lg"
      color={isUser ? "white" : "black"}
      alignSelf={isUser ? "flex-end" : "flex-start"}
      maxWidth="70%"
    >
      <Box display="flex" gap="5px" justifyContent={isUser ? "flex-end" : "flex-start"}>
        {!isUser && <Avatar size="sm" src={message.sender.profile_picture} />}
        <Box display="flex" flexDir={"column"} alignItems={isUser ? "flex-end" : "flex-start"} gap="5px">
          <Box fontSize={"13px"} color={"#64748B"}>
            {message.sender.name} : {message.created_at ? dayjs(message.created_at).format("hh:mm A") : "Just now"}
          </Box>
          <Box
            fontSize={isOnlyEmojiMessage ? emojiFontSize : baseFontSize}
            p="10px 15px"
            bgColor={isUser ? "#FFEDD5" : "#D1FAE5"}
            color={isUser ? "#C2410C" : "#047857"}
            borderRadius={"12px"}
            borderTopLeftRadius={isUser ? "12px" : "0px"}
            borderTopRightRadius={isUser ? "0px" : "12px"}
            style={{ wordBreak: 'break-word', lineHeight: 'normal' }}
          >
            {messageContent}
          </Box>

          {/* Render media if available */}
          {message.media.length > 0 && (
            <Box mt={2}>
              {message.media.map((mediaItem) => (
                <Image
                  key={mediaItem.url}
                  src={mediaItem.url}
                  alt={mediaItem.name}
                  maxHeight="200px"
                  maxW="100%"
                  borderRadius="12px"
                  border="1px solid #E2E8F0"
                  mt="5px"
                />
              ))}
            </Box>
          )}
        </Box>
        {isUser && <Avatar size="sm" src={message.sender.profile_picture} />}
      </Box>
    </Box>
  );
}

interface MembersData {
  verified: Array<{
    id: string;
    name: string;
    profile_pic: string;
    created_at: string;
  }>;
  unverified: Array<{
    id: string;
    name: string;
    profile_pic: string;
    created_at: string;
    status: string;
  }>;
}

function CustomTab({ children, title, py }: { children: React.ReactNode; title: string; py?: string }) {
  return (
    <Tab
      _selected={{
        color: "#f9690e",
        stroke: "#f9690e",
        borderBottom: "2px solid #f9690e",
      }}
      stroke="#64748B"
      color={"#64748B"}
      px={{ base: "10px" }}
      flex="1"
      py={{ base: "10px", md: py ? py : "20px" }}
    >
      {children}
      <Text display={{ base: "none", md: "block" }} ml={"8px"} fontWeight={"600"} fontSize={"16px"}>
        {title}
      </Text>
    </Tab>
  );
}

function GroupDetails({
  selectedGroup,
  basePath,
  session,
  selectedActivityId,
}: {
  selectedGroup: Group | null;
  basePath: string;
  session: Session | null;
  selectedActivityId: string;
}) {
  const [membersData, setMembersData] = useState<MembersData>({ verified: [], unverified: [] });
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch verified and unverified members when the Members tab is clicked
  async function fetchMembers() {
    try {
      setLoading(true); // Start loading
      const response = await axios.get(`/api/messages/groups/${selectedActivityId}/members`);
      setMembersData({
        verified: response.data.verified.items,
        unverified: response.data.unverified.items,
      });
      setLoading(false); // Stop loading
    } catch (error) {
      setLoading(false); // Stop loading
      console.error("Error fetching members:", error);
    }
  }

  return (
    <Box
      width={"300px"}
      bgColor={"#FFF"}
      overflowY={"scroll"}
      display={{ base: "none", md: "block" }}
      className="scrollbar-thin scrollbar-thumb-[#D9D9D9] scrollbar-track-neutral-100"
      maxH={"100vh"}
    >
      {selectedGroup && (
        <Tabs>
          <TabList display={"flex"} border={"none"}>
            <Tab
              _selected={{
                color: "#f9690e",
                stroke: "#f9690e",
                borderBottom: "2px solid #f9690e",
              }}
              stroke="#64748B"
              color={"#64748B"}
              px={{ base: "10px" }}
              flex="1"
              py={{ base: "10px", md: "20px" }}
            >
              <PostIcon width="20px" height="20px" />
              <Text display={{ base: "none", md: "block" }} ml={"8px"} fontWeight={"600"} fontSize={"16px"}>
                Group Info
              </Text>
            </Tab>
            <Tab
              onClick={fetchMembers}
              _selected={{
                color: "#f9690e",
                stroke: "#f9690e",
                borderBottom: "2px solid #f9690e",
              }}
              stroke="#64748B"
              color={"#64748B"}
              px={{ base: "10px" }}
              flex="1"
              py={{ base: "10px", md: "20px" }}
            >
              <GroupIcon width="20px" height="20px" />
              <Text display={{ base: "none", md: "block" }} ml={"8px"} fontWeight={"600"} fontSize={"16px"}>
                Members
              </Text>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Group Info Panel */}
            <TabPanel m="0px" display="flex" flexDir="column" gap="20px" py="10px" px="20px">
              <Box p="10px" maxWidth={"128px"} display="flex" flexDir="column" alignItems="center">
                <Text fontSize="18px" mb="10px" color="#64748B">
                  Scan QR code
                </Text>
                <div style={{ height: "auto", margin: "0 auto", width: "100%" }}>
                  <QRCode
                    size={256}
                    style={{ height: "auto", width: "100%" }}
                    value={
                      selectedGroup.is_event
                        ? `${basePath}/event/${selectedGroup.activity_id}`
                        : `${basePath}/posts/${selectedGroup.activity_id}`
                    }
                    viewBox="0 0 256 256"
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  mt="10px"
                  colorScheme="gray"
                  onClick={() => {
                    const shareLink = selectedGroup.is_event
                      ? `${basePath}/event/${selectedGroup.activity_id}`
                      : `${basePath}/posts/${selectedGroup.activity_id}`;
                    if (navigator.share) {
                      navigator.share({
                        title: 'Check out this activity!',
                        url: shareLink,
                      }).then(() => {
                        // console.log('Successfully shared');
                      })
                      .catch((error) => {
                        console.error('Error sharing:', error);
                      });
                    } else {
                      alert(`Share this link: ${shareLink}`);
                      // console.log("Web Share API not supported. Link is:", shareLink);
                    }
                  }}
                >
                  Share link
                </Button>
              </Box>

              <Box>
                <Text fontSize="14px" color="#64748B">
                  Post Name:
                </Text>
                <Text fontSize="16px" color="#334155">
                  {selectedGroup.title}
                </Text>
              </Box>

              <Box>
                <Text fontSize="14px" color="#64748B">
                  Created At:
                </Text>
                <Text fontSize="16px" color="#334155">
                  {selectedGroup.created_at ? 
                    dayjs(selectedGroup.created_at).format("DD MMM YYYY hh:mm A") : 
                    "Date not available"
                  }
                </Text>
              </Box>

              <Box>
                <Text fontSize="14px" color="#64748B">
                  Created By:
                </Text>
                <Box display="flex" mt="5px" alignItems="center" gap="10px">
                  <Image
                    src={selectedGroup.admin.profile_picture || "/placeholder.avif"}
                    alt="admin"
                    w="28px"
                    h="28px"
                    borderRadius="50%"
                    objectFit="cover"
                  />
                  <Text fontSize="16px" color="#334155">
                    {selectedGroup.admin.name === session?.user.name ? "You" : selectedGroup.admin.name}
                  </Text>
                </Box>
              </Box>
            </TabPanel>

            {/* Members Tab Panel */}
            <TabPanel p="0">
              <Tabs>
                <TabList display="flex" borderBottom="1px solid #F1F5F9">
                  <CustomTab title={"Verified"} py="10px" children={undefined} />
                  <CustomTab title={"Unverified"} py="10px" children={undefined} />
                </TabList>

                <TabPanels>
                  {/* Verified Members Panel */}
                  <TabPanel m="0px" p="0" display="flex" flexDir="column">
                    {loading ?
                      Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
                    : membersData.verified.map((member) => (
                        <Box
                          key={member.id}
                          display={"flex"}
                          justifyContent={"space-between"}
                          alignItems={"center"}
                          p="10px"
                          _hover={{
                            cursor: "pointer",
                            bgColor: "#E2E8F0",
                          }}
                          onClick={() => session?.user?.id !== member.id ? router.push(`/profile/${member.id}`) : router.push('/profile/me')}
                          borderBottom={"1px solid #F1F5F9"}
                        >
                          <Box display="flex" alignItems="center" gap="10px">
                            <Image
                              src={member.profile_pic || "/placeholder.avif"}
                              alt={member.name}
                              w="28px"
                              h="28px"
                              borderRadius="50%"
                              objectFit="cover"
                            />
                            <Box>
                              <Text fontSize={"14px"} color={"#334155"}>
                                {member.name}
                              </Text>
                              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                                <HistoryIcon width="18px" height="18px" />
                                <Text fontSize={"12px"} color="#475569">
                                  {member.created_at ? dayjs(member.created_at).fromNow() : "Recently"}
                                </Text>
                              </Box>
                            </Box>
                          </Box>
                          <PeopleIcon width="20px" height="20px" stroke="#334155" />
                        </Box>
                      ))
                    }
                  </TabPanel>

                  {/* Unverified Members Panel */}
                  <TabPanel m="0px" p="0" display="flex" flexDir="column">
                    {loading ?
                      Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
                    : membersData.unverified.map((member) => (
                        <Box
                          key={member.id}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          p="10px"
                          borderBottom="1px solid #F1F5F9"
                        >
                          <Box display="flex" alignItems="center" gap="10px">
                            <Image
                              src={member.profile_pic || "/placeholder.avif"}
                              alt={member.name}
                              w="28px"
                              h="28px"
                              borderRadius="50%"
                              objectFit="cover"
                            />
                            <Box>
                              <Text fontSize="14px" color="#334155">
                                {member.name}
                              </Text>
                              <Box display="flex" alignItems="center" gap="4px">
                                <HistoryIcon width="18px" height="18px" />
                                <Text fontSize="12px" color="#475569">
                                  {member.created_at ? dayjs(member.created_at).fromNow() : "Recently"}
                                </Text>
                              </Box>
                            </Box>
                          </Box>
                          <Box display="flex" gap="5px">
                            <EventIcon width="20px" height="20px" stroke="#334155" />
                            {member.status === "pending" && <InfoIcon width="20px" height="20px" stroke="#15803D" />}
                          </Box>
                        </Box>
                      ))
                    }
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Box>
  );
}

function truncate(text, length) {
  return `${text}`.length > length ? text.substring(0, length) + "..." : text;
}

// Main Messages Content Component
function MessagesContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const { socket, isConnected: socketConnected } = useSocket();
  const searchParams = useSearchParams();

  const [activeCheckIn, setActiveCheckIn] = useState(false);
  const [activeAvailability, setActiveAvailability] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [postFormData, setPostFormData] = useState({
    activity_id: "",
    messages: "",
    images: [] as File[],
    imagesLink: [] as string[],
  });
  const messageInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [onlineUserCounts, setOnlineUserCounts] = useState<{ [activityId: string]: number }>({});
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const [isTabActive, setIsTabActive] = useState(true);
  const [showGroupList, setShowGroupList] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const toggleGroupList = () => setShowGroupList(!showGroupList);
  const toggleGroupInfo = () => setShowGroupInfo(!showGroupInfo);

  const fetchMessages = async () => {
    if (selectedActivityId) {
      try {
        console.log(`[DEBUG] Fetching messages for activity: ${selectedActivityId}`);
        const msgRes = await axios.get(`/api/messages/groups/${selectedActivityId}`, {
          withCredentials: true,
        });
        console.log(`[DEBUG] Messages response:`, msgRes.data);
        setMessages(msgRes.data.messages);
      } catch (error) {
        console.error("fetchMessages() error:", error);
      }
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const onEmojiClick = (emojiObject: any) => {
    if (messageInputRef.current) {
      messageInputRef.current.value += emojiObject.emoji;
      messageInputRef.current.focus();
    }
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken as string);
    } else {
      setAccessToken(null);
    }
  }, [session]);

  useEffect(() => {
    setIsConnected(socketConnected);
  }, [socketConnected]);

  useEffect(() => {
    if (socket && session) {
      socket.emit("join_personal_room", `user_${session.user.id}`);
    }
  }, [session, socket]);

  useEffect(() => {
    if (socket && selectedActivityId) {
      console.log(`[DEBUG] Joining activity room: ${selectedActivityId}`);
      socket.emit("join_activity_room", selectedActivityId);
      fetchMessages();
    }
  }, [socket, selectedActivityId]);

  useEffect(() => {
    if (socket) {
      const handleOnlineUserCount = ({ key, count, activityRoom }) => {
        if (key === "onlineCount") {
          setOnlineUserCounts((prevCounts) => ({
            ...prevCounts,
            [activityRoom]: count,
          }));
        }
      };

      socket.on("online_user_count", handleOnlineUserCount);

      return () => {
        socket.off("online_user_count", handleOnlineUserCount);
      };
    }
  }, [socket]);

  // useEffect(() => {
  //   if (socket) {
  //     const handleNewMessage = async ({ messageId }) => {
  //       try {
  //         if (session && isTabActive) {
  //           const res = await axios.get(`/api/messages/${messageId}`, {
  //             withCredentials: true,
  //           });
  //           const newMessage = res.data.messages[0];
  //           setMessages((prevMessages) => [...prevMessages, newMessage]);
  //         }
  //       } catch (error) {
  //         console.error("Error fetching new message from socket event:", error);
  //       }
  //     };

  //     socket.on("new_message_id", handleNewMessage);

  //     return () => {
  //       socket.off("new_message_id", handleNewMessage);
  //     };
  //   }
  // }, [socket, session, isTabActive]);

  // Fix for the message handler in app/messages/page.tsx
// This should replace the existing useEffect that handles new_message_id events

useEffect(() => {
  if (socket) {
    const handleNewMessage = async ({ messageId, activityId }) => {
      try {
        console.log(`[DEBUG] Socket received new message: messageId=${messageId}, activityId=${activityId}, selectedActivityId=${selectedActivityId}`);
        // CRITICAL FIX: Only process messages for the currently selected activity
        if (session && isTabActive && activityId && activityId === selectedActivityId) {
          console.log(`[DEBUG] Processing message for current activity`);
          const res = await axios.get(`/api/messages/${messageId}`, {
            withCredentials: true,
          });
          const newMessage = res.data.messages[0];
          console.log(`[DEBUG] New message data:`, newMessage);
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        } else {
          console.log(`[DEBUG] Ignoring message - not for current activity or conditions not met`);
        }
      } catch (error) {
        console.error("Error fetching new message from socket event:", error);
      }
    };

    socket.on("new_message_id", handleNewMessage);

    return () => {
      socket.off("new_message_id", handleNewMessage);
    };
  }
}, [socket, session, isTabActive, selectedActivityId]); 

  useEffect(() => {
    const handleVisibilityChange = async () => {
      setIsTabActive(document.visibilityState === 'visible');

      if (document.visibilityState === 'visible' && selectedActivityId) {
        setTimeout(fetchMessages, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    handleVisibilityChange();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedActivityId]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (session) {
          setIsLoading(true);
          const userRes = await axios.get(`/api/user/me`, {
            withCredentials: true,
          });
          setUserData(userRes.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          setIsLoading(true);
          const grpRes = await axios.get(`/api/messages/groups`, {
            withCredentials: true,
          });

          const sortedGroups = [...grpRes.data.groups].sort((a, b) => {
            const aTime = a.lastMessage?.created_at
              ? new Date(a.lastMessage.created_at).getTime()
              : new Date(a.created_at).getTime();
            const bTime = b.lastMessage?.created_at
              ? new Date(b.lastMessage.created_at).getTime()
              : new Date(b.created_at).getTime();
            return bTime - aTime;
          });

          setGroups(sortedGroups);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [session]);

  useEffect(() => {
    const activityIdFromQuery = searchParams.get('activityId');
    if (activityIdFromQuery && groups.length > 0) {
      const group = groups.find(g => g.activity_id === activityIdFromQuery);
      if (group) {
        setSelectedGroup(group);
        setSelectedActivityId(activityIdFromQuery);
      } else {
        toast({
          title: "Group not found",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [searchParams, groups, toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedActivityId) {
      fetchMessages();
    }
  }, [selectedActivityId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length + postFormData.images.length > 5) {
      toast({
        title: "You can upload a maximum of 5 images",
        status: "error",
      });
      return;
    }

    const newImages = [...postFormData.images, ...files];
    const newImagesLink = [...newImages.map((file) => URL.createObjectURL(file))];

    setPostFormData((prevData) => ({
      ...prevData,
      images: newImages,
      imagesLink: newImagesLink,
    }));
  };

  const handleImageDelete = (index) => {
    const newImages = [...postFormData.images];
    const newImagesLink = [...postFormData.imagesLink];
    newImages.splice(index, 1);
    newImagesLink.splice(index, 1);
    setPostFormData((prevData) => ({
      ...prevData,
      images: newImages,
      imagesLink: newImagesLink,
    }));
  };

  const handleImageView = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    onOpen();
    URL.revokeObjectURL(imageUrl);
  };

  // const handleSendMessage = async () => {
  //   const messageInput = messageInputRef.current;

  //   if (!messageInput && postFormData.images.length === 0) {
  //     return;
  //   }

  //   try {
  //     setIsProcessing(true);
  //     if (session) {
  //       const messageInput = messageInputRef.current;
  //       const inputMessage = messageInput?.value.trim();
  //       const body = { activity_id: selectedActivityId, messages: inputMessage };

  //       const messageResponse = await axios.post(`/api/messages/send`, body, { withCredentials: true });
  //       const { newMessage } = messageResponse.data;
  //       if (newMessage && newMessage.id) {
  //         const message_id = newMessage.id;
  //         const activity_id = newMessage.activity_id;

  //         if (postFormData.images.length == 0) {
  //           toast({
  //             title: "Message Send",
  //             status: "success",
  //           });
  //         }

  //         if (postFormData.images.length > 0) {
  //           await Promise.all(
  //             postFormData.images.map(async (image) => {
  //               const imageFormData = new FormData();
  //               imageFormData.append("image", image);
  //               imageFormData.append("bucket_name", "messages");
  //               imageFormData.append("message_id", message_id);
  //               await axios.post("/api/images", imageFormData, {
  //                 withCredentials: true,
  //                 headers: { "Content-Type": "multipart/form-data" },
  //               });
  //             })
  //           );
  //           toast({
  //             title: "Media Message Send",
  //             status: "success",
  //           });
  //         }

  //         if (socket) {
  //           socket.emit("send_message", { messageId: message_id, activityId: activity_id });
  //         }
  //       }
  //     }

  //     if (messageInput) messageInput.value = "";

  //     setPostFormData({
  //       activity_id: "",
  //       messages: "",
  //       images: [] as File[],
  //       imagesLink: [] as string[],
  //     });
  //     setIsProcessing(false);
  //   } catch (error) {
  //     setIsProcessing(false);
  //     console.error("Error sending message or uploading images:", error);
  //   }
  // };

  const handleSendMessage = async () => {
    const messageInput = messageInputRef.current;

    if (!messageInput && postFormData.images.length === 0) {
      return;
    }

    try {
      setIsProcessing(true);
      if (session) {
        const messageInput = messageInputRef.current;
        const inputMessage = messageInput?.value.trim();
        const body = { activity_id: selectedActivityId, messages: inputMessage };

        const messageResponse = await axios.post(`/api/messages/send`, body, { withCredentials: true });
        const { newMessage } = messageResponse.data;
        if (newMessage && newMessage.id) {
          const message_id = newMessage.id;
          const activity_id = newMessage.activity_id;

          if (postFormData.images.length == 0) {
            toast({
              title: "Message Send",
              status: "success",
            });
          }

          if (postFormData.images.length > 0) {
            await Promise.all(
              postFormData.images.map(async (image) => {
                const imageFormData = new FormData();
                imageFormData.append("image", image);
                imageFormData.append("bucket_name", "messages");
                imageFormData.append("message_id", message_id);
                await axios.post("/api/images", imageFormData, {
                  withCredentials: true,
                  headers: { "Content-Type": "multipart/form-data" },
                });
              })
            );
            toast({
              title: "Media Message Send",
              status: "success",
            });
          }

          if (socket) {
            // IMPORTANT: Pass the activityId to ensure proper message routing
            console.log(`[DEBUG] Sending socket event with messageId: ${message_id}, activityId: ${activity_id}, type: ${typeof activity_id}`);
            socket.emit("send_message", { 
              messageId: message_id, 
              activityId: activity_id, 
              message: inputMessage // Include message for preview if needed
            });
          }
        }
      }

      if (messageInput) messageInput.value = "";

      setPostFormData({
        activity_id: "",
        messages: "",
        images: [] as File[],
        imagesLink: [] as string[],
      });
      setIsProcessing(false);
    } catch (error) {
      setIsProcessing(false);
      console.error("Error sending message or uploading images:", error);
    }
  };

  
  const handleSendMessageOnEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSendMessage();
  };

  useEffect(() => {
    const handleClickOutsideEmojiPicker = (event: MouseEvent) => {
      if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node) && emojiButtonRef.current && !emojiButtonRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutsideEmojiPicker);
    return () => {
      document.removeEventListener('mousedown', handleClickOutsideEmojiPicker);
    };
  }, [showEmojiPicker]);

  return (
    <Box display={"flex"} flexWrap={"wrap"} justifyContent={"center"} alignItems={"stretch"} top={"0"} h={"80vh"}>
      <Box
        display={{ base: "block", md: "block" }}
        borderRight={"1px solid #E2E8F0"}
        width={"auto"}
        bgColor={"#FFF"}
        overflowY={"scroll"}
        className="scrollbar-thin scrollbar-thumb-[#D9D9D9] scrollbar-track-neutral-100"
        maxH={"80vh"}
      >
        <Box display={"flex"} flexDir={"column"} pos={"relative"}>
          {isLoading ?
            Array.from({ length: 4 }).map((_, index) => <SkeletonCardGroups key={index} />)
          : groups.length === 0 ? (
            <Box p="20px" textAlign="center">
              <Text fontSize="md" color="gray.500">No groups yet.</Text>
            </Box>
          ) : (
            groups.map((group) => (
              <Box
                key={group.activity_id}
                onClick={() => {
                  setSelectedActivityId(group.activity_id);
                  setSelectedGroup(group);
                }}
                display={"flex"}
                p="25px 15px"
                gap="5px"
                justifyContent={"space-between"}
                alignItems={"center"}
                borderBottom={"1px solid #F1F9F9"}
                _last={{ borderBottom: "none" }}
                cursor="pointer"
                bg={group.activity_id === selectedActivityId ? "#F8FAFC" : "transparent"}
              >
                <Box display={"flex"} justifyContent={"start"} alignItems={"center"}>
                  <Image
                    src={
                      group.lastMessage?.sender.profile_picture ? group.lastMessage?.sender.profile_picture
                      : group.activity_media[0].url ?
                        group.activity_media[0].url
                      : "/placeholder.avif"
                    }
                    alt="chat"
                    w={"38px"}
                    height={"38px"}
                    borderRadius={"50%"}
                    objectFit={"cover"}
                  />
                  <Box
                    pl="15px"
                    display={"flex"}
                    flexDir={"column"}
                    justifyContent={"center"}
                    alignItems={"flex-start"}
                  >
                    <Text fontSize={"16px"} fontWeight={"500"} color={"#475569"}>
                      {truncate(group.title, 24)}
                    </Text>
                    <Text fontSize={"13px"} color={"#64748B"}>
                      {truncate(group.lastMessage?.message || "No messages yet", 30)}
                    </Text>
                  </Box>
                </Box>
                <Box display={"flex"} flexDir={"column"} justifyContent={"center"} alignItems={"flex-end"}>
                  <Text fontSize={"12px"} color={"#64748B"}>
                    {group.lastMessage?.created_at || group.created_at ? 
                      dayjs(group.lastMessage?.created_at || group.created_at).format("hh:mm A") : 
                      "No messages yet"
                    }
                  </Text>
                  <Box
                    display={"flex"}
                    justifyContent={"center"}
                    alignItems={"center"}
                    w={"20px"}
                    h={"20px"}
                    hidden={true}
                    borderRadius={"50%"}
                    objectFit={"cover"}
                    bgColor={"#059669"}
                  >
                    <Text fontSize={"12px"} color={"#FFF"}>
                      {0}
                    </Text>
                  </Box>
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Box borderRight={"1px solid #E2E8F0"} flex={"1"} bgColor={"#FFF"} pos={"relative"}>
        <Box
          pos={"relative"}
          overflowY={"scroll"}
          minHeight="52vh"
          className="scrollbar-thin scrollbar-thumb-[#D9D9D9] scrollbar-track-neutral-100"
          maxH={"80vh"}
        >
          <Box
            display={"flex"}
            bgColor={"#FFF"}
            borderBottom={"1px solid #E2E8F0"}
            justifyContent={"space-between"}
            alignItems={"center"}
            p="15px"
            top={"0"}
            zIndex={10}
          >
            <Box display={"flex"} justifyContent={"flex-start"} alignItems={"center"} gap={"10px"}>
              {selectedGroup && (
                <Image
                  src={
                    selectedGroup?.activity_media[0].url ? selectedGroup?.activity_media[0].url : "/placeholder.avif"
                  }
                  alt="chat"
                  w={{
                    base: "38px",
                    md: "48px",
                  }}
                  height={{
                    base: "38px",
                    md: "48px",
                  }}
                  borderRadius={"50%"}
                  objectFit={"cover"}
                />
              )}
              {selectedGroup && (
                <Box display={"flex"} flexDir={"column"}>
                  <Text
                    fontSize={{
                      base: "16px",
                      md: "18px",
                    }}
                    fontWeight={"500"}
                    color={"#334155"}
                  >
                    {selectedGroup && truncate(selectedGroup?.title, 24)}
                  </Text>
                  <Box display={"flex"} gap={"5px"}>
                    <Text fontSize={"13px"} color={"#15803D"}>
                      {`${onlineUserCounts[`activity_${selectedGroup?.activity_id}`] || 0} Online, `}
                    </Text>
                    <Text fontSize={"13px"} color={"#64748B"}>
                      {`Members ${selectedGroup?.member_number}`}
                    </Text>
                  </Box>
                </Box>
              )}
            </Box>
            {false && (
              <Box
                display={"flex"}
                alignItems={"center"}
                gap={{
                  base: "10px",
                  md: "20px",
                }}
                justifyContent={"flex-end"}
              >
                <Box
                  as="button"
                  display={"flex"}
                  gap={"5px"}
                  flexDir={"column"}
                  alignItems={"center"}
                  onClick={() => setActiveAvailability(true)}
                >
                  <PlusIcon width="24px" height="24px" stroke="#374151" />
                  <Text
                    fontSize={{
                      base: "12px",
                      md: "14px",
                    }}
                    color={"#374151"}
                  >
                    {`My Availability`}
                  </Text>
                </Box>
                <Box
                  as="button"
                  display={"flex"}
                  gap={"5px"}
                  flexDir={"column"}
                  alignItems={"center"}
                  onClick={() => setActiveCheckIn(true)}
                >
                  <CheckIn width="24px" height="24px" stroke="#374151" />
                  <Text
                    fontSize={{
                      base: "12px",
                      md: "14px",
                    }}
                    color={"#374151"}
                  >
                    {`Check In`}
                  </Text>
                </Box>
              </Box>
            )}
          </Box>
          <ScrollArea>
            <Box
              height={"max-content"}
              pt={"20px"}
              pb="150px"
              px={"20px"}
              display={"flex"}
              flexDir={"column"}
              gap={"10px"}
            >
              {!selectedGroup ? (
                <Text textAlign="center" color="gray.500" mt="4">
                  Select a group to view messages.
                </Text>
              ) : messages.length === 0 ? (
                <Box>
                  <Text textAlign="center" color="gray.500" mt="4">
                    No messages yet. Be the first to send a message!
                  </Text>
                  <Text textAlign="center" color="gray.400" mt="2" fontSize="sm">
                    Debug: messages.length = {messages.length}, selectedActivityId = {selectedActivityId}
                  </Text>
                </Box>
              ) : (
                messages.map((message) => (
                  <ChatMessage key={message.id} userId={`${userData?.id}`} message={message} />
                ))
              )}
            </Box>
            <div ref={messagesEndRef} />
          </ScrollArea>
        </Box>
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton color={"white"} p={5} />
            <ModalBody p={4} display="flex" justifyContent="center" alignItems="center">
              <Image src={selectedImage || ""} alt="preview" width="150%" height="auto" borderRadius="10px" />
            </ModalBody>
          </ModalContent>
        </Modal>

        {postFormData.images.length !== 0 && (
          <Box
            display={"flex"}
            flexDir={"row"}
            flexWrap="wrap"
            p="10px"
            pos={"relative"}
            borderTop="1px solid #CBD5E1"
            maxHeight="150px"
            overflowY="auto"
          >
            {postFormData.images.map((image, index) => (
              <Box
                key={index}
                position="relative"
                width="100px"
                height="100px"
                borderRadius="6px"
                overflow="hidden"
                border="1px solid #CBD5E1"
                _hover={{ cursor: "pointer" }}
              >
                <Image
                  src={URL.createObjectURL(image)}
                  alt={image?.name}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                />
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  bgColor="rgba(0, 0, 0, 0.5)"
                  opacity="0"
                  transition="opacity 0.3s ease"
                  _hover={{ opacity: 1 }}
                  onClick={() => handleImageView(URL.createObjectURL(image))}
                >
                  <EyeIcon color="white" width={6} height={6} />
                </Box>
                <Box
                  position="absolute"
                  top="4px"
                  right="4px"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  bgColor="red.500"
                  borderRadius="50%"
                  width="20px"
                  height="20px"
                  onClick={() => handleImageDelete(index)}
                  _hover={{ cursor: "pointer", bgColor: "red.700" }}
                >
                  <CloseIcon color="white" width={3} height={3} />
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {selectedGroup && (
          <Box
            p="20px"
            pos={"absolute"}
            bottom={"0px"}
            w={"full"}
            left="0px"
            display={"flex"}
            gap="10px"
            bgColor={"#FFF"}
            borderTop={"1px solid #CBD5E1"}
          >
            <InputGroup size={"lg"}>
              <Input
                placeholder="Type a message"
                fontSize={"14px"}
                name="messages"
                color={"#475569"}
                bgColor={"#F1F5F9"}
                disabled={isProcessing}
                ref={messageInputRef}
                onKeyDown={(e) => {
                  handleSendMessageOnEnter(e);
                }}
              />
              <InputRightElement onClick={handleSendMessage}>
                <SendIcon style={{ cursor: "pointer" }} fill="#f9690e" width="16px" height="14px" />
              </InputRightElement>
            </InputGroup>

            <Box
              px="15px"
              bgColor={"#F1F5F9"}
              border={"1px solid #E2E8F0"}
              display={"flex"}
              alignItems={"center"}
              gap="15px"
              borderRadius={"6px"}
            >
              <Box pos={"relative"} ref={emojiButtonRef}>
                <SmileIcon
                  onClick={toggleEmojiPicker}
                  style={{ position: "relative", cursor: "pointer" }}
                  width="20px"
                  height="20px"
                  stroke="#334155"
                />
                {showEmojiPicker && (
                  <Box pos="absolute" bottom="40px" left="0" zIndex="10" ref={emojiPickerRef}>
                    <EmojiPicker onEmojiClick={onEmojiClick} />
                  </Box>
                )}
              </Box>
              <Box pos={"relative"}>
                <ImageIcon style={{ cursor: "pointer" }} strokeWidth={1} width="20px" height="20px" stroke="#334155" />
                <Input
                  type="file"
                  id="image-upload"
                  accept="image/jpeg, image/jpg, image/png"
                  pos={"absolute"}
                  top={"0"}
                  left={"0"}
                  right={"0"}
                  bottom={"0"}
                  w="full"
                  onChange={handleImageUpload}
                  multiple
                  h={"full"}
                  opacity={"0"}
                  cursor={"pointer"}
                />
              </Box>
              <Box pos={"relative"}>
                <DocIcon style={{ cursor: "pointer" }} width="20px" height="20px" stroke="#334155" />
                <Input
                  type="file"
                  pos={"absolute"}
                  top={"0"}
                  left={"0"}
                  right={"0"}
                  bottom={"0"}
                  w="full"
                  h={"full"}
                  opacity={"0"}
                  cursor={"pointer"}
                />
              </Box>
            </Box>
          </Box>
        )}
      </Box>
      <GroupDetails
        selectedGroup={selectedGroup}
        basePath={basePath}
        session={session}
        selectedActivityId={selectedActivityId}
      />
    </Box>
  );
}

// Default export with Suspense wrapper
export default function Messages() {
  return (
    <Suspense fallback={
      <Box display="flex" justifyContent="center" alignItems="center" h="80vh">
        <SkeletonCircle size="10" />
        <Skeleton height="20px" width="200px" ml="4" />
      </Box>
    }>
      <MessagesContent />
    </Suspense>
  );
}