"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Zap, ShieldCheck, Headphones, Lock, IndianRupee, Code2, Check, ChevronDown,
  Sparkles, Bot, User, ArrowRight,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem, SlideIn } from "../Reveal";
import {
  IconInstagram, IconYouTube, IconFacebook, IconTikTok,
  IconTelegram, IconSpotify, IconTwitterX, IconWhatsApp,
} from "../SocialIcon";
import { CountUp } from "../CountUp";
import { useHeadlineCards } from "@/lib/useServices";
import { fmtINR } from "@/lib/account";
import { motion } from "framer-motion";

/* ---------------- Trust metrics ---------------- */
export function Metrics() {
  const items = [
    { node: <CountUp to={50000} suffix="K+" divide={1000} />, label: "Customers" },
    { node: <CountUp to={1000000} suffix="M+" divide={1000000} />, label: "Orders delivered" },
    { node: <CountUp to={99.9} suffix="%" decimals={1} />, label: "Success rate" },
    { node: "24/7", label: "Live support" },
  ];
  return (
    <section className="section-pad py-12">
      <div className="container-x">
        <Stagger className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((m, i) => (
            <StaggerItem key={i}>
              <div className="rounded-[16px] border border-[color:var(--color-line)] bg-gradient-to-b from-white to-[color:var(--color-surface)] p-8 text-center shadow-sm hover:border-slate-300 transition-colors">
                <div className="font-display text-[clamp(34px,4.4vw,46px)] font-extrabold tracking-[-0.03em] text-[color:var(--color-ink)]">{m.node}</div>
                <div className="mt-1.5 text-[12px] font-bold text-[color:var(--color-muted)] uppercase tracking-wider">{m.label}</div>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- Platforms ---------------- */
const PLATFORMS: Array<{ name: string; icon: React.ReactNode }> = [
  { name: "Instagram", icon: <IconInstagram size={32} /> },
  { name: "Facebook",  icon: <IconFacebook size={32} /> },
  { name: "YouTube",   icon: <IconYouTube size={32} /> },
  { name: "Telegram",  icon: <IconTelegram size={32} /> },
  { name: "TikTok",    icon: <IconTikTok size={32} /> },
  { name: "Twitter/X", icon: <IconTwitterX size={32} /> },
  { name: "Spotify",   icon: <IconSpotify size={32} /> },
  { name: "WhatsApp",  icon: <IconWhatsApp size={32} /> },
];
export function Platforms() {
  return (
    <section id="platforms" className="section-pad pt-0">
      <div className="container-x">
        <Reveal>
          <div className="mx-auto mb-12 max-w-[720px] text-center">
            <span className="eyebrow">Supported platforms</span>
            <h2 className="h-sec mt-3 text-[color:var(--color-ink)]">One panel for every channel</h2>
            <p className="lead mx-auto mt-3.5 text-[color:var(--color-muted)]">Real engagement across the platforms your audience actually uses — with safe, drip-fed delivery.</p>
          </div>
        </Reveal>
        <Stagger className="grid grid-cols-4 gap-4 sm:grid-cols-4 lg:grid-cols-8" stagger={0.04}>
          {PLATFORMS.map((p) => (
            <StaggerItem key={p.name}>
              <div className="group flex flex-col items-center gap-2.5 rounded-[16px] border border-[color:var(--color-line)] bg-white px-3 py-5 transition-all hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-md cursor-default">
                <span className="transition-transform duration-300 group-hover:scale-110">{p.icon}</span>
                <span className="text-[12px] font-bold text-[color:var(--color-ink)] text-center leading-tight">{p.name}</span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- Why choose us ---------------- */
export function WhyUs() {
  const feats = [
    { icon: Zap, tint: "icontint-blue", t: "Lightning-fast delivery", d: "Orders start in seconds. Drip-feed and instant modes keep growth looking natural while it scales." },
    { icon: ShieldCheck, tint: "icontint-green", t: "High-retention services", d: "Real-looking profiles with low drop and lifetime refill options — engagement that actually sticks." },
    { icon: Headphones, tint: "icontint-cyan", t: "24/7 human support", d: "Real people on live chat and WhatsApp, plus automatic order updates so you're never left guessing." },
    { icon: Lock, tint: "icontint-violet", t: "Secure payments", d: "Razorpay-protected checkout and verified wallet top-ups. Zero card data stored." },
    { icon: IndianRupee, tint: "icontint-amber", t: "Genuinely affordable", d: "Wholesale provider pricing passed to you. Transparent rates per 1K — no hidden fees, ever." },
    { icon: Code2, tint: "icontint-rose", t: "Powerful API + failover", d: "One REST API, multiple providers behind it. If one source slows, Kriyava auto-routes to the next. No downtime." },
  ];
  return (
    <section className="section-pad bg-[color:var(--color-surface)] border-y border-[color:var(--color-line)]">
      <div className="container-x">
        <Reveal>
          <div className="mx-auto mb-12 max-w-[720px] text-center">
            <span className="eyebrow">Why Kriyava</span>
            <h2 className="h-sec mt-3 text-[color:var(--color-ink)]">Built different from every other panel</h2>
            <p className="lead mx-auto mt-3.5 text-[color:var(--color-muted)]">Most SMM panels run on a single source. Kriyava routes every order across multiple vetted providers — so you get speed, retention and uptime they can&apos;t match.</p>
          </div>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {feats.map((f) => (
            <StaggerItem key={f.t}>
              <article className="h-full rounded-[16px] border border-[color:var(--color-line)] bg-white p-8 transition-all hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-2xl text-left">
                <div className={`mb-[18px] grid h-[50px] w-[50px] place-items-center rounded-[14px] text-white ${f.tint}`}><f.icon size={24} /></div>
                <h3 className="text-[19px] font-bold text-[color:var(--color-ink)]">{f.t}</h3>
                <p className="mt-2 text-[14.5px] text-[color:var(--color-muted)] font-medium">{f.d}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- Services preview (real data) ---------------- */
export function ServicesPreview() {
  const cards = useHeadlineCards();
  return (
    <section id="services" className="section-pad">
      <div className="container-x">
        <Reveal>
          <div className="mx-auto mb-12 max-w-[720px] text-center">
            <span className="eyebrow">Services</span>
            <h2 className="h-sec mt-3 text-[color:var(--color-ink)]">Popular services, live prices</h2>
            <p className="lead mx-auto mt-3.5 text-[color:var(--color-muted)]">Real starting rates per 1,000 — pulled from our provider network every 30 minutes.</p>
          </div>
        </Reveal>
        <Stagger className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {cards.length === 0
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-[300px] animate-pulse rounded-[16px] border border-[color:var(--color-line)] bg-slate-50/50" />
              ))
            : cards.slice(0, 6).map((c) => (
                <StaggerItem key={c.label}>
                  <article className="flex flex-col h-full rounded-[16px] border border-[color:var(--color-line)] bg-white p-6 transition-all hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-2xl text-left">
                    <div className="mb-4 flex items-center gap-3 border-b border-[color:var(--color-line-soft)] pb-4">
                      <span className="shrink-0">{platIconNode(c.label, 40)}</span>
                      <b className="font-display text-[15px] font-extrabold text-[color:var(--color-ink)] leading-tight">{c.label}</b>
                    </div>
                    <div className="mb-1 flex items-baseline gap-1.5">
                      <span className="text-[12px] font-bold text-[color:var(--color-muted)]">from</span>
                      <span className="font-display text-[28px] font-extrabold text-[color:var(--color-primary)]">{fmtINR(c.retail_inr)}</span>
                      <span className="text-[13px] font-bold text-[color:var(--color-muted)]">/ 1K</span>
                    </div>
                    <div className="my-4 flex flex-col gap-2 border-y border-[color:var(--color-line-soft)] py-4 text-[13px]">
                      <Row label="Speed" value={<b className="font-bold text-[color:var(--color-ink)]">{c.speed}</b>} />
                      <Row label="Retention" value={<Dots q={c.quality} />} />
                      <Row label="Refill" value={<b className="font-bold" style={{ color: /lifetime|days|365/i.test(c.refill) ? "var(--color-success)" : "var(--color-ink)" }}>{c.refill}</b>} />
                    </div>
                    <Link href="/login" className="btn btn-primary btn-block mt-auto !py-2.5 !text-xs rounded-xl">Order now</Link>
                  </article>
                </StaggerItem>
              ))}
        </Stagger>
        <div className="mt-10 text-center">
          <Link href="/login?redirect=/services" className="btn !px-6 !py-3 !text-sm rounded-xl bg-white border border-[color:var(--color-line)] text-[color:var(--color-ink)] hover:bg-[color:var(--color-surface)] hover:border-slate-300 transition-all hover:-translate-y-0.5 inline-flex items-center gap-2">
            Browse all services <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-semibold text-[color:var(--color-muted)]">{label}</span>
      {value}
    </div>
  );
}
function Dots({ q }: { q: number }) {
  return (
    <span className="inline-flex gap-[3px]">
      {[0, 1, 2, 3, 4].map((i) => (
        <i key={i} className="h-[7px] w-[7px] rounded-full" style={{ background: i < q ? "var(--color-success)" : "rgba(15,23,42,0.1)" }} />
      ))}
    </span>
  );
}
function platIconNode(label: string, size = 40) {
  const l = label.toLowerCase();
  if (l.includes("instagram")) return <IconInstagram size={size} />;
  if (l.includes("youtube"))   return <IconYouTube size={size} />;
  if (l.includes("telegram"))  return <IconTelegram size={size} />;
  if (l.includes("tiktok"))    return <IconTikTok size={size} />;
  if (l.includes("facebook"))  return <IconFacebook size={size} />;
  if (l.includes("whatsapp"))  return <IconWhatsApp size={size} />;
  if (l.includes("spotify"))   return <IconSpotify size={size} />;
  if (l.includes("twitter") || l.includes(" x")) return <IconTwitterX size={size} />;
  return <span className="text-2xl">⚡</span>;
}

/* ---------------- How it works ---------------- */
export function HowItWorks() {
  const steps = [
    { n: "01", img: "step-1-account", t: "Create account",  d: "Sign up free in 30 seconds — no card required.", color: "from-blue-600 to-cyan-500" },
    { n: "02", img: "step-2-wallet",  t: "Add funds",        d: "Top up via UPI, cards or netbanking. Instant wallet credit.", color: "from-violet-600 to-blue-500" },
    { n: "03", img: "step-3-service", t: "Select service",   d: "Pick a platform, paste your link, set quantity — or let the AI do it.", color: "from-pink-600 to-rose-500" },
    { n: "04", img: "step-4-growth",  t: "Watch growth",     d: "Track delivery live on your dashboard and get status updates.", color: "from-emerald-500 to-teal-400" },
  ];
  return (
    <section id="how" className="section-pad bg-[color:var(--color-surface)] border-y border-[color:var(--color-line)]">
      <div className="container-x">
        <Reveal>
          <div className="mx-auto mb-12 max-w-[720px] text-center">
            <span className="eyebrow">How it works</span>
            <h2 className="h-sec mt-3 text-[color:var(--color-ink)]">From signup to growth in minutes</h2>
            <p className="lead mx-auto mt-3.5 text-[color:var(--color-muted)]">No contracts, no learning curve. Four steps and your numbers start moving.</p>
          </div>
        </Reveal>

        {/* ── MOBILE: vertical timeline (< sm) ── */}
        <div className="relative sm:hidden">
          {/* Vertical connector line */}
          <div className="absolute left-[19px] top-10 bottom-8 w-[2px] bg-gradient-to-b from-blue-200 via-violet-200 to-emerald-200" />

          <div className="flex flex-col gap-8">
            {steps.map((s, idx) => (
              <SlideIn key={s.n} direction="left" delay={0} className="relative pl-12">
                {/* Step badge on the timeline */}
                <span className={`absolute left-0 top-3 z-10 grid h-[38px] w-[38px] place-items-center rounded-[11px] bg-gradient-to-br ${s.color} font-display text-[14px] font-extrabold text-white shadow-md`}>{s.n}</span>

                <div className="rounded-[16px] border border-[color:var(--color-line)] bg-white overflow-hidden shadow-sm">
                  {/* Image strip */}
                  <div className="relative h-[140px] overflow-hidden"
                    style={{ background: "linear-gradient(150deg,#eaf2ff 0%,#f5f9ff 45%,#ecfdf7 100%)" }}>
                    <Image src={`/assets/${s.img}.png`} alt={s.t} fill className="object-contain p-4 pointer-events-none" sizes="100vw" />
                  </div>
                  {/* Text */}
                  <div className="p-4">
                    <h3 className="text-[17px] font-bold text-[color:var(--color-ink)]">{s.t}</h3>
                    <p className="mt-1 text-[13px] text-[color:var(--color-muted)] font-medium leading-relaxed">{s.d}</p>
                  </div>
                </div>

                {/* Connector dot between cards (not last) */}
                {idx < steps.length - 1 && (
                  <div className="absolute -bottom-4 left-[18px] h-2 w-2 rounded-full bg-slate-300" />
                )}
              </SlideIn>
            ))}
          </div>
        </div>

        {/* ── DESKTOP: 4-col grid (sm+) ── */}
        <Stagger className="hidden sm:grid grid-cols-2 gap-5 lg:grid-cols-4" stagger={0.07}>
          {steps.map((s) => (
            <StaggerItem key={s.n}>
              <article className="group relative overflow-hidden rounded-[16px] border border-[color:var(--color-line)] bg-white p-5 text-center transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-slate-300 h-full">
                <span className={`absolute left-4 top-3.5 z-2 grid h-[30px] w-[30px] place-items-center rounded-[9px] bg-gradient-to-br ${s.color} font-display text-[13px] font-extrabold text-white shadow-md`}>{s.n}</span>
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-[14px] border border-[color:var(--color-line)]"
                  style={{ background: "linear-gradient(150deg,#eaf2ff 0%,#f5f9ff 45%,#ecfdf7 100%)" }}>
                  <Image src={`/assets/${s.img}.png`} alt={s.t} fill className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.06] pointer-events-none" sizes="25vw" />
                </div>
                <h3 className="text-[17px] font-bold text-[color:var(--color-ink)]">{s.t}</h3>
                <p className="mt-2 text-[13px] text-[color:var(--color-muted)] font-medium">{s.d}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ---------------- API section ---------------- */
export function ApiSection() {
  const feats = ["REST API", "Bulk orders", "Webhooks", "Order tracking", "White label", "Multi-provider failover"];
  return (
    <section id="api" className="section-pad">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] p-[clamp(40px,5vw,72px)] text-white" style={{ background: "radial-gradient(120% 120% at 0% 0%,#0b1220 0%,#0f172a 45%,#111c3a 100%)" }}>
            <div className="relative z-1 grid items-center gap-16 lg:grid-cols-2">
              <div>
                <span className="eyebrow" style={{ color: "#7dd3fc" }}>API for resellers</span>
                <h2 className="mt-3.5 text-[clamp(28px,3.6vw,40px)] font-extrabold text-white">Build your own SMM empire on our rails</h2>
                <p className="lead mt-3.5" style={{ color: "#94a3b8" }}>One clean REST API, multiple providers behind it. Automate orders, sync status, and white-label everything under your brand.</p>
                <div className="my-7 grid grid-cols-2 gap-3.5">
                  {feats.map((f) => (
                    <div key={f} className="flex items-center gap-[11px] text-[14.5px] font-semibold text-[#cbd5e1]">
                      <span className="grid h-6 w-6 place-items-center rounded-lg bg-[rgba(16,185,129,.16)]"><Check size={14} color="#34d399" /></span>{f}
                    </div>
                  ))}
                </div>
                <Link href="/login?redirect=/api-docs" className="btn btn-cta btn-lg">View API Docs →</Link>
              </div>
              <div className="overflow-hidden rounded-[16px] border border-[rgba(148,163,184,.18)] bg-[#0a0f1f] shadow-[0_30px_70px_rgba(0,0,0,.45)]">
                <div className="flex items-center gap-[7px] border-b border-[rgba(148,163,184,.15)] px-4 py-3.5">
                  <i className="h-[11px] w-[11px] rounded-full bg-[#ff5f57]" /><i className="h-[11px] w-[11px] rounded-full bg-[#febc2e]" /><i className="h-[11px] w-[11px] rounded-full bg-[#28c840]" />
                  <span className="ml-2.5 font-mono text-[12px] text-[#64748b]">POST /api/v2 — place order</span>
                </div>
                <pre className="overflow-auto p-5 font-mono text-[13px] leading-[1.75] text-[#e2e8f0]">
{`// Auto-routes LuvSMM → EasySMM
const res = await fetch("https://api.kriyava.com/v2", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    key: "YOUR_API_KEY",
    action: "add",
    service: 641,
    link: "https://instagram.com/yourbrand",
    quantity: 1000
  })
});
// → { "order": 23501, "provider": "luvsmm" }`}
                </pre>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- Pricing ---------------- */
export function Pricing() {
  const plans = [
    { name: "Starter", desc: "For creators growing their own accounts.", price: "0", cyc: "/ forever", feat: false, cls: "btn-ghost", cta: "Create free account", benefits: ["Pay-as-you-go wallet", "All platforms & services", "Standard delivery speed", "Email & chat support"] },
    { name: "Professional", desc: "For power users & serious creators.", price: "1,999", cyc: "/ month", feat: true, cls: "btn-primary", cta: "Start Professional", benefits: ["Everything in Starter", "Priority delivery & support", "Verified Razorpay wallet top-ups", "Full REST API access"] },
    { name: "Agency", desc: "White-label panel for resellers & teams.", price: "4,999", cyc: "/ month", feat: false, cls: "btn-cta", cta: "Launch your panel", benefits: ["Everything in Professional", "White-label child panel", "Custom domain & branding", "Agency CRM & lowest rates"] },
  ];
  return (
    <section id="pricing" className="section-pad bg-[color:var(--color-surface)]">
      <div className="container-x">
        <Reveal>
          <div className="mx-auto mb-12 max-w-[720px] text-center">
            <span className="eyebrow">Pricing</span>
            <h2 className="h-sec mt-3">Start free. Scale when you&apos;re ready.</h2>
            <p className="lead mx-auto mt-3.5">Wallet-based — you only pay for what you order. Plans unlock better rates, API limits and reseller tools.</p>
          </div>
        </Reveal>
        <div className="mx-auto grid max-w-[440px] grid-cols-1 items-stretch gap-6 lg:max-w-none lg:grid-cols-3">
          {plans.map((p) => (
            <div key={p.name} className={`relative flex flex-col rounded-[16px] bg-white p-8 transition-all hover:-translate-y-1.5 ${p.feat ? "shadow-[var(--shadow-lg-soft)]" : "border border-[color:var(--color-line)] hover:shadow-[var(--shadow-md-soft)]"}`} style={p.feat ? { border: "1.5px solid transparent", background: "linear-gradient(#fff,#fff) padding-box,linear-gradient(140deg,var(--color-primary),var(--color-secondary)) border-box" } : undefined}>
              {p.feat && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-br from-[color:var(--color-primary)] to-[color:var(--color-secondary)] px-3.5 py-1.5 text-[11.5px] font-extrabold tracking-[0.04em] text-white shadow-[var(--shadow-glow)]">Most Popular</span>}
              <h3 className="text-[18px] font-bold">{p.name}</h3>
              <p className="mt-1 min-h-[38px] text-[13.5px] text-[color:var(--color-muted)]">{p.desc}</p>
              <div className="my-4 flex items-baseline gap-1.5">
                <span className="text-[20px] font-bold">₹</span>
                <span className="font-display text-[42px] font-extrabold tracking-[-0.03em]">{p.price}</span>
                <span className="text-[14px] font-semibold text-[color:var(--color-muted)]">{p.cyc}</span>
              </div>
              <ul className="mb-6 mt-2 flex flex-col gap-3">
                {p.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[14px] text-[#334155]">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-[rgba(16,185,129,.12)]"><Check size={13} color="#10B981" /></span>{b}
                  </li>
                ))}
              </ul>
              <Link href="/login" className={`btn ${p.cls} btn-block mt-auto`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
export function Faq() {
  const qa = [
    ["Is using Kriyava safe for my account?", "Yes. We never ask for your password — only your public profile or post link. Delivery is drip-fed to look natural, and we offer high-retention, low-drop services to keep your account healthy."],
    ["How fast will my order start?", "Most services start within seconds to a few minutes. Each service card shows its exact average start time and daily speed before you order."],
    ["What is provider failover?", "Kriyava is connected to multiple vetted providers (LuvSMM main, EasySMM backup). If one source is slow or out of stock, we automatically route your order to the next healthy provider."],
    ["Do you offer refills if followers drop?", "Many services include 30-day, 365-day or lifetime refill. The refill window is clearly labelled on every service, and refills can be requested in one click from your dashboard."],
    ["Which payment methods do you accept?", "UPI, credit/debit cards, net banking and wallets via Razorpay — fully secure. Funds are added to your Kriyava wallet after payment verification."],
    ["Can I resell with my own brand?", "Absolutely. The Agency plan gives you a white-label child panel with your own domain, logo, branding and pricing — powered by our API and automated order routing."],
    ["Does the AI assistant really place orders?", "Yes. Kriyava AI is agentic — tell it what you want and it finds the best service, checks your balance, and places the order for you. Try the chat button in the corner."],
    ["What's the minimum deposit?", "You can start with as little as ₹10. There are no monthly minimums on the Starter plan — pay only for the orders you place."],
  ];
  return (
    <section id="faq" className="section-pad">
      <div className="container-x">
        <Reveal>
          <div className="mx-auto mb-12 max-w-[720px] text-center">
            <span className="eyebrow">FAQ</span>
            <h2 className="h-sec mt-3">Questions, answered</h2>
          </div>
        </Reveal>
        <div className="mx-auto max-w-[780px]">
          {qa.map(([q, a], i) => (
            <details key={i} className="group mb-3 overflow-hidden rounded-[14px] border border-[color:var(--color-line)] bg-white open:border-[#dbe3ec] open:shadow-[var(--shadow-sm-soft)]" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-[22px] py-[18px] font-display text-[15.5px] font-bold [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown size={20} className="shrink-0 text-[color:var(--color-muted)] transition-transform group-open:rotate-180" />
              </summary>
              <div className="px-[22px] pb-5 text-[14.5px] leading-[1.7] text-[color:var(--color-muted)]">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Final CTA ---------------- */
export function FinalCta() {
  return (
    <section className="section-pad">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[24px] p-[clamp(32px,5vw,64px)] text-white" style={{ background: "radial-gradient(120% 140% at 50% 0%,#1d4ed8 0%,#2563EB 40%,#0ea5b7 100%)" }}>
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.08) 1px,transparent 1px)",
                backgroundSize: "40px 40px",
                maskImage: "radial-gradient(ellipse 70% 80% at 50% 0%,#000,transparent 70%)",
                WebkitMaskImage: "radial-gradient(ellipse 70% 80% at 50% 0%,#000,transparent 70%)",
              }}
            />
            <div className="relative z-10 grid items-center gap-12 lg:grid-cols-2 text-left">
              <div>
                <h2 className="text-[clamp(26px,3.8vw,44px)] font-black text-white leading-[1.1] tracking-tight">
                  Ready to scale your <br />social media?
                </h2>
                <p className="mt-4 max-w-[46ch] text-[16px] text-white/90 leading-relaxed font-medium">
                  Join 50,000+ creators, agencies and resellers growing faster with Kriyava&apos;s advanced automation platform.
                </p>
                <div className="mt-8 flex flex-wrap gap-3.5">
                  <Link href="/login" className="btn btn-cta btn-lg shadow-xl hover:-translate-y-0.5">
                    Create Free Account
                  </Link>
                  <Link href="/login?redirect=/services" className="btn btn-lg transition-all hover:-translate-y-0.5" style={{ background: "rgba(255,255,255,.12)", color: "#fff", border: "1px solid rgba(255,255,255,.3)" }}>
                    Browse Services
                  </Link>
                </div>
                <p className="mt-4.5 text-[12px] text-white/70 font-semibold">
                  No credit card required · Start from ₹10 · Cancel anytime
                </p>
              </div>

              <div className="relative flex items-center justify-center min-h-[300px]">
                <span className="absolute h-[260px] w-[260px] rounded-full opacity-30 blur-[40px] bg-cyan-300/30 animate-pulse pointer-events-none" />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full max-w-[340px] flex justify-center"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative w-full aspect-square rounded-[24px] overflow-hidden border border-white/20 bg-white/5 backdrop-blur-md shadow-2xl group"
                  >
                    <Image
                      src="/assets/final_cta_growth.png"
                      alt="Social Media Growth Illustration"
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                      sizes="(max-width:768px) 100vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 via-transparent to-transparent pointer-events-none" />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
