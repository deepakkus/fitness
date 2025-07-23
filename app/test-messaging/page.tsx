"use client";

import { Box, Button, Text, VStack, HStack, Input, Textarea, Select } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useSocket, useSocketRoom } from '@/app/socket';
import { useSession } from "next-auth/react";
import axios from "axios";

export default function TestMessaging() {
  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();
  const [testOrderId, setTestOrderId] = useState("1");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [receivedEvents, setReceivedEvents] = useState<string[]>([]);
  const [userRole, setUserRole] = useState("user");
  
  // Join the test order room
  const joined = useSocketRoom(`order_${testOrderId}`, 'generic');

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('[TestMessaging] Setting up socket listeners');
    
    const handleOrderMessage = (data: any) => {
      console.log('[TestMessaging] Received order_message:new:', data);
      setReceivedEvents(prev => [...prev, `order_message:new: ${JSON.stringify(data)}`]);
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    socket.on('order_message:new', handleOrderMessage);

    return () => {
      socket.off('order_message:new', handleOrderMessage);
    };
  }, [socket, isConnected]);

  const sendTestMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      console.log('[TestMessaging] Sending test message to order:', testOrderId);
      const res = await axios.post(`/api/order-messages/${testOrderId}`, { 
        message: newMessage 
      });
      console.log('[TestMessaging] Message sent:', res.data);
      setNewMessage("");
    } catch (error) {
      console.error('[TestMessaging] Error sending message:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/order-messages/${testOrderId}`);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error('[TestMessaging] Error fetching messages:', error);
    }
  };

  return (
    <Box p={8} maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">Real-time Messaging Test</Text>
        
        <Box p={4} bg="gray.100" borderRadius="md">
          <Text><strong>Socket Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}</Text>
          <Text><strong>Room Joined:</strong> {joined ? 'Yes' : 'No'}</Text>
          <Text><strong>Current User:</strong> {session?.user?.id}</Text>
          <Text><strong>Test Order ID:</strong> {testOrderId}</Text>
          <Text><strong>User Role:</strong> {userRole}</Text>
        </Box>

        <HStack>
          <Input 
            value={testOrderId} 
            onChange={(e) => setTestOrderId(e.target.value)}
            placeholder="Order ID"
            w="200px"
          />
          <Select value={userRole} onChange={(e) => setUserRole(e.target.value)} w="150px">
            <option value="user">User</option>
            <option value="vendor">Vendor</option>
          </Select>
          <Button onClick={fetchMessages} colorScheme="blue">
            Fetch Messages
          </Button>
        </HStack>

        <Box>
          <Text fontWeight="bold" mb={2}>Send Message:</Text>
          <HStack>
            <Textarea 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              size="sm"
            />
            <Button onClick={sendTestMessage} colorScheme="green">
              Send
            </Button>
          </HStack>
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>Messages ({messages.length}):</Text>
          <Box h="200px" overflowY="auto" bg="gray.50" p={2} borderRadius="md">
            {messages.map((msg, idx) => (
              <Text key={idx} fontSize="sm" mb={1}>
                <strong>{msg.user_name || msg.added_by}:</strong> {msg.message}
              </Text>
            ))}
          </Box>
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>Received Events ({receivedEvents.length}):</Text>
          <Box h="150px" overflowY="auto" bg="gray.50" p={2} borderRadius="md">
            {receivedEvents.map((event, idx) => (
              <Text key={idx} fontSize="xs" fontFamily="mono">
                {event}
              </Text>
            ))}
          </Box>
        </Box>
      </VStack>
    </Box>
  );
} 