// /* eslint-disable jsx-a11y/alt-text */
// //app/posts/[id]/page.tsx
// /* eslint-disable @typescript-eslint/no-unused-vars */
// "use client";

// import { Box, BoxProps, Grid, GridItem, Heading, Image, Progress, Text, Textarea, useToast, Spinner } from "@chakra-ui/react";
// import { Skeleton, SkeletonCircle, SkeletonText, Flex, Stack, Menu, MenuButton, MenuList, MenuItem, IconButton, MenuDivider } from "@chakra-ui/react";
// import { Menu as MenuIcon } from 'lucide-react';

// import axios from "axios";
// import dayjs from "dayjs";
// import relativeTime from "dayjs/plugin/relativeTime";

// import { PropsWithChildren, useEffect, useState, useRef } from "react";

// import { useParams } from "next/navigation";

// import { RWebShare } from "react-web-share";
// import { DislikeIcon, LikeIcon, MessagesIcon, ReportIcon, Share2Icon, StarIcon } from "@/components/Icons";
// import Loading from "@/components/App/loading";

// import { useRouter } from "next/navigation";
// import { useSession } from "next-auth/react";
// import { UserData } from "@/app/profile/me/page";
// import Link from "next/link";
// import clsx from "clsx";
// import { useSocket } from "@/app/socket";

// export interface Posts {
//   items: number;
//   type: string;
//   data: PostData[];
// }
// export interface PostData {
//   id: string;
//   title: string;
//   sub_title: string;
//   description: string;
//   activity_type_id: string;
//   location: string;
//   start_time: string;
//   end_time: any;
//   max_participants: number;
//   rules: string;
//   contact_info: string;
//   url: string;
//   is_event: boolean;
//   is_active: boolean;
//   added_by: string;
//   created_at: string;
//   updated_at: string;
//   activity_media: Array<{
//     name: string;
//   }>;
//   activity_comments: Array<{
//     id: string;
//     comment: string;
//     rating: number;
//     added_by: string;
//     created_at: string;
//     users: {
//       id: string;
//       name: string;
//       profile_picture: string;
//     };
//   }>;
//   count: {
//     activity_join_requests: number;
//   };
//   peopleInterested: number;
//   city: string;
//   zip: string;
//   images: Image[];
//   comments: Comments;
//   added_by_user: AddedByUser;
// }
// export interface AddedByUser {
//   id: string;
//   name: string;
//   profile_picture: string;
//   location: string;
//   about_me: string;
// }

// export interface Image {
//   url: string;
// }

// export interface Comments {
//   items: number;
//   type: string;
//   data: CommentData[];
// }

// export interface CommentData {
//   id: string;
//   comment: string;
//   rating: number;
//   added_by: string;
//   name: string;
//   profile_picture: string;
//   created_at: string;
// }

// export interface Likes {
//   items: number;
//   type: string;
//   data: LikeData[];
// }

// export interface LikeData {
//   id: string;
//   like_dislike: boolean;
//   added_by: string;
//   name: string;
//   profile_picture: string;
//   created_at: string;
// }

// function ratingColorScheme(rating: number) {
//   switch (rating) {
//     case 5:
//       return "teal";
//     case 4:
//       return "green";
//     case 3:
//       return "yellow";
//     case 2:
//       return "orange";
//     case 1:
//       return "red";
//     default:
//       return "gray";
//   }
// }

// function UserComment({ commentItem }: { commentItem: CommentData }) {
//   const defaultProfilePicture="/account.png";
//   const profilePicture = commentItem?.profile_picture && !commentItem.profile_picture.toLowerCase().includes("null")
//     ? commentItem.profile_picture
//     : defaultProfilePicture;

//   return (
//     <Box display={"flex"} gap={"15px"} alignItems={"flex-start"}>
//       <Image src={profilePicture} w={"48px"} h={"48px"} borderRadius={"50%"} objectFit={"cover"} />
//       <Box display={"flex"} flexDir={"column"} w="full" gap={"8px"} maxWidth={"570px"}>
//         <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} gap="8px">
//           <Text fontSize={"16px"} fontWeight={"600"} color="#334155">
//             {commentItem?.name}
//           </Text>
//           <Text fontSize={"14px"} color="#64748B">
//             {dayjs(commentItem?.created_at).fromNow()}
//           </Text>
//         </Box>
//         <Box display={"flex"} alignItems={"center"} gap="8px">
//           {Array.from({ length: 5 }).map((_, i) => {
//             return (
//               <StarIcon
//                 key={i}
//                 width="20px"
//                 height="20px"
//                 fill={i + 1 <= commentItem?.rating ? "#f9690e" : "#CBD5E1"}
//               />
//             );
//           })}
//         </Box>
//         <Text fontSize={"14px"} bgColor="#F1F5F9" color={"#334155"} p="15px" borderRadius={"6px"}>
//           {commentItem?.comment}
//         </Text>
//       </Box>
//     </Box>
//   );
// }





// interface QuillOutputProps {
//   htmlContent: string;
//   [key: string]: any; // This allows other props to be passed in, such as style or className
// }

// const QuillOutput = ({ htmlContent, ...props }: QuillOutputProps) => {
//   return (
//     <div
//       dangerouslySetInnerHTML={{ __html: htmlContent }}
//       {...props}
//       className={clsx(
//         "box-border leading-[1.42] h-full overflow-y-auto text-left whitespace-pre-wrap px-[18px] py-0", // .ql-editor styles
//         // Styling for headings
//         "[&>h1]:text-[2em] [&>h1]:font-[bold] [&>h1]:text-black [&>h1]:mb-[0.5em]",
//         "[&>h2]:text-[1.5em] [&>h2]:font-[bold] [&>h2]:text-black [&>h2]:mb-[0.5em]",
//         "[&>h3]:text-[1.17em] [&>h3]:font-[bold] [&>h3]:text-black [&>h3]:mb-[0.5em]",
//         "[&>h4]:text-[1em] [&>h4]:font-[bold] [&>h4]:text-black [&>h4]:mb-[0.5em]",
//         "[&>h5]:text-[0.83em] [&>h5]:font-[bold] [&>h5]:mb-[0.5em]",
//         "[&>h6]:text-[0.67em] [&>h6]:font-[bold] [&>h6]:mb-[0.5em]",
//         // Blockquote styling
//         "[&>blockquote]:my-[5px] [&>blockquote]:pl-4 [&>blockquote]:border-l-4 [&>blockquote]:border-l-[#ccc] [&>blockquote]:border-solid",
//         // Paragraphs and lists
//         "[&>p]:m-0 [&>p]:p-0",
//         "[&>ul]:list-none [&>ul]:m-0 [&>ul]:p-0 [&>ul>li::before]:content-['•'] [&>ul>li::before]:mr-2",
//         "[&>ol]:list-none [&>ol]:m-0 [&>ol]:p-0 [&>ol>li::before]:counter(item)_'.'_ [&>ol>li::before]:mr-2 [&>ol>li]:counter-increment-[item]",
//         // Table styling
//         "[&>table]:border-spacing-0 [&>table]:my-[5px] [&>table]:border-collapse",
//         "[&>table>td]:border [&>table>td]:p-[5px] [&>table>td]:border-solid [&>table>td]:border-[#ccc]",
//         "[&>table>th]:border [&>table>th]:p-[5px] [&>table>th]:border-solid [&>table>th]:border-[#ccc]"
//       )}
//     />
//   );
// };
// function QuillOutputOld({
//   htmlContent,
//   ...props
// }: {
//   htmlContent: TrustedHTML | string;
//   props: BoxProps | PropsWithChildren;
// }) {
//   return (
//     <Box
//       dangerouslySetInnerHTML={{ __html: htmlContent }}
//       {...props}
//       // className={styles.QuillOutputHTML}
//     />
//   );
// }


// function PostDetailsSkeleton() {
//   return (
//     <>
//       <Box
//         maxWidth={"1440px"}
//         mx={"auto"}
//         display={"flex"}
//         flexDir={{
//           base: "column",
//           md: "row",
//         }}
//       >
//         {/* Left side content */}
//         <Box w={"full"}>
//           <Box position={"relative"} px={{ base: "20px", md: "30px" }} borderBottom={"1px solid #E2E8F0"} flex={"1"}>
//             {/* Title and Subtitle */}
//             <Skeleton height="32px" width="300px" mt={"32px"} />
//             <SkeletonText noOfLines={2} spacing="4" mt="8px" width="600px" />

//             {/* Author, comments, likes, share */}
//             <Box
//               gap={"20px"}
//               display={"flex"}
//               flexDir={{
//                 base: "column",
//                 md: "row",
//               }}
//               w={"full"}
//               justifyContent={{
//                 base: "center",
//                 md: "space-between",
//               }}
//               mt={"38px"}
//               pb={"20px"}
//             >
//               <Flex gap="11px" alignItems="center">
//                 <SkeletonCircle size="48px" />
//                 <Skeleton height="20px" width="200px" />
//               </Flex>

//               {/* Interaction buttons */}
//               <Flex gap="32px" alignItems="center" flexWrap={"wrap"}>
//                 <Skeleton height="20px" width="100px" />
//                 <Skeleton height="20px" width="100px" />
//                 <Skeleton height="20px" width="100px" />
//                 <Skeleton height="20px" width="100px" />
//               </Flex>
//             </Box>
//           </Box>

