import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // standalone serve al Dockerfile; su Vercel rompe il file tracing (nft.json)
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
