/**
 * Semantic analytics events for Kriyava SMM.
 *
 * Events are pushed to a GTM dataLayer rather than calling GA4 directly, so the
 * same event can be fanned out to GA4, Ads conversions or anything else from
 * inside Tag Manager without another deploy. When only GA4 is configured, the
 * gtag snippet reads the same dataLayer.
 *
 * No measurement ID lives in this file — it comes from NEXT_PUBLIC_GA_ID or
 * NEXT_PUBLIC_GTM_ID at build time. Until one is set nothing loads and
 * `track()` costs a single array push.
 *
 * Never pass a name, email, phone number or user id to these. GA4 must not
 * receive personally identifiable information, and a category or a plan name is
 * everything the reporting actually needs.
 */
export type KriyavaEvent =
  | "generate_lead"
  | "contact_form_submit"
  | "whatsapp_click"
  | "book_call_click"
  | "pricing_view"
  | "signup_start"
  | "signup_complete"
  | "purchase"
  | "demo_request";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function track(
  event: KriyavaEvent,
  params: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
