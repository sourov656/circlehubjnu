import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images from any source (disables Next.js image optimization)
  images: {
    unoptimized: true,
  },
  // Proxy configuration for authentication
  experimental: {
    proxyTimeout: 30000,
  },
};

export default nextConfig;
