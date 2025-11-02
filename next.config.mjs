/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable styled-components support
  compiler: {
    styledComponents: true,
  },
  
  // Enable server actions
  experimental: {
    serverActions: true,
  },
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Disable SSL verification on server in development only
    if (isServer && dev) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    
    // Important: return the modified config
    return config;
  },
  
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Enable React StrictMode
  reactStrictMode: true,
};

export default nextConfig;
