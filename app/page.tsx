import { Box, Button, HStack, SimpleGrid, Skeleton, Center, Container, Heading, Text } from "@chakra-ui/react";
import PostCard from "@/components/Card/postCard";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from "framer-motion";
import ProductCard from '@/components/Card/productCard';
import { UserData } from "@/app/profile/me/page";
import { ProductItem } from "@/types/product";
import LandingClient from './LandingClient';

const HeroSection = dynamic(() => import('@/components/ui/HeroSection'), { ssr: false });
const SearchCategoriesSection = dynamic(() => import('@/components/ui/SearchCategoriesSection'), { ssr: false });
const FeaturesSection = dynamic(() => import('@/components/ui/FeaturesSection'), { ssr: false });
const TestimonialSlider = dynamic(() => import('@/components/ui/TestimonialSlider'), { ssr: false });

interface ActivityItem {
    id: string;
    title: string;
    sub_title: string;
    age_group: string;
    is_event: boolean;
    is_sponsored: boolean;
    available_spots: number; // Always a number
    zip: string;
    activity_type_id: string;
    added_by: string;
    created_at: string;
    start_time: string;
    end_time: string;
    images: Array<{ url: string }>;
    peopleInterested: number;
    alreadyRequested?: boolean;
}

interface ActivityData {
    id: string;
    name: string;
    data: ActivityItem[];
}

interface ProductData{
  id: string;
  name: string;
  data: ProductItem[];
}
interface CourseCategoriesProps {
    activityData: ActivityData[];
    userData: UserData | undefined;
}

const CourseCategories: React.FC<CourseCategoriesProps> = ({ activityData, userData }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>('all');

    const handleCategoryClick = (categoryName: string | null) => {
        setSelectedCategory(categoryName);
    };

    const getDisplayedActivities = useCallback(() => {
        if (selectedCategory === 'all' || !selectedCategory) {
            const allActivities = activityData.reduce((acc: ActivityItem[], curr: ActivityData) => [
                ...acc,
                ...curr.data.map(item => ({
                    ...item,
                    available_spots: typeof item.available_spots === 'string' ? (isNaN(Number(item.available_spots)) ? 0 : Number(item.available_spots)) : item.available_spots
                }))
            ], [] as ActivityItem[]);
            const sponsored = allActivities.filter(a => a.is_sponsored);
            const normal = allActivities.filter(a => !a.is_sponsored);
            const rows: ActivityItem[] = [];
            let s = 0, n = 0;
            let isSponsoredGroup = true;
            while (s < sponsored.length || n < normal.length) {
                let count = 0;
                while (count < 4 && (isSponsoredGroup ? s < sponsored.length : n < normal.length)) {
                    if (isSponsoredGroup && s < sponsored.length) {
                        rows.push(sponsored[s++]);
                    } else if (!isSponsoredGroup && n < normal.length) {
                        rows.push(normal[n++]);
                    }
                    count++;
                }
                isSponsoredGroup = !isSponsoredGroup;
            }
            return rows;
        } else {
            const selectedType = activityData.find(type => type.name === selectedCategory);
            if (!selectedType) return [];
            const sponsored = selectedType.data.filter(a => a.is_sponsored);
            const normal = selectedType.data.filter(a => !a.is_sponsored);
            const rows: ActivityItem[] = [];
            let s = 0, n = 0;
            let isSponsoredGroup = true;
            while (s < sponsored.length || n < normal.length) {
                let count = 0;
                while (count < 4 && (isSponsoredGroup ? s < sponsored.length : n < normal.length)) {
                    if (isSponsoredGroup && s < sponsored.length) {
                        rows.push(sponsored[s++]);
                    } else if (!isSponsoredGroup && n < normal.length) {
                        rows.push(normal[n++]);
                    }
                    count++;
                }
                isSponsoredGroup = !isSponsoredGroup;
            }
            return rows;
        }
    }, [selectedCategory, activityData]);
    
 
    const displayedActivities = getDisplayedActivities();
    const categories = ['All Activities', ...activityData.map(item => item.name)];

    // Removed getDisplayedProducts and productData usage
  return (
    <Box py={12} px={{ base: 4, md: 6, lg: 8 }} bg="gray.50">
      <Container maxW="1800px">
        {/* Section Header */}
        <Heading 
          as="h2" 
          fontSize={{ base: "2xl", md: "3xl" }} 
          mb={8} 
          textAlign="center"
          fontWeight="bold"
          color="gray.800"
        >
          Explore Activities
        </Heading>
      
        {/* Categories Navigation - Improved with modern design */}
        <Box
  overflowX="auto"
  css={{
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    scrollbarWidth: 'none'
  }}
  mb={6}
  borderRadius="lg"
  boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
  p={1}
  bg="rgba(255, 255, 255, 0.8)"
  backdropFilter="blur(10px)"
  borderWidth="1px"
  borderColor="gray.100"
>
  <HStack
    spacing={0}
    minW="max-content"
  >
    {categories.map((category, index) => {
      const isActive = selectedCategory === (index === 0 ? 'all' : category);
      return (
        <Button
          key={index}
          variant="ghost"
          py={3}
          px={5}
          color={isActive ? "white" : "gray.700"}
          bg={isActive ? "green.400" : "transparent"}
          fontWeight={isActive ? "semibold" : "medium"}
          _hover={{ bg: isActive ? "green.500" : "gray.100" }}
          borderRadius="md"
          transition="all 0.2s"
          onClick={() => handleCategoryClick(index === 0 ? 'all' : category)}
        >
          {category}
        </Button>
      );
    })}
  </HStack>
</Box>

        {/* Activities Grid */}
        <SimpleGrid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)"
          }}
          gap={6}
          mt={8}
        >
          {displayedActivities.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PostCard postItem={item} userData={userData} view="grid" />
            </motion.div>
          ))}
        </SimpleGrid>
          
        <Center mt={12}>
          <Link href="/activities" passHref>
            <Button
              variant="outline"
              color="green.400"
              borderColor="green.400"
              px={8}
              py={6}
              fontSize="md"
              fontWeight="medium"
              borderRadius="md"
              _hover={{
                bg: 'green.50',
                borderColor: 'green.500',
                color: 'green.500'
              }}
              _active={{
                bg: 'green.100'
              }}
            >
              View All Activities
            </Button>
          </Link>
        </Center>

       
      </Container>
    </Box>
  );
};
const CourseProducts: React.FC<CourseCategoriesProps> = ({ activityData }) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>('all');

    const handleCategoryClick = (categoryName: string | null) => {
        setSelectedCategory(categoryName);
    };

    const getDisplayedActivities = useCallback(() => {
        if (selectedCategory === 'all' || !selectedCategory) {
            // Display all activities, sponsored first
            const allActivities = activityData.reduce((acc: ActivityItem[], curr: ActivityData) => [...acc, ...curr.data], [] as ActivityItem[]);
            // Sort: sponsored first
            const sorted = [...allActivities].sort((a, b) => (b.is_sponsored ? 1 : 0) - (a.is_sponsored ? 1 : 0));
            return sorted.slice(0, 8); // Show up to 8 activities, sponsored first
        } else {
            const selectedType = activityData.find((type: ActivityData) => type.name === selectedCategory);
            if (!selectedType) return [];
            // Sort: sponsored first
            const sorted = [...selectedType.data].sort((a, b) => (b.is_sponsored ? 1 : 0) - (a.is_sponsored ? 1 : 0));
            return sorted.slice(0, 8);
        }
    }, [selectedCategory, activityData]);

    const displayedActivities = getDisplayedActivities();
    const categories = ['All Products', ...activityData.map((item: ActivityData) => item.name)];

    // Removed getDisplayedProducts and productData usage
  return(
    <Box py={12} px={{ base: 4, md: 6, lg: 8 }} bg="gray.50">
      <Container maxW="1800px">
        {/* Section Header */}
        {/* <Heading 
          as="h2" 
          fontSize={{ base: "2xl", md: "3xl" }} 
          mb={8} 
          textAlign="center"
          fontWeight="bold"
          color="gray.800"
        >
          Explore Activities
        </Heading> */}
      
        {/* Categories Navigation - Improved with modern design */}
        <Box
  overflowX="auto"
  css={{
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    scrollbarWidth: 'none'
  }}
  mb={6}
  borderRadius="lg"
  boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)"
  p={1}
  bg="rgba(255, 255, 255, 0.8)"
  backdropFilter="blur(10px)"
  borderWidth="1px"
  borderColor="gray.100"
