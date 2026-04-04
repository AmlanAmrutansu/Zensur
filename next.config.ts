import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pg, bcryptjs, and jsonwebtoken have Node.js native bindings —
  // they must run on the server only, never bundled for the client.
  serverExternalPackages: ["pg", "bcryptjs", "jsonwebtoken"],

  // Replit proxy origins (ignored outside Replit — safe to keep).
  ...(process.env.REPLIT_DEV_DOMAIN
    ? {
        allowedDevOrigins: [
          process.env.REPLIT_DEV_DOMAIN,
          "*.replit.dev",
          "*.picard.replit.dev",
        ],
      }
    : {}),
};

export default nextConfig;
