


"use client";

import {
  Box,
  Button,
  Input,
  // InputGroup,
  // InputRightElement,
  Select,
  SimpleGrid,
  Text,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  IconButton,
  useBreakpointValue
} from "@chakra-ui/react";
import React, { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { FilterIcon, GridIcon, ListIcon, PincodeIcon } from "@/components/Icons";
import PostCard from "@/components/Card/postCard";
import ProductCard from "@/components/Card/productCard";
// import CardItem from "@/components/Card/CardItem";
import axios from "axios";
import { useSession } from "next-auth/react";
import { myData } from "@/app/profile/me/page";
import Loading from "@/components/App/loading";
import { debounce } from "lodash";

interface ActivitySearchItem {
  id: string;
  title: string;
  sub_title: string | null;
  description: string | null;
  activity_type: string;
  activity_type_id: string;
  start_time: string;
  age_group: string;
  added_by: string;
  is_event: boolean;
  created_at: string;
  end_time: string;
  max_participants: number | null;
  available_spots: number;
  zip: string;
  city: string;
  images: { url: string }[];
  peopleInterested: number;
  is_sponsored?: boolean;
}

interface ProductSearchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  created_at: string;
  images: { url: string }[];
  type: 'product';
  added_by: string;
}

interface ActivityType {
  id: number;
  name: string;
}

interface FilterState {
  title: string;
  activity_type_id: string;
  age_group: string;
  fromDate: string;
  toDate: string;
  zip: string;
  city: string;
}

interface FilterSectionProps {
  filters: FilterState;
  handleFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  categoryOptions: ActivityType[];
  onClose?: () => void;
  clearFilters: () => void;
  handleSearch?: (e: React.FormEvent) => void;
}

interface SearchParamsWrapperProps {
  children: (searchParams: URLSearchParams) => React.ReactNode;
}

function SearchParamsWrapper({ children }: SearchParamsWrapperProps) {
  const searchParams = useSearchParams();
  return <>{children(searchParams)}</>;
}



