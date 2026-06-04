"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Check, TrendingUp, Zap, Star } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Reveal } from "../Reveal";
import { CountUp } from "../CountUp";
import {
  IconInstagram, IconYouTube, IconFacebook, IconTikTok,
  IconTelegram, IconWhatsApp, IconSpotify, IconTwitterX,
} from "../SocialIcon";

// ── Realistic numbers for a growing panel ──────────────────────────────────
const STATS = {
  badge: "1,000+ creators growing with Kriyava",
  customers: 5000,   // 5K+
  orders: 10000,     // 10K+
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-[clamp(28px,5vw,60px)] pb-14 lg:pb-20 bg-white">
      {/* bg — simplified on mobile for performance */}
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden"
        style={{ background: "linear-gradient(135deg,#eef4ff 0%,#f5faff 30%,#ffffff 55%,#ecfdf7 100%)" }}>
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(45% 55% at 80% 8%,rgba(37,99,235,.18),transparent 70%),radial-gradient(45% 55% at 10% 20%,rgba(6,182,212,.14),transparent 70%)" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: "linear-gradient(rgba(51,65,85,.18) 1px,transparent 1px),linear-gradient(90deg,rgba(51,65,85,.18) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        {/* Glow blobs — static, no animation */}
        <span className="absolute -top-40 -right-28 h-[420px] w-[420px] rounded-full opacity-40 blur-[80px] pointer-events-none"
          style={{ background: "radial-gradient(circle,#bfdbfe,transparent 70%)" }} />
        <span className="absolute top-28 -left-40 h-[360px] w-[360px] rounded-full opacity-35 blur-[80px] pointer-events-none"
          style={{ background: "radial-gradient(circle,#a5f3fc,transparent 70%)" }} />
      </div>

      <div className="container-x grid items-center gap-8 lg:gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ── LEFT TEXT ──────────────────────────────────────────────── */}
        <div>
          <Reveal>
            <div className="flex justify-center lg:justify-start">
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-line)] bg-white/80 px-3.5 py-1.5 text-[12px] font-semibold text-[#334155] shadow-sm">
                <span className="h-[6px] w-[6px] rounded-full bg-[color:var(--color-success)] shadow-[0_0_0_3px_rgba(34,197,94,.18)] animate-pulse" />
                🚀 {STATS.badge}
              </span>
            </div>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-5 text-[clamp(26px,4.8vw,54px)] font-black leading-[1.08] text-[color:var(--color-ink)] tracking-tight text-center lg:text-left">
              Grow your social media <br />
              <span className="grad-text">faster than ever</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-4 max-w-[52ch] text-[clamp(13px,1.5vw,17px)] text-[color:var(--color-muted)] font-medium text-center lg:text-left mx-auto lg:mx-0">
              High-quality followers, likes, views and engagement — delivered safely through Kriyava&apos;s multi-provider automation platform with real-time failover.
            </p>
          </Reveal>
          <Reveal delay={0.13}>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start w-full max-w-[320px] sm:max-w-none mx-auto lg:mx-0">
              <Link href="/login" className="btn btn-cta w-full sm:w-auto !px-5 !py-2.5 !text-[13px] rounded-xl">
                Start Growing Now <ArrowRight size={14} />
              </Link>
              <Link href="/login?redirect=/services" className="btn w-full sm:w-auto !px-5 !py-2.5 !text-[13px] rounded-xl bg-white border border-[color:var(--color-line)] text-[color:var(--color-ink)] hover:bg-[color:var(--color-surface)] transition-all">
                View Services
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.18}>
            <div className="mt-7 flex flex-row flex-nowrap items-center justify-center lg:justify-start gap-4 sm:gap-6">
              <div className="flex flex-col gap-0.5 text-center lg:text-left items-center lg:items-start">
                <span className="text-[13px] tracking-[2px] text-[color:var(--color-cta)]">★★★★★</span>
                <b className="font-display text-[14px] font-extrabold text-[color:var(--color-ink)]">
                  4.9/5 <span className="text-[10px] font-semibold text-[color:var(--color-muted)]">Rating</span>
                </b>
              </div>
              <div className="h-[28px] w-px bg-[color:var(--color-line)]" />
              <div className="flex flex-col gap-0.5 text-center lg:text-left items-center lg:items-start">
                <b className="font-display text-[14px] font-extrabold text-[color:var(--color-ink)]">
                  <CountUp to={STATS.customers} suffix="K+" divide={1000} />
                </b>
                <span className="text-[10px] font-bold text-[color:var(--color-muted)] uppercase tracking-wide">Customers</span>
              </div>
              <div className="h-[28px] w-px bg-[color:var(--color-line)]" />
              <div className="flex flex-col gap-0.5 text-center lg:text-left items-center lg:items-start">
                <b className="font-display text-[14px] font-extrabold text-[color:var(--color-ink)]">
                  <CountUp to={STATS.orders} suffix="K+" divide={1000} />
                </b>
                <span className="text-[10px] font-bold text-[color:var(--color-muted)] uppercase tracking-wide">Orders</span>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ── RIGHT VISUAL ───────────────────────────────────────────── */}
        {/* Mobile: lightweight platform grid — NO continuous animations */}
        <Reveal delay={0.15} className="lg:hidden">
          <MobileHeroVisual />
        </Reveal>
        {/* Desktop only: full 3D orbit (expensive, fine on desktop GPU) */}
        <Reveal delay={0.18} className="hidden lg:block">
          <DashboardMock />
        </Reveal>
      </div>
    </section>
  );
}

