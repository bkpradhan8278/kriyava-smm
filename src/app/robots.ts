import type { MetadataRoute } from "next";

/**
 * Crawl policy for smm.kriyava.com.
 *
 * Everything public is open to every crawler, search engine and AI answer
 * engine alike, and the AI crawlers are named explicitly rather than left to
 * the wildcard so there is no ambiguity about whether they are welcome.
 *
 * The short Disallow list is not a restriction on visibility. /api has no
 * pages, and the admin and signed-in surfaces have nothing that could rank —
 * opening them would put a login form in search results and spend crawl budget
 * on URLs that return nothing useful. Removing those lines would not help this
 * site appear anywhere; it would only make the crawl worse.
 *
 * Nothing here blocks rendering resources. Googlebot renders a page the way a
 * browser does, so hiding CSS and JavaScript from it means it judges a page it
 * cannot actually see.
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
  "/child-panel"
];

const AI_AGENTS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "GPTBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "cohere-ai",
  "YouBot",
  "Bytespider",
  "CCBot",
  "Diffbot",
  "omgili"
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_AGENTS, allow: "/", disallow: PRIVATE },
    ],
    sitemap: "https://smm.kriyava.com/sitemap.xml",
  };
}
