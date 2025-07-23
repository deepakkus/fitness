// VendorProducts.tsx
"use client";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Spinner,
  Text,
  Button,
  SimpleGrid,
  Heading,
  Input,
  Textarea,
  Image,
  useToast,
  Avatar,
  Center,
  IconButton,
} from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSocket, useSocketRoom } from '@/app/socket';
import { useSession } from "next-auth/react";
import { TriangleUpIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { AttachmentIcon } from "@chakra-ui/icons";

function getStatusText(status: string) {
  switch (status) {
    case "P": return "Pending";
    case "C": return "Completed";
    default: return status;
  }
}

const BILLING_FIELDS = [
  { label: "Name", key: "first_name" },
  { label: "Address", key: "address" },
  { label: "Email", key: "email" },
  { label: "Phone", key: "phone" },
  { label: "City", key: "city" },
  { label: "State", key: "state" },
  { label: "Pincode", key: "pincode" },
  // Add more fields as needed
];

// Add props typing
interface OrderProductsProps {
  userId?: string;
  activeTabIndex?: number;
  onSelectProductId?: (productId: string) => void;
}

export function OrderProducts({ userId, activeTabIndex, onSelectProductId }: OrderProductsProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const toast = useToast();
  const { socket } = useSocket();
  const joined = useSocketRoom(selectedOrder ? `order_${selectedOrder.id}` : '', 'generic');
  const handlerRef = useRef<any>(null);
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  // Sorted orders
  const sortedOrders = [...orders].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    if (sortBy === 'billing_name') {
      aValue = a.first_name + ' ' + (a.last_name || '');
      bValue = b.first_name + ' ' + (b.last_name || '');
    }
    if (sortBy === 'created_on') {
      aValue = a.created_on ? new Date(a.created_on).getTime() : 0;
      bValue = b.created_on ? new Date(b.created_on).getTime() : 0;
    }
    if (sortBy === 'price') {
      aValue = Number(a.price) || 0;
      bValue = Number(b.price) || 0;
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

  // Debug room joining
  useEffect(() => {
    if (selectedOrder && socket && socket.connected) {
      console.log('[OrderProducts] Manual room join attempt for order:', selectedOrder.id);
      socket.emit('join_room', `order_${selectedOrder.id}`);
    }
  }, [selectedOrder, socket]);

  // Fetch orders on mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("/api/order-details/user");
        setOrders(res.data.data || []);
        // Do NOT auto-select any order; show list by default
        setSelectedOrder(null);
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Fetch messages when selectedOrder changes
  useEffect(() => {
    if (selectedOrder) {
      fetchMessages(selectedOrder.id);
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (!socket || !selectedOrder) return;

    console.log('[OrderProducts] Setting up socket listener for order:', selectedOrder.id);
    console.log('[OrderProducts] Current user ID:', session?.user?.id);
    console.log('[OrderProducts] Socket connected:', socket.connected);

    handlerRef.current = (data: any) => {
      console.log('[OrderProducts] Received order_message:new event:', data);
      const senderId = String(data.message.added_by);
      const currentUserId = String(session?.user?.id);
      
      console.log('[OrderProducts] SOCKET MSG DEBUG', { senderId, currentUserId, message: data.message });
      
      // Only add message if it's NOT from the current user
      if (senderId !== currentUserId) {
        console.log('[OrderProducts] Adding message from other user');
        setMessages((prev) => [...prev, data.message]);
      } else {
        console.log('[OrderProducts] Ignoring message from current user');
      }
    };

    const eventListener = (data: any) => handlerRef.current(data);
    (socket as any).on('order_message:new', eventListener);
    console.log('[OrderProducts] Registered order_message:new listener for order', selectedOrder.id);

    return () => {
      console.log('[OrderProducts] Cleaning up order_message:new listener');
      (socket as any).off('order_message:new', eventListener);
    };
  }, [socket, selectedOrder, session?.user?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Helper to get billing details from nested object or fallback
  function getBillingValue(order: any, key: string, billingDetailsOverride: any = null) {
    if (billingDetailsOverride && billingDetailsOverride[key]) return billingDetailsOverride[key];
    if (order.billing_details && order.billing_details[key]) return order.billing_details[key];
    if (order[`billing_${key}`]) return order[`billing_${key}`];
    return "-";
  }

  // Fetch messages for selected order
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

  // Fetch full order details (with billing) when selected
  async function handleSelectOrder(order: any) {
    setLoading(true);
    try {
      const res = await axios.get(`/api/order-details/${order.id}`);
      setSelectedOrder({
        ...res.data.order,
        billingDetails: res.data.billingDetails,
        vendorDetails: res.data.vendorDetails,
        customerDetails: res.data.customerDetails,
        courseMaterials: res.data.courseMaterials
      });
      if (onSelectProductId && res.data.order && res.data.order.product_id) {
        onSelectProductId(String(res.data.order.product_id));
      }
      await fetchMessages(order.id);
    } catch (err) {
      setSelectedOrder(order);
      if (onSelectProductId && order.product_id) {
        onSelectProductId(String(order.product_id));
      }
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  // Handle status change and save to DB
  async function handleStatusChange(order: any, newStatus: string) {
    setStatusLoading(true);
    try {
      await axios.put(`/api/order-details/${order.id}`, { order_status: newStatus });
      toast({ title: "Order status updated", status: "success", duration: 2000 });
      // Update local state
      if (selectedOrder) setSelectedOrder({ ...selectedOrder, order_status: newStatus });
      setOrders(orders => orders.map(o => o.id === order.id ? { ...o, order_status: newStatus } : o));
    } catch (err) {
      toast({ title: "Failed to update status", status: "error", duration: 2000 });
    } finally {
      setStatusLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  }

  function handleRemoveFile(idx: number) {
    setSelectedFiles(files => {
      const newFiles = files.filter((_, i) => i !== idx);
      if (newFiles.length === 0 && fileInputRef.current) fileInputRef.current.value = "";
      return newFiles;
    });
  }

  // Send a new message
  async function handleSendMessage() {
    if (!newMessage.trim() && selectedFiles.length === 0) return;
    try {
      console.log('[OrderProducts] Sending message with files:', selectedFiles.length);
      
      const formData = new FormData();
      formData.append('message', newMessage);
      selectedFiles.forEach(file => formData.append('files', file));
      const res = await axios.post(`/api/order-messages/${selectedOrder.id}`, formData);
      setNewMessage("");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Append the new message to the state for instant UI update
      if (res.data && res.data.message) {
        setMessages((prev) => [...prev, res.data.message]);
        // Emit socket event for real-time update
        if (socket) {
          socket.emit('order_message:new', { orderId: selectedOrder.id, message: res.data.message });
        }
      }
      console.log('[OrderProducts] Message sent successfully');
    } catch (err) {
      toast({ title: "Failed to send message", status: "error", duration: 2000 });
    }
  }

  // Reset selectedOrder when tab changes
  useEffect(() => {
    setSelectedOrder(null);
  }, [activeTabIndex]);

  if (loading) {
    return <Spinner />;
  }

  // Order Details + Messaging View
  if (selectedOrder) {
    const billing = selectedOrder.billingDetails || selectedOrder.billing_details || null;
    return (
      <Box display="flex" justifyContent="center" w="100%">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} maxW="1100px" w="100%">
          {/* Left: Order Details */}
          <Box
            maxW="480px"
            w="100%"
            p={6}
            borderRadius="lg"
            boxShadow="0 2px 12px rgba(0,0,0,0.07)"
            bg="white"
            border="1px solid #f0f0f0"
          >
            <Button onClick={() => setSelectedOrder(null)} mb={4} size="sm" variant="outline">← Back</Button>
            <Heading size="md" mb={4} color="gray.700">Order Details</Heading>
            <Box mb={4}>
              <Text fontWeight="bold" color="gray.600">Product Details</Text>
              <Box display="flex" alignItems="center" mt={2}>
                <Image
                  src={selectedOrder.product_image || "/placeholder.png"}
                  alt={selectedOrder.product_name}
                  boxSize="80px"
                  borderRadius="8px"
                  mr={4}
                  fallbackSrc="/placeholder.png"
                  border="1px solid #eee"
                  bg="gray.50"
                />
                <Box>
                  <Text fontWeight="bold" fontSize="lg">{selectedOrder.product_name}</Text>
                  <Text color="green.600" fontWeight="bold" fontSize="xl" mt={1}>
                    ${selectedOrder.price}
                  </Text>
                </Box>
              </Box>
            </Box>
            <Box mb={4}>
              <Text fontWeight="bold" color="gray.600" mb={2}>Billing Details</Text>
              <SimpleGrid columns={2} spacingY={1} spacingX={6}>
                <Text color="gray.500">Name:</Text>
                <Text color="gray.800" fontWeight="medium">{billing?.first_name} {billing?.last_name}</Text>
                <Text color="gray.500">Email:</Text>
                <Text color="gray.800">{billing?.email}</Text>
                <Text color="gray.500">Phone:</Text>
                <Text color="gray.800">{billing?.phone}</Text>
                <Text color="gray.500">Address:</Text>
                <Text color="gray.800">{billing?.address}</Text>
                <Text color="gray.500">City:</Text>
                <Text color="gray.800">{billing?.city}</Text>
                <Text color="gray.500">Pincode:</Text>
                <Text color="gray.800">{billing?.pincode || '-'}</Text>
              </SimpleGrid>
            </Box>
            <Box>
              <Text fontWeight="bold" color="gray.600">Order Status</Text>
              {selectedOrder.user_role === "vendor" ? (
                <Select
                  value={selectedOrder.order_status}
                  onChange={e => handleStatusChange(selectedOrder, e.target.value)}
                  isDisabled={statusLoading}
                  mt={2}
                >
                  <option value="P">Pending</option>
                  <option value="C">Completed</option>
                </Select>
              ) : (
                <Text mt={2}>{getStatusText(selectedOrder.order_status)}</Text>
              )}
            </Box>
          </Box>
          {/* Right: Messaging */}
          <Box
            maxW="520px"
            w="100%"
            p={6}
            borderRadius="lg"
            boxShadow="0 2px 12px rgba(0,0,0,0.07)"
            bg="white"
            border="1px solid #f0f0f0"
            display="flex"
            flexDirection="column"
          >
            <Heading size="md" mb={4} color="gray.700">Messages</Heading>
            <Box mb={4} height="300px" overflowY="auto" borderRadius="md" p={2} bg="gray.50" display="flex" flexDirection="column" gap={2}>
              {messagesLoading ? (
                <Spinner />
              ) : messages.length === 0 ? (
                <Text color="gray.400">No messages yet.</Text>
              ) : (
                messages.map((msg, idx) => {
                  let avatarUrl = "/placeholder.png";
                  if (msg.avatar_blob) {
                    avatarUrl = `data:image/png;base64,${Buffer.from(msg.avatar_blob.data).toString('base64')}`;
                  }
                  const currentUserId = session?.user?.id;
                  // Debug log
                  console.log('MSG DEBUG', { msgAddedBy: msg.added_by, sessionUserId: currentUserId, eq: String(msg.added_by) === String(currentUserId) });
                  const isCurrentUser = String(msg.added_by) === String(currentUserId);
                  return (
                    <Box
                      key={msg.id || idx}
                      alignSelf={isCurrentUser ? "flex-end" : "flex-start"}
                      bg={isCurrentUser ? "green.100" : "gray.100"}
                      color={isCurrentUser ? "green.800" : "gray.800"}
                      px={3}
                      py={2}
                      borderRadius={isCurrentUser ? "16px 16px 0 16px" : "16px 16px 16px 0"}
                      maxW="85%"
                      boxShadow="sm"
                      display="flex"
                      alignItems="center"
                      gap={2}
                    >
                      <Avatar
                        size="sm"
                        src={avatarUrl}
                        name={
                          typeof msg.added_by_name === "string" && msg.added_by_name.trim()
                            ? msg.added_by_name
                            : typeof msg.user_name === "string" && msg.user_name.trim()
                            ? msg.user_name
                            : typeof msg.added_by === "string"
                            ? msg.added_by
                            : "User"
                        }
                      />
                      <Box>
                        <Text fontWeight="bold" fontSize="sm" mb={1}>
                          {msg.added_by_name || msg.user_name || msg.added_by || "User"}
                        </Text>
                        <Text fontSize="sm">{msg.message}</Text>
                        {msg.blobs && msg.blobs.length > 0 && (
                          <Box mt={2} display="flex" flexDirection="column" gap={1}>
                            {msg.blobs.map((blob: any) => (
                              <a
                                key={blob.id}
                                href={`/api/order-messages/attachments/${blob.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#3182ce', textDecoration: 'underline', fontSize: '0.95em' }}
                              >
                                {blob.name}
                              </a>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </Box>
            <Box display="flex" gap={2} mt="auto" alignItems="center">
              <Textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                size="sm"
                resize="none"
                minH="40px"
                bg="gray.50"
                borderRadius="md"
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              />
              <input
                type="file"
                accept="application/pdf"
                multiple
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <IconButton
                aria-label="Attach files"
                icon={<AttachmentIcon />}
                onClick={() => fileInputRef.current?.click()}
                variant="ghost"
              />
            </Box>
            {selectedFiles.length > 0 && (
              <Box mt={2} mb={2} p={2} bg="gray.100" borderRadius="md" display="flex" flexDirection="column" gap={1}>
                {selectedFiles.map((file, idx) => (
                  <Box key={idx} display="flex" alignItems="center" gap={2}>
                    <Text fontSize="sm" color="gray.700">{file.name}</Text>
                    <IconButton
                      aria-label="Remove file"
                      icon={<span style={{fontWeight:'bold'}}>&times;</span>}
                      size="xs"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleRemoveFile(idx)}
                    />
                  </Box>
                ))}
              </Box>
            )}
            <Button colorScheme="green" onClick={handleSendMessage}>Send</Button>
          </Box>
        </SimpleGrid>
      </Box>
    );
  }

  // Order List View
  return (
    <Table>
      <Thead>
        <Tr>
          <Th cursor="pointer" onClick={() => handleSort('id')}>
            Order ID{' '}
            {sortBy === 'id' && (sortDirection === 'asc' ? <TriangleUpIcon boxSize={3} /> : <TriangleDownIcon boxSize={3} />)}
          </Th>
          <Th cursor="pointer" onClick={() => handleSort('product_name')}>
            Product{' '}
            {sortBy === 'product_name' && (sortDirection === 'asc' ? <TriangleUpIcon boxSize={3} /> : <TriangleDownIcon boxSize={3} />)}
          </Th>
          <Th cursor="pointer" onClick={() => handleSort('billing_name')}>
            Billing Name{' '}
            {sortBy === 'billing_name' && (sortDirection === 'asc' ? <TriangleUpIcon boxSize={3} /> : <TriangleDownIcon boxSize={3} />)}
          </Th>
          <Th cursor="pointer" onClick={() => handleSort('created_on')}>
            Order Date{' '}
            {sortBy === 'created_on' && (sortDirection === 'asc' ? <TriangleUpIcon boxSize={3} /> : <TriangleDownIcon boxSize={3} />)}
          </Th>
          <Th cursor="pointer" onClick={() => handleSort('price')}>
            Amount{' '}
            {sortBy === 'price' && (sortDirection === 'asc' ? <TriangleUpIcon boxSize={3} /> : <TriangleDownIcon boxSize={3} />)}
          </Th>
          <Th cursor="pointer" onClick={() => handleSort('order_status')}>
            Status{' '}
            {sortBy === 'order_status' && (sortDirection === 'asc' ? <TriangleUpIcon boxSize={3} /> : <TriangleDownIcon boxSize={3} />)}
          </Th>
          <Th>Action</Th>
        </Tr>
      </Thead>
      <Tbody>
        {sortedOrders.map(order => (
          <Tr key={order.id}>
            <Td>{order.id}</Td>
            <Td>{order.product_name}</Td>
            <Td>
              {order.first_name
                ? order.last_name
                  ? `${order.first_name} ${order.last_name}`
                  : order.first_name
                : "-"}
            </Td>
            <Td>{order.created_on ? new Date(order.created_on).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}</Td>
            <Td>{order.price !== undefined ? `$${Number(order.price).toFixed(2)}` : '-'}</Td>
            <Td>{getStatusText(order.order_status)} </Td>
            <Td>
              <Button size="sm" onClick={() => handleSelectOrder(order)}>
                See Details
              </Button>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
