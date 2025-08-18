import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle large file uploads for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Set higher limits for file upload endpoints
    if (request.nextUrl.pathname.includes('/images') || 
        request.nextUrl.pathname.includes('/products') ||
        request.nextUrl.pathname.includes('/upload')) {
      
      // Increase timeout for file uploads
      const response = NextResponse.next();
      response.headers.set('Connection', 'keep-alive');
      response.headers.set('Keep-Alive', 'timeout=300');
      
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
};
