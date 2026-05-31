import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      // COOP/COEP required for SharedArrayBuffer (WASM background removal)
      // Scoped only to the background-remover route to avoid breaking other pages
      {
        source: "/background-remover",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
        ],
      },
      // COOP only (no COEP) on all other pages — safe for third-party resources
      {
        source: "/((?!background-remover).*)",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },
  turbopack: {},
};

export default nextConfig;
