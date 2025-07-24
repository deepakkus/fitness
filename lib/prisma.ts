// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

if (process.env.DISABLE_DB !== "true") {
  const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
  };

  prisma = globalForPrisma.prisma ?? new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
} else {
  // Create a dummy proxy that throws when accessed
  const handler = {
    get() {
      throw new Error(
        " DISABLE_DB is true — attempted to use Prisma client when DB is disabled"
      );
    },
  };

  prisma = new Proxy({}, handler) as any as PrismaClient;
}

//  Ensure default export works everywhere
export default prisma;
