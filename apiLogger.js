// apiLogger.js
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');

// Match the same logger configuration from lib/logger.ts
const isProduction = (process.env.NODE_ENV || '').trim() === 'production';

// Create logs directory if it doesn't exist in production
if (isProduction) {
  const logDir = path.join(process.cwd(), 'logs');
  fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = path.join(process.cwd(), 'logs', 'app.log');

// Create a logger with the same configuration as lib/logger.ts
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
  isProduction ? pino.destination(logFilePath) : pino.destination({ sync: false }) // Use non-blocking in dev
);

function apiLogger(req, res, next) {
  // Only log API calls
  if (!req.url.startsWith('/api/')) {
    return next();
  }

  const startTime = Date.now();
  const logData = {
    type: 'API_CALL',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  };
  
  // Add query parameters if they exist
  try {
    const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    if (urlObj.searchParams.toString()) {
      logData.params = Object.fromEntries(urlObj.searchParams);
    }
  } catch (e) {
    // Fallback if URL parsing fails
    logData.params = req.query || null;
  }

  // Capture the original response end method
  const originalEnd = res.end;
  
  // Override the end method to log response info
  res.end = function(chunk, encoding, callback) {
    // Add response info to log data
    logData.statusCode = res.statusCode;
    logData.responseTime = Date.now() - startTime;
    
    // Log the API call using the Pino logger (to the log file only)
    logger.info(logData);
    
    // Call the original end method
    return originalEnd.apply(res, arguments);
  };

  // For POST/PUT/PATCH requests, handle body WITHOUT consuming the stream
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && !req.bodyParsed) {
    // Mark that we're handling the body to avoid duplicate processing
    req.bodyParsed = true;
    
    // Only for specific content types that have bodies
    if (req.headers['content-type']) {
      const rawBodyChunks = [];
      let rawBody;
      
      // Save the original listeners
      const originalDataListeners = req.listeners('data');
      const originalEndListeners = req.listeners('end');
      
      // Remove existing listeners temporarily
      req.removeAllListeners('data');
      req.removeAllListeners('end');
      
      // Add our listeners to capture body
      req.on('data', (chunk) => {
        rawBodyChunks.push(chunk);
      });
      
      req.on('end', () => {
        // Combine chunks into a buffer
        rawBody = Buffer.concat(rawBodyChunks);
        
        // Parse the body based on content type (only for common types)
        if (req.headers['content-type'].includes('application/json')) {
          try {
            logData.body = JSON.parse(rawBody.toString());
          } catch (e) {
            logData.body = rawBody.toString();
          }
        } else if (req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
          // Handle form data
          const params = new URLSearchParams(rawBody.toString());
          logData.body = Object.fromEntries(params);
        } else {
          // For other types, store as string
          logData.body = rawBody.toString();
        }
        
        // Create a new readable stream from our captured body
        const newStream = new Readable();
        newStream._read = () => {}; // Required function
        newStream.push(rawBody);
        newStream.push(null); // Signal the end of the stream
        
        // Restore original data listeners with our new stream
        originalDataListeners.forEach((listener) => {
          newStream.on('data', listener);
        });
        
        // Restore original end listeners
        originalEndListeners.forEach((listener) => {
          newStream.on('end', listener);
        });
        
        // Emit the data and end events to trigger the original listeners
        if (rawBodyChunks.length > 0) {
          newStream.emit('data', rawBody);
        }
        newStream.emit('end');
      });
    }
  }

  // Continue processing the request
  next();
}

module.exports = apiLogger;