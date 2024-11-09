import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // basePath: '/junction-2024',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH,  // Add base path for GitHub Pages
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH,  // Add asset prefix for GitHub Pages

};

export default nextConfig;
