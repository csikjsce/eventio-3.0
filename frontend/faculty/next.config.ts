import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SERVER_ADDRESS:
      process.env.NEXT_PUBLIC_SERVER_ADDRESS ?? "https://eventioapi.swdc.somaiya.edu",
  },
};

export default nextConfig;
