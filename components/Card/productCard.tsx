/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  Box,
  Image,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useToast,
} from "@chakra-ui/react";
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
import { ProductItem } from "@/types/product";
import ProductIcon from "../Icons/ProductIcon";
import CardEditeIcon from "../Icons/CardEditeIcon";
import DeleteIcon from "../Icons/DeleteIcon";

//this is used to view both post and event - need further opt for events though

interface ProductCardProps {
  userData: UserData | undefined;
  productItem: ProductItem | undefined;
  view: string;
  showActions?: boolean;
}
export default function ProductCard({
  userData,
  productItem,
  view,
  showActions = false,
}: ProductCardProps) {
  //const { user } = useSelector((state) => state.auth);
  const [hover, setHover] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const toast = useToast();

  const name = `${productItem?.name}`;
  const description = `${productItem?.description}`;
  const plainText = description.replace(/<[^>]*>/g, ""); 
  const price = `${productItem?.price}`;
  //const is_event = postItem?.is_event;
  const id = productItem?.id;
  //const activity_link = is_event ? `/event/${id}` : `/posts/${id}`;
  const product_link = `/product/${id}`;
  const isSponsored = true;
  const isProducted = true;
  //const peopleInterested = postItem?.peopleInterested;
  //const postDate = postItem?.start_time;
  //const createdAt = postItem?.created_at;
  //const zip = postItem?.zip;
  //const admin_name = postItem?.added_by;
  const leftSpace = "";
  //const age = `${`${postItem?.age_group}`.split("age_")[1]}`.split("_");
  //const age_group = age[0] ? `${age[0]} to ${age[1]}` : `13 to 60`;

  //const age = `${`${userData?.age_group}`.split("age_")[1]}`.split("_");
  //const age_group_max = `${`${age.split("_")[1]}`.split("-")[1]}`;

  //const date = dayjs(postDate).format("MMM DD, YYYY");

  //const time = dayjs(createdAt).fromNow();

  const PostImages = productItem?.images || [];
  const defaultImage = "/placeholder.png";

  const getCurrentImage = () => {
    // if (PostImages.length === 0) {
    //   return defaultImage;
    // }
     return PostImages[currentImageIndex]?.url || defaultImage;
  };

  const imageVariants = {
    enter: { opacity: 0 },
    center: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const rotateImage = useCallback(() => {
    // if (PostImages.length > 1) {
    //   setCurrentImageIndex((prevIndex) => (prevIndex + 1) % PostImages.length);
    // }
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
    } catch (error) { }
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
      {view !== "list" ? (
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
            <Link href={product_link}>
              <Image
                objectFit="contain"
                src={getCurrentImage()}
                alt={`Product Image ${currentImageIndex + 1}`}
                w="100%"
                h="100%"
                onLoad={() => setIsImageLoaded(true)}
              />
            </Link>

            <Box
              display={"flex"}
              w="full"
              justifyContent={"flex-end"}
              gap="5px"
              pos={"absolute"}
              top={"0px"}
              right={"0px"}
              p="10px"
            >
              <Box display={"flex"} gap={"5px"}>
                {showActions && (
                  <Link href={`/product/create?id=${id}`}>
                    <Box
                      w="28px"
                      h="28px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg="#FFF"
                      boxShadow="0px 4px 24px 0px rgba(0, 0, 0, 0.06)"
                      borderRadius="50%"
                      cursor="pointer"
                      tabIndex={0}
                      aria-label="Edit product"
                      _hover={{
                        boxShadow: "0px 6px 28px 0px rgba(234, 88, 12, 0.15)",
                      }}
                    >
                      <CardEditeIcon width="16px" height="16px" />
                    </Box>
                  </Link>
                )}
              </Box>

              <Box display={"flex"} gap={"5px"}>
                <Box onClick={handleShareClick}>
                  <RWebShare
                    data={{
                      text: "Checkout this product",
                      url: `/product/${id}`,
                      title: `${name}`,
                    }}
                  >
                    <Box
                      w={"28px"}
                      h={"28px"}
                      bg={"transparent"}
                      position="relative"
                      _before={{
                        content: '""',
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        bottom: "-10px",
                        left: "-10px",
                        background: "transparent",
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
                        <ShareIcon
                          width="100%"
                          height="100%"
                          fill={hover ? "#EA580C" : "#000"}
                        />
                      </Box>
                    </Box>
                  </RWebShare>
                </Box>
              </Box>
            </Box>
          </Box>

          <Link href={product_link}>
            <Box
              p={"15px"}
              w={"full"}
              _hover={{ textDecoration: "none" }}
              display={"inline-block"}
            >
              <Text
                fontSize={"18px"}
                letterSpacing={"-0.5px"}
                fontWeight={"600"}
                mb={"4px"}
                color="#f9690e"
              >
                ${`${Number(price).toFixed(2)}`}
              </Text>
              <Text
                fontSize={"18px"}
                fontWeight={"600"}
                mb={"4px"}
                color="#000"
              >
                {`${name}`}
              </Text>
              <Text
                fontSize={"14px"}
                mb={"14px"}
                fontWeight={"400"}
                color="#94A3B8"
              >
                {plainText.length > 150
                  ? `${plainText.substring(0, 150)}...`
                  : plainText}
              </Text>
            </Box>
          </Link>
        </Box>
      ) : (
        <Box
          w={"full"}
          h={"full"}
          bg={"#FFF"}
          borderRadius={"12px"}
          border={"1px solid #E2E8F0"}
          overflow={"hidden"}
          position={"relative"}
          display={"flex"}
        >
          <Box
            w={"full"}
            maxW={"325px"}
            h={"full"}
            maxH={"175px"}
            minHeight={"150px"}
          >
            <Image
              loading="lazy"
              objectFit="contain"
              src={getCurrentImage()}
              alt={`Product Image ${currentImageIndex + 1}`}
              w="100%"
              h="100%"
              onLoad={() => setIsImageLoaded(true)}
            />
          </Box>

          <Box
            w={"full"}
            position={"relative"}
            p={"15px"}
            pl={"40px"}
            _hover={{ textDecoration: "none" }}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
            gap={10}
          >
            <Link href={product_link}>
              <Box w={"full"} maxW={350}>
                <Text
                  fontSize={"18px"}
                  letterSpacing={"-0.5px"}
                  fontWeight={"600"}
                  mb={"4px"}
                  color="#f9690e"
                >
                  ${`${price}`}
                </Text>
                <Text
                  fontSize={"18px"}
                  letterSpacing={"-0.5px"}
                  fontWeight={"600"}
                  mb={"4px"}
                  color="#020617"
                >
                  {`${name}`}
                </Text>
              </Box>

              <Box
                display={"flex"}
                flexDir={"column"}
                alignItems={"flex-start"}
                justifyContent={"center"}
                gap={"14px"}
              >
                <Box display={"flex"} gap={"4px"} alignItems={"center"}>
                  <Text
                    fontSize={"14px"}
                    mb={"14px"}
                    fontWeight={"400"}
                    color="#94A3B8"
                  >
                    {plainText.length > 150
                      ? `${plainText.substring(0, 150)}...`
                      : plainText}
                  </Text>
                </Box>
              </Box>
            </Link>

            <Box
              display={"flex"}
              gap={"10px"}
              h={"full"}
              alignItems={"center"}
              px={"1em"}
            >
              <Box display={"flex"} gap={"5px"}>
                {showActions && (
                  <Link href={`/product/create?id=${id}`}>
                    <Box
                      w="28px"
                      h="28px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg="#FFF"
                      boxShadow="0px 4px 24px 0px rgba(0, 0, 0, 0.06)"
                      borderRadius="50%"
                      cursor="pointer"
                      tabIndex={0}
                      aria-label="Edit product"
                      _hover={{
                        boxShadow: "0px 6px 28px 0px rgba(234, 88, 12, 0.15)",
                      }}
                    >
                      <CardEditeIcon width="16px" height="16px" />
                    </Box>
                  </Link>
                )}
              </Box>

              <Box display={"flex"} gap={"5px"}>
                <Box>
                  {showActions && (
                    <Box
                      w={"28px"}
                      h={"28px"}
                      bg={"transparent"}
                      position="relative"
                      _before={{
                        content: '""',
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        bottom: "-10px",
                        left: "-10px",
                        background: "transparent",
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
                        <DeleteIcon width="100%" height="100%" />
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              <Box display={"flex"} gap={"5px"}>
                <Box onClick={handleShareClick}>
                  <RWebShare
                    data={{
                      text: "Checkout this product",
                      url: `/product/${id}`,
                      title: `${name}`,
                    }}
                  >
                    <Box
                      w={"28px"}
                      h={"28px"}
                      bg={"transparent"}
                      position="relative"
                      _before={{
                        content: '""',
                        position: "absolute",
                        top: "-10px",
                        right: "-10px",
                        bottom: "-10px",
                        left: "-10px",
                        background: "transparent",
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
                        <ShareIcon
                          width="100%"
                          height="100%"
                          fill={hover ? "#EA580C" : "#000"}
                        />
                      </Box>
                    </Box>
                  </RWebShare>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}