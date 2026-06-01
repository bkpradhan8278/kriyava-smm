"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  TrendingUp,
  ArrowRight,
  Zap,
  Activity,
  Award,
} from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { useMarket } from "@/lib/useServices";
import { fmtINR, placeOrder, addFunds } from "@/lib/account";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { MarketService, Order } from "@/lib/types";

// Static categories configuration
const POPULAR_CATEGORIES = [
  { platform: "Instagram", icon: "📸", color: "from-pink-600 to-rose-500" },
  { platform: "YouTube", icon: "🎥", color: "from-red-600 to-rose-600" },
  { platform: "TikTok", icon: "🎵", color: "from-purple-600 to-indigo-500" },
  { platform: "Telegram", icon: "✈️", color: "from-cyan-500 to-blue-500" },
  { platform: "Spotify", icon: "🎧", color: "from-emerald-500 to-teal-500" },
  { platform: "Website", icon: "🌐", color: "from-amber-500 to-orange-500" },
];

const GLOBAL_MOCK_NAMES = ["@rahul.creates", "@priya_styles", "a reseller", "@suraj.vlogs", "an agency", "@fit.with.anu", "@techbyraj", "@food.diaries"];
const GLOBAL_MOCK_ACTS = [
  { text: "ordered 5,000 Instagram Followers", tint: "rose", platform: "Instagram" },
  { text: "ordered 10,000 Reel Views", tint: "violet", platform: "Instagram" },
  { text: "topped up wallet ₹2,000", tint: "green", platform: "Deposit" },
  { text: "ordered 1,000 Telegram Members", tint: "cyan", platform: "Telegram" },
  { text: "ordered 25,000 YouTube Views", tint: "amber", platform: "YouTube" },
  { text: "ordered 3,000 Instagram Likes", tint: "blue", platform: "Instagram" },
];

