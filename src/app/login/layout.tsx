import type { Metadata } from "next";

// Sign-in page — nothing to rank for.
//
// This is a noindex meta tag rather than a robots.txt Disallow on purpose: a
// blocked URL is one whose noindex Google can never read, so a page that was
// already submitted would stay in the index forever. Crawlable + noindex is
// what actually removes it.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
