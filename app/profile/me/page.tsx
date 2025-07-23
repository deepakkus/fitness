/* eslint-disable @typescript-eslint/no-unused-vars */
// app/profile/me/page.tsx
"use client";

import { Box, SimpleGrid, Skeleton } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserProfileBanner } from "@/components/Profile/Banner";
import { UserProfileTabs } from "@/components/Profile/Tabs";
import { useSession } from "next-auth/react";

export interface UserData {
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
export interface myData {
  id: string;
  name: string;
  email: string;
  profile_pic: string;
  location: string;
  about_me: string;
  age_group: string;
  count: {
    Followers: number;
    Following: number;
    Post: number;
    Events: number;
  };
}

export default function Profile() {
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<myData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // Effect to set accessToken when session changes
  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken as string);
    } else {
      setAccessToken(null);
    }
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const userRes = await axios.get(`/api/user/me`, {
            withCredentials: true,
          });

          const data = userRes.data;
          if (data._count && !data.count) {
            data.count = data._count;
          }
          
          setUserData(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);
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
        {userData && <UserProfileBanner userData={userData} />}
        {userData && <UserProfileTabs userData={userData} />}
      </Box>
    </Box>
  );
}
