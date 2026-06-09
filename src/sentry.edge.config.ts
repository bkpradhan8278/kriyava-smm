import * as Sentry from "@sentry/nextjs";

const DSN =
  process.env.SENTRY_DSN ??
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
  "https://65c93074b08ab84276450eecc13c8447@o4511432063320064.ingest.us.sentry.io/4511533686390784";

Sentry.init({
  dsn: DSN,
  sendDefaultPii: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
});
