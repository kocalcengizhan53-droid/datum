import type { NextConfig } from "next"

/**
 * Static export. The whole journal is files — no server, no database, no keys — so it hosts free
 * on Cloudflare Pages with unmetered static requests and cannot go dark when something sleeps.
 */
const nextConfig: NextConfig = {
  output: "export",
  reactCompiler: true,
  images: { unoptimized: true },
  turbopack: { rules: { "*.css": { loaders: ["@tailwindcss/turbopack"], as: "*.css" } } },
}

export default nextConfig
