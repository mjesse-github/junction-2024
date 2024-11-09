import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: 'junction-2024',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
