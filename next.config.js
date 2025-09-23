/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove 'output: export' to enable server-side features
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['localhost'], // Add your image domains here if needed
  }
};


module.exports = nextConfig;
