// app/socket.tsx
"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { Socket, io } from "socket.io-client";
import { useSession } from "next-auth/react";
import axios from "axios";

// Type Definitions
interface ServerToClientEvents {
  online_user_count: (data: { key: string; count: number }) => void;
  activity_notification: (data: { userId: string; activityId: string; actionType: string; timestamp: number; notificationId?: string }) => void;
  new_message_id: (data: { messageId: string; timestamp: number }) => void;
  new_notification: (data: { notificationId: string; type: string; title: string; message: string; orderId?: string; timestamp: number }) => void;
}

interface ClientToServerEvents {
  join_personal_room: (userRoom: string) => void;
  join_room: (room: string) => void;
  join_activity_room: (activityId: string) => void;
  user_action: (data: { userId: string; activityId: string; actionType: string }) => void;
  send_message: (data: { messageId: string; activityId: string; message?: string }) => void;
}

interface NotificationCounts {
  message: number;
  comment: number;
  like: number;
  activity_join: number;
  order: number;
  total: number;
  lastViewed?: number;
}

type MySocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface SocketContextValue {
  socket: MySocket | null;
  isConnected: boolean;
  error: Error | null;
  lastActivity: number;
  unreadCounts: NotificationCounts;
  fetchUnreadCounts: () => Promise<void>;
}

const initialUnreadCounts: NotificationCounts = {
  message: 0,
  comment: 0,
  like: 0,
  activity_join: 0,
  order: 0,
  total: 0
};

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  error: null,
  lastActivity: 0,
  unreadCounts: initialUnreadCounts,
  fetchUnreadCounts: async () => {}
});

