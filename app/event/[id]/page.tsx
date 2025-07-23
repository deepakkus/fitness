/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import {
  Box,
  Flex,
  Heading,
  Image,
  Progress,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Stack,
  Text,
  Textarea,
  useToast,
  Spinner,
  Menu, MenuButton, MenuList, MenuItem, IconButton, MenuDivider
} from "@chakra-ui/react";
import { Menu as MenuIcon } from 'lucide-react';
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState, useRef } from "react";
import { RWebShare } from "react-web-share";
import {
  DislikeIcon,
  FacebookIcon,
  LeftArrowIcon,
  LikeIcon,
  MessagesIcon,
  ReportIcon,
  Share2Icon,
  StarIcon,
  TwitterIcon,
  WhatsappIcon,
} from "@/components/Icons";
import Loading from "@/components/App/loading";
import { useSession } from "next-auth/react";
import { UserData } from "@/app/profile/me/page";
import clsx from "clsx";
import { useParams, useRouter } from "next/navigation";
dayjs.extend(relativeTime);
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSocket } from "@/app/socket";
import UserImage from "@/components/handleImage/UserImage"

export interface Events {
  items: number;
  type: string;
  data: EventData[];
}
export type Root = {
  items: number;
  type: string;
  data: Array<{
    id: string;
    title: string;
    sub_title: string;
    description: string;
    activity_type_id: string;
    location: string;
    start_time: string;
    end_time: any;
    max_participants: number;
    rules: string;
    contact_info: string;
    url: string;
    is_event: boolean;
    is_active: boolean;
    added_by: string;
    created_at: string;
    updated_at: string;
    activity_media: Array<{
      name: string;
    }>;
    activity_comments: Array<{
      id: string;
      comment: string;
      rating: number;
      added_by: string;
      created_at: string;
      users: {
        id: string;
        name: string;
        profile_picture: string;
      };
    }>;
    count: {
      activity_join_requests: number;
    };
    peopleInterested: number;
    city: string;
    zip: string;
    images: Array<{
      url: string;
    }>;
    comments: {
      items: number;
      type: string;
      data: Array<{
        id: string;
        comment: string;
        rating: number;
        added_by: string;
        name: string;
        profile_picture: string;
        created_at: string;
      }>;
    };
    added_by_user: {
      id: string;
      name: string;
      profile_picture: string;
    };
  }>;
};
export interface EventData {
  id: string;
  title: string;
  sub_title: string;
  description: string;
  activity_type_id: string;
  location: string;
  start_time: string;
  end_time: any;
  max_participants: number;
  rules: string;
  contact_info: string;
  url: string;
  is_event: boolean;
  is_active: boolean;
  added_by: string;
  created_at: string;
  updated_at: string;
  activity_media: Array<{
    name: string;
  }>;
  activity_comments: Array<{
    id: string;
    comment: string;
    rating: number;
    added_by: string;
    created_at: string;
    users: {
      id: string;
      name: string;
      profile_picture: string;
    };
  }>;
  count: {
    activity_join_requests: number;
  };
  peopleInterested: number;
  city: string;
  zip: string;
  images: Image[];
  comments: Comments;
  added_by_user: AddedByUser;
}

export interface Image {
  url: string;
}

export interface Comments {
  items: number;
  type: string;
  data: CommentData[];
}

export interface CommentData {
  id: string;
  comment: string;
  rating: number;
  added_by: string;
  name: string;
  profile_picture: string;
  created_at: string;
}

export interface Likes {
  items: number;
  type: string;
  data: LikeData[];
}

export interface LikeData {
  id: string;
  like_dislike: boolean;
  added_by: string;
  name: string;
  profile_picture: string;
  created_at: string;
}
export interface AddedByUser {
  id: string;
  name: string;
  profile_picture: string;
  location: string;
  about_me: string;
}


