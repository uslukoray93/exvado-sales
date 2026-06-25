import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['94.138.216.96'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.ticimax.cloud',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.bolbolbul.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
