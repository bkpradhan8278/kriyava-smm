"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ChevronDown, Star, Search } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { useMarket } from "@/lib/useServices";
import { fmtINR, saveAccount } from "@/lib/account";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { MarketService } from "@/lib/types";

// ── Platform icons ────────────────────────────────────────────────────────────
const PLATFORM_ICON: Record<string, string> = {
  Instagram: "📸", YouTube: "🎥", TikTok: "🎵", Telegram: "✈️",
  Facebook: "📘", Spotify: "🎧", X: "✖️", WhatsApp: "💬",
  LinkedIn: "💼", Pinterest: "📌", Snapchat: "👻", Reddit: "🔴",
  Website: "🌐", Other: "⚡",
};

function platformIconFor(text: string): string {
  const t = text.toLowerCase();
  if (t.includes("instagram")) return "📸";
  if (t.includes("youtube")) return "🎥";
  if (t.includes("tiktok") || t.includes("tik tok")) return "🎵";
  if (t.includes("telegram")) return "✈️";
  if (t.includes("facebook") || t.includes("fb")) return "📘";
  if (t.includes("spotify")) return "🎧";
  if (t.includes("twitter") || t.includes(" x ") || t.match(/\bx\b/)) return "✖️";
  if (t.includes("whatsapp")) return "💬";
  if (t.includes("linkedin")) return "💼";
  if (t.includes("pinterest")) return "📌";
  if (t.includes("snapchat")) return "👻";
  if (t.includes("reddit")) return "🔴";
  if (t.includes("website") || t.includes("traffic")) return "🌐";
  return "⚡";
}

// Short service ID badge from full id like "easy:641" → "641"
function shortId(id: string): string {
  const parts = id.split(":");
  return parts[parts.length - 1];
}

// Badge color by provider key
function badgeColor(id: string): string {
  if (id.startsWith("easy:")) return "bg-blue-600 text-white";
  if (id.startsWith("luv:"))  return "bg-rose-600 text-white";
  if (id.startsWith("fine:")) return "bg-emerald-600 text-white";
  return "bg-slate-600 text-white";
}

