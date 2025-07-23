


"use client";

import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import { Image, Box, Flex, Text, IconButton, Skeleton, SkeletonCircle } from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";

interface ActivityData {
  id: string;
  title: string;
  is_event: boolean;
  images: { url: string }[];
  activity_types: { id: string; name: string };
  compositeScore: number;
}



function TopCard({
  image,
  title,
  category,
  subCategory,
}: {
  image: string;
  title: string;
  category: string;
  subCategory: string;
}) {
  return (
    <Flex 
      p="4"
      gap="4"
      alignItems="center"
    >
      <Box
        flexShrink={0}
        borderRadius="full"
        overflow="hidden"
        w={{ base: "40px", md: "48px" }}
        h={{ base: "40px", md: "48px" }}
      >
        <Image
          src={image}
          alt="profile"
          width="100%"
          height="100%"
          objectFit="cover"
        />
      </Box>
      
      <Box flex="1" minW="0">
        <Text
          fontSize={{ base: "sm", md: "md" }}
          fontWeight="600"
          color="#64748B"
          noOfLines={1}
        >
          {title}
        </Text>
        <Text
          fontSize={{ base: "xs", md: "sm" }}
          color="#94A3B8"
          noOfLines={1}
        >
          {category} / {subCategory}
        </Text>
      </Box>
    </Flex>
  );
}

function TopCardPagination({
  page,
  setPage,
  pageLimit,
}: {
  page: number;
  setPage: (value: number | ((prev: number) => number)) => void;
  pageLimit: number;
}) {
  return (
    <Flex justify="center" mt="4">
      <Box
        display="flex"
        gap="4"
        p="2"
        bg="white"
        border="1px solid #E5E5E5"
        borderRadius="full"
        alignItems="center"
      >
        <IconButton
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          isDisabled={page === 1}
          bg="#f9690e"
          size="sm"
          borderRadius="full"
          icon={<ChevronLeftIcon width="20px" height="20px" />}
          aria-label="Previous Page"
          _hover={{ bg: '#e85d00' }}
        />
        
        <Flex gap="2">
          {Array.from({ length: pageLimit }).map((_, i) => (
            <Box
              key={i}
              w="2"
              h="2"
              borderRadius="full"
              bg={i + 1 === page ? "#f9690e" : "#D9D9D9"}
              transition="background-color 0.2s"
            />
          ))}
        </Flex>
        
        <IconButton
          onClick={() => setPage((p) => Math.min(pageLimit, p + 1))}
          isDisabled={page === pageLimit}
          bg="#f9690e"
          size="sm"
          borderRadius="full"
          icon={<ChevronRightIcon width="20px" height="20px" />}
          aria-label="Next Page"
          _hover={{ bg: '#e85d00' }}
        />
      </Box>
    </Flex>
  );
}




function SkeletonCard() {
  return (
    <Box
      border="1px solid #E2E8F0"
      bgColor="#FFF"
      w="full"
      borderRadius="12px"
      p="4"
    >
      <Flex gap="4" alignItems="center">
        <SkeletonCircle size={{ base: "40px", md: "48px" }} />
        <Box flex="1">
          <Skeleton height="16px" width="70%" mb="2" />
          <Skeleton height="14px" width="50%" />
        </Box>
      </Flex>
    </Box>
  );
}

function ActivitySection({ title, isEvent, pageLimit }: { title: string; isEvent: boolean; pageLimit: number }) {
  const [page, setPage] = useState(1);
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async (page: number) => {
    try {
      setLoading(true);
      const count = 3;
      const response = await axios.get(`/api/public/activities/top?count=${count}&isEvent=${isEvent}&page=${page}`);
      setActivityData(response.data.data);
    } catch (error) {
      console.error("Error fetching activity data", error);
    } finally {
      setLoading(false);
    }
  }, [isEvent]);

  useEffect(() => {
    fetchActivity(page);
  }, [page, fetchActivity]);

  return (
    <Box w="full">
      <Text
        fontSize={{ base: "lg", md: "xl" }}
        fontWeight="600"
        fontFamily="var(--font-mulish)"
        color="#475569"
        mb="4"
      >
        {title}
      </Text>
      
      <Box 
        display="flex"
        flexDirection="column"
        gap="3"
        mb="4"
      >
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : activityData.map((item) => (
              <Box
                key={item.id}
                border="1px solid #E2E8F0"
                bgColor="#FFF"
                w="full"
                borderRadius="12px"
                transition="transform 0.2s"
                _hover={{ transform: 'translateY(-2px)' }}
              >
                <TopCard
                  image={item.images[0]?.url || "default_image_url"}
                  title={item.title}
                  category="Category"
                  subCategory={item.activity_types.name}
                />
              </Box>
            ))}
      </Box>
      
      <TopCardPagination page={page} setPage={setPage} pageLimit={pageLimit} />
    </Box>
  );
}

export function TopActivities() {
  const pageLimit = 6;

  return (
    <Box 
      w="full"
      display="flex"
      flexDirection="column"
      gap="6"
      p={{ base: "4", md: "6" }}
    >
      <ActivitySection title="Top 12 Posts" isEvent={false} pageLimit={pageLimit} />
      <ActivitySection title="Top 12 Events" isEvent={true} pageLimit={pageLimit} />
    </Box>
  );
}



