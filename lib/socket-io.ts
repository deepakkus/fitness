let io: any = null;

export const setIO = (ioInstance: any) => {
  io = ioInstance;
};

export const getIO = () => {
  return io;
}; 