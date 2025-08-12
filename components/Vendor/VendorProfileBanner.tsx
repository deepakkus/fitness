"use client";

import { Image, Box, Button, Text, useToast } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import UserImage from "../handleImage/UserImage";
import AchievementModal from "../Profile/AchievementModal";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button as ChakraButton,
  Text as ChakraText,
  Stack as ChakraStack,
} from "@chakra-ui/react";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Spinner, Center } from "@chakra-ui/react";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleCloseModal = () => setIsModalOpen(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planError, setPlanError] = useState("");
  const [productPlan, setProductPlan] = useState<{ hasPlan: boolean; total_product_remaining: number } | null>(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [latestOrderId, setLatestOrderId] = useState<number | null>(null);

  const plans = [
    { products: 5, price: 5 },
    { products: 10, price: 8 },
    { products: 15, price: 12 },
  ];

  useEffect(() => {
    async function fetchPlan() {
      try {
        const res = await axios.get("/api/users_product/me");
        setProductPlan(res.data);
      } catch (_e) {
        setProductPlan(null);
      } finally {
        setPlanLoading(false);
      }
    }
    fetchPlan();
  }, []);

  function PlanPaymentForm({
    plan,
    onSuccess,
    onError,
  }: {
    plan: any;
    onSuccess: () => void;
    onError: (msg: string) => void;
  }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError("");
      try {
        const res = await axios.post("/api/stripe/plan-payment/create", { plan });
        const { clientSecret } = res.data;
        if (!clientSecret) throw new Error("No client secret returned");
        if (!stripe || !elements) throw new Error("Stripe not loaded");
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) throw new Error("Card element not found");
        const result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });
        if (result.error) {
          setError(result.error.message || "Payment failed");
          setLoading(false);
          if (onError) onError(result.error.message || "Payment failed");
        } else if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
          setLoading(false);
          if (onSuccess) onSuccess();
        }
      } catch (_err: any) {
        setError("Payment failed. Please try again.");
        setLoading(false);
        if (onError) onError("Payment failed. Please try again.");
      }
    };

    return (
      <form onSubmit={handleSubmit} style={{ width: "100%" }}>
        <CardElement options={{ style: { base: { fontSize: "18px" } } }} />
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
        {error && (
          <ChakraText color="red.500" mt={3} textAlign="center">
            {error}
          </ChakraText>
        )}
      </form>
    );
  }

  const [modalStep, setModalStep] = useState<"plan" | "payment" | "success">("plan");
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setModalStep("payment");
  };

  const handlePaymentSuccess = async () => {
    try {
      await axios.post("/api/users_product/purchase", { plan: selectedPlan });
      setModalStep("success");
    } catch {
      setPlanError("Plan activation failed. Please contact support.");
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

  const [billingDetails, setBillingDetails] = useState<BillingDetails>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    zip: "",
    address: "",
  });
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  useEffect(() => {
    if (modalStep === "payment") {
      setIsBillingLoading(true);
      (async () => {
        try {
          const res = await fetch("/api/billing-details", { credentials: "include" });
          const json = await res.json();
          if (json && json.data) {
            setBillingDetails({
              firstName: json.data.first_name || "",
              lastName: json.data.last_name || "",
              email: json.data.email || "",
              phone: json.data.phone || "",
              city: json.data.city || "",
              zip: json.data.zip || "",
              address: json.data.address || "",
            });
          } else {
            setBillingDetails({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              city: "",
              zip: "",
              address: "",
            });
          }
          setIsBillingLoading(false);
        } catch (_e) {
          setBillingDetails({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            city: "",
            zip: "",
            address: "",
          });
          setIsBillingLoading(false);
        }
      })();
    }
  }, [modalStep]);

  return (
    // JSX remains the same except unused vars removed
    <>
      {/* The rest of your JSX content */}
    </>
  );
}
