"use client";

import { Box, Button, Text, VStack, HStack, Input, Textarea } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useSocket, useSocketRoom } from '@/app/socket';
import { useSession } from "next-auth/react";
import axios from "axios";

export default function TestSocket() {
  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();
  const [testOrderId, setTestOrderId] = useState("1");
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [receivedEvents, setReceivedEvents] = useState<string[]>([]);
  
  // Join the test order room
  const joined = useSocketRoom(`order_${testOrderId}`, 'generic');

  useEffect(() => {
    if (!socket || !isConnected) return;

    console.log('[TestSocket] Setting up socket listeners');
    
    const handleOrderMessage = (data: any) => {
      console.log('[TestSocket] Received order_message:new:', data);
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
      console.log('[TestSocket] Sending test message to order:', testOrderId);
      const res = await axios.post(`/api/order-messages/${testOrderId}`, { 
        message: newMessage 
      });
      console.log('[TestSocket] Message sent:', res.data);
      setNewMessage("");
    } catch (error) {
      console.error('[TestSocket] Error sending message:', error);
    }
  };

  const emitTestEvent = () => {
    if (!socket) return;
    console.log('[TestSocket] Emitting test event to room:', `order_${testOrderId}`);
    socket.emit('order_message:new', { 
      orderId: testOrderId, 
      message: { 
        id: Date.now(), 
        message: 'Test message from frontend', 
        added_by: session?.user?.id,
        created_at: new Date()
      } 
    });
  };

  return (
    <Box p={8} maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Text fontSize="2xl" fontWeight="bold">Socket Test Page</Text>
        
        <Box p={4} bg="gray.100" borderRadius="md">
          <Text><strong>Socket Status:</strong> {isConnected ? 'Connected' : 'Disconnected'}</Text>
          <Text><strong>Room Joined:</strong> {joined ? 'Yes' : 'No'}</Text>
          <Text><strong>Current User:</strong> {session?.user?.id}</Text>
          <Text><strong>Test Order ID:</strong> {testOrderId}</Text>
        </Box>

        <HStack>
          <Input 
            value={testOrderId} 
            onChange={(e) => setTestOrderId(e.target.value)}
            placeholder="Order ID"
            w="200px"
          />
          <Button onClick={emitTestEvent} colorScheme="blue">
            Emit Test Event
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
          <Text fontWeight="bold" mb={2}>Received Events:</Text>
          <Box h="200px" overflowY="auto" bg="gray.50" p={2} borderRadius="md">
            {receivedEvents.map((event, idx) => (
              <Text key={idx} fontSize="sm" fontFamily="mono">
                {event}
              </Text>
            ))}
          </Box>
        </Box>

        <Box>
          <Text fontWeight="bold" mb={2}>Messages:</Text>
          <Box h="200px" overflowY="auto" bg="gray.50" p={2} borderRadius="md">
            {messages.map((msg, idx) => (
              <Text key={idx} fontSize="sm">
                {msg.message} (by: {msg.added_by})
              </Text>
            ))}
          </Box>
        </Box>
      </VStack>
    </Box>
  );
} 