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
};

export default nextConfig;