//           {/* Images Grid Skeleton */}
//           <Grid
//             templateRows={"repeat(2,1fr)"}
//             templateColumns={"repeat(4,1fr)"}
//             gap={"12px"}
//             px={{ base: "20px", md: "30px" }}
//             py={"42px"}
//           >
//             {Array.from({ length: 4 }).map((_, i) => (
//               <GridItem key={i} colSpan={i === 0 ? 2 : 1} rowSpan={i === 0 ? 2 : 1}>
//                 <Skeleton height="200px" width="full" borderRadius={"12px"} />
//               </GridItem>
//             ))}
//           </Grid>

//           {/* Description Skeleton */}
//           <Box py={"30px"} px={{ base: "20px", md: "30px" }} borderBottom={"1px solid #E2E8F0"}>
//             <SkeletonText noOfLines={5} spacing="4" />
//           </Box>

//           {/* Created by Section */}
//           <Box px={{ base: "20px", md: "30px" }} py={"30px"} borderBottom={"1px solid #E2E8F0"}>
//             <SkeletonText noOfLines={1} width="150px" mb={"30px"} />
//             <Flex gap="11px" alignItems="center">
//               <SkeletonCircle size="48px" />
//               <SkeletonText noOfLines={2} spacing="4" width="200px" />
//             </Flex>
//           </Box>

//           {/* Comments and Rating */}
//           <Box px={{ base: "20px", md: "30px" }} py={"30px"}>
//             <SkeletonText noOfLines={1} width="200px" mb={"30px"} />
//             <Flex gap="16px" mb="60px">
//               <SkeletonCircle size="48px" />
//               <SkeletonText noOfLines={3} spacing="4" width="full" />
//             </Flex>

//             {/* Rating Section */}
//             <Box mb="40px" display={"flex"} alignItems={"center"} gap="30px" justifyContent={"flex-start"}>
//               <Skeleton height="50px" width="80px" />
//               <Skeleton height="30px" width="300px" />
//             </Box>

//             {/* Comments list */}
//             <Stack spacing={5}>
//               {Array.from({ length: 2 }).map((_, i) => (
//                 <Flex key={i} gap="16px">
//                   <SkeletonCircle size="48px" />
//                   <SkeletonText noOfLines={3} spacing="4" width="full" />
//                 </Flex>
//               ))}
//             </Stack>
//           </Box>
//         </Box>

//         {/* Right sidebar */}
//         <Box
//           w={"full"}
//           maxWidth={{
//             base: "full",
//             md: "350px",
//           }}
//           bgColor={"#FFF"}
//           borderLeft={"1px solid #E2E8F0"}
//         >
//           <Skeleton height="40px" width="150px" mb="10px" />

//           <Box px="20px" py="10px" borderBottom="1px solid #E2E8F0">
//             <Skeleton height="20px" width="200px" mb="10px" />
//             <Skeleton height="20px" width="150px" />
//           </Box>

//           <Box px="20px" py="10px" borderBottom="1px solid #E2E8F0">
//             <Skeleton height="20px" width="150px" mb="10px" />
//             <Skeleton height="20px" width="100px" />
//           </Box>

//           <Box px="20px" py="10px" borderBottom="1px solid #E2E8F0">
//             <Skeleton height="20px" width="200px" mb="10px" />
//             <Skeleton height="20px" width="150px" />
//           </Box>

//           {/* Rules Section */}
//           <Box
//             fontSize={"16px"}
//             fontWeight={"600"}
//             borderBottom={"1px solid #E2E8F0"}
//             color="#475569"
//             px="20px"
//             py={"10px"}
//           >
//             <Skeleton height="20px" width="100px" />
//           </Box>
//         </Box>
//       </Box>
//     </>
//   );
// }



// export default function ViewPost() {
//   const { data: session } = useSession();
//   const socket = useSocket();

//   const [accessToken, setAccessToken] = useState<string | null>(null);

//   const [postData, setPostData] = useState<PostData | null>(null);
//   const [userData, setUserData] = useState<UserData | null>(null);
//   const [postUserData, setPostUserData] = useState<AddedByUser | null>(null);
//   const [isMember, setIsMember] = useState(false);
//   const [activityFull, setActivityFull] = useState(false);
//   const [isStarted, setActivityStarted] = useState(false);
//   const [isEnded, setActivityEnded] = useState(false);
//   const [isAlreadyRequested, setIsAlreadyRequested] = useState(false);
//   const [commentData, setCommentData] = useState<CommentData[] | null>(null);
//   const [commentRating, setCommentRating] = useState(0);
//   const [ratingCounts, setRatingCounts] = useState<{
//     1: number;
//     2: number;
//     3: number;
//     4: number;
//     5: number;
//   }>({
//     1: 0,
//     2: 0,
//     3: 0,
//     4: 0,
//     5: 0,
//   });
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [buttonLoading, setButtonLoading] = useState(true);
//   const [isLoading, setIsLoading] = useState(true);
//   const { id } = useParams();
//   // Effect to set accessToken when session changes
//   useEffect(() => {
//     if (session?.accessToken) {
//       setAccessToken(session.accessToken as string);
//     } else {
//       setAccessToken(null);
//     }
//   }, [session]);

//   useEffect(() => {
//     const fetchUserData = async () => {
//       try {
//         if (session) {
//           const userRes = await axios.get(`/api/user/me`, {
//             withCredentials: true,
//           });
//           setUserData(userRes.data);
//         }
//       } catch (error) {
//         console.error(error);
//       }
//     };
//     fetchUserData();
//   }, [session]);
//   const handleActionEmit = (actionType: string, activityId: string) => {
//     if (socket && session) {
//       socket.emit("user_action", {
//         userId: session.user.id,
//         activityId,
//         actionType,
//       });
//     }
//   };
//   const handleLikeEmit = (activityId: string) => {
//     handleActionEmit("like", activityId);
//   };
//   const handleCommentEmit = (activityId: string) => {
//     handleActionEmit("comment", activityId);
//   };

//   const handleJoinRequestEmit = (activityId: string) => {
//     handleActionEmit("activity_join", activityId);
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         setButtonLoading(true); // Start loading immediately

//         const resPost = await axios.get(`/api/public/activities/${id}`);
//         const resPosts: Posts = resPost.data;

//         if (resPosts && resPosts.items === 1) {
//           const resPostItem = resPosts.data[0];
//           setPostData(resPostItem);
//           setPostUserData(resPostItem.added_by_user);

//           const resComments = resPostItem.comments;
//           if (resComments && resComments.items > 0) {
//             setCommentData(resComments.data);

//             let totalRating = 0;
//             const ratingCounter: { [key: string]: number } = {
//               1: 0,
//               2: 0,
//               3: 0,
//               4: 0,
//               5: 0,
//             };

//             resComments.data.forEach((comment) => {
//               totalRating += comment.rating;
//               ratingCounter[comment.rating.toString()] += 1;
//             });

//             setCommentRating(totalRating / resComments.data.length);
//             setRatingCounts(ratingCounter as any);
//           }

//           if (session) {
//             try {
//               const statusResponse = await axios.get(`/api/activity_join/${id}/is-member`, {
//                 withCredentials: true,
//               });
//               const { isMember, isStarted, isEnded, isAlreadyRequested } = statusResponse.data;
//               setIsMember(isMember);
//               setActivityStarted(isStarted);
//               setActivityEnded(isEnded);
//               setIsAlreadyRequested(isAlreadyRequested);
//               setActivityFull(resPostItem.peopleInterested >= resPostItem.max_participants);
//             } catch (statusError) {
//               console.error("Error fetching membership status:", statusError);
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching post data:", error);
//       } finally {
//         setIsLoading(false);
//         setButtonLoading(false); // Ensure loading is false after fetching (success or error)
//       }
//     };

//     fetchData();
//   }, [session, id]);


//   // Calculate total comments for percentage calculations
//   const totalComments = commentData ? commentData.length : 0;
//   const getPercentage = (rating: 1 | 2 | 3 | 4 | 5) => {
//     if (totalComments === 0) return 0;
//     return (ratingCounts[rating] / totalComments) * 100;
//   };

//   const [newCommentData, setNewCommentData] = useState({
//     comment: "",
//     rating: 0,
//   });
//   const [loading, setLoading] = useState(false);
//   const [slider, setSlider] = useState(0);
//   const toast = useToast();

//   dayjs.extend(relativeTime);

//   //const navigate = useNavigate();
//   const router = useRouter();

//   async function handleJoin() {
//     setIsProcessing(true);
//     try {
//       if (session) {
//         const response = await axios.post(`/api/activity_join/${id}`, {
//           withCredentials: true,
//         });

//         if (response.status === 200) {
//           handleJoinRequestEmit(`${id}`);
//           toast({
//             title: "Join request Send",
//             status: "success",
//             duration: 3000,
//             isClosable: true,
//           });

//           // Refetch the request data to update the UI
//           router.refresh();
//         } else {
//           throw new Error(response.data.error || "Action failed");
//         }
//       } else {
//         toast({
//           title: "Login Error",
//           description: `You must login to Join`,
//           status: "error",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "An error occurred",
//         status: "error",
//         duration: 3000,
//         isClosable: true,
//       });
//       router.refresh();
//       console.error(error);
//     } finally {
//       setIsProcessing(false);
//     }
//   }

