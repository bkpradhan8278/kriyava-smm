import type { MetadataRoute } from "next";
import { ALL_MARKETING_PATHS } from "@/lib/marketing-data";

/**
 * Only public, indexable pages. Everything behind the wallet/order flow is
 * account-specific and Disallow'd in robots.ts.
 *
 * NOTE for a follow-up: both /blog and /blogs exist as routes. If they render
 * the same content that is a duplicate-content split and one of them should
 * 301 to the other — only /blog is advertised here in the meantime.
 *
 * lastModified is fixed rather than `new Date()` so it keeps meaning something.
 */
const BASE = "https://smm.kriyava.com";
const LAST_CONTENT_UPDATE = "2026-08-28";

const PUBLIC_ROUTES = [
  ...ALL_MARKETING_PATHS,
  "",
  "/services",
  "/blog",
  "/contact",
  "/api-docs",
  "/updates",
  "/terms",
  "/privacy-policy",
  "/refund-policy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((p) => ({
    url: `${BASE}${p}`,
    lastModified: LAST_CONTENT_UPDATE,
  }));
}
