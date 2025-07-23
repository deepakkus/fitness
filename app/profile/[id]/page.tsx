

/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
//app/profile/[id]/page.tsx
//todo

import PostCardPrivate from "@/components/Card/postCardPrivate";

import {
  Box,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
  Select,
  SimpleGrid,
  Text,
  Skeleton,
  Tab,
  TabList,
  Button, // Import Button for the follow button
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { ProfileBanner } from "@/components/Profile/Banner";

import { useRouter } from "next/navigation";

import { IAhcieved } from "@/components/Profile/IAchieved";

import { GridIcon, GroupIcon, ListIcon, PostIcon, EventIcon, AchievementIcon, CalenderIcon } from "@/components/Icons";
import { InfoIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserData } from "@/app/profile/me/page";
import { Settings } from "@/components/Profile/Settings";
import EventCardPrivate from "@/components/Card/eventCardPrivate";
import { UserActivities } from "@/components/Profile/UserActivities"; // Import UserActivities

interface ActivityData {
  items: number;
  type: string;
  data: Array<{
    id: string;
    title: string;
    sub_title: any;
    age_group: any;
    is_event: boolean;
    available_spots: number;
    zip: string;
    activity_type_id: string;
    added_by: string;
    created_at: string;
    start_time: string;
    end_time: string;
    images: Array<{
      url: string;
    }>;
    peopleInterested: number;
  }>;
}
interface ActivityItem {
  id: string;
  title: string;
  sub_title: any;
  age_group: any;
  is_event: boolean;
  available_spots: number;
  zip: string;
  activity_type_id: string;
  added_by: string;
  created_at: string;
  start_time: string;
  end_time: string;
  images: Array<{
    url: string;
  }>;
  peopleInterested: number;
}
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;
  const toast = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false); // State for follow button

  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<UserData | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken as string);
    } else {
      setAccessToken(null);
    }
  }, [session]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileRes = await axios.get(`/api/user/${id}`);
        const data = profileRes.data;
        if (data.count && !data._count) {
          data._count = data.count;
        }
        setProfileData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  // Placeholder for follow/unfollow logic
  const handleFollow = async () => {
    setIsProcessing(true);
    try {
      // Replace with your actual API call to follow/unfollow
      setIsFollowing(!isFollowing);
      toast({
        title: isFollowing ? "Unfollowed user" : "Followed user",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error following/unfollowing:", error);
      toast({
        title: `Failed to ${isFollowing ? "unfollow" : "follow"} user`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Skeleton
          mx={"auto"}
          py={"68px"}
          px={{ base: "43px", md: "63px" }}
          maxWidth={"1380px"}
          borderRadius={"12px"}
          height="186px"
          mb="4"
          mt="4"
        />
        <Skeleton
          mx={"auto"}
          py={"30px"}
          px={{ base: "43px", md: "63px" }}
          maxWidth={"1380px"}
          borderRadius={"12px"}
          height="50px"
          mb="4"
        />
        <Skeleton
          mx={"auto"}
          py={"30px"}
          px={{ base: "43px", md: "63px" }}
          maxWidth={"1380px"}
          borderRadius={"12px"}
          height="20px"
          mb="4"
        />
        <SimpleGrid
          mx={"auto"}
          columns={{ base: 1, sm: 2, md: 4 }}
          spacing="4"
          px={{ base: "43px", md: "63px" }}
          height="20px"
          maxWidth={"1380px"}
        >
          {[...Array(4)].map((_, index) => (
            <Skeleton
              border={"1px solid #E2E8F0"}
              borderRadius={"12px"}
              maxWidth={"300px"}
              key={index}
              height="300px"
            />
          ))}
        </SimpleGrid>
      </>
    );
  }
  return (
    <Box bg="#F8FAFC" maxWidth={"1380px"} mx={"auto"}>
      <Box py={"40px"} bg="#F8FAFC" px={{ base: "10px", md: "30px" }}>
        {profileData && (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <ProfileBanner profileData={profileData} />
          </Box>
        )}
        <Tabs position="relative" variant="unstyled" w="full">
          <TabList
            bg={"#FFF"}
            borderBottomRadius={"12px"}
            border={"1px solid #E2E8F0"}
            borderTop={"none"}
            px={"10px"}
            flexWrap={"wrap"}
            justifyContent={{ base: "center", md: "flex-start" }}
          >
            <CustomTab title={"Activities"}>
              <PostIcon width="20px" height="20px" />
            </CustomTab>
            <CustomTab title={"Achieved"}>
              <AchievementIcon width="20px" height="20px" />
            </CustomTab>
        {profileData?.deleted_at ===null &&(
          <CustomTab title={"Account Info"}>
          <InfoIcon width="20px" height="20px" />
        </CustomTab>
        )} 
          </TabList>
          <TabPanels>
            <TabPanel p={"0"} my={"14px"}>
              <UserActivities userId={id} />
            </TabPanel>
            <TabPanel p="0" my={"14px"}>
              <IAhcieved userId={id} />
            </TabPanel>
            {profileData?.deleted_at === null && ( // Conditionally render Account Info TabPanel
              <TabPanel p="0" my={"14px"}>
                {profileData && <Settings profileData={profileData} />}
              </TabPanel>
            )}
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
}

function CustomTab({ children, title }) {
  return (
    <Tab
      _selected={{
        color: "#f9690e",
        stroke: "#f9690e",
        borderBottom: "2px solid #f9690e",
      }}
      stroke="#64748B"
      color={"#64748B"}
      px={{ base: "10px", md: "33px" }}
      py={{ base: "10px", md: "20px" }}
    >
      {children}
      <Text display={{ base: "none", md: "block" }} ml={"8px"} fontWeight={"600"} fontSize={"16px"}>
        {title}
      </Text>
    </Tab>
  );
}