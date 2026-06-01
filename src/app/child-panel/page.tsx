"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, Shield, Sparkles, CheckCircle2, TrendingUp, AlertTriangle, Monitor, Sliders, Settings } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { fmtINR, saveAccount } from "@/lib/account";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

interface ChildPanelConfig {
  plan: "Starter" | "Pro" | "Agency";
  domain: string;
  brandName: string;
  primaryColor: string;
  active: boolean;
}

export default function ChildPanelPage() {
  const { account, refresh } = useAccount();
  const [purchased, setPurchased] = useState(false);
  const [config, setConfig] = useState<ChildPanelConfig>({
    plan: "Pro",
    domain: "yourbrand.com",
    brandName: "YourBrand SMM",
    primaryColor: "#f43f5e",
    active: false,
  });

  // ROI Calculator state
  const [roiOrders, setRoiOrders] = useState(30);
  const [roiAov, setRoiAov] = useState(120);
  const [roiMargin, setRoiMargin] = useState(100);

  const [toastMsg, setToastMsg] = useState("");

  // Sync state from account store
  useEffect(() => {
    if (account.prefs?.childPanelActive) {
      setPurchased(true);
      setConfig({
        plan: (account.prefs.childPanelPlan as any) || "Pro",
        domain: (account.prefs.childPanelDomain as string) || "yourbrand.com",
        brandName: (account.prefs.childPanelBrandName as string) || "YourBrand SMM",
        primaryColor: (account.prefs.childPanelColor as string) || "#f43f5e",
        active: true,
      });
    }
  }, [account]);

  const handlePurchase = (plan: "Starter" | "Pro" | "Agency", cost: number) => {
    if (account.balance < cost) {
      showToast(`❌ Insufficient balance — top up ₹${(cost - account.balance).toFixed(2)} more!`);
      return;
    }

    const a = { ...account };
    a.balance = +((a.balance || 0) - cost).toFixed(2);
    a.spent = +((a.spent || 0) + cost).toFixed(2);
    a.prefs = a.prefs || {};
    a.prefs.childPanelActive = true;
    a.prefs.childPanelPlan = plan;
    a.prefs.childPanelDomain = "yourbrand.com";
    a.prefs.childPanelBrandName = "YourBrand SMM";
    a.prefs.childPanelColor = "#f43f5e";

    saveAccount(a);
    refresh();
    
    setPurchased(true);
    showToast(`👑 Congratulations! ${plan} Child Panel purchased successfully!`);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const a = { ...account };
    a.prefs = a.prefs || {};
    a.prefs.childPanelDomain = config.domain;
    a.prefs.childPanelBrandName = config.brandName;
    a.prefs.childPanelColor = config.primaryColor;

    saveAccount(a);
    refresh();
    showToast("💾 Configuration updated successfully!");
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // ROI Math
  const ordersM = roiOrders * 30;
  const revenue = ordersM * roiAov;
  const marginPct = roiMargin / 100;
  const profit = revenue * (marginPct / (1 + marginPct));

  return (
    <DashboardShell>
      {/* PAGE HEAD */}
      <div className="text-left mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-black text-white">White-Label Child Panels</h1>
        <p className="text-sm text-slate-400 mt-1">Start your SMM reseller brand in under 10 minutes. 100% white-label gateway.</p>
      </div>

      {purchased ? (
        /* LIVE CONFIGURATION AREA */
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-6 items-start">
          {/* Settings Console form */}
          <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md text-left space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Settings size={16} className="text-blue-400" />
                Customize Branding
              </h3>
              <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded">
                Plan: {config.plan}
              </span>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs font-bold">
              <div className="flex flex-col">
                <label className="text-slate-400 mb-1.5 uppercase text-[10px] tracking-wide">Brand Name Title</label>
                <input
                  type="text"
                  value={config.brandName}
                  onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
                  className="rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-slate-400 mb-1.5 uppercase text-[10px] tracking-wide">Custom Domain URL</label>
                <input
                  type="text"
                  value={config.domain}
                  onChange={(e) => setConfig({ ...config, domain: e.target.value })}
                  className="rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-slate-400 mb-1.5 uppercase text-[10px] tracking-wide">Theme Primary Color</label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="h-9 w-9 rounded-xl border border-white/5 bg-transparent outline-none cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="flex-1 rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block !py-3 !text-xs mt-4"
              >
                Save configurations
              </button>
            </form>
          </div>

          {/* VISUAL LIVE BROWSER PREVIEW FRAME */}
          <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md text-left space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Monitor size={16} className="text-emerald-400" />
                Live White-Label Preview
              </h3>
            </div>

            {/* Browser container mock */}
            <div className="rounded-2xl border border-white/10 bg-white overflow-hidden text-slate-800 shadow-2xl">
              {/* Browser topbar */}
              <div className="flex items-center gap-4 bg-slate-100 border-b border-slate-200 px-4 py-2.5 text-xs text-slate-500 font-semibold select-none">
                <div className="flex gap-1.5">
                  <i className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <i className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <i className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 bg-white border border-slate-200 px-3 py-1 rounded-lg flex items-center gap-1.5 font-mono text-[10.5px]">
                  <span className="text-emerald-600 font-bold">https://</span>
                  <b>{config.domain}</b>
                  <span className="text-slate-400">/marketplace</span>
                </div>
              </div>

              {/* Browser viewport body */}
              <div className="p-5 bg-slate-50 min-h-[180px] flex flex-col text-left">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                  <div className="flex items-center gap-2 font-display text-sm font-extrabold text-slate-900">
                    <span
                      className="grid h-6 w-6 place-items-center rounded-lg text-white font-extrabold text-[11px]"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      {config.brandName[0]}
                    </span>
                    {config.brandName}
                  </div>
                  <div className="flex gap-3 text-[10.5px] font-bold text-slate-500">
                    <span>Services</span>
                    <span>New Order</span>
                    <span>API Docs</span>
                  </div>
                </div>

                <div className="text-center py-4 my-auto">
                  <h4 className="font-display font-black text-lg text-slate-900 leading-none">
                    Wholesale Social Growth Platforms
                  </h4>
                  <p className="text-[11.5px] text-slate-400 mt-1.5">Premium quality followers, likes and engagement views.</p>
                  
                  <span
                    className="inline-block mt-3 text-[10.5px] font-extrabold text-white px-4 py-1.5 rounded-full shadow-md select-none"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    Order Services Now
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PURCHASE UP-SELL WITH PLANS AND ROI CALCULATORS */
        <div className="space-y-8 text-left">
          {/* ROI Profit Calculator */}
          <div className="rounded-2xl border border-white/5 bg-gradient-to-tr from-indigo-950/20 via-slate-900/50 to-blue-950/20 p-6 backdrop-blur-md">
            <h3 className="font-display text-lg font-black text-white mb-6 border-b border-white/5 pb-3 flex items-center gap-2">
              <Sliders size={18} className="text-purple-400" />
              SMM Agency Profit Calculator
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                {/* slider 1 */}
                <div className="flex flex-col">
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span>Orders processed per day:</span>
                    <b className="text-white">{roiOrders}</b>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={300}
                    step={5}
                    value={roiOrders}
                    onChange={(e) => setRoiOrders(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-500 cursor-pointer h-1.5 bg-white/5 rounded-lg"
                  />
                </div>

                {/* slider 2 */}
                <div className="flex flex-col">
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span>Average customer order value:</span>
                    <b className="text-white">₹{roiAov}</b>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={1000}
                    step={10}
                    value={roiAov}
                    onChange={(e) => setRoiAov(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-500 cursor-pointer h-1.5 bg-white/5 rounded-lg"
                  />
                </div>

                {/* slider 3 */}
                <div className="flex flex-col">
                  <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                    <span>Your markup profit percentage:</span>
                    <b className="text-white">{roiMargin}%</b>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={300}
                    step={10}
                    value={roiMargin}
                    onChange={(e) => setRoiMargin(parseInt(e.target.value, 10))}
                    className="w-full accent-purple-500 cursor-pointer h-1.5 bg-white/5 rounded-lg"
                  />
                </div>
              </div>

              {/* roi results card */}
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 flex flex-col text-left">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  Estimated monthly profit margin
                </span>
                <div className="font-display text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mt-2">
                  ₹{Math.round(profit).toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-wide">
                  After wholesale SMM costs
                </div>

                <div className="grid grid-cols-2 gap-4 mt-5 pt-5 border-t border-white/5 text-xs font-bold">
                  <div>
                    <span className="text-slate-500 uppercase text-[9px] tracking-wider block">Monthly sales</span>
                    <span className="text-white block text-sm mt-0.5">
                      ₹{Math.round(revenue).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[9px] tracking-wider block">Total orders</span>
                    <span className="text-white block text-sm mt-0.5">
                      {ordersM.toLocaleString("en-IN")} orders
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {[
              {
                plan: "Starter",
                cost: 999,
                desc: "Test the waters and make your first reseller sales.",
                feats: [
                  "Subdomain hosted (you.kriyava.com)",
                  "Custom logo & colors branding",
                  "Wholesale provider console links",
                  "UPI payment setups built-in",
                  "Custom domain domain (Blocked)",
                  "Wholesale API Access (Blocked)",
                ],
              },
              {
                plan: "Pro",
                cost: 1999,
                desc: "For serious resellers scaling an independent brand.",
                feats: [
                  "All Starter features included",
                  "Custom domain connection + SSL",
                  "Complete REST API developer tools",
                  "Lower wholesale pricing rates",
                  "Priority support queues",
                  "WhatsApp CRM tools (Blocked)",
                ],
              },
              {
                plan: "Agency",
                cost: 4999,
                desc: "Run a full-fledged team dashboard and agency SMM.",
                feats: [
                  "All Pro features included",
                  "Lowest wholesale pricing rates",
                  "Client CRM management suites",
                  "Create reseller sub-panels",
                  "WhatsApp ordering automations",
                  "Dedicated account manager",
                ],
              },
            ].map((p, idx) => (
              <div
                key={p.plan}
                className={`rounded-2xl border p-5 flex flex-col justify-between ${
                  p.plan === "Pro"
                    ? "border-blue-500 bg-blue-500/[0.03] shadow-lg relative"
                    : "border-white/5 bg-[#0D1321]/50"
                }`}
              >
                {p.plan === "Pro" && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold text-[9.5px] uppercase tracking-wider px-3.5 py-1 shadow-md select-none">
                    Best Value 👑
                  </span>
                )}
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">{p.plan} Plan</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-1 leading-relaxed">{p.desc}</p>
                  
                  <div className="flex items-baseline gap-1 my-5 border-y border-white/5 py-3">
                    <span className="text-xl font-display font-black text-white">₹{p.cost}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">/ Mo</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
                    {p.feats.map((feat, fidx) => {
                      const isBlocked = feat.includes("(Blocked)");
                      return (
                        <li key={fidx} className={`flex items-start gap-2 ${isBlocked ? "opacity-45 text-slate-500" : ""}`}>
                          <span className={`h-4 w-4 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold ${isBlocked ? "bg-white/5 text-slate-500" : "bg-emerald-500/10 text-emerald-400"}`}>
                            {isBlocked ? "✕" : "✓"}
                          </span>
                          <span>{feat.replace(" (Blocked)", "")}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <button
                  onClick={() => handlePurchase(p.plan as any, p.cost)}
                  className={`btn btn-block !text-xs mt-6 !py-2.5 ${p.plan === "Pro" ? "btn-primary" : "btn-ghost"}`}
                >
                  Purchase {p.plan} Panel
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
