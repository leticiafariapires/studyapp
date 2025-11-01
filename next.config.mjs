/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable styled-components support
  compiler: {
    styledComponents: true,
  },
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
