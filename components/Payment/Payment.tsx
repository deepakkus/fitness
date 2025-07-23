"use client";

//import { Box, Text, Center, Button, HStack, Divider, VStack, VStack } from "@chakra-ui/react";
import {
  Box,
  Button,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  Image,
  Input,
  Text,
  VStack,
  HStack,
  Flex,
  Radio,
  RadioGroup,
  Divider,
  Center,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  SimpleGrid
} from "@chakra-ui/react";
//import { useState } from 'react';
import { useState, useEffect, useCallback } from "react";
import "react-quill/dist/quill.snow.css";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PaymentIcon from "../Icons/PaymentIcon";
import axios from "axios";
import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';

export function Payment() {
  //useSteps hook
  const { data: session, status } = useSession();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const router = useRouter();
  const defaultImage = "/placeholder.png";
  const [method, setMethod] = useState("creditCard");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [products, setProducts] = useState<Array<{ id: number; name: string }>>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

  // Sorting state
  const [sortBy, setSortBy] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Sorting handler
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Sorted payments
  const sortedPayments = [...payments].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (sortBy === 'billing_name') {
      aValue = a.first_name + ' ' + (a.last_name || '');
      bValue = b.first_name + ' ' + (b.last_name || '');
    }
    if (aValue === undefined) aValue = '';
    if (bValue === undefined) bValue = '';
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return sortDirection === 'asc'
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });

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
    const fetchProducts = async () => {
      try {
        const response = await axios.get('/api/products/active', { withCredentials: true });
        console.log('respro---'+JSON.stringify(response))
        setProducts(response.data.data); // Assuming the response is an array of products
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    if (session) {
      fetchProducts();
    }
  }, [session]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await axios.get("/api/order-details/user");
        setPayments(res.data.data || []);
      } catch (err) {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Event handlers
  const handleNext = async () => {
    router.push(`/product/257`);
    router.refresh();
    //console.log("Hi, there!!!");
  }

  function getPaymentStatusText(status: string) {
    switch (status) {
      case "S": return "Success";
      case "F": return "Failed";
      default: return status;
    }
  }

  return (
    <Box p={4}>
      {!selectedPayment && (
        <Text fontSize="xl" fontWeight="bold" mb={4}>Payments</Text>
      )}
      {loading ? (
        <Spinner />
      ) : selectedPayment ? (
        <Box display="flex" justifyContent="center" w="100%">
          <Box
            display={{ base: 'block', md: 'flex' }}
            gap={8}
            maxW="900px"
            w="100%"
            bg="transparent"
          >
            {/* Left: Payment/Product Details */}
            <Box
              flex={1}
              maxW="380px"
              w="100%"
              p={6}
              borderRadius="lg"
              boxShadow="0 2px 12px rgba(0,0,0,0.07)"
              bg="white"
              border="1px solid #f0f0f0"
              mb={{ base: 6, md: 0 }}
            >
              <Button onClick={() => setSelectedPayment(null)} mb={4} size="sm" variant="outline">← Back</Button>
              <Text fontWeight="bold" color="gray.700" fontSize="lg" mb={4}>Payment Details</Text>
              <Box mb={4}>
                <Text fontWeight="bold" color="gray.600">Product Details</Text>
                <Box display="flex" alignItems="center" mt={2}>
                  <Image
                    src={selectedPayment.product_image || "/placeholder.png"}
                    alt={selectedPayment.product_name}
                    boxSize="80px"
                    borderRadius="8px"
                    mr={4}
                    fallbackSrc="/placeholder.png"
                    border="1px solid #eee"
                    bg="gray.50"
                  />
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">{selectedPayment.product_name}</Text>
                    <Text color="green.600" fontWeight="bold" fontSize="xl" mt={1}>
                      ${Number(selectedPayment.price).toFixed(2)}
                    </Text>
                  </Box>
                </Box>
              </Box>
              <Box mb={4}>
                <Text fontWeight="bold" color="gray.600">Amount</Text>
                <Text color="green.700" fontWeight="bold" fontSize="lg" mt={1}>
                  ${Number(selectedPayment.price).toFixed(2)}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.600">Payment Status</Text>
                {selectedPayment.payment_status === 'S' ? (
                  <Text color="green.500" fontWeight="bold" mt={1}>Success</Text>
                ) : selectedPayment.payment_status === 'F' ? (
                  <Text color="red.500" fontWeight="bold" mt={1}>Failed</Text>
                ) : (
                  <Text mt={1}>{getPaymentStatusText(selectedPayment.payment_status)}</Text>
                )}
              </Box>
            </Box>
            {/* Right: Billing Details */}
            <Box
              flex={1}
              p={6}
              borderRadius="lg"
              boxShadow="0 2px 12px rgba(0,0,0,0.07)"
              bg="white"
              border="1px solid #f0f0f0"
              minW={{ md: '340px' }}
            >
              <Text fontWeight="bold" color="gray.700" fontSize="lg" mb={4}>Billing Details</Text>
              <Box as="dl">
                <Box display="flex" mb={2}>
                  <Text as="dt" color="gray.600" minW="90px">Name:</Text>
                  <Text as="dd" color="gray.800" fontWeight="semibold">{selectedPayment.first_name} {selectedPayment.last_name}</Text>
                </Box>
                <Box display="flex" mb={2}>
                  <Text as="dt" color="gray.600" minW="90px">Email:</Text>
                  <Text as="dd" color="gray.800">{selectedPayment.email}</Text>
                </Box>
                <Box display="flex" mb={2}>
                  <Text as="dt" color="gray.600" minW="90px">Phone:</Text>
                  <Text as="dd" color="gray.800">{selectedPayment.phone}</Text>
                </Box>
                <Box display="flex" mb={2}>
                  <Text as="dt" color="gray.600" minW="90px">Address:</Text>
                  <Text as="dd" color="gray.800">{selectedPayment.address}</Text>
                </Box>
                <Box display="flex" mb={2}>
                  <Text as="dt" color="gray.600" minW="90px">City:</Text>
                  <Text as="dd" color="gray.800">{selectedPayment.city}</Text>
                </Box>
                <Box display="flex" mb={2}>
                  <Text as="dt" color="gray.600" minW="90px">Pincode:</Text>
                  <Text as="dd" color="gray.800">{selectedPayment.pincode || '-'}</Text>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      ) : (
        <Table>
          <Thead>
            <Tr>
              <Th cursor="pointer" onClick={() => handleSort('id')}>
                ORDER ID{' '}
                {sortBy === 'id' && (sortDirection === 'asc' ? <TriangleUpIcon boxSize={3} /> : <TriangleDownIcon boxSize={3} />)}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('product_name')}>
                PRODUCT{' '}
                {sortBy === 'product_name' && (sortDirection === 'asc' ? <TriangleUpIcon boxSize={3} /> : <TriangleDownIcon boxSize={3} />)}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('billing_name')}>
                BILLING NAME{' '}
                {sortBy === 'billing_name' && (sortDirection === 'asc' ? <TriangleUpIcon boxSize={3} /> : <TriangleDownIcon boxSize={3} />)}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('price')}>
                AMOUNT{' '}
                {sortBy === 'price' && (sortDirection === 'asc' ? <TriangleUpIcon boxSize={3} /> : <TriangleDownIcon boxSize={3} />)}
              </Th>
              <Th cursor="pointer" onClick={() => handleSort('payment_status')}>
                PAYMENT STATUS{' '}
                {sortBy === 'payment_status' && (sortDirection === 'asc' ? <TriangleUpIcon boxSize={3} /> : <TriangleDownIcon boxSize={3} />)}
              </Th>
              <Th>ACTION</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sortedPayments.map(payment => (
              <Tr key={payment.id}>
                <Td>{payment.id}</Td>
                <Td>{payment.product_name}</Td>
                <Td>{payment.first_name ? (payment.last_name ? `${payment.first_name} ${payment.last_name}` : payment.first_name) : "-"}</Td>
                <Td>${Number(payment.price).toFixed(2)}</Td>
                <Td>
                  {payment.payment_status === 'S' ? (
                    <Text color="green.500" fontWeight="bold">Success</Text>
                  ) : payment.payment_status === 'F' ? (
                    <Text color="red.500" fontWeight="bold">Failed</Text>
                  ) : (
                    <Text>{getPaymentStatusText(payment.payment_status)}</Text>
                  )}
                </Td>
                <Td>
                  <Button size="sm" onClick={() => setSelectedPayment(payment)}>
                    See Details
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
}
