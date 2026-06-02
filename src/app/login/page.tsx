"use client";
import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Lock, Sparkles, AlertCircle, Eye, EyeOff, RefreshCw } from "lucide-react";
import { loadAccount, saveAccount } from "@/lib/account";
import { api, setToken, ApiError } from "@/lib/api";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle preset signup mode (?mode=up)
  useEffect(() => {
    if (searchParams.get("mode") === "up") {
      setMode("up");
    }
  }, [searchParams]);

  // Hydrate the localStorage account from an API user, so the existing
  // dashboard (which reads localStorage) shows real backend data.
  const hydrateFromApi = (u: { name: string; email: string; balance: number; spent: number }) => {
    const acc = loadAccount();
    acc.name = u.name;
    acc.email = u.email;
    acc.balance = u.balance;
    acc.spent = u.spent;
    acc._seeded = true;
    saveAccount(acc);
  };

  // Demo fallback if the API is unreachable — keeps the app usable offline.
  const demoLogin = (nameVal?: string, emailVal?: string) => {
    const acc = loadAccount();
    acc.name = nameVal || name || acc.name || "Creator";
    acc.email = emailVal || email || acc.email || "creator@kriyava.com";
    if (acc.balance === 0 && !acc._seeded) {
      acc.balance = 500;
      acc._seeded = true;
    }
    saveAccount(acc);
  };

  // Social sign-up/sign-in. Real OAuth needs a Google/Telegram app; until that's
  // configured we create a REAL persistent backend account tied to a stable
  // per-browser identity, so the user genuinely stays logged in across sessions.
  const socialAuth = async (provider: "google" | "telegram", displayName: string) => {
    setError("");
    setLoading(true);
    // stable per-device id so the same browser maps to the same account
    let did = localStorage.getItem("kriyava_device_id");
    if (!did) {
      did = Math.random().toString(36).slice(2, 10);
      localStorage.setItem("kriyava_device_id", did);
    }
    const pseudoEmail = `${provider}.${did}@kriyava.social`;
    const pseudoPass = `${provider}-${did}-kriyava`;
    try {
      // try login first (returning user), else register (new user)
      let res;
      try {
        res = await api.login(pseudoEmail, pseudoPass);
      } catch {
        res = await api.register(pseudoEmail, displayName, pseudoPass);
      }
      setToken(res.token);
      hydrateFromApi(res.user);
      router.push("/dashboard");
    } catch {
      demoLogin(displayName, pseudoEmail);
      router.push("/dashboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "up" && name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res =
        mode === "up"
          ? await api.register(email.trim(), name.trim(), password)
          : await api.login(email.trim(), password);
      setToken(res.token);
      hydrateFromApi(res.user);
      router.push("/dashboard");
    } catch (err) {
      // If it's a real auth error (bad credentials / email taken), show it.
      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        setError(err.message);
        setLoading(false);
        return;
      }
      // Network/server issue → fall back to demo mode so the app still works.
      demoLogin(mode === "up" ? name : undefined, email);
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex">
      {/* LEFT PANEL: BRAND SHOWCASE (DESKTOP) */}
      <aside className="hidden lg:flex w-[48%] relative overflow-hidden p-12 flex-col justify-between bg-gradient-to-br from-indigo-950 via-blue-950 to-cyan-950">
        {/* grid overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(circle at 0% 0%,#000 30%,transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at 0% 0%,#000 30%,transparent 70%)",
          }}
        />

        {/* glow highlights */}
        <span className="absolute -top-20 -right-20 h-[380px] w-[380px] rounded-full opacity-30 blur-[90px] bg-purple-600" />
        <span className="absolute -bottom-20 -left-20 h-[320px] w-[320px] rounded-full opacity-20 blur-[80px] bg-cyan-500" />

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <span className="h-9 w-9 overflow-hidden rounded-[10px] bg-white/10 p-1.5 flex items-center justify-center">
            <Image src="/assets/logo-128.png" alt="" width={28} height={28} />
          </span>
          <div className="flex flex-col text-left">
            <span className="font-display font-black text-[18px] tracking-tight leading-none">Kriyava</span>
            <span className="text-[8.5px] font-extrabold text-blue-400 uppercase tracking-[0.18em] mt-0.5">SMM Panel</span>
          </div>
        </Link>

        {/* BODY INTRO */}
        <div className="relative z-10 max-w-lg my-auto text-left">
          <h2 className="font-display text-[44px] font-extrabold leading-[1.08] tracking-tight">
            Grow faster.<br />Pay less.<br />Scale smarter.
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-slate-300 max-w-[42ch]">
            Join 50,000+ creators, marketers, and resellers using Kriyava&apos;s automatic multi-provider routing engine to scale on every platform.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              "Wholesale rates with 300% reseller margins",
              "Agentic AI chatbot that handles orders for you",
              "LuvSMM + EasySMM failover protection — zero downtime",
            ].map((feat, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-200 font-bold text-sm">
                <span className="grid h-[26px] w-[26px] place-items-center rounded-lg bg-white/10 shrink-0 text-emerald-400">
                  <Check size={14} strokeWidth={3} />
                </span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* FOOTER STATS */}
        <div className="relative z-10 flex gap-10">
          {[
            ["50K+", "Customers"],
            ["1M+", "Orders Placed"],
            ["99.9%", "Success Rate"],
          ].map(([val, label]) => (
            <div key={label} className="text-left">
              <b className="font-display text-2xl font-black block leading-none">{val}</b>
              <span className="text-[11.5px] text-slate-400 font-bold tracking-wide uppercase mt-1 block">{label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* RIGHT PANEL: INTERACTIVE FORM */}
      <main className="flex-1 flex flex-col justify-center px-6 py-12 md:px-16 lg:px-24 xl:px-32 max-w-2xl mx-auto w-full relative">
        <div className="absolute top-8 left-6 md:left-12 lg:left-16 flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white font-bold text-xs">
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>

        <div className="w-full">
          {/* Logo on mobile/tablet */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="h-9 w-9 overflow-hidden rounded-[10px] bg-blue-600/20 p-1.5 flex items-center justify-center">
                <Image src="/assets/logo-128.png" alt="" width={28} height={28} />
              </span>
              <div className="flex flex-col text-left">
                <span className="font-display font-black text-[18px] tracking-tight leading-none">Kriyava</span>
                <span className="text-[8.5px] font-extrabold text-blue-400 uppercase tracking-[0.18em] mt-0.5">SMM Panel</span>
              </div>
            </Link>
          </div>

          {/* SLIDING FORM TABS */}
          <div className="flex rounded-xl border border-white/5 bg-white/[0.02] p-1.5 mb-8">
            <button
              onClick={() => setMode("in")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all ${
                mode === "in" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Sign in
            </button>
            <button
              onClick={() => setMode("up")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-extrabold transition-all ${
                mode === "up" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
              }`}
            >
              Create account
            </button>
          </div>

          {/* HEADINGS */}
          <div className="text-left mb-6">
            <h1 className="text-2xl md:text-3xl font-black">
              {mode === "in" ? "Welcome back" : "Create your free account"}
            </h1>
            <p className="text-sm text-slate-400 mt-1.5">
              {mode === "in"
                ? "Sign in to manage your orders, catalog, and wallet balance."
                : "Start scaling your brand in under 30 seconds — no credit card needed."}
            </p>
          </div>

          {/* SOCIAL AUTH BUTTONS */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => socialAuth("google", "Google User")}
              disabled={loading}
              className="flex items-center justify-center gap-2 border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] py-3 px-4 rounded-xl text-xs font-extrabold transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" className="mr-0.5">
                <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-7.9Z" />
                <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23Z" />
                <path fill="#FBBC05" d="M6 14.4a6.6 6.6 0 0 1 0-4.2V7.4H2.3a11 11 0 0 0 0 9.8L6 14.4Z" />
                <path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.4L6 10.2c.9-2.6 3.2-4.8 6-4.8Z" />
              </svg>
              Google
            </button>
            <button
              onClick={() => socialAuth("telegram", "Telegram User")}
              disabled={loading}
              className="flex items-center justify-center gap-2 border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] py-3 px-4 rounded-xl text-xs font-extrabold transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="#229ED9" className="mr-0.5">
                <path d="M21.94 4.5 18.6 20.2c-.25 1.1-.92 1.38-1.86.86l-5.14-3.79-2.48 2.39c-.27.27-.5.5-1.03.5l.37-5.24L18.1 6.2c.41-.37-.09-.57-.64-.2L5.7 13.62.63 12.04c-1.1-.34-1.12-1.1.23-1.63L20.5 2.9c.92-.34 1.72.22 1.44 1.6Z" />
              </svg>
              Telegram
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            <span className="absolute inset-x-0 h-px bg-white/5" />
            <span className="relative bg-[#090D16] px-3.5">or continue with email</span>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-400 font-medium">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {mode === "up" && (
              <div className="flex flex-col">
                <label className="text-xs font-bold text-slate-400 mb-1.5" htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3 text-sm placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white/[0.02]"
                />
              </div>
            )}

            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 mb-1.5" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3 text-sm placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white/[0.02]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-slate-400 mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3 text-sm placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:bg-white/[0.02]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  aria-label="Toggle password view"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === "in" && (
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-white/5 bg-white/[0.01]"
                  />
                  Remember me
                </label>
                <a href="#" className="text-blue-500 hover:underline">Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-cta btn-block btn-lg mt-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Configuring workspace...</span>
                </>
              ) : (
                <span>{mode === "in" ? "Sign in to dashboard" : "Create free account"}</span>
              )}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 mt-6 leading-relaxed">
            By continuing, you agree to Kriyava&apos;s <a href="#" className="text-blue-500 hover:underline">Terms of Service</a> & <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
          </p>

          <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-400 mt-6">
            <Lock size={12} strokeWidth={2.5} />
            <span>Secured with 256-bit encryption</span>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#090D16] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-blue-500" size={32} />
          <span className="text-xs font-bold text-slate-400">Loading Kriyava Gateway...</span>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