//   const handleSubmitComment = async () => {
//     if (session) {
//       if (!newCommentData.comment || newCommentData.rating === 0) {
//         toast({
//           title: "Error.",
//           description: "Please provide both a comment and a rating.",
//           status: "error",
//         });
//         return;
//       }

//       try {
//         const res = await axios.post(
//           `/api/public/activities/${id}/comments`, // Replace with the correct activityId
//           {
//             comment: newCommentData.comment,
//             rating: newCommentData.rating,
//           },
//           {
//             withCredentials: true,
//           }
//         );

//         const data = await res.data;
//         //socketemit
//         handleCommentEmit(`${id}`);

//         const resCommentData: CommentData = data?.commentData;
//         if (resCommentData) {
//           // Add the new comment to the commentData array
//           setCommentData((prevCommentData) => {
//             if (prevCommentData) {
//               return [...prevCommentData, resCommentData]; // Append the new comment
//             } else {
//               return [resCommentData]; // If there are no comments yet, initialize with the new comment
//             }
//           });

//           // Clear the comment form
//           setNewCommentData({
//             comment: "",
//             rating: 0,
//           });

//           toast({
//             title: "Comment Added.",
//             description: "Your comment has been added successfully.",
//             status: "success",
//           });
//         }
//       } catch (error) {
//         toast({
//           title: "Error.",
//           description: `${error?.response?.data?.message || error?.message}`,
//           status: "error",
//         });
//         console.error(error);
//       }
//     } else {
//       toast({
//         title: "Login Error",
//         description: `You must login to add Feedback`,
//         status: "error",
//       });
//     }
//   };

//   const timePosted = dayjs(postData?.created_at).fromNow();

//   const [likes, setLikes] = useState(0);
//   const [dislikes, setDislikes] = useState(0);
//   // Function to fetch likes and dislikes count
//   const fetchLikesDislikes = async () => {
//     try {
//       const likeRes = await axios.get(`/api/public/activities/${postData?.id}/like`, { withCredentials: true });
//       const dislikeRes = await axios.get(`/api/public/activities/${postData?.id}/dislike`, { withCredentials: true });

//       const likeCount = likeRes.data.count || 0;
//       const dislikeCount = dislikeRes.data.count || 0;

//       setLikes(likeCount);
//       setDislikes(dislikeCount);
//     } catch (error) {
//       console.error("Error fetching like/dislike counts", error);
//     }
//   };

//   // Fetch likes and dislikes when the component is mounted
//   useEffect(() => {
//     if (postData?.id) {
//       fetchLikesDislikes();
//     }
//   }, [postData?.id]);

//   // Function to handle like action
//   const handleLikePost = async () => {
//     try {
//       if (session) {
//         // Toggle like using the POST route
//         await axios.post(`/api/public/activities/${postData?.id}/like`, {}, { withCredentials: true });

//         // Re-fetch the updated counts for likes and dislikes
//         handleLikeEmit(`${id}`);
//         fetchLikesDislikes();
//       } else {
//         toast({
//           title: "Login Error",
//           description: `You must login to Like/Dislike`,
//           status: "error",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error.",
//         description: `${error?.response?.data?.message || error?.message}`,
//         status: "error",
//       });
//       console.error(error);
//     }
//   };

//   // Function to handle dislike action
//   const handleDisLikePost = async () => {
//     try {
//       if (session) {
//         // Toggle dislike using the POST route
//         await axios.post(`/api/public/activities/${postData?.id}/dislike`, {}, { withCredentials: true });

//         // Re-fetch the updated counts for likes and dislikes
//         fetchLikesDislikes();
//       } else {
//         toast({
//           title: "Login Error",
//           description: `You must login to Like/Dislike`,
//           status: "error",
//         });
//       }
//     } catch (error) {
//       toast({
//         title: "Error.",
//         description: `${error?.response?.data?.message || error?.message}`,
//         status: "error",
//       });
//       console.error(error);
//     }
//   };
//   // if (!user && isUserFetched) return router.push("/login");
//   //  if (isLoading || !postData || !session) {

//   const commentsRef = useRef(null);

// // Add this function at the top level of your component
// const scrollToComments = () => {
//   commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
// };

//   if (!postData) {
//     return <PostDetailsSkeleton />;
//   }

//   const handleReport = () => {
//     router.push('/contact-us', undefined, { shallow: true });
//   };

//   const getProfileLink = (userId: string) => {
//     if (session?.user?.id === userId) {
//       return "/profile/me";
//     }
//     return `/profile/${userId}`;
//   };

//   let defaultImage = "/account.png"
//   const imageUrl = userData?.profile_pic == null || userData?.profile_pic === "" ? defaultImage : userData?.profile_pic;

//   return (
//     <>
//       <Box
//         //16inch
//         maxWidth={"1440px"}
//         mx={"auto"}
//         display={"flex"}
//         flexDir={{
//           base: "column",
//           md: "row",
//         }}
//       >
//         <Box w={"full"}>
//           <Box position={"relative"} px={{ base: "20px", md: "30px" }} borderBottom={"1px solid #E2E8F0"} flex={"1"}>
//             <Heading size={"lg"} fontWeight={"700"} color="#334155" mt={"32px"}>
//               {postData?.title}
//             </Heading>
//             <Text fontSize={"18px"} color="#94A3B8" maxWidth={"600px"} fontWeight={"500"} mt={"8px"}>
//               {postData?.sub_title}
//             </Text>

//           </Box>
//           {postData?.images?.length > 0 ? (
//   <Grid
//     templateRows={"repeat(2,1fr)"}
//     templateColumns={"repeat(4,1fr)"}
//     gap={"12px"}
//     px={{ base: "20px", md: "30px" }}
//     py={"42px"}
//   >
//     {postData?.images.map((image, i) => {
//       return (
//         <GridItem key={i} colSpan={i === 0 ? 2 : 1} rowSpan={i === 0 ? 2 : 1}>
//           <Image
//             src={image.url}
//             w={"full"}
//             h={"full"}
//             borderRadius={"12px"}
//             objectFit={"cover"}
//             fallbackSrc="/placeholder.png" // Add fallbackSrc prop
//             onError={(e) => {
//               e.target.onerror = null; // Prevent infinite loop
//               e.target.src = "/placeholder.png";
//             }}
//           />
//         </GridItem>
//       );
//     })}
//   </Grid>
// ) : (
//   <Grid
//     px={{ base: "20px", md: "30px" }}
//     py={"42px"}
//     display="flex"
//     justifyContent="center"
//     alignItems="center"
//   >
//     <Image
//       src="/placeholder.png"
//       w={{ base: "80%", md: "50%" }} // Adjust width as needed
//       h="auto"
//       borderRadius={"12px"}
//       objectFit={"cover"}
//     />
//   </Grid>
// )}
//           <Box
//             py={"30px"}
//             px={{ base: "20px", md: "30px" }}
//             display={"flex"}
//             justifyContent={"flex-start"}
//             className=""
//             maxWidth={"745px"}
//             borderBottom={"1px solid #E2E8F0"}
//           >
//             {postData?.description && (
//               <QuillOutput
//                 htmlContent={postData?.description}
//                 className="ql-editor"
//                 fontSize={"16px"}
//                 color={"#64748B"}
//               />
//             )}
//           </Box>


//             <Box>
//               <Text mb={"20px"}  fontSize={"24px"} color={"#1E293B"} fontWeight={"700"} px={{ base: "20px", md: "30px" }}>
//                 Rating and feedback ({commentData?.length ? commentData?.length : 0})
//               </Text>
//               <Box px={{ base: "20px", md: "30px" }} py={"30px"} ref={commentsRef}>

//             {session ? (
//               isMember ? (
//                 <Box display={"flex"} alignItems={"flex-start"} justifyContent={"flex-start"} gap="16px" mb={"60px"}>
//                   <Image src={imageUrl} w={"48px"} h={"48px"} borderRadius={"50%"} objectFit={"cover"} />
//                   <Box display={"flex"} flexDir={"column"} w="full" gap={"16px"}>
//                     <Box display={"flex"} alignItems={"center"} gap="8px">
//                       {Array.from({ length: 5 }).map((_, i) => {
//                         return (
//                           <StarIcon
//                             key={i}
//                             width="22px"
//                             height="22px"
//                             fill={i < newCommentData.rating ? "#f9690e" : "#CBD5E1"}
//                             onClick={() => {
//                               setNewCommentData({ ...newCommentData, rating: i + 1 });
//                             }}
//                           />
//                         );
//                       })}
//                     </Box>
//                     <Textarea
//                       placeholder="Write your feedback..."
//                       w={"full"}
//                       maxWidth={"600px"}
//                       outline={"1px solid #CBD5E1"}
//                       borderRadius={"3px"}
//                       h={"85px"}
//                       bgColor={"#FFF"}
//                       onChange={(e) => {
//                         setNewCommentData({
//                           ...newCommentData,
//                           comment: e.target.value,
//                         });
//                       }}
//                       value={newCommentData.comment}
//                     />

