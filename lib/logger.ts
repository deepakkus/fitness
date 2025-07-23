// lib/logger.ts
import pino from 'pino';
import { join } from 'path';
import fs from 'fs';

const isProduction = (process.env.NODE_ENV || '').trim() === 'production';

if (isProduction) {
  const logDir = join(process.cwd(), 'logs');
  fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = join(process.cwd(), 'logs', 'app.log');

const logger = pino(
  {
    level: isProduction ? 'info' : 'debug',
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
    base: {
      pid: process.pid,
      hostname: undefined,
    },
  },
  isProduction ? pino.destination(logFilePath) : undefined
);

export default logger;