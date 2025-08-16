// lib/logger.ts
import pino from "pino";
import { join } from "path";
import fs from "fs";

const isProduction = (process.env.NODE_ENV || "").trim() === "production";
const isVercel = !!process.env.VERCEL;

let destination: pino.DestinationStream | undefined = undefined;

if (!isVercel) {
  // ✅ Local only: write logs to file
  const logDir = join(process.cwd(), "logs");
  fs.mkdirSync(logDir, { recursive: true });

  const logFilePath = join(logDir, "app.log");
  destination = pino.destination(logFilePath);
}

// ✅ On Vercel → logs go to stdout/stderr
const logger = pino(
  {
    level: isProduction ? "info" : "debug",
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
    base: {
      pid: process.pid,
      hostname: undefined,
    },
  },
  destination
);

export default logger;
