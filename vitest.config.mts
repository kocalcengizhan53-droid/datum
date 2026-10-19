import { fileURLToPath } from "node:url"

import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vitest/config"

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Spelled out rather than relying on tsconfigPaths: without it every "@/..." import fails as
    // a missing package, which reads like a dependency problem rather than a config one.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
})