>
  <HStack
    spacing={0}
    minW="max-content"
  >
    
      
        <Button
          key={0}
          variant="ghost"
          py={3}
          px={5}
          color={"white"}
          bg={"green.400"}
          fontWeight={"semibold"}
          _hover={{ bg: "green.500"}}
          borderRadius="md"
          transition="all 0.2s"
         // onClick={() => handleCategoryClick(index === 0 ? 'all' : category)}
        >
          Products
        </Button>
      
    
    
  </HStack>
</Box>

        {/* Activities Grid */}
        <SimpleGrid
          templateColumns={{
              base: "repeat(1, 1fr)",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)"
          }}
          gap={6}
          mt={8}
        >
          {displayedActivities.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <PostCard postItem={item} userData={undefined} view="grid" />
            </motion.div>
          ))}
        </SimpleGrid>
          
        {/* <Center mt={12}>
          <Link href="/activities" passHref>
            <Button
              variant="outline"
              color="green.400"
              borderColor="green.400"
              px={8}
              py={6}
              fontSize="md"
              fontWeight="medium"
              borderRadius="md"
              _hover={{
                bg: 'green.50',
                borderColor: 'green.500',
                color: 'green.500'
              }}
              _active={{
                bg: 'green.100'
              }}
            >
              View All Activities
            </Button>
          </Link>
        </Center> */}

       
      </Container>
    </Box>
  );
};
function LandingSkeletonLoader() {
    return (
        <Box p="4">
            {[...Array(3)].map((_, index) => (
                <Box key={index} mb="8">
                    <Skeleton maxW="200px" borderRadius="12px" height="32px" mb="4" />
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing="4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} height="200px" borderRadius="12px" />
                        ))}
                    </SimpleGrid>
                </Box>
            ))}
        </Box>
    );
}

// Server Component for fetching activities/products
import { cookies } from 'next/headers';

async function getActivitiesAndProducts() {
  // Use fetch for SSR/SSG, fallback to axios if needed
  const [activitiesRes, productsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/home-activities?limit=8`, { cache: 'no-store' }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/products/active?limit=8`, { cache: 'no-store' })
  ]);
  let activities = [];
  let products = [];
  try {
    const activitiesJson = await activitiesRes.json();
    if (activitiesJson.status && activitiesJson.data) {
      activities = activitiesJson.data.filter((type: ActivityData | null): type is ActivityData => type !== null).map((type: ActivityData) => ({ ...type, data: type.data.slice(0, 8) }));
    }
  } catch {}
  try {
    const productsJson = await productsRes.json();
    console.log('productsJson:', productsJson);
    if (productsJson.data) {
      products = productsJson.data.slice(0, 8);
      console.log('products:', products);
    }
  } catch {}
  return { activities, products };
}

// Main server component
export default async function Landing() {
  const { activities, products } = await getActivitiesAndProducts();
  return <LandingClient activityData={activities} activeProducts={products} />;
}