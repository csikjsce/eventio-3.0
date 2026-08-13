import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/faculty",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/faculty",
    NEXT_PUBLIC_SERVER_ADDRESS:
      process.env.NEXT_PUBLIC_SERVER_ADDRESS ?? "https://eventio.somaiya.edu",
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
