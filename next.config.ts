import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle for Docker (.next/standalone).
  // The Dockerfile copies this to produce a small runtime image.
  output: "standalone",
  // Pin the workspace root to this project so the standalone bundle
  // doesn't get nested under .next/standalone/Projects/Atakan/ when a
  // sibling lockfile exists higher up the tree (~/package-lock.json).
  outputFileTracingRoot: path.join(__dirname),
  // The /nereye-gitti URLs are fixed in App Store Connect and inside the iOS
  // app, and must answer 200 with or without a trailing slash — never a
  // redirect. So Next's built-in trailing-slash 308 is switched off and
  // re-added below for every other path.
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      // Same rule Next adds internally ("/:path+/" -> "/:path+"), minus /nereye-gitti.
      { source: "/:path((?!nereye-gitti(?:/|$)).+)/", destination: "/:path", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/nereye-gitti/", destination: "/nereye-gitti" },
        { source: "/nereye-gitti/:page/", destination: "/nereye-gitti/:page" },
      ],
    };
  },
  async headers() {
    const immutable = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    return [
      {
        // Icons and og.png have stable names: cache a day, then revalidate.
        source: "/nereye-gitti/:file([^/]+\\.(?:svg|png))",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      // These file names carry a content hash.
      { source: "/nereye-gitti/fonts/:file([^/]+\\.[0-9a-f]{8}\\.woff2)", headers: immutable },
      { source: "/nereye-gitti/ekranlar/:file*", headers: immutable },
    ];
  },
};

export default nextConfig;
