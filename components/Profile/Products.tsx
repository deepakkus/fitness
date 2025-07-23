/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";
import { Box, Select, SimpleGrid, Text } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { GridIcon, GroupIcon, ListIcon } from "@/components/Icons";
import CardItem from "@/components/Card/CardItem";
import ProductCard from "@/components/Card/productCard";
import { UserData } from "@/app/profile/me/page";
import { useSession } from "next-auth/react";
interface ActivityData {
  items: number;
  type: string;
  data: Array<{
    id: string;
    name: string;
    //sub_title: any;
    //age_group: any;
    is_home: boolean;
    is_active: boolean;
    price: number;
    description: string;
    //activity_type_id: string;
    //added_by: string;
    created_at: string;
    start_time: string;
    end_time: string;
    images: Array<{
      url: string;
    }>;
    peopleInterested: number;
  }>;
}
export interface ActivityItem {
  id: string;
  name: string;
  //sub_title: any;
  //age_group: any;
  is_home: boolean;
  is_active: boolean;
  price: number;
  description: string;
  //activity_type_id: string;
 // added_by: string;
  created_at: string;
  //start_time: string;
  //end_time: string;
  images: Array<{
    url: string;
  }>;
  peopleInterested: number;
}
// Interfaces based on your provided structure  interface ActivityData {   items: number;   type: string;   data: Array<ActivityItem>; }

export function UserPosts({ userId = undefined }: { userId?: string | undefined }) {
  const { data: session } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [view, setView] = useState("grid");
  const [postData, setPostData] = useState<ActivityData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const trimTitle = (string: string) => {
    return string.length <= 20 ? string : string.substring(0, 20) + "...";
  };

  // Effect to set accessToken when session changes
  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken as string);
    } else {
      setAccessToken(null);
    }
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const userDataRoute = userId ? `/api/user/${userId}` : `/api/user/me`;

          const userRes = await axios.get(userDataRoute, {
            withCredentials: true,
          });

          const resPost = await axios.get(`/api/products`, {
            withCredentials: true,
          });

          setUserData(userRes.data);
          setPostData(resPost.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  return (
    <>
      <Box
        pos={"relative"}
        bg={"#FFF"}
        py="10px"
        px={"10px"}
        mb="14px"
        display={"flex"}
        flexFlow={{ base: "column", md: "row" }}
        gap={"10px"}
        justifyContent={"space-between"}
        alignItems={"center"}
        borderRadius={"12px"}
        border={"1px solid #E2E8F0"}
      >
        <Text color={"#475569"} fontSize={"14px"} pl={"6px"}>
          {` Showing ${postData && postData.items ? postData.items : 0} results`}
        </Text>
        <Box display={"flex"} gap={"16px"} alignItems={"center"}>
          <Select
            w={{
              base: "100%",
              md: "206px",
            }}
            placeholder="Sort"
            variant={"outline"}
            outline={"1.3px solid #CBD5E1"}
            size={"xs"}
            color={"#94A3B8"}
            fontSize="14px"
            borderRadius="8px"
            defaultValue={"All"}
          >
            <option value="All">All</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </Select>
          <Box display={"flex"} alignItems={"center"} justifyContent={"center"} gap={"8px"}>
            <Text fontSize={"12px"} textTransform={"capitalize"}>
              {view}
            </Text>
            <Box display={"flex"} gap={"10px"} px="7px" py="5px" border="1px solid #E2E8F0" borderRadius="8px">
              <GridIcon
                onClick={() => setView("grid")}
                className={"cursor-pointer active:transition-all active:duration-[400ms] active:scale-[0.8]"}
                width="20px"
                height="20px"
                fill={view === "grid" ? "#f9690e" : "#CBD5E1"}
              />
              <ListIcon
                onClick={() => setView("list")}
                className={"cursor-pointer active:transition-all active:duration-[400ms] active:scale-[0.8]"}
                width="20px"
                height="20px"
                fill={view === "list" ? "#f9690e" : "#CBD5E1"}
              />
              <GroupIcon stroke="#374151" width="20px" height="20px" fill="#CBD5E1" />
            </Box>
          </Box>
        </Box>
      </Box>
      {(view === "grid" || view === "list") && (
        <SimpleGrid
          columns={{
            base: 1,
            md: view == "list" ? 1 : 2,
            lg: view == "list" ? 1 : 4,
          }}
          placeItems={"center"}
          gap={{ base: "16px", lg: "8px", xl: "16px" }}
          mb={"16px"}
        >
          {postData?.data &&
            postData.data.map((post: ActivityItem) => (
              <ProductCard key={post.id} userData={userData} postItem={post} view={view} />
            ))}
        </SimpleGrid>
      )}
      {!postData?.data && "No Posts for User"}
    </>
  );
}
