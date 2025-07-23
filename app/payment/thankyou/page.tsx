"use client";
import { Box, Text, Button, Center, VStack } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { useRouter } from "next/navigation";

export default function PaymentThankYouPage() {
  const router = useRouter();
  return (
    <Center minH="80vh" bg="gray.50">
      <VStack spacing={6} p={8} bg="white" borderRadius="lg" boxShadow="lg">
        <CheckCircleIcon boxSize={16} color="green.400" />
        <Text fontSize="2xl" fontWeight="bold" color="green.700">
          Payment Successful!
        </Text>
        <Text fontSize="lg" color="gray.600" textAlign="center">
          Thank you for your purchase. Your payment was processed successfully.<br />
          You will receive an email confirmation shortly.
        </Text>
        <Button colorScheme="green" onClick={() => router.push("/")}>Go to Home</Button>
        <Button variant="link" colorScheme="blue" onClick={() => router.push("/vendor/dashboard")}>View My Orders</Button>
      </VStack>
    </Center>
  );
} 