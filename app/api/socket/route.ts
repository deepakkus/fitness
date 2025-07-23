
// import { Server, Socket } from 'socket.io';
// import { NextRequest, NextResponse } from 'next/server';
// import mysql, { RowDataPacket } from 'mysql2/promise';
// import { headers } from 'next/headers';
// import { createServer, Server as HTTPServer } from 'http';

// // Type Definitions
// interface ServerToClientEvents {
//   online_user_count: (data: { key: string; count: number }) => void;
//   activity_notification: (data: { userId: string; activityId: string; actionType: string }) => void;
//   new_message_id: (data: { messageId: string }) => void;
// }

// interface ClientToServerEvents {
//   join_personal_room: (userRoom: string) => void;
//   join_room: (room: string) => void;
//   join_activity_room: (activityId: string) => void;
//   user_action: (data: { userId: string; activityId: string; actionType: string }) => void;
//   send_message: (data: { messageId: string; activityId: string }) => void;
// }

// interface InterServerEvents {
//   ping: () => void;
// }

// interface SocketData {
//   name: string;
//   age: number;
// }

// // Database Setup
// const dbConfig = {
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
//   user: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// };
// const db = mysql.createPool(dbConfig);

// // Active User and Room Tracking
// const activeUsers: Record<string, string> = {};
// const onlineUsersInRoom: Record<string, number> = {};

// function updateAndEmitOnlineCount(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, activityRoom: string) {
//   const onlineCount = onlineUsersInRoom[activityRoom] || 0;
//   io.to(activityRoom).emit("online_user_count", { key: "onlineCount", count: onlineCount });
// }

// // Main Connection Handler
// function onConnection(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
//     // console.log(`[Socket API] New connection: ${socket.id}`);

//     socket.on("join_personal_room", async (userRoom) => {
//         const userId = userRoom.split("_")[1];

//         if (activeUsers[userId] && activeUsers[userId] !== socket.id) {
//             const otherSocket = io.sockets.sockets.get(activeUsers[userId]);
//             if (otherSocket) {
//                 otherSocket.disconnect(true);
//             }
//         }

//         activeUsers[userId] = socket.id;
//         socket.join(userRoom);

//         try {
//             const [activities] = await db.execute<RowDataPacket[]>(
//                 "SELECT activity_id FROM activity_members WHERE user_id = ?", 
//                 [BigInt(userId)]
//             );

//             activities.forEach(({ activity_id }) => {
//                 const activityRoom = `activity_${activity_id}`;
//                 socket.join(activityRoom);
//                 onlineUsersInRoom[activityRoom] = (onlineUsersInRoom[activityRoom] || 0) + 1;
//                 updateAndEmitOnlineCount(io, activityRoom);
//             });
//         } catch (error) {
//             console.error(`[Socket API] Error joining activity rooms: ${error}`);
//         }
//     });

//     socket.on("join_room", (room) => {
//         socket.join(room);
//     });

//     socket.on("join_activity_room", (activityId) => {
//         const activityRoom = `activity_${activityId}`;
//         socket.join(activityRoom);
//         onlineUsersInRoom[activityRoom] = (onlineUsersInRoom[activityRoom] || 0) + 1;
//         updateAndEmitOnlineCount(io, activityRoom);
//     });

//     socket.on("user_action", ({ userId, activityId, actionType }) => {
//         const activityRoom = `activity_${activityId}`;
//         io.to(activityRoom).emit("activity_notification", { userId, activityId, actionType });
//     });

//     socket.on("send_message", ({ messageId, activityId }) => {
//         const activityRoom = `activity_${activityId}`;
//         io.to(activityRoom).emit("new_message_id", { messageId });
//     });

//     socket.on("disconnect", async (reason) => {
//         const userId = Object.keys(activeUsers).find((key) => activeUsers[key] === socket.id);
//         if (userId) {
//             delete activeUsers[userId];

//             try {
//                 const [activities] = await db.execute<RowDataPacket[]>(
//                     "SELECT activity_id FROM activity_members WHERE user_id = ?", 
//                     [BigInt(userId)]
//                 );

//                 activities.forEach(({ activity_id }) => {
//                     const activityRoom = `activity_${activity_id}`;
//                     if (onlineUsersInRoom[activityRoom]) {
//                         onlineUsersInRoom[activityRoom] -= 1;
//                         if (onlineUsersInRoom[activityRoom] <= 0) {
//                             delete onlineUsersInRoom[activityRoom];
//                         }
//                     }
//                     updateAndEmitOnlineCount(io, activityRoom);
//                 });
//             } catch (error) {
//                 console.error(`[Socket API] Error updating online count: ${error}`);
//             }
//         }
//     });
// }

// // Server Initialization (Singleton Pattern)
// let ioInstance: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
// let initPromise: Promise<void> | null = null;
// const httpServer = createServer();

// async function initSocketIO(): Promise<Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>> {
//     if (!ioInstance) {
//         ioInstance = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
//             path: "/api/socket",
//             addTrailingSlash: false,
//             cors: {
//                 origin: [process.env.NEXT_PUBLIC_BASE_URL],
//                 methods: ["GET", "POST"],
//             },
//         });
//         ioInstance.on('connection', (socket) => onConnection(ioInstance, socket));

//         initPromise = new Promise<void>((resolve) => {
//             httpServer.listen(3000, () => {
//                 console.log('[Socket API] Server listening on port 3000');
//                 resolve();
//             });
//         });
//     }
//     return ioInstance;
// }

// export async function GET(req: NextRequest) {
//     const headersList = headers();
//     const referer = headersList.get('referer');
//     if (!referer) {
//         return new NextResponse('Bad Request: Referer header missing', { status: 400 });
//     }
    
//     try {
//         new URL(referer);
//     } catch (error) {
//         return new NextResponse('Bad Request: Invalid referer', { status: 400 });
//     }

//     await initSocketIO();
    
//     if (initPromise) {
//         await initPromise;
//     }

//     return new NextResponse(null, { status: 200 });
// }



import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'Socket server is handled by server.js' }, { status: 200 });
}