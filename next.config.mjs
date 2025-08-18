/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // replace this your actual origin
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Authorization, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
    serverComponentsExternalPackages: ['sharp'],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/images/**',
      },
    ],
  },
  
  // Configure for large file uploads
  serverRuntimeConfig: {
    // Increase body size limit for file uploads
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
  
  // Configure API routes for large payloads
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // Increase payload size limit for production
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'sharp': 'commonjs sharp',
      });
    }
    return config;
  },
};

export default nextConfig;
