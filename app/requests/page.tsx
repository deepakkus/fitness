/* eslint-disable @typescript-eslint/no-use-before-define */
"use client";
//app/requests/page.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Box,
  Image,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useToast,
  Skeleton,
  SkeletonCircle,
} from "@chakra-ui/react";
import { HistoryIcon } from "@/components/Icons";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { UserData } from "@/app/profile/me/page";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Voting {
  id: string;
  activity_id: string;
  user_id: string;
  user_name: string;
  group_name: string;
  total_votes: number;
  user_vote: "approve" | "ignore" | null;
  time: string;
  user_image: string;
}

interface Pending {
  id: string;
  activity_id: string;
  type: string;
  user_id: string;
  user_name: string;
  group_name: string;
  membership_count: string;
  time: string;
  user_image: string;
}

interface Accepted {
  user_id?: string;
  user_name: string;
  group_name: string;
  accepted_at: string;
  user_image: string;
}

interface YouSent {
  activity_name: string;
  image_urls: ImageUrl[];
  status: string;
  time: string;
}

interface ImageUrl {
  url: string;
}

interface RequestsResponse {
  voting: Array<{
    id: string;
    activity_id: string;
    user_id: string;
    user_name: string;
    group_name: string;
    total_votes: number;
    user_vote: "approve" | "ignore" | null;
    time: string;
    user_image: string;
  }>;
  pending: Array<{
    id: string;
    activity_id: string;
    type: string;
    user_id: string;
    user_name: string;
    group_name: string;
    membership_count: string;
    time: string;
    user_image: string;
  }>;
  accepted: Array<{
    user_id?: string;
    user_name: string;
    group_name: string;
    accepted_at: string;
    user_image: string;
  }>;
  you_sent: Array<{
    activity_name: string;
    image_urls: Array<{
      url: string;
    }>;
    status: string;
    time: string;
  }>;
}
// Handle tab change skeleton loading

