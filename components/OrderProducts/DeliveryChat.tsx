"use client";
import {
  Box,
  Text,
  Heading,
  Spinner,
  Button,
  Textarea,
  Avatar,
  Center,
  IconButton,
  List, 
  ListItem,
  Link
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSocket, useSocketRoom } from '@/app/socket';
import { useSession } from "next-auth/react";
import { AttachmentIcon } from "@chakra-ui/icons";

export default function DeliveryChat({ type = "vendor", initialOrderId }: { type?: "vendor" | "user", initialOrderId?: string | null }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const { socket } = useSocket();
  const joined = useSocketRoom(selectedOrder ? `order_${selectedOrder.id}` : '', 'generic');
  const handlerRef = useRef<any>(null);
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [productDocuments, setProductDocuments] = useState<any[]>([]);
  const [productPDFs, setProductPDFs] = useState<any[]>([]);

  // Fetch delivery orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const url = type === "vendor"
          ? "/api/order-details/user?type=vendor&delivery=1"
          : "/api/order-details/user?delivery=1";
        const res = await axios.get(url);
        setOrders(res.data.data || []);
        // Auto-select order by initialOrderId if present
        if (res.data.data && res.data.data.length > 0) {
          if (initialOrderId) {
            const found = res.data.data.find(o => String(o.id) === String(initialOrderId));
            setSelectedOrder(found || res.data.data[0]);
          } else {
            setSelectedOrder(res.data.data[0]);
          }
          
        }
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [type, initialOrderId]);

  // Fetch messages when selectedOrder changes
  useEffect(() => {
    if (selectedOrder) {
      fetchMessages(selectedOrder.id);
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (selectedOrder) {
      console.log('[Socket] Joining room', `order_${selectedOrder.id}`);
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (!socket || !selectedOrder) return;
    
    console.log('[DeliveryChat] Setting up socket listener for order:', selectedOrder.id);
    console.log('[DeliveryChat] Current user ID:', session?.user?.id);
    console.log('[DeliveryChat] Socket connected:', socket.connected);
    
    handlerRef.current = (data: any) => {
      console.log('[DeliveryChat] Received order_message:new event:', data);
      const senderId = String(data.message.added_by);
      const currentUserId = String(session?.user?.id);
      
      console.log('[DeliveryChat] Sender ID:', senderId, 'Current User ID:', currentUserId);
      
      // Only add message if it's NOT from the current user
      if (senderId !== currentUserId) {
        console.log('[DeliveryChat] Adding message from other user');
        setMessages((prev) => [...prev, data.message]);
      } else {
        console.log('[DeliveryChat] Ignoring message from current user');
      }
    };
    
    const eventListener = (data: any) => handlerRef.current(data);
    (socket as any).on('order_message:new', eventListener);
    
    console.log('[DeliveryChat] Registered order_message:new listener');
    
    return () => {
      console.log('[DeliveryChat] Cleaning up order_message:new listener');
      (socket as any).off('order_message:new', eventListener);
    };
  }, [socket, selectedOrder, session?.user?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function fetchMessages(orderId: number) {
    setMessagesLoading(true);
    try {
      const res = await axios.get(`/api/order-messages/${orderId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  }

  async function handleSendMessage() {
    if (!newMessage.trim() && selectedFiles.length === 0) return;
    try {
      console.log('[DeliveryChat] Sending message with files:', selectedFiles.length);
      
      const formData = new FormData();
      formData.append('message', newMessage);
      selectedFiles.forEach(file => formData.append('files', file));
      const res = await axios.post(`/api/order-messages/${selectedOrder.id}`, formData);
      if (res.data && res.data.message) {
        // Add the message to the state for instant UI update
        setMessages(prev => [...prev, res.data.message]);
        // Emit socket event for real-time update
        if (socket) {
          socket.emit('order_message:new', { orderId: selectedOrder.id, message: res.data.message });
        }
      }
      setNewMessage("");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      console.log('[DeliveryChat] Message sent successfully');
    } catch (error) {
      console.error('[DeliveryChat] Error sending message:', error);
      // You might want to show a toast notification here
    }
  }

  function handleRemoveFile(idx: number) {
    setSelectedFiles(files => {
      const newFiles = files.filter((_, i) => i !== idx);
      if (newFiles.length === 0 && fileInputRef.current) fileInputRef.current.value = "";
      return newFiles;
    });
  }

  // Debug room joining
  useEffect(() => {
    if (selectedOrder && socket && socket.connected) {
      console.log('[DeliveryChat] Manual room join attempt for order:', selectedOrder.id);
      socket.emit('join_room', `order_${selectedOrder.id}`);
    }
  }, [selectedOrder, socket]);

  // Fetch product documents and PDFs when selectedOrder changes
  useEffect(() => {
    async function fetchProductDetails() {
      if (selectedOrder && selectedOrder.product_id) {
        try {
          const res = await axios.get(`/api/products/${selectedOrder.product_id}`);
          const product = res.data?.data?.[0];
          setProductDocuments(product?.documents || []);
          setProductPDFs(product?.pdfs || []);
        } catch (err) {
          setProductDocuments([]);
          setProductPDFs([]);
        }
      } else {
        setProductDocuments([]);
        setProductPDFs([]);
      }
    }
    fetchProductDetails();
  }, [selectedOrder]);

  if (loading) {
    return <Spinner />;
  }
  return (
    <Box display="flex" height="600px" borderRadius="lg" boxShadow="md" bg="white" minH="500px">
      {/* Left: Orders List */}
      <Box width="320px" borderRight="1px solid #eee" overflowY="auto" bg="gray.50">
        {orders.length === 0 ? (
          <Center h="100%" color="gray.400">No deliveries found</Center>
        ) : (
          orders.map((order) => (
            <Box
              key={order.id}
              p={4}
              bg={selectedOrder?.id === order.id ? "green.50" : "white"}
              borderBottom="1px solid #f0f0f0"
              cursor="pointer"
              onClick={() => setSelectedOrder(order)}
              transition="background 0.2s"
            >
              <Text fontWeight="bold">Order# {order.id}</Text>
              <Text fontSize="sm" color="gray.600">Product: {order.product_name}</Text>
            </Box>
          ))
        )}
      </Box>
      {/* Right: Message Window */}
      <Box flex="1" p={6} display="flex" flexDirection="column">
        {/* <Heading size="md" mb={4} color="gray.700">Order Delivery</Heading> */}

        {loading ? (
        <Spinner size="sm" />
      ) : (
        selectedOrder && (
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Product Name: {selectedOrder.product_name}
          </Text>
        )
      )}

     {selectedOrder && selectedOrder.course_materials && selectedOrder.course_materials.length > 0 && (
        <Box mt={2}>
          <Text fontWeight="bold" mb={1}>Course Materials:</Text>
          <ul style={{ marginLeft: 16 }}>
            {selectedOrder.course_materials.map((cm: any, idx: number) => (
              <li key={cm.id || idx}>
                <Link href={cm.name} target="_blank">
                    <Text as="span">{cm.name}</Text>
                </Link>
              </li>
            ))}
          </ul>
        </Box>
      )}
      {productDocuments.length > 0 && (
        <Box mt={2}>
          <Text fontWeight="bold" mb={1}>Product Documents:</Text>
          <ul style={{ marginLeft: 16 }}>
            {productDocuments.map((doc, idx) => (
              <li key={doc.mediaId || idx}>
                <Link href={`/api/products/${selectedOrder.product_id}/media/${doc.mediaId}/document`} target="_blank">
                  <Text as="span">{doc.name}</Text>
                </Link>
              </li>
            ))}
          </ul>
        </Box>
      )}
      {/* Course Materials PDFs */}
      {productPDFs.length > 0 && (
        <Box mt={2}>
          <Text fontWeight="bold" mb={1}>Course Materials PDFs:</Text>
          <ul style={{ marginLeft: 16 }}>
            {productPDFs.map((pdf: any, idx: number) => (
              <li key={pdf.mediaId || idx}>
                <Link href={`/api/products/${selectedOrder.product_id}/media/${pdf.mediaId}/pdf`} target="_blank">
                  <Text as="span">{pdf.name.split('/').pop()}</Text>
                </Link>
              </li>
            ))}
          </ul>
        </Box>
      )}
      </Box>
    </Box>
  );
} 