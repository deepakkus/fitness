/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Box, Image, IconButton, Menu, MenuButton, MenuItem, MenuList, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { RWebShare } from "react-web-share";
import {
  AnnouncementIcon,
  AvatarIcon,
  CalenderIcon,
  HistoryIcon,
  OptionsIcon,
  PeopleIcon,
  PincodeIcon,
  ShareIcon,
} from "@/components/Icons";
import { ActivityItem } from "@/components/Profile/Events";
import { UserData } from "@/app/profile/me/page";
import { motion, AnimatePresence } from "framer-motion";

dayjs.extend(relativeTime);

interface EventCardProps {
  userData: UserData | undefined;
  eventsItem: ActivityItem | undefined;
  view: string;
}

export default function EventCardPrivate({ userData, eventsItem, view }: EventCardProps) {
  const [hover, setHover] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const EventImages = eventsItem?.images || [];
  const title = eventsItem?.title;
  const id = eventsItem?.id;
  const isSponsored = false;
  const peopleInterested = eventsItem?.peopleInterested;
  const eventDate = eventsItem?.start_time;
  const eventTime = eventsItem?.start_time;
  const createdAt = eventsItem?.created_at;
  const toast = useToast();

  const imageVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const rotateImage = useCallback(() => {
    if (EventImages.length > 1) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % EventImages.length);
    }
  }, [EventImages]);

  useEffect(() => {
    if (hover) {
      const intervalId = setInterval(rotateImage, 3000);
      return () => clearInterval(intervalId);
    } else {
      const intervalId = setInterval(rotateImage, 10000);
      return () => clearInterval(intervalId);
    }
  }, [rotateImage, hover]);
  const age = `${`${eventsItem?.age_group}`.split("age_")[1]}`.split("_");
  const age_group = age[0] ? `${age[0]} to ${age[1]}` : `13 to 60`;

  const eventDay = dayjs(eventDate).format("ddd");
  const date = dayjs(eventDate).format("MMM DD");
  const eventtime = dayjs(eventTime).format("hh:mm A");
  const time = dayjs(createdAt).fromNow();

  const trimTitle = (string: string) => {
    return string.length <= 55 ? string : string.substring(0, 55) + "...";
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      //todo
      toast({
        title: "Error.",
        description: " Issue deleting - Activity.",
        status: "error",
      });
      return;
      await axios.delete(`/api/event/${id}`, { withCredentials: true });

      //window.location.reload();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  return (
    <>
      {view !== "list" ?
        <Box
          fontFamily={"var(--font-muslish)"}
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
            <AnimatePresence initial={false}>
              <motion.div
                key={EventImages[currentImageIndex]?.url}
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
                  src={EventImages[currentImageIndex]?.url}
                  alt={`Event Image ${currentImageIndex + 1}`}
                  onLoad={() => setIsImageLoaded(true)}
                />
              </motion.div>
            </AnimatePresence>
            {!isImageLoaded && (
              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                bottom="0"
                bg="gray.200"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                Loading...
              </Box>
            )}
            <Box
              display={"flex"}
              w="full"
              justifyContent={isSponsored ? "space-between" : "flex-end"}
              gap="5px"
              pos={"absolute"}
              top={"0px"}
              right={"0px"}
              p="10px"
            >
              <Box
                display={isSponsored ? "flex" : "none"}
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
              </Box>
              <Box display={"flex"} gap={"5px"}>
                <RWebShare
                  data={{
                    text: "Checkout this post",
                    url: `/event/${id}`,
                    title: "google",
                  }}
                >
                  <Box
                    w={"28px"}
                    h={"28px"}
                    bg={"#FFF"}
                    boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
                    p={"5px"}
                    borderRadius={"50%"}
                    cursor={"pointer"}
                    _hover={{ bg: "#F7FAFC" }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    // onClick={() => shareTab()}
                  >
                    <ShareIcon width="100%" height="100%" fill={hover ? "#EA580C" : "#000"} />
                  </Box>
                </RWebShare>
                {userData && (
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
                      <MenuItem onClick={() => handleDeleteEvent(`${eventsItem?.id}`)}>Delete</MenuItem>
                      {/* <MenuItem>Create a Copy</MenuItem> */}
                    </MenuList>
                  </Menu>
                )}
              </Box>
            </Box>
          </Box>

          <Link href={`/event/${id}`}>
            <Box p={"15px"} _hover={{ textDecoration: "none" }} w={"full"} display={"inline-block"}>
              <Text fontSize={"14px"} mb={"7px"} color="#64748B" w={"full"}>
                {peopleInterested} people interested
              </Text>
              <Text fontSize={"18px"} letterSpacing={"-0.5px"} fontWeight={"600"} mb={"4px"} color="#020617">
                {trimTitle(`${title}`)}
              </Text>
              <Text fontSize={"14px"} mb={"14px"} fontWeight={"500"} color="#94A3B8">
                {`Category / Sub-Category`}
              </Text>
              <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} mb={"14px"}>
                <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                  <PincodeIcon width="18px" height="18px" />
                  <Text fontSize={"14px"} color="#64748B">
                    {eventsItem?.zip}
                  </Text>
                </Box>
                <Text fontSize={"13px"} fontWeight={"500"} color="#64748B">
                  {eventDay}
                </Text>
              </Box>
              <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} mb={"14px"}>
                <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                  <AvatarIcon width="18px" height="18px" />
                  <Text fontSize={"14px"} color="#64748B">
                    {eventsItem?.added_by}
                  </Text>
                </Box>
                <Text fontSize={"13px"} fontWeight={"700"} color="#f9690e">
                  {date}
                </Text>
              </Box>
              <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                  <HistoryIcon width="18px" height="18px" />
                  <Text fontSize={"12px"} color="#475569" textTransform={"capitalize"}>
                    {time}
                  </Text>
                </Box>
                <Text fontSize={"13px"} fontWeight={"500"} color="#475569">
                  {eventtime}
                </Text>
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
                key={EventImages[currentImageIndex]?.url}
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
                  style={{ objectFit: "cover" }}
                  src={EventImages[currentImageIndex]?.url}
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
                {trimTitle(`${eventsItem?.title}`)}
              </Text>
              <Text fontSize={"14px"} mb={"14px"} fontWeight={"500"} color="#94A3B8">
                {`Category / Sub-Category`}
              </Text>
            </Box>

            <Box display={"flex"} flexDir={"column"} alignItems={"flex-start"} justifyContent={"center"} gap={"14px"}>
              <Box display={"flex"} gap={"4px"} alignItems={"center"}>
                <PeopleIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {age_group} years
                </Text>
              </Box>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <PincodeIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {eventsItem?.zip}
                </Text>
              </Box>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <AvatarIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {eventsItem?.added_by}
                </Text>
              </Box>
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
                  {eventsItem?.available_spots || 0}
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
            <RWebShare
              data={{
                text: "Checkout this post",
                url: `/event/${id}`,
                title: "google",
              }}
            >
              <Box
                w={"28px"}
                h={"28px"}
                bg={"#FFF"}
                boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
                p={"5px"}
                borderRadius={"50%"}
                cursor={"pointer"}
                _hover={{ bg: "#F7FAFC" }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                // onClick={() => shareTab()}
              >
                <ShareIcon width="100%" height="100%" fill={hover ? "#EA580C" : "#000"} />
              </Box>
            </RWebShare>

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
                <MenuItem
                  onClick={() => {
                    handleDeleteEvent(`${eventsItem?.id}`);
                  }}
                >
                  Delete
                </MenuItem>
                {/* <MenuItem>Create a Copy</MenuItem> */}
              </MenuList>
            </Menu>
          </Box>
        </Box>
      }
    </>
  );
}
