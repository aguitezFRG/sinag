import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['sinag.cntest.uk', '*.cntest.uk'],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