/* ── Mobile hero visual — static, zero continuous animation ─────────────── */
function MobileHeroVisual() {
  const platforms = [
    { icon: <IconInstagram size={28} />, name: "Instagram" },
    { icon: <IconYouTube size={28} />, name: "YouTube" },
    { icon: <IconTikTok size={28} />, name: "TikTok" },
    { icon: <IconFacebook size={28} />, name: "Facebook" },
    { icon: <IconTelegram size={28} />, name: "Telegram" },
    { icon: <IconWhatsApp size={28} />, name: "WhatsApp" },
    { icon: <IconSpotify size={28} />, name: "Spotify" },
    { icon: <IconTwitterX size={28} />, name: "Twitter/X" },
  ];
  return (
    <div className="rounded-2xl border border-[color:var(--color-line)] bg-white/80 p-5 shadow-[var(--shadow-md-soft)]">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { icon: <Star size={14} className="text-amber-400" />, val: "4.9/5", label: "Rating" },
          { icon: <Zap size={14} className="text-blue-500" />, val: "5K+", label: "Customers" },
          { icon: <Check size={14} className="text-emerald-500" />, val: "10K+", label: "Orders" },
        ].map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-1 rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-3 text-center">
            {s.icon}
            <b className="font-display text-[15px] font-black text-[color:var(--color-ink)]">{s.val}</b>
            <span className="text-[9px] font-bold text-[color:var(--color-muted)] uppercase tracking-wide">{s.label}</span>
          </div>
        ))}
      </div>
      {/* Platform icons grid */}
      <div className="grid grid-cols-4 gap-2.5">
        {platforms.map((p) => (
          <div key={p.name} className="flex flex-col items-center gap-1.5 rounded-xl border border-[color:var(--color-line)] bg-white p-2.5">
            {p.icon}
            <span className="text-[9px] font-bold text-[color:var(--color-ink)] leading-none text-center">{p.name}</span>
          </div>
        ))}
      </div>
      {/* Live indicator */}
      <div className="mt-4 flex items-center justify-center gap-2 text-[11px] font-semibold text-[color:var(--color-muted)]">
        <span className="h-[6px] w-[6px] rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(34,197,94,.2)] animate-pulse" />
        2346 services live · Auto-routed
      </div>
    </div>
  );
}

