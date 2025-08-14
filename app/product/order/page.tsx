"use client";
import {
  Box,
  Button,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  Image,
  Input,
  Select,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
  useSteps,
  useToast,
  VStack,
  HStack,
  Flex,
  Radio,
  RadioGroup,
  Divider,
  IconButton,
  Heading,
} from "@chakra-ui/react";
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import axios from "axios";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {

  useDisclosure,
} from "@chakra-ui/react";

import "react-quill/dist/quill.snow.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MinusIcon } from "@chakra-ui/icons/Minus";
import { AddIcon } from "@chakra-ui/icons/Add";
import { DeleteIcon } from "@chakra-ui/icons/Delete";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
function CheckOutProduct() {

  //useSteps hook
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();
  const defaultImage = "/placeholder.png";
  const [quantity, setQuantity] = useState(1);
  const [method, setMethod] = useState("creditCard");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const toast = useToast();
  const [billingId, setBillingId] = useState<number | null>(null);
  const stripe = useStripe();
  const elements = useElements();
  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };


  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken as string);
    } else {
      setAccessToken(null);
    }
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (session) {
          await axios.get(`/api/user/me`, {
            withCredentials: true,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart((stored as any[]).map((item) => ({ ...item, price: Number(item.price) })));
  }, []);

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: 3,
  });

  // On mount, fetch billing details
  useEffect(() => {
    const fetchBilling = async () => {
      try {
        const res = await axios.get("/api/billing-details");
        if (res.data && res.data.data) {
          // Check if the billing details have meaningful data (not just auto-created empty row)
          const hasRealData = res.data.data.first_name || res.data.data.last_name || 
                             res.data.data.phone || res.data.data.city || 
                             res.data.data.zip || res.data.data.address;
          
          if (hasRealData || res.data.data.email) {
            // If billing details exist with real data, use them
            setFormData({
              firstName: res.data.data.first_name,
              lastName: res.data.data.last_name,
              emailAddress: res.data.data.email || session?.user?.email || "",
              phoneNumber: res.data.data.phone,
              city: res.data.data.city,
              zip: res.data.data.zip,
              address: res.data.data.address,
            });
            setBillingId(res.data.data.id);
          } else {
            // If only auto-created empty row exists, populate with logged-in user's email
            if (session?.user?.email) {
              setFormData({
                firstName: "",
                lastName: "",
                emailAddress: session.user.email,
                phoneNumber: "",
                city: "",
                zip: "",
                address: "",
              });
            }
            setBillingId(res.data.data.id); // Keep the ID for future updates
          }
        } else {
          // If no billing details exist, populate with logged-in user's email
          if (session?.user?.email) {
            setFormData({
              firstName: "",
              lastName: "",
              emailAddress: session.user.email,
              phoneNumber: "",
              city: "",
              zip: "",
              address: "",
            });
          }
        }
      } catch {
        // If API call fails, populate with logged-in user's email as fallback
        if (session?.user?.email) {
          setFormData({
            firstName: "",
            lastName: "",
            emailAddress: session.user.email,
            phoneNumber: "",
            city: "",
            zip: "",
            address: "",
          });
        }
      }
    };
    fetchBilling();

    const buyNowProductId = localStorage.getItem("buyNowProductId");
  if (buyNowProductId) {
    axios.get(`/api/products/${buyNowProductId}`).then(res => {
      const product = res.data.data?.[0];
      if (product) {
        setCart([{
          id: product.id,
          name: product.name,
          price: Number(product.price),
          image: product.images?.[0]?.url || "/placeholder.png",
        }]);
      }
      localStorage.removeItem("buyNowProductId");
    });
  } else {
    // fallback to normal cart logic
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart((stored as any[]).map((item) => ({ ...item, price: Number(item.price) })));
  }
  }, [session]);

  // Event handlers
  const handleNext = async () => {
    if (activeStep === 0) {
      if (!validateForm()) {
        toast({ title: "Please fix the errors in the form.", status: "error" });
        return;
      }
      try {
        if (billingId) {
          await axios.put("/api/billing-details", formData);
        } else {
          await axios.post("/api/billing-details", formData);
        }
        setActiveStep(activeStep + 1);
      } catch (err) {
        toast({ title: "Failed to save billing details.", status: "error" });
      }
    } else if (activeStep < 2) {
      setActiveStep(activeStep + 1);
    } else {
      router.push(`/vendor/dashboard`);
      router.refresh();
    }
  };

  const handleCancel = () => {
    setActiveStep(0);
  };

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    city: "",
    zip: "",
    address: "",
  });

  const [formErrors, setFormErrors] = useState({
    firstName: "",
    lastName: "",
    emailAddress: "",
    phoneNumber: "",
    city: "",
    zip: "",
    address: "",
  });

  // Validation function
  const validateForm = () => {
    const errors: any = {};
    if (!formData.firstName) errors.firstName = "First name is required";
    if (!formData.lastName) errors.lastName = "Last name is required";
    if (!formData.emailAddress) errors.emailAddress = "Email is required";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.emailAddress)) errors.emailAddress = "Invalid email";
    if (!formData.phoneNumber) errors.phoneNumber = "Phone number is required";
    else if (!/^\d{7,15}$/.test(formData.phoneNumber)) errors.phoneNumber = "Invalid phone number";
    if (!formData.city) errors.city = "City is required";
    if (!formData.zip) errors.zip = "Zip is required";
    else if (!/^\d{4,10}$/.test(formData.zip)) errors.zip = "Invalid zip code";
    if (!formData.address) errors.address = "Address is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Update handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Calculate subtotal
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });
  const [paymentErrors, setPaymentErrors] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // const validatePayment = () => {
  //   const errors: any = {};
  //   if (!paymentData.nameOnCard) errors.nameOnCard = "Name is required";
  //   if (!/^[0-9]{16}$/.test(paymentData.cardNumber)) errors.cardNumber = "Card number must be 16 digits";
  //   if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.expiry)) errors.expiry = "Expiry must be MM/YY";
  //   if (!/^[0-9]{3,4}$/.test(paymentData.cvv)) errors.cvv = "CVV must be 3 or 4 digits";
  //   setPaymentErrors(errors);
  //   return Object.keys(errors).length === 0;
  // };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };
   
  const handlePayment = async () => {
    // if (!validatePayment()) {
    //   toast({ title: "Please fix the errors in the payment form.", status: "error" });
    //   return;
    // }

    if (!stripe || !elements) {
    console.error("Stripe.js has not loaded yet.");
    return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error("CardElement not found.");
      return;
    }
    
    setIsProcessing(true);
    try {
      // 1. Create order(s) in order_details before payment
      
      // 2. Proceed with Stripe payment
      const productId = cart.length > 0 ? cart[0].id : undefined;
      const res = await axios.post('/api/stripe', { cart, productId });
      const { clientSecret } = res.data;
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: paymentData.nameOnCard,
            email: formData.emailAddress,
          },
        },
      });
      if (error) {
        toast({ title: error.message || "Payment failed", status: "error" });
      } else if (paymentIntent?.status === "succeeded") {
        const orderRes = await axios.post('/api/order-details', { cart });
      if (!orderRes.data.success) {
        toast({ title: orderRes.data.error || 'Failed to create order(s).', status: 'error' });
        setIsProcessing(false);
        return;
      }
        localStorage.removeItem("cart");
        setCart([]);
        window.dispatchEvent(new Event("cartUpdated"));
        router.push("/payment/thankyou");
      }
    } catch (err: any) {
      toast({ title: err.message || 'Failed to process payment.', status: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box p={{ base: "20px 10px", md: "30px", lg: "40px" }}>

      <Box
        w="full"
        gap="40px"
        display={"flex"}
        flexDir={{ base: "column", md: "row" }}
        justifyContent={"center"}
        alignItems={"flex-start"}
      >
        <Box flex="1" w={"full"}>
          <Stepper
            index={activeStep}
            colorScheme="orange"
            bgColor={"#FFF"}
            mb="20px"
            p="20px"
            borderRadius={"12px"}
            border={"1px solid #F1F5F9"}
          >
            <Step key={0}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{`Address`}</StepTitle>

              </Box>

              <StepSeparator />
            </Step>
            <Step key={1}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{`Order Summary`}</StepTitle>

              </Box>

              <StepSeparator />
            </Step>
            <Step key={2}>
              <StepIndicator>
                <StepStatus
                  complete={<StepIcon />}
                  incomplete={<StepNumber />}
                  active={<StepNumber />}
                />
              </StepIndicator>

              <Box flexShrink="0">
                <StepTitle>{`Payment`}</StepTitle>

              </Box>

              <StepSeparator />
            </Step>
          </Stepper>

          {activeStep === 0 && (
            <Box
              p={{
                base: "20px",
                md: "30px",
              }}
              bgColor={"#FFF"}
              border={"1px solid #F1F5F9"}
              borderBottom={"none"}
              borderRadius={"12px"}
              borderBottomRadius={"0px"}
            >
              <FormControl display={"flex"} flexDir={"column"} gap="20px">
                <Box>
                  {/* First Name & Last Name */}
                  <Box display={"flex"} gap="20px">
                    <Box flex="1">
                      <FormLabel color={"#475569"} fontSize={"14px"}>
                        First Name
                        <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        focusBorderColor="#F9690E"
                        type="text"
                        placeholder={"Enter First Name"}
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        borderRadius={"3px"}
                        isInvalid={!!formErrors.firstName}
                      />
                      {formErrors.firstName && <Text color="red.500" fontSize="sm">{formErrors.firstName}</Text>}
                    </Box>
                    <Box flex="1">
                      <FormLabel color={"#475569"} fontSize={"14px"}>
                        Last Name
                        <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        focusBorderColor="#F9690E"
                        type="text"
                        placeholder={"Enter Last Name"}
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        borderRadius={"3px"}
                        isInvalid={!!formErrors.lastName}
                      />
                      {formErrors.lastName && <Text color="red.500" fontSize="sm">{formErrors.lastName}</Text>}
                    </Box>
                  </Box>
                </Box>

                <Box>
                  {/* Email & Phone Number */}
                  <Box display={"flex"} gap="20px">
                    <Box flex="1">
                      <FormLabel color={"#475569"} fontSize={"14px"}>
                        Email
                        <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        focusBorderColor="#F9690E"
                        type="text"
                        placeholder={"Enter Email"}
                        name="emailAddress"
                        value={formData.emailAddress}
                        onChange={handleChange}
                        borderRadius={"3px"}
                        isInvalid={!!formErrors.emailAddress}
                      />
                      {formErrors.emailAddress && <Text color="red.500" fontSize="sm">{formErrors.emailAddress}</Text>}
                    </Box>
                    <Box flex="1">
                      <FormLabel color={"#475569"} fontSize={"14px"}>
                        Phone Number
                        <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        focusBorderColor="#F9690E"
                        type="text"
                        placeholder={"Enter Phone Number"}
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        borderRadius={"3px"}
                        isInvalid={!!formErrors.phoneNumber}
                      />
                      {formErrors.phoneNumber && <Text color="red.500" fontSize="sm">{formErrors.phoneNumber}</Text>}
                    </Box>
                  </Box>
                </Box>

                <Box>
                  {/*  city & zip  */}
                  <Box display={"flex"} gap="20px">
                    <Box flex="1">
                      <FormLabel color={"#475569"} fontSize={"14px"}>
                        City
                        <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        focusBorderColor="#F9690E"
                        type="text"
                        placeholder={"Enter City"}
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        borderRadius={"3px"}
                        isInvalid={!!formErrors.city}
                      />
                      {formErrors.city && <Text color="red.500" fontSize="sm">{formErrors.city}</Text>}
                    </Box>
                    <Box flex="1">
                      <FormLabel color={"#475569"} fontSize={"14px"}>
                        Zip
                        <span style={{ color: 'red' }}>*</span>
                      </FormLabel>
                      <Input
                        focusBorderColor="#F9690E"
                        type="text"
                        placeholder={"Enter Zip"}
                        name="zip"
                        value={formData.zip}
                        onChange={handleChange}
                        borderRadius={"3px"}
                        isInvalid={!!formErrors.zip}
                      />
                      {formErrors.zip && <Text color="red.500" fontSize="sm">{formErrors.zip}</Text>}
                    </Box>
                  </Box>
                </Box>

                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Address
                    <span style={{ color: "red" }}>*</span>
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="text"
                    placeholder="Enter Address"
                    fontSize={"16px"}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    borderRadius={"3px"}
                    isInvalid={!!formErrors.address}
                  />
                  {formErrors.address && <Text color="red.500" fontSize="sm">{formErrors.address}</Text>}
                </Box>


              </FormControl>
            </Box>
          )}
          {activeStep === 1 && (
            <Box w="full" bg="white" borderRadius="lg" boxShadow="md" p={6}>
              <Heading as="h2" size="md" mb={6}>
                Order Summary
              </Heading>
              {cart.length === 0 ? (
                <Text>Your cart is empty.</Text>
              ) : (
                <>
                  {cart.map((item) => (
                    <Flex key={item.id} align="center" mb={4}>
                      <Image src={item.image} alt={item.name} boxSize="60px" objectFit="cover" borderRadius="md" mr={4} />
                      <Box flex={1}>
                        <Text fontWeight="bold">{item.name}</Text>
                      </Box>
                      <Text>${item.price.toFixed(2)}</Text>
                    </Flex>
                  ))}
                  <Divider my={4} />
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Total</Text>
                    <Text fontWeight="bold" fontSize="xl">
                      ${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                    </Text>
                  </Flex>
                </>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Box
              p={{ base: "20px", md: "30px" }}
              bgColor={"#FFF"}
              border={"1px solid #F1F5F9"}
              borderBottom={"none"}
              borderRadius={"12px"}
              borderBottomRadius={"0px"}
            >
              <FormControl display={"flex"} flexDir={"column"} gap="20px">
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Name On Card
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="text"
                    placeholder={"Enter Name On Card"}
                    name="nameOnCard"
                    value={paymentData.nameOnCard}
                    onChange={handlePaymentChange}
                    borderRadius={"3px"}
                    isInvalid={!!paymentErrors.nameOnCard}
                  />
                  {paymentErrors.nameOnCard && <Text color="red.500" fontSize="sm">{paymentErrors.nameOnCard}</Text>}
                </Box>
                {/* <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Card Number
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="text"
                    placeholder={"Enter Card Number"}
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={e => {
                      // Only allow digits and limit to 16
                      const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setPaymentData(prev => ({ ...prev, cardNumber: value }));
                    }}
                    borderRadius={"3px"}
                    isInvalid={!!paymentErrors.cardNumber}
                    maxLength={16}
                  />
                  {paymentErrors.cardNumber && <Text color="red.500" fontSize="sm">{paymentErrors.cardNumber}</Text>}
                </Box>
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    Expiration Date
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="text"
                    placeholder={"MM/YY"}
                    name="expiry"
                    value={paymentData.expiry}
                    onChange={handlePaymentChange}
                    borderRadius={"3px"}
                    isInvalid={!!paymentErrors.expiry}
                  />
                  {paymentErrors.expiry && <Text color="red.500" fontSize="sm">{paymentErrors.expiry}</Text>}
                </Box>
                <Box>
                  <FormLabel color={"#475569"} fontSize={"14px"}>
                    CVV
                    <span style={{ color: 'red' }}>*</span>
                  </FormLabel>
                  <Input
                    focusBorderColor="#F9690E"
                    type="text"
                    placeholder={"CVV"}
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handlePaymentChange}
                    borderRadius={"3px"}
                    isInvalid={!!paymentErrors.cvv}
                  />
                  {paymentErrors.cvv && <Text color="red.500" fontSize="sm">{paymentErrors.cvv}</Text>}
                </Box> */}

                <Box p={3} border="1px solid #F1F5F9" borderRadius="6px">
          <CardElement
            options={{
              style: {
                base: { fontSize: '16px', color: '#000' },
                invalid: { color: '#fa755a' },
              },
            }}
          />
        </Box>
                <Flex justifyContent="flex-end" gap={4} mt={8}>
                  {/* <Button variant="outline" colorScheme="orange" px={8} py={2.5} borderRadius="4px" onClick={handleCancel}>
                    Back
                  </Button> */}
                  <Button colorScheme="orange" px={8} py={2.5} borderRadius="4px" onClick={handlePayment}>
                    Payment
                  </Button>
                </Flex>
              </FormControl>
            </Box>
          )}
          <Box
            mt="10px"
            display="flex"
            bgColor="#fff"
            p="30px"
            border="1px solid #F1F5F9"
            borderRadius="12px"
            borderTopRadius="0px"
            justifyContent="space-between"
            flexWrap="wrap"
            gap="20px"
          >
            <Button
              size="md"
              px="44px"
              borderRadius="3px"
              variant="outline"
              colorScheme="orange"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Box display={"flex"} flexWrap={"wrap"} gap="10px">
              {activeStep === 0 ? null : (
                <Button
                  size="md"
                  px="44px"
                  borderRadius="3px"
                  variant="outline"
                  colorScheme="orange"
                  onClick={() => {
                    if (activeStep == 0) {
                      return;
                    }
                    setActiveStep(activeStep - 1);
                  }}
                >
                  Back
                </Button>
              )}
              {activeStep !== 2 && (
                <Button
                  size="md"
                  px="44px"
                  borderRadius="3px"
                  colorScheme="orange"
                  onClick={handleNext}
                  disabled={isProcessing}
                >
                  {activeStep === 0 && "Next"}
                  {activeStep === 1 && "Next"}
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        <Box
          minW={{ base: "100%", md: "350px" }}
          maxW={{ base: "100%", md: "400px" }}
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          p={6}
          position={{ md: "sticky" }}
          top={{ md: 8 }}
          alignSelf={{ md: "flex-start" }}
          mt={{ base: 8, md: 0 }}
        >
          {cart.length === 0 ? (
            <Text>Your cart is empty.</Text>
          ) : (
            <>
              {cart.map((item: CartItem) => (
                <Box key={item.id} mb={6} borderBottom="1px solid #F1F5F9" pb={4}>
                  <HStack align="flex-start">
                    <Image src={item.image} alt={item.name} boxSize="64px" objectFit="cover" borderRadius="md" />
                    <Box flex={1}>
                      <Text fontWeight="bold" fontSize="lg">{item.name}</Text>
                      <Text color="#F9690E" fontWeight="bold" fontSize="xl" mt={1}>${item.price.toFixed(2)}</Text>
                      <HStack mt={3} spacing={2}>
                        <Button size="sm" variant="outline" colorScheme="gray" isDisabled>-</Button>
                        <Input value={1} width="48px" textAlign="center" readOnly size="sm" />
                        <Button size="sm" variant="outline" colorScheme="gray" isDisabled>+</Button>
                      </HStack>
                      <Button leftIcon={<DeleteIcon />} colorScheme="orange" variant="solid" size="sm" mt={3} isDisabled>
                        Remove
                      </Button>
                    </Box>
                  </HStack>
                </Box>
              ))}
              <Box mt={2}>
                <Text fontWeight="bold" mb={2}>Price Details ({cart.length} Item{cart.length > 1 ? 's' : ''})</Text>
                <HStack justify="space-between" mb={1}>
                  <Text>Subtotal</Text>
                  <Text>${subtotal.toFixed(2)}</Text>
                </HStack>
                <HStack justify="space-between" mb={1}>
                  <Text>Shipping</Text>
                  <Text>Free</Text>
                </HStack>
                <HStack justify="space-between" mb={1}>
                  <Text>Total before tax</Text>
                  <Text>${subtotal.toFixed(2)}</Text>
                </HStack>
                <HStack justify="space-between" mb={1}>
                  <Text>Estimated tax to be collected</Text>
                  <Text>$0.00</Text>
                </HStack>
                <Divider my={2} />
                <HStack justify="space-between">
                  <Text fontWeight="bold">Order Total</Text>
                  <Text fontWeight="bold" fontSize="xl">${subtotal.toFixed(2)}</Text>
                </HStack>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
export default function Page() {
  return (
    <Elements stripe={stripePromise}>
      <CheckOutProduct />
    </Elements>
  );
}