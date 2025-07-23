"use client";

import { useState } from 'react';
import { Button } from '@chakra-ui/react';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export function PayNow() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post('/api/stripe');
      const { sessionId } = data;
      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      isLoading={isLoading}
      colorScheme="orange"
      size="lg"
    >
      Become a Verified Vendor
    </Button>
  );
} 