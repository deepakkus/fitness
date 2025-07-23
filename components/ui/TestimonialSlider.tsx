"use client";

import React, { useState, useEffect } from 'react';
import { Box, Container, Text, Heading, HStack, Image, Flex } from '@chakra-ui/react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "Jon did an amazing job of delivering exactly what he promised in clear, valuable and memorable ways. Great value for the price!",
    author: "Magenta Freeman",
    image: "/account.png",
    title: "Graphic design & illustration expert, with leading clients such as Google, Nike and Adidas.",
    name: "Junichi Tsuneoka",
    platforms: ["YouTube", "Instagram"]
  }
];

const TestimonialSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const renderStars = () => (
    <HStack spacing={1} mb={4}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={20}
          fill="#FFD700"
          color="#FFD700"
        />
      ))}
    </HStack>
  );

  return (
    <Container maxW="7xl" py={{ base: 8, md: 16 }}>
      <Flex
        direction={{ base: 'column', lg: 'row' }}
        gap={{ base: 6, lg: 0 }}
      >
        {/* Left Section */}
        <Box 
          flex="1" 
          pr={{ base: 0, lg: 8 }} 
          bg="white" 
          p={{ base: 6, md: 8, lg: 12 }}
          borderWidth="2px"
          borderStyle="solid"
          borderColor="gray.200"
          mb={{ base: 6, lg: 0 }}
        >
          <Text
            fontSize={{ base: "xl", md: "2xl" }}
            fontStyle="italic"
            color="gray.500"
            mb={8}
            lineHeight="1.6"
            textAlign="center"
          >
            "{testimonials[currentSlide].quote}"
          </Text>
          <Flex justify="center">
            {renderStars()}
          </Flex>
          <Text 
            fontSize={{ base: "md", md: "lg" }} 
            fontWeight="semibold" 
            textAlign="center"
          >
            {testimonials[currentSlide].author}
          </Text>
        </Box>

        {/* Right Section */}
        <Box
          flex="1"
          bg="#2A2A2A"
          p={{ base: 6, sm: 8, md: "40px 48px" }}
          color="white"
        >
          <Flex direction="column" h="full" justify="space-between">
            {/* Profile Section */}
            <Box>
              <Flex 
                direction={{ base: 'column', sm: 'row' }} 
                gap={{ base: 4, sm: 6 }} 
                mb={8} 
                align={{ base: 'center', sm: 'center' }}
              >
                <Image
                  src={testimonials[currentSlide].image}
                  alt={testimonials[currentSlide].name}
                  borderRadius="full"
                  boxSize={{ base: "100px", sm: "110px", md: "130px" }}
                  objectFit="cover"
                />
                <Box 
                  pt={2} 
                  textAlign={{ base: 'center', sm: 'left' }}
                >
                  <Heading
                    as="h3"
                    fontSize={{ base: "24px", md: "32px" }}
                    fontWeight="500"
                    mb={3}
                    letterSpacing="-0.02em"
                  >
                    {testimonials[currentSlide].name}
                  </Heading>
                  <Text
                    color="gray.300"
                    fontSize={{ base: "14px", md: "16px" }}
                    lineHeight="1.5"
                    fontWeight="normal"
                    maxW="300px"
                  >
                    {testimonials[currentSlide].title}
                  </Text>
                </Box>
              </Flex>
            </Box>

            {/* Worked With Section */}
            <Flex
              pt={8}
              borderTop="1px solid"
              borderColor="whiteAlpha.600"
              align="center"
              justifyContent="center"
              gap={5}
              direction={{ base: 'column', sm: 'row' }}
            >
              <Text
                color="gray.400"
                fontSize={{ base: "14px", md: "16px" }}
                fontWeight="normal"
                textAlign={{ base: 'center', sm: 'left' }}
              >
                Worked with:
              </Text>
              <Flex 
                gap={6} 
                align="center" 
                wrap={{ base: 'wrap', sm: 'nowrap' }}
                justify={{ base: 'center', sm: 'flex-start' }}
              >
                <Box w={{ base: "70px", sm: "90px" }}>
                  <Image
                    src="/Vector.png"
                    alt="YouTube"
                    h={{ base: "18px", sm: "22px" }}
                    objectFit="contain"
                    filter="brightness(0) invert(1)"
                    opacity={0.9}
                  />
                </Box>
                <Box w={{ base: "70px", sm: "90px" }}>
                  <Image
                    src="/Vector (1).png"
                    alt="Instagram"
                    h={{ base: "18px", sm: "22px" }}
                    objectFit="contain"
                    filter="brightness(0) invert(1)"
                    opacity={0.9}
                  />
                </Box>
              </Flex>
            </Flex>
          </Flex>
        </Box>
      </Flex>

      {/* Indicators */}
      <HStack justify="center" mt={{ base: 6, md: 8 }} spacing={2}>
        {testimonials.map((_, index) => (
          <Box
            key={index}
            w={2}
            h={2}
            borderRadius="full"
            bg={currentSlide === index ? "gray.800" : "gray.300"}
            cursor="pointer"
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </HStack>
    </Container>
  );
};

export default TestimonialSlider;