function EventDetailsSkeleton() {
  return (
    <Box
      display={"flex"}
      flexDir={"column"}
      p={{
        base: "10px",
        md: "20px",
      }}
      gap="20px"
    >
      {/* Image Slider Skeleton */}
      <Box borderRadius={"10px"} overflow={"hidden"}>
        <Box pos={"relative"}>
          <Skeleton height="400px" width="100%" />
          {/* Left arrow button skeleton */}
          <Box pos={"absolute"} top={"45%"} left={"1%"} zIndex={1}>
            <SkeletonCircle size="50px" />
          </Box>
          {/* Right arrow button skeleton */}
          <Box pos={"absolute"} top={"45%"} right={"1%"} zIndex={1}>
            <SkeletonCircle size="50px" />
          </Box>
        </Box>
      </Box>

      {/* Event details skeleton */}
      <Box p="20px" pt="40px" mt="-20px" bgColor={"#FFF"} border={"1px solid #E2E8F0"} borderRadius={"10px"} zIndex={2}>
        <Flex
          flexDir={{
            base: "column",
            md: "row",
          }}
          gap={{
            base: "20px",
            md: "40px",
          }}
          justifyContent={"space-between"}
        >
          <Box display={"flex"} alignItems={"flex-start"} gap="11px">
            <Skeleton height="40px" width="200px" />
          </Box>
          <Flex flexWrap={"wrap"} alignItems={"center"} gap="32px">
            {/* Comments, likes, dislikes */}
            <SkeletonText noOfLines={1} width="120px" />
            <SkeletonText noOfLines={1} width="120px" />
            <SkeletonText noOfLines={1} width="120px" />
          </Flex>
        </Flex>
      </Box>

      {/* Contact info and description skeleton */}
      <Box
        display={"flex"}
        flexDir={{
          base: "column",
          md: "row",
        }}
        w={"100%"}
        gap="20px"
      >
        <Box
          flex="1"
          borderRadius={"10px"}
          overflow={"hidden"}
          border={"1px solid #E2E8F0"}
          p="20px 25px"
          bgColor={"#FFF"}
        >
          <SkeletonText noOfLines={3} spacing="4" />
        </Box>

        <Box
          w={{
            base: "100%",
            md: "300px",
          }}
          display={"flex"}
          flexDir={"column"}
          gap={"20px"}
        >
          <Box p="20px" borderRadius={"10px"} bgColor={"#FFF"} border={"1px solid #E2E8F0"}>
            <SkeletonText noOfLines={2} spacing="4" />
          </Box>

          <Box p="20px" borderRadius={"10px"} bgColor={"#FFF"} border={"1px solid #E2E8F0"}>
            <SkeletonText noOfLines={2} spacing="4" />
          </Box>

          <Box p="20px" borderRadius={"10px"} bgColor={"#FFF"} border={"1px solid #E2E8F0"}>
            <Flex gap="11px">
              <SkeletonCircle size="48px" />
              <Box>
                <Skeleton height="20px" width="150px" />
                <Skeleton height="20px" width="100px" />
              </Box>
            </Flex>
          </Box>

          <Box p="20px" borderRadius={"10px"} bgColor={"#FFF"} border={"1px solid #E2E8F0"}>
            <SkeletonText noOfLines={5} spacing="4" />
          </Box>
        </Box>
      </Box>

      {/* Comments and ratings skeleton */}
      <Box px={{ base: "20px", md: "30px" }} py={"30px"}>
        <SkeletonText noOfLines={1} width="200px" mb="20px" />
        <Skeleton height="85px" width="full" borderRadius={"3px"} mb="30px" />

        {/* Rating bars skeleton */}
        <Box display={"flex"} alignItems={"center"} gap="30px" justifyContent={"flex-start"} mb="40px">
          <Skeleton height="50px" width="80px" />
          <Skeleton height="30px" width="300px" />
        </Box>

        {/* Comment list skeleton */}
        <Box display={"flex"} flexDir={"column"} gap={"30px"} mb={"60px"}>
          <Flex gap="16px" mb={"30px"}>
            <SkeletonCircle size="48px" />
            <SkeletonText noOfLines={3} spacing="4" width="full" />
          </Flex>
          <Flex gap="16px" mb={"30px"}>
            <SkeletonCircle size="48px" />
            <SkeletonText noOfLines={3} spacing="4" width="full" />
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}


interface QuillOutputProps {
  htmlContent: string;
  [key: string]: any; 
}

function QuillOutput({ htmlContent, ...props }: QuillOutputProps) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      {...props}
      className={clsx(
        "box-border leading-[1.42] h-full overflow-y-auto text-left whitespace-pre-wrap px-[18px] py-0", // .ql-editor styles
        // Styling for headings
        "[&>h1]:text-[2em] [&>h1]:font-[bold] [&>h1]:text-black [&>h1]:mb-[0.5em]",
        "[&>h2]:text-[1.5em] [&>h2]:font-[bold] [&>h2]:text-black [&>h2]:mb-[0.5em]",
        "[&>h3]:text-[1.17em] [&>h3]:font-[bold] [&>h3]:text-black [&>h3]:mb-[0.5em]",
        "[&>h4]:text-[1em] [&>h4]:font-[bold] [&>h4]:text-black [&>h4]:mb-[0.5em]",
        "[&>h5]:text-[0.83em] [&>h5]:font-[bold] [&>h5]:mb-[0.5em]",
        "[&>h6]:text-[0.67em] [&>h6]:font-[bold] [&>h6]:mb-[0.5em]",
        // Blockquote styling
        "[&>blockquote]:my-[5px] [&>blockquote]:pl-4 [&>blockquote]:border-l-4 [&>blockquote]:border-l-[#ccc] [&>blockquote]:border-solid",
        // Paragraphs and lists
        "[&>p]:m-0 [&>p]:p-0",
        "[&>ul]:list-none [&>ul]:m-0 [&>ul]:p-0 [&>ul>li::before]:content-['•'] [&>ul>li::before]:mr-2",
        "[&>ol]:list-none [&>ol]:m-0 [&>ol]:p-0 [&>ol>li::before]:counter(item)_'.'_ [&>ol>li::before]:mr-2 [&>ol>li]:counter-increment-[item]",
        // Table styling
        "[&>table]:border-spacing-0 [&>table]:my-[5px] [&>table]:border-collapse",
        "[&>table>td]:border [&>table>td]:p-[5px] [&>table>td]:border-solid [&>table>td]:border-[#ccc]",
        "[&>table>th]:border [&>table>th]:p-[5px] [&>table>th]:border-solid [&>table>th]:border-[#ccc]"
      )}
    />
  );
}


function ratingColorScheme(rating: number) {
  switch (rating) {
    case 5:
      return "teal";
    case 4:
      return "green";
    case 3:
      return "yellow";
    case 2:
      return "orange";
    case 1:
      return "red";
    default:
      return "gray";
  }
}



function UserComment({ commentItem }: { commentItem: CommentData }) {
  return (
    <Box display={"flex"} gap={"15px"} alignItems={"flex-start"}>
      <UserImage
        imageUrl={commentItem.profile_picture}
        width="48px" 
        height="48px" 
        objectFit="cover" 
      />
      <Box display={"flex"} flexDir={"column"} w="full" gap={"8px"} maxWidth={"570px"}>
        <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} gap="8px">
          <Text fontSize={"16px"} fontWeight={"600"} color="#334155">
            {commentItem?.name}
          </Text>
          <Text fontSize={"14px"} color="#64748B">
            {dayjs(commentItem?.created_at).fromNow()}
          </Text>
        </Box>
        <Box display={"flex"} alignItems={"center"} gap="8px">
          {Array.from({ length: 5 }).map((_, i) => {
            return (
              <StarIcon
                key={i}
                width="20px"
                height="20px"
                fill={i + 1 <= commentItem?.rating ? "#f9690e" : "#CBD5E1"}
              />
            );
          })}
        </Box>
        <Text fontSize={"14px"} bgColor="#F1F5F9" color={"#334155"} p="15px" borderRadius={"6px"}>
          {commentItem?.comment}
        </Text>
      </Box>
    </Box>
  );
}




export default function EventPage() {
  const { data: session } = useSession();
  const {socket} = useSocket();

  const pathname = usePathname();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [eventUserData, setEventUserData] = useState<AddedByUser | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null); // Add
  const [joinErrorType, setJoinErrorType] = useState<string | null>(null);
  const [commentData, setCommentData] = useState<CommentData[] | null>(null);
  const [commentRating, setCommentRating] = useState(0);
  const [ratingCounts, setRatingCounts] = useState<{
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  }>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const [isClient, setIsClient] = useState(false); // ADDED: Client-side check



  const [newCommentData, setNewCommentData] = useState({
    comment: "",
    rating: 0,
  });
  const [loading, setLoading] = useState(false);
  const [hasAlreadyCommented, setHasAlreadyCommented] = useState(false);
  const [slider, setSlider] = useState(0);
  const toast = useToast();
  const { id } = useParams();
  dayjs.extend(relativeTime);

  //const navigate = useNavigate();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // ADDED: Set to true after client-side mounting
  }, []);

  const checkUserAlreadyCommented = (comments: CommentData[] | null, userId: string) => {
    if (!comments || !userId) return false;
    return comments.some(comment => comment.added_by === userId);
  };

  // Effect to set accessToken when session changes
  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken as string);
    } else {
      setAccessToken(null);
    }
  }, [session]);

  const handleActionEmit = (actionType: string, activityId: string) => {
    if (socket && session) {
      // console.log("Emitting event with socket:", socket);
      try {
        socket.emit("user_action", {
          userId: session.user.id,
          activityId,
          actionType,
        });
      } catch (error) {
        console.error("Socket emit error:", error);
      }
    } else {
      console.log("Socket or session not available:", { socket, sessionAvailable: !!session });
    }
  };

  const handleLikeEmit = (activityId: string) => {
    handleActionEmit("like", activityId);
  };
  const handleCommentEmit = (activityId: string) => {
    handleActionEmit("comment", activityId);
  };
  const handleJoinRequestEmit = (activityId: string) => {
    handleActionEmit("activity_join", activityId);
  };

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

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  // Function to fetch likes and dislikes count
  const fetchLikesDislikes = async () => {
    if (!eventData?.id) {
      // console.log("Event ID not available yet, skipping like/dislike fetch");
      return;
    }
    try {
      const likeRes = await axios.get(`/api/public/activities/${eventData?.id}/like`, { withCredentials: true });
      const dislikeRes = await axios.get(`/api/public/activities/${eventData?.id}/dislike`, { withCredentials: true });

      const likeCount = likeRes.data.count || 0;
      const dislikeCount = dislikeRes.data.count || 0;

      setLikes(likeCount);
      setDislikes(dislikeCount);
    } catch (error) {
      console.error("Error fetching like/dislike counts", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setButtonLoading(true);

        const resEvent = await axios.get(`/api/public/activities/${id}`);
        const resEvents: Events = resEvent.data;

        if (resEvents && resEvents.items == 1) {
          const resEventItem = resEvents?.data[0];
          setEventData(resEventItem);
          const eventUserRes = resEventItem.added_by_user;
          setEventUserData(eventUserRes);

          const resComments = resEventItem.comments;
          if (resComments && resComments.items > 0) {
            const resCommentData = resComments.data;
            setCommentData(resCommentData);

            if (session?.user?.id) {
              const userHasCommented = checkUserAlreadyCommented(
                resCommentData,
                session.user.id
              );
              setHasAlreadyCommented(userHasCommented);
            }

            // Calculate the total rating and count each rating type (1-5 stars)
            let totalRating = 0;
            const ratingCounter: {
              1: number;
              2: number;
              3: number;
              4: number;
              5: number;
            } = {
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            };

            // When updating or accessing the ratingCounter, you can cast the index to one of the known keys:
            for (const comment of resCommentData) {
              totalRating += comment.rating;
              // Cast `comment.rating` to type `1 | 2 | 3 | 4 | 5`
              ratingCounter[comment.rating as keyof typeof ratingCounter] += 1;
            }

            setCommentRating(totalRating / resCommentData.length);
            setRatingCounts(ratingCounter);
            setIsLoading(false);
          }

          if (session) {
            try {
              const statusResponse = await axios.get(`/api/activity_join/${id}/is-member`, {
                withCredentials: true,
              });
              const { isMember, isStarted, isEnded, isAlreadyRequested } = statusResponse.data;
              setIsMember(isMember);
             
              if (isEnded) {
                setJoinError("Event has ended!")
                setJoinErrorType("warning")
              }
              else if (isStarted) {
                setJoinError("Event has already started!")
                setJoinErrorType("warning")
              }
              else if (isAlreadyRequested) {
                setJoinError("Request Sent!")
                setJoinErrorType("warning")
              }
              else {
                setJoinError(null);
                setJoinErrorType(null);
              }

              if (isMember) {
                setJoinError(null);
                setJoinErrorType(null);
              }

            } catch (statusError) {
              console.error("Error fetching membership status:", statusError);
            }
          }


        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        setButtonLoading(false);
      }
    };

    fetchData();
  }, [session]);

  useEffect(() => {
    if (eventData?.id) {
      fetchLikesDislikes();
    }
  }, [eventData]);

  async function handleJoin() {
    setIsProcessing(true);
    try {
      if (session) {
        const response = await axios.post(`/api/activity_join/${id}`, {
          withCredentials: true,
        });
        if (response.status === 200) {
          const joinRequest = response.data.data;
          if (joinRequest.status === "accepted") {
            setIsMember(true);
            setJoinError(null);
            setJoinErrorType(null);
          } else if (joinRequest.status === "voting") {
            setIsMember(false);
            setJoinError("Request Sent!");
            setJoinErrorType("warning");
          }
          handleJoinRequestEmit(`${id}`);
          toast({
            title: "Join request sent",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          throw new Error(response.data.error || "Action failed");
        }
      } else {
        toast({
          title: "Login Error",
          description: `You must login to join`,
          status: "error",
        });
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setJoinError(error.response.data.error);
        setJoinErrorType("error");
      } else {
        setJoinError("An unexpected error occurred");
        setJoinErrorType("error");
      }
      toast({
        title: "Error",
        description: error.response?.data?.error || "An unexpected error occurred",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  // Calculate total comments for percentage calculations
  const totalComments = commentData ? commentData.length : 0;
  const getPercentage = (rating: 1 | 2 | 3 | 4 | 5 | number) => {
    if (totalComments === 0) return 0;
    return (ratingCounts[rating] / totalComments) * 100;
  };

  const handleSubmitComment = async () => {
    if (session) {
      if (!newCommentData.comment || newCommentData.rating === 0) {
        toast({
          title: "Error.",
          description: "Please provide both a comment and a rating.",
          status: "error",
        });
        return;
      }

      try {
        const res = await axios.post(
          `/api/public/activities/${id}/comments`, // Replace with the correct activityId
          {
            comment: newCommentData.comment,
            rating: newCommentData.rating,
          },
          {
            withCredentials: true,
          }
        );

        const data = await res.data;
        //socketemit
        handleCommentEmit(`${id}`);
        const resCommentData: CommentData = data?.commentData;
        if (resCommentData) {
          // Add the new comment to the commentData array
          setCommentData((prevCommentData) => {
            if (prevCommentData) {
              return [...prevCommentData, resCommentData]; // Append the new comment
            } else {
              return [resCommentData]; // If there are no comments yet, initialize with the new comment
            }
          });

          setHasAlreadyCommented(true);
          // Clear the comment form
          setNewCommentData({
            comment: "",
            rating: 0,
          });

          toast({
            title: "Comment Added.",
            description: "Your comment has been added successfully.",
            status: "success",
          });
        }
      } catch (error) {
        toast({
          title: "Error.",
          description: `${error?.response?.data?.message || error?.response?.data?.error || error?.message}`,
          status: "error",
        });
        console.error(error);
      }
    } else {
      toast({
        title: "Login Error",
        description: `You must login to Comment`,
        status: "error",
      });
    }
  };
  const timePosted = dayjs(eventData?.created_at).fromNow();

 
  // Function to handle like action
  const handleLikeEvent = async () => {
    if (!eventData?.id) {
      toast({
        title: "Error",
        description: "Event data is still loading, please wait.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      if (session) {
        const response = await axios.post(`/api/public/activities/${eventData?.id}/like`, {}, { withCredentials: true });
        if (response.data.action === "added" && response.data.isFirstLike === true) {
          handleLikeEmit(`${eventData?.id}`);
        }
        fetchLikesDislikes();
      } else {
        toast({
          title: "Login Error",
          description: `You must login to Like`,
          status: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Error.",
        description: `${error?.response?.data?.message || error.message}`,
        status: "error",
      });
      console.error("Like error:", error);
    }
  };

  // Function to handle dislike action
  const handleDisLikeEvent = async () => {
    if (!eventData?.id) {
      toast({
        title: "Error",
        description: "Event data is still loading, please wait.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      if (session) {
        // Toggle dislike using the POST route
        await axios.post(`/api/public/activities/${eventData?.id}/dislike`, {}, { withCredentials: true });

        // Re-fetch the updated counts for likes and dislikes
        fetchLikesDislikes();
      } else {
        toast({
          title: "Login Error",
          description: `You must login to Dislike`,
          status: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Error.",
        description: `${error?.message}`,
        status: "error",
      });
      console.error(error);
    }
  };

  const facebookShare = (id: any) => {
    const currentUrl = window.location.href;
    const shareUrl = `${currentUrl.split('/').slice(0,3).join('/')}/event/${id}`;
    const encodedShareUrl = encodeURIComponent(shareUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`, "_blank");
};

  const twitterShare = (id: any) => {
    const currentUrl = window.location.href;
    const shareUrl = `${currentUrl.split('/').slice(0,3).join('/')}/event/${id}`;
    const encodedShareUrl = encodeURIComponent(shareUrl);
    window.open(`https://twitter.com/intent/tweet?url=${encodedShareUrl}`, "_blank");
  };

  const whatsappShare = (id: any) => {
    const currentUrl = window.location.href;
    const shareUrl = `${currentUrl.split('/').slice(0,3).join('/')}/event/${id}`;
    const encodedShareUrl = encodeURIComponent(shareUrl);
    window.open(`https://api.whatsapp.com/send?text=${encodedShareUrl}`, "_blank");
  };
  // if (!user && !isUserFetched) return navigate("/login");


   const commentsRef = useRef(null);
  
  // Add this function at the top level of your component
  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
    
  if (!eventData) {
    return <EventDetailsSkeleton />;
  }

  const handleReport = () => {
    router.push('/contact-us', undefined, { shallow: true });
  };

  const getProfileLink = (userId: string) => {
    if (session?.user?.id === userId) {
      return "/profile/me";
    }
    return `/profile/${userId}`;
  };

  return (
    <Box
      display={"flex"}
      flexDir={"column"}
      p={{
        base: "10px",
        md: "20px",
      }}
      gap="20px"
    >
      <Box borderRadius={"10px"} overflow={"hidden"}>
      <Box pos={"relative"}>
          <Box pos={"relative"}>
            <Box
              display={"block"}
              pos={"relative"}
              // key={index}
              width={"100%"}
              height="auto"
              objectFit={"cover"}
            >
              {eventData?.images?.length > 0 ? (
                <Image
                  src={eventData?.images[slider]?.url || "/placeholder.png"}
                  w="full"
                  h="full"
                  maxH={"400px"}
                  objectFit="cover"
                  alt="Image"
                />
              ) : (
                <Image
                  src="/placeholder.png"
                  w="full"
                  h="full"
                  maxH={"400px"}
                  objectFit="cover"
                  alt="Default Image"
                />
              )}
            </Box>
           {/* Conditionally render navigation arrows */}
            {eventData?.images?.length > 1 && eventData?.images[0]?.url !== "/placeholder.png" && (
            <>
              <Box pos={"absolute"} top={"45%"} left={"1%"} zIndex={1}>
              <Box
                as="button"
                 onClick={() => {
                  setSlider((prevSlider) => (prevSlider - 1 < 0 ? eventData?.images.length - 1 : prevSlider - 1));
                }}
                w={{
                  base: "40px",
                  md: "50px",
                }}
                h={{
                  base: "40px",
                  md: "50px",
                }}
                _active={{
                  transform: "translateX(-5px) scale(0.99)",
                }}
                transition={"transform 100ms"}
                bg={"#fff"}
                borderRadius={"50%"}
                objectFit={"cover"}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <LeftArrowIcon width={"20px"} height={"20px"} />
              </Box>
            </Box>
            <Box pos={"absolute"} top={"45%"} right={"1%"} zIndex={1}>
              <Box
                as="button"
                 onClick={() => {
                  setSlider((prevSlider) => (prevSlider + 1 >= (eventData?.images?.length || 0) ? 0 : prevSlider + 1));
                }}
                w={{
                  base: "40px",
                  md: "50px",
                }}
                h={{
                  base: "40px",
                  md: "50px",
                }}
                _active={{
                  transform: "translateX(5px) scale(0.99)",
                }}
                transition={"transform 100ms"}
                bg={"#fff"}
                borderRadius={"50%"}
                objectFit={"cover"}
                display={"flex"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <LeftArrowIcon style={{ transform: "rotateY(180deg)" }} width={"20px"} height={"20px"} />
              </Box>
            </Box>
            </>
            )}
          </Box>
        </Box>
      </Box>
      <Box
        display={"flex"}
        flexDir={{
          base: "column",
          md: "row",
        }}
        w={"100%"}
        gap="20px"
      >
        <Box
          flex="1"
          borderRadius={"10px"}
          overflow={"hidden"}
          border={"1px solid #E2E8F0"}
          p="20px 25px"
          bgColor={"#FFF"}
        >
          {eventData?.contact_info && (
            <>
              <Heading
                mb="0.25em"
                color={"#000000"}
                fontSize={"1.5em"}
                fontWeight={"700"}
                fontFamily={"var(--font-mulish)"}
              >
                Contact Information
              </Heading>
              <QuillOutput
                htmlContent={`${eventData?.contact_info}`}
                style={{
                  color: "#64748B",
                  textAlign: "left",
                  marginBottom: "20px",
                  borderRadius: "10px",
                }}
              />{" "}
            </>
          )}

          <Heading
            mb="0.25em"
            color={"#000000"}
            fontSize={"1.5em"}
            fontWeight={"700"}
            fontFamily={"var(--font-mulish)"}
          >
            About Event
          </Heading>
          {eventData?.description && (
            <QuillOutput
              htmlContent={eventData?.description}
              style={{
                color: "#64748B",
                textAlign: "left",
                marginBottom: "20px",
                borderRadius: "10px",
              }}
            />
          )}
        </Box>
        <Box
          w={{
            base: "100%",
            md: "300px",
          }}
          display={"flex"}
          flexDir={"column"}
          gap={"20px"}
        >
          <Box p="20px" borderRadius={"10px"} bgColor={"#FFF"} border={"1px solid #E2E8F0"}>
            <Text mb="10px" color={"#000000"} fontWeight={"700"}>
              ZIP Code / Location
            </Text>
            <Text fontSize={"14px"} color="#334155" mb={"5px"}>
              {eventData?.zip} / {eventData?.city}
            </Text>
          </Box>
          <Box p="20px" borderRadius={"10px"} bgColor={"#FFF"} border={"1px solid #E2E8F0"}>
            <Text mb="10px" color={"#000000"} fontWeight={"700"}>
              Share this event
            </Text>
            <Box display={"flex"} gap="10px" alignItems={"center"}>
              <FacebookIcon onClick={() => facebookShare(id)} fill="#000" width={"20px"} height={"20px"} cursor="pointer" />
              <TwitterIcon onClick={() => twitterShare(id)} fill="#000" width={"20px"} height={"20px"} cursor="pointer"/>
              <WhatsappIcon onClick={() => whatsappShare(id)} fill="#000" width={"20px"} height={"20px"} cursor="pointer"/>
            </Box>
          </Box>
          <Link href={getProfileLink(eventUserData?.id||"")}>
            <Box p="20px" borderRadius={"10px"} bgColor={"#FFF"} border={"1px solid #E2E8F0"}>
              <Text mb="10px" color={"#000000"} fontWeight={"700"}>
                Posted By
              </Text>
              <Box display={"flex"} alignItems={"flex-start"} justifyContent={"flex-start"} gap="11px">
                <UserImage
                  imageUrl={eventUserData?.profile_picture}
                  width={"48px"}
                  height={"48px"}
                  borderRadius={"50%"}
                  objectFit={"cover"}
                />
                <Box display={"flex"} flexDir={"column"}>
                  <Text fontSize={"16px"} fontWeight={"600"} color="#334155">
                    By {eventUserData?.name}
                  </Text>
                  <Text fontSize={"14px"} color="#94A3B8">
                    {`${eventUserData?.location?.split("city: ")[1]?.split(", zip")[0]}`}
                  </Text>
                </Box>
              </Box>
            </Box>
          </Link>
          <Box p="20px" borderRadius={"10px"} bgColor={"#FFFFFF"} border={"1px solid #E2E8F0"}>
            <Text mb="10px" color={"#000000"} fontWeight={"700"}>
              Rules :
            </Text>
            {eventData?.rules?.length > 0 && (
              <Box
                display={"flex"}
                alignItems={"flex-start"}
                justifyContent={"flex-start"}
                flexDir={"column"}
                gap="11px"
              >
                {`${eventData?.rules}`.split(",").map((rule: string, i) => {
                  return (
                    <Box key={i} display={"flex"} alignItems={"center"} gap="8px">
                      <Text fontSize={"14px"} color="#334155">
                        {i + 1}. {rule}
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
      <Box px={{ base: "20px", md: "30px" }} py={"30px"} ref={commentsRef}>
  <Box>
    <Text mb={"20px"} fontSize={"24px"} color={"#1E293B"} fontWeight={"700"}>
      Rating and feedback ({commentData?.length ? commentData?.length : 0})
    </Text>
    {/* Conditionally render the comment input section */}
    {/* Replace the existing comment form section with this: */}
{session && isMember ? (
  hasAlreadyCommented ? (
    <Text mb={"30px"} fontSize={"16px"} color="#4A5568" fontWeight="medium" p="4" bg="gray.50" borderRadius="md">
      You have already provided feedback for this event. Thank you for your contribution!
    </Text>
  ) : (
    <Box display={"flex"} alignItems={"flex-start"} justifyContent={"flex-start"} gap="16px" mb={"30px"}>
      <Image
        src={userData?.profile_pic ? userData?.profile_pic : "/account.png"}
        w={"48px"}
        h={"48px"}
        borderRadius={"50%"}
        objectFit={"cover"}
      />
      <Box display={"flex"} flexDir={"column"} w="full" gap={"16px"}>
        <Box display={"flex"} alignItems={"center"} gap="8px">
          {Array.from({ length: 5 }).map((_, i) => {
            return (
              <StarIcon
                key={i}
                width="22px"
                height="22px"
                fill={i < newCommentData.rating ? "#f9690e" : "#CBD5E1"}
                onClick={() => {
                  setNewCommentData({ ...newCommentData, rating: i + 1 });
                }}
                cursor="pointer"
              />
            );
          })}
        </Box>
        <Textarea
          placeholder="Write your feedback..."
          w={"full"}
          maxWidth={"600px"}
          outline={"1px solid #CBD5E1"}
          borderRadius={"3px"}
          h={"85px"}
          bgColor={"#FFF"}
          onChange={(e) => {
            setNewCommentData({
              ...newCommentData,
              comment: e.target.value,
            });
          }}
          value={newCommentData.comment}
        />

        <Box w={"auto"}>
          <Box
            as="button"
            py={"8px"}
            px="20px"
            display={"inline-block"}
            bgColor={"#f9690e"}
            borderRadius={"3px"}
            color={"#FFF"}
            onClick={handleSubmitComment}
          >
            Comment
          </Box>
        </Box>
      </Box>
    </Box>
  )
) : (
  <Flex justifyContent="flex-start" alignItems="center" gap={4} mb={"30px"}>
    <Text color="gray.500">
      Join the activity to add your comment.
    </Text>
  </Flex>
)}
    <Box mb="40px" display={"flex"} alignItems={"center"} gap="30px" justifyContent={"flex-start"}>
      <Box display={"flex"} flexDir={"column"}>
        <Box display={"flex"} alignItems={"center"} gap="18px">
          <Text fontSize={"57px"} color="#334155">
            {commentRating.toFixed(1)}
          </Text>
          <Text fontSize={"14px"} color="#64748B">
            Avg <span style={{ display: "block" }}>Rating</span>
          </Text>
        </Box>
        <Box display={"flex"} alignItems={"center"} gap="8px">
          {Array.from({ length: 5 }).map((_, i) => {
            return <StarIcon key={i} width="22px" height="22px" fill="#CBD5E1" />;
          })}
        </Box>
      </Box>
      <Box display={"flex"} flexDir={"column"} w="full">
        {/* Rating Progress Bars */}
        {[5, 4, 3, 2, 1].map((rating) => (
          <Box display={"flex"} alignItems={"center"} gap="10px" key={rating}>
            <Text color={"#64748B"}>{rating}</Text>
            <Progress
              height={"6px"}
              value={getPercentage(rating)}
              w={"full"}
              borderRadius={99}
              colorScheme={ratingColorScheme(rating)} // Function to dynamically assign color
              maxWidth={"300px"}
            />
            <Text color={"#64748B"}>({ratingCounts[rating]})</Text>
          </Box>
        ))}
      </Box>
    </Box>
    <Box display={"flex"} flexDir={"column"} gap={"30px"} mb={"60px"}>
      {commentData &&
        commentData?.length > 0 &&
        commentData.map((commentItem, i) => {
          return <UserComment key={i} commentItem={commentItem} />;
        })}
    </Box>
  </Box>
</Box>

      {/* Add this at the bottom of your event section, before the closing Box component */}
<Box
  w="100%"
  px={{ base: "20px", md: "30px" }}
  bg="white"
  borderTop="1px solid #E2E8F0"
  boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.1)"
  position="sticky"
  bottom="0"
  left="0"
  right="0"
  mt="auto"
>
  <Box
    display="flex"
    flexDir={{
      base: "column",
      md: "row",
    }}
    gap="10px"
    justifyContent="space-between"
    py="20px"
    bg="white"
    maxWidth="1440px"
    margin="0 auto"
  >
    {/* Desktop View - Event Info */}
    <Box display={{ base: "none", md: "flex" }} alignItems="flex-start" justifyContent="flex-start" gap="11px">
    <Box display="flex" alignItems="flex-start" gap="11px" cursor="pointer">
  <Link href={getProfileLink(eventUserData?.id || '')} style={{ textDecoration: "none" }}>
      <UserImage 
        imageUrl={eventUserData?.profile_picture} 
        width="48px" 
        height="48px" 
        borderRadius="50%" 
        objectFit="cover" 
      />
  </Link>
      <Box display="flex" flexDir="column">
        <Text fontSize="16px" fontWeight="600" color="#334155">
          {eventData?.title}
        </Text>
        <Text fontSize="14px" color="#94A3B8">
          Created {timePosted}
        </Text>
        <Text fontSize="14px" color="#94A3B8">
          Category: Event
        </Text>
      </Box>
    </Box>
</Box>


    {/* Desktop View - Actions */}
    <Box display={{ base: "none", md: "flex" }} flexWrap="wrap" alignItems="center" gap="32px">
      <Box display="flex" alignItems="center" gap="8px" onClick={scrollToComments}>
        <MessagesIcon stroke="#64748B" width="22px" height="22px" />
        <Text fontSize="14px" color="#64748B">
          Comments: {commentData?.length ? commentData?.length : 0}
        </Text>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        gap="8px"
        onClick={handleLikeEvent}
        p={2}
        borderRadius="99px"
        _hover={{
          cursor: "pointer",
          bgColor: "#E2E8F0",
        }}
      >
        <LikeIcon stroke="#f9690e" width="22px" height="22px" />
        <Text fontSize="14px" color="#64748B">
          {likes}
        </Text>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        gap="8px"
        onClick={handleDisLikeEvent}
        p={2}
        borderRadius="99px"
        _hover={{
          cursor: "pointer",
          bgColor: "#E2E8F0",
        }}
      >
        <DislikeIcon stroke="#334155" width="22px" height="22px" />
        <Text fontSize="14px" color="#64748B">
          {dislikes}
        </Text>
      </Box>
      <RWebShare
        data={{
          text: "Checkout this event",
          url: `/event/${id}`,
          title: eventData?.title,
        }}
      >
        <Box
          p={2}
          display="flex"
          alignItems="center"
          gap="8px"
          borderRadius="99px"
          _hover={{ cursor: "pointer", bgColor: "#E2E8F0" }}
        >
          <Share2Icon width="22px" height="22px" stroke="#334155" />
          <Text fontSize="14px" color="#64748B">
            Share
          </Text>
        </Box>
      </RWebShare>
      <Box display="flex" alignItems="center" gap="8px" onClick={handleReport} cursor="pointer">
        <ReportIcon stroke="#334155" width="20px" height="20px" />
        <Text fontSize="14px" color="#64748B">
          Report
        </Text>
      </Box>
                 {/* Conditional rendering: Show warning OR button */}
      {!isMember && joinError ? (
        <Text color="yellow.500" fontWeight="semibold" textAlign="center">
          {joinError}
        </Text>
      ) : (
        <Box
          as="button"
          py="5px"
          px="30px"
          fontSize="16px"
          fontWeight="500"
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          bgColor={
            buttonLoading
              ? "#D1D5DB"
              : "#f9690e"
          }
          borderRadius="3px"
          color="white"
          _hover={
            buttonLoading
              ? {}
              : { bgColor: "#DD6B20" }
          }
          disabled={isProcessing || buttonLoading || joinError}
          onClick={() => { // Add onClick handler
            if (!session) {
              router.push(`/login?callbackUrl=${encodeURIComponent(isClient ? window.location.pathname : '/')}`); // Redirect to login if no session
            } else if (isMember) {
              router.push(`/messages?activityId=${id}`);
            } else {
              handleJoin();
            }
          }}
          position="relative"
          height="36px"
        >
          {buttonLoading && (
            <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
              <Spinner size="sm" />
            </Box>
          )}
          {isProcessing && (
            <Box position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)">
              <Spinner size="sm" />
            </Box>
          )}
          {!session
            ? "Please login to join"
            : isMember
            ? "Message"
            : "Join"
          }
        </Box>
      )}
    </Box>

    {/* Mobile View */}
    <Box 
      display={{ base: "flex", md: "none" }} 
      w="100%" 
      justifyContent="space-between" 
      alignItems="center"
    >
      
                 {/* Conditional rendering: Show warning OR button */}
                 {!isMember && joinError ? (
        <Text color="yellow.500" fontWeight="semibold" textAlign="center">
          {joinError}
        </Text>
      ) : (
        <Box
          as="button"
          py="8px"
          px="12px"  // Slightly reduce padding
          fontSize="14px" // Slightly reduce font size
          fontWeight="500"
          onClick={() => {
            if (!session) {
              router.push(`/login?callbackUrl=${encodeURIComponent(isClient ? window.location.pathname : '/')}`);
            } else if (isMember) {
              router.push(`/messages?activityId=${id}`);
            } else {
              handleJoin();
            }
          }}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgColor={
            buttonLoading
              ? "#D1D5DB"
              : !session
                ? "#f9690e" // Example: Slightly different orange for "Login"
                : "#f9690e"
          }
          borderRadius="3px"
          color="white"
          _hover={
            buttonLoading
              ? {}
              : { bgColor: !session ? "#f59e0b" : "#DD6B20" } // Adjust hover color too
          }
          disabled={isProcessing || buttonLoading || joinError}
          h="40px"
          w="45%"
          cursor="pointer" // Add cursor pointer to indicate it's clickable
        >
          {buttonLoading && <Spinner size="sm" mr={2} />}
          {isProcessing && <Spinner size="sm" mr={2} />}
          {!session
            ? "Please login" // Updated button text for login
            : isMember ? "Message"
            : "Join"
          }
        </Box>
      )}

      {/* Menu Button */}
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<MenuIcon stroke="#334155" width="24px" height="24px" />}
          variant="ghost"
          _hover={{ bg: "#E2E8F0" }}
          h="40px"
          w="45%"
        />
        <MenuList py={4}>
          {/* Event Info */}
          <MenuItem closeOnSelect={false}>
          <Box display="flex" alignItems="flex-start" gap="11px" w="100%">
  <Link href={getProfileLink(eventUserData?.id || '')} style={{ textDecoration: "none" }}>
    <UserImage
      imageUrl={eventUserData?.profile_picture}
      width="48px"
      height="48px"
      objectFit="cover"
    />
  </Link>
  <Box display="flex" flexDir="column">
    <Text fontSize="16px" fontWeight="600" color="#334155">
      {eventData?.title}
    </Text>
    <Text fontSize="14px" color="#94A3B8">
      Created {timePosted}
    </Text>
    <Text fontSize="14px" color="#94A3B8">
      Category: Event
    </Text>
  </Box>
</Box>
</MenuItem>

          <MenuDivider />
          <MenuItem onClick={scrollToComments}>
            <Box display="flex" alignItems="center" gap="8px">
              <MessagesIcon stroke="#64748B" width="22px" height="22px" />
              <Text fontSize="14px" color="#64748B">
                Comments: {commentData?.length ? commentData?.length : 0}
              </Text>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleLikeEvent}>
            <Box display="flex" alignItems="center" gap="8px">
              <LikeIcon stroke="#f9690e" width="22px" height="22px" />
              <Text fontSize="14px" color="#64748B">
                {likes}
              </Text>
            </Box>
          </MenuItem>
          <MenuItem onClick={handleDisLikeEvent}>
            <Box display="flex" alignItems="center" gap="8px">
              <DislikeIcon stroke="#334155" width="22px" height="22px" />
              <Text fontSize="14px" color="#64748B">
                {dislikes}
              </Text>
            </Box>
          </MenuItem>
          <MenuItem onClick={() => {
            const shareData = {
              text: "Checkout this event",
              url: `/event/${id}`,
              title: eventData?.title,
            };
            navigator.share(shareData);
          }}>
            <Box display="flex" alignItems="center" gap="8px">
              <Share2Icon width="22px" height="22px" stroke="#334155" />
              <Text fontSize="14px" color="#64748B">Share</Text>
            </Box>
          </MenuItem>
          <MenuItem>
            <Box display="flex" alignItems="center" gap="8px" onClick={handleReport} cursor="pointer">
              <ReportIcon stroke="#334155" width="20px" height="20px" />
              <Text fontSize="14px" color="#64748B">Report</Text>
            </Box>
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  </Box>
</Box>
    </Box>
  );
}






