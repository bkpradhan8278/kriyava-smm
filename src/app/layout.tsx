import type { Metadata } from "next";
import { Inter, Inter_Tight } from "next/font/google";
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
  metadataBase: new URL("https://kriyava.com"),
  title: "Kriyava SMM — Grow Your Social Media Presence Faster Than Ever",
  description:
    "High-quality followers, likes, views and engagement delivered safely through Kriyava SMM's advanced automation platform with multi-provider failover. Trusted by 50,000+ marketers.",
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
    images: ["/assets/og-hero.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${interTight.variable}`}>{children}</body>
    </html>
  );
}
