import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/council",
  env: {
    NEXT_PUBLIC_BASE_PATH: "/council",
    NEXT_PUBLIC_SERVER_ADDRESS:
      process.env.NEXT_PUBLIC_SERVER_ADDRESS || "https://eventio.somaiya.edu",
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
