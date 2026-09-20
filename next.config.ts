import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "Content-Security-Policy-Report-Only", value: "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https:;" },
      ],
    }];
  },
  async redirects() {
    return [
      { source: "/trasplante-capilar", destination: "/", permanent: true },
      { source: "/blefaroplastia", destination: "/rejuvenecimiento-facial", permanent: true },
      { source: "/rinoplastia", destination: "/rejuvenecimiento-facial", permanent: true },
      { source: "/agenda", destination: "/reservar", permanent: true },
      { source: "/tratamientos/medicina-capilar", destination: "/", permanent: true },
      { source: "/tratamientos/trasplante-capilar", destination: "/", permanent: true },
      { source: "/tratamientos/blefaroplastia", destination: "/rejuvenecimiento-facial", permanent: true },
      { source: "/tratamientos/rinoplastia", destination: "/rejuvenecimiento-facial", permanent: true },
      { source: "/tratamientos/otros-procedimientos", destination: "/rejuvenecimiento-facial", permanent: true },
    ];
  },
};

export default nextConfig;