//                     <Box w={"auto"}>
//                       <Box
//                         as="button"
//                         py={"8px"}
//                         px="20px"
//                         display={"inline-block"}
//                         bgColor={"#f9690e"}
//                         borderRadius={"3px"}
//                         color={"#FFF"}
//                         onClick={handleSubmitComment}
//                       >
//                         Comment
//                       </Box>
//                     </Box>
//                   </Box>
//                 </Box>
//               ) : (
//                 <Text mb={"30px"} fontSize={"16px"} color="gray.500">
//                   Join the activity to add your comment.
//                 </Text>
//               )
//             ) : (
//               <Text mb={"30px"} fontSize={"16px"} color={"#1E293B"}>
//                 Log in to add a comment.
//               </Text>
//             )}
//               <Box mb="40px" display={"flex"} alignItems={"center"} gap="30px" justifyContent={"flex-start"}>
//                 <Box display={"flex"} flexDir={"column"}>
//                   <Box display={"flex"} alignItems={"center"} gap="18px">
//                     <Text fontSize={"57px"} color="#334155">
//                       {commentRating.toFixed(1)}
//                     </Text>
//                     <Text fontSize={"14px"} color="#64748B">
//                       Avg <span style={{ display: "block" }}>Rating</span>
//                     </Text>
//                   </Box>
//                   <Box display={"flex"} alignItems={"center"} gap="8px">
//                     {Array.from({ length: 5 }).map((_, i) => {
//                       return <StarIcon key={i} width="22px" height="22px" fill="#CBD5E1" />;
//                     })}
//                   </Box>
//                 </Box>
//                 <Box display={"flex"} flexDir={"column"} w="full">
//                   {/* Rating Progress Bars */}
//                   {[5, 4, 3, 2, 1].map((rating) => (
//                     <Box display={"flex"} alignItems={"center"} gap="10px" key={rating}>
//                       <Text color={"#64748B"}>{rating}</Text>
//                       <Progress
//                         height={"6px"}
//                         value={getPercentage(rating)}
//                         w={"full"}
//                         borderRadius={99}
//                         colorScheme={ratingColorScheme(rating)} 
//                         maxWidth={"300px"}
//                       />
//                       <Text color={"#64748B"}>({ratingCounts[rating]})</Text>
//                     </Box>
//                   ))}
//                 </Box>
//               </Box>
//               <Box display={"flex"} flexDir={"column"} gap={"30px"} mb={"60px"}>
//                 {commentData &&
//                   commentData?.length > 0 &&
//                   commentData.map((commentItem, i) => {
//                     return <UserComment key={i} commentItem={commentItem} />;
//                   })}
//               </Box>
//             </Box>
//           </Box>
//         </Box>
//         <Box
//           w={"full"}
//           maxWidth={{
//             base: "full",
//             md: "350px",
//           }}
//           bgColor={"#FFF"}
//           borderLeft={"1px solid #E2E8F0"}
//         >
//           <Text
//             fontSize={"18px"}
//             fontWeight={"700"}
//             borderBottom={"1px solid #E2E8F0"}
//             color="#0F172A"
//             px="20px"
//             py={"10px"}
//           >
//             Post Details
//           </Text>
//           <Box
//             px="20px"
//             py={"10px"}
//             borderBottom={"1px solid #E2E8F0"}
//             display={"flex"}
//             flexDir={"column"}
//             gap={"15px"}
//           >
//             <Box py={"20px"} borderBottom={"1px solid #E2E8F0"}>
//   <Text fontSize={"16px"} color="#94A3B8" mb={"15px"}>
//     Created By
//   </Text>
//   <Link href={getProfileLink(postUserData?.id || '')} style={{ textDecoration: "none" }}>
//     <Box display={"flex"} alignItems={"flex-start"} gap="11px">
//       <Image
//         src={
//           postUserData?.profile_picture && !postUserData.profile_picture.toLowerCase().includes("null")
//             ? postUserData.profile_picture
//             : "/account.png"
//         }
//         objectFit={"cover"}
//         w={"48px"}
//         h={"48px"}
//         borderRadius={"50%"}
//       />
//       <Box display={"flex"} flexDir={"column"} gap={"8px"}>
//         <Text fontSize={"16px"} fontWeight={"600"} color="#334155">
//           {postUserData?.name}
//         </Text>
//         <Text fontSize={"15px"} fontWeight={"500"} color="#94A3B8">
//           {postUserData?.about_me}
//         </Text>
//       </Box>
//     </Box>
//   </Link>
// </Box>

//             <Box>
//               <Text fontSize={"14px"} color="#94A3B8" mb={"5px"}>
//                 ZIP Code / Location:
//               </Text>
//               <Text fontSize={"14px"} color="#334155" mb={"5px"}>
//                 {postData?.zip} / {postData?.city}
//               </Text>
//             </Box>
//             <Box>
//               <Text fontSize={"14px"} color="#94A3B8" mb={"5px"}>
//                 Joined / Total:
//               </Text>
//               <Text fontSize={"14px"} color="#334155" mb={"5px"}>
//                 {postData?.peopleInterested} / {postData?.max_participants}
//               </Text>
//             </Box>
//             <Box>
//               <Text fontSize={"14px"} color="#94A3B8" mb={"5px"}>
//                 Created At
//               </Text>
//               <Text fontSize={"14px"} color="#334155" mb={"5px"}>
//                 {dayjs(postData?.created_at).format("DD MMM YYYY")}
//               </Text>
//             </Box>
//           </Box>
//           <Box
//             fontSize={"16px"}
//             fontWeight={"600"}
//             borderBottom={"1px solid #E2E8F0"}
//             color="#475569"
//             px="20px"
//             py={"10px"}
//           >
//             Rules:
//           </Box>
//           {postData?.rules?.length > 0 && (
//             <Box
//               px="20px"
//               py={"10px"}
//               borderBottom={"1px solid #E2E8F0"}
//               display={"flex"}
//               flexDir={"column"}
//               gap={"15px"}
//             >
//               {`${postData?.rules}`.split(",").map((rule: string, i) => {
//                 return (
//                   <Box key={i} display={"flex"} alignItems={"center"} gap="8px">
//                     <Text fontSize={"14px"} color="#94A3B8">
//                       {i + 1}. {rule}
//                     </Text>
//                   </Box>
//                 );
//               })}
//             </Box>
//           )}
//         </Box>
//       </Box>
//       <Box
//   w="100%"
//   px={{ base: "20px", md: "30px" }}
//   bg="white"
//   borderTop="1px solid #E2E8F0"
//   boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.1)"
//   position="sticky"
//   bottom="0"
//   left="0"
//   right="0"
//   mt="auto"
// >
//   <Box
//     display="flex"
//     flexDir={{
//       base: "column",
//       md: "row",
//     }}
//     gap="10px"
//     justifyContent="space-between"
//     py="20px"
//     bg="white"
//     maxWidth="1440px"
//     margin="0 auto"
//   >

//     <Box display={{ base: "none", md: "flex" }} alignItems="flex-start" justifyContent="flex-start" gap="11px">
//   <Link href={getProfileLink(postUserData?.id || '')} style={{ textDecoration: "none" }}>
//     <Box display="flex" alignItems="flex-start" gap="11px" cursor="pointer">
//       <Image
//         src={
//           postUserData?.profile_picture && !postUserData.profile_picture.toLowerCase().includes("null")
//             ? postUserData.profile_picture
//             : "/account.png"
//         }
//         w="48px"
//         h="48px"
//         borderRadius="50%"
//         objectFit="cover"
//       />
//       <Box display="flex" flexDir="column">
//         <Text fontSize="16px" fontWeight="600" color="#334155">
//           By {postUserData?.name}
//         </Text>
//         <Text fontSize="14px" color="#94A3B8">
//           Published about {timePosted}
//         </Text>
//         <Text fontSize="14px" color="#94A3B8">
//           {`Category: Posts`}
//         </Text>
//       </Box>
//     </Box>
//   </Link>
// </Box>


//     {/* Desktop View - Actions */}
//     <Box display={{ base: "none", md: "flex" }} flexWrap="wrap" alignItems="center" gap="32px">
//       <Box display="flex" alignItems="center" gap="8px" onClick={scrollToComments} cursor="pointer">
//         <MessagesIcon stroke="#64748B" width="22px" height="22px" />
//         <Text fontSize="14px" color="#64748B">
//           Comments: {commentData?.length ? commentData?.length : 0}
//         </Text>
//       </Box>
//       <Box
//         display="flex"
//         alignItems="center"
//         gap="8px"
//         onClick={handleLikePost}
//         p={2}
//         borderRadius="99px"
//         _hover={{
//           cursor: "pointer",
//           bgColor: "#E2E8F0",
//         }}
//       >
//         <LikeIcon stroke="#f9690e" width="22px" height="22px" />
//         <Text fontSize="14px" color="#64748B">
//           {likes}
//         </Text>
//       </Box>
//       <Box
//         display="flex"
//         alignItems="center"
//         gap="8px"
//         onClick={handleDisLikePost}
//         p={2}
//         borderRadius="99px"
//         _hover={{
//           cursor: "pointer",
//           bgColor: "#E2E8F0",
//         }}
//       >
//         <DislikeIcon stroke="#334155" width="22px" height="22px" />
//         <Text fontSize="14px" color="#64748B">
//           {dislikes}
//         </Text>
//       </Box>
//       <RWebShare
//         data={{
//           text: "Checkout this post",
//           url: `/posts/${id}`,
//           title: `${postData?.title} - ${postData?.sub_title}`,
//         }}
//       >
//         <Box
//           p={2}
//           display="flex"
//           alignItems="center"
//           gap="8px"
//           borderRadius="99px"
//           _hover={{ cursor: "pointer", bgColor: "#E2E8F0" }}
//         >
//           <Share2Icon width="22px" height="22px" stroke="#334155" />
//           <Text fontSize="14px" color="#64748B">
//             Share
//           </Text>
//         </Box>
//       </RWebShare>
//       <Box display="flex" alignItems="center" gap="8px" onClick={handleReport} cursor="pointer">
//         <ReportIcon stroke="#334155" width="20px" height="20px" />
//         <Text fontSize="14px" color="#64748B">
//           Report
//         </Text>
//       </Box>
//       <Box
//   as="button"
//   py="5px"
//   px="30px"
//   fontSize="16px"
//   fontWeight="500"
//   display="inline-flex"
//   alignItems="center"
//   justifyContent="center"
//   bgColor={
//     buttonLoading
//       ? "#D1D5DB" // Show a loading background
//       : activityFull
//       ? "#D1D5DB"
//       : isAlreadyRequested
//       ? "#D1D5DB" // Indicate already requested
//       : "#f9690e"
//   }
//   borderRadius="3px"
//   color="white"
//   _hover={
//     buttonLoading
//       ? {}
//       : activityFull
//       ? {}
//       : isAlreadyRequested // No hover effect when already requested
//       ? {}
//       : { bgColor: "#DD6B20" }
//   }
//   disabled={isProcessing || activityFull || isStarted || isEnded || buttonLoading || isAlreadyRequested} // Disable when already requested
//   onClick={isMember ? () => router.push('/messages') : handleJoin}
// >
//   {buttonLoading ? (
//     <Spinner size="sm" mr={2} />
//   ) : isProcessing ? (
//     <Spinner size="sm" mr={2} />
//   ) : null}
//   {activityFull
//     ? "Activity Full"
//     : isStarted || isEnded
//     ? "Activity Started/Ended"
//     : isMember
//     ? "Message"
//     : isAlreadyRequested // Show "Requested"
//     ? "Requested"
//     : "Join"}
// </Box>
//     </Box>

