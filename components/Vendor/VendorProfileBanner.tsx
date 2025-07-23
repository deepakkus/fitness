"use client";

import { Image, Box, Button, Text, useToast } from "@chakra-ui/react";
import Link from "next/link";
import { UserData } from "@/app/profile/me/page";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import UserImage from "../handleImage/UserImage";
import AchievementModal from "../Profile/AchievementModal";
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Button as ChakraButton, useDisclosure, Text as ChakraText, Stack as ChakraStack } from "@chakra-ui/react";
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Spinner, Center } from "@chakra-ui/react";

// Move this outside the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export interface UserMetrics {
  Events: number;
  Followers: number;
  Following: number;
  Post: number;
  Products: number;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  profile_pic: string;
  location: string;
  about_me: string | null;
  age_group: string | null;
  count?: UserMetrics;
  _count?: UserMetrics;
}

const getMetrics = (userData: UserData): UserMetrics => {
  return (
    userData._count ||
    userData.count || {
      Events: 0,
      Followers: 0,
      Following: 0,
      Post: 0,
      Products: 0,
    }
  );
};

// Billing details type
interface BillingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  zip: string;
  address: string;
}

export default function VendorProfileBanner({ userData }: { userData: UserData }) {
  const metrics = getMetrics(userData);
  const followers = metrics.Followers;
  const following = metrics.Following;
  const name = userData.name;
  const Profile = {
    bio: userData.about_me,
    profilePic: { url: userData.profile_pic },
  };
  const posts = metrics.Post;
  const events = metrics.Events;
  const products = metrics.Products;
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const handleOpenModal = () => setIsModalOpen(true); // Function to open modal
  const handleCloseModal = () => setIsModalOpen(false); // Function to close modal
  const [checkingPlan, setCheckingPlan] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planError, setPlanError] = useState("");
  const [productPlan, setProductPlan] = useState<{ hasPlan: boolean, total_product_remaining: number } | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [latestOrderId, setLatestOrderId] = useState<number | null>(null);
  // REMOVE: modalStep, selectedPlan, isPaying, paymentError, stripePromise

  // Plan options
  const plans = [
    { products: 5, price: 5 },
    { products: 10, price: 8 },
    { products: 15, price: 12 },
  ];
  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await axios.get('/api/users_product/me');
        setProductPlan(res.data);
      } catch (e) {
        setProductPlan(null);
      } finally {
        setPlanLoading(false);
      }
    }
    fetchPlan();
  }, []);
  function PlanPaymentForm({ plan, onSuccess, onError }: { plan: any; onSuccess: () => void; onError: (msg: string) => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      try {
        // Create PaymentIntent on the server
        const res = await axios.post('/api/stripe/plan-payment/create', { plan });
        const { clientSecret } = res.data;
        if (!clientSecret) throw new Error('No client secret returned');
        if (!stripe || !elements) throw new Error('Stripe not loaded');
        // Confirm card payment
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error('Card element not found');
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });
        if (result.error) {
          setError(result.error.message || 'Payment failed');
          setLoading(false);
          onError && onError(result.error.message || 'Payment failed');
        } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          setLoading(false);
          onSuccess && onSuccess();
        }
      } catch (err: any) {
        setError('Payment failed. Please try again.');
        setLoading(false);
        onError && onError('Payment failed. Please try again.');
      }
    };

    return (
      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <CardElement options={{ style: { base: { fontSize: '18px' } } }} />
        <ChakraButton
          colorScheme="orange"
          w="100%"
          isLoading={loading}
          type="submit"
          fontWeight="bold"
          fontSize="lg"
          borderRadius="md"
          mt={4}
          disabled={loading}
        >
          Pay ${plan.price}
        </ChakraButton>
        {error && <ChakraText color="red.500" mt={3} textAlign="center">{error}</ChakraText>}
      </form>
    );
  }

  const [modalStep, setModalStep] = useState<'plan' | 'payment' | 'success'>('plan');
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setModalStep('payment');
  };

  const handlePaymentSuccess = async () => {
    try {
      await axios.post('/api/users_product/purchase', { plan: selectedPlan });
      setModalStep('success'); // Only change modal step after payment and plan activation
    } catch {
      setPlanError('Plan activation failed. Please contact support.');
    }
  };

  useEffect(() => {
    async function fetchLatestOrderId() {
      if (userData?.id && modalStep === "success") {
        try {
          const res = await axios.get(`/api/plan-order-details/latest/${userData.id}`);
          setLatestOrderId(res.data.orderId);
        } catch {
          setLatestOrderId(null);
        }
      }
    }
    fetchLatestOrderId();
  }, [userData?.id, modalStep]);

  // REMOVE: handleStripePayment, useEffect for plan_paid, modalStep logic

  // Billing details state
  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    zip: '',
    address: '',
  });
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  // Fetch billing details from backend when entering payment step
  useEffect(() => {
    if (modalStep === 'payment') {
      setIsBillingLoading(true);
      (async () => {
        try {
          const res = await fetch('/api/billing-details', { credentials: 'include' });
          const json = await res.json();
          if (json && json.data) {
            setBillingDetails({
              firstName: json.data.first_name || '',
              lastName: json.data.last_name || '',
              email: json.data.email || '',
              phone: json.data.phone || '',
              city: json.data.city || '',
              zip: json.data.zip || '',
              address: json.data.address || '',
            });
          } else {
            setBillingDetails({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              city: '',
              zip: '',
              address: '',
            });
          }
          setIsBillingLoading(false);
        } catch (e) {
          setBillingDetails({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            city: '',
            zip: '',
            address: '',
          });
          setIsBillingLoading(false);
        }
      })();
    }
  }, [modalStep]);

  return (
    <Box
      w="full"
      py="28px"
      px="33px"
      borderTopRadius={"12px"}
      // border={"1px solid #E2E8F0"} // Removed border
      bgColor={"#FFF"}
    >
      <Box
        display={"flex"}
        flexDir={{ base: "column", md: "row" }}
        justifyContent={"space-between"}
        alignItems={"center"}
        w={"full"}
      >
        <Box
          display={"flex"}
          flexDir={{ base: "column", md: "row" }}
          gap={"65px"}
          justifyContent={"flex-start"}
          alignItems={"center"}
        >
          {/*   <Image fallbackSrc="" w={120} h={"120px"} objectFit={"cover"} rounded={99} src={Profile?.profilePic?.url} />*/}
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: "128px",
              height: "128px",
            }}
          >
            <UserImage
              imageUrl={Profile?.profilePic?.url}
              objectFit="cover"
              alt="prof pic"
              width="128"
              height="128"
            />
          </div>

          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"center"}
            gap="27px"
            alignItems={{ base: "center", md: "flex-start" }}
          >
            <Text
              fontSize={"28px"}
              fontWeight={"500"}
              fontFamily="var(--font-mulish)"
              color="#1E293B"
            >
              {name}
            </Text>
            <Box display={"flex"} gap={"45px"}>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Followers
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {followers}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Following
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {following}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Posts
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {posts}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Events
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {events}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Products
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {products}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          display={"flex"}
          flexDirection={"column"} // Changed to column layout
          gap={"18px"}
          pr={{ base: "0", md: "75px" }}
        >
          {/* <Button
            colorScheme="orange"
            py="9px"
            px="34px"
            borderRadius={"4px"}
            onClick={() => setShowPlanModal(true)}
            // isLoading={checkingPlan} // Remove if not used
          >
            Create Product
          </Button> */}
          {planLoading ? (
            <Button colorScheme="orange" py="9px" px="34px" borderRadius={"4px"} isLoading>
              Checking...
            </Button>
          ) : productPlan && productPlan.hasPlan && productPlan.total_product_remaining > 0 ? (
            <Button
              colorScheme="orange"
              py="9px"
              px="34px"
              borderRadius={"4px"}
              // onClick={() => setShowPlanModal(false)}
              onClick={() => { setShowPlanModal(false); router.push('/product/create'); }}
            >
              Create Product
            </Button>
          ) : (
            <Button
              colorScheme="orange"
              py="9px"
              px="34px"
              borderRadius={"4px"}
              onClick={() => setShowPlanModal(true)}
              //isDisabled
              //title="No product slots remaining. Please purchase a plan."
            >
              Create Product
            </Button>
          )}
          <Button
            colorScheme="orange"
            py="9px"
            px="34px"
            borderRadius={"4px"}
            onClick={() => router.push("/profile/me")}
          >
            User Dashboard 
          </Button>
        </Box>
      </Box>
      <AchievementModal isOpen={isModalOpen} onClose={handleCloseModal} />{" "}
      {/* Render the modal */}
      {/* Plan Selection Modal */}
      <Modal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)} isCentered size="md">
        <ModalOverlay />
        <ModalContent
          borderRadius="lg"
          boxShadow="xl"
          p={2}
          {...(modalStep === 'payment' ? { maxW: '700px', w: '100%' } : {})}
        >
          <ModalHeader textAlign="center" fontWeight="bold" fontSize="2xl" color="orange.500" letterSpacing="wide">
            {modalStep === 'plan' && 'Select a Product Plan'}
            {modalStep === 'payment' && 'Complete Payment'}
            {modalStep === 'success' && 'Payment Successful!'}
          </ModalHeader>
          <ModalBody>
            {modalStep === 'plan' && (
              <>
                <ChakraText mb={4} textAlign="center" color="gray.600" fontSize="md">
                  Choose a plan to upload your products:
                </ChakraText>
                <ChakraStack spacing={4} align="center">
                  {plans.map((plan) => (
                    <ChakraButton
                      key={plan.products}
                      onClick={() => handleSelectPlan(plan)}
                      leftIcon={<svg width="22" height="22" fill="none" viewBox="0 0 24 24"><rect width="24" height="24" rx="8" fill="#FFF3E0"/><path d="M7 17V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z" stroke="#f9690e" strokeWidth="1.5"/><path d="M9 10h6M9 14h6" stroke="#f9690e" strokeWidth="1.5" strokeLinecap="round"/></svg>}
                      colorScheme="orange"
                      variant="outline"
                      borderRadius="md"
                      borderWidth={2}
                      borderColor="orange.300"
                      fontWeight="bold"
                      fontSize="lg"
                      w="100%"
                      _hover={{ bg: "orange.50", borderColor: "orange.400" }}
                      _active={{ bg: "orange.100" }}
                      transition="all 0.2s"
                    >
                      {plan.products} products for ${plan.price}
                    </ChakraButton>
                  ))}
                </ChakraStack>
                {planError && <ChakraText color="red.500" mt={3} textAlign="center">{planError}</ChakraText>}
              </>
            )}
            {modalStep === 'payment' && (
              <>
                {isBillingLoading ? (
                  <Center minH="200px">
                    <Spinner size="xl" color="orange.500" />
                  </Center>
                ) : (
                  <>
                    {/* Billing Details Form - Inserted before payment form */}
                    <Box mb={6} p={4} borderRadius="md" borderWidth={1} borderColor="gray.200" bg="gray.50">
                      <Text fontSize="xl" fontWeight="bold" mb={4}>Billing Details</Text>
                      <Box as="form" display="flex" flexWrap="wrap" gap={4}>
                        <Box flex="1 1 45%" minW="200px">
                          <Text fontWeight="semibold" mb={1}>First Name <span style={{color: 'red'}}>*</span></Text>
                          <input
                            type="text"
                            required
                            className="chakra-input css-1c6j008"
                            value={billingDetails.firstName}
                            onChange={e => setBillingDetails({ ...billingDetails, firstName: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                          />
                        </Box>
                        <Box flex="1 1 45%" minW="200px">
                          <Text fontWeight="semibold" mb={1}>Last Name <span style={{color: 'red'}}>*</span></Text>
                          <input
                            type="text"
                            required
                            className="chakra-input css-1c6j008"
                            value={billingDetails.lastName}
                            onChange={e => setBillingDetails({ ...billingDetails, lastName: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                          />
                        </Box>
                        <Box flex="1 1 100%" minW="200px">
                          <Text fontWeight="semibold" mb={1}>Email <span style={{color: 'red'}}>*</span></Text>
                          <input
                            type="email"
                            required
                            className="chakra-input css-1c6j008"
                            value={billingDetails.email}
                            onChange={e => setBillingDetails({ ...billingDetails, email: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                          />
                        </Box>
                        <Box flex="1 1 45%" minW="200px">
                          <Text fontWeight="semibold" mb={1}>Phone Number <span style={{color: 'red'}}>*</span></Text>
                          <input
                            type="tel"
                            required
                            className="chakra-input css-1c6j008"
                            value={billingDetails.phone}
                            onChange={e => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                          />
                        </Box>
                        <Box flex="1 1 45%" minW="200px">
                          <Text fontWeight="semibold" mb={1}>City <span style={{color: 'red'}}>*</span></Text>
                          <input
                            type="text"
                            required
                            className="chakra-input css-1c6j008"
                            value={billingDetails.city}
                            onChange={e => setBillingDetails({ ...billingDetails, city: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                          />
                        </Box>
                        <Box flex="1 1 45%" minW="200px">
                          <Text fontWeight="semibold" mb={1}>Zip <span style={{color: 'red'}}>*</span></Text>
                          <input
                            type="text"
                            required
                            className="chakra-input css-1c6j008"
                            value={billingDetails.zip}
                            onChange={e => setBillingDetails({ ...billingDetails, zip: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                          />
                        </Box>
                        <Box flex="1 1 100%" minW="200px">
                          <Text fontWeight="semibold" mb={1}>Address <span style={{color: 'red'}}>*</span></Text>
                          <input
                            type="text"
                            required
                            className="chakra-input css-1c6j008"
                            value={billingDetails.address}
                            onChange={e => setBillingDetails({ ...billingDetails, address: e.target.value })}
                            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                          />
                        </Box>
                      </Box>
                    </Box>
                    <Elements stripe={stripePromise}>
                      <PlanPaymentForm plan={selectedPlan} onSuccess={handlePaymentSuccess} onError={setPlanError} />
                    </Elements>
                  </>
                )}
              </>
            )}
            {modalStep === 'success' && (
              <>
                <ChakraText mb={4} textAlign="center" color="green.600" fontSize="lg" fontWeight="bold">
                  Payment successful! You can now create your product.
                </ChakraText>
                {latestOrderId === null ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minH="40px">
                    <Spinner size="md" color="orange.500" />
                  </Box>
                ) : (
                  <ChakraText mb={2} textAlign="center" color="gray.700" fontSize="md">
                    Your order ID: <b>{latestOrderId}</b>
                  </ChakraText>
                )}
                <ChakraButton
                  colorScheme="orange"
                  w="100%"
                  onClick={() => { setShowPlanModal(false); router.push('/product/create'); }}
                  fontWeight="bold"
                  fontSize="lg"
                  borderRadius="md"
                  mt={2}
                  isDisabled={latestOrderId === null}
                >
                  Go to Create Product
                </ChakraButton>
              </>
            )}
          </ModalBody>
          <ModalFooter justifyContent="center">
            {modalStep !== 'success' && (
              <ChakraButton onClick={() => setShowPlanModal(false)} colorScheme="gray" variant="ghost" borderRadius="md" px={8} fontWeight="bold">
                Cancel
              </ChakraButton>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
export function ProfileBanner({ profileData }: { profileData: UserData }) {
  const metrics = getMetrics(profileData);
  const toast = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false); // State to track follow status
  const [isCheckingFollowStatus, setIsCheckingFollowStatus] = useState(true);
  const followers = metrics.Followers;
  const followingCount = metrics.Following; // Renamed to avoid confusion
  const name = profileData.name;
  const Profile = {
    bio: profileData.about_me,
    profilePic: { url: profileData.profile_pic },
  };
  const posts = metrics.Post;
  const events = metrics.Events;

  // Fetch the following status on component mount
  useEffect(() => {
    const checkFollowingStatus = async () => {
      setIsCheckingFollowStatus(true); // Start loading
      try {
        const response = await axios.get(`/api/check_follow/${profileData.id}`);
        setIsFollowing(response.data.isFollowing);
      } catch (error) {
        console.error("Error checking follow status:", error);
        // Handle error appropriately, perhaps default to "Follow" state
      } finally {
        setIsCheckingFollowStatus(false); // Stop loading
      }
    };

    if (profileData.id) {
      checkFollowingStatus();
    } else {
      setIsCheckingFollowStatus(false); // If profileData.id is not yet available
    }
  }, [profileData.id]);

  async function handleFollow() {
    setIsProcessing(true);
    try {
      const response = await axios.post(`/api/user_follow/${profileData.id}`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        toast({
          title: "Followed successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setIsFollowing(true); // Update local state
        router.refresh(); // Consider a more granular update if full refresh is too much
      } else {
        throw new Error(response.data.error || "Action failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while following",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleUnfollow() {
    setIsProcessing(true);
    try {
      const response = await axios.delete(
        `/api/user_unfollow/${profileData.id}`,
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        toast({
          title: "Unfollowed successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setIsFollowing(false); // Update local state
        router.refresh(); // Consider a more granular update
      } else {
        throw new Error(response.data.error || "Action failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while unfollowing",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <Box
      w="full"
      py="28px"
      px="33px"
      borderTopRadius={"12px"}
      border={"1px solid #E2E8F0"}
      bgColor={"#FFF"}
    >
      <Box
        display={"flex"}
        flexDir={{ base: "column", md: "row" }}
        justifyContent={"space-between"}
        alignItems={"center"}
        w={"full"}
      >
        <Box
          display={"flex"}
          flexDir={{ base: "column", md: "row" }}
          gap={"65px"}
          justifyContent={"flex-start"}
          alignItems={"center"}
        >
          <div
            style={{
              borderRadius: "50%",
              overflow: "hidden",
              width: "128px",
              height: "128px",
            }}
          >
            <UserImage
              imageUrl={Profile?.profilePic?.url}
              width="128px"
              height="128px"
              objectFit="cover"
            />
          </div>
          <Box
            display={"flex"}
            flexDir={"column"}
            justifyContent={"center"}
            gap="27px"
            alignItems={{ base: "center", md: "flex-start" }}
          >
            <Text
              fontSize={"28px"}
              fontWeight={"500"}
              fontFamily="var(--font-mulish)"
              color="#1E293B"
            >
              {name}
            </Text>
            <Box display={"flex"} gap={"45px"}>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Followers
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {followers || 0}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Following
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {followingCount || 0}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Posts
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {posts}
                </Text>
              </Box>
              <Box>
                <Text fontWeight={"400"} fontSize={"14px"} color="#475569">
                  Events
                </Text>
                <Text fontWeight={"600"} fontSize={"20px"} color="#334155">
                  {events}
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
        <Box display={"flex"} gap={"18px"} pr={{ base: "0", md: "75px" }}>
          {isCheckingFollowStatus ? (
            <Button
              isLoading
              colorScheme="orange"
              py="9px"
              px="34px"
              borderRadius={"4px"}
            >
              Checking...
            </Button>
          ) : isFollowing ? (
            <Button
              onClick={handleUnfollow}
              disabled={isProcessing}
              colorScheme="red"
              py="9px"
              px="34px"
              borderRadius={"4px"}
            >
              {isProcessing ? "Unfollowing..." : "Unfollow"}
            </Button>
          ) : (
            <Button
              onClick={handleFollow}
              disabled={isProcessing}
              colorScheme="orange"
              py="9px"
              px="34px"
              borderRadius={"4px"}
            >
              {isProcessing ? "Following..." : "Follow"}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
