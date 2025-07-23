

// UserActivities.tsx
"use client";
import { Box, SimpleGrid, Text, Select } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { GridIcon, ListIcon, CalenderIcon } from "@/components/Icons";
import PostCard from "@/components/Card/postCard";
import EventCard from "@/components/Card/eventCard";
import { UserData } from "@/app/profile/me/page";
import { useSession } from "next-auth/react";
import EventCalender from "@/components/Profile/EventCalender";

interface ActivityData {
  items: number;
  type: string;
  data: Array<any>;
}

interface UserActivitiesProps {
  userId?: string;
}

export function UserActivities({ userId }: UserActivitiesProps) {
  const { data: session } = useSession();
  const [view, setView] = useState("grid");
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [calendarData, setCalendarData] = useState<
    Array<{
      title: string;
      start: string;
      end: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activityType, setActivityType] = useState<'posts' | 'events'>('posts');
  const [activityScope, setActivityScope] = useState<'made' | 'joined'>('made');
  useEffect(() => {
    if (session?.accessToken) {
      

    } else {
      

    }
  }, [session]);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        if (session) {
          
          const userDataRoute = userId ? `/api/user/${userId}` : `/api/user/me`;
          const userRes = await axios.get(userDataRoute, { withCredentials: true });
          setUserData(userRes.data);

          let apiUrl = '';
          if (activityType === 'posts' && activityScope === 'made') {
            apiUrl = userId ? `/api/user/${userId}/posts` : `/api/post`; 
          } else if (activityType === 'events' && activityScope === 'made') {
            apiUrl = userId ? `/api/user/${userId}/events` : `/api/event`; 
          } else if (activityType === 'posts' && activityScope === 'joined') {
            apiUrl = `/api/user/${userId}/joined/posts`; 
          } else if (activityType === 'events' && activityScope === 'joined') {
            apiUrl = `/api/user/${userId}/joined/events`; 
          }

          if (apiUrl) {
            const response = await axios.get(apiUrl, { withCredentials: true });
            setActivityData(response.data);

            if (activityType === 'events') {
              const eventsCalenderData = response.data.data.map((event: any) => ({
                title: event.title,
                start: event.start_time,
                end: event.end_time,
              }));
              setCalendarData(eventsCalenderData);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [session, activityType, activityScope, userId]);

  const renderActivities = () => {
    if (!activityData?.data) {
      return "No activities found.";
    }

    return activityData.data.map((item: any) => {
      if (activityType === 'posts') {
        return <PostCard key={item.id} userData={userData} postItem={item} view={view} />;
      } else if (activityType === 'events') {
        return <EventCard key={item.id} userData={userData} eventsItem={item} view={view} />;
      }
      return null;
    });
  };

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
        <Box display="flex" alignItems="center" gap="16px">
  <Text color="#94A3B8" fontSize="14px">Show</Text>
  <Select
    w="fit-content"
    variant={"outline"}
    outline={"1.3px solid #CBD5E1"}
    size={"sm"}
    color={"#94A3B8"}
    fontSize="14px"
    borderRadius="8px"
    value={activityType}
    onChange={(e) => setActivityType(e.target.value as 'posts' | 'events')}
  >
    <option value="posts">Posts</option>
    <option value="events">Events</option>
  </Select>
  <Text color="#94A3B8" fontSize="14px">
  that  {userId === session?.user?.id ? "I" : `${userData?.name}` }
  </Text>
  <Select
    w="fit-content"
    variant={"outline"}
    outline={"1.3px solid #CBD5E1"}
    size={"sm"}
    color={"#94A3B8"}
    fontSize="14px"
    borderRadius="8px"
    value={activityScope}
    onChange={(e) => setActivityScope(e.target.value as 'made' | 'joined')}
  >
    <option value="made">Made</option>
    <option value="joined">Joined</option>
  </Select>
  <Text color={"#475569"} fontSize={"14px"} pl={"6px"}>
    {` Showing ${activityData && activityData.items ? activityData.items : 0} results`}
  </Text>
</Box>

        <Box display={"flex"} gap={"16px"} alignItems={"center"}>
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
              {activityType === 'events' && (
                <CalenderIcon
                  onClick={() => setView("calender")}
                  className={"cursor-pointer active:transition-all active:duration-[400ms] active:scale-[0.8]"}
                  width="20px"
                  height="20px"
                  stroke={view === "calender" ? "#f9690e" : "#CBD5E1"}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {view === "calender" && activityType === 'events' ? (
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
      ) : (
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
          {isLoading ? (
            <Text>Loading activities...</Text>
          ) : (
            renderActivities()
          )}
        </SimpleGrid>
      )}
      {!isLoading && !activityData?.data && "No activities found."}
    </>
  );
}