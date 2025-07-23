// "use client";
// import { Mulish as FontSans } from "next/font/google";
// import { SessionProvider } from "next-auth/react";
// import { Providers } from "@/app/providers";
// import { cn } from "@/lib/utils";
// import { useEffect } from "react";
// import { SocketProvider } from "@/app/socket";
// import { usePathname } from "next/navigation"; // Import usePathname

// const fontSans = FontSans({
//   subsets: ["latin"],
//   variable: "--font-sans",
// });

// export default function RootLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname(); 

//   useEffect(() => {
//     const handleRouteChange = () => {
//       fetch('/cron/process-votes')
//         .then(response => {
//           if (!response.ok) {
//             console.error('Error processing votes:', response.statusText);
//           }
//         })
//         .catch(error => {
//           console.error('Error calling process-votes API:', error);
//         });
//     };

//     // This effect will run when the component mounts AND when the pathname changes
//     handleRouteChange();
//   }, [pathname]); // Add pathname as dependency

//   return (
//     <html lang="en" suppressHydrationWarning={true}>
//       <body className={cn("min-h-screen max-h-screen bg-background font-sans antialiased", fontSans.variable)}>
//         <SessionProvider>
//           <SocketProvider>
//             <Providers>{children}</Providers>
//           </SocketProvider>
//         </SessionProvider>
//       </body>
//     </html>
//   );
// }

"use client";
import { Mulish as FontSans } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Providers } from "@/app/providers";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { SocketProvider } from "@/app/socket";
import { usePathname } from "next/navigation";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Minimum time between vote processing calls
const THROTTLE_MS = 10000; // 10 seconds

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
          // Ensure the browser doesn't cache responses
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate, private',
            'Pragma': 'no-cache',
            'Expires': '0',
            'X-Request-Time': now.toString() // Custom header for debugging
          },
          // Set a reasonable timeout to prevent hanging requests
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          console.error(`Error processing votes: ${response.status} ${response.statusText}`);
        } else {
          // Only update the last process time on successful calls
          lastProcessTimeRef.current = now;
          
          // For debugging, log the response
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
        // Set a short delay before allowing next call
        setTimeout(() => {
          isProcessingRef.current = false;
        }, 1000);
      }
    };

    // Execute vote processing when pathname changes
    processVotes();
    
    // Optional: set up additional interval to ensure processing happens 
    // even if user doesn't navigate much
    const intervalId = setInterval(() => {
      processVotes();
    }, 60000); // Every minute
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [pathname]);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body className={cn("min-h-screen max-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <SessionProvider>
          <SocketProvider>
            <Providers>{children}</Providers>
          </SocketProvider>
        </SessionProvider>
      </body>
    </html>
  );
}