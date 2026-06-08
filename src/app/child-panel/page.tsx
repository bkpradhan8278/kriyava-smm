"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Sparkles, CheckCircle2, TrendingUp, Sliders } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function ChildPanelPage() {
  const { account } = useAccount();
  const [requested, setRequested] = useState(false);
  const [requestedPlan, setRequestedPlan] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // ROI Calculator state
  const [roiOrders, setRoiOrders] = useState(30);
  const [roiAov, setRoiAov] = useState(120);
  const [roiMargin, setRoiMargin] = useState(100);

  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (account.prefs?.childPanelRequested) {
      setRequested(true);
      setRequestedPlan((account.prefs.childPanelPlan as string) || "Pro");
    }
  }, [account]);

  const handleRequest = async (plan: "Starter" | "Pro" | "Agency", cost: number) => {
    setSubmitting(true);
    try {
      await api.createTicket(
        `White-Label Panel Request — ${plan}`,
        "Sales",
        `${account.name || "A user"} (${account.email}) is interested in the ${plan} White-Label Child Panel (₹${cost}/mo). Please reach out to set it up.`,
      );
      setRequested(true);
      setRequestedPlan(plan);
      showToast(`✅ Request sent! Our team will contact you about the ${plan} plan.`);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Could not send request — try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
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

      {requested ? (
        /* REQUEST RECEIVED CONFIRMATION */
        <div className="max-w-xl mx-auto rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8 text-center">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400">
            <CheckCircle2 size={34} />
          </div>
          <h3 className="font-display text-xl font-black text-white">Request received 🎉</h3>
          <p className="text-sm text-slate-300 mt-2">
            Thanks for your interest in the <b className="text-emerald-400">{requestedPlan}</b> White-Label panel.
            Our team will contact you at <b className="text-white">{account.email}</b> within 24 hours to set up your branded reseller panel.
          </p>
          <div className="mt-5 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-left text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-2"><Shield size={13} className="text-blue-400" /> Custom domain + SSL, your logo & colors</div>
            <div className="flex items-center gap-2"><TrendingUp size={13} className="text-emerald-400" /> Wholesale pricing — keep 100% of your markup</div>
            <div className="flex items-center gap-2"><Sparkles size={13} className="text-purple-400" /> Full REST API for automation</div>
          </div>
          <Link href="/tickets" className="btn btn-ghost !text-xs mt-5 inline-flex">View my requests in Tickets →</Link>
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
                  onClick={() => void handleRequest(p.plan as "Starter" | "Pro" | "Agency", p.cost)}
                  disabled={submitting}
                  className={`btn btn-block !text-xs mt-6 !py-2.5 disabled:opacity-50 ${p.plan === "Pro" ? "btn-primary" : "btn-ghost"}`}
                >
                  {submitting ? "Sending…" : `Request ${p.plan} Panel`}
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
