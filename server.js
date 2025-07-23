const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");
const { setIO } = require('./lib/socket-io');
const apiLogger = require('./apiLogger');
require('dotenv').config();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.APP_PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

app.prepare().then(() => {

  const server = createServer(async (req, res) => {
    // Only use apiLogger in production
    if (!dev) {
      apiLogger(req, res, () => {});
    }
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(server, {
    path: "/api/socket",
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Make io available to API routes
  setIO(io);

  // Track active users (optional, for debugging)
  const activeUsers = {};

  io.on("connection", (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Authenticate user if token is provided
    if (socket.handshake.auth && socket.handshake.auth.token && socket.handshake.auth.token.user) {
      socket.userId = socket.handshake.auth.token.user.id;
      // console.log(`[Socket] Authenticated user: ${socket.userId}`);
    }

    socket.on("join_personal_room", async (userRoom) => {
      const userId = userRoom.split("_")[1];
      socket.join(userRoom);
      // console.log(`[Socket] Joined personal room: ${userRoom}`);
      
      // Store the user ID on the socket for future use
      socket.userId = userId;

      // ALLOW MULTIPLE TABS PER USER (for development/testing)
      // Commented out to prevent disconnecting previous sockets for the same user
      // if (activeUsers[userId] && activeUsers[userId] !== socket.id) {
      //   const otherSocket = io.sockets.sockets.get(activeUsers[userId]);
      //   if (otherSocket) {
      //     otherSocket.disconnect(true);
      //   }
      // }
      // activeUsers[userId] = socket.id;

      try {
        const activities = await prisma.activity_members.findMany({
          where: { user_id: BigInt(userId) },
          select: { activity_id: true }
        });
        activities.forEach(({ activity_id }) => {
          const activityRoom = `activity_${activity_id}`;
          socket.join(activityRoom);
          // console.log(`[Socket] Joined activity room: ${activityRoom}`);
        });
      } catch (error) {
        console.error(`[Socket] Error joining activity rooms: ${error}`);
      }
    });

    socket.on("join_room", (room) => {
      socket.join(room);
      console.log(`[Socket] Joined room: ${room} for socket ${socket.id}`);
    });

    socket.on("join_activity_room", (activityId) => {
      const activityRoom = `activity_${activityId}`;
      socket.join(activityRoom);
      // console.log(`[Socket] Joined activity room: ${activityRoom}`);
    });

    socket.on("user_action", async ({ userId, activityId, actionType, notificationId }) => {
      // console.log(`[Socket] User action: ${userId} performed ${actionType} on activity ${activityId}`);
      
      try {
        // Ensure we have a userId (either from the event or from socket)
        const actualUserId = userId || socket.userId;
        if (!actualUserId) {
          console.error(`[Socket] Missing user ID for action ${actionType}`);
          return;
        }
        
        const activityRoom = `activity_${activityId}`;
        
        // Emit to user rooms
        // This only emits real-time updates, notification creation is now handled in the APIs
        if (notificationId) {
          // If a notification ID is provided (from API), include it in the event
          io.to(`user_${actualUserId}`).emit("activity_notification", { 
            userId: actualUserId, 
            activityId, 
            actionType, 
            timestamp: Date.now(),
            notificationId: notificationId
          });
        }
    
        // Also emit to the activity room to update all connected members
        socket.to(activityRoom).emit("activity_notification", { 
          userId: actualUserId, 
          activityId, 
          actionType, 
          timestamp: Date.now() 
        });
      } catch (error) {
        console.error(`[Socket] Error in user_action handler: ${error}`);
      }
    });

    socket.on("send_message", async ({ messageId, activityId, message, notificationId }) => {
      if (!socket.userId) {
        console.error(`[Socket] Missing user ID for send_message`);
        return;
      }
          
      // console.log(`[Socket] User ${socket.userId} sent message in activity ${activityId}`);
          
      try {
        const activityRoom = `activity_${activityId}`;
              
        // Emit message ID to the room for real-time updates
        // IMPORTANT: We're explicitly including the activityId for message context
        io.to(activityRoom).emit("new_message_id", { 
          messageId,
          activityId,  // Make sure activityId is included
          timestamp: Date.now() 
        });
        
        // If notification ID is provided, emit notification events to relevant user rooms
        // Notification creation is now handled in the message API
        if (notificationId) {
          // Get activity members to notify about the new message
          const activityMembers = await prisma.activity_members.findMany({
            where: { 
              activity_id: BigInt(activityId),
              user_id: { not: BigInt(socket.userId) } 
            },
            select: { user_id: true }
          });
          
          // Emit to each member's personal room
          for (const member of activityMembers) {
            io.to(`user_${member.user_id}`).emit("activity_notification", { 
              userId: socket.userId, 
              activityId, 
              actionType: "message", 
              timestamp: Date.now(),
              notificationId: notificationId
            });
          }
        }
      } catch (error) {
        console.error(`[Socket] Error in send_message handler:`, error);
      }
    });

    // Real-time order message relay
    socket.on('order_message:new', ({ orderId, message }) => {
      const room = `order_${orderId}`;
      console.log(`[Socket] Received order_message:new for order ${orderId}, relaying to room ${room}`);
      // Relay the message to all sockets in the room except the sender
      socket.to(room).emit('order_message:new', { orderId, message });
      // Optionally, also emit to the sender for confirmation (uncomment if needed)
      // socket.emit('order_message:new', { orderId, message });
      console.log(`[Socket] Relayed order_message:new to room ${room}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`[Socket] Disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  server.listen(process.env.APP_PORT || 3000, () => {
    console.log(`Server started on port ${process.env.APP_PORT || 3000}`);
  });
});