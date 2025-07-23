"use client";

import { Box, Button, FormControl, FormLabel, Input, Flex } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@chakra-ui/react';
import axios from 'axios';
import { useState } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function VendorListingPaymentForm() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const toast = useToast();
  const [nameOnCard, setNameOnCard] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!stripe || !elements) return;
//     const cardElement = elements.getElement(CardElement);
//     setIsProcessing(true);
//     // 1. Create PaymentMethod
//     const { error, paymentMethod } = await stripe.createPaymentMethod({
//       type: 'card',
//       card: cardElement!,
//       billing_details: { name: nameOnCard },
//     });
//     if (error) {
//       toast({ title: error.message, status: 'error' });
//       setIsProcessing(false);
//       return;
//     }
//     // 2. Call backend to create PaymentIntent
//     try {
//       //const res = await axios.post('/api/stripe', { paymentMethodId: paymentMethod.id, name: nameOnCard, cart: [] });
//       const res = await axios.post('/api/stripe/list-payment', {
//   paymentMethodId: paymentMethod.id,
//   name: nameOnCard,
//   cart: [{ id: 'listing', name: 'Vendor Listing', price: 49.99 }]
// });
//       const { clientSecret } = res.data;
//       // 3. Confirm payment
//       const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret);
//       if (confirmError) {
//         toast({ title: confirmError.message || 'Payment failed', status: 'error' });
//       } else if (paymentIntent?.status === 'succeeded') {
//         toast({ title: 'Payment successful!', status: 'success' });
//         router.push('/vendor/dashboard');
//       }
//     } catch (err: any) {
//       toast({ title: err.message || 'Payment failed', status: 'error' });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!stripe || !elements) return;
  const cardElement = elements.getElement(CardElement);
  setIsProcessing(true);

  try {
    // 1. Call backend to create PaymentIntent
    const res = await axios.post('/api/stripe/list-payment', {
      name: nameOnCard,
      cart: [{ id: 'listing', name: 'Vendor Listing', price: 49.99 }]
    });
    const { clientSecret } = res.data;

    // 2. Confirm payment and attach card details
    const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement!,
        billing_details: { name: nameOnCard }
      }
    });

    if (confirmError) {
      toast({ title: confirmError.message || 'Payment failed', status: 'error' });
    } else if (paymentIntent?.status === 'succeeded') {
      //const orderRes = await axios.post('/api/order-details', { cart });
      toast({ title: 'Payment successful!', status: 'success' });
      router.push('/vendor/dashboard');
    }
  } catch (err: any) {
    toast({ title: err.message || 'Payment failed', status: 'error' });
  } finally {
    setIsProcessing(false);
  }
};

  return (
    <Box minH="100vh" bg="#f8fafc" display="flex" alignItems="center" justifyContent="center" px={2}>
      <Box
        maxW="900px"
        w="100%"
        bg="#fff"
        borderRadius="12px"
        border="1px solid #F1F5F9"
        boxShadow="0 2px 8px rgba(0,0,0,0.04)"
        p={{ base: 6, md: 10 }}
        mt={8}
      >
        <form onSubmit={handleSubmit}>
          <FormControl mb={6} isRequired>
            <FormLabel fontWeight="bold">Name On Card</FormLabel>
            <Input placeholder="Enter Name On Card" size="lg" value={nameOnCard} onChange={e => setNameOnCard(e.target.value)} />
          </FormControl>
          <FormControl mb={6} isRequired>
            <FormLabel fontWeight="bold">Card Details</FormLabel>
            <Box p={3} border="1px solid #F1F5F9" borderRadius="6px" bg="#f9fafb">
              <CardElement options={{ style: { base: { fontSize: '16px', color: '#000' }, invalid: { color: '#fa755a' } } }} />
            </Box>
          </FormControl>
          <Flex justifyContent="flex-end" gap={4} mt={8}>
            <Button variant="outline" colorScheme="orange" px={8} py={2.5} borderRadius="4px" type="button" onClick={() => router.back()}>
              Back
            </Button>
            <Button colorScheme="orange" px={8} py={2.5} borderRadius="4px" type="submit" isLoading={isProcessing}>
              Pay Now
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}

export default function VendorListingPayment() {
  return (
    <Elements stripe={stripePromise}>
      <VendorListingPaymentForm />
    </Elements>
  );
} 