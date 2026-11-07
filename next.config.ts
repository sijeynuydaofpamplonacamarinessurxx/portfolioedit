import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Let devices on the local network load dev assets (otherwise the page never hydrates)
  allowedDevOrigins: ["192.168.1.5", "192.168.*.*"],
  // Allow large file uploads (videos up to 500MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },
};

export default nextConfig;
