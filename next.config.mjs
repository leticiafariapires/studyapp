/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static HTML export for Netlify
  output: 'export',
  
  // Enable styled-components support
  compiler: {
    styledComponents: true,
  },
  
  // Disable SSL verification for corporate networks (development only)
  experimental: process.env.NODE_ENV === 'development' ? {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    },
  } : {},
  
  // Webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Disable SSL verification on server in development only
    if (isServer && dev) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    return config;
  },
  
  // Image optimization configuration
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Add trailing slash for Netlify compatibility
  trailingSlash: true,
};

export default nextConfig;
