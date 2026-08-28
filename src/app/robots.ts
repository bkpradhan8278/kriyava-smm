import type { MetadataRoute } from "next";

/**
 * Kriyava SMM had no robots.txt and no sitemap.xml — both returned 404, so
 * crawlers had neither a crawl policy nor a list of pages to index.
 *
 * Account, ordering and admin surfaces are behind login and Disallow'd. /login
 * additionally carries a noindex tag so it can be dropped if it was already
 * picked up.
 */
const PRIVATE = [
  "/api/",
  "/admin",
  "/dashboard",
  "/orders",
  "/new-order",
  "/mass-order",
  "/add-funds",
  "/settings",
  "/tickets",
  "/affiliate",
  "/child-panel",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      // ChatGPT Search's retrieval crawler. Separate from training consent.
      { userAgent: "OAI-SearchBot", allow: "/", disallow: PRIVATE },
      // Model-training crawler. Flip to allow: "/" to opt in.
      { userAgent: "GPTBot", disallow: "/" },
    ],
    sitemap: "https://smm.kriyava.com/sitemap.xml",
  };
}
