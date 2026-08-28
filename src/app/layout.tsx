import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
import { TagManager } from "@/components/analytics/tag-manager";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = {
  // The panel lives on smm.kriyava.com. Pointing metadataBase at kriyava.com
  // made every generated canonical and OG URL resolve to the parent site,
  // handing Kriyava SMM's ranking signals to a different host.
  metadataBase: new URL("https://smm.kriyava.com"),
  alternates: { canonical: "/" },
  title: "Kriyava SMM — Grow Your Social Media Presence Faster Than Ever",
  description:
    "Followers, likes, views and engagement across 550+ services, delivered through Kriyava SMM's automation platform with multi-provider failover, wallet top-ups and order refills.",
  icons: {
    icon: [
      { url: "/assets/favicon.ico" },
      { url: "/assets/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/assets/apple-touch-icon.png",
  },
  openGraph: {
    title: "Kriyava SMM — Premium Social Media Growth",
    description: "High-quality engagement, wholesale pricing, multi-provider reliability.",
    url: "https://smm.kriyava.com",
    siteName: "Kriyava SMM",
    type: "website",
    locale: "en_IN",
    images: ["/assets/og-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kriyava SMM — Premium Social Media Growth",
    description: "High-quality engagement, wholesale pricing, multi-provider reliability.",
    images: ["/assets/og-hero.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{document.documentElement.setAttribute('data-theme',localStorage.getItem('kriyava_theme')||'dark')}catch(e){}",
          }}
        />
      </head>
      <body className={`${inter.variable} ${interTight.variable}`}>
        {children}
        <TagManager />
      </body>
    </html>
  );
}
