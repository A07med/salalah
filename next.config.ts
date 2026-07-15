import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow LAN/mobile devices to load dev resources so `next dev` hydrates over
  // a private-network IP instead of only localhost. Production is unaffected.
  allowedDevOrigins: [
    "172.20.10.4",
    "10.0.0.0/8",
    "172.16.0.0/12",
    "192.168.0.0/16",
  ],
};

export default nextConfig;
