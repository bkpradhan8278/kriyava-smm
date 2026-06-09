import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: "kriyava",
  project: "kriyava-smm-frontend",
  // Source-map upload at build time needs this in Vercel (project env var).
  // Builds still succeed without it — you just won't get readable stack traces.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  // Route Sentry traffic through the app to dodge ad-blockers.
  tunnelRoute: "/monitoring",
  silent: !process.env.CI,
});
