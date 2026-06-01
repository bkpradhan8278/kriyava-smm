"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Shield, AlertTriangle, Zap, CheckCircle2, Heart, Award } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { useMarket } from "@/lib/useServices";
import { placeOrder, fmtINR, saveAccount } from "@/lib/account";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { MarketService } from "@/lib/types";

export default function NewOrderPage() {
  const { account, refresh } = useAccount();
  const { services, loading } = useMarket();

  // Platforms derived from service catalog
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [link, setLink] = useState("");
  const [qty, setQty] = useState(1000);
  const [charge, setCharge] = useState(0);
  
  // Routing simulation
  const [failoverMode, setFailoverMode] = useState<"auto" | "quality" | "cost" | "manual">("auto");
  const [selectedProvider, setSelectedProvider] = useState("auto");
  const [routeLogs, setRouteLogs] = useState<string[]>([]);

  const [toastMsg, setToastMsg] = useState("");

  // Extract platforms
  useEffect(() => {
    if (services.length > 0) {
      const unique = Array.from(new Set(services.map((s) => s.platform)));
      setPlatforms(unique.sort());
    }
  }, [services]);

  // Sync services based on platform
  const filteredServices = services
    .filter((s) => s.platform === selectedPlatform)
    .sort((a, b) => a.price - b.price);

  useEffect(() => {
    if (filteredServices.length > 0) {
      setSelectedServiceId(filteredServices[0].id);
    } else {
      setSelectedServiceId("");
    }
  }, [selectedPlatform, services]);

  const activeService = services.find((s) => s.id === selectedServiceId);

  // Sync pricing charge
  useEffect(() => {
    if (activeService) {
      const total = +((activeService.price * qty) / 1000).toFixed(2);
      setCharge(total);
    } else {
      setCharge(0);
    }
  }, [activeService, qty]);

  const handlePlaceOrder = () => {
    if (!activeService) return;
    if (!link.trim()) {
      showToast("❌ Paste your target link first!");
      return;
    }
    if (qty < (activeService.min || 10)) {
      showToast(`❌ Minimum quantity is ${(activeService.min || 10).toLocaleString()}`);
      return;
    }
    if (account.balance < charge) {
      showToast(`❌ Insufficient balance — need ${fmtINR(charge)}`);
      return;
    }

    // Simulate SMM provider routing path
    const logs: string[] = [];
    let providerUsed = activeService.provider || "LuvSMM";
    
    if (failoverMode === "auto") {
      logs.push("Failover engine initiated: Scanning active provider gateways...");
      const luvPing = 110 + Math.floor(Math.random() * 80);
      const easyPing = 140 + Math.floor(Math.random() * 60);
      
      logs.push(`LuvSMM ping: ${luvPing}ms | EasySMM ping: ${easyPing}ms`);
      
      // Simulate random backup failover reroute
      if (Math.random() > 0.7) {
        logs.push("⚠️ Main channel gateway high load detected. Automatically failover to backup gateway...");
        providerUsed = "EasySMM";
        logs.push(`Success: Re-routed order to EasySMM endpoint (Ping: ${easyPing}ms).`);
      } else {
        logs.push(`Primary route healthy: Routed order to ${providerUsed} (Ping: ${luvPing}ms).`);
      }
    } else if (failoverMode === "quality") {
      logs.push("Optimizer Mode: Quality-First routing.");
      if (activeService.quality >= 4) {
        logs.push(`Premium quality service tag: routing directly to high-capacity ${providerUsed} server.`);
      } else {
        logs.push(`Standard service tag: routed to LuvSMM (Ping: 110ms).`);
      }
    } else {
      logs.push(`Manual routing: Routing forced to selected provider ${selectedProvider || providerUsed}`);
      providerUsed = selectedProvider === "auto" ? providerUsed : selectedProvider;
    }

    setRouteLogs(logs);

    // Place simulated order
    const mockService = { ...activeService, provider: providerUsed };
    const res = placeOrder(mockService, qty, link);

    if (res.ok) {
      refresh();
      showToast(`✅ Order ${res.order.id} placed successfully!`);
      setLink("");
    }
  };

  const handleFavorite = () => {
    if (!activeService) return;
    const a = { ...account };
    a.favorites = a.favorites || [];
    if (!a.favorites.includes(activeService.id)) {
      a.favorites.push(activeService.id);
      saveAccount(a);
      refresh();
      showToast("⭐ Added to favorites list");
    } else {
      showToast("⭐ Already in your favorites");
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <DashboardShell>
      {/* PAGE TITLE */}
      <div className="text-left mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-black text-white">New Order</h1>
        <p className="text-sm text-slate-400 mt-1">Pick a service, paste your link, and grow. Orders are auto-routed securely across providers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        {/* ORDER FORM CARD */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md text-left space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Place an order</h3>
            <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-md">
              {filteredServices.length} Services Available
            </span>
          </div>

          {/* Platforms tabs */}
          <div className="flex flex-col">
            <label className="text-[10.5px] font-extrabold uppercase tracking-wide text-slate-400 mb-2">Select Platform</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPlatform(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    selectedPlatform === p
                      ? "bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]"
                      : "bg-white/[0.02] border border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Service Selector */}
          <div className="flex flex-col">
            <label className="text-[10.5px] font-extrabold uppercase tracking-wide text-slate-400 mb-2">Growth Service</label>
            <select
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3.5 text-xs text-white outline-none focus:border-blue-500 focus:bg-white/[0.03]"
            >
              {loading ? (
                <option>Loading platform options...</option>
              ) : (
                filteredServices.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#090D16] text-white">
                    {s.name} — {fmtINR(s.price)}/1K
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Failover and Router settings */}
          <div className="rounded-xl border border-white/5 bg-white/[0.01] p-4 text-xs font-bold text-slate-400">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wide text-white">AI Provider Router Failover Mode</span>
              <span className="text-[9.5px] font-black text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
                <Shield size={10} /> Active
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {[
                { id: "auto", label: "Auto Failover" },
                { id: "quality", label: "Quality First" },
                { id: "cost", label: "Lowest Cost" },
                { id: "manual", label: "Manual Override" },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setFailoverMode(m.id as any)}
                  className={`py-2 px-1 text-[10.5px] font-bold rounded-lg border text-center transition-all ${
                    failoverMode === m.id
                      ? "border-blue-500 bg-blue-500/10 text-white"
                      : "border-white/5 bg-white/[0.01] hover:text-white"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {failoverMode === "manual" && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
                <span>Select Target Endpoint:</span>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="rounded-lg border border-white/10 bg-[#090D16] p-1 text-[10.5px] text-white outline-none"
                >
                  <option value="auto">Auto Selection</option>
                  <option value="LuvSMM">LuvSMM Gateway</option>
                  <option value="EasySMM">EasySMM Gateway</option>
                  <option value="MetaPanel">MetaPanel Gateway</option>
                </select>
              </div>
            )}

            {routeLogs.length > 0 && (
              <div className="mt-3 bg-black/40 rounded-lg p-2.5 font-mono text-[10px] text-slate-400 space-y-1">
                {routeLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-1.5 items-start">
                    <span className="text-blue-500">&gt;</span>
                    <span className="text-left">{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Table */}
          {activeService && (
            <div className="border-t border-white/5 pt-4 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-400 font-bold">Category Niche</span>
                <b className="font-bold text-white">{activeService.category}</b>
              </div>
              <div className="flex items-center justify-between py-1.5 border-t border-white/5">
                <span className="text-slate-400 font-bold">Average Completion Speed</span>
                <b className="font-bold text-emerald-400">{activeService.speed}</b>
              </div>
              <div className="flex items-center justify-between py-1.5 border-t border-white/5">
                <span className="text-slate-400 font-bold">Refill Policy</span>
                <b className="font-bold text-white">{activeService.refill}</b>
              </div>
              <div className="flex items-center justify-between py-1.5 border-t border-white/5">
                <span className="text-slate-400 font-bold">Average Quality Assessment</span>
                <span className="flex text-amber-400 font-black text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="leading-none">
                      {i < activeService.quality ? "★" : "☆"}
                    </span>
                  ))}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-t border-white/5">
                <span className="text-slate-400 font-bold">Minimum / Maximum Quantity</span>
                <b className="font-bold text-white">
                  {(activeService.min || 10).toLocaleString()} /{" "}
                  {activeService.max ? activeService.max.toLocaleString() : "∞"}
                </b>
              </div>
            </div>
          )}

          {/* Inputs */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex flex-col">
              <label className="text-[10.5px] font-extrabold uppercase tracking-wide text-slate-400 mb-1.5">Target Link Link</label>
              <input
                type="text"
                placeholder="https://instagram.com/yourprofile"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3.5 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:bg-white/[0.03]"
              />
              <span className="text-[10px] text-slate-500 font-bold mt-1 text-left">
                Public profile, post, or channel link. We never ask for password credentials.
              </span>
            </div>

            <div className="flex flex-col">
              <label className="text-[10.5px] font-extrabold uppercase tracking-wide text-slate-400 mb-1.5">
                Quantity{" "}
                {activeService && (
                  <span className="text-slate-500 lowercase">
                    (min {(activeService.min || 10).toLocaleString()} • max{" "}
                    {activeService.max ? activeService.max.toLocaleString() : "∞"})
                  </span>
                )}
              </label>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3.5 text-sm text-white outline-none focus:border-blue-500 focus:bg-white/[0.03]"
              />
            </div>

            <button
              onClick={handleFavorite}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-amber-400 transition-colors"
            >
              <span>★</span> Add to favorites catalog
            </button>
          </div>

          <div className="flex gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-[11px] leading-relaxed text-slate-400 text-left">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p>
              <b>Precaution</b>: Please do not place a second order on the exact same link until the first campaign has finished processing. Quality tags represent guidelines — we recommend testing a small units order before bulk spending.
            </p>
          </div>
        </div>

        {/* ORDER SUMMARY PANEL */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md text-left sticky top-24 space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Order summary</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-start justify-between py-1">
              <span className="text-slate-400 font-bold shrink-0">Selected Service:</span>
              <b className="font-bold text-white text-right ml-4 line-clamp-2">
                {activeService ? activeService.name : "—"}
              </b>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-white/5">
              <span className="text-slate-400 font-bold">Wholesale Rate / 1K:</span>
              <b className="font-black text-white">
                {activeService ? fmtINR(activeService.price) : "—"}
              </b>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-white/5">
              <span className="text-slate-400 font-bold">Requested Quantity:</span>
              <b className="font-bold text-white">{qty.toLocaleString()}</b>
            </div>
            <div className="flex items-center justify-between py-1 border-t border-white/5">
              <span className="text-slate-400 font-bold">Delivery Speed:</span>
              <b className="font-bold text-emerald-400">{activeService ? activeService.speed : "—"}</b>
            </div>

            <div className="p-4 border border-white/5 bg-white/[0.01] rounded-xl flex items-center justify-between text-sm font-bold mt-4">
              <span className="text-slate-400">Total charge:</span>
              <b className="text-xl text-blue-400 font-extrabold">{fmtINR(charge)}</b>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || !activeService}
              className="btn btn-cta btn-block btn-lg"
            >
              Place Campaign Order
            </button>

            <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs font-bold text-slate-400">
              <span>Your Wallet Balance:</span>
              <b className="text-white">{fmtINR(account.balance)}</b>
            </div>

            <Link href="/add-funds" className="btn btn-ghost btn-block mt-2">
              + Top-up funds
            </Link>
          </div>
        </div>
      </div>

      {/* TOAST PANEL */}
      {toastMsg && (
        <div className="fixed bottom-24 left-6 z-55 rounded-xl border border-white/10 bg-[#0D1321]/95 px-5 py-3 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-black border-l-4 border-l-emerald-500 animate-slideup">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </DashboardShell>
  );
}
