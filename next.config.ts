import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // mas stable dev
  swcMinify: true,       // mas maliit build size

  // ✅ Cache-control headers
  async headers() {
    return [
      {
        source: "/:path*", // lahat ng routes/files
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable", // 1 year cache
          },
        ],
      },
      {
        source: "/api/:path*", // specific for API routes
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, stale-while-revalidate=30", 
            // cache API responses for 1 min, allow SWR for 30s
          },
        ],
      },
    ];
  },
};

export default nextConfig;
