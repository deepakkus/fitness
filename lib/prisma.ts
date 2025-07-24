import { PrismaClient } from "@prisma/client";
//import { PrismaClient } from "@/prisma/prisma-client";
// eslint-disable-next-line @typescript-eslint/no-redeclare
// interface BigInt {
//   /** Convert to BigInt to string form in JSON.stringify */
//   toJSON: () => string;
// }

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices


if (process.env.DISABLE_DB !== "true"){
	const globalForPrisma = global as unknown as { prisma: PrismaClient };
	export const prisma = globalForPrisma.prisma || new PrismaClient();

	if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

export default prisma;