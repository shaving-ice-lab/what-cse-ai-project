import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@what-cse/ui", "@what-cse/shared"],

  // API 代理配置
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:9000/api/:path*",
      },
    ];
  },

  // 图片优化配置
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
