"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  IconButton,
  HStack,
} from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// Define types for slider data
interface SliderItem {
  id: string | number;
  title: string;
  description: string | null;
  images: {
    url: string; // e.g., http://localhost:3000/api/images/activities/cZuUfD7LsU.avif
  };
  category?: string | null;
  subcategory?: string | null;
}

// Fallback slider content
const fallbackSliders = [
  {
    id: 1,
    title: 'Find Your Activity,\nJoin the Fun.',
    description: 'Discover and join activities near you. Connect with others and stay active.',
    images: {
      url: '/images/fallback.avif', // Add a fallback image in public/images
    },
  },
];

const HeroSection = () => {
  const [sliderContent, setSliderContent] = useState<SliderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch slider data
  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const response = await fetch('/api/sliders');
        const result = await response.json();
        
        if (result.status && result.data.length > 0) {
          setSliderContent(result.data);
        } else {
          setSliderContent(fallbackSliders);
        }
      } catch (error) {
        console.error('Error fetching sliders:', error);
        setSliderContent(fallbackSliders);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSliders();
  }, []);

  useEffect(() => {
    if (sliderContent.length === 0) return;
    
    const slideInterval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % sliderContent.length);
    }, 6000);

    return () => clearInterval(slideInterval);
  }, [sliderContent]);

  const nextSlide = useCallback(() => {
    if (sliderContent.length === 0) return;
    setCurrentSlide(prev => (prev + 1) % sliderContent.length);
  }, [sliderContent]);

  const prevSlide = useCallback(() => {
    if (sliderContent.length === 0) return;
    setCurrentSlide(prev => (prev - 1 + sliderContent.length) % sliderContent.length);
  }, [sliderContent]);

  if (loading || sliderContent.length === 0) {
    return <Box minH="100vh" bg="gray.100" />;
  }

  return (
    <Box position="relative" minH="100vh" w="100%" overflow="hidden">
      <AnimatePresence initial={false}>
        {sliderContent.map((slide, index) => (
          <motion.div
            key={slide.id}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: index === currentSlide ? 1 : 0
            }}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: index === currentSlide ? 1 : 0,
              transition: { duration: 1.2 }
            }}
            exit={{ opacity: 0 }}
          >
            {/* Optimized Next.js Image for hero background */}
            <Image
              src={slide.images.url}
              alt={slide.title}
              fill
              priority={index === 0}
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAn8B9Qn2qgAAAABJRU5ErkJggg=="
              style={{ objectFit: 'cover', zIndex: 0 }}
            />
            {/* Overlay gradient Box */}
            <Box
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              w="100%"
              h="100%"
              minH="100vh"
              sx={{
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0.05) 100%)',
                  zIndex: 1
                }
              }}
              filter="brightness(0.9)"
            />
          </motion.div>
        ))}
      </AnimatePresence>

      <Box position="absolute" top="0" left="0" right="0" bottom="0" zIndex="10" pointerEvents="none">
        <Flex height="100%" justifyContent="space-between" alignItems="center" px={{ base: 4, md: 8 }} pointerEvents="none">
          <IconButton
            aria-label="Previous slide"
            icon={<ChevronLeftIcon boxSize={8} />}
            onClick={prevSlide}
            variant="solid"
            bg="blackAlpha.600"
            color="white"
            size="lg"
            width="50px"
            height="50px"
            borderRadius="full"
            _hover={{ bg: 'blackAlpha.800' }}
            pointerEvents="auto"
            boxShadow="lg"
          />
          <IconButton
            aria-label="Next slide"
            icon={<ChevronRightIcon boxSize={8} />}
            onClick={nextSlide}
            variant="solid"
            bg="blackAlpha.600"
            color="white"
            size="lg"
            width="50px"
            height="50px"
            borderRadius="full"
            _hover={{ bg: 'blackAlpha.800' }}
            pointerEvents="auto"
            boxShadow="lg"
          />
        </Flex>
      </Box>

      <Flex position="absolute" bottom="24px" left="0" right="0" justifyContent="center" zIndex="10">
        <HStack spacing={3}>
          {sliderContent.map((_, index) => (
            <Box
              key={index}
              as="button"
              w="12px"
              h="12px"
              borderRadius="full"
              bg={currentSlide === index ? "white" : "whiteAlpha.400"}
              onClick={() => setCurrentSlide(index)}
              transition="all 0.2s"
              _hover={{ bg: "whiteAlpha.700" }}
              boxShadow="0 1px 3px rgba(0,0,0,0.3)"
            />
          ))}
        </HStack>
      </Flex>

      <Box position="absolute" top="0" left="0" right="0" bottom="0" display="flex" alignItems="center" justifyContent="center" zIndex="5">
        <Container maxW="1800px" w="100%" px={{ base: 4, md: 8, lg: 12 }}>
          <Box textAlign="center" color="white" w="100%" maxW="1200px" mx="auto" transform="translateY(24px)">
            <AnimatePresence mode="wait">
              <motion.div
                key={sliderContent[currentSlide].id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <Heading
                  as="h1"
                  fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
                  mb={4}
                  fontWeight="bold"
                  lineHeight="1.2"
                  textShadow="0px 2px 4px rgba(0, 0, 0, 0.3)"
                >
                  {sliderContent[currentSlide].title.split('\n').map((text, i) => (
                    <React.Fragment key={i}>
                      {text}
                      {i < sliderContent[currentSlide].title.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </Heading>

                <Text
                  fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
                  mb={8}
                  opacity={0.9}
                  textShadow="0px 1px 2px rgba(0, 0, 0, 0.3)"
                >
                  {sliderContent[currentSlide].description}
                </Text>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HeroSection;