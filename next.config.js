/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'output: export' to enable server-side features
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['localhost'], // Add your image domains here if needed
  },
  // Enable server-side rendering for API routes
  api: {
    bodyParser: {
      sizeLimit: '4mb', // Set size limit for API requests
    },
  },
};

module.exports = nextConfig;
