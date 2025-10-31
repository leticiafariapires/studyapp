/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable SSL verification for corporate networks
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
  },
  // Disable SSL certificate validation (development only)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Disable SSL verification on server
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
