import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: "/women-only-teams",
        destination: "/leaderboard/women-teams",
        permanent: true,
      },
      {
        source: "/women-teams",
        destination: "/leaderboard/women-teams",
        permanent: true,
      },
      {
        source: "/womenteams",
        destination: "/leaderboard/women-teams",
        permanent: true,
      },
      {
        source: "/women-only",
        destination: "/leaderboard/women-teams",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

