import * as Sentry from "@sentry/nextjs";

const DSN =
  process.env.NEXT_PUBLIC_SENTRY_DSN ??
  "https://65c93074b08ab84276450eecc13c8447@o4511432063320064.ingest.us.sentry.io/4511533686390784";

Sentry.init({
  dsn: DSN,
  sendDefaultPii: true,
  // 10% of transactions traced in prod (free tier: ~10k spans/month).
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  // Free tier allows ~50 replays/month — don't record random sessions,
  // only record the session when an error actually happens.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