export default function DashboardPage() {
  const { account, refresh } = useAccount();
  const { services, loading: marketLoading } = useMarket();
  const [chartDays, setChartDays] = useState<14 | 30 | 90>(14);
  const [liveFeed, setLiveFeed] = useState<{ id: number; text: string; time: string; tint: string }[]>([]);
  const [toastMsg, setToastMsg] = useState("");

  // Quick Order State
  const [qoServiceId, setQoServiceId] = useState("");
  const [qoLink, setQoLink] = useState("");
  const [qoQty, setQoQty] = useState(1000);
  const [qoCharge, setQoCharge] = useState(0);

  // Initialize live feed & dropdowns
  useEffect(() => {
    // Generate initial live events
    const initialEvents = Array.from({ length: 5 }).map((_, i) => {
      const act = GLOBAL_MOCK_ACTS[Math.floor(Math.random() * GLOBAL_MOCK_ACTS.length)];
      const name = GLOBAL_MOCK_NAMES[Math.floor(Math.random() * GLOBAL_MOCK_NAMES.length)];
      return {
        id: Date.now() - i * 10000,
        text: `**${name}** ${act.text}`,
        time: `${(i + 1) * 8}s ago`,
        tint: act.tint,
      };
    });
    setLiveFeed(initialEvents);

    // Live order polling loop
    const interval = setInterval(() => {
      const act = GLOBAL_MOCK_ACTS[Math.floor(Math.random() * GLOBAL_MOCK_ACTS.length)];
      const name = GLOBAL_MOCK_NAMES[Math.floor(Math.random() * GLOBAL_MOCK_NAMES.length)];
      setLiveFeed((prev) => [
        {
          id: Date.now(),
          text: `**${name}** ${act.text}`,
          time: "just now",
          tint: act.tint,
        },
        ...prev.slice(0, 6),
      ]);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Update live feed time counters
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveFeed((prev) =>
        prev.map((item, idx) => {
          if (item.time === "just now") return { ...item, time: "6s ago" };
          const matches = item.time.match(/(\d+)s/);
          if (matches) {
            const nextSecs = parseInt(matches[1], 10) + 2;
            return { ...item, time: `${nextSecs}s ago` };
          }
          return item;
        })
      );
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Sync Quick Order list
  const quickPicks = services
    .slice()
    .sort((a, b) => b.quality - a.quality || a.price - b.price)
    .slice(0, 20);

  useEffect(() => {
    if (quickPicks.length > 0 && !qoServiceId) {
      setQoServiceId(quickPicks[0].id);
    }
  }, [services, quickPicks, qoServiceId]);

  // Sync Quick Order Charge
  useEffect(() => {
    const svc = services.find((s) => s.id === qoServiceId);
    if (svc) {
      const charge = +((svc.price * qoQty) / 1000).toFixed(2);
      setQoCharge(charge);
    }
  }, [qoServiceId, qoQty, services]);

  const handleQuickOrder = () => {
    const svc = services.find((s) => s.id === qoServiceId);
    if (!svc) return;

    if (account.balance < qoCharge) {
      showToast("❌ Insufficient balance — add funds!");
      return;
    }

    const qty = Math.max(svc.min || 10, qoQty);
    const res = placeOrder(svc, qty, qoLink || "https://instagram.com/myprofile");
    if (res.ok) {
      refresh();
      showToast(`✅ Order placed: ${fmtINR(qoCharge)}`);
      setQoLink("");
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Group orders by platform
  const getPlatformCounts = () => {
    const counts: Record<string, number> = { Instagram: 0, YouTube: 0, Telegram: 0, TikTok: 0, Other: 0 };
    if (account.orders.length > 0) {
      account.orders.forEach((o) => {
        const title = o.service.toLowerCase();
        if (title.includes("instagram")) counts.Instagram++;
        else if (title.includes("youtube")) counts.YouTube++;
        else if (title.includes("telegram")) counts.Telegram++;
        else if (title.includes("tiktok")) counts.TikTok++;
        else counts.Other++;
      });
    } else {
      // Mock metrics for initial display
      counts.Instagram = 60;
      counts.Telegram = 20;
      counts.YouTube = 20;
    }
    return counts;
  };

  const platformCounts = getPlatformCounts();
  const totalChartOrders = Object.values(platformCounts).reduce((s, c) => s + c, 0);

  const getDonutSegments = () => {
    const colors: Record<string, string> = {
      Instagram: "#f43f5e",
      YouTube: "#ef4444",
      Telegram: "#06B6D4",
      TikTok: "#7C3AED",
      Other: "#64748B",
    };

    let accumPct = 0;
    return Object.keys(platformCounts).map((key) => {
      const count = platformCounts[key];
      const pct = totalChartOrders > 0 ? (count / totalChartOrders) * 100 : 0;
      const strokeOffset = 100 - accumPct + 25; // 25 is top center start
      accumPct += pct;
      return {
        key,
        count,
        pct: Math.round(pct),
        color: colors[key],
        offset: strokeOffset,
        dash: `${pct} ${100 - pct}`,
      };
    });
  };

  const donutSegments = getDonutSegments();

  // Create mock charts data path
  const getSVGChartPaths = () => {
    const dataPoints = chartDays === 14 ? 14 : chartDays === 30 ? 20 : 25;
    const spendPoints: number[] = [];
    const orderPoints: number[] = [];

    // Seed repeatable mock trends
    for (let i = 0; i < dataPoints; i++) {
      spendPoints.push(40 + Math.round(Math.abs(Math.sin(i * 0.9) * 60) + i * 2 + (i % 3) * 10));
      orderPoints.push(10 + Math.round(Math.abs(Math.cos(i * 0.7) * 20) + i * 0.8 + (i % 2) * 5));
    }

    const W = 600;
    const H = 180;
    const pad = 15;

    const maxSpend = Math.max(...spendPoints, 1) * 1.1;
    const maxOrder = Math.max(...orderPoints, 1) * 1.2;

    const getPathString = (arr: number[], max: number) => {
      return arr
        .map((v, i) => {
          const x = pad + (i * (W - 2 * pad)) / (arr.length - 1);
          const y = H - pad - (v / max) * (H - 2 * pad);
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
    };

    const spendLine = getPathString(spendPoints, maxSpend);
    const orderLine = getPathString(orderPoints, maxOrder);
    const areaPath = `${spendLine} L${W - pad},${H - pad} L${pad},${H - pad} Z`;

    return { spendLine, orderLine, areaPath };
  };

  const { spendLine, orderLine, areaPath } = getSVGChartPaths();

  const completedCount = account.orders.filter((o) => o.status === "Completed").length;
  const pendingCount = account.orders.filter((o) => o.status !== "Completed").length;

  return (
    <DashboardShell>
      {/* GREETING */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div className="text-left">
          <h1 className="font-display text-2xl md:text-3xl font-black text-white">
            Welcome back, {account.name.split(" ")[0]} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">Here&apos;s what&apos;s happening with your growth today.</p>
        </div>
        <Link
          href="/new-order"
          className="btn btn-primary !px-5 !py-3 !text-sm flex items-center gap-2"
        >
          <Zap size={15} />
          <span>New Order</span>
        </Link>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          {
            label: "Total Orders",
            value: account.orders.length,
            icon: LayoutDashboard,
            color: "text-blue-400 bg-blue-500/10",
            pct: "▲ 18.2%",
            pctSub: "vs last week",
          },
          {
            label: "Completed",
            value: completedCount,
            icon: CheckCircle2,
            color: "text-emerald-400 bg-emerald-500/10",
            pct: "▲ 24.6%",
            pctSub: "delivered",
          },
          {
            label: "Pending",
            value: pendingCount,
            icon: Clock,
            color: "text-amber-400 bg-amber-500/10",
            pct: "▲ live",
            pctSub: "processing",
          },
          {
            label: "Wallet Balance",
            value: fmtINR(account.balance),
            icon: Wallet,
            color: "text-purple-400 bg-purple-500/10",
            pct: "▲ 5% cashback",
            pctSub: "on top-ups",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 relative overflow-hidden backdrop-blur-md"
            style={{
              backgroundImage: "linear-gradient(160deg, rgba(37,99,235,0.03) 0%, transparent 60%)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 tracking-wide uppercase">{stat.label}</span>
              <span className={`grid h-9 w-9 place-items-center rounded-xl ${stat.color}`}>
                <stat.icon size={18} />
              </span>
            </div>
            <div className="font-display text-2xl font-black text-white">{stat.value}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-2.5">
              <span>{stat.pct}</span>
              <span className="text-slate-400 font-medium">{stat.pctSub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* GRAPH ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Spending SVG chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md flex flex-col text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Spending &amp; Orders</h3>
              <span className="text-[10px] text-slate-400 font-bold tracking-wider mt-0.5 block">ANALYSIS TREND</span>
            </div>
            <div className="flex rounded-lg border border-white/5 bg-white/[0.02] p-1 text-[11px] font-bold">
              {([14, 30, 90] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setChartDays(d)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    chartDays === d ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>

          <div className="relative h-[180px] w-full">
            <svg viewBox="0 0 600 180" width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#spendGrad)" />
              <path d={spendLine} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d={orderLine} fill="none" stroke="#06B6D4" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex items-center gap-5 mt-4 pt-3 border-t border-white/5 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-2 w-4 rounded bg-blue-600 inline-block" />
              Spending (₹)
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-4 border-t-2 border-dashed border-cyan-400 inline-block" />
              Orders count
            </span>
          </div>
        </div>

        {/* Donut Analytics */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md flex flex-col text-left">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Order Analytics</h3>
          <div className="flex items-center justify-between gap-6 my-auto">
            <div className="relative h-32 w-32 shrink-0">
              <svg width="100%" height="100%" viewBox="0 0 42 42" className="transform -rotate-90">
                {donutSegments.map((seg, idx) => (
                  <circle
                    key={idx}
                    cx="21"
                    cy="21"
                    r="15.91549"
                    fill="transparent"
                    stroke={seg.color}
                    strokeWidth="5.5"
                    strokeDasharray={seg.dash}
                    strokeDashoffset={seg.offset}
                  />
                ))}
                {/* Hole */}
                <circle cx="21" cy="21" r="11.5" fill="#0D1321" />
              </svg>
              {/* Central text count */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[20px] font-black text-white leading-none">
                  {account.orders.length}
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Orders</span>
              </div>
            </div>

            {/* Legend list */}
            <div className="flex-1 space-y-2.5">
              {donutSegments.map((seg) => (
                <div key={seg.key} className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-slate-400">
                    <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: seg.color }} />
                    {seg.key}
                  </span>
                  <span className="text-white">{seg.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE ROWS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Recent orders */}
        <div className="xl:col-span-2 rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md text-left flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Recent Orders</h3>
            <Link href="/orders" className="text-xs font-bold text-blue-400 hover:text-blue-300">
              View all &rarr;
            </Link>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="tbl w-full text-left text-xs text-slate-300">
              <thead>
                <tr className="border-b border-white/5 text-slate-400">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Charge</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {account.orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-semibold">
                      No orders yet. Place your first order &rarr;
                    </td>
                  </tr>
                ) : (
                  account.orders.slice(0, 5).map((o) => {
                    const isDone = o.status === "Completed";
                    const isCanceled = o.status === "Canceled";
                    return (
                      <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                        <td className="py-3 px-3 font-bold text-white">{o.id}</td>
                        <td className="py-3 px-3 max-w-[200px] truncate font-medium">{o.service}</td>
                        <td className="py-3 px-3 text-right font-semibold">{o.qty.toLocaleString()}</td>
                        <td className="py-3 px-3 text-right font-black text-emerald-400">{fmtINR(o.charge)}</td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              isDone
                                ? "bg-emerald-500/10 text-emerald-400"
                                : isCanceled
                                ? "bg-rose-500/10 text-rose-400"
                                : "bg-amber-500/10 text-amber-400 animate-pulse"
                            }`}
                          >
                            <span className="h-1.5 w-1.5 rounded-full bg-currentColor" />
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md text-left flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Activity</h3>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              Real-time
            </span>
          </div>

          <div className="feed overflow-y-auto space-y-3 pr-1 max-h-[220px]">
            {liveFeed.map((evt) => (
              <div key={evt.id} className="flex items-center gap-3 py-2 border-b border-white/5">
                <span className={`grid h-8 w-8 place-items-center rounded-lg bg-white/5 text-white shrink-0`}>
                  <Activity size={14} className="text-blue-400" />
                </span>
                <div className="flex-1 text-[12.5px] text-slate-300">
                  {/* Parse bold tags */}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: evt.text.replace(/\*\*(.*?)\*\*/g, '<b class="text-white font-bold">$1</b>'),
                    }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-bold shrink-0">{evt.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUICK ORDER + SYSTEM HEALTH */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Order Form */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md text-left flex flex-col">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-5 flex items-center gap-2">
            <Zap size={15} className="text-amber-400 fill-amber-400" />
            Quick Order
          </h3>

          <div className="space-y-3.5 flex-1">
            <div className="flex flex-col">
              <label className="text-[10.5px] font-extrabold uppercase tracking-wide text-slate-400 mb-1.5">Service Selection</label>
              <select
                value={qoServiceId}
                onChange={(e) => setQoServiceId(e.target.value)}
                className="rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 focus:bg-white/[0.03]"
              >
                {marketLoading ? (
                  <option>Loading services catalog...</option>
                ) : (
                  quickPicks.map((s) => (
                    <option key={s.id} value={s.id} className="bg-[#090D16] text-white">
                      {s.name.slice(0, 36)}... — {fmtINR(s.price)}/1K
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-[10.5px] font-extrabold uppercase tracking-wide text-slate-400 mb-1.5">Target URL Link</label>
              <input
                type="text"
                placeholder="https://instagram.com/my-post"
                value={qoLink}
                onChange={(e) => setQoLink(e.target.value)}
                className="rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:bg-white/[0.03]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10.5px] font-extrabold uppercase tracking-wide text-slate-400 mb-1.5">Quantity</label>
              <input
                type="number"
                min={100}
                value={qoQty}
                onChange={(e) => setQoQty(Math.max(1, parseInt(e.target.value, 10) || 0))}
                className="rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500 focus:bg-white/[0.03]"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 border border-white/5 bg-white/[0.01] rounded-xl mb-4 text-xs font-bold">
              <span className="text-slate-400">Calculated Charge:</span>
              <b className="text-lg text-emerald-400 font-extrabold">{fmtINR(qoCharge)}</b>
            </div>

            <button
              onClick={handleQuickOrder}
              disabled={marketLoading || !qoServiceId}
              className="btn btn-cta btn-block !py-3 !text-sm flex items-center justify-center gap-2"
            >
              <Zap size={14} />
              <span>Place order now</span>
            </button>
          </div>
        </div>

        {/* Top picked services */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md text-left flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Top Services</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">BEST OFFERS</span>
          </div>

          <div className="space-y-3.5 pr-1 flex-1 overflow-y-auto max-h-[300px]">
            {marketLoading ? (
              <div className="py-8 text-center text-slate-500 text-xs font-semibold">Loading top services list...</div>
            ) : (
              services
                .slice()
                .sort((a, b) => b.margin_pct - a.margin_pct)
                .slice(0, 5)
                .map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3.5 py-2 border-b border-white/5">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600/10 text-blue-400 text-xs font-black">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <b className="text-xs text-white truncate block font-bold">{s.name}</b>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5 uppercase tracking-wide">
                        {s.platform} • {s.category}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <b className="text-xs text-white block">{fmtINR(s.price)}</b>
                      <span className="text-[10px] font-black text-emerald-400 mt-0.5 block">
                        +{s.margin_pct}% Margin
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Provider health monitors */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md text-left flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Provider Health</h3>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LIVE STATUS</span>
          </div>

          <div className="space-y-4 my-auto">
            {[
              { name: "LuvSMM", role: "Primary Router", status: "Operational", color: "bg-emerald-400", time: "110ms" },
              { name: "EasySMM", role: "Backup Failover", status: "Operational", color: "bg-emerald-400", time: "140ms" },
              { name: "MetaPanel", role: "Alternative Router", status: "Degraded Performance", color: "bg-amber-400", time: "850ms" },
              { name: "Razorpay Gateway", role: "UPI Deposits", status: "Operational", color: "bg-emerald-400", time: "95ms" },
              { name: "Reseller API Server", role: "JSON Gateway", status: "Operational", color: "bg-emerald-400", time: "40ms" },
            ].map((p, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-bold border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center gap-2.5">
                  <span className="h-6 w-6 rounded-lg bg-white/5 font-extrabold flex items-center justify-center text-[10px] text-blue-400 shrink-0">
                    {p.name[0]}
                  </span>
                  <div>
                    <div className="text-white font-bold">{p.name}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{p.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className={`h-1.5 w-1.5 rounded-full ${p.color}`} />
                    <span className={p.status === "Operational" ? "text-emerald-400" : "text-amber-400"}>
                      {p.status}
                    </span>
                  </div>
                  <div className="text-[9.5px] text-slate-500 mt-0.5 font-bold">ping {p.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* POPULAR CATEGORIES */}
      <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md text-left">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Popular Categories</h3>
          <Link href="/services" className="text-xs font-bold text-blue-400 hover:text-blue-300">
            Browse all &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {POPULAR_CATEGORIES.map((c) => (
            <Link
              key={c.platform}
              href={`/services?platform=${c.platform}`}
              className="flex flex-col items-center gap-3.5 p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] hover:-translate-y-1 hover:border-blue-500/25 transition-all text-center group cursor-pointer"
            >
              <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr ${c.color} text-white font-extrabold`}>
                <span className="text-lg">{c.icon}</span>
              </span>
              <div>
                <div className="text-xs font-black text-white group-hover:text-blue-400 transition-colors">
                  {c.platform}
                </div>
                <span className="text-[10px] text-slate-500 font-bold block mt-0.5 uppercase tracking-wide">
                  Explore svcs
                </span>
              </div>
            </Link>
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
