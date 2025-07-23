"use client";
import { useEffect, useState } from "react";
import {
  Box, Button, Image, Text, VStack, HStack, Heading, Table, Thead, Tbody, Tr, Th, Td, Input, Radio, RadioGroup, Stack as CStack, Divider, useBreakpointValue, Spinner, Center
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

const SHIPPING_OPTIONS = [
  { label: "Free shipping", value: "free", cost: 0 },
  { label: "Flat rate: $10.00", value: "flat", cost: 10 },
  { label: "Pickup: $15.00", value: "pickup", cost: 15 },
];

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shipping, setShipping] = useState("free");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setCart(stored.map((item: any) => ({ ...item, price: Number(item.price) })));
    setLoading(false);
  }, []);

  const removeFromCart = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const shippingCost = SHIPPING_OPTIONS.find(opt => opt.value === shipping)?.cost || 0;
  const total = subtotal + shippingCost;

  const handleCheckout = () => {
    router.push("/product/order");
  };

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Box maxW="1200px" mx="auto" py={10} px={4}>
      <Heading mb={8}>Cart</Heading>
      {loading ? (
        <Center minH="300px">
          <Spinner size="xl" color="green.400" thickness="4px" speed="0.65s" />
        </Center>
      ) : cart.length === 0 ? (
        <VStack spacing={6}>
          <Text fontSize="lg">Your cart is empty.</Text>
          <Link href="/">
            <Button colorScheme="green">Browse Products</Button>
          </Link>
        </VStack>
      ) : (
        <Box display={{ base: "block", md: "flex" }} gap={10}>
          {/* Cart Table */}
          <Box flex={2} mb={{ base: 8, md: 0 }}>
            <Table variant="simple" bg="white" borderRadius="lg" boxShadow="md">
              <Thead>
                <Tr>
                  <Th>Product</Th>
                  <Th>Price</Th>
                  <Th>Quantity</Th>
                  <Th>Subtotal</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {cart.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      <HStack>
                        <Image src={item.image} alt={item.name} boxSize="60px" objectFit="cover" borderRadius="md" />
                        <Text fontWeight="bold">{item.name}</Text>
                      </HStack>
                    </Td>
                    <Td>${item.price.toFixed(2)}</Td>
                    <Td>
                      <Input value={1} width="60px" textAlign="center" readOnly />
                    </Td>
                    <Td>${item.price.toFixed(2)}</Td>
                    <Td>
                      <Button colorScheme="red" variant="outline" size="sm" onClick={() => removeFromCart(item.id)}>
                        Remove
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Cart Totals */}
          <Box flex={1} minW="320px" bg="white" borderRadius="lg" boxShadow="md" p={6}>
            <Heading as="h2" size="md" mb={6}>
              Cart totals
            </Heading>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text>Subtotal</Text>
                <Text fontWeight="bold">${subtotal.toFixed(2)}</Text>
              </HStack>
              <Divider />
              <HStack justify="space-between">
                <Text fontWeight="bold">Total</Text>
                <Text fontWeight="bold" fontSize="xl">${subtotal.toFixed(2)}</Text>
              </HStack>
              <Button colorScheme="gray" size="lg" mt={4} onClick={handleCheckout}>
                Proceed to checkout
              </Button>
            </VStack>
          </Box>
        </Box>
      )}
    </Box>
  );
} 