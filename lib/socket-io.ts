let io: any = null;

export const setIO = (ioInstance: any) => {
  io = ioInstance;
  console.log('[SocketIO] IO instance set successfully');
};

export const getIO = () => {
  if (!io) {
    console.log('[SocketIO] Warning: IO instance not available');
  }
  return io;
};

// Helper function to safely emit socket events
export const safeEmit = (event: string, data: any, room?: string) => {
  try {
    const ioInstance = getIO();
    if (!ioInstance) {
      console.log(`[SocketIO] Cannot emit ${event}: IO not available`);
      return false;
    }

    if (room) {
      ioInstance.to(room).emit(event, data);
      console.log(`[SocketIO] Emitted ${event} to room ${room}`);
    } else {
      ioInstance.emit(event, data);
      console.log(`[SocketIO] Emitted ${event} globally`);
    }
    return true;
  } catch (error) {
    console.error(`[SocketIO] Error emitting ${event}:`, error);
    return false;
  }
}; 