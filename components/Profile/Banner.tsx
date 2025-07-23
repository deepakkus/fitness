"use client";
import { Image, Box, Button, Text, useToast } from "@chakra-ui/react";
import Link from "next/link";
import { UserData } from "@/app/profile/me/page";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import UserImage from "../handleImage/UserImage";
import AchievementModal from "./AchievementModal";

export interface UserMetrics {
  Events: number;
  Followers: number;
  Following: number;
  Post: number;
  Products: number;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  profile_pic: string;
  location: string;
  about_me: string | null;
  age_group: string | null;
  count?: UserMetrics;
  _count?: UserMetrics;
}

const getMetrics = (userData: UserData): UserMetrics => {
  return (
    userData._count ||
    userData.count || {
      Events: 0,
      Followers: 0,
      Following: 0,
      Post: 0,
      Products: 0,
    }
  );
};

export function UserProfileBanner({ userData }: { userData: UserData }) {
  const metrics = getMetrics(userData);
  const followers = metrics.Followers;
  const following = metrics.Following;
  const name = userData.name;
  const Profile = {
    bio: userData.about_me,
    profilePic: { url: userData.profile_pic },
  };
  const posts = metrics.Post;
  const events = metrics.Events;
  const products = metrics.Products;
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

  const handleOpenModal = () => setIsModalOpen(true); // Function to open modal
  const handleCloseModal = () => setIsModalOpen(false); // Function to close modal

  return (
    <Box
      w="full"
      py="28px"
      px="33px"
      borderTopRadius={"12px"}
      border={"1px solid #E2E8F0"}
      bgColor={"#FFF"}
    >
      <Box
        display={"flex"}
        flexDir={{ base: "column", md: "row" }}
        justifyContent={"space-between"}
        alignItems={"center"}
        w={"full"}
      >
        <Box
          display={"flex"}
          flexDir={{ base: "column", md: "row" }}
          gap={"65px"}
          justifyContent={"flex-start"}
          alignItems={"center"}
        >
          {/*   <Image fallbackSrc="" w={120} h={"120px"} objectFit={"cover"} rounded={99} src={Profile?.profilePic?.url} />*/}
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: "128px",
              height: "128px",
            }}
          >
            <UserImage
              imageUrl={Profile?.profilePic?.url}
              objectFit="cover"
              alt="prof pic"
              width="128"
              height="128"
            />
          </div>

          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"center"}
            gap="27px"
            alignItems={{ base: "center", md: "flex-start" }}
          >
            <Text
              fontSize={"28px"}
              fontWeight={"500"}
              fontFamily="var(--font-mulish)"
              color="#1E293B"
            >
              {name}
            </Text>
            <Box display={"flex"} gap={"45px"}>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Followers
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {followers}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Following
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {following}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Posts
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {posts}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Events
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {events}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Products
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {products}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          display={"flex"}
          flexDirection={"column"} // Changed to column layout
          gap={"18px"}
          pr={{ base: "0", md: "75px" }}
        >
          <Button
            colorScheme="orange"
            py="9px"
            px="34px"
            borderRadius={"4px"}
            onClick={() => router.push("/posts/create")}
          >
            Create Post
          </Button>
          <Button
            variant={"outline"}
            colorScheme="orange"
            py="9px"
            px="34px"
            borderRadius={"4px"}
            onClick={() => router.push("/event/create")}
          >
            Create Event
          </Button>
          
          <Button
            variant={"outline"}
            colorScheme="orange" // Changed from blue to orange
            py="9px"
            px="34px"
            borderRadius={"4px"}
            onClick={handleOpenModal}
          >
            Add Achievement
          </Button>
          <Button
    variant={"outline"}
    colorScheme="orange" // Changed from blue to orange
    py="9px"
    px="34px"
    borderRadius={"4px"}
    onClick={() => router.push("/vendor/dashboard")}
  >
    Sales Dashboard
  </Button>
        </Box>
      </Box>
      <AchievementModal isOpen={isModalOpen} onClose={handleCloseModal} />{" "}
      {/* Render the modal */}
    </Box>
  );
}
export function ProfileBanner({ profileData }: { profileData: UserData }) {
  const metrics = getMetrics(profileData);
  const toast = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false); // State to track follow status
  const [isCheckingFollowStatus, setIsCheckingFollowStatus] = useState(true);
  const followers = metrics.Followers;
  const followingCount = metrics.Following; // Renamed to avoid confusion
  const name = profileData.name;
  const Profile = {
    bio: profileData.about_me,
    profilePic: { url: profileData.profile_pic },
  };
  const posts = metrics.Post;
  const events = metrics.Events;

  // Fetch the following status on component mount
  useEffect(() => {
    const checkFollowingStatus = async () => {
      setIsCheckingFollowStatus(true); // Start loading
      try {
        const response = await axios.get(`/api/check_follow/${profileData.id}`);
        setIsFollowing(response.data.isFollowing);
      } catch (error) {
        console.error("Error checking follow status:", error);
        // Handle error appropriately, perhaps default to "Follow" state
      } finally {
        setIsCheckingFollowStatus(false); // Stop loading
      }
    };

    if (profileData.id) {
      checkFollowingStatus();
    } else {
      setIsCheckingFollowStatus(false); // If profileData.id is not yet available
    }
  }, [profileData.id]);

  async function handleFollow() {
    setIsProcessing(true);
    try {
      const response = await axios.post(`/api/user_follow/${profileData.id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        toast({
          title: "Followed successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setIsFollowing(true); // Update local state
        router.refresh(); // Consider a more granular update if full refresh is too much
      } else {
        throw new Error(response.data.error || "Action failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while following",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleUnfollow() {
    setIsProcessing(true);
    try {
      const response = await axios.delete(
        `/api/user_unfollow/${profileData.id}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast({
          title: "Unfollowed successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setIsFollowing(false); // Update local state
        router.refresh(); // Consider a more granular update
      } else {
        throw new Error(response.data.error || "Action failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while unfollowing",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Box
      w="full"
      py="28px"
      px="33px"
      borderTopRadius={"12px"}
      border={"1px solid #E2E8F0"}
      bgColor={"#FFF"}
    >
      <Box
        display={"flex"}
        flexDir={{ base: "column", md: "row" }}
        justifyContent={"space-between"}
        alignItems={"center"}
        w={"full"}
      >
        <Box
          display={"flex"}
          flexDir={{ base: "column", md: "row" }}
          gap={"65px"}
          justifyContent={"flex-start"}
          alignItems={"center"}
        >
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: "128px",
              height: "128px",
            }}
          >
            <UserImage
              imageUrl={Profile?.profilePic?.url}
              width="128px"
              height="128px"
              objectFit="cover"
            />
          </div>
          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"center"}
            gap="27px"
            alignItems={{ base: "center", md: "flex-start" }}
          >
            <Text
              fontSize={"28px"}
              fontWeight={"500"}
              fontFamily="var(--font-mulish)"
              color="#1E293B"
            >
              {name}
            </Text>
            <Box display={"flex"} gap={"45px"}>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Followers
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {followers || 0}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Following
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {followingCount || 0}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Posts
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {posts}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Events
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {events}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box display={"flex"} gap={"18px"} pr={{ base: "0", md: "75px" }}>
          {isCheckingFollowStatus ? (
            <Button
              isLoading
              colorScheme="orange"
              py="9px"
              px="34px"
              borderRadius={"4px"}
            >
              Checking...
            </Button>
          ) : isFollowing ? (
            <Button
              onClick={handleUnfollow}
              disabled={isProcessing}
              colorScheme="red"
              py="9px"
              px="34px"
              borderRadius={"4px"}
            >
              {isProcessing ? "Unfollowing..." : "Unfollow"}
            </Button>
          ) : (
            <Button
              onClick={handleFollow}
              disabled={isProcessing}
              colorScheme="orange"
              py="9px"
              px="34px"
              borderRadius={"4px"}
            >
              {isProcessing ? "Following..." : "Follow"}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
