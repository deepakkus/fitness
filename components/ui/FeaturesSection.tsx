"use client";
import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  List, 
  ListItem, 
  Flex, 
  useColorModeValue, 
  Icon,
  chakra
} from '@chakra-ui/react';

// Icons
import { 
  FaUserFriends, 
  FaGamepad, 
  FaShieldAlt, 
  FaCheck
} from 'react-icons/fa';

// Define type for feature items
interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  benefits: string[];
  accentColor: string;
}

/**
 * FeatureCard Component
 * Implements an expandable card with hover detection
 */
const FeatureCard: React.FC<FeatureItem> = ({ 
  title, 
  description, 
  icon, 
  benefits, 
  accentColor 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');
  
  // Reference to measure heights and calculate animations
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <Box 
      ref={containerRef}
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition="transform 0.3s ease-out"
      transform={isHovered ? "translateY(-5px)" : "translateY(0)"}
      height="auto"
      zIndex={isHovered ? 20 : 1}
      // Critical: This prevents the grid from forcing equal heights
      alignSelf="flex-start"
      // Add margin to ensure spacing between cards
      mb={8}
    >
      <Box
        bg={bgColor}
        borderRadius="lg"
        boxShadow={isHovered ? "0 12px 28px rgba(0,0,0,0.12)" : "0 4px 12px rgba(0,0,0,0.05)"}
        border="1px solid"
        borderColor={borderColor}
        overflow="hidden"
        height="100%"
        transition="box-shadow 0.3s ease, transform 0.3s ease-out"
      >
        {/* Feature Card Header */}
        <Box 
          p={6} 
          bg={`${accentColor}.50`}
          borderBottom="1px solid"
          borderColor={borderColor}
          position="relative"
          overflow="hidden"
        >
          <Box 
            position="absolute" 
            right="-20px" 
            bottom="-20px" 
            opacity={0.1} 
            width="100px" 
            height="100px"
          >
            <Icon as={icon.type} w="100%" h="100%" />
          </Box>
          
          <Flex align="center" mb={4}>
            <Box
              bg={`${accentColor}.500`}
              color="white"
              p={3}
              borderRadius="lg"
              mr={4}
              transition="transform 0.3s ease"
              transform={isHovered ? "scale(1.1)" : "scale(1)"}
            >
              {React.cloneElement(icon, { size: 28 })}
            </Box>
            <Heading
              as="h3"
              fontSize="xl"
              fontWeight="700"
              color={textColor}
              id={`feature-heading-${title.replace(/\s+/g, '-').toLowerCase()}`}
              letterSpacing="tight"
            >
              {title}
            </Heading>
          </Flex>
          
          <Text color={secondaryTextColor} fontSize="md" lineHeight="tall">
            {description}
          </Text>
        </Box>
        
        {/* Feature Details Section */}
        <Box 
          p={6} 
          bg={isHovered && benefits.length > 3 ? `${accentColor}.50` : bgColor}
          borderTop={isHovered && benefits.length > 3 ? `1px dashed ${borderColor}` : "none"}
          transition="background-color 0.3s ease, border-top 0.3s ease"
        >
          <List spacing={3}>
            {benefits.map((benefit, index) => (
              <ListItem 
                key={index} 
                display="flex" 
                alignItems="flex-start"
                transition="all 0.3s ease"
                _hover={{ transform: "translateX(5px)" }}
                opacity={index < 3 || isHovered ? 1 : 0}
                maxH={index < 3 || isHovered ? "200px" : "0px"}
                mb={index < 3 || isHovered ? 3 : 0}
                overflow="hidden"
                transform={index >= 3 && isHovered ? "translateY(0)" : index >= 3 ? "translateY(-10px)" : "translateY(0)"}
                pointerEvents={index < 3 || isHovered ? "auto" : "none"}
                style={{
                  transitionDelay: isHovered ? `${(index - 3) * 50}ms` : '0ms'
                }}
              >
                <Box 
                  minWidth="22px" 
                  color={`${accentColor}.500`} 
                  mt="3px" 
                  mr={2}
                >
                  <Icon as={FaCheck} />
                </Box>
                <Text color={secondaryTextColor} fontSize="sm" lineHeight="1.6">
                  {benefit}
                </Text>
              </ListItem>
            ))}
          </List>
          
          {benefits.length > 3 && !isHovered && (
            <Box 
              height="24px"
              mt={3}
              opacity={0.75}
              bgGradient={`linear(to-t, ${bgColor}, transparent)`}
              position="relative"
              _after={{
                content: '""',
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                bottom: "0",
                width: "40px",
                height: "3px",
                bg: `${accentColor}.200`,
                borderRadius: "full"
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

/**
 * Custom CSS Grid implementation to replace SimpleGrid
 * This ensures each card maintains independent height
 */
const ResponsiveGrid = chakra(Box, {
  baseStyle: {
    display: "grid",
    gridTemplateColumns: {
      base: "1fr",
      md: "repeat(3, 1fr)"
    },
    gridGap: {
      base: "20px",
      md: "40px"
    },
    width: "100%",
    // Critical property to ensure items maintain independent heights
    gridAutoRows: "min-content",
    px: {
      base: 4,
      md: 0
    }
  }
});

/**
 * FeaturesSection Component
 * Displays a grid of feature cards with independent expansion behavior
 */
const FeaturesSection: React.FC = () => {
  // Feature data with structured content
  const features: FeatureItem[] = [
    {
      id: 'friends-fitness',
      title: "Friends and Fitness",
      description: "Connect with like-minded individuals on your fitness journey and enjoy mutual support and encouragement.",
      icon: <FaUserFriends />,
      accentColor: 'orange',
      benefits: [
        "Accountability partners to help you stay committed to your fitness goals",
        "Motivational support during challenging periods of your journey",
        "Exchange of practical tips, healthy recipes, and workout routines",
        "Normalization of healthy lifestyle choices in your social circle",
        "Empathetic understanding from people facing similar challenges",
        "Reduced temptation through positive social reinforcement",
        "Collaborative challenges and friendly competitions to accelerate progress through gamified group experiences"
      ]
    },
    {
      id: 'games-friends',
      title: "Games with Friends",
      description: "Enhance your wellbeing through engaging activities that make fitness fun and socially rewarding.",
      icon: <FaGamepad />,
      accentColor: 'blue',
      benefits: [
        "Reduced stress levels through enjoyable social interactions",
        "Stronger social bonds to combat isolation and loneliness",
        "Improved mood through endorphin release during fun activities",
        "Enhanced cognitive abilities including memory and problem-solving",
        "More enjoyable fitness routines through gamification",
        "Improved resilience through friendly competition",
        "Creation of lasting memories and meaningful connections"
      ]
    },
    {
      id: 'safe-secure',
      title: "Safe and Secure",
      description: "Enjoy a protected environment designed to support all aspects of your fitness and social experience.",
      icon: <FaShieldAlt />,
      accentColor: 'green',
      benefits: [
        "Protected weight loss journeys in a supportive community",
        "Secure fitness tracking and activity monitoring",
        "Verified friendship connections for authentic relationships",
        "Monitored games and activities for fair participation",
        "Privacy-focused mental wellness resources",
        "Curated activity recommendations based on your preferences",
        "Extensive network of verified members across various interests"
      ]
    }
  ];

  const bgGradient = useColorModeValue(
    'linear(to-b, gray.50, white)',
    'linear(to-b, gray.900, gray.800)'
  );

  return (
    <Box 
      py={{ base: 12, md: 20 }} 
      bgGradient={bgGradient}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative elements */}
      <Box 
        position="absolute" 
        width="600px" 
        height="600px" 
        bg="orange.50" 
        borderRadius="full" 
        top="-300px" 
        right="-300px" 
        opacity={0.4} 
        zIndex={0} 
      />
      
      <Container maxW="1200px" position="relative" zIndex={1}>
        {/* Replace SimpleGrid with custom implementation */}
        <ResponsiveGrid>
          {features.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </ResponsiveGrid>
      </Container>
    </Box>
  );
};

export default FeaturesSection;