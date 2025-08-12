/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import {
  Box,
  Button,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  MenuDivider,
  Grid,
  OrderedList,
  ListItem
} from "@chakra-ui/react";
import { Menu as MenuIcon } from "lucide-react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState, useRef, useMemo } from "react";
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
import UserImage from "@/components/handleImage/UserImage";

export interface Events {
  items: number;
  type: string;
  data: EventData[];
}

export interface Products {
  items: number;
  data: ProductData[];
}

export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  userId?: string;
  images?: { url: string }[];
  videos?: { url: string }[];
  course_materials?: { name: string }[];
  created_at: string;
  updated_at: string;
  pdfs?: { name: string; url?: string; mediaId: string }[]; // <-- add mediaId
  documents?: { name: string; mediaId: string }[]; // <-- add this line
}

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

interface CommentData {
  id: string;
  comment: string;
  rating: number;
  added_by: string;
  created_at: string;
  name?: string;
  profile_picture?: string;
}

interface Comments {
  items: number;
  data: CommentData[];
}

function ProductDetailsSkeleton() {
  
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

      {/* Product details skeleton */}
      <Box
        p="20px"
        pt="40px"
        mt="-20px"
        bgColor={"#FFF"}
        border={"1px solid #E2E8F0"}
        borderRadius={"10px"}
        zIndex={2}
      >
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

      {/* Name and description skeleton */}
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
          <Box
            p="20px"
            borderRadius={"10px"}
            bgColor={"#FFF"}
            border={"1px solid #E2E8F0"}
          >
            <SkeletonText noOfLines={2} spacing="4" />
          </Box>

          <Box
            p="20px"
            borderRadius={"10px"}
            bgColor={"#FFF"}
            border={"1px solid #E2E8F0"}
          >
            <SkeletonText noOfLines={2} spacing="4" />
          </Box>

          <Box
            p="20px"
            borderRadius={"10px"}
            bgColor={"#FFF"}
            border={"1px solid #E2E8F0"}
          >
            <Flex gap="11px">
              <SkeletonCircle size="48px" />
              <Box>
                <Skeleton height="20px" width="150px" />
                <Skeleton height="20px" width="100px" />
              </Box>
            </Flex>
          </Box>

          <Box
            p="20px"
            borderRadius={"10px"}
            bgColor={"#FFF"}
            border={"1px solid #E2E8F0"}
          >
            <SkeletonText noOfLines={5} spacing="4" />
          </Box>
        </Box>
      </Box>

      {/* Comments and ratings skeleton */}
      <Box px={{ base: "20px", md: "30px" }} py={"30px"}>
        <SkeletonText noOfLines={1} width="200px" mb="20px" />
        <Skeleton height="85px" width="full" borderRadius={"3px"} mb="30px" />

        {/* Rating bars skeleton */}
        <Box
          display={"flex"}
          alignItems={"center"}
          gap="30px"
          justifyContent={"flex-start"}
          mb="40px"
        >
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
      <Box
        display={"flex"}
        flexDir={"column"}
        w="full"
        gap={"8px"}
        maxWidth={"570px"}
      >
        <Box
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
          gap="8px"
        >
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
        <Text
          fontSize={"14px"}
          bgColor="#F1F5F9"
          color={"#334155"}
          p="15px"
          borderRadius={"6px"}
        >
          {commentItem?.comment}
        </Text>
      </Box>
    </Box>
  );
}