function FilterSection({
  filters,
  handleFilterChange,
  categoryOptions,
  // onClose
  clearFilters,
}: FilterSectionProps) {
  return (
    <Box p="30px 20px" display="flex" flexDir="column" gap="10px">
      {/* Search Input */}
      <Box>
        <Text fontSize="14px" color="#475569">Search Keyword</Text>
        <Input
          fontSize="14px"
          type="text"
          placeholder="Enter search keyword"
          borderRadius="2px"
          focusBorderColor="#F9690E"
          id="title"
          name="title"
          value={filters.title}
          onChange={handleFilterChange}
          _placeholder={{ color: "#CED4DA" }}
          border="1px solid #CBD5E1"
        />
      </Box>

      {/* Category */}
      <Box>
        <Text fontSize="14px" color="#475569">Category</Text>
        <Select
          mt="10px"
          size="md"
          focusBorderColor="#F9690E"
          fontSize="14px"
          placeholder="Choose Category"
          border="1px solid #CED4DA"
          borderRadius="3px"
          id="activity_type_id"
          name="activity_type_id"
          value={filters.activity_type_id}
          onChange={handleFilterChange}
        >
          {categoryOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </Select>
      </Box>

      {/* Zip/Location */}
      <Box>
        <Box display="flex" alignItems="center" gap="5px">
          <PincodeIcon width="20px" height="20px" fill="#334155" />
          <Text color="#475569" fontSize="14px">Zip Code / Location:</Text>
        </Box>
        <Box display="flex" alignItems="center" gap="5px" mt="10px">
          <Input
            fontSize="14px"
            type="text"
            focusBorderColor="#F9690E"
            placeholder="Zip Code"
            borderRadius="3px"
            id="zip"
            name="zip"
            value={filters.zip}
            onChange={handleFilterChange}
            pattern="^\d{5,6}$"
            maxLength={6}
            _placeholder={{ color: "#CED4DA" }}
            border="1px solid #CBD5E1"
          />
          <Input
            fontSize="14px"
            type="text"
            focusBorderColor="#F9690E"
            borderRadius="3px"
            placeholder="City Name"
            maxLength={30}
            id="city"
            name="city"
            value={filters.city}
            onChange={handleFilterChange}
            _placeholder={{ color: "#CED4DA" }}
            border="1px solid #CBD5E1"
          />
        </Box>
      </Box>

      {/* Age */}
      <Box>
        <Text fontSize="14px" color="#475569">Age</Text>
        <Select
          mt="10px"
          focusBorderColor="#F9690E"
          size="md"
          fontSize="14px"
          placeholder="Filter Age"
          border="1px solid #CED4DA"
          borderRadius="3px"
          id="age_group"
          name="age_group"
          value={filters.age_group}
          onChange={handleFilterChange}
        >
          <option value="age_13_18">13-18</option>
          <option value="age_19_24">19-24</option>
          <option value="age_25_30">25-30</option>
          <option value="age_31_40">31-40</option>
          <option value="age_41_50">41-50</option>
          <option value="age_51_60">51-60</option>
        </Select>
      </Box>

      {/* Created On */}
      <Box>
        <Text fontSize="14px" color="#475569">Date</Text>
        <Box display="flex" alignItems="center" gap="5px" mt="10px">
          <Input
            fontSize="14px"
            focusBorderColor="#F9690E"
            placeholder="Date from"
            pl="4px"
            pr="4px"
            type="date"
            id="fromDate"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
            _placeholder={{ color: "#CED4DA" }}
            border="1px solid #CBD5E1"
          />
          -
          <Input
            fontSize="14px"
            focusBorderColor="#F9690E"
            placeholder="Date to"
            borderRadius="3px"
            pl="4px"
            pr="4px"
            type="date"
            id="toDate"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
            _placeholder={{ color: "#CED4DA" }}
            border="1px solid #CBD5E1"
          />
        </Box>
      </Box>

      <Box mt="20px">
        <Button
          w="100%"
          variant="outline"
          colorScheme="gray"
          onClick={clearFilters}
          fontSize="14px"
        >
          Clear Filters
        </Button>
      </Box>

    </Box>
  );
}

function Search() {
  const [activities, setActivities] = useState<ActivitySearchItem[]>([]);
  const [products, setProducts] = useState<ProductSearchItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const pathname = usePathname();
  const { data: session } = useSession();

  const [categoryOptions, setCategoryOptions] = useState<ActivityType[]>([]);
  const [view, setView] = useState("grid");
  const [userData, setUserData] = useState<myData | null>(null);
  // const router = useRouter();


  // Initialize filters with proper typing
  const [filters, setFilters] = useState<FilterState>({
    title: searchParams.get("title") || "",
    activity_type_id: searchParams.get("activity_type_id") || "",
    age_group: searchParams.get("age_group") || "",
    fromDate: searchParams.get("fromDate") || "",
    toDate: searchParams.get("toDate") || "",
    zip: searchParams.get("zip") || "",
    city: searchParams.get("city") || "",
  });


  const updateURL = useCallback((currentFilters: FilterState) => {
    const queryParams = new URLSearchParams();
    Object.entries(currentFilters).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, value);
      }
    });
    const newURL = `${pathname}?${queryParams.toString()}`;
    window.history.pushState({}, '', newURL);
  }, [pathname]);

  // Modified fetchSearchResults to use current URL params
  const fetchSearchResults = useCallback(async (currentFilters: FilterState, currentPage: number) => {
    setLoading(currentPage === 1);
    setIsLoadingMore(currentPage !== 1);

    try {
      const queryParams = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value) queryParams.set(key, value);
      });
      queryParams.set('page', currentPage.toString());
      queryParams.set('pageSize', '10');

      const response = await fetch(`/api/search?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch search results");
      const data = await response.json();

      // Separate activities and products from the combined results
      const activityResults = data.data.filter((item: any) => !item.type || item.type !== 'product');
      const productResults = data.data.filter((item: any) => item.type === 'product');

      setActivities(prev => currentPage === 1 ? activityResults : [...prev, ...activityResults]);
      setProducts(prev => currentPage === 1 ? productResults : [...prev, ...productResults]);
      setHasMore(data.hasMore);
      updateURL(currentFilters);
    } catch (err) {
      setError(`An error occurred while fetching activities: ${err}`,);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [updateURL]);


  // Effect to handle URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFilters: FilterState = {
      title: params.get("title") || "",
      activity_type_id: params.get("activity_type_id") || "",
      age_group: params.get("age_group") || "",
      fromDate: params.get("fromDate") || "",
      toDate: params.get("toDate") || "",
      zip: params.get("zip") || "",
      city: params.get("city") || "",
    };
    setFilters(urlFilters);

    fetchSearchResults(urlFilters, 1); // Load initial page
  }, []);

  



  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          const userRes = await axios.get(`/api/user/me`, {
            withCredentials: true,
          });

          setUserData(userRes.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/activity-type");
        const data = await res.json();
        setCategoryOptions(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  

  useEffect(() => {
    const handleScroll = debounce(() => {
      const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
      if (scrollHeight - (scrollTop + clientHeight) < 100 && hasMore && !isLoadingMore && !loading) {
        setPage(prev => prev + 1);
      }
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      handleScroll.cancel();
    };
  }, [hasMore, isLoadingMore, loading]);

  // Separate debounced functions for URL update and API call
  // const debouncedUpdateURL = useCallback(
  //   debounce((currentFilters: FilterState) => {
  //     const queryParams = new URLSearchParams();
  //     Object.entries(currentFilters).forEach(([key, value]) => {
  //       if (value) {
  //         queryParams.set(key, value);
  //       }
  //     });
  //     const newURL = `${pathname}?${queryParams.toString()}`;
  //     window.history.pushState({}, '', newURL);
  //   }, 1000), // Longer debounce for URL updates
  //   [pathname]
  // );

  // Use debounce for search input
  const debouncedFetchSearchResults = useCallback(
    debounce((currentFilters: FilterState, page: number) => {
      fetchSearchResults(currentFilters, page);
    }, 500),
    [fetchSearchResults]
  );


  // Modified handler for input changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };

    setFilters(newFilters);
    setPage(1); // Reset page to 1 when filters change
    setHasMore(true); // Reset hasMore to true when filters change

    if (name === 'title') {
      debouncedFetchSearchResults(newFilters, 1);
    } else {
      fetchSearchResults(newFilters, 1);
    }
  };


  // Load more data when page changes
  useEffect(() => {
    if (page > 1) {
      fetchSearchResults(filters, page);
    }
  }, [page, filters, fetchSearchResults]); // Trigger when page changes

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSearchResults(filters, page);
  };

  const clearFilters = useCallback(() => {
    const emptyFilters: FilterState = {
      title: "",
      activity_type_id: "",
      age_group: "",
      fromDate: "",
      toDate: "",
      zip: "",
      city: "",
    };
    
    setFilters(emptyFilters);
    setPage(1);
    setHasMore(true);
    
    // Update URL and fetch search results with empty filters
    updateURL(emptyFilters);
    fetchSearchResults(emptyFilters, 1);
    
    // Close drawer if on mobile
    if (isMobile && onClose) {
      onClose();
    }
  }, [fetchSearchResults, updateURL, isMobile, onClose]);

  return (
    <SearchParamsWrapper>
      {(_searchParams) => {
        // const query = searchParams.get("title") || "";
        
        return (
          <Box display={"flex"} maxWidth={"1380px"} mx={"auto"} position="relative">
            {/* Mobile Filter Button */}
            {isMobile && (
              <IconButton
                aria-label="Open filters"
                icon={<FilterIcon width="20px" height="20px" fill="#334155" />}
                position="fixed"
                bottom="20px"
                right="20px"
                zIndex="999"
                colorScheme="orange"
                onClick={onOpen}
              />
            )}

            {/* Mobile Filter Drawer */}
            <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
              <DrawerOverlay />
              <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px">Filters</DrawerHeader>
                <DrawerBody>
                  <FilterSection
                    filters={filters}
                    handleFilterChange={handleFilterChange}
                    handleSearch={handleSearch}
                    categoryOptions={categoryOptions}
                    onClose={onClose}
                    clearFilters={clearFilters}
                  />
                </DrawerBody>
              </DrawerContent>
            </Drawer>

            {/* Desktop Filter Section */}
            <Box
              display={{ base: "none", md: "block" }}
              w={"full"}
              maxWidth={"300px"}
              bgColor={"#FFF"}
              borderRight={"1px solid #E2E8F0"}
            >
              <Box p={"10px 20px"} borderY={"1px solid #E2E8F0"} display={"flex"} alignItems={"center"} gap="10px">
                <FilterIcon width="20px" height="20px" fill="#334155" /> Filter
              </Box>
              <FilterSection
                filters={filters}
                handleFilterChange={handleFilterChange}
                handleSearch={handleSearch}
                categoryOptions={categoryOptions}
                clearFilters={clearFilters}
              />
            </Box>

            {/* Results Section */}
            <Box flex="1">
              <Box
                bg={"#FFF"}
                py="6px"
                px={"10px"}
                mb="14px"
                display={"flex"}
                flexFlow={{ base: "column", md: "row" }}
                gap={"10px"}
                justifyContent={"space-between"}
                alignItems={"center"}
                border={"1px solid #E2E8F0"}
                borderLeft={"none"}
              >
                <Text color={"#475569"} fontSize={"14px"} pl={"6px"}>
                  {` Showing ${activities.length + products.length} results`}
                </Text>
                <Box display={"flex"} gap={"16px"} alignItems={"center"}>
                  <Box display={"flex"} alignItems={"center"} justifyContent={"center"} gap={"8px"}>
                    <Box
                      hidden={true}
                      display={"flex"}
                      gap={"10px"}
                      px="7px"
                      py="5px"
                      border="1px solid #E2E8F0"
                      borderRadius="8px"
                    >
                      <GridIcon
                        onClick={() => setView("grid")}
                        width="20px"
                        height="20px"
                        fill={view === "grid" ? "#f9690e" : "#CBD5E1"}
                      />
                      <ListIcon
                        onClick={() => setView("list")}
                        width="20px"
                        height="20px"
                        fill={view === "list" ? "#f9690e" : "#CBD5E1"}
                      />
                    </Box>
                  </Box>
                </Box>
              </Box>

              {error && <Text color="red.500">{error}</Text>}

              {/* Activities Section */}
              {activities.length > 0 && (
                <Box p="20px">
                  <Text fontSize="24px" fontWeight="bold" mb="20px" color="#334155">
                    Activities ({activities.length})
                  </Text>
                  <SimpleGrid
                    columns={{ base: 1, md: view == "list" ? 1 : 2, lg: view == "list" ? 1 : 3 }}
                    gap={"20px"}
                  >
                    {activities.map((item: ActivitySearchItem) => {
                      // Convert ActivitySearchItem to ActivityItem format
                      const activityItem = {
                        id: item.id,
                        title: item.title,
                        sub_title: item.sub_title || "",
                        age_group: item.age_group,
                        is_event: item.is_event,
                        is_sponsored: item.is_sponsored || false,
                        available_spots: item.available_spots,
                        zip: item.zip,
                        activity_type_id: item.activity_type_id,
                        added_by: item.added_by,
                        created_at: item.created_at,
                        start_time: item.start_time,
                        end_time: item.end_time,
                        images: item.images,
                        peopleInterested: item.peopleInterested
                      };
                      
                      return (
                        <PostCard 
                          key={item.id} 
                          postItem={activityItem} 
                          view={view} 
                          userData={userData || undefined} 
                        />
                      );
                    })}
                  </SimpleGrid>
                </Box>
              )}

              {/* Products Section */}
              {products.length > 0 && (
                <Box p="20px">
                  <Text fontSize="24px" fontWeight="bold" mb="20px" color="#334155">
                    Products ({products.length})
                  </Text>
                  <SimpleGrid
                    columns={{ base: 1, md: view == "list" ? 1 : 2, lg: view == "list" ? 1 : 3 }}
                    gap={"20px"}
                  >
                    {products.map((item: ProductSearchItem) => (
                      <ProductCard 
                        key={item.id} 
                        productItem={item} 
                        view={view} 
                        userData={userData || undefined}
                      />
                    ))}
                  </SimpleGrid>
                </Box>
              )}

              {/* No Results Message */}
              {activities.length === 0 && products.length === 0 && !loading && (
                <Box p="20px" textAlign="center">
                  <Text fontSize="18px" color="#64748B">
                    No results found for "{filters.title}"
                  </Text>
                  <Text fontSize="14px" color="#94A3B8" mt="10px">
                    Try adjusting your search terms or filters
                  </Text>
                </Box>
              )}
              {isLoadingMore && (
                <Box textAlign="center" py={4}>
                  <Text>Loading more results...</Text>
                </Box>
              )}

              {!hasMore && (activities.length > 0 || products.length > 0) && (
                <Box textAlign="center" py={4}>
                  <Text>No more results to load.</Text>
                </Box>
              )}
            </Box>
          </Box>
        );
      }}
    </SearchParamsWrapper>
  );
}




export default function SearchPage() {
  return (
    <Suspense fallback={<Loading>Loading...</Loading>}>
      <Search />
    </Suspense>
  );
}