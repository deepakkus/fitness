// app/api/logs/route.js
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Tell Next.js this is a dynamic route that shouldn't be statically optimized
export const dynamic = 'force-dynamic';

/**
 * Helper to get the absolute path to the log file
 * Centralized to avoid duplication and ensure consistency
 */
const getLogPath = () => path.join(process.cwd(), 'logs', 'app.log');

/**
 * API route handler for retrieving application logs
 * Uses server-side operations to securely read the log file
 */
export async function GET(request) {
  try {
    // Determine if we should fetch only the latest N lines (from query param)
    const { searchParams } = new URL(request.url);
    const tailSize = searchParams.get('lines') ? parseInt(searchParams.get('lines')) : null;
    
    // Get absolute path to log file
    const logPath = getLogPath();
    
    // Check if file exists
    try {
      await fs.access(logPath);
    } catch (error) {
      return NextResponse.json(
        { error: `Log file not found ${error}`, details: 'The log file does not exist or is not accessible' },
        { status: 404 }
      );
    }
    
    // Read log file
    const logContent = await fs.readFile(logPath, 'utf-8');
    
    // If tail parameter is specified, return only the last n lines
    if (tailSize) {
      const lines = logContent.split('\n');
      const tailLines = lines.slice(Math.max(lines.length - tailSize, 0));
      return NextResponse.json({ content: tailLines.join('\n') });
    }
    
    return NextResponse.json({ content: logContent });
  } catch (error) {
    console.error('Error reading log file:', error);
    return NextResponse.json(
      { error: 'Failed to read logs', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * API route handler for clearing log file
 * Uses a DELETE HTTP method for semantic clarity
 */
export async function DELETE() {
  try {
    const logPath = getLogPath();
    
    // Check if log file exists before attempting to clear
    try {
      await fs.access(logPath);
    } catch (error) {
      return NextResponse.json(
        { error: `Log file not found ${error}`, details: 'The log file does not exist or is not accessible' },
        { status: 404 }
      );
    }
    
    // Clear the log file by writing an empty string
    // This preserves file permissions and handles edge cases better than unlinking and recreating
    await fs.writeFile(logPath, '', 'utf-8');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Log file successfully cleared',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing log file:', error);
    return NextResponse.json(
      { error: 'Failed to clear logs', details: error.message },
      { status: 500 }
    );
  }
}