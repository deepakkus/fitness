// VendorProducts.tsx
"use client";
import { Box, SimpleGrid, Text, Select, Checkbox, CheckboxGroup, Stack } from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { GridIcon, ListIcon, CalenderIcon } from "@/components/Icons";
import PostCard from "@/components/Card/postCard";
import ProductCard from "@/components/Card/productCard";
import EventCard from "@/components/Card/eventCard";
import { UserData } from "@/app/profile/me/page";
import { useSession } from "next-auth/react";
import EventCalender from "@/components/Profile/EventCalender";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button as ChakraButton, useDisclosure, Text as ChakraText, Stack as ChakraStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

interface ProductData {
  items: number;
  type: string;
  data: Array<any>;
}

interface VendorProductsProps {
  userId?: string;
  initialProducts: any[];
}

export default function VendorProducts({ userId, initialProducts }: VendorProductsProps) {
  const { data: session } = useSession();
  const [view, setView] = useState("grid");
  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [calendarData, setCalendarData] = useState<
    Array<{
      title: string;
      start: string;
      end: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [checkingPlan, setCheckingPlan] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planError, setPlanError] = useState("");

  // Plan options
  const plans = [
    { products: 5, price: 5 },
    { products: 10, price: 8 },
    { products: 15, price: 12 },
  ];

  // Check if user has a plan
  const handleCreateProduct = async () => {
    setCheckingPlan(true);
    setPlanError("");
    try {
      const res = await axios.get("/api/users_product/me");
      if (res.data && res.data.hasPlan) {
        router.push("/product/create");
      } else {
        setShowPlanModal(true);
      }
    } catch (err) {
      setPlanError("Error checking plan. Please try again.");
      setShowPlanModal(true);
    } finally {
      setCheckingPlan(false);
    }
  };

  // Handle plan selection
  const handleSelectPlan = async (plan: { products: number; price: number }) => {
    setPlanError("");
    try {
      await axios.post("/api/users_product/purchase", { plan });
      setShowPlanModal(false);
      router.push("/product/create");
    } catch (err) {
      setPlanError("Error purchasing plan. Please try again.");
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      

    } else {
      

    }
  }, [session]);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        if (session) {
          
          const userDataRoute = userId ? `/api/user/${userId}` : `/api/user/me`;
          const userRes = await axios.get(userDataRoute, { withCredentials: true });
          setUserData(userRes.data);

          const apiUrl = userId ? `/api/products?userId=${userId}` : '/api/products';
          
          if (apiUrl) {
            
            const response = await axios.get(apiUrl, { withCredentials: true });
           
            if (response.data && Array.isArray(response.data.data)) {
              setProducts(response.data.data);
            } else {
              setProducts([]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [session, userId]);

  const renderProducts = () => {
    if (!products || products.length === 0) {
      return <Text>No products found.</Text>;
    }
    // Sort by updated_at desc, then created_at desc
    let sorted = [...products].sort((a, b) => {
      const aUpdate = a.updated_at ? new Date(a.updated_at).getTime() : 0;
      const bUpdate = b.updated_at ? new Date(b.updated_at).getTime() : 0;
      if (bUpdate !== aUpdate) return bUpdate - aUpdate;
      const aCreate = a.created_at ? new Date(a.created_at).getTime() : 0;
      const bCreate = b.created_at ? new Date(b.created_at).getTime() : 0;
      return bCreate - aCreate;
    });
    if (statusFilter === 'active') sorted = sorted.filter(item => item.is_active);
    if (statusFilter === 'inactive') sorted = sorted.filter(item => !item.is_active);
    return sorted.map((item: any) => (
      <ProductCard key={item.id} userData={userData || undefined} productItem={item} view={view} showActions={true} />
    ));
  };

  return (
    <>
      <Box
        pos={"relative"}
        bg={"#FFF"}
        py="10px"
        px={"10px"}
        mb="14px"
        display={"flex"}
        flexDirection={{ base: "column", md: "row" }}
        gap={"10px"}
        justifyContent={"space-between"}
        alignItems={"center"}
        borderRadius={"12px"}
        border={"1px solid #E2E8F0"}
      >
        <Text fontWeight="bold" fontSize="18px">Product List</Text>
        <Box display="flex" alignItems="center" gap={6} ml="auto">
          <Text color="#475569" fontSize="16px">
            Total: {(() => {
              if (!products || products.length === 0) return 0;
              if (statusFilter === 'all') return products.length;
              if (statusFilter === 'active') return products.filter((item: any) => item.is_active).length;
              if (statusFilter === 'inactive') return products.filter((item: any) => !item.is_active).length;
              return 0;
            })()}
          </Text>
          <Stack direction="row" spacing={4}>
            <Checkbox
              isChecked={statusFilter === 'all'}
              onChange={() => setStatusFilter('all')}
            >All</Checkbox>
            <Checkbox
              isChecked={statusFilter === 'active'}
              onChange={() => setStatusFilter('active')}
            >Active</Checkbox>
            <Checkbox
              isChecked={statusFilter === 'inactive'}
              onChange={() => setStatusFilter('inactive')}
            >Inactive</Checkbox>
          </Stack>
          <Box display={"flex"} gap={"10px"} px="7px" py="5px" border="1px solid #E2E8F0" borderRadius="8px">
            <GridIcon
              onClick={() => setView("grid")}
              className={"cursor-pointer active:transition-all active:duration-[400ms] active:scale-[0.8]"}
              width="20px"
              height="20px"
              fill={view === "grid" ? "#f9690e" : "#CBD5E1"}
            />
            <ListIcon
              onClick={() => setView("list")}
              className={"cursor-pointer active:transition-all active:duration-[400ms] active:scale-[0.8]"}
              width="20px"
              height="20px"
              fill={view === "list" ? "#f9690e" : "#CBD5E1"}
            />
          </Box>
        </Box>
      </Box>
      {view === "calender" ? (
        <Box
          mt="20px"
          p="20px"
          bgColor={"#fff"}
          borderRadius="12px"
          border={"1px solid #E2E8F0"}
          pos={"relative"}
          className={"flex min-h-full"}
        >
          <Box className={"relative grow"}>
            <EventCalender events={calendarData} />
          </Box>
        </Box>
      ) : (
        <SimpleGrid
          columns={view === "list" ? 1 : { base: 1, md: 2, lg: 4 }}
          placeItems={"center"}
          gap={{ base: "16px", lg: "8px", xl: "16px" }}
          mb={"16px"}
        >
          {isLoading ? (
            <Text>Loading products...</Text>
          ) : (
            renderProducts()
          )}
        </SimpleGrid>
      )}
      {!isLoading && !products && "No products found."}
      {/* Plan Selection Modal */}
      <Modal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select a Product Plan</ModalHeader>
          <ModalBody>
            <ChakraText mb={4}>Choose a plan to upload your products:</ChakraText>
            <ChakraStack spacing={3}>
              {plans.map((plan) => (
                <ChakraButton key={plan.products} onClick={() => handleSelectPlan(plan)}>
                  {plan.products} products for ${plan.price}
                </ChakraButton>
              ))}
            </ChakraStack>
            {planError && <ChakraText color="red.500" mt={3}>{planError}</ChakraText>}
          </ModalBody>
          <ModalFooter>
            <ChakraButton onClick={() => setShowPlanModal(false)}>Cancel</ChakraButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
     </>
  );
}