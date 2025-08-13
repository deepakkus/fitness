"use client";
import { Box, Text, Button, Center, VStack, HStack, Badge } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderInfo, setOrderInfo] = useState<any>(null);

  useEffect(() => {
    // You can fetch order details here if needed
    // For now, we'll just show the success message
  }, []);

  return (
    <Center minH="80vh" bg="gray.50">
      <VStack spacing={6} p={8} bg="white" borderRadius="lg" boxShadow="lg" maxW="500px" w="full">
        <CheckCircleIcon boxSize={16} color="green.400" />
        <Text fontSize="2xl" fontWeight="bold" color="green.700">
          Payment Successful!
        </Text>
        <Text fontSize="lg" color="gray.600" textAlign="center">
          Thank you for your purchase. Your payment was processed successfully.<br />
          You will receive an email confirmation shortly.
        </Text>
        
        <Box bg="green.50" p={4} borderRadius="md" w="full">
          <Text fontSize="sm" color="green.700" fontWeight="medium">
            ✅ Order has been created successfully
          </Text>
          <Text fontSize="sm" color="green.600" mt={1}>
            The vendor has been notified and will process your order soon.
          </Text>
        </Box>

        <HStack spacing={4} w="full">
          <Button 
            colorScheme="green" 
            flex={1}
            onClick={() => router.push("/")}
          >
            Go to Home
          </Button>
          <Button 
            variant="outline" 
            colorScheme="blue" 
            flex={1}
            onClick={() => router.push("/vendor/dashboard")}
          >
            View My Orders
          </Button>
        </HStack>
        
        <Text fontSize="sm" color="gray.500" textAlign="center">
          Need help? Contact our support team
        </Text>
      </VStack>
    </Center>
  );
} 