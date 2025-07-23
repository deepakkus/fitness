



"use client";

import { Box, Button, Heading, HStack, SimpleGrid, Divider, Skeleton } from "@chakra-ui/react";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import PostCard from "@/components/Card/postCard";
import { motion } from "framer-motion";
import Link from 'next/link';

interface ActivityItem {
  id: string;
  title: string;
  sub_title: string;
  age_group: string;
  is_event: boolean;
  available_spots: number;
  zip: string;
  activity_type_id: string;
  added_by: string;
  created_at: string;
  start_time: string;
  end_time: string;
  images: Array<{ url: string }>;
  peopleInterested: number;
}

interface ActivityData {
  id: string;
  name: string;
  data: ActivityItem[];
}

function SkeletonLoader() {
  return (
    <Box p="4">
      <Skeleton maxW="200px" borderRadius="12px" height="32px" mb="4" />
      <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing="4">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} height="370px" borderRadius="12px" />
        ))}
      </SimpleGrid>
    </Box>
  );
}

interface ActivityTypeSectionProps {
  type: ActivityData;
}

function ActivityTypeSection({
  type,
}: ActivityTypeSectionProps) {

  const hasEvent = type?.data && type.data.length > 0 && type.data[0]?.is_event;
  const eventType = hasEvent ? "event" : "post";

  return (
    <Box my="4">
      <HStack justifyContent="space-between" alignItems="center">
        <Heading as="h3" size="md">
          {eventType === "event" ? `Event > ${type.name}` : `Post > ${type.name}`}
        </Heading>
        {type.data.length > 4 && (
          <Link href={{
            pathname: '/search',
            query: {
              activity_type_id: type.id, // Assuming type.id is activity_type_id
              categoryName: type.name,
            },
          }}>
            <Button size="sm">
              View All
            </Button>
          </Link>
        )}
      </HStack>
      <Divider my="2" />
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="4">
        {type.data.slice(0, 4).map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }} // Reduced the scale value
          >
            <PostCard postItem={item} />
          </motion.div>
        ))}
      </SimpleGrid>
    </Box>
  );
}

export default function Home() {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleTypeCount, setVisibleTypeCount] = useState(5);

  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchActivityData = useCallback(async (page: number) => {
    try {
      loadingRef.current = true;
      const response = await axios.get(`/api/home?page=${page}`);
      if (response.data.status) {
        setActivityData((prev) => [...prev, ...response.data.data]);
        setCurrentPage(response.data.currentPage);
        setHasNextPage(response.data.hasNextPage);
      }
    } catch (error) {
      console.error("Failed to fetch activity data", error);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (sentinelRef.current) {
      const rect = sentinelRef.current.getBoundingClientRect();
      if (rect.bottom <= window.innerHeight && !loadingRef.current) {
        if (visibleTypeCount < activityData.length) {
          setVisibleTypeCount((prev) => Math.min(prev + 5, activityData.length));
        } else if (hasNextPage) {
          fetchActivityData(currentPage + 1);
        }
      }
    }
  }, [activityData.length, currentPage, fetchActivityData, hasNextPage, visibleTypeCount]);

  useEffect(() => {
    fetchActivityData(1);
  }, [fetchActivityData]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <Box p="4">
      {activityData
        .slice(0, visibleTypeCount)
        .filter((type) => type !== null)
        .map((type, index) => (
          <ActivityTypeSection
            key={`${type.id}-${index}`}
            type={type}
          />
        ))}
      <div ref={sentinelRef}></div>
    </Box>
  );
}