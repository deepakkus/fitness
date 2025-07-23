/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { Box, SimpleGrid, Skeleton, Text } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { CalenderIcon, GridIcon, ListIcon } from "@/components/Icons";
import CardItem from "@/components/Card/CardItem";
import EventCard from "@/components/Card/eventCard";

import EventCalender from "@/components/Profile/EventCalender";
import { UserData } from "@/app/profile/me/page";
import { useSession } from "next-auth/react";
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
export interface ActivityItem {
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
export function UserEvents({ userId = undefined }: { userId?: string | undefined }) {
  const [view, setView] = useState("grid");
  const { data: session } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [eventData, setEventData] = useState<ActivityData | null>(null);
  const [calendarData, setCalendarData] = useState<
    Array<{
      title: string;
      start: string;
      end: string;
    }>
  >([]);

  const [isLoading, setIsLoading] = useState(true);
  const trimTitle = (string: string) => {
    return string.length <= 20 ? string : string.substring(0, 20) + "...";
  };
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          setIsLoading(true);

          const [userRes, eventRes] = await Promise.all([
            axios.get(`/api/user/me`, { withCredentials: true }),
            axios.get(`/api/event`, { withCredentials: true }),
          ]);

          setUserData(userRes.data);
          setEventData(eventRes.data);

          const eventsCalenderData = eventRes.data.data.map((event: ActivityItem) => ({
            title: event.title,
            start: event.start_time,
            end: event.end_time,
          }));

          setCalendarData(eventsCalenderData);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
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
          {` Showing ${eventData && eventData.items ? eventData.items : 0} results`}
        </Text>
        <Box display={"flex"} gap={"16px"} alignItems={"center"}>
          <Box display={"flex"} alignItems={"center"} justifyContent={"center"} gap={"8px"}>
            <Text fontSize={"12px"} textTransform={"capitalize"}>
              {view}
            </Text>
            <Box
              display={"flex"}
              gap={"10px"}
              px="7px"
              py="5px"
              border="1px solid #E2E8F0"
              borderRadius="8px"
              cursor={"pointer"}
            >
              <GridIcon
                onClick={() => setView("grid")}
                width="20px"
                height="20px"
                fill={view === "grid" ? "#f9690e" : "#CBD5E1"}
              />
              <ListIcon
                onClick={() => setView("list")}
                width="20px"
                height="20px"
                fill={view === "list" ? "#f9690e" : "#CBD5E1"}
              />
              <CalenderIcon
                onClick={() => setView("calender")}
                width="20px"
                height="20px"
                stroke={view === "calender" ? "#f9690e" : "#CBD5E1"}
              />
            </Box>
          </Box>
        </Box>
      </Box>
      {(view === "grid" || view === "list") && (
        <SimpleGrid
          columns={{
            base: 1,
            md: view === "list" ? 1 : 2,
            lg: view === "list" ? 1 : 4,
          }}
          placeItems={"center"}
          gap={{ base: "16px", lg: "8px", xl: "16px" }}
          mb={"16px"}
        >
          {eventData?.data &&
            eventData.data.map((event: ActivityItem) => (
              <EventCard key={event.id} userData={userData} eventsItem={event} view={view} />
            ))}
        </SimpleGrid>
      )}
      {!eventData?.data && "No Events for User"}
      {view === "calender" && (
        <Box
          mt="20px"
          p="20px"
          bgColor={"#fff"}
          borderRadius="12px"
          border={"1px solid #E2E8F0"}
          pos={"relative"}
          className={"flex min-h-full"}
        >
          <Box className={"relative grow"}>
            <EventCalender events={calendarData} />
          </Box>
        </Box>
      )}
    </>
  );
}
