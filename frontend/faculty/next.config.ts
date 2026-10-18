import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Test Vercel domain: empty. College production: /faculty.
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "/faculty",
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH ?? "/faculty",
    NEXT_PUBLIC_SERVER_ADDRESS:
      process.env.NEXT_PUBLIC_SERVER_ADDRESS ?? "https://eventio.somaiya.edu",
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
