import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
