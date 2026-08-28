"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * Google tag loader for Kriyava SMM.
 *
 * Set one of these in Vercel (GTM preferred — it can carry the GA4 tag plus Ads
 * conversions without another deploy):
 *
 *   NEXT_PUBLIC_GTM_ID = GTM-XXXXXXX
 *   NEXT_PUBLIC_GA_ID  = G-XXXXXXXXXX
 *
 * NEXT_PUBLIC_* is inlined into the client bundle at build time. That is correct
 * for a measurement ID, which is public by design, and wrong for anything else.
 *
 * Signed-in surfaces are excluded. All Kriyava products report into one GA4
 * property so the funnel across kriyava.com and the products is visible in one
 * place — but a logged-in dashboard generates far more pageviews than a
 * marketing visit, and letting that in would wreck engagement rate, session
 * duration and every conversion rate computed from them. Public pages are what
 * marketing reporting is about; product usage belongs in product analytics.
 */
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const PRIVATE_PREFIXES = [
  "/dashboard",
  "/orders",
  "/new-order",
  "/mass-order",
  "/add-funds",
  "/settings",
  "/tickets",
  "/affiliate",
  "/child-panel",
  "/admin",
  "/login"
];

export function TagManager() {
  const pathname = usePathname();

  const isPrivate = PRIVATE_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPrivate) return null;

  if (GTM_ID) {
    return (
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
    );
  }

  if (GA_ID) {
    return (
      <>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
        </Script>
      </>
    );
  }

  return null;
}
