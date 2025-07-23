/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Box, Image, Text } from "@chakra-ui/react";
import { useState } from "react";

import { RWebShare } from "react-web-share";
import {
  AgeIcon,
  AnnouncementIcon,
  AvatarIcon,
  CalenderIcon,
  ClockIcon,
  GroupIcon,
  HistoryIcon,
  MapIcon,
  OptionsIcon,
  PincodeIcon,
  ShareIcon,
} from "@/components/Icons";

const CardItem = ({ data, view, type }) => {
  const [hover, setHover] = useState(false);
  if (data === undefined) {
    data = {
      teamName: "Team Name",
      peopleInterested: 0,
      eventDay: "Mon",
      eventDate: "12 Oct",
      eventTime: "12:00 PM",
      imageUrl: "https://picsum.photos/1280/720?random=5",
      title: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, voluptatum.",
      category: "Category",
      subcategory: "Subcategory",
      age: "12",
      leftSpace: 0,
      pincode: "123456",
      author: "Ram Kumar",
      time: "2 days ago",
      isLoggedin: false,
      isSponsored: false,
    };
  }
  const {
    teamName,
    peopleInterested = 0,
    eventDay,
    eventDate,
    eventTime,
    imageUrl,
    title,
    category,
    subcategory,
    age,
    leftSpace = 0,
    pincode,
    author,
    time,
    isLoggedin,
    isSponsored,
    description
  } = data;
  
  const trimTitle = (string) => {
    if (!string) { 
      return ""; 
    }
    if (string.length <= 55) {
      return string;
    } else {
      return (string = string.substring(0, 55) + "...");
    }
  };

  if (type == "achievedPost" && view == "list") {
    return (
      <Box
        fontFamily={"var(--font-inter)"}
        w={"full"}
        h={"full"}
        bg={"#FFF"}
        borderRadius={"12px"}
        border={"1px solid #E2E8F0"}
        overflow={"hidden"}
        position={"relative"}
        display={"flex"}
        flexDir={{ base: "column", md: "row" }}
        alignItems={"center"}
      >
        <Box w={"full"} maxH={"130px"} maxW={{ base: "full", md: "310px" }} bg={"#E2E8F0"} overflow={"hidden"}>
          <Image w={"full"} h={"full"} objectFit={"cover"} objectPosition={"50% 50%"} src={imageUrl} />
        </Box>
        <Box
          p={"15px"}
          display={"flex"}
          flexDir={{ base: "column", md: "row" }}
          justifyContent={"space-between"}
          w={"full"}
        >
          <Box>
            <Text fontSize={"14px"} mb={"7px"} color="#64748B" w={"full"}>
              {description}
            </Text>
            <Text fontSize={"18px"} letterSpacing={"-0.5px"} fontWeight={"600"} mb={"4px"} color="#020617">
              {trimTitle(title)}
            </Text>
            <Text fontSize={"14px"} mb={"14px"} fontWeight={"500"} color="#94A3B8">
              {category} 
            </Text>
          </Box>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            gap={{ base: "14px", md: "64px" }}
            px={{ base: 0, md: "20px" }}
          >
            <Box display={"flex"} flexDir={"column"} gap={"14px"} alignItems={"flex-start"}>
              {/* <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <MapIcon stroke="#f9690e" width="18px" height="18px" />
                <Text fontSize={"14px"} color="#334155">
                  {pincode}
                </Text>
              </Box> */}
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <ClockIcon stroke="#f9690e" width="18px" height="18px" />
                <Text fontSize={"14px"} color="#334155">
                  {time}
                </Text>
              </Box>
              {/* <Box display={"flex"} gap={"4px"} mb={"7px"} alignItems={"center"}>
                <GroupIcon light="true" width="18px" height="18px" stroke="#f9690e" />
                <Text fontSize={"14px"} color="#334155">
                  {age} years
                </Text>
              </Box> */}
            </Box>
            <Box
              display={"flex"}
              gap="5px"
              position={{ base: "absolute", md: "relative" }}
              top={{ base: "10px", md: 0 }}
              right={{ base: "10px", md: 0 }}
            >
              {/* <Box
                w={"28px"}
                h={"28px"}
                boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
                p={"5px"}
                borderRadius={"50%"}
                bgColor={"#FFF"}
                _hover={{ bgColor: "#F7FAFC" }}
              >
                <ShareIcon width="100%" height="100%" />
              </Box>
              <Box
                w={"28px"}
                p={"0px"}
                h={"28px"}
                boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
                borderRadius={"50%"}
                bgColor={"#FFF"}
                _hover={{ bgColor: "#F7FAFC" }}
              >
                <OptionsIcon width="100%" height="100%" />
              </Box> */}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
  if (type == "achievedEvent" && view == "list") {
    return (
      <Box
        fontFamily={"var(--font-inter)"}
        w={"full"}
        h={"full"}
        bg={"#FFF"}
        borderRadius={"12px"}
        border={"1px solid #E2E8F0"}
        overflow={"hidden"}
        position={"relative"}
        display={"flex"}
        flexDir={{ base: "column", md: "row" }}
        alignItems={"center"}
      >
        <Box w={"full"} maxH={"130px"} maxW={{ base: "full", md: "310px" }} bg={"#E2E8F0"} overflow={"hidden"}>
          <Image w={"full"} h={"full"} objectFit={"cover"} objectPosition={"50% 50%"} src={imageUrl} />
        </Box>
        <Box
          p={"15px"}
          display={"flex"}
          flexDir={{ base: "column", md: "row" }}
          justifyContent={"space-between"}
          w={"full"}
        >
          <Box>
            <Text fontSize={"14px"} mb={"7px"} color="#64748B" w={"full"}>
              Attended event
            </Text>
            <Text fontSize={"18px"} letterSpacing={"-0.5px"} fontWeight={"600"} mb={"4px"} color="#020617">
              {trimTitle(title)}
            </Text>
            <Text fontSize={"14px"} mb={"14px"} fontWeight={"500"} color="#94A3B8">
              {category} 
            </Text>
          </Box>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            gap={{ base: "14px", md: "64px" }}
            px={{ base: 0, md: "20px" }}
          >
            <Box display={"flex"} flexDir={"column"} gap={"14px"} alignItems={"flex-start"}>
              {/* <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <PincodeIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {pincode}
                </Text>
              </Box> */}
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <AvatarIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {author}
                </Text>
              </Box>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <HistoryIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {time}
                </Text>
              </Box>
            </Box>
            <Box display={"flex"} flexDir={"column"} gap={"14px"} alignItems={{ base: "flex-end", md: "flex-start" }}>
              <Text
                fontSize={"12px"}
                px="9px"
                py="3px"
                border={"1px solid #CBD5E1"}
                borderRadius={"8px"}
                fontWeight={"700"}
                color="#475569"
              >
                Available {leftSpace}
              </Text>
              <Text fontSize={"14px"} fontWeight={"500"} color={"#000"}>
                22 Feb 2023
              </Text>
            </Box>
            <Box
              display={"flex"}
              gap="5px"
              position={{ base: "absolute", md: "relative" }}
              top={{ base: "10px", md: 0 }}
              right={{ base: "10px", md: 0 }}
            >
              {/* <Box
                w={"28px"}
                h={"28px"}
                boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
                p={"5px"}
                borderRadius={"50%"}
                bgColor={"#FFF"}
                _hover={{ bgColor: "#F7FAFC" }}
              >
                <ShareIcon width="100%" height="100%" />
              </Box>
              <Box
                w={"28px"}
                p={"0px"}
                h={"28px"}
                boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
                borderRadius={"50%"}
                bgColor={"#FFF"}
                _hover={{ bgColor: "#F7FAFC" }}
              >
                <OptionsIcon width="100%" height="100%" />
              </Box> */}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (type === "achievedEvent") {
    return (
      <Box
        fontFamily={"var(--font-inter)"}
        w={"full"}
        h={"full"}
        bg={"#FFF"}
        borderRadius={"12px"}
        border={"1px solid #E2E8F0"}
        overflow={"hidden"}
        position={"relative"}
      >
        <Box h={"167px"} w={"full"} bg={"#E2E8F0"} position={"relative"}>
          <Image w={"full"} h={"full"} objectFit={"cover"} src={imageUrl} />
          {/* <Box display={"flex"} gap="5px" pos={"absolute"} top={"10px"} right={"10px"}>
            <Box
              w={"28px"}
              h={"28px"}
              bg={"#FFF"}
              boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
              p={"5px"}
              borderRadius={"50%"}
              cursor={"pointer"}
              _hover={{ bg: "#F7FAFC" }}
            >
              <ShareIcon width="100%" height="100%" />
            </Box>
            <Box
              w={"28px"}
              p={"0px"}
              h={"28px"}
              bg={"#FFF"}
              boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
              borderRadius={"50%"}
              cursor={"pointer"}
              _hover={{ bg: "#F7FAFC" }}
            >
              <OptionsIcon width="100%" height="100%" />
            </Box>
          </Box> */}
        </Box>
        <Box p={"15px"}>
          <Text fontSize={"14px"} mb={"7px"} color="#64748B" w={"full"}>
            Attended event
          </Text>
          <Text
            fontSize={"16px"}
            lineHeight={"16px"}
            fontWeight={"500"}
            letterSpacing={"-0.02em"}
            mb={"4px"}
            color="#020617"
          >
            {trimTitle(title)}
          </Text>
          <Text fontSize={"14px"} mb={"7px"} fontWeight={"500"} color="#94A3B8">
            {category} 
          </Text>
          <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} mb={"3px"}>
            <Box display={"flex"} gap="6px">
              <Text fontSize={"14px"} fontWeight={"500"} color={"#000"}>
                {eventDay}
              </Text>
              <Text fontSize={"14px"} fontWeight={"500"} color={"#f9690e"}>
                {eventDate}
              </Text>
            </Box>
            <Box display={"flex"} mr={"31px"} alignItems={"center"} gap={"4px"}>
              <MapIcon stroke="#f9690e" width="18px" height="18px" />
              <Text fontSize={"14px"} color="#334155">
                {pincode}
              </Text>
            </Box>
          </Box>
          <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
            <Box display={"flex"} gap="6px">
              <Text fontSize={"14px"} fontWeight={"500"} color={"#000"}>
                {eventTime}
              </Text>
            </Box>
            <Box display={"flex"} alignItems={"center"} gap={"4px"}>
              <ClockIcon stroke="#f9690e" width="18px" height="18px" />
              <Text fontSize={"14px"} color="#334155">
                {time}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (type === "achievedPost") {
    return (
      <Box
        fontFamily={"var(--font-inter)"}
        w={"full"}
        h={"full"}
        bg={"#FFF"}
        borderRadius={"12px"}
        border={"1px solid #E2E8F0"}
        overflow={"hidden"}
        position={"relative"}
      >
        <Box h={"167px"} w={"full"} bg={"#E2E8F0"} position={"relative"}>
          <Image w={"full"} h={"full"} objectFit={"cover"} src={imageUrl} />
          {/* <Box display={"flex"} gap="5px" pos={"absolute"} top={"10px"} right={"10px"}>
            <Box
              w={"28px"}
              h={"28px"}
              bg={"#FFF"}
              boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
              p={"5px"}
              borderRadius={"50%"}
              cursor={"pointer"}
              _hover={{ bg: "#F7FAFC" }}
            >
              <ShareIcon width="100%" height="100%" />
            </Box>
            <Box
              w={"28px"}
              p={"0px"}
              h={"28px"}
              bg={"#FFF"}
              boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
              borderRadius={"50%"}
              cursor={"pointer"}
              _hover={{ bg: "#F7FAFC" }}
            >
              <OptionsIcon width="100%" height="100%" />
            </Box>
          </Box> */}
        </Box>
        <Box p={"15px"}>
          <Text fontSize={"14px"} mb={"7px"} color="#64748B" w={"full"}>
            {description}
          </Text>
          <Text
            fontSize={"16px"}
            lineHeight={"16px"}
            fontWeight={"500"}
            letterSpacing={"-0.02em"}
            mb={"4px"}
            color="#020617"
          >
            {trimTitle(title)}
          </Text>
          <Text fontSize={"14px"} mb={"7px"} fontWeight={"500"} color="#94A3B8">
            {category} 
          </Text>
          {/* <Box display={"flex"} gap={"4px"} mb={"7px"} alignItems={"center"}>
            <GroupIcon light="true" width="18px" height="18px" stroke="#f9690e" />
            <Text fontSize={"14px"} color="#334155">
              {age} years
            </Text>
          </Box> */}

          <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
            {/* <Box display={"flex"} alignItems={"center"} gap={"4px"}>
              <MapIcon stroke="#f9690e" width="18px" height="18px" />
              <Text fontSize={"14px"} color="#334155">
                {pincode}
              </Text>
            </Box> */}
            <Box display={"flex"} alignItems={"center"} gap={"4px"}>
              <ClockIcon stroke="#f9690e" width="18px" height="18px" />
              <Text fontSize={"14px"} color="#334155">
                {time}
              </Text>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (view === "list" && type === "event") {
    return (
      <Box
        w={"full"}
        bg={"#FFF"}
        borderRadius={"12px"}
        border={"1px solid #E2E8F0"}
        overflow={"hidden"}
        position={"relative"}
        display={"flex"}
        flexDir={{ base: "column", md: "row" }}
        alignItems={"center"}
      >
        <Box w={"full"} maxH={"160px"} maxW={{ base: "full", md: "310px" }} bg={"#E2E8F0"} overflow={"hidden"}>
          <Image w={"full"} h={"full"} objectFit={"cover"} objectPosition={"50% 50%"} src={imageUrl} />
        </Box>
        <Box
          p={"15px"}
          display={"flex"}
          flexDir={{ base: "column", md: "row" }}
          justifyContent={"space-between"}
          w={"full"}
        >
          <Box flex={"1"}>
            <Text fontSize={"14px"} mb={"7px"} color="#64748B" w={"full"}>
              {peopleInterested} people interested
            </Text>
            <Text
              fontSize={"18px"}
              letterSpacing={"-0.5px"}
              fontWeight={"600"}
              mb={"4px"}
              color="#020617"
              // maxW={"300px"}
            >
              {trimTitle(title)}
            </Text>
            <Text fontSize={"14px"} mb={"14px"} fontWeight={"500"} color="#94A3B8">
              {category}
            </Text>
          </Box>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            gap={{ base: "14px", md: "24px" }}
            px={{ base: 0, md: "20px" }}
          >
            <Box display={"flex"} flexDir={"column"} gap={"14px"} alignItems={"flex-start"}>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <PincodeIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {pincode}
                </Text>
              </Box>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <AvatarIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {author}
                </Text>
              </Box>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <HistoryIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {time}
                </Text>
              </Box>
            </Box>
            <Box display={"flex"} flexDir={"column"} gap={"14px"} alignItems={{ base: "flex-end", md: "flex-start" }}>
              <Text fontSize={"14px"} color="#64748B">
                {eventDay}
              </Text>
              <Text fontSize={"14px"} fontWeight={"700"} color="#64748B">
                {eventDate}
              </Text>
              <Text fontSize={"14px"} color="#64748B">
                {eventTime}
              </Text>
            </Box>
            <Box
              display={"flex"}
              gap="5px"
              position={{ base: "absolute", md: "relative" }}
              top={{ base: "10px", md: 0 }}
              right={{ base: "10px", md: 0 }}
            >
              <Box
                w={"28px"}
                h={"28px"}
                boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
                p={"5px"}
                borderRadius={"50%"}
                bgColor={"#FFF"}
                _hover={{ bgColor: "#F7FAFC" }}
              >
                <ShareIcon width="100%" height="100%" />
              </Box>
              <Box
                w={"28px"}
                p={"0px"}
                h={"28px"}
                boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
                borderRadius={"50%"}
                bgColor={"#FFF"}
                _hover={{ bgColor: "#F7FAFC" }}
              >
                <OptionsIcon width="100%" height="100%" />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (type === "event") {
    return (
      <Box
        fontFamily={"var(--font-muslish)"}
        w={"full"}
        maxW={"350px"}
        h={"full"}
        bg={"#FFF"}
        borderRadius={"12px"}
        border={"1px solid #E2E8F0"}
        overflow={"hidden"}
        position={"relative"}
      >
        <Box h={"167px"} w={"full"} bg={"#E2E8F0"} position={"relative"}>
          <Image w={"full"} h={"full"} objectFit={"cover"} src={imageUrl} />
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
            <Box>
              <RWebShare
                data={{
                  text: "Checkout this post",
                  url: "https://www.google.com/",
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
              <Box
                display={isLoggedin ? "flex" : "none"}
                w={"28px"}
                p={"0px"}
                h={"28px"}
                bg={"#FFF"}
                boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
                borderRadius={"50%"}
                cursor={"pointer"}
                _hover={{ bg: "#F7FAFC" }}
              >
                <OptionsIcon width="100%" height="100%" />
              </Box>
            </Box>
          </Box>
        </Box>
        <a href={`/event/details?id=${1234}`} suppressHydrationWarning={true}>
          <Box p={"15px"} _hover={{ textDecoration: "none" }} display={"inline-block"}>
            <Text fontSize={"14px"} mb={"7px"} color="#64748B" w={"full"}>
              {peopleInterested} people interested
            </Text>
            <Text fontSize={"18px"} letterSpacing={"-0.5px"} fontWeight={"600"} mb={"4px"} color="#020617">
              {trimTitle(title)}
            </Text>
            <Text fontSize={"14px"} mb={"14px"} fontWeight={"500"} color="#94A3B8">
              {category} 
            </Text>
            <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} mb={"14px"}>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <PincodeIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {pincode}
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
                  {author}
                </Text>
              </Box>
              <Text fontSize={"13px"} fontWeight={"700"} color="#f9690e">
                {eventDate}
              </Text>
            </Box>
            <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <HistoryIcon width="18px" height="18px" />
                <Text fontSize={"12px"} color="#475569">
                  {time}
                </Text>
              </Box>
              <Text fontSize={"13px"} fontWeight={"500"} color="#475569">
                {eventTime}
              </Text>
            </Box>
          </Box>
        </a>
      </Box>
    );
  }

  if (view === "list") {
    return (
      <Box
        w={"full"}
        bg={"#FFF"}
        borderRadius={"12px"}
        border={"1px solid #E2E8F0"}
        overflow={"hidden"}
        position={"relative"}
        display={"flex"}
        flexDir={{ base: "column", md: "row" }}
        alignItems={"center"}
      >
        <Box w={"full"} maxH={"160px"} maxW={{ base: "full", md: "310px" }} bg={"#E2E8F0"} overflow={"hidden"}>
          <Image w={"full"} h={"full"} objectFit={"cover"} objectPosition={"50% 50%"} src={imageUrl} />
        </Box>
        <Box
          p={"15px"}
          display={"flex"}
          flexDir={{ base: "column", md: "row" }}
          justifyContent={"space-between"}
          w={"full"}
        >
          <Box flex={"1"} to={`/posts/post?id=${1234}`} _hover={{ textDecoration: "none" }}>
            <Text fontSize={"14px"} mb={"7px"} color="#64748B" w={"full"}>
              {teamName}
            </Text>
            <Text
              fontSize={"18px"}
              letterSpacing={"-0.5px"}
              fontWeight={"600"}
              mb={"4px"}
              color="#020617"
              // maxW={"300px"}
            >
              {trimTitle(title)}
            </Text>
            <Text fontSize={"14px"} mb={"14px"} fontWeight={"500"} color="#94A3B8">
              {category} 
            </Text>
          </Box>
          <Box
            display={"flex"}
            justifyContent={"space-between"}
            gap={{ base: "14px", md: "24px" }}
            px={{ base: 0, md: "20px" }}
          >
            <Box display={"flex"} flexDir={"column"} gap={"14px"} alignItems={"flex-start"}>
              <Box display={"flex"} gap={"4px"} alignItems={"center"}>
                <AgeIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {age} years
                </Text>
              </Box>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <PincodeIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {pincode}
                </Text>
              </Box>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <AvatarIcon width="18px" height="18px" />
                <Text fontSize={"14px"} color="#64748B">
                  {author}
                </Text>
              </Box>
            </Box>
            <Box display={"flex"} flexDir={"column"} gap={"14px"} alignItems={{ base: "flex-end", md: "flex-start" }}>
              <Text
                fontSize={"12px"}
                px="9px"
                py="3px"
                border={"1px solid #CBD5E1"}
                borderRadius={"8px"}
                fontWeight={"700"}
                color="#475569"
              >
                Available {leftSpace}
              </Text>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <CalenderIcon width="18px" height="18px" stroke="#EA580C" />
                <Text fontSize={"14px"} color="#64748B">
                  {"22 Feb 2023"}
                </Text>
              </Box>
              <Box display={"flex"} alignItems={"center"} gap={"4px"}>
                <HistoryIcon width="18px" height="18px" />
                <Text fontSize={"12px"} color="#475569">
                  {time}
                </Text>
              </Box>
            </Box>
            <Box
              display={"flex"}
              gap="5px"
              position={{ base: "absolute", md: "relative" }}
              top={{ base: "10px", md: 0 }}
              right={{ base: "10px", md: 0 }}
            >
              <RWebShare
                data={{
                  text: "Checkout this post",
                  url: "https://www.google.com/",
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
              <Box
                display={isLoggedin ? "flex" : "none"}
                w={"28px"}
                p={"0px"}
                h={"28px"}
                boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
                borderRadius={"50%"}
                bgColor={"#FFF"}
                _hover={{ bgColor: "#F7FAFC" }}
              >
                <OptionsIcon width="100%" height="100%" />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
  return (
    <Box
      w={"full"}
      maxW={"350px"}
      minW={"315px"}
      h={"full"}
      bg={"#FFF"}
      borderRadius={"12px"}
      border={"1px solid #E2E8F0"}
      overflow={"hidden"}
      position={"relative"}
    >
      <Box h={"167px"} w={"full"} bg={"#E2E8F0"} position={"relative"}>
        <Image w={"full"} h={"full"} objectFit={"cover"} src={imageUrl} />
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
          <Box display={"flex"} gap={"10px"}>
            <RWebShare
              data={{
                text: "Checkout this post",
                url: "https://www.google.com/",
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

            <Box
              display={isLoggedin ? "flex" : "none"}
              w={"28px"}
              p={"0px"}
              h={"28px"}
              bg={"#FFF"}
              boxShadow={"0px 4px 24px 0px rgba(0, 0, 0, 0.06)"}
              borderRadius={"50%"}
              cursor={"pointer"}
              _hover={{ bg: "#F7FAFC" }}
            >
              <OptionsIcon width="100%" height="100%" />
            </Box>
          </Box>
        </Box>
      </Box>
      <Box p={"15px"} to={`/posts/post?id=${1234}`} _hover={{ textDecoration: "none" }} display={"inline-block"}>
        <Text fontSize={"14px"} mb={"7px"} color="#64748B" w={"full"}>
          {teamName}
        </Text>
        <Text fontSize={"18px"} letterSpacing={"-0.5px"} fontWeight={"600"} mb={"4px"} color="#020617">
          {trimTitle(title)}
        </Text>
        <Text fontSize={"14px"} mb={"14px"} fontWeight={"500"} color="#94A3B8">
          {category} 
        </Text>
        <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"} mb={"14px"}>
          <Box display={"flex"} gap={"4px"} alignItems={"center"}>
            <AgeIcon width="18px" height="18px" />
            <Text fontSize={"14px"} color="#64748B">
              {age} years
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
              {leftSpace}
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
              {pincode}
            </Text>
          </Box>
          <Box display={"flex"} alignItems={"center"} gap={"4px"}>
            <AvatarIcon width="18px" height="18px" />
            <Text fontSize={"14px"} color="#64748B">
              {author}
            </Text>
          </Box>
        </Box>
        <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
          <Box display={"flex"} alignItems={"center"} gap={"4px"}>
            <CalenderIcon width="18px" height="18px" stroke="#EA580C" />
            <Text fontSize={"14px"} color="#64748B">
              {"22 Feb 2023"}
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
    </Box>
  );
};

/* eslint-disable */
const shareTab = () => {
  const url = "https://www.google.com/";
  const title = "title";
  const text = "text";
  const shareData = { title, text, url };
  navigator.share(shareData);
};

export default CardItem;