/* ── Desktop 3D orbit mock (unchanged, desktop only) ───────────────────── */
function DashboardMock() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-150, 150], [15, -15]);
  const rotateY = useTransform(x, [-150, 150], [-15, 15]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  }
  function handleMouseLeave() { x.set(0); y.set(0); }

  const outerNodes = [
    { component: SpotifyIcon, angle: 0 },
    { component: TikTokIcon, angle: 60 },
    { component: FacebookIcon, angle: 120 },
    { component: DiscordIcon, angle: 180 },
    { component: LoveIcon, angle: 240 },
    { component: LikeIcon, angle: 300 },
  ];
  const innerNodes = [
    { component: InstagramIcon, angle: 0 },
    { component: TelegramIcon, angle: 72 },
    { component: YouTubeIcon, angle: 144 },
    { component: ViewIcon, angle: 216 },
    { component: ShareIcon, angle: 288 },
  ];

  return (
    <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1200 }}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center min-h-[460px] w-full max-w-[500px] mx-auto cursor-pointer select-none">
      <div className="absolute inset-0 flex items-center justify-center -z-10" style={{ transform: "translateZ(-40px)" }}>
        <span className="absolute h-[320px] w-[320px] rounded-full opacity-35 blur-[40px] bg-blue-400/20 pointer-events-none" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          className="absolute w-[360px] h-[360px] rounded-full border border-slate-200/40 border-dashed">
          {outerNodes.map((n, i) => {
            const Icon = n.component;
            return (
              <div key={i} className="absolute" style={{ transform: `rotate(${n.angle}deg) translate(180px)` }}>
                <motion.div initial={{ rotate: -n.angle }} animate={{ rotate: -n.angle - 360 }} transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
                  className="p-1 rounded-xl bg-white shadow-md border border-slate-100/80">
                  <Icon />
                </motion.div>
              </div>
            );
          })}
        </motion.div>
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="absolute w-[240px] h-[240px] rounded-full border border-slate-200/50 border-dashed">
          {innerNodes.map((n, i) => {
            const Icon = n.component;
            return (
              <div key={i} className="absolute" style={{ transform: `rotate(${n.angle}deg) translate(120px)` }}>
                <motion.div initial={{ rotate: -n.angle }} animate={{ rotate: -n.angle + 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                  className="p-1 rounded-xl bg-white shadow-md border border-slate-100/80">
                  <Icon />
                </motion.div>
              </div>
            );
          })}
        </motion.div>
      </div>

      <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-28 h-28 rounded-full border border-slate-200/80 bg-white/90 p-4 shadow-[var(--shadow-lg-soft)] flex items-center justify-center"
        style={{ transform: "translateZ(30px)" }}>
        <Image src="/assets/logo-c-orbit.png" alt="Kriyava" width={80} height={80} className="object-contain pointer-events-none" priority />
        <span className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping opacity-50 pointer-events-none" />
      </motion.div>

      <motion.div style={{ translateZ: 80 }} animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-0 top-[12%] flex items-center gap-2.5 rounded-[12px] border border-[color:var(--color-line)] bg-white/90 px-3.5 py-3 text-[11px] font-bold shadow-[var(--shadow-md-soft)]">
        <span className="grid h-[28px] w-[28px] place-items-center rounded-[7px] icontint-green text-white"><Check size={13} /></span>
        <div>
          <span className="text-[color:var(--color-ink)]">Order Completed</span>
          <small className="block text-[9px] font-medium text-[color:var(--color-muted)] mt-0.5">+10,000 views • 2s ago</small>
        </div>
      </motion.div>

      <motion.div style={{ translateZ: 100 }} animate={{ y: [0, 10, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        className="absolute left-0 bottom-[14%] flex items-center gap-2.5 rounded-[12px] border border-[color:var(--color-line)] bg-white/90 px-3.5 py-3 text-[11px] font-bold shadow-[var(--shadow-md-soft)]">
        <span className="grid h-[28px] w-[28px] place-items-center rounded-[7px] icontint-violet text-white"><TrendingUp size={13} /></span>
        <div>
          <span className="text-[color:var(--color-ink)]">+1,250 Followers</span>
          <small className="block text-[9px] font-medium text-[color:var(--color-muted)] mt-0.5">Instagram • active now</small>
        </div>
      </motion.div>

      <motion.div style={{ translateZ: 60 }} animate={{ y: [-5, 5, -5] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        className="absolute left-[8%] top-[10%] flex flex-col rounded-xl border border-[color:var(--color-line)] bg-white/90 p-3 shadow-[var(--shadow-sm-soft)]">
        <div className="text-[9px] font-bold text-[color:var(--color-muted)] uppercase tracking-wider">Live Orders</div>
        <div className="mt-1 font-display text-[16px] font-black text-[color:var(--color-ink)]">10,480</div>
        <div className="mt-0.5 text-[9px] font-extrabold text-[color:var(--color-success)] flex items-center gap-0.5">▲ 18.2%</div>
      </motion.div>
    </motion.div>
  );
}

/* ── SVG icon components (desktop orbit only) ────────────────────────────── */
function InstagramIcon() {
  return <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm" style={{ background: "radial-gradient(circle at 30% 107%,#fdf497 0%,#fdf497 5%,#fd5949 45%,#d6249f 60%,#285AEB 90%)" }}><svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></div>;
}
function YouTubeIcon() {
  return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FF0000] shadow-sm"><svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6a3 3 0 0 0-2.1 2.1C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 16 24 12 24 12s0-4-.5-5.8zM9.5 15.6V8.4L15.8 12l-6.3 3.6z"/></svg></div>;
}
function FacebookIcon() {
  return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1877F2] shadow-sm"><svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M24 12.07C24 5.4 18.6 0 12 0S0 5.4 0 12.07C0 18.1 4.4 23.1 10.1 24v-8.4H7.1v-3.5h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3H15.8c-1.5 0-2 .9-2 1.9v2.3h3.3l-.5 3.5h-2.8V24C19.6 23.1 24 18.1 24 12.07z"/></svg></div>;
}
function TikTokIcon() {
  return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#010101] shadow-sm"><svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M12.5 0c1.3 0 2.6 0 3.9-.02.08 1.53.63 3.02 1.63 4.17 1.12 1.22 2.69 1.95 4.32 2.11v3.96c-1.78-.17-3.52-.89-4.88-2.08v7.52c-.04 2.13-.88 4.22-2.48 5.61-1.8 1.56-4.37 2.15-6.69 1.51C5.86 22.08 3.78 20.15 3.12 17.7c-.82-3.06.63-6.49 3.49-7.79 1.38-.63 2.94-.79 4.42-.48V13.8c-.89-.22-1.86-.15-2.68.28-.96.51-1.63 1.52-1.77 2.61-.2 1.62.77 3.23 2.3 3.65 1.25.34 2.67-.13 3.32-1.2.33-.55.43-1.2.42-1.84V0z"/></svg></div>;
}
function TelegramIcon() {
  return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#2EA6DA] shadow-sm"><svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.6 8.2l-1.9 8.9c-.14.63-.52.79-1.05.49l-2.88-2.12-1.39 1.33c-.15.15-.28.28-.58.28l.2-2.92 5.32-4.81c.23-.2-.05-.32-.36-.11L8.7 12.4l-2.83-.88c-.62-.19-.63-.62.13-.92l11.08-4.27c.52-.19.97.11.76.87z"/></svg></div>;
}
function SpotifyIcon() {
  return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1ED760] shadow-sm"><svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.5 17.3c-.22.37-.7.49-1.07.26-3-1.84-6.8-2.25-11.25-1.23-.42.1-.83-.17-.93-.59-.1-.42.17-.83.59-.93 4.89-1.12 9.06-.64 12.44 1.43.37.22.49.7.26 1.07zm1.47-3.26c-.28.46-.88.6-1.33.32-3.44-2.12-8.69-2.73-12.75-1.5-.51.16-1.05-.14-1.21-.65-.15-.51.14-1.05.65-1.21 4.64-1.41 10.42-.72 14.32 1.67.45.28.6.88.32 1.33zm.13-3.4C15.2 8.24 8.8 8.03 5.1 9.16c-.6.18-1.23-.16-1.41-.76-.18-.6.16-1.23.76-1.41 4.25-1.29 11.34-1.04 16.03 1.74.53.32.71 1.01.39 1.54-.31.53-1.01.71-1.54.39z"/></svg></div>;
}
function DiscordIcon() {
  return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#5865F2] shadow-sm"><svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 2.9a.07.07 0 0 0-.08.04c-.21.38-.44.86-.61 1.25a18.3 18.3 0 0 0-5.49 0A12.6 12.6 0 0 0 8.6 2.9a.08.08 0 0 0-.08.04A19.7 19.7 0 0 0 3.7 4.4a.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 6 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-2a.08.08 0 0 0-.04-.1 13.1 13.1 0 0 1-1.87-.9.08.08 0 0 1-.01-.13c.13-.09.25-.19.37-.29a.08.08 0 0 1 .08-.01c3.92 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01c.12.1.25.2.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.65-1.87.9a.08.08 0 0 0-.04.11c.36.7.77 1.36 1.22 1.99a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .03-.05c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8 15.3c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.96-2.41 2.16-2.41 1.21 0 2.18 1.1 2.16 2.41 0 1.34-.96 2.42-2.16 2.42zm8 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.41 2.16-2.41 1.21 0 2.18 1.1 2.16 2.41 0 1.34-.94 2.42-2.16 2.42z"/></svg></div>;
}
function LoveIcon() {
  return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 shadow-sm"><svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg></div>;
}
function LikeIcon() {
  return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm"><svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M2 21h3V8H2v13zm20-11.83C22 8.08 21.1 7.2 20 7.2h-5.69l.86-4.14.03-.3c0-.38-.16-.74-.41-1L13.8 1 7.41 7.4C7.05 7.76 6.8 8.26 6.8 8.8v10.2c0 1.1.9 2 2 2h8.38c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.02-.01z"/></svg></div>;
}
function ViewIcon() {
  return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-rose-500 to-red-600 shadow-sm"><svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg></div>;
}
function ShareIcon() {
  return <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-400 to-teal-500 shadow-sm"><svg className="w-4 h-4 text-white fill-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg></div>;
}
