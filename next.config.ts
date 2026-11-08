import type { NextConfig } from "next";

/** В облачном предпросмотре dev-сервер открывается по внешнему хосту. */
const devOrigins = process.env.ALLOWED_DEV_ORIGINS?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Драйверы базы не бандлим: PGlite тянет wasm, pg — нативные части.
  serverExternalPackages: ["pg", "@electric-sql/pglite"],
  allowedDevOrigins: devOrigins,
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
