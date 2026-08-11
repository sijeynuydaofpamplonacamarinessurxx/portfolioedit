import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large file uploads (videos up to 500MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};

export default nextConfig;