//     {/* Mobile View */}
//     <Box 
//       display={{ base: "flex", md: "none" }} 
//       w="100%" 
//       justifyContent="space-between" 
//       alignItems="center"

//     >
//       {/* Join Button */}
//       <Box
//   as="button"
//   py="8px"
//   px="12px" // Slightly reduce padding
//   fontSize="14px" // Slightly reduce font size
//   fontWeight="500"
//   onClick={isMember ? () => router.push('/messages') : handleJoin}
//   display="flex"
//   alignItems="center"
//   justifyContent="center"
//   bgColor={
//     buttonLoading
//       ? "#D1D5DB"
//       : activityFull
//       ? "#D1D5DB"
//       : isAlreadyRequested
//       ? "#D1D5DB" // Indicate already requested
//       : "#f9690e"
//   }
//   borderRadius="3px"
//   color="white"
//   _hover={
//     buttonLoading
//       ? {}
//       : activityFull
//       ? {}
//       : isAlreadyRequested // No hover effect when already requested
//       ? {}
//       : { bgColor: "#DD6B20" }
//   }
//   disabled={isProcessing || activityFull || isStarted || isEnded || buttonLoading || isAlreadyRequested} // Disable when already requested
//   h="40px"
//   w="45%"
// >
//   {buttonLoading ? (
//     <Spinner size="sm" mr={2} />
//   ) : isProcessing ? (
//     <Spinner size="sm" mr={2} />
//   ) : null}
//   {activityFull
//     ? "Full" // Shorter text for "Activity Full"
//     : isStarted
//     ? "Activity Started" // Show only "Started" if activity has started
//     : isEnded
//     ? "Activity Ended" // Show only "Ended" if activity has ended
//     : isMember
//     ? "Message"
//     : isAlreadyRequested // Show "Requested"
//     ? "Requested"
//     : "Join"}
// </Box>

//       {/* Menu Button */}
//       <Menu>
//         <MenuButton
//           as={IconButton}
//           aria-label="Options"
//           icon={<MenuIcon stroke="#334155" width="24px" height="24px" />}
//           variant="ghost"
//           _hover={{ bg: "#E2E8F0" }}
//           h="40px"
//           w="45%"
//         />
//         <MenuList py={4}>
//           {/* User Profile Info */}
//           <MenuItem closeOnSelect={false}>
//           <Box display="flex" alignItems="flex-start" gap="11px" w="100%">
//   <Link href={getProfileLink(postUserData?.id || '')} style={{ textDecoration: "none" }}>
//     <Image
//       src={
//         postUserData?.profile_picture && !postUserData.profile_picture.toLowerCase().includes("null")
//           ? postUserData.profile_picture
//           : "/account.png"
//       }
//       w="48px"
//       h="48px"
//       borderRadius="50%"
//       objectFit="cover"
//       cursor="pointer" // Makes the image clickable
//     />
//   </Link>
//   <Box display="flex" flexDir="column">
//     <Text fontSize="16px" fontWeight="600" color="#334155">
//       By {postUserData?.name}
//     </Text>
//     <Text fontSize="14px" color="#94A3B8">
//       Published about {timePosted}
//     </Text>
//     <Text fontSize="14px" color="#94A3B8">
//       {`Category / Sub-Category`}
//     </Text>
//   </Box>
// </Box>
// </MenuItem>

//           <MenuDivider />
//           <MenuItem onClick={scrollToComments}>
//             <Box display="flex" alignItems="center" gap="8px">
//               <MessagesIcon stroke="#64748B" width="22px" height="22px" />
//               <Text fontSize="14px" color="#64748B">
//                 Comments: {commentData?.length ? commentData?.length : 0}
//               </Text>
//             </Box>
//           </MenuItem>
//           <MenuItem onClick={handleLikePost}>
//             <Box display="flex" alignItems="center" gap="8px">
//               <LikeIcon stroke="#f9690e" width="22px" height="22px" />
//               <Text fontSize="14px" color="#64748B">
//                 {likes}
//               </Text>
//             </Box>
//           </MenuItem>
//           <MenuItem onClick={handleDisLikePost}>
//             <Box display="flex" alignItems="center" gap="8px">
//               <DislikeIcon stroke="#334155" width="22px" height="22px" />
//               <Text fontSize="14px" color="#64748B">
//                 {dislikes}
//               </Text>
//             </Box>
//           </MenuItem>
//           <MenuItem onClick={() => {
//             const shareData = {
//               text: "Checkout this post",
//               url: `/posts/${id}`,
//               title: `${postData?.title} - ${postData?.sub_title}`,
//             };
//             navigator.share(shareData);
//           }}>
//             <Box display="flex" alignItems="center" gap="8px">
//               <Share2Icon width="22px" height="22px" stroke="#334155" />
//               <Text fontSize="14px" color="#64748B">Share</Text>
//             </Box>
//           </MenuItem>
//           <MenuItem onClick={handleReport}>
//             <Box display="flex" alignItems="center" gap="8px">
//               <ReportIcon stroke="#334155" width="20px" height="20px" />
//               <Text fontSize="14px" color="#64748B">Report</Text>
//             </Box>
//           </MenuItem>
//         </MenuList>
//       </Menu>
//     </Box>
//   </Box>
// </Box>
//     </>
//   );
// }






/* eslint-disable jsx-a11y/alt-text */
//app/posts/[id]/page.tsx
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Box, BoxProps, Grid, GridItem, Heading, Image, Progress, Text, Textarea, useToast, Spinner } from "@chakra-ui/react";
import { Skeleton, SkeletonCircle, SkeletonText, Flex, Stack, Menu, MenuButton, MenuList, MenuItem, IconButton, MenuDivider } from "@chakra-ui/react";
import { Menu as MenuIcon } from 'lucide-react';

import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import { PropsWithChildren, useEffect, useState, useRef } from "react";

import { useParams } from "next/navigation";

import { RWebShare } from "react-web-share";
import { DislikeIcon, LikeIcon, MessagesIcon, ReportIcon, Share2Icon, StarIcon } from "@/components/Icons";
import Loading from "@/components/App/loading";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserData } from "@/app/profile/me/page";
import Link from "next/link";
import clsx from "clsx";
import { useSocket } from "@/app/socket";

export interface Posts {
  items: number;
  type: string;
  data: PostData[];
}
export interface PostData {
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
  confirmedParticipants: number;
  city: string;
  zip: string;
  images: Image[];
  comments: Comments;
  added_by_user: AddedByUser;
}
export interface AddedByUser {
  id: string;
  name: string;
  profile_picture: string;
  location: string;
  about_me: string;
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
  profile_dislike: string;
  created_at: string;
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
  const defaultProfilePicture = "/account.png";
  const profilePicture = commentItem?.profile_picture && !commentItem.profile_picture.toLowerCase().includes("null")
    ? commentItem.profile_picture
    : defaultProfilePicture;

