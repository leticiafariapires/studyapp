/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static HTML export for Netlify
  output: 'export',
  
  // Enable styled-components support
  compiler: {
    styledComponents: true,
  },
  
  // Disable server-side features for static export
  experimental: {
    // Disable server actions in production
    serverActions: process.env.NODE_ENV === 'development' ? {
      allowedOrigins: ['localhost:3000', 'localhost:3001'],
    } : false,
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
  
  // Disable React StrictMode for static export
  reactStrictMode: false,
};

// Ensure we're building a static export
if (process.env.NODE_ENV === 'production') {
  nextConfig.output = 'export';
}

export default nextConfig;
