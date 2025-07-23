// lib/clients.ts
export type Client = {
  id: number;
  activityId: string;
  writer: WritableStreamDefaultWriter;
};

export const clients: Client[] = [];