export default function NewOrderPage() {
  const { account, refresh, sync } = useAccount();
  const { services, loading } = useMarket();

  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [svcSearch, setSvcSearch] = useState("");
  const [link, setLink] = useState("");
  const [qty, setQty] = useState(1000);
  const [routeMsg, setRouteMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [placing, setPlacing] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // ── Derived ────────────────────────────────────────────────────────────────
  const platforms = useMemo(() => Array.from(new Set(services.map((s) => s.platform))).sort(), [services]);

  const platformServices = useMemo(
    () => services.filter((s) => s.platform === selectedPlatform).sort((a, b) => a.price - b.price),
    [services, selectedPlatform],
  );

  const categories = useMemo(
    () => Array.from(new Set(platformServices.map((s) => s.category))).sort(),
    [platformServices],
  );

  const categoryServices = useMemo(() => {
    let list = selectedCategory ? platformServices.filter((s) => s.category === selectedCategory) : platformServices;
    if (svcSearch.trim()) {
      const q = svcSearch.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [platformServices, selectedCategory, svcSearch]);

  const activeService = useMemo(() => services.find((s) => s.id === selectedServiceId), [services, selectedServiceId]);

  const charge = useMemo(
    () => (activeService ? +((activeService.price * qty) / 1000).toFixed(2) : 0),
    [activeService, qty],
  );

  // Auto-select first category
  useEffect(() => { setSelectedCategory(""); setSelectedServiceId(""); setSvcSearch(""); }, [selectedPlatform]);
  useEffect(() => { if (categories.length > 0 && !selectedCategory) setSelectedCategory(categories[0]); }, [categories, selectedCategory]);
  useEffect(() => { if (categoryServices.length > 0) setSelectedServiceId(categoryServices[0].id); else setSelectedServiceId(""); }, [selectedCategory]);

  // Scroll selected service into view
  useEffect(() => {
    if (!selectedServiceId || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-id="${selectedServiceId}"]`) as HTMLElement | null;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedServiceId]);

  const handlePlaceOrder = async () => {
    if (!activeService || !link.trim()) { showToast("❌ Paste your target link first!"); return; }
    if (qty < (activeService.min || 10)) { showToast(`❌ Minimum is ${(activeService.min || 10).toLocaleString()}`); return; }
    if (account.balance < charge) { showToast(`❌ Need ${fmtINR(charge)} — add funds first`); return; }
    setPlacing(true);
    try {
      const order = await api.createOrder(activeService.id, qty, link);
      setRouteMsg(`✅ Placed via ${order.provider} — ID …${order.id.slice(-8)}`);
      await sync();
      showToast(`✅ Order placed! ${fmtINR(charge)} deducted.`);
      setLink("");
    } catch (err) { showToast(err instanceof Error ? err.message : "Order failed."); }
    finally { setPlacing(false); }
  };

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 3000); };

  return (
    <DashboardShell>
      {account.balance < 50 && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs font-bold text-amber-400">
          <AlertTriangle size={14} className="shrink-0" />
          Wallet balance low ({fmtINR(account.balance)}). <Link href="/add-funds" className="underline ml-1">Add funds →</Link>
        </div>
      )}

      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-black text-white">New Order</h1>
        <p className="text-sm text-slate-400 mt-1">Pick a service, paste your link, and grow. Auto-routed across providers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
        {/* ── LEFT: ORDER FORM ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Place an Order</h3>
            <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md">
              {categoryServices.length} services
            </span>
          </div>

          {/* STEP 1 — Platform chips */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">1 · Platform</label>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {platforms.map((p) => (
                <button key={p} onClick={() => setSelectedPlatform(p)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedPlatform === p
                      ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,.3)]"
                      : "bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white"
                  }`}>
                  <span>{PLATFORM_ICON[p] || "⚡"}</span><span>{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2 — Category dropdown with platform icons */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">2 · Category</label>
            <div className="relative">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#090D16] px-4 py-3 text-sm text-white outline-none focus:border-blue-500 appearance-none cursor-pointer">
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#090D16] py-1">
                    {platformIconFor(cat + " " + selectedPlatform)} {cat}
                  </option>
                ))}
                {categories.length === 0 && <option>No categories — select a platform</option>}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* STEP 3 — Service list (scrollable, ID badges, like reference panels) */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">3 · Service</label>

            {/* Search within category */}
            <div className="relative mb-2">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={svcSearch} onChange={(e) => setSvcSearch(e.target.value)}
                placeholder="Search in this category…"
                className="w-full rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2 pl-8 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500" />
            </div>

            {/* Scrollable service list */}
            <div ref={listRef} className="rounded-xl border border-white/10 bg-[#090D16] overflow-y-auto" style={{ maxHeight: 260 }}>
              {loading && <div className="py-6 text-center text-slate-500 text-xs">Loading services…</div>}
              {!loading && categoryServices.length === 0 && (
                <div className="py-6 text-center text-slate-500 text-xs">No services found</div>
              )}
              {categoryServices.map((s: MarketService) => {
                const active = s.id === selectedServiceId;
                return (
                  <button key={s.id} data-id={s.id} type="button" onClick={() => setSelectedServiceId(s.id)}
                    className={`w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left transition-colors border-b border-white/[0.04] last:border-0 ${
                      active ? "bg-blue-600/15 border-l-2 border-l-blue-500" : "hover:bg-white/[0.03]"
                    }`}>
                    {/* Service ID badge */}
                    <span className={`shrink-0 mt-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-black font-mono ${badgeColor(s.id)}`}>
                      {shortId(s.id)}
                    </span>
                    {/* Name + price */}
                    <div className="min-w-0 flex-1">
                      <div className={`text-[11px] font-bold leading-snug ${active ? "text-white" : "text-slate-200"}`}>
                        {s.name}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="text-emerald-400 font-black">{fmtINR(s.price)}/1K</span>
                        <span>·</span>
                        <span>{s.speed}</span>
                        {s.refill === "Refill available" && <><span>·</span><span className="text-blue-400">♻ Refill</span></>}
                      </div>
                    </div>
                    {/* Margin badge */}
                    <span className="shrink-0 text-[9px] font-black text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded mt-0.5">
                      +{s.margin_pct}%
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected service detail */}
          {activeService && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Service Info</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={10} className={i < activeService.quality ? "text-amber-400 fill-amber-400" : "text-slate-700"} />
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                {[
                  { l: "Speed", v: activeService.speed },
                  { l: "Refill", v: activeService.refill },
                  { l: "Min Order", v: (activeService.min || 1).toLocaleString() },
                  { l: "Max Order", v: activeService.max ? activeService.max.toLocaleString() : "∞" },
                  { l: "Your Price", v: `${fmtINR(activeService.price)}/1K` },
                  { l: "Margin", v: `${activeService.margin_pct}%` },
                ].map((r) => (
                  <div key={r.l} className="flex items-center justify-between border-b border-white/5 pb-1">
                    <span className="text-slate-500 font-bold">{r.l}</span>
                    <span className="text-white font-bold">{r.v}</span>
                  </div>
                ))}
              </div>
              {routeMsg && <p className="text-[10px] font-mono text-blue-400 bg-blue-500/5 rounded-lg px-3 py-1.5 mt-1">{routeMsg}</p>}
            </div>
          )}

          {/* STEP 4 — Link */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">4 · Target Link / Username</label>
            <input type="text" placeholder="https://instagram.com/yourprofile or @username"
              value={link} onChange={(e) => setLink(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500" />
            <p className="text-[10px] text-slate-600 mt-1">Public link or username only. Never share passwords.</p>
          </div>

          {/* STEP 5 — Quantity */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">
              5 · Quantity
              {activeService && <span className="text-slate-600 ml-1 normal-case font-medium">(min {(activeService.min||1).toLocaleString()} · max {activeService.max ? activeService.max.toLocaleString() : "∞"})</span>}
            </label>
            <input type="number" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5 text-sm text-white outline-none focus:border-blue-500" />
          </div>

          <button onClick={() => {
            if (!activeService) return;
            const a = { ...account }; a.favorites = a.favorites || [];
            if (!a.favorites.includes(activeService.id)) { a.favorites.push(activeService.id); saveAccount(a); refresh(); showToast("⭐ Saved to favorites"); }
            else showToast("Already in favorites");
          }} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-400 transition-colors">
            <Star size={12} /> Save to favorites
          </button>

          <div className="flex gap-2.5 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3.5 text-[11px] text-amber-400/80">
            <AlertTriangle size={13} className="shrink-0 mt-0.5" />
            Don't place a second order on the same link before the first completes. Test with small quantity first.
          </div>
        </div>

        {/* ── RIGHT: ORDER SUMMARY ─────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 sticky top-6 space-y-4">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-white/5 pb-4">Order Summary</h3>

          {activeService ? (
            <div className="space-y-2.5 text-xs">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 space-y-1.5">
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wide">Selected Service</p>
                <div className="flex items-start gap-2">
                  <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black font-mono ${badgeColor(activeService.id)}`}>
                    {shortId(activeService.id)}
                  </span>
                  <p className="text-white font-bold text-[11px] leading-snug">{activeService.name}</p>
                </div>
              </div>

              {[
                { l: "Platform", v: `${PLATFORM_ICON[activeService.platform] || "⚡"} ${activeService.platform}` },
                { l: "Rate / 1K", v: fmtINR(activeService.price) },
                { l: "Quantity", v: qty.toLocaleString() },
                { l: "Margin", v: `${activeService.margin_pct}%` },
                { l: "Speed", v: activeService.speed },
              ].map((r) => (
                <div key={r.l} className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-slate-400 font-bold">{r.l}</span>
                  <span className="text-white font-bold">{r.v}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-xs py-4">Select a service from the list.</p>
          )}

          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <span className="text-slate-400 text-sm font-bold">Total Charge</span>
            <span className="text-2xl font-black text-blue-400">{fmtINR(charge)}</span>
          </div>

          <button onClick={() => void handlePlaceOrder()}
            disabled={loading || !activeService || placing || !link.trim()}
            className="btn btn-cta btn-block btn-lg disabled:opacity-50">
            {placing ? "Placing…" : "Place Order"}
          </button>

          <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-1">
            <span>Wallet</span>
            <span className={account.balance < charge ? "text-rose-400 font-black" : "text-emerald-400 font-black"}>
              {fmtINR(account.balance)}
            </span>
          </div>
          <Link href="/add-funds" className="btn btn-ghost btn-block !text-xs !py-2.5">+ Top-up Wallet</Link>
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-24 left-4 right-4 sm:left-6 sm:right-auto sm:w-80 z-55 rounded-xl border border-white/10 bg-[#0D1321]/95 px-4 py-3 shadow-2xl flex items-center gap-2.5 text-xs font-black border-l-4 border-l-emerald-500">
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </DashboardShell>
  );
}
