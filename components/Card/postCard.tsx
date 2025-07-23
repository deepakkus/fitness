


/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Box, Image, IconButton, Menu, MenuButton, MenuItem, MenuList, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RWebShare } from "react-web-share";
import {
  AgeIcon,
  AnnouncementIcon,
  AvatarIcon,
  CalenderIcon,
  HistoryIcon,
  OptionsIcon,
  PincodeIcon,
  ShareIcon,
} from "@/components/Icons";
import { UserData } from "@/app/profile/me/page";
import { AnimatePresence, motion } from "framer-motion";
import Loading from "@/components/App/loading";
dayjs.extend(relativeTime);
import { ActivityItem } from "@/components/Profile/Posts";



//this is used to view both post and event - need further opt for events though

interface PostCardProps {
  userData: UserData | undefined;
  postItem: ActivityItem | undefined;
  view: string;
}
export default function PostCard({ userData, postItem, view }: PostCardProps) {
  //const { user } = useSelector((state) => state.auth);
  const [hover, setHover] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const toast = useToast();

  const title = `${postItem?.title}`;
  const subtitle = `${postItem?.sub_title}`;

  const is_event = postItem?.is_event;
  const id = postItem?.id;
  const activity_link = is_event ? `/event/${id}` : `/posts/${id}`;
  const isSponsored = postItem?.is_sponsored;
  const peopleInterested = postItem?.peopleInterested;
  const postDate = postItem?.start_time;
  const createdAt = postItem?.created_at;
  const zip = postItem?.zip;
  const admin_name = postItem?.added_by;
  const leftSpace = "";
  const age = `${`${postItem?.age_group}`.split("age_")[1]}`.split("_");
  const age_group = age[0] ? `${age[0]} to ${age[1]}` : `13 to 60`;

  //const age = `${`${userData?.age_group}`.split("age_")[1]}`.split("_");
  //const age_group_max = `${`${age.split("_")[1]}`.split("-")[1]}`;

  const date = dayjs(postDate).format("MMM DD, YYYY");

  const time = dayjs(createdAt).fromNow();

  const PostImages = postItem?.images || [];
const defaultImage = "/placeholder.png";

const getCurrentImage = () => {
  if (PostImages.length === 0) {
    return defaultImage;
  }
  return PostImages[currentImageIndex]?.url || defaultImage;
};

  const imageVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const rotateImage = useCallback(() => {
    if (PostImages.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % PostImages.length);
    }
  }, [PostImages]);

  useEffect(() => {
    if (hover) {
      const intervalId = setInterval(rotateImage, 3000);
      return () => clearInterval(intervalId);
    } else {
      const intervalId = setInterval(rotateImage, 10000);
      return () => clearInterval(intervalId);
    }
  }, [rotateImage, hover]);

  const trimTitle = (string: string, length = 55) => {
    if (string.length <= length) {
      return string;
    } else {
      return (string = string.substring(0, length) + "...");
    }
  };
  const handleDeleteActivity = (id: string | undefined) => async () => {
    try {
      toast({
        title: "Error.",
        description: " Issue deleting - Activity.",
        status: "error",
      });
      return;
      const res = await axios.delete(`/post/${id}`, {
        withCredentials: true,
      });
      const data = await res.data;

    } catch (error) {

    }
  };

  // Prevent event propagation for share and menu buttons
  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHover(true);
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      {view !== "list" ?
        <Box
          w={"full"}
          maxW={"350px"}
          h={"full"}
          bg={"#FFF"}
          borderRadius={"12px"}
          onMouseEnter={() => {
            setHover(true);
          }}
          onMouseLeave={() => {
            setHover(false);
          }}
          border={"1px solid #E2E8F0"}
          overflow={"hidden"}
          position={"relative"}
        >
            <Box h={"167px"} w={"full"} position={"relative"} overflow="hidden">
          <Link href={activity_link}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={getCurrentImage()}
                  variants={imageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    opacity: { duration: 0.5 },
                  }}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Image
                    style={{ objectFit: "cover" }}
                    src={getCurrentImage()}
                    alt={`Post Image ${currentImageIndex + 1}`}
                    onLoad={() => setIsImageLoaded(true)}
                  />
                </motion.div>
              </AnimatePresence>
              </Link>

              <Box
                display={"flex"}
                w="full"
                justifyContent={(isSponsored)? "space-between" : "flex-end"}
                gap="5px"
                pos={"absolute"}
                top={"0px"}
                right={"0px"}
                pt="130px"
              >
                {/* <Box
                  display={(isSponsored && is_event==false)? "flex" : "none"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  gap="5px"
                  p="5px 15px"
                  ml={"-20px"}
                  color="#F97316"
                  bg={"#FFF"}
                  fontSize={"12px"}
                  fontWeight={"600"}
                  boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
                  borderRadius={"99px"}
                  cursor={"pointer"}
                  _hover={{ bg: "#F7FAFC" }}
                >
                  <AnnouncementIcon stroke="#EA580C" width="16px" height="16px" />
                  Sponsored
                </Box> */}
                <Box display={"flex"} gap={"5px"}>
                <Box onClick={handleShareClick}>
                  <RWebShare
                    data={{
                      text: "Checkout this post",
                      url: `/posts/${id}`,
                      title: `${title} - ${subtitle}`,
                    }}
                  >
                    <Box
                      w={"28px"}
                      h={"28px"}
                      bg={"transparent"} // Make the background transparent
                      position="relative" // establish positioning context
                      _before={{
                        content: '""',
                        position: "absolute",
                        top: "-10px", // Adjust as needed to increase clickable area
                        right: "-10px",
                        bottom: "-10px",
                        left: "-10px",
                        background: "transparent", // Ensure the expanded area is transparent
                      }}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      cursor={"pointer"}
                      onMouseEnter={() => setHover(true)}
                      onMouseLeave={() => setHover(false)}
                    >
                      <Box
                        bg={"#FFF"}
                        boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
                        p={"5px"}
                        borderRadius={"50%"}
                      >
                        <ShareIcon width="100%" height="100%" fill={hover ? "#EA580C" : "#000"} />
                      </Box>
                    </Box>
                  </RWebShare>
                </Box>
                {/* <Box onClick={handleMenuClick}>
                  <Menu>
                    <MenuButton
                      bgColor={"#FFF"}
                      w={"30px"}
                      minW={"auto"}
                      h={"30px"}
                      borderRadius={"99px"}
                      as={IconButton}
                      aria-label="Options"
                      icon={<OptionsIcon width="100%" height="100%" stroke="#000" />}
                      variant="outline"
                    />
                    <MenuList>
                      <MenuItem onClick={handleDeleteActivity(postItem?.id)}>Delete</MenuItem>
                    </MenuList>
                  </Menu>
                </Box> */}
              </Box>
              </Box>
            </Box>

          {(isSponsored) && (
            <Box
              position="absolute"
              top="167px" 
              right="15px"
              zIndex={1}
            >
              <Text
                fontSize="13px"
                fontWeight="bold"
                color="#F97316"
                bg="#FFF7ED"
                px="12px"
                py="2px"
                borderRadius="8px"
                boxShadow="0px 4px 12px 0px rgba(0,0,0,0.08)"
              >
                Sponsored
              </Text>
            </Box>
          )}

          <Link href={is_event ? `/event/${id}` : `/posts/${id}`}>
            <Box p={"15px"} w={"full"} _hover={{ textDecoration: "none" }} display={"inline-block"}>
              
              {is_event && (
                <Text fontSize={"14px"} mb={"7px"} color="#64748B" w={"full"}>
                  {peopleInterested} people interested
                </Text>
              )}
              
              <Text fontSize={"18px"} letterSpacing={"-0.5px"} fontWeight={"600"} mb={"4px"} color="#020617">
                {trimTitle(`${title}`)}
              </Text>
              <Text fontSize={"14px"} mb={"14px"} fontWeight={"500"} color="#94A3B8">
                {is_event ? `Event` : `Post`}
              </Text>
              <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} mb={"14px"}>
                <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                  <AgeIcon width="18px" height="18px" />

                  <Text fontSize={"14px"} color="#64748B">
                    {age_group} years
                  </Text>
                </Box>
                <Box display={"flex"} gap={"4px"} alignItems={"center"}>
                  <Text
                    fontSize={"12px"}
                    color="#64748B"
                    px="6px"
                    py="3px"
                    border={"1px solid #CBD5E1"}
                    borderRadius={"8px"}
                    fontWeight={"700"}
                  >
                    {postItem?.available_spots || 0}
                  </Text>
                  <Text fontSize={"14px"} color="#64748B">
                    Available
                  </Text>
                </Box>
              </Box>

              <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} mb={"14px"}>
                <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                  <PincodeIcon width="18px" height="18px" />
                  <Text fontSize={"14px"} color="#64748B">
                    {postItem?.zip}
                  </Text>
                </Box>

                <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                  <AvatarIcon width="18px" height="18px" />
                  <Text fontSize={"14px"} color="#64748B">
                    {admin_name}
                  </Text>
                </Box>
              </Box>
              <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                  <CalenderIcon width="18px" height="18px" stroke="#EA580C" />
                  <Text fontSize={"13px"} fontWeight={"700"} color="#f9690e">
                    {date}
                  </Text>
                </Box>
                <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                  <HistoryIcon width="18px" height="18px" />
                  <Text fontSize={"12px"} color="#475569" textTransform={"capitalize"}>
                    {time}
                  </Text>
                </Box>
              </Box>
            </Box>
          </Link>
        </Box>
      : <Box
          w={"full"}
          h={"full"}
          bg={"#FFF"}
          borderRadius={"12px"}
          border={"1px solid #E2E8F0"}
          overflow={"hidden"}
          position={"relative"}
          display={"flex"}
        >
          <Box w={"full"} maxW={"325px"} h={"full"} maxH={"175px"} minHeight={"150px"}>
            <AnimatePresence initial={false}>
              <motion.div
                key={PostImages[currentImageIndex]?.url}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  opacity: { duration: 0.5 },
                }}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  maxWidth: "325px",
                  maxHeight: "175px",
                }}
              >
                <Image
                  loading="lazy"
                  style={{ objectFit: "cover" }}
                  src={PostImages[currentImageIndex]?.url}
                  alt={`Post Image ${currentImageIndex + 1}`}
                  onLoad={() => setIsImageLoaded(true)}
                />
              </motion.div>
            </AnimatePresence>
          </Box>

          <Box
            w={"full"}
            // bg={"#E2E8F0"}
            position={"relative"}
            p={"15px"}
            _hover={{ textDecoration: "none" }}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Box w={"full"} maxW={400}>
              <Text fontSize={"14px"} mb={"7px"} color="#64748B" w={"full"}>
                {`Participated in`}
              </Text>
              <Text fontSize={"18px"} letterSpacing={"-0.5px"} fontWeight={"600"} mb={"4px"} color="#020617">
                {trimTitle(title)}
              </Text>
              <Text fontSize={"14px"} mb={"14px"} fontWeight={"500"} color="#94A3B8">
                {`Category / Sub-Category`}
              </Text>
            </Box>

            <Box display={"flex"} flexDir={"column"} alignItems={"flex-start"} justifyContent={"center"} gap={"14px"}>
              <Box display={"flex"} gap={"4px"} alignItems={"center"}>
                <AgeIcon width="18px" height="18px" />

                <Text fontSize={"14px"} color="#64748B">
                  {age_group} years
                </Text>
              </Box>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <PincodeIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {zip}
                </Text>
              </Box>

              {userData && (
                <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                  <AvatarIcon width="18px" height="18px" />
                  <Text fontSize={"14px"} color="#64748B">
                    {userData?.name}
                  </Text>
                </Box>
              )}
            </Box>

            <Box display={"flex"} flexDir={"column"} alignItems={"flex-start"} justifyContent={"center"} gap={"14px"}>
              <Box display={"flex"} gap={"4px"} alignItems={"center"}>
                <Text
                  fontSize={"12px"}
                  color="#64748B"
                  px="6px"
                  py="3px"
                  border={"1px solid #CBD5E1"}
                  borderRadius={"8px"}
                  fontWeight={"700"}
                >
                  {postItem?.available_spots || 0}
                </Text>
                <Text fontSize={"14px"} color="#64748B">
                  Available
                </Text>
              </Box>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <CalenderIcon width="18px" height="18px" stroke="#EA580C" />
                <Text fontSize={"14px"} color="#64748B">
                  {date}
                </Text>
              </Box>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <HistoryIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {time}
                </Text>
              </Box>
            </Box>
          </Box>

          <Box display={"flex"} gap={"10px"} h={"full"} alignItems={"center"} px={"1em"}>
            <Box onClick={handleShareClick}>
              <RWebShare
                data={{
                  text: "Checkout this post",
                  url: `/posts/${id}`,
                  title: `${title} - ${subtitle}`,
                }}
              >
                <Box
                  w={"28px"}
                  h={"28px"}
                  bg={"transparent"} // Make the background transparent
                  position="relative" // establish positioning context
                  _before={{
                    content: '""',
                    position: "absolute",
                    top: "-10px", // Adjust as needed to increase clickable area
                    right: "-10px",
                    bottom: "-10px",
                    left: "-10px",
                    background: "transparent", // Ensure the expanded area is transparent
                  }}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor={"pointer"}
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                >
                  <Box
                    bg={"#FFF"}
                    boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
                    p={"5px"}
                    borderRadius={"50%"}
                  >
                    <ShareIcon width="100%" height="100%" fill={hover ? "#EA580C" : "#000"} />
                  </Box>
                </Box>
              </RWebShare>
            </Box>

          </Box>
        </Box>
      }
    </>
  );
}