// app/activities/[activity_type_id]/page.tsx
"use client";

import { Box, Heading, SimpleGrid, Text, Skeleton } from "@chakra-ui/react";
import { useParams, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import PostCard from "@/components/Card/postCard";

interface ActivityItem {
  id: string;
  title: string;
  sub_title: string;
  age_group: string;
  is_event: boolean;
  available_spots: number | string;
  zip: string;
  activity_type_id: string;
  added_by: string;
  created_at: string;
  start_time: string;
  end_time: string;
  images: Array<{ url: string }>;
  peopleInterested: number;
}

interface Params {
  activity_type_id?: string;
}

function LoadingSkeleton() {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="4">
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} height="370px" borderRadius="12px" />
      ))}
    </SimpleGrid>
  );
}

export default function CategoryActivitiesPage() {
  const params = useParams<Params>();
  const searchParams = useSearchParams();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const activityTypeId = params.activity_type_id;
  const categoryName = searchParams.get('categoryName');

  useEffect(() => {
    const fetchActivities = async () => {
      if (activityTypeId) {
        setLoading(true);
        try {
          const response = await axios.get(`/api/activities/${activityTypeId}`);
          if (response.data.data) {
            setActivities(response.data.data);
          } else {
            console.error("Error fetching activities:", response.data);
            // Handle potential errors from the API
          }
        } catch (error) {
          console.error("Error fetching activities:", error);
          // Handle network errors or other exceptions
        } finally {
          setLoading(false);
        }
      }
    };

    fetchActivities();
  }, [activityTypeId]);

  if (!activityTypeId) {
    return <Box p={4}>Error: Missing category information.</Box>;
  }

  return (
    <Box p={4}>
      <Heading as="h2" size="md" mb={4}>
        Activities in Category: {categoryName || activityTypeId}
      </Heading>
      {loading ? (
        <LoadingSkeleton />
      ) : activities.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
          {activities.map((item) => (
            <PostCard key={item.id} postItem={item} />
          ))}
        </SimpleGrid>
      ) : (
        <Text>No activities found in this category.</Text>
      )}
    </Box>
  );
}