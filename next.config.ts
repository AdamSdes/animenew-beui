import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "shikimori.one" },
      { protocol: "https", hostname: "**.shikimori.one" },
      { protocol: "https", hostname: "shikimori.io" },
      { protocol: "https", hostname: "**.shikimori.io" },
      { protocol: "https", hostname: "shiki.one" },
      { protocol: "https", hostname: "**.shiki.one" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
