import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SERVER_ADDRESS:
      process.env.NEXT_PUBLIC_SERVER_ADDRESS || "https://eventioapi.swdc.somaiya.edu",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "https://eventio.somaiya.edu",
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
