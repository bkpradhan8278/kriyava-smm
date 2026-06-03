"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Shield, AlertTriangle, CheckCircle2, ChevronDown, Star } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { useMarket } from "@/lib/useServices";
import { fmtINR, saveAccount } from "@/lib/account";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { MarketService } from "@/lib/types";

const PLATFORM_ICONS: Record<string, string> = {
  Instagram: "📸", YouTube: "🎥", TikTok: "🎵", Telegram: "✈️",
  Facebook: "📘", Spotify: "🎧", X: "✖️", Website: "🌐", Other: "⚡",
};

export default function NewOrderPage() {
  const { account, refresh, sync } = useAccount();
  const { services, loading } = useMarket();

  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [link, setLink] = useState("");
  const [qty, setQty] = useState(1000);
  const [routeMsg, setRouteMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [placing, setPlacing] = useState(false);

  // Derived data
  const platforms = useMemo(() => {
    const set = new Set(services.map((s) => s.platform));
    return Array.from(set).sort();
  }, [services]);

  const platformServices = useMemo(
    () => services.filter((s) => s.platform === selectedPlatform).sort((a, b) => a.price - b.price),
    [services, selectedPlatform]
  );

  const categories = useMemo(() => {
    const set = new Set(platformServices.map((s) => s.category));
    return Array.from(set).sort();
  }, [platformServices]);

  const categoryServices = useMemo(
    () => (selectedCategory ? platformServices.filter((s) => s.category === selectedCategory) : platformServices),
    [platformServices, selectedCategory]
  );

  const activeService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId]
  );

  const charge = useMemo(
    () => (activeService ? +((activeService.price * qty) / 1000).toFixed(2) : 0),
    [activeService, qty]
  );

  // Reset category and service when platform changes
  useEffect(() => {
    setSelectedCategory("");
    setSelectedServiceId("");
  }, [selectedPlatform]);

  // Auto-select first category when categories change
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) setSelectedCategory(categories[0]);
  }, [categories, selectedCategory]);

  // Auto-select first service when category changes
  useEffect(() => {
    if (categoryServices.length > 0) setSelectedServiceId(categoryServices[0].id);
    else setSelectedServiceId("");
  }, [selectedCategory]);

  const handlePlaceOrder = async () => {
    if (!activeService || !link.trim()) { showToast("❌ Paste your target link first!"); return; }
    const minQty = activeService.min || 10;
    if (qty < minQty) { showToast(`❌ Minimum is ${minQty.toLocaleString()}`); return; }
    if (account.balance < charge) { showToast(`❌ Insufficient balance — need ${fmtINR(charge)}`); return; }
    setPlacing(true);
    try {
      const order = await api.createOrder(activeService.id, qty, link);
      setRouteMsg(`✅ Routed via ${order.provider || "provider"} — Order ID: …${order.id.slice(-8)}`);
      await sync();
      showToast(`✅ Order placed! ${fmtINR(charge)} deducted.`);
      setLink("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Order failed.");
    } finally { setPlacing(false); }
  };

  const handleFavorite = () => {
    if (!activeService) return;
    const a = { ...account };
    a.favorites = a.favorites || [];
    if (!a.favorites.includes(activeService.id)) {
      a.favorites.push(activeService.id);
      saveAccount(a); refresh();
      showToast("⭐ Added to favorites");
    } else showToast("Already in favorites");
  };

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 3000); };

  return (
    <DashboardShell>
      {/* LOW BALANCE BANNER */}
      {account.balance < 50 && (
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs font-bold text-amber-400">
          <AlertTriangle size={14} className="shrink-0" />
          Wallet balance low ({fmtINR(account.balance)}). <Link href="/add-funds" className="underline ml-1">Add funds →</Link>
        </div>
      )}

      <div className="text-left mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-black text-white">New Order</h1>
        <p className="text-sm text-slate-400 mt-1">Pick a service, paste your link, and grow. Auto-routed across providers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        {/* ORDER FORM */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Place an Order</h3>
            <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md uppercase tracking-wider">
              {categoryServices.length} services
            </span>
          </div>

          {/* STEP 1: Platform */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">1 — Select Platform</label>
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {platforms.map((p) => (
                <button key={p} onClick={() => setSelectedPlatform(p)}
                  className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedPlatform === p ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,.25)]" : "bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white"
                  }`}>
                  <span>{PLATFORM_ICONS[p] || "⚡"}</span><span>{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* STEP 2: Category dropdown */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">2 — Category</label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#0D1321]">{cat}</option>
                ))}
                {categories.length === 0 && <option>No categories — select a platform</option>}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* STEP 3: Service dropdown */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">3 — Service ({categoryServices.length})</label>
            <div className="relative">
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs text-white outline-none focus:border-blue-500 appearance-none cursor-pointer"
              >
                {loading ? <option>Loading services…</option>
                  : categoryServices.length === 0 ? <option>No services in this category</option>
                  : categoryServices.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#0D1321]">
                      {s.name} — {fmtINR(s.price)}/1K
                    </option>
                  ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Service details card */}
          {activeService && (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Service Details</span>
                <span className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} className={i < activeService.quality ? "text-amber-400 fill-amber-400" : "text-slate-700"} />
                  ))}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { l: "Speed", v: activeService.speed },
                  { l: "Refill", v: activeService.refill },
                  { l: "Min Order", v: (activeService.min || 1).toLocaleString() },
                  { l: "Max Order", v: activeService.max ? activeService.max.toLocaleString() : "∞" },
                  { l: "Provider", v: activeService.provider },
                  { l: "Rate per 1K", v: fmtINR(activeService.price) },
                ].map((row) => (
                  <div key={row.l} className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-slate-500 font-bold">{row.l}</span>
                    <span className="text-white font-bold text-right">{row.v}</span>
                  </div>
                ))}
              </div>
              {/* Provider route status */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Provider Route</span>
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  <Shield size={9} /> Active
                </span>
              </div>
              {routeMsg && <p className="text-[10px] font-mono text-blue-400 bg-blue-500/5 rounded-lg px-3 py-2">{routeMsg}</p>}
            </div>
          )}

          {/* Link */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">4 — Target Link / Username</label>
            <input type="text" placeholder="https://instagram.com/yourprofile or username" value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500" />
            <p className="text-[10px] text-slate-600 mt-1">Public profile, post, or channel link. Never share passwords.</p>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block mb-2">
              5 — Quantity
              {activeService && <span className="text-slate-600 normal-case font-medium ml-1">(Min {(activeService.min||1).toLocaleString()} • Max {activeService.max ? activeService.max.toLocaleString() : "∞"})</span>}
            </label>
            <input type="number" value={qty} onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5 text-sm text-white outline-none focus:border-blue-500" />
          </div>

          <button onClick={handleFavorite} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-amber-400 transition-colors">
            <Star size={12} /> Save to favorites
          </button>

          <div className="flex gap-2.5 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3.5 text-[11px] text-amber-400/80">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            Don't place a second order on the same link before the first completes. Test with small quantities first.
          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 sticky top-6 space-y-5">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider border-b border-white/5 pb-4">Order Summary</h3>

          <div className="space-y-3 text-xs">
            {[
              { l: "Service", v: activeService ? activeService.name.slice(0, 55) + (activeService.name.length > 55 ? "…" : "") : "—" },
              { l: "Platform", v: selectedPlatform },
              { l: "Category", v: selectedCategory || "—" },
              { l: "Rate / 1K", v: activeService ? fmtINR(activeService.price) : "—" },
              { l: "Quantity", v: qty.toLocaleString() },
              { l: "Speed", v: activeService?.speed || "—" },
            ].map((r) => (
              <div key={r.l} className="flex items-start justify-between gap-3 border-b border-white/5 pb-2">
                <span className="text-slate-400 font-bold shrink-0">{r.l}</span>
                <span className="text-white font-bold text-right break-words max-w-[60%]">{r.v}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <span className="text-slate-400 text-sm font-bold">Total Charge</span>
            <span className="text-2xl font-black text-blue-400">{fmtINR(charge)}</span>
          </div>

          <button onClick={() => void handlePlaceOrder()} disabled={loading || !activeService || placing}
            className="btn btn-cta btn-block btn-lg disabled:opacity-50">
            {placing ? "Placing…" : "Place Order"}
          </button>

          <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs font-bold text-slate-400">
            <span>Wallet Balance</span>
            <span className={`font-black ${account.balance < charge ? "text-rose-400" : "text-emerald-400"}`}>{fmtINR(account.balance)}</span>
          </div>
          <Link href="/add-funds" className="btn btn-ghost btn-block !text-xs">+ Top-up Wallet</Link>
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