// Get the base URL based on the environment
const getBaseUrl = () => {
  const isServer = typeof window === 'undefined';
  if (isServer) return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return window.location.origin;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const socketRef = useRef<MySocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastActivity, setLastActivity] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState<NotificationCounts>(initialUnreadCounts);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectTimersRef = useRef<NodeJS.Timeout[]>([]);
  const [processedNotificationIds, setProcessedNotificationIds] = useState<Set<string>>(new Set());
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  // Fetch unread notification counts - stable callback
  const fetchUnreadCounts = useCallback(async () => {
    // Prevent too frequent fetching (at least 2 seconds between calls)
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 2000) {
      return;
    }
    
    // Don't fetch if session isn't available
    if (!session?.user?.id) return;
    
    // Update last fetch time
    lastFetchTimeRef.current = now;
    
    try {
      const response = await axios.get("/api/notifications/unread-count", { 
        withCredentials: true 
      });
      
      if (response.data) {
        setUnreadCounts(response.data);
      }
    } catch (error) {
      console.error("[Socket] Error fetching unread counts:", error);
    }
  }, [session?.user?.id]); // Only depend on session ID, not the entire session object

  // Cleanup function to clear all timers
  const clearReconnectTimers = useCallback(() => {
    reconnectTimersRef.current.forEach(timer => clearTimeout(timer));
    reconnectTimersRef.current = [];
    
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
  }, []);

  // Handle reconnection with exponential backoff
  const handleReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      // console.log("[Socket] Max reconnect attempts reached");
      return;
    }

    reconnectAttemptsRef.current += 1;
    const delay = Math.min(1000 * (2 ** reconnectAttemptsRef.current), 30000);
    
    // console.log(`[Socket] Attempting reconnect ${reconnectAttemptsRef.current} of ${maxReconnectAttempts} in ${delay}ms`);
    
    const timerId = setTimeout(() => {
      // console.log("[Socket] Executing reconnect attempt");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      createSocketConnection();
    }, delay);
    
    reconnectTimersRef.current.push(timerId);
  }, []);

  // Create socket connection
  const createSocketConnection = useCallback(() => {
    if (socketRef.current) return;

    try {
      const baseUrl = getBaseUrl();
      // console.log(`[Socket] Creating connection to ${baseUrl}`);

      // Create new socket connection with optimized settings
      const newSocket = io(baseUrl, {
        path: "/api/socket",
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        forceNew: reconnectAttemptsRef.current > 0,
        auth: session?.user ? { token: session.user } : undefined,
      });

      socketRef.current = newSocket;

      // Socket event handlers
      newSocket.on("connect", () => {
        console.log('[Socket] Connected successfully:', newSocket.id);
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        clearReconnectTimers();
        // Initial fetch of unread counts
        fetchUnreadCounts();
      });

      newSocket.on("disconnect", (reason) => {
        console.log(`[Socket] Disconnected: id=${newSocket.id}, reason=${reason}`);
        setIsConnected(false);
        // Don't attempt to reconnect if the session is no longer valid
        if (status !== "authenticated") {
          console.log("[Socket] Not attempting reconnect - unauthenticated");
          return;
        }
        // Handle reconnection for certain disconnect reasons
        if (reason === "io server disconnect" || reason === "transport close") {
          console.log('[Socket] Attempting to reconnect...');
          handleReconnect();
        }
      });

      newSocket.on("connect_error", (err) => {
        console.error(`[Socket] Connection error: ${err.message}`);
        setError(err);
        setIsConnected(false);
        console.log('[Socket] Attempting to reconnect after error...');
        handleReconnect();
      });

      // Handle incoming notifications
      newSocket.on("activity_notification", (data) => {
        // console.log('[Socket] Received notification:', data);
        const { actionType, notificationId } = data || {};
        
        // Ignore dislike actions
        if (actionType === "dislike") {
          return;
        }
        
        // Check if we've already processed this notification
        if (notificationId && processedNotificationIds.has(notificationId)) {
          return;
        }
        
        // Add to processed IDs to prevent duplicates if notificationId exists
        if (notificationId) {
          setProcessedNotificationIds(prev => {
            const newSet = new Set(prev);
            newSet.add(notificationId);
            return newSet;
          });
        }
        
        // Update last activity timestamp
        setLastActivity(Date.now());
        
        // Debounce the fetch of updated unread counts
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        
        fetchTimeoutRef.current = setTimeout(() => {
          fetchUnreadCounts();
          fetchTimeoutRef.current = null;
        }, 1000);
      });

      // Handle new order notifications
      newSocket.on("new_notification", (data) => {
        console.log('[Socket] Received new notification:', data);
        const { notificationId, type, title, message } = data || {};
        
        // Check if we've already processed this notification
        if (notificationId && processedNotificationIds.has(notificationId)) {
          return;
        }
        
        // Add to processed IDs to prevent duplicates
        if (notificationId) {
          setProcessedNotificationIds(prev => {
            const newSet = new Set(prev);
            newSet.add(notificationId);
            return newSet;
          });
        }
        
        // Update last activity timestamp
        setLastActivity(Date.now());
        
        // Debounce the fetch of updated unread counts
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        
        fetchTimeoutRef.current = setTimeout(() => {
          fetchUnreadCounts();
          fetchTimeoutRef.current = null;
        }, 1000);
      });

      newSocket.on("new_message_id", (_data) => {
        // console.log('[Socket] New message:', data);
        setLastActivity(Date.now());
      });

      return () => {
        if (newSocket) {
          // console.log('[Socket] Cleaning up socket');
          newSocket.disconnect();
        }
      };
    } catch (err) {
      console.error("[Socket] Error creating socket:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [session, fetchUnreadCounts, clearReconnectTimers, handleReconnect, status]);

  // Initialize socket when session is authenticated
  useEffect(() => {
    // console.log("[Socket] Session status:", status);
    
    if (status === "loading") return;

    if (status === "authenticated" && session) {
      if (!socketRef.current) {
        createSocketConnection();
      }
    } else if (socketRef.current) {
      // Clean up if session is no longer authenticated
      // console.log("[Socket] Session not authenticated, disconnecting socket");
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }

    // Cleanup function
    return () => {
      clearReconnectTimers();
      if (socketRef.current) {
        // console.log("[Socket] Cleaning up socket connection");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [session, status, createSocketConnection, clearReconnectTimers]);

  // Effect to join personal room when session and socket are available
  useEffect(() => {
    if (socketRef.current && session?.user?.id) {
      const userRoom = `user_${session.user.id}`;
      // console.log(`[Socket] Joining personal room: ${userRoom}`);
      socketRef.current.emit("join_personal_room", userRoom);
    }
  }, [session?.user?.id, isConnected]);

  // Set up periodic fetch for unread counts
  useEffect(() => {
    // Only set interval if connected
    if (isConnected && session?.user?.id) {
      const intervalId = setInterval(() => {
        fetchUnreadCounts();
      }, 60000); // Every minute
      
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isConnected, session?.user?.id, fetchUnreadCounts]);

  // Create a memoized context value
  const contextValue: SocketContextValue = {
    socket: socketRef.current,
    isConnected,
    error,
    lastActivity,
    unreadCounts,
    fetchUnreadCounts
  };

  return <SocketContext.Provider value={contextValue}>{children}</SocketContext.Provider>;
};

// Enhanced hook that provides socket status information
export const useSocket = () => {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  
  return context;
};

// Utility hook for joining rooms
export const useSocketRoom = (roomId: string, roomType: 'personal' | 'activity' | 'generic' = 'generic') => {
  const { socket, isConnected } = useSocket();
  const [joined, setJoined] = useState(false);
  
  useEffect(() => {
    if (!socket || !isConnected || !roomId) {
      console.log(`[useSocketRoom] Cannot join room: socket=${!!socket}, isConnected=${isConnected}, roomId=${roomId}`);
      return;
    }
    
    console.log(`[useSocketRoom] Attempting to join ${roomType} room: ${roomId}`);
    
    const joinRoom = () => {
      try {
        if (roomType === 'personal') {
          socket.emit('join_personal_room', roomId);
        } else if (roomType === 'activity') {
          socket.emit('join_activity_room', roomId);
        } else {
          socket.emit('join_room', roomId);
        }
        setJoined(true);
        console.log(`[useSocketRoom] Successfully joined ${roomType} room: ${roomId}`);
      } catch (error) {
        console.error(`[useSocketRoom] Error joining ${roomType} room ${roomId}:`, error);
      }
    };
    
    joinRoom();
    
    // Re-join if socket reconnects
    socket.on('connect', joinRoom);
    
    return () => {
      socket.off('connect', joinRoom);
    };
  }, [socket, isConnected, roomId, roomType]);
  
  return joined;
};