"use client";
import { Box, Button, HStack, SimpleGrid, Skeleton, Center, Container, Heading, Text, Select } from "@chakra-ui/react";
import { useState, useCallback, useEffect } from "react";
import useSWR from 'swr';
import axios from "axios";
import PostCard from "@/components/Card/postCard";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from "framer-motion";
import ProductCard from '@/components/Card/productCard';
import { UserData } from "@/types/user";
import { ProductItem } from "@/types/product";
import { ActivityItem, ActivityData } from "@/types/activity";

const HeroSection = dynamic(() => import('@/components/ui/HeroSection'), { ssr: false });
const SearchCategoriesSection = dynamic(() => import('@/components/ui/SearchCategoriesSection'), { ssr: false });
const FeaturesSection = dynamic(() => import('@/components/ui/FeaturesSection'), { ssr: false });
const TestimonialSlider = dynamic(() => import('@/components/ui/TestimonialSlider'), { ssr: false });

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

    return (
        <Box py={12} px={{ base: 4, md: 6, lg: 8 }} bg="gray.50">
            <Container maxW="1800px">
                <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} mb={8} textAlign="center" fontWeight="bold" color="gray.800">
                    Explore Activities
                </Heading>
                <Box overflowX="auto" css={{'&::-webkit-scrollbar': {display: 'none'}, scrollbarWidth: 'none'}} mb={6} borderRadius="lg" boxShadow="0 2px 8px rgba(0, 0, 0, 0.06)" p={1} bg="rgba(255, 255, 255, 0.8)" backdropFilter="blur(10px)" borderWidth="1px" borderColor="gray.100">
                    <HStack spacing={0} minW="max-content">
                        {categories.map((category, index) => {
                            const isActive = selectedCategory === (index === 0 ? 'all' : category);
                            return (
                                <Button key={index} variant="ghost" py={3} px={5} color={isActive ? "white" : "gray.700"} bg={isActive ? "green.400" : "transparent"} fontWeight={isActive ? "semibold" : "medium"} _hover={{ bg: isActive ? "green.500" : "gray.100" }} borderRadius="md" transition="all 0.2s" onClick={() => handleCategoryClick(index === 0 ? 'all' : category)}>
                                    {category}
                                </Button>
                            );
                        })}
                    </HStack>
                </Box>
                <SimpleGrid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mt={8}>
                    {displayedActivities.map((item) => (
                        <motion.div key={item.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                            <PostCard postItem={item} userData={userData} view="grid" />
                        </motion.div>
                    ))}
                </SimpleGrid>
                <Center mt={12}>
                    <Link href="/activities" passHref>
                        <Button variant="outline" color="green.400" borderColor="green.400" px={8} py={6} fontSize="md" fontWeight="medium" borderRadius="md" _hover={{ bg: 'green.50', borderColor: 'green.500', color: 'green.500' }} _active={{ bg: 'green.100' }}>
                            View All Activities
                        </Button>
                    </Link>
                </Center>
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

export default function LandingClient({ activityData, activeProducts }: { activityData: ActivityData[]; activeProducts: ProductItem[] }) {
    // User data via SWR
    const { data: userData, error: userError, isLoading: userLoading } = useSWR<UserData>(
        '/api/user/me',
        (url: string) => axios.get(url, { withCredentials: true }).then(res => res.data)
    );

    // --- Products Pagination & Sorting ---
    const [products, setProducts] = useState<ProductItem[]>(activeProducts);
    const [productOffset, setProductOffset] = useState(activeProducts.length);
    const [productLoading, setProductLoading] = useState(false);
    const [productHasMore, setProductHasMore] = useState(true);
    const [productSort, setProductSort] = useState<'newest' | 'oldest'>('newest');

    const fetchProducts = async (offset: number, sort: 'newest' | 'oldest', append = false) => {
        setProductLoading(true);
        try {
            const res = await axios.get(`/api/products/active?limit=8&offset=${offset}&sort=${sort}`);
            const newProducts: ProductItem[] = res.data.data;
            setProducts(prev => append ? [...prev, ...newProducts] : newProducts);
            setProductOffset(offset + newProducts.length);
            setProductHasMore(newProducts.length === 8);
        } catch (e) {
            setProductHasMore(false);
        } finally {
            setProductLoading(false);
        }
    };

    const loadMoreProducts = () => {
        fetchProducts(productOffset, productSort, true);
    };

    // Refetch products when sort changes
    useEffect(() => {
        fetchProducts(0, productSort, false);
    }, [productSort]);

    // --- Activities Pagination ---
    const [activities, setActivities] = useState<ActivityData[]>(activityData);
    const [activityOffset, setActivityOffset] = useState(activityData[0]?.data.length || 0);
    const [activityLoading, setActivityLoading] = useState(false);
    const [activityHasMore, setActivityHasMore] = useState(true);

    const loadMoreActivities = async () => {
        setActivityLoading(true);
        try {
            const res = await axios.get(`/api/home-activities?limit=8&offset=${activityOffset}`);
            const newActivityData: ActivityData[] = res.data.data;
            // Merge new activities by type
            setActivities(prev => {
                return prev.map((type, idx) => {
                    const newType = newActivityData.find(nt => nt.id === type.id);
                    if (newType) {
                        return {
                            ...type,
                            data: [...type.data, ...newType.data],
                        };
                    }
                    return type;
                });
            });
            // Assume all types have same length for offset
            setActivityOffset(prev => prev + (newActivityData[0]?.data.length || 0));
            if (!newActivityData.length || (newActivityData[0]?.data.length || 0) < 8) setActivityHasMore(false);
        } catch (e) {
            setActivityHasMore(false);
        } finally {
            setActivityLoading(false);
        }
    };

    return (
        <main>
            <HeroSection />
            <SearchCategoriesSection />
            {/* Activities Section */}
            <section aria-label="Activities Section">
                {userLoading ? (
                    <LandingSkeletonLoader />
                ) : userError ? (
                    <Center py={8}><Text color="red.500" aria-live="polite">Failed to load user data.</Text></Center>
                ) : (
                    <>
                        <CourseCategories activityData={activities} userData={userData} />
                        {/*activityHasMore && (
                            <Center mt={4} mb={8}>
                                <Button onClick={loadMoreActivities} isLoading={activityLoading} loadingText="Loading..." colorScheme="green" aria-label="Load more activities">
                                    Load More Activities
                                </Button>
                            </Center>
                        )*/}
                    </>
                )}
            </section>
            {/* Products Section */}
            <section aria-label="Products Section">
                <Box py={12} px={{ base: 4, md: 6, lg: 8 }} bg="gray.50">
                    <Container maxW="1800px">
                        <Box mb={6} display="flex" alignItems="center" justifyContent="space-between">
                            <Box as="span" bg="green.400" color="white" px={4} py={1} borderRadius="md" fontWeight="bold" fontSize="lg" mr={4}>
                                Products
                            </Box>
                            <Select width="200px" value={productSort} onChange={e => setProductSort(e.target.value as 'newest' | 'oldest')} aria-label="Sort products">
                                <option value="newest">Newest</option>
                                <option value="oldest">Oldest</option>
                            </Select>
                        </Box>
                        <SimpleGrid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mt={4}>
                            {products.length === 0 ? (
                                <Text aria-live="polite">No products found.</Text>
                            ) : (
                                products.map((product: ProductItem) => (
                                    <ProductCard key={product.id} productItem={product} view="grid" userData={undefined} alt={`Product: ${product.name}`} />
                                ))
                            )}
                        </SimpleGrid>
                        {productHasMore && (
                            <Center mt={4} mb={8}>
                                <Button onClick={loadMoreProducts} isLoading={productLoading} loadingText="Loading..." colorScheme="green" aria-label="Load more products">
                                    Load More Products
                                </Button>
                            </Center>
                        )}
                    </Container>
                </Box>
            </section>
            {/* Lazy load heavy/below-the-fold components */}
            <FeaturesSection />
            {/* <TestimonialSlider /> */}
        </main>
    );
} 