export default function Requests() {
  const { data: session, status } = useSession();
  const [requestData, setRequestData] = useState<RequestsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false); // To handle tab change skeleton
  const [userData, setUserData] = useState<UserData | null>(null);
  const router = useRouter();
  const handleTabChange = () => {
    setTabLoading(true);
    setTimeout(() => setTabLoading(false), 500); // Simulate brief loading on tab change
  };
  // Fetch data using Axios


  useEffect(() => {
    if (status === "unauthenticated") {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (session) {
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

  async function fetchData() {
    try {
      if (session) {
        const reqRes = await axios.get("/api/activity_requests", {
          withCredentials: true,
        });
        setRequestData(reqRes.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch data initially
  useEffect(() => {
    fetchData();
  }, [session]);

  return (
    <Box
      display={"flex"}
      maxWidth={"container.md"}
      p={{ base: "20px", md: "40px" }}
      gap={{ base: "20px", md: "40px" }}
      flexDir={{ base: "column", lg: "row" }}
    >
      <Box flex="1">
        <Text color="#1E293B" fontSize={"22px"} fontWeight={"600"} py="15px">
          Requests
        </Text>
        <Box w="full" bgColor={"#FFFFFF"} border={"1px solid #F1F5F9"} borderRadius={"6px"}>
          <Tabs onChange={handleTabChange}>
            <TabList
              bg={"#FFF"}
              border={"1px solid #E2E8F0"}
              borderTop={"none"}
              px={"10px"}
              flexWrap={"wrap"}
              justifyContent={{ base: "center", md: "flex-start" }}
            >
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
                <Text display={{ base: "none", md: "block" }} ml={"8px"} fontWeight={"600"} fontSize={"16px"}>
                  Voting
                </Text>
              </Tab>

              {/* <Tab
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
                <Text display={{ base: "none", md: "block" }} ml={"8px"} fontWeight={"600"} fontSize={"16px"}>
                  Invites
                </Text>
              </Tab> */}

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
                <Text display={{ base: "none", md: "block" }} ml={"8px"} fontWeight={"600"} fontSize={"16px"}>
                  Accepted
                </Text>
              </Tab>

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
                <Text display={{ base: "none", md: "block" }} ml={"8px"} fontWeight={"600"} fontSize={"16px"}>
                  You Sent
                </Text>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Voting Tab */}
              <TabPanel display={"flex"} flexDir={"column"} gap="20px" p="20px" m="0px">
                {isLoading || tabLoading ?
                  Array.from({ length: 3 }).map((_, index) => <CustomSkeleton key={index} />)
                : requestData?.voting?.length ?
                  requestData.voting.map((request, index) => (
                    <VotingRequestComponent key={index} request={request} refetchRequests={fetchData} />
                  ))
                : <NoDataMessage message="No voting requests" />}
              </TabPanel>
              {/* Pending Tab */}
              {/* <TabPanel display={"flex"} flexDir={"column"} gap="20px" p="20px" m="0px">
                {isLoading || tabLoading ?
                  Array.from({ length: 3 }).map((_, index) => <CustomSkeleton key={index} />)
                : requestData?.pending?.length ?
                  requestData.pending.map((request, index) => (
                    <Pending key={index} request={request} refetchRequests={fetchData} />
                  ))
                : <NoDataMessage message="No pending requests" />}
              </TabPanel> */}

              {/* Accepted Tab */}
              <TabPanel display={"flex"} flexDir={"column"} gap="20px" p="20px" m="0px">
                {isLoading || tabLoading ?
                  Array.from({ length: 3 }).map((_, index) => <CustomSkeleton key={index} />)
                : requestData?.accepted?.length ?
                  requestData.accepted.map((request, index) => <Accepted key={index} request={request} />)
                : <NoDataMessage message="No accepted requests" />}
              </TabPanel>

              {/* You Sent Tab */}
              <TabPanel display={"flex"} flexDir={"column"} gap="20px" p="20px" m="0px">
                {isLoading || tabLoading ?
                  Array.from({ length: 3 }).map((_, index) => <CustomSkeleton key={index} />)
                : requestData?.you_sent?.length ?
                  requestData.you_sent.map((request, index) => <YouSent key={index} request={request} />)
                : <NoDataMessage message="No requests sent" />}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>

      {/* Regulations Section */}
    </Box>
  );
}

function VotingRequestComponent({ request, refetchRequests }: { request: Voting; refetchRequests: () => void }) {
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [localVote, setLocalVote] = useState<"approve" | "ignore" | null>(null);
  
  // Set initial vote state when component mounts or request changes
  useEffect(() => {
    setLocalVote(request.user_vote);
  }, [request.user_vote]);

  async function handleVote(action: "approve" | "ignore") {
    setIsProcessing(true);

    try {
      const response = await axios.post(
        `/api/vote/${request.id}`,
        { action },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast({
          title: action === "approve" ? "Voted to Approve" : "Ignored Request",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setLocalVote(action);
        refetchRequests();
      } else {
        throw new Error(response.data.error || "Action failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error(error);
      // Reset local vote state on error
      setLocalVote(request.user_vote);
    } finally {
      setIsProcessing(false);
    }
  }

  // Compute vote status
  const getVoteStatus = () => {
    if (isProcessing) return "Processing...";
    if (localVote === "approve") return "Voted";
    if (localVote === "ignore") return "Ignored";
    return "Pending";
  };

  const defaultImage = "account.png";
  let userImg = request.user_image.split("/");
  const imageUrl = typeof request.user_image === 'string' && userImg.includes("null") 
    ? defaultImage 
    : request.user_image;

  return (
    <Box display={"flex"} alignItems={"center"} border={"1px solid #E2E8F0"} borderRadius={"3px"} pl="20px">
      <Box display={"flex"} gap="20px" alignItems={"center"} flex="1">
        <Image
          src={imageUrl}
          alt={request.user_name}
          w={"48px"}
          h={"48px"}
          borderRadius="50%"
        />
        <Box>
          <Text 
            color="#000" 
            fontSize="16px" 
            fontWeight="600"
            cursor="pointer"
            _hover={{ color: "#0284C7", textDecoration: "underline" }}
            onClick={() => window.open(`/profile/${request.user_id}`, '_blank')}
          >
            {request.user_name}
          </Text>
          <Text color="#64748B" fontSize="16px" fontWeight="600">
            {request.group_name}
          </Text>
          <Box display={"flex"} alignItems={"center"} gap="4px">
            <HistoryIcon width="18px" height="18px" />
            <Text fontSize="12px" color="#475569">
              {dayjs(request.time).fromNow()}
            </Text>
          </Box>
        </Box>

        <Box 
          as="button" 
          px="12px" 
          py="4px" 
          borderRadius={99} 
          border={"1px solid #38BDF8"}
          disabled={isProcessing}
        >
          <Text color={"#0284C7"} fontSize={"14px"} fontWeight={"600"}>
            {getVoteStatus()}
          </Text>
        </Box>
      </Box>

      <Box
        display={"flex"}
        width={{
          base: "full",
          md: "auto",
        }}
        flexDir={"column"}
        borderLeft={"1px solid #E2E8F0"}
      >
        <Box
          as="button"
          px="48px"
          py="16px"
          _hover={{ bgColor: localVote === null && !isProcessing ? "#F7FAFC" : undefined }}
          transition={"all 0.3s ease"}
          borderTop={{
            base: "1px solid #E2E8F0",
            md: "none",
          }}
          onClick={() => handleVote("ignore")}
          disabled={isProcessing || localVote === "ignore"}
          opacity={isProcessing || localVote === "ignore" ? 0.5 : 1}
          cursor={isProcessing || localVote === "ignore" ? "not-allowed" : "pointer"}
          bgColor={localVote === "ignore" ? "#F1F5F9" : undefined}
        >
          <Skeleton isLoaded={!isProcessing}>
            <Text 
              color={localVote === "ignore" ? "#94A3B8" : "#DC2626"} 
              fontSize={"14px"} 
              fontWeight={"600"}
            >
              Ignore
            </Text>
          </Skeleton>
        </Box>
        <Box
          as="button"
          px="48px"
          py="16px"
          borderTop={"1px solid #E2E8F0"}
          _hover={{ bgColor: localVote === null && !isProcessing ? "#F7FAFC" : undefined }}
          transition={"all 0.3s ease"}
          onClick={() => handleVote("approve")}
          disabled={isProcessing || localVote === "approve"}
          opacity={isProcessing || localVote === "approve" ? 0.5 : 1}
          cursor={isProcessing || localVote === "approve" ? "not-allowed" : "pointer"}
          bgColor={localVote === "approve" ? "#F1F5F9" : undefined}
        >
          <Skeleton isLoaded={!isProcessing}>
            <Text 
              color={localVote === "approve" ? "#94A3B8" : "#15803D"} 
              fontSize={"14px"} 
              fontWeight={"600"}
            >
              Vote
            </Text>
          </Skeleton>
        </Box>
      </Box>
    </Box>
  );
}


function Pending({ request, refetchRequests }: { request: Pending; refetchRequests: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleAction(action: "accept" | "reject") {
    setIsProcessing(true); // Start loading
    try {
      const response = await axios.post(
        `/api/activity_accept/${request.id}?action=${action}`,
        {},
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast({
          title: action === "accept" ? "Accepted Request" : "Rejected Request",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Refetch the request data to update the UI
        refetchRequests();
      } else {
        throw new Error(response.data.error || "Action failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error(error);
    } finally {
      setIsProcessing(false); // Stop loading
    }
  }

  return (
    <Box
      display={"flex"}
      alignItems={"center"}
      flexDir={{
        base: "column",
        md: "row",
      }}
      border={"1px solid #E2E8F0"}
      borderRadius={"3px"}
    >
      <Box
        flex="1"
        px="20px"
        gap="20px"
        py={{
          base: "20px",
        }}
        _hover={{ cursor: "pointer", bgColor: "#E2E8F0" }}
        onClick={() => router.push(`${`\\${request.type}\\${request.activity_id}`}`)}
        display={"flex"}
        flexDir={{
          base: "column",
          md: "row",
        }}
        width={{
          base: "full",
          md: "auto",
        }}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Skeleton isLoaded={!isProcessing}>
          <Box
            display={"flex"}
            alignItems={"center"}
            gap="20px"
            width={{
              base: "full",
              md: "auto",
            }}
            justifyContent={{
              base: "space-between",
              md: "flex-start",
            }}
          >
            <Image
              src={request.user_image}
              alt={request.user_image}
              w={"48px"}
              height={"48px"}
              borderRadius={"50%"}
              objectFit={"cover"}
            />
            <Box display={"flex"} flex={"1"} flexDirection={"column"}>
              <Text 
                color={"#000"} 
                fontSize={"16px"} 
                fontWeight={"600"}
                cursor="pointer"
                _hover={{ color: "#0284C7", textDecoration: "underline" }}
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`/profile/${request.user_id}`, '_blank');
                }}
              >
                {request.user_name}
              </Text>
              <Text color={"#64748B"} fontSize={"16px"} fontWeight={"600"}>
                {request.group_name}
              </Text>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <HistoryIcon width="18px" height="18px" />
                <Text fontSize={"12px"} color="#475569">
                  {dayjs(request.time).fromNow()}
                </Text>
              </Box>
            </Box>
          </Box>
        </Skeleton>

        <Box display={"flex"} flexDirection={"column"} alignItems={"flex-end"} justifyContent={"center"} gap={"5px"}>
          <Skeleton isLoaded={!isProcessing}>
            <Text color={"#334155"} fontSize={"16px"} fontWeight={"600"} pr={"5px"}>
              {request.membership_count.split("/")[0]}/
              <span style={{ color: "#15803D" }}>{request.membership_count.split("/")[1]}</span>
            </Text>
          </Skeleton>
        </Box>
      </Box>

      <Box
        display={"flex"}
        width={{
          base: "full",
          md: "auto",
        }}
        flexDir={"column"}
        borderLeft={"1px solid #E2E8F0"}
      >
        <Box
          as="button"
          px="48px"
          py="16px"
          _hover={{ bgColor: "#E2E8F0" }}
          transition={"all 0.3s ease"}
          borderTop={{
            base: "1px solid #E2E8F0",
            md: "none",
          }}
          onClick={() => handleAction("reject")}
          disabled={isProcessing}
        >
          <Skeleton isLoaded={!isProcessing}>
            <Text color={"#DC2626"} fontSize={"14px"} fontWeight={"600"}>
              DECLINE
            </Text>
          </Skeleton>
        </Box>
        <Box
          as="button"
          px="48px"
          py="16px"
          borderTop={"1px solid #E2E8F0"}
          _hover={{ bgColor: "#E2E8F0" }}
          transition={"all 0.3s ease"}
          onClick={() => handleAction("accept")}
          disabled={isProcessing}
        >
          <Skeleton isLoaded={!isProcessing}>
            <Text color={"#15803D"} fontSize={"14px"} fontWeight={"600"}>
              ACCEPT
            </Text>
          </Skeleton>
        </Box>
      </Box>
    </Box>
  );
}

function Accepted({ request }: { request: Accepted }) {
  // Fetch the accepted data from the RequestPageData

  return (
    <Box
      display={"flex"}
      flexDir={{
        base: "column",
        md: "row",
      }}
      border={"1px solid #E2E8F0"}
      borderRadius={"6px"}
      flex="1"
      px="20px"
      py="30px"
      gap="20px"
      alignItems={"center"}
      justifyContent={"space-between"}
    >
      <Box
        display={"flex"}
        alignItems={{
          base: "flex-start",
          md: "center",
        }}
        gap="20px"
        justifyContent={"flex-start"}
      >
        <Image
          src={request.user_image}
          alt="chat"
          w={"48px"}
          height={"48px"}
          borderRadius={"50%"}
          objectFit={"cover"}
        />
        <Box display={"flex"} flex={"1"} flexDirection={"column"}>
          <Text 
            color={"#000"} 
            fontSize={"16px"} 
            fontWeight={"600"}
            cursor={request.user_id ? "pointer" : "default"}
            _hover={request.user_id ? { color: "#0284C7", textDecoration: "underline" } : {}}
            onClick={request.user_id ? () => window.open(`/profile/${request.user_id}`, '_blank') : undefined}
          >
            {request.user_name}
          </Text>
          <Box display={"flex"} gap="10px" alignItems="center">
            <Box display={"flex"} gap="10px">
              <Text color={"#64748B"} fontSize={"16px"} fontWeight={"600"}>
                {request.group_name}
              </Text>
            </Box>
            <Box display={"flex"} alignItems={"center"} gap={"4px"}>
              {/* Replace with your icon if needed */}
              <Text fontSize={"12px"} color="#475569">
                {dayjs(request.accepted_at).fromNow()}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box display={"flex"} flexDirection={"column"} alignItems={"flex-end"} justifyContent={"center"}>
        <Text color={"#334155"} fontSize={"16px"}>
          Accepted
        </Text>
      </Box>
    </Box>
  );
}

function YouSent({ request }: { request: YouSent }) {
  return (
    <Box
      display={"flex"}
      flexDir={{
        base: "column",
        md: "row",
      }}
      alignItems={"center"}
      border={"1px solid #E2E8F0"}
      borderRadius={"6px"}
      px="20px"
      py="30px"
    >
      <Box
        flex="1"
        px="20px"
        gap="20px"
        display={"flex"}
        flexDir={{
          base: "column",
          md: "row",
        }}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Box display={"flex"} alignItems={"center"} gap="20px" justifyContent={"flex-start"}>
          <Image
            src={request.image_urls[0]?.url || "/account.png"}
            alt={request.activity_name}
            w={"48px"}
            height={"48px"}
            borderRadius={"50%"}
            objectFit={"cover"}
          />
          <Box display={"flex"} flex={"1"} flexDirection={"column"}>
            <Text color={"#000"} fontSize={"18px"} fontWeight={"600"}>
              {request.activity_name}
            </Text>
            <Box display={"flex"} alignItems={"center"} gap={"4px"}>
              <HistoryIcon width="18px" height="18px" />
              <Text fontSize={"12px"} color="#475569">
                {dayjs(request.time).fromNow()}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box as="button" px="12px" py="4px" borderRadius={99} border={"1px solid #38BDF8"}>
        <Text color={"#0284C7"} fontSize={"14px"} fontWeight={"600"}>
          {request.status}
        </Text>
      </Box>
    </Box>
  );
}

// Custom Skeleton Component
function CustomSkeleton() {
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      border="1px solid #E2E8F0"
      borderRadius="3px"
      p="20px"
    >
      <Box display="flex" alignItems="center" gap="20px">
        <SkeletonCircle size="48px" />
        <Box>
          <Skeleton height="16px" width="150px" mb="10px" />
          <Skeleton height="16px" width="120px" />
        </Box>
      </Box>
      <Skeleton height="16px" width="80px" />
    </Box>
  );
}
function NoDataMessage({ message }: { message: string }) {
  return (
    <Box textAlign="center" py="20px">
      <Text color="#64748B" fontSize="16px">
        {message}
      </Text>
    </Box>
  );
}
