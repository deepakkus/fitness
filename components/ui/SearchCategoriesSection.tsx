"use client";

import React, { useState, useEffect } from 'react';
import {
  Box, 
  Container,
  Input,
  Flex,
  Stack,
  Skeleton,
  useColorModeValue,
  InputGroup,
  IconButton,
  HStack,
  Tag,
  TagLabel,
  useBreakpointValue
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';

const SearchCategoriesSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // Updated to handle objects with id and name properties
  const [popularActivities, setPopularActivities] = useState([]);
  const [loadingPopularActivities, setLoadingPopularActivities] = useState(true);
  const router = useRouter();
  
  // Responsive sizes
  const searchBarWidth = useBreakpointValue({ base: "90%", md: "700px", lg: "800px" });
  const searchBarHeight = useBreakpointValue({ base: "54px", md: "60px" });
  // const iconSize = useBreakpointValue({ base: "18px", md: "20px" });
  
  // Theme colors
  // const bgColor = useColorModeValue("white", "gray.800");
  const searchBarBg = useColorModeValue("white", "gray.800");
  const tagBg = useColorModeValue("white", "gray.700");
  const tagHoverBg = useColorModeValue("green.50", "green.900");
  const sectionBgColor = useColorModeValue("gray.50", "gray.900");
  const gradientStart = useColorModeValue("rgba(72, 187, 120, 0.1)", "rgba(72, 187, 120, 0.05)");
  const gradientEnd = useColorModeValue("rgba(72, 187, 120, 0)", "rgba(72, 187, 120, 0)");
  
  useEffect(() => {
    const fetchPopularActivities = async () => {
      try {
        const response = await axios.get('/api/popular-activities');
        setPopularActivities(response.data);
      } catch (error) {
        console.error('Failed to fetch popular activities:', error);
      } finally {
        setLoadingPopularActivities(false);
      }
    };

    fetchPopularActivities();
  }, []);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push(`/search?title=${searchQuery}`);
    }
  };

  const handlePopularActivityClick = (activity) => {
    // Update the search query display with the name but navigate using ID
    setSearchQuery(activity.name);
    router.push(`/search?activity_type_id=${activity.id}`);
  };

  return (
    <Box 
      as="section"
      position="relative"
      py={10}
      bg={sectionBgColor}
      borderBottomWidth="1px"
      borderColor={useColorModeValue("gray.200", "gray.700")}
      bgImage={`
        linear-gradient(180deg, ${gradientStart} 0%, ${gradientEnd} 100%),
        url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%2348BB78' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E")
      `}
      backgroundPosition="center"
      backgroundSize="cover"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `linear-gradient(to bottom, ${gradientStart}, ${gradientEnd})`,
        zIndex: 0,
      }}
      overflow="hidden"
    >
      <Container maxW="container.xl" px={{ base: 4, md: 6 }} position="relative" zIndex={1}>
        {/* Main content wrapper */}
        <Stack spacing={8} align="center">
          {/* Search Bar Component */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%", display: "flex", justifyContent: "center" }}
          >
            <InputGroup size="lg" width={searchBarWidth}>
              <Input
                placeholder="Find your next activity..."
                backgroundColor={searchBarBg}
                height={searchBarHeight}
                borderRadius="full"
                fontSize={{ base: "md", md: "lg" }}
                pl={10}
                pr={20}
                border="1px solid"
                borderColor={useColorModeValue("gray.200", "gray.600")}
                _hover={{ borderColor: useColorModeValue("gray.300", "gray.500") }}
                _focus={{ 
                  boxShadow: "0 0 0 3px rgba(72, 187, 120, 0.2)",
                  borderColor: "green.400" 
                }}
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                boxShadow="lg"
              />
              
              <IconButton
                position="absolute"
                right={2}
                top="50%"
                transform="translateY(-50%)"
                aria-label="Search"
                icon={<FaSearch />}
                size="md"
                colorScheme="green"
                borderRadius="full"
                onClick={handleSearchSubmit}
                zIndex={2}
                _hover={{
                  transform: "translateY(-50%) scale(1.05)",
                  bg: "green.500"
                }}
                transition="all 0.2s"
              />
            </InputGroup>
          </motion.div>
          
          {/* Popular Categories Component */}
          <Box width="100%">
            {loadingPopularActivities ? (
              <Flex justify="center" wrap="wrap" gap={3}>
                {[...Array(8)].map((_, index) => (
                  <Skeleton 
                    key={index} 
                    height="32px" 
                    width={{ base: "80px", md: "100px" }} 
                    borderRadius="full"
                  />
                ))}
              </Flex>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <HStack 
                  spacing={0} 
                  justify="center" 
                  flexWrap="wrap"
                  gap={3}
                  mt={2}
                >
                  {popularActivities.map((activity, index) => (
                    <Tag
                      key={index}
                      size="lg"
                      borderRadius="full"
                      variant="subtle"
                      bg={tagBg}
                      boxShadow="sm"
                      cursor="pointer"
                      py={2}
                      px={4}
                      onClick={() => handlePopularActivityClick(activity)}
                      _hover={{
                        bg: tagHoverBg,
                        color: "green.600",
                        transform: "translateY(-2px)",
                        boxShadow: "md"
                      }}
                      transition="all 0.2s"
                    >
                      <TagLabel fontWeight="medium">{activity.name}</TagLabel>
                    </Tag>
                  ))}
                </HStack>
              </motion.div>
            )}
          </Box>
        </Stack>
      </Container>
      
      {/* Enhanced Decorative Elements */}
      <Box
        position="absolute"
        top={0}
        right={0}
        width="50%"
        height="100%"
        backgroundImage={`radial-gradient(circle at top right, ${gradientStart} 0%, ${gradientEnd} 70%)`}
        zIndex={0}
        pointerEvents="none"
        opacity={0.8}
      />
      <Box
        position="absolute"
        bottom={0}
        left={0}
        width="50%"
        height="100%"
        backgroundImage={`radial-gradient(circle at bottom left, ${gradientStart} 0%, ${gradientEnd} 70%)`}
        zIndex={0}
        pointerEvents="none"
        opacity={0.8}
      />
    </Box>
  );
};

export default SearchCategoriesSection;