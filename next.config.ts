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
    ],
  },
};

export default nextConfig;
