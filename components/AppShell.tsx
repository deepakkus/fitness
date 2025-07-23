"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Minimum time between vote processing calls
const THROTTLE_MS = 10000; // 10 seconds

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lastProcessTimeRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    const processVotes = async () => {
      // Check if we should throttle this call
      const now = Date.now();
      if (isProcessingRef.current || now - lastProcessTimeRef.current < THROTTLE_MS) {
        return;
      }
      isProcessingRef.current = true;
      try {
        // Add unique cache-busting parameter
        const cacheBuster = `t=${Date.now()}`;
        const response = await fetch(`/cron/process-votes?${cacheBuster}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Request-Time': now.toString()
          },
          signal: AbortSignal.timeout(10000)
        });
        if (!response.ok) {
          console.error(`Error processing votes: ${response.status} ${response.statusText}`);
        } else {
          lastProcessTimeRef.current = now;
          const data = await response.json();
          console.log("Vote processing response:", data);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.warn('Vote processing request timed out');
        } else {
          console.error('Error calling process-votes API:', error);
        }
      } finally {
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 1000);
      }
    };
    processVotes();
    const intervalId = setInterval(() => {
      processVotes();
    }, 60000);
    return () => clearInterval(intervalId);
  }, [pathname]);

  return <>{children}</>;
} 