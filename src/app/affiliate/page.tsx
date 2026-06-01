"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Share2, DollarSign, Wallet, Award, CheckCircle2, ArrowRight, Smartphone, Copy, Send, Activity, Users, Sparkles } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { fmtINR, saveAccount } from "@/lib/account";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function AffiliatePage() {
  const { account, refresh } = useAccount();
  const [unpaidBalance, setUnpaidBalance] = useState(24180);
  const [paidCommission, setPaidCommission] = useState(86420);
  const [clicks, setClicks] = useState(3842);
  const [conversions, setConversions] = useState(284);
  const [refLink, setRefLink] = useState("https://kriyava.com/?ref=KRIYA-9F4A2");
  
  const [withdrawAmt, setWithdrawAmt] = useState(24180);
  const [payoutMethod, setPayoutMethod] = useState("wallet");
  
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    if (account.name) {
      // Create a personalized referral code
      const nameTag = account.name.slice(0, 5).toUpperCase().replace(/[^A-Z]/g, "K");
      setRefLink(`https://kriyava.com/?ref=KRIYA-${nameTag}`);
    }
  }, [account]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink);
    showToast("📋 Referral link copied to clipboard!");
  };

  const handleCopyCode = (e: React.MouseEvent) => {
    e.preventDefault();
    const code = refLink.split("=")[1] || "KRIYA-9F4A2";
    navigator.clipboard.writeText(code);
    showToast("📋 Referral code copied!");
  };

  const handleWithdraw = () => {
    if (withdrawAmt < 500) {
      showToast("❌ Minimum payout withdrawal is ₹500.");
      return;
    }
    if (withdrawAmt > unpaidBalance) {
      showToast("❌ Amount exceeds available affiliate earnings.");
      return;
    }

    const nextUnpaid = unpaidBalance - withdrawAmt;
    setUnpaidBalance(nextUnpaid);
    setPaidCommission((v) => v + withdrawAmt);

    // If method is wallet transfer, add directly to user balance
    if (payoutMethod === "wallet") {
      const a = { ...account };
      a.balance = +((a.balance || 0) + withdrawAmt).toFixed(2);
      a.txns = a.txns || [];
      a.txns.unshift({
        id: "TXN" + (1000 + a.txns.length + 1),
        type: "Affiliate Payout",
        amount: withdrawAmt,
        at: Date.now(),
        method: "Affiliate Balance",
      });
      saveAccount(a);
      refresh();
      showToast(`⚡ Instant transfer success: ${fmtINR(withdrawAmt)} added to wallet balance!`);
    } else {
      showToast(`✅ Payout of ${fmtINR(withdrawAmt)} requested! Money will land on Monday.`);
    }

    setWithdrawAmt(nextUnpaid);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Generate earnings trend chart
  const earnChartPoints = [20, 32, 28, 45, 60, 50, 72, 85, 78, 92, 105, 120];
  const convChartPoints = [10, 15, 12, 18, 25, 20, 30, 34, 31, 38, 42, 48];
  
  const getSVGChartPaths = () => {
    const W = 600;
    const H = 200;
    const pad = 10;
    const maxE = Math.max(...earnChartPoints) * 1.1;
    const maxC = Math.max(...convChartPoints) * 1.3;

    const getPath = (arr: number[], max: number) => {
      return arr.map((v, i) => {
        const x = pad + (i * (W - 2 * pad)) / (arr.length - 1);
        const y = H - pad - (v / max) * (H - 2 * pad);
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      }).join(" ");
    };

    const earnLine = getPath(earnChartPoints, maxE);
    const convLine = getPath(convChartPoints, maxC);
    const areaPath = `${earnLine} L${W - pad},${H - pad} L${pad},${H - pad} Z`;

    return { earnLine, convLine, areaPath };
  };

  const { earnLine, convLine, areaPath } = getSVGChartPaths();

  return (
    <DashboardShell>
      {/* PAGE HEAD */}
      <div className="text-left mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-black text-white">Affiliate Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Refer creators, agencies, and brand owners. Earn lifetime 30% commission on all their deposits.</p>
      </div>

      {/* REFERRAL LINK BOX */}
      <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md text-left mb-6 overflow-hidden relative">
        {/* grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)",
            backgroundSize: "36px 36px",
            maskImage: "radial-gradient(circle at 0% 0%,#000 30%,transparent 70%)",
            WebkitMaskImage: "radial-gradient(circle at 0% 0%,#000 30%,transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <div className="flex-1 space-y-3.5">
            <h2 className="font-display text-xl font-extrabold text-white flex items-center gap-2">
              <Sparkles className="text-amber-400" size={20} />
              Your custom referral link
            </h2>
            <p className="text-slate-300 text-xs leading-relaxed max-w-[54ch]">
              Get credited **30% commission** for life on every SMM campaign order placed by your referrals. Earnings compiled weekly.
            </p>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500">Referral Link URL</span>
              <div className="flex gap-2 max-w-lg">
                <div className="flex-1 bg-white/[0.01] border border-white/5 px-4 py-3 rounded-xl text-white font-mono text-xs select-all truncate leading-snug flex items-center">
                  {refLink}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="btn btn-primary !px-5 !py-3 !text-xs flex items-center gap-1.5 shrink-0"
                >
                  <Copy size={13} />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

            {/* Social sharing icons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Grow your socials with Kriyava SMM! 🚀 ${refLink}`)}`, "_blank")}
                className="h-9 w-9 rounded-xl bg-white/5 hover:bg-[#25D366]/20 hover:text-[#25D366] text-slate-400 grid place-items-center transition-all hover:-translate-y-0.5"
                title="Share WhatsApp"
              >
                Whatsapp
              </button>
              <button
                onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(refLink)}`, "_blank")}
                className="h-9 w-9 rounded-xl bg-white/5 hover:bg-[#0088cc]/20 hover:text-[#0088cc] text-slate-400 grid place-items-center transition-all hover:-translate-y-0.5"
                title="Share Telegram"
              >
                Telegram
              </button>
              <button
                onClick={handleCopyCode}
                className="h-9 w-9 rounded-xl bg-white/5 hover:bg-amber-500/20 hover:text-amber-400 text-slate-400 grid place-items-center transition-all hover:-translate-y-0.5"
                title="Copy Affiliate Code Only"
              >
                Code
              </button>
            </div>
          </div>

          {/* Big Commission Rate Circle */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center shrink-0 lg:w-48 backdrop-blur">
            <div className="font-display text-4xl font-black text-transparent bg-clip-text bg-gradient-to-tr from-amber-300 to-amber-100">
              30%
            </div>
            <div className="text-[10px] text-slate-300 font-bold mt-1.5 block uppercase tracking-wide">
              Commission Cut
            </div>
            <span className="inline-block mt-3.5 text-[9.5px] font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
              🥈 Silver tier · 28 refs
            </span>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Clicks", value: clicks, icon: Activity, tint: "text-blue-400 bg-blue-500/10", tag: "▲ 12.4% this week" },
          { label: "Conversions", value: conversions, icon: Users, tint: "text-purple-400 bg-purple-500/10", tag: "7.4% conversion rate" },
          { label: "Total Commissions", value: fmtINR(paidCommission + unpaidBalance), icon: DollarSign, tint: "text-emerald-400 bg-emerald-500/10", tag: "▲ 18.6% this month" },
          { label: "Available Payouts", value: fmtINR(unpaidBalance), icon: Wallet, tint: "text-amber-400 bg-amber-500/10", tag: "Min ₹500 withdrawal" },
        ].map((s, idx) => (
          <div key={idx} className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-4 text-left relative overflow-hidden bg-gradient-to-tr from-white/[0.01] to-transparent">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">{s.label}</span>
              <span className={`grid h-8 w-8 place-items-center rounded-xl ${s.tint}`}>
                <s.icon size={15} />
              </span>
            </div>
            <div className="font-display text-xl font-black text-white">{s.value}</div>
            <span className="text-[10px] font-bold text-slate-500 block mt-2">{s.tag}</span>
          </div>
        ))}
      </div>

      {/* ROW 2: CHART & WITHDRAWAL OPTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Earnings chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md text-left flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Earnings &amp; Referrals</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">Last 12 weeks</span>
            </div>
          </div>

          <div className="relative h-[200px] w-full my-auto">
            <svg viewBox="0 0 600 200" width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
              <defs>
                <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#earnGrad)" />
              <path d={earnLine} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d={convLine} fill="none" stroke="#7C3AED" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-5 mt-4 pt-3 border-t border-white/5 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-2 w-4 rounded bg-emerald-500 inline-block" />
              Commissions (₹)
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-purple-500 inline-block" />
              Referral conversions
            </span>
          </div>
        </div>

        {/* Withdrawal console */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md text-left flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            💸 Withdraw Earnings
          </h3>

          <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 text-center my-auto mb-4">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Available Balance</span>
            <b className="font-display text-3xl font-black text-emerald-400 block mt-1.5">{fmtINR(unpaidBalance)}</b>
          </div>

          <div className="space-y-4 text-xs font-bold">
            <div className="flex flex-col">
              <label className="text-slate-400 mb-1.5 uppercase text-[9.5px] tracking-wide">Amount (INR)</label>
              <input
                type="number"
                min={500}
                value={withdrawAmt}
                onChange={(e) => setWithdrawAmt(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="w-full rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-slate-400 mb-1.5 uppercase text-[9.5px] tracking-wide">Payout Target Option</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full rounded-xl border border-white/5 bg-white/[0.01] p-2.5 text-xs text-white outline-none focus:border-blue-500"
              >
                <option value="wallet" className="bg-[#090D16]">Kriyava Wallet (Instant Transfer)</option>
                <option value="upi" className="bg-[#090D16]">UPI — bkpradhan@okaxis</option>
                <option value="bank" className="bg-[#090D16]">Bank Transfer — HDFC ****4821</option>
              </select>
            </div>

            <button
              onClick={handleWithdraw}
              disabled={unpaidBalance < 500}
              className="btn btn-primary btn-block !py-3 !text-xs mt-3 flex items-center justify-center gap-1.5"
            >
              Request Withdrawal
            </button>
            <span className="text-[9.5px] text-slate-500 text-center block mt-1.5">
              Payouts compiled every Monday • No processing fees
            </span>
          </div>
        </div>
      </div>

      {/* ROW 3: LOGS & LEADERBOARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Referral logs */}
        <div className="xl:col-span-2 rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md text-left flex flex-col">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Recent Referral Registrations</h3>
          <div className="overflow-x-auto">
            <table className="tbl w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="py-2.5 px-3">Referral User</th>
                  <th className="py-2.5 px-3">Joined Date</th>
                  <th className="py-2.5 px-3 text-right">Volume Spent</th>
                  <th className="py-2.5 px-3 text-right">Commission Cut</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { ref: "@rahul.creates", date: "2 days ago", spent: 4200, cut: 1260, status: "Paid" },
                  { ref: "growthlabs.in", date: "4 days ago", spent: 12800, cut: 3840, status: "Paid" },
                  { ref: "@priya_styles", date: "6 days ago", spent: 1900, cut: 570, status: "Pending" },
                  { ref: "@suraj.vlogs", date: "1 week ago", spent: 8500, cut: 2550, status: "Paid" },
                  { ref: "socialhub.co", date: "1 week ago", spent: 6300, cut: 1890, status: "Pending" },
                ].map((r, idx) => (
                  <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="py-3 px-3 font-bold text-white">{r.ref}</td>
                    <td className="py-3 px-3 text-slate-400 font-medium">{r.date}</td>
                    <td className="py-3 px-3 text-right font-semibold">{fmtINR(r.spent)}</td>
                    <td className="py-3 px-3 text-right font-black text-emerald-400">{fmtINR(r.cut)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${
                        r.status === "Paid" ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md text-left flex flex-col">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            🏆 Monthly Leaderboard
          </h3>

          <div className="space-y-3 pr-1 my-auto">
            {[
              { rank: 1, name: "@viral.kings", refs: 142, vol: "₹3.2L", medal: "🥇" },
              { rank: 2, name: "growthlabs.in", refs: 118, vol: "₹2.6L", medal: "🥈" },
              { rank: 3, name: "@social.suresh", refs: 96, vol: "₹1.9L", medal: "🥉" },
              { rank: 4, name: "@mediamogul", refs: 74, vol: "₹1.4L", medal: "🔥" },
              { rank: 12, name: "You 🫵", refs: 28, vol: "₹86K", medal: "🥈", me: true },
            ].map((usr) => (
              <div
                key={usr.rank}
                className={`flex items-center justify-between text-xs font-bold py-2.5 border-b border-white/5 last:border-0 ${
                  usr.me ? "bg-gradient-to-r from-purple-500/10 to-transparent p-2 rounded-xl -mx-2 border-0" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-6 w-6 rounded-lg font-black flex items-center justify-center text-[10px] ${
                    usr.rank === 1 ? "bg-amber-500 text-slate-900" : usr.rank === 2 ? "bg-slate-400 text-slate-900" : "bg-white/5 text-slate-400"
                  }`}>
                    {usr.rank}
                  </span>
                  <div>
                    <div className="text-white flex items-center gap-1">
                      <span>{usr.name}</span>
                    </div>
                    <span className="text-[9.5px] text-slate-500 font-bold block mt-0.5">
                      {usr.refs} referrals
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-white">{usr.vol}</span>
                  <span className="text-xs ml-1.5">{usr.medal}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MILESTONE REWARDS */}
      <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md text-left">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
          🎁 Rewards &amp; Milestone Tiers
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { tier: "Bronze Tier", comm: "20% Lifetime Comm", refs: "10 Referrals", status: "Unlocked", current: false, color: "from-amber-700 to-amber-900", icon: "🥉" },
            { tier: "Silver Tier", comm: "30% Lifetime Comm", refs: "11–50 Referrals", status: "Active Tier", current: true, color: "from-slate-400 to-slate-600", icon: "🥈" },
            { tier: "Gold Tier", comm: "40% Lifetime Comm", refs: "50 Referrals Milestone", status: "28 / 50 Refs", current: false, color: "from-amber-400 to-amber-600", icon: "🥇", locked: true },
            { tier: "Diamond Tier", comm: "50% + Cash Bonuses", refs: "100 Referrals Milestone", status: "28 / 100 Refs", current: false, color: "from-purple-500 to-indigo-600", icon: "💎", locked: true },
          ].map((t) => (
            <div
              key={t.tier}
              className={`rounded-xl border p-4 text-center relative overflow-hidden ${
                t.current ? "border-amber-500 bg-amber-500/[0.02]" : "border-white/5 bg-white/[0.01]"
              } ${t.locked ? "opacity-60" : ""}`}
            >
              {t.status === "Unlocked" && (
                <span className="absolute top-2.5 right-2.5 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold text-[8px] uppercase px-2 py-0.5">
                  Unlocked
                </span>
              )}
              {t.current && (
                <span className="absolute top-2.5 right-2.5 rounded-full bg-blue-500/10 text-blue-400 font-extrabold text-[8px] uppercase px-2 py-0.5">
                  Current
                </span>
              )}

              <span className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-tr ${t.color} text-white text-xl mx-auto mb-3.5`}>
                {t.icon}
              </span>
              <div className="text-xs font-black text-white">{t.tier}</div>
              <span className="text-[10px] text-slate-400 font-bold block mt-1 uppercase tracking-wide">
                {t.comm}
              </span>
              
              <div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: t.locked ? (t.tier.includes("Gold") ? "56%" : "28%") : "100%" }}
                />
              </div>
              <span className="text-[9.5px] text-slate-500 font-bold block mt-2">
                {t.status} • {t.refs}
              </span>
            </div>
          ))}
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
