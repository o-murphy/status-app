import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export', // Add this line for static HTML export
  allowedDevOrigins: ['192.168.88.211', 'localhost', '*.local-origin.dev'],

  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://o-murphy.net/:path*',
      },
    ];
  },
};

export default nextConfig;
