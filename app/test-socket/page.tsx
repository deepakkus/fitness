"use client";
import { useEffect, useState } from "react";
import { useSocket } from "../socket";
import { Box, Text, VStack, HStack, Badge, Button } from "@chakra-ui/react";
import axios from "axios";

export default function TestSocketPage() {
  const { socket, isConnected, error, lastActivity } = useSocket();
  const [socketStatus, setSocketStatus] = useState<any>(null);
  const [testNotification, setTestNotification] = useState<string>("");

  useEffect(() => {
    // Test socket server status
    const checkSocketStatus = async () => {
      try {
        const response = await axios.get('/api/socket');
        setSocketStatus(response.data);
      } catch (error) {
        console.error('Error checking socket status:', error);
        setSocketStatus({ error: 'Failed to check socket status' });
      }
    };

    checkSocketStatus();
  }, []);

  const sendTestNotification = async () => {
    try {
      const response = await axios.post('/api/order-details', {
        cart: [{
          id: 'test-product',
          price: 10.00
        }]
      });
      setTestNotification(`Test notification sent: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setTestNotification(`Error sending test notification: ${error}`);
    }
  };

  return (
    <Box p={8} maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">Socket.IO Test Page</Text>
        
        <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
          <Text fontSize="lg" fontWeight="semibold" mb={2}>Client Socket Status:</Text>
          <HStack spacing={4}>
            <Badge colorScheme={isConnected ? "green" : "red"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Text>Last Activity: {lastActivity ? new Date(lastActivity).toLocaleTimeString() : "None"}</Text>
          </HStack>
          {error && (
            <Text color="red.500" mt={2}>Error: {error.message}</Text>
          )}
        </Box>

        <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
          <Text fontSize="lg" fontWeight="semibold" mb={2}>Server Socket Status:</Text>
          {socketStatus ? (
            <VStack align="start" spacing={2}>
              <HStack>
                <Badge colorScheme={socketStatus.ioAvailable ? "green" : "red"}>
                  {socketStatus.ioAvailable ? "Available" : "Not Available"}
                </Badge>
                <Text>Connected Clients: {socketStatus.connectedClients}</Text>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                Timestamp: {socketStatus.timestamp}
              </Text>
            </VStack>
          ) : (
            <Text>Loading...</Text>
          )}
        </Box>

        <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
          <Text fontSize="lg" fontWeight="semibold" mb={2}>Test Notifications:</Text>
          <Button onClick={sendTestNotification} colorScheme="blue" mb={2}>
            Send Test Order Notification
          </Button>
          {testNotification && (
            <Text fontSize="sm" color="gray.600" mt={2}>
              {testNotification}
            </Text>
          )}
        </Box>

        <Box p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
          <Text fontSize="lg" fontWeight="semibold" mb={2}>Debug Information:</Text>
          <Text fontSize="sm" color="gray.600">
            Environment: {process.env.NODE_ENV}
          </Text>
          <Text fontSize="sm" color="gray.600">
            Socket ID: {socket?.id || "Not connected"}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
} 