  return (
    <Box display={"flex"} gap={"15px"} alignItems={"flex-start"}>
      <Image src={profilePicture} w={"48px"} h={"48px"} borderRadius={"50%"} objectFit={"cover"} />
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





interface QuillOutputProps {
  htmlContent: string;
  [key: string]: any; // This allows other props to be passed in, such as style or className
}

const QuillOutput = ({ htmlContent, ...props }: QuillOutputProps) => {
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
};
function QuillOutputOld({
  htmlContent,
  ...props
}: {
  htmlContent: TrustedHTML | string;
  props: BoxProps | PropsWithChildren;
}) {
  return (
    <Box
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      {...props}
    // className={styles.QuillOutputHTML}
    />
  );
}


function PostDetailsSkeleton() {
  return (
    <>
      <Box
        maxWidth={"1440px"}
        mx={"auto"}
        display={"flex"}
        flexDir={{
          base: "column",
          md: "row",
        }}
      >
        {/* Left side content */}
        <Box w={"full"}>
          <Box position={"relative"} px={{ base: "20px", md: "30px" }} borderBottom={"1px solid #E2E8F0"} flex={"1"}>
            {/* Title and Subtitle */}
            <Skeleton height="32px" width="300px" mt={"32px"} />
            <SkeletonText noOfLines={2} spacing="4" mt="8px" width="600px" />

            {/* Author, comments, likes, share */}
            <Box
              gap={"20px"}
              display={"flex"}
              flexDir={{
                base: "column",
                md: "row",
              }}
              w={"full"}
              justifyContent={{
                base: "center",
                md: "space-between",
              }}
              mt={"38px"}
              pb={"20px"}
            >
              <Flex gap="11px" alignItems="center">
                <SkeletonCircle size="48px" />
                <Skeleton height="20px" width="200px" />
              </Flex>

              {/* Interaction buttons */}
              <Flex gap="32px" alignItems="center" flexWrap={"wrap"}>
                <Skeleton height="20px" width="100px" />
                <Skeleton height="20px" width="100px" />
                <Skeleton height="20px" width="100px" />
                <Skeleton height="20px" width="100px" />
              </Flex>
            </Box>
          </Box>

          {/* Images Grid Skeleton */}
          <Grid
            templateRows={"repeat(2,1fr)"}
            templateColumns={"repeat(4,1fr)"}
            gap={"12px"}
            px={{ base: "20px", md: "30px" }}
            py={"42px"}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <GridItem key={i} colSpan={i === 0 ? 2 : 1} rowSpan={i === 0 ? 2 : 1}>
                <Skeleton height="200px" width="full" borderRadius={"12px"} />
              </GridItem>
            ))}
          </Grid>

          {/* Description Skeleton */}
          <Box py={"30px"} px={{ base: "20px", md: "30px" }} borderBottom={"1px solid #E2E8F0"}>
            <SkeletonText noOfLines={5} spacing="4" />
          </Box>

          {/* Created by Section */}
          <Box px={{ base: "20px", md: "30px" }} py={"30px"} borderBottom={"1px solid #E2E8F0"}>
            <SkeletonText noOfLines={1} width="150px" mb={"30px"} />
            <Flex gap="11px" alignItems="center">
              <SkeletonCircle size="48px" />
              <SkeletonText noOfLines={2} spacing="4" width="200px" />
            </Flex>
          </Box>

          {/* Comments and Rating */}
          <Box px={{ base: "20px", md: "30px" }} py={"30px"}>
            <SkeletonText noOfLines={1} width="200px" mb={"30px"} />
            <Flex gap="16px" mb="60px">
              <SkeletonCircle size="48px" />
              <SkeletonText noOfLines={3} spacing="4" width="full" />
            </Flex>

            {/* Rating Section */}
            <Box mb="40px" display={"flex"} alignItems={"center"} gap="30px" justifyContent={"flex-start"}>
              <Skeleton height="50px" width="80px" />
              <Skeleton height="30px" width="300px" />
            </Box>

            {/* Comments list */}
            <Stack spacing={5}>
              {Array.from({ length: 2 }).map((_, i) => (
                <Flex key={i} gap="16px">
                  <SkeletonCircle size="48px" />
                  <SkeletonText noOfLines={3} spacing="4" width="full" />
                </Flex>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* Right sidebar */}
        <Box
          w={"full"}
          maxWidth={{
            base: "full",
            md: "350px",
          }}
          bgColor={"#FFF"}
          borderLeft={"1px solid #E2E8F0"}
        >
          <Skeleton height="40px" width="150px" mb="10px" />

          <Box px="20px" py="10px" borderBottom="1px solid #E2E8F0">
            <Skeleton height="20px" width="200px" mb="10px" />
            <Skeleton height="20px" width="150px" />
          </Box>

          <Box px="20px" py="10px" borderBottom="1px solid #E2E8F0">
            <Skeleton height="20px" width="150px" mb="10px" />
            <Skeleton height="20px" width="100px" />
          </Box>

          <Box px="20px" py="10px" borderBottom="1px solid #E2E8F0">
            <Skeleton height="20px" width="200px" mb="10px" />
            <Skeleton height="20px" width="150px" />
          </Box>

          {/* Rules Section */}
          <Box
            fontSize={"16px"}
            fontWeight={"600"}
            borderBottom={"1px solid #E2E8F0"}
            color="#475569"
            px="20px"
            py={"10px"}
          >
            <Skeleton height="20px" width="100px" />
          </Box>
        </Box>
      </Box>
    </>
  );
}



export default function ViewPost() {
  const { data: session } = useSession();
  const {socket} = useSocket();

  const [accessToken, setAccessToken] = useState<string | null>(null);

  const [postData, setPostData] = useState<PostData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [postUserData, setPostUserData] = useState<AddedByUser | null>(null);

  const [isMember, setIsMember] = useState<boolean>(false)
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinErrorType, setJoinErrorType] = useState<string | null>(null);
  const [hasAlreadyCommented, setHasAlreadyCommented] = useState(false);


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
  const { id } = useParams();
  // Effect to set accessToken when session changes
  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken as string);
    } else {
      setAccessToken(null);
    }
  }, [session]);

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
      }
    };
    fetchUserData();
  }, [session]);
  const handleActionEmit = (actionType: string, activityId: string) => {
    if (socket && session) {
      socket.emit("user_action", {
        userId: session.user.id,
        activityId,
        actionType,
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

  const checkUserAlreadyCommented = (comments: CommentData[] | null, userId: string) => {
    if (!comments || !userId) return false;
    return comments.some(comment => comment.added_by === userId);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setButtonLoading(true); // Start loading immediately

        const resPost = await axios.get(`/api/public/activities/${id}`);
        const resPosts: Posts = resPost.data;

        if (resPosts && resPosts.items === 1) {
          const resPostItem = resPosts.data[0];
          setPostData(resPostItem);
          setPostUserData(resPostItem.added_by_user);

          const resComments = resPostItem.comments;
          if (resComments && resComments.items > 0) {
            setCommentData(resComments.data);

            if (session?.user?.id) {
              const userHasCommented = checkUserAlreadyCommented(
                resComments.data,
                session.user.id
              );
              setHasAlreadyCommented(userHasCommented);
            }

            let totalRating = 0;
            const ratingCounter: { [key: string]: number } = {
              1: 0,
              2: 0,
              3: 0,
              4: 0,
              5: 0,
            };

            resComments.data.forEach((comment) => {
              totalRating += comment.rating;
              ratingCounter[comment.rating.toString()] += 1;
            });

            setCommentRating(totalRating / resComments.data.length);
            setRatingCounts(ratingCounter as any);
          }

          if (session) {
            try {
              const statusResponse = await axios.get(`/api/activity_join/${id}/is-member`, {
                withCredentials: true,
              });
              const { isMember, isStarted, isEnded, isAlreadyRequested, isFull } = statusResponse.data;
              // joinError, setJoinErrorType
              setIsMember(isMember)

              if (isEnded) {
                setJoinError("Activity has ended!")
                setJoinErrorType("warning")
              }
              else if (isStarted) {
                setJoinError("Activity has already started!")
                setJoinErrorType("warning")
              }
              else if (isFull) {
                setJoinError("This activity is full!")
                setJoinErrorType("warning")
              }
              else if (isAlreadyRequested) {
                setJoinError("Request Sent!")
                setJoinErrorType("warning")
              }


            } catch (statusError) {
              console.error("Error fetching membership status:", statusError);
              setJoinError(false)
              setJoinErrorType(false)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching post data:", error);
      } finally {
        setIsLoading(false);
        setButtonLoading(false); // Ensure loading is false after fetching (success or error)
      }
    };

    fetchData();
  }, [session, id]);

 

  // Calculate total comments for percentage calculations
  const totalComments = commentData ? commentData.length : 0;
  const getPercentage = (rating: 1 | 2 | 3 | 4 | 5) => {
    if (totalComments === 0) return 0;
    return (ratingCounts[rating] / totalComments) * 100;
  };

  const [newCommentData, setNewCommentData] = useState({
    comment: "",
    rating: 0,
  });
  const [loading, setLoading] = useState(false);
  const [slider, setSlider] = useState(0);
  const toast = useToast();

  dayjs.extend(relativeTime);


  //const navigate = useNavigate();
  const router = useRouter();

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
            title: "Join request Sent",
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
          description: `You must login to Join`,
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
          `/api/public/activities/${id}/comments`,
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
          description: `${error?.response?.data?.message || error?.message}`,
          status: "error",
        });
        console.error(error);
      }
    } else {
      toast({
        title: "Login Error",
        description: `You must login to add Feedback`,
        status: "error",
      });
    }
  };

  const timePosted = dayjs(postData?.created_at).fromNow();

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  // Function to fetch likes and dislikes count
  const fetchLikesDislikes = async () => {
    try {
      const likeRes = await axios.get(`/api/public/activities/${postData?.id}/like`, { withCredentials: true });
      const dislikeRes = await axios.get(`/api/public/activities/${postData?.id}/dislike`, { withCredentials: true });

      const likeCount = likeRes.data.count || 0;
      const dislikeCount = dislikeRes.data.count || 0;

      setLikes(likeCount);
      setDislikes(dislikeCount);
    } catch (error) {
      console.error("Error fetching like/dislike counts", error);
    }
  };

  // Fetch likes and dislikes when the component is mounted
  useEffect(() => {
    if (postData?.id) {
      fetchLikesDislikes();
    }
  }, [postData?.id]);

  // Function to handle like action
  // app/posts/[id]/page.tsx (inside the ViewPost component)