export default function ProductDetailsPage() {
  const { data: session } = useSession();
  const { socket } = useSocket();

  const pathname = usePathname();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);
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

  const checkUserAlreadyCommented = (
    comments: CommentData[] | null,
    userId: string
  ) => {
    if (!comments || !userId) return false;
    return comments.some((comment) => comment.added_by === userId);
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
      console.log("Socket or session not available:", {
        socket,
        sessionAvailable: !!session,
      });
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
      const likeRes = await axios.get(
        `/api/public/activities/${eventData?.id}/like`,
        { withCredentials: true }
      );
      const dislikeRes = await axios.get(
        `/api/public/activities/${eventData?.id}/dislike`,
        { withCredentials: true }
      );

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
        const resProduct = await axios.get(`/api/products/${id}`);
        const resproducts: Products = resProduct.data;

        if (resproducts && resproducts.items == 1) {
          const resProductItem = resproducts?.data[0];
          //console.log('res--'+JSON.stringify(resProductItem))
          //console.log('res--'+JSON.stringify(resProductItem.videos[1]))
          setProductData(resProductItem);
          console.log('productData from API:', resProductItem);
        }
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
              const statusResponse = await axios.get(
                `/api/activity_join/${id}/is-member`,
                {
                  withCredentials: true,
                }
              );
              const { isMember, isStarted, isEnded, isAlreadyRequested } =
                statusResponse.data;
              setIsMember(isMember);

              if (isEnded) {
                setJoinError("Event has ended!");
                setJoinErrorType("warning");
              } else if (isStarted) {
                setJoinError("Event has already started!");
                setJoinErrorType("warning");
              } else if (isAlreadyRequested) {
                setJoinError("Request Sent!");
                setJoinErrorType("warning");
              } else {
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
      const err = error as any;
      if (err && err.response && err.response.data && err.response.data.error) {
        setJoinError(err.response.data.error);
        setJoinErrorType("error");
      } else {
        setJoinError("An unexpected error occurred");
        setJoinErrorType("error");
      }
      toast({
        title: "Error",
        description:
          err?.response?.data?.error || "An unexpected error occurred",
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
    const validRating = ([1,2,3,4,5] as const).includes(rating as any) ? rating as 1|2|3|4|5 : 1;
    return (ratingCounts[validRating] / totalComments) * 100;
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
        const resCommentData = data?.commentData as CommentData;
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
        const err = error as any;
        toast({
          title: "Error.",
          description: `${err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message
            }`,
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
        const response = await axios.post(
          `/api/public/activities/${eventData?.id}/like`,
          {},
          { withCredentials: true }
        );
        if (
          response.data.action === "added" &&
          response.data.isFirstLike === true
        ) {
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
      const err = error as any;
      toast({
        title: "Error.",
        description: `${err?.response?.data?.message || err?.message}`,
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
        await axios.post(
          `/api/public/activities/${eventData?.id}/dislike`,
          {},
          { withCredentials: true }
        );

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
      const err = error as any;
      toast({
        title: "Error.",
        description: `${err?.message}`,
        status: "error",
      });
      console.error(error);
    }
  };

  const facebookShare = (id: any) => {
    const currentUrl = window.location.href;
    const shareUrl = `${currentUrl
      .split("/")
      .slice(0, 3)
      .join("/")}/product/${id}`;
    const encodedShareUrl = encodeURIComponent(shareUrl);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`,
      "_blank"
    );
  };

  const twitterShare = (id: any) => {
    const currentUrl = window.location.href;
    const shareUrl = `${currentUrl
      .split("/")
      .slice(0, 3)
      .join("/")}/product/${id}`;
    const encodedShareUrl = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?url=${encodedShareUrl}`,
      "_blank"
    );
  };

  const whatsappShare = (id: any) => {
    const currentUrl = window.location.href;
    const shareUrl = `${currentUrl
      .split("/")
      .slice(0, 3)
      .join("/")}/product/${id}`;
    const encodedShareUrl = encodeURIComponent(shareUrl);
    window.open(
      `https://api.whatsapp.com/send?text=${encodedShareUrl}`,
      "_blank"
    );
  };
  // if (!user && !isUserFetched) return navigate("/login");

  const commentsRef = useRef(null);

  // Add this function at the top level of your component
  const scrollToComments = () => {
    (commentsRef.current as HTMLElement | null)?.scrollIntoView({ behavior: "smooth" });
  };

  // Memoize comment-related calculations
  const memoizedCommentData = useMemo(() => commentData || [], [commentData]);
  const memoizedRatingCounts = useMemo(() => {
    const ratingCounter: { 1: number; 2: number; 3: number; 4: number; 5: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;
    for (const comment of memoizedCommentData) {
      totalRating += comment.rating;
      ratingCounter[comment.rating as 1|2|3|4|5] += 1;
    }
    return ratingCounter;
  }, [memoizedCommentData]);
  const memoizedCommentRating = useMemo(() => {
    if (memoizedCommentData.length === 0) return 0;
    let totalRating = 0;
    for (const comment of memoizedCommentData) {
      totalRating += comment.rating;
    }
    return totalRating / memoizedCommentData.length;
  }, [memoizedCommentData]);

  const [purchasedProducts, setPurchasedProducts] = useState<string[]>([]); // Store purchased product IDs
  const [purchasedLoading, setPurchasedLoading] = useState(true);

  useEffect(() => {
    const fetchPurchasedProducts = async () => {
      if (!session) {
        setPurchasedProducts([]);
        setPurchasedLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/order-details/user', { withCredentials: true });
        const orders = res.data?.data || [];
        // Consider only orders placed by the user (not vendor)
        const customerOrders = orders.filter((order: any) => order.user_role === 'customer');
        // Extract product IDs from customer orders
        const productIds = customerOrders.map((order: any) => String(order.product_id));
        setPurchasedProducts(productIds);
      } catch (err) {
        setPurchasedProducts([]);
      } finally {
        setPurchasedLoading(false);
      }
    };
    fetchPurchasedProducts();
  }, [session]);

  // Whether current user has purchased this product
  const hasPurchasedCurrentProduct = !purchasedLoading && purchasedProducts.includes(String(productData?.id));
  
  // Whether current user is the vendor (creator) of this product
  const isCurrentUserVendor = session?.user?.id && productData?.userId && session.user.id === String(productData.userId);

  // Early return for loading state (after all hooks)
  if (isLoading) {
    return <ProductDetailsSkeleton />;
  }

  const handleReport = () => {
    router.push("/contact-us");
  };

  const getProfileLink = (userId: string) => {
    if (session?.user?.id === userId) {
      return "/profile/me";
    }
    return `/profile/${userId}`;
  };
 const handleProduct = async () => {
    console.log('handle product')
    // let tries = 0;
    // let found = false;
    // while (!found && tries < 10) {
    //   try {
    //     const res = await axios.get(`/api/products/${id}`);
    //     if (res.data && res.data.items === 1) {
    //       found = true;
    //       break;
    //     }
    //   } catch (e) {}
    //   await new Promise(r => setTimeout(r, 500));
    //   tries++;
    // }

    localStorage.setItem("buyNowProductId", String(productData?.id ?? ""));
    router.push("/product/order");
    //router.push("/product/order");
  };

  // Add to Cart handler
  const handleAddToCart = () => {
    if (!productData) return;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    // Avoid duplicates
    if (cart.some((item: any) => item.id === productData.id)) {
      toast({
        title: "Already in cart!",
        status: "info",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    cart.push({
      id: productData.id,
      name: productData.name,
      price: productData.price,
      image: productData.images?.[0]?.url || "/placeholder.png",
    });
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast({
      title: "Added to cart!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  //console.log('prod----'+productData?.videos[1].url)

  return (
    <Box>
      <Box p={{ base: "20px 10px", md: "30px", lg: "40px" }}>
        <Box display={"flex"} flexDir={"column"} gap="20px" w="full">
          <Box
            display={"flex"}
            flexDir={{
              base: "column",
              md: "row",
            }}
            bgColor="#FFF"
            border={"1px solid #E2E8F0"}
            borderRadius={"12px"}
            borderBottomRadius={"0px"}
            overflow={"hidden"}
          >
            {/* Main Content - Post Review */}
            <Box w={"full"}>
              <Box
                position={"relative"}
                px={{ base: "20px", md: "30px" }}
                borderBottom={"1px solid #E2E8F0"}
                flex={"1"}
              >
                {/* Product Title  */}
                <Text
                  fontSize={"30px"}
                  fontWeight={"700"}
                  color="#334155"
                  mt={"20px"}
                  mb={"20px"}
                >
                  {productData?.name}
                </Text>
              </Box>
              <Grid
                templateColumns={{
                  base: "repeat(auto-fit, minmax(100px, 1fr))",
                  md: "repeat(auto-fit, minmax(250px, 1fr))",
                }}
                gap="10px"
                mt="20px"
                mx="20px"
                py="10px"
              >
             

                {Array.isArray(productData?.images) && productData.images.length > 0 ? (
                  productData.images.map((img, idx) => (
                    <Image
                      key={idx}
                      src={img.url || "/placeholder.png"}
                      w="full"
                      h="full"
                      maxH={"400px"}
                      objectFit="cover"
                      alt={`Image ${idx + 1}`}
                    />
                  ))
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
              </Grid>
              {/* Product Description */}
              <Box
                pt={"20px"}
                // pb={"10px"}
                // maxWidth="745px"
                px={{ base: "20px", md: "30px" }}
                // mx="20px"
                display={"flex"}
                justifyContent={"center"}
              >
                <QuillOutput
                  htmlContent={productData?.description || ""}
                  style={{
                    color: "#64748B",
                    fontSize: "16px",
                    textAlign: "left",
                    width: "100%",
                  }}
                />
              </Box>

              {/* Video  */}
              <Box
                pt={"20px"}
                pb={"40px"}
                // maxWidth="745px"
                px={{ base: "20px", md: "30px" }}
              // mx="20px"
              // display={"flex"}
              // justifyContent={"center"}
              >
                {Array.isArray(productData?.videos) && productData.videos.some(v => v.url && v.url.toLowerCase().endsWith('.mp4')) && (
                  <>
                    <Text
                      fontSize={"30px"}
                      fontWeight={"700"}
                      // borderBottom={"1px solid #E2E8F0"}
                      color="#0F172A"
                    // px="20px"
                    // py={"10px"}
                    >
                      Course Materials Videos
                    </Text>
                    {/* Only render the video if videos exist and videos[1] is defined and is mp4 */}
                    {productData.videos.map((video, idx) => (
                      video.url && video.url.toLowerCase().endsWith('.mp4') ? (
                        <Box
                          as="video"
                          key={idx}
                          src={video.url}
                          controls
                          width="48%"
                          borderRadius="md"
                          boxShadow="md"
                          my={"20px"}
                        />
                      ) : null
                    ))}
                  </>
                )}
              </Box>
            </Box>

            {/* Sidebar - Post Details */}
            <Box
              w={"full"}
              maxWidth={"350px"}
              bgColor={"#FFF"}
              borderLeft={"1px solid #E2E8F0"}
            >
              <Box
                px="20px"
                py={"10px"}
                borderBottom={"1px solid #E2E8F0"}
                display={"flex"}
                flexDir={"column"}
                gap={"15px"}
              >
                <Flex
                  color="#0F172A"
                  fontSize="20px"
                  fontWeight="700"
                  alignItems="center"
                >
                  <Text>Price:</Text>
                  <Text color="#F9690E" ml="2" fontSize="35px">
                    ${(() => {
                      const priceNum = typeof productData?.price === 'number'
                        ? productData.price
                        : productData?.price
                          ? parseFloat(productData.price as any)
                          : 0;
                      return priceNum.toFixed(2);
                    })()}
                  </Text>
                </Flex>
              </Box>

              <Box px="20px" py={"10px"} borderBottom={"1px solid #E2E8F0"}>
                <Text mb="10px" color={"#000000"} fontWeight={"700"}>
                  Share this product link
                </Text>
                <Box display={"flex"} gap="10px" alignItems={"center"}>
                  <FacebookIcon
                    onClick={() => facebookShare(id)}
                    fill="#000"
                    width={"20px"}
                    height={"20px"}
                    cursor="pointer"
                  />
                  <TwitterIcon
                    onClick={() => twitterShare(id)}
                    fill="#000"
                    width={"20px"}
                    height={"20px"}
                    cursor="pointer"
                  />
                  <WhatsappIcon
                    onClick={() => whatsappShare(id)}
                    fill="#000"
                    width={"20px"}
                    height={"20px"}
                    cursor="pointer"
                  />
                </Box>
              </Box>

              {/* PDF List Section */}
              {Array.isArray(productData?.pdfs) && productData.pdfs.length > 0 && (
                <Box px="20px" py="10px" borderBottom="1px solid #E2E8F0">
                  <Text fontSize="18px" fontWeight="700" color="#0F172A" mb="2">
                    PDF Resources
                  </Text>
                  <OrderedList spacing={2}>
                    {productData.pdfs.map((pdf: { name: string; mediaId: string }, idx: number) => (
                      <ListItem key={idx}>
                        {hasPurchasedCurrentProduct ? (
                          <a
                            href={`/api/products/${productData.id}/media/${pdf.mediaId}/pdf`}
                            style={{ color: '#E53E3E', wordBreak: 'break-all', fontWeight: 500 }}
                            download={pdf.name.split('/').pop()}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {pdf.name.split('/').pop()}
                          </a>
                        ) : (
                          <span style={{ color: '#1f2937', wordBreak: 'break-all', fontWeight: 500 }}>
                            {pdf.name.split('/').pop()}
                          </span>
                        )}
                      </ListItem>
                    ))}
                  </OrderedList>
                </Box>
              )}
              {/* Documents List Section */}
              {Array.isArray(productData?.documents) && productData.documents.length > 0 && (
                <Box px="20px" py="10px" borderBottom="1px solid #E2E8F0">
                  <Text fontSize="18px" fontWeight="700" color="#0F172A" mb="2">
                    Course Materials Documents
                  </Text>
                  <OrderedList spacing={2}>
                    {productData.documents.map((doc: { name: string; mediaId: string }, idx: number) => (
                      <ListItem key={idx}>
                        {hasPurchasedCurrentProduct ? (
                          <a
                            href={`/api/products/${productData.id}/media/${doc.mediaId}/document`}
                            style={{ color: '#3182ce', wordBreak: 'break-all', fontWeight: 500 }}
                            download={doc.name.split('/').pop()}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {doc.name.split('/').pop()}
                          </a>
                        ) : (
                          <span style={{ color: '#1f2937', wordBreak: 'break-all', fontWeight: 500 }}>
                            {doc.name.split('/').pop()}
                          </span>
                        )}
                      </ListItem>
                    ))}
                  </OrderedList>
                </Box>
              )}
              {Array.isArray(productData?.course_materials) && productData.course_materials.length > 0?(
                <Text
                fontSize={"18px"}
                fontWeight={"700"}
                // borderBottom={"1px solid #E2E8F0"}
                color="#0F172A"
                px="20px"
                py={"10px"}
              >
                Course Materials URL
              </Text>

              ):''


              }      
              
              {Array.isArray(productData?.course_materials) && productData.course_materials.length > 0 ? (
                <OrderedList spacing={2} px="20px">
                  {productData.course_materials.map((material: { name: string }, idx: number) => (
                    <ListItem key={idx}>
                      {material.name.startsWith('http') && hasPurchasedCurrentProduct ? (
                        <a
                          href={material.name}
                          style={{ color: "#3182ce", wordBreak: "break-all", fontWeight: 500 }}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {material.name}
                        </a>
                      ) : (
                        <span style={{ color: "#1f2937", wordBreak: "break-all" }}>{material.name}</span>
                      )}
                    </ListItem>
                  ))}
                </OrderedList>
              ) : (
               '' // <Text px="20px" color="gray.500">No course materials available.</Text>
              )}
            </Box>
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
          <Box
            display={{ base: "none", md: "flex" }} // Desktop View - Event Info
            alignItems="flex-start"
            justifyContent="flex-start"
            gap="11px"
          >
            {/* <Box
              display="flex"
              alignItems="flex-start"
              gap="11px"
              cursor="pointer"
            >
              <Link
                href={getProfileLink(eventUserData?.id || "")}
                style={{ textDecoration: "none" }}
              >
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
                  Category: Product
                </Text>
              </Box>
            </Box> */}
          </Box>

          <Box
            display={{ base: "none", md: "flex" }} // Desktop View - Actions
            flexWrap="wrap"
            alignItems="center"
            gap="32px"
          >
            <RWebShare
              data={{
                text: "Checkout this product",
                url: `/productt/${id}`,
                title: productData?.name,
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
            {/* Add To Cart Button - only show if not purchased and not vendor */}
            {/* {(!purchasedLoading && !purchasedProducts.includes(String(productData?.id)) && !isCurrentUserVendor) && ( */}
              {( !isCurrentUserVendor) && (
              <Button
                py="5px"
                px="30px"
                fontSize="16px"
                fontWeight="500"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                bgColor="#3182ce"
                borderRadius="3px"
                color="white"
                _hover={{ bgColor: "#2563eb" }}
                position="relative"
                height="36px"
                onClick={handleAddToCart}
              >
                Add To Cart
              </Button>

              
            )}

            {/* Buy Product Button - only show if not vendor */}
            {!isCurrentUserVendor && (
              <Button
                py="5px"
                px="30px"
                fontSize="16px"
                fontWeight="500"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                bgColor={buttonLoading ? "#D1D5DB" : "#f9690e"}
                borderRadius="3px"
                color="white"
                _hover={buttonLoading ? {} : { bgColor: "#DD6B20" }}
                position="relative"
                height="36px"
                onClick={handleProduct}
              >
                Buy Product
              </Button>
            )}
          </Box>
        </Box>
      </Box>

    </Box>

  );
}