const handleLikePost = async () => {
  try {
    if (session) {
      // Toggle like using the POST route
      const response = await axios.post(`/api/public/activities/${postData?.id}/like`, {}, { withCredentials: true });

      // Emit "user_action" only if it's the first like
      if (response.data.action === "added" && response.data.isFirstLike) {
        handleLikeEmit(`${id}`);
      }

      // Re-fetch the updated counts for likes and dislikes
      fetchLikesDislikes();
    } else {
      toast({
        title: "Login Error",
        description: `You must login to Like/Dislike`,
        status: "error",
      });
    }
  } catch (error) {
    toast({
      title: "Error.",
      description: `${error?.response?.data?.message || error?.message}`,
      status: "error",
    });
    console.error(error);
  }
};

  // Function to handle dislike action
  const handleDisLikePost = async () => {
    try {
      if (session) {
        // Toggle dislike using the POST route
        await axios.post(`/api/public/activities/${postData?.id}/dislike`, {}, { withCredentials: true });

        // Re-fetch the updated counts for likes and dislikes
        fetchLikesDislikes();
      } else {
        toast({
          title: "Login Error",
          description: `You must login to Like/Dislike`,
          status: "error",
        });
      }
    } catch (error) {
      toast({
        title: "Error.",
        description: `${error?.response?.data?.message || error?.message}`,
        status: "error",
      });
      console.error(error);
    }
  };
  // if (!user && isUserFetched) return router.push("/login");
  //  if (isLoading || !postData || !session) {

  const commentsRef = useRef<HTMLDivElement>(null);

  // Add this function at the top level of your component
  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!postData) {
    return <PostDetailsSkeleton />;
  }

  const handleReport = () => {
    router.push('/contact-us');
  };

  const getProfileLink = (userId: string) => {
    if (session?.user?.id === userId) {
      return "/profile/me";
    }
    return `/profile/${userId}`;
  };
  let defaultImage = "/account.png"
  const imageUrl = userData?.profile_pic == null || userData?.profile_pic === "" ? defaultImage : userData?.profile_pic;


  return (
    <>
      <Box maxWidth="1440px" mx="auto" display="flex" flexDir={{ base: "column", md: "row" }}>
        <Box w="full" order={{ base: '1', md: '1' }}>
          {/* Title and Subtitle Section */}
          <Box position="relative" px={{ base: "20px", md: "30px" }} borderBottom="1px solid #E2E8F0" flex="1">
            <Heading size="lg" fontWeight="700" color="#334155" mt="32px">
              {postData?.title}
            </Heading>
            <Text fontSize="18px" color="#94A3B8" maxWidth="600px" fontWeight="500" mt="8px">
              {postData?.sub_title}
            </Text>
          </Box>

          {/* Images Grid Section */}
          {postData?.images?.length > 0 ? (
            <Grid
              templateRows="repeat(2,1fr)"
              templateColumns="repeat(4,1fr)"
              gap="12px"
              px={{ base: "20px", md: "30px" }}
              py="42px"
            >
              {postData?.images.map((image, i) => (
                <GridItem key={i} colSpan={i === 0 ? 2 : 1} rowSpan={i === 0 ? 2 : 1}>
                  <Image
                    src={image.url}
                    w="full"
                    h="full"
                    borderRadius="12px"
                    objectFit="cover"
                    fallbackSrc="/placeholder.png"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder.png";
                    }}
                  />
                </GridItem>
              ))}
            </Grid>
          ) : (
            <Grid px={{ base: "20px", md: "30px" }} py="42px" display="flex" justifyContent="center" alignItems="center">
              <Image
                src="/placeholder.png"
                w={{ base: "80%", md: "50%" }}
                h="auto"
                borderRadius="12px"
                objectFit="cover"
              />
            </Grid>
          )}

          {/* Description Section */}
          <Box
            py="30px"
            px={{ base: "20px", md: "30px" }}
            display="flex"
            justifyContent="flex-start"
            maxWidth="745px"
            borderBottom="1px solid #E2E8F0"
            order="3"
          >
            {postData?.description && (
              <QuillOutput
                htmlContent={postData?.description}
                className="ql-editor"
                fontSize="16px"
                color="#64748B"
              />
            )}
          </Box>

          {/* Mobile-only Post Details Section */}
          <Box
            display={{ base: "block", md: "none" }}
            w="full"
            bgColor="white"
            borderTop="1px solid #E2E8F0"
            borderBottom="1px solid #E2E8F0"
            order="2"
          >
            <Text fontSize="18px" fontWeight="700" color="#0F172A" px="20px" py="10px" borderBottom="1px solid #E2E8F0">
              Post Details
            </Text>
            {/* Copy the entire post details content here for mobile view */}
            <Box px="20px" py="10px" pb="20px" display="flex" flexDir="column" gap="15px">
              <Box py="20px" borderBottom="1px solid #E2E8F0">
                <Text fontSize="16px" color="#94A3B8" mb="15px">
                  Created By
                </Text>
                <Link href={getProfileLink(postUserData?.id || '')} style={{ textDecoration: "none" }}>
                  <Box display="flex" alignItems="flex-start" gap="11px">
                    <Image
                      src={
                        postUserData?.profile_picture && !postUserData.profile_picture.toLowerCase().includes("null")
                          ? postUserData.profile_picture
                          : "/account.png"
                      }
                      objectFit="cover"
                      w="48px"
                      h="48px"
                      borderRadius="50%"
                    />
                    <Box display="flex" flexDir="column" gap="8px">
                      <Text fontSize="16px" fontWeight="600" color="#334155">
                        {postUserData?.name}
                      </Text>
                      <Text fontSize="15px" fontWeight="500" color="#94A3B8">
                        {postUserData?.about_me}
                      </Text>
                    </Box>
                  </Box>
                </Link>
              </Box>

              {/* Post Details Info */}
              <Box>
                <Text fontSize="14px" color="#94A3B8" mb="5px">
                  ZIP Code / Location:
                </Text>
                <Text fontSize="14px" color="#334155" mb="5px">
                  {postData?.zip} / {postData?.city}
                </Text>
              </Box>
              <Box>
                <Text fontSize="14px" color="#94A3B8" mb="5px">
                  Joined / Total:
                </Text>
                <Text fontSize="14px" color="#334155" mb="5px">
                  {postData?.confirmedParticipants} / {postData?.max_participants}
                </Text>
              </Box>
              <Box>
                <Text fontSize="14px" color="#94A3B8" mb="5px">
                  Created At
                </Text>
                <Text fontSize="14px" color="#334155" mb="5px">
                  {dayjs(postData?.created_at).format("DD MMM YYYY")}
                </Text>
              </Box>

              {/* Rules Section */}
              <Text fontSize="16px" fontWeight="600" color="#475569" borderTop="1px solid #E2E8F0" pt="10px">
                Rules:
              </Text>
              {postData?.rules?.length > 0 && (
                <Box display="flex" flexDir="column" gap="15px">
                  {`${postData?.rules}`.split(",").map((rule, i) => (
                    <Box key={i} display="flex" alignItems="center" gap="8px">
                      <Text fontSize="14px" color="#94A3B8">
                        {i + 1}. {rule}
                      </Text>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>




          <Box order={{ base: '5', md: '2' }}> {/* Rating and feedback - Moved down in mobile view */}
            <Text mb={"20px"} pt="5" fontSize={"24px"} color={"#1E293B"} fontWeight={"700"} px={{ base: "20px", md: "30px" }}>
              Rating and feedback ({commentData?.length ? commentData?.length : 0})
            </Text>
            <Box px={{ base: "20px", md: "30px" }} py={"30px"} ref={commentsRef}>
              {session ? (
                isMember ? (
                  hasAlreadyCommented ? (
                    <Text mb={"30px"} fontSize={"16px"} color="#4A5568" fontWeight="medium" p="4" bg="gray.50" borderRadius="md">
                      You have already provided feedback for this activity. Thank you for your contribution!
                    </Text>
                  ) : (
                    <Box display={"flex"} alignItems={"flex-start"} justifyContent={"flex-start"} gap="16px" mb={"60px"}>
                      <Image src={imageUrl} w={"48px"} h={"48px"} borderRadius={"50%"} objectFit={"cover"} />
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
                  <Text mb={"30px"} fontSize={"16px"} color="gray.500">
                    Join the activity to add your comment.
                  </Text>
                )
              ) : (
                <Text mb={"30px"} fontSize={"16px"} color={"#1E293B"}>
                  Log in to add a comment.
                </Text>
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
                        colorScheme={ratingColorScheme(rating)}
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
        </Box>
        <Box
          w={"full"}
          maxWidth={{
            base: "full",
            md: "350px",
          }}
          bgColor={"#FFF"}
          borderLeft={{ base: 'none', md: "1px solid #E2E8F0" }} // Remove border in mobile
          order={{ base: '2', md: '2' }} // Post Details Sidebar - Moved up in mobile view
          display={{ base: 'none', md: 'block' }} // Hide on mobile, show on desktop
        >
          <Text
            fontSize={"18px"}
            fontWeight={"700"}
            borderBottom={"1px solid #E2E8F0"}
            color="#0F172A"
            px="20px"
            py={"10px"}
          >
            Post Details
          </Text>
          <Box
            px="20px"
            py={"10px"}
            borderBottom={"1px solid #E2E8F0"}
            display={"flex"}
            flexDir={"column"}
            gap={"15px"}
          >
            <Box py={"20px"} borderBottom={"1px solid #E2E8F0"}>
              <Text fontSize={"16px"} color="#94A3B8" mb={"15px"}>
                Created By
              </Text>
              <Link href={getProfileLink(postUserData?.id || '')} style={{ textDecoration: "none" }}>
                <Box display={"flex"} alignItems={"flex-start"} gap="11px">
                  <Image
                    src={
                      postUserData?.profile_picture && !postUserData.profile_picture.toLowerCase().includes("null")
                        ? postUserData.profile_picture
                        : "/account.png"
                    }
                    objectFit={"cover"}
                    w={"48px"}
                    h={"48px"}
                    borderRadius={"50%"}
                  />
                  <Box display={"flex"} flexDir={"column"} gap={"8px"}>
                    <Text fontSize={"16px"} fontWeight={"600"} color="#334155">
                      {postUserData?.name}
                    </Text>
                    <Text fontSize={"15px"} fontWeight={"500"} color="#94A3B8">
                      {postUserData?.about_me}
                    </Text>
                  </Box>
                </Box>
              </Link>
            </Box>

            <Box>
              <Text fontSize={"14px"} color="#94A3B8" mb={"5px"}>
                ZIP Code / Location:
              </Text>
              <Text fontSize={"14px"} color="#334155" mb={"5px"}>
                {postData?.zip} / {postData?.city}
              </Text>
            </Box>
            <Box>
              <Text fontSize={"14px"} color="#94A3B8" mb={"5px"}>
                Joined / Total:
              </Text>
              <Text fontSize={"14px"} color="#334155" mb={"5px"}>
                {postData?.confirmedParticipants} / {postData?.max_participants}
              </Text>
            </Box>
            <Box>
              <Text fontSize={"14px"} color="#94A3B8" mb={"5px"}>
                Created At
              </Text>
              <Text fontSize={"14px"} color="#334155" mb={"5px"}>
                {dayjs(postData?.created_at).format("DD MMM YYYY")}
              </Text>
            </Box>
          </Box>
          <Box
            fontSize={"16px"}
            fontWeight={"600"}
            borderBottom={"1px solid #E2E8F0"}
            color="#475569"
            px="20px"
            py={"10px"}
          >
            Rules:
          </Box>
          {postData?.rules?.length > 0 && (
            <Box
              px="20px"
              py={"10px"}
              borderBottom={"1px solid #E2E8F0"}
              display={"flex"}
              flexDir={"column"}
              gap={"15px"}
            >
              {`${postData?.rules}`.split(",").map((rule: string, i) => {
                return (
                  <Box key={i} display={"flex"} alignItems={"center"} gap="8px">
                    <Text fontSize={"14px"} color="#94A3B8">
                      {i + 1}. {rule}
                    </Text>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
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

          <Box display={{ base: "none", md: "flex" }} alignItems="flex-start" justifyContent="flex-start" gap="11px">
            <Link href={getProfileLink(postUserData?.id || '')} style={{ textDecoration: "none" }}>
              <Box display="flex" alignItems="flex-start" gap="11px" cursor="pointer">
                <Image
                  src={
                    postUserData?.profile_picture && !postUserData.profile_picture.toLowerCase().includes("null")
                      ? postUserData.profile_picture
                      : "/account.png"
                  }
                  w="48px"
                  h="48px"
                  borderRadius="50%"
                  objectFit="cover"
                />
                <Box display="flex" flexDir="column">
                  <Text fontSize="16px" fontWeight="600" color="#334155">
                    By {postUserData?.name}
                  </Text>
                  <Text fontSize="14px" color="#94A3B8">
                    Published about {timePosted}
                  </Text>
                  <Text fontSize="14px" color="#94A3B8">
                    {`Category: Posts`}
                  </Text>
                </Box>
              </Box>
            </Link>
          </Box>


          {/* Desktop View - Actions */}
          <Box display={{ base: "none", md: "flex" }} flexWrap="wrap" alignItems="center" gap="32px">
            <Box display="flex" alignItems="center" gap="8px" onClick={scrollToComments} cursor="pointer">
              <MessagesIcon stroke="#64748B" width="22px" height="22px" />
              <Text fontSize="14px" color="#64748B">
                Comments: {commentData?.length ? commentData?.length : 0}
              </Text>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              gap="8px"
              onClick={handleLikePost}
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
              onClick={handleDisLikePost}
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
                text: "Checkout this post",
                url: `/posts/${id}`,
                title: `${postData?.title} - ${postData?.sub_title}`,
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
            {/* Warning Messages - Desktop */}
            {/* joinError */}
            {/* joinErrorType */}

            {!isMember && joinError
              ?
              <Text color="yellow.500" fontWeight="semibold" mb="2">
                {joinError}
              </Text> :
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
                    ? "#D1D5DB" : "#f9690e"
                }
                borderRadius="3px"
                color="white"
                _hover={
                  buttonLoading
                    ? {} : { bgColor: "#DD6B20" }
                }
                disabled={isProcessing || buttonLoading}
                onClick={() => {
                  if (!session) {
                    router.push('/login'); // Redirect to login if no session
                  } else if (isMember) {
                    router.push(`/messages?activityId=${id}`)
                  } else {
                    handleJoin();
                  }
                }}
                cursor="pointer"
              >
                {buttonLoading ? (
                  <Spinner size="sm" mr={2} />
                ) : isProcessing ? (
                  <Spinner size="sm" mr={2} />
                ) : null}
                {!session
                  ? "Please login to join"
                  : isMember
                    ? "Message" : "Join"}
              </Box>

            }

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
                px="12px" // Slightly reduce padding
                fontSize="14px" // Slightly reduce font size
                fontWeight="500"
                onClick={() => {
                  if (!session) {
                    router.push('/login'); // Redirect to login if no session
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
                    : !session // Change background color if no session
                      ? "#f9a825" // Example: Different orange for "Login"
                      : "#f9690e"
                }
                borderRadius="3px"
                color="white"
                _hover={
                  buttonLoading
                    ? {}
                    : { bgColor: !session ? "#f59e0b" : "#DD6B20" } // Adjust hover color
                }
                disabled={isProcessing || buttonLoading}
                h="40px"
                w="45%"
                cursor="pointer"
              >
                {buttonLoading ? (
                  <Spinner size="sm" mr={2} />
                ) : isProcessing ? (
                  <Spinner size="sm" mr={2} />
                ) : null}
                {!session
                  ? "Please login to join" // Button text for login - **Corrected to "Please login to join"**
                  : isMember
                    ? "Message" : "Join"}
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
                {/* User Profile Info */}
                <MenuItem closeOnSelect={false}>
                  <Box display="flex" alignItems="flex-start" gap="11px" w="100%">
                    <Link href={getProfileLink(postUserData?.id || '')} style={{ textDecoration: "none" }}>
                      <Image
                        src={
                          postUserData?.profile_picture && !postUserData.profile_picture.toLowerCase().includes("null")
                            ? postUserData.profile_picture
                            : "/account.png"
                        }
                        w="48px"
                        h="48px"
                        borderRadius="50%"
                        objectFit="cover"
                        cursor="pointer" // Makes the image clickable
                      />
                    </Link>
                    <Box display="flex" flexDir="column">
                      <Text fontSize="16px" fontWeight="600" color="#334155">
                        By {postUserData?.name}
                      </Text>
                      <Text fontSize="14px" color="#94A3B8">
                        Published about {timePosted}
                      </Text>
                      <Text fontSize="14px" color="#94A3B8">
                        {`Category / Sub-Category`}
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
                <MenuItem onClick={handleLikePost}>
                  <Box display="flex" alignItems="center" gap="8px">
                    <LikeIcon stroke="#f9690e" width="22px" height="22px" />
                    <Text fontSize="14px" color="#64748B">
                      {likes}
                    </Text>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleDisLikePost}>
                  <Box display="flex" alignItems="center" gap="8px">
                    <DislikeIcon stroke="#334155" width="22px" height="22px" />
                    <Text fontSize="14px" color="#64748B">
                      {dislikes}
                    </Text>
                  </Box>
                </MenuItem>
                <MenuItem onClick={() => {
                  const shareData = {
                    text: "Checkout this post",
                    url: `/posts/${id}`,
                    title: `${postData?.title} - ${postData?.sub_title}`,
                  };
                  navigator.share(shareData);
                }}>
                  <Box display="flex" alignItems="center" gap="8px">
                    <Share2Icon width="22px" height="22px" stroke="#334155" />
                    <Text fontSize="14px" color="#64748B">Share</Text>
                  </Box>
                </MenuItem>
                <MenuItem onClick={handleReport}>
                  <Box display="flex" alignItems="center" gap="8px">
                    <ReportIcon stroke="#334155" width="20px" height="20px" />
                    <Text fontSize="14px" color="#64748B">Report</Text>
                  </Box>
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </Box>
      </Box>
    </>
  );
}