"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart2, Users, ShoppingBag, Wallet, TrendingUp, RefreshCw,
  AlertTriangle, XCircle, Zap, Database, Shield, PlusCircle, CheckCircle2,
  Lightbulb, Star, Gift,
} from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { api, type AdminSummaryResponse, type AdminOrderRow, type AdminUserRow, type AdminReferralResponse } from "@/lib/api";
import { fmtINR } from "@/lib/account";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const ADMIN_EMAIL = "getkriyava@gmail.com";

function StatCard({ label, value, sub, color, icon: Icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ElementType }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 p-5 flex items-start gap-4">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${color}`}><Icon size={20} /></span>
      <div className="min-w-0">
        <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">{label}</div>
        <div className="font-display text-2xl font-black text-white mt-0.5">{value}</div>
        {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "completed") return <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20">Completed</span>;
  if (s === "failed") return <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-[10px] font-black border border-rose-500/20">Failed</span>;
  if (s === "canceled") return <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 text-[10px] font-black border border-slate-500/20">Canceled</span>;
  return <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-black border border-amber-500/20">{status}</span>;
}

function RevenueChart({ orders }: { orders: AdminOrderRow[] }) {
  const days = 14;
  const now = Date.now();
  const MS = 24 * 3600 * 1000;
  const buckets = Array.from({ length: days }, (_, i) => {
    const dayStart = new Date(now - (days - 1 - i) * MS);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + MS);
    const dayOrders = orders.filter((o) => {
      const t = new Date(o.time).getTime();
      return t >= dayStart.getTime() && t < dayEnd.getTime() && o.status !== "Failed" && o.status !== "Canceled";
    });
    return {
      label: dayStart.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      revenue: +dayOrders.reduce((s, o) => s + o.charge, 0).toFixed(2),
      cost: +dayOrders.reduce((s, o) => s + o.providerCost, 0).toFixed(2),
      profit: +dayOrders.reduce((s, o) => s + o.profit, 0).toFixed(2),
    };
  });
  const maxR = Math.max(...buckets.map((b) => b.revenue), 1);
  const W = 560; const H = 140; const pad = 10; const barW = (W - pad * 2) / days;
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Revenue vs Cost — Last 14 Days</h3>
        <div className="flex items-center gap-3 text-[10px] font-bold">
          <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-blue-500 inline-block" />Revenue</span>
          <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-rose-500 inline-block" />Cost</span>
          <span className="flex items-center gap-1"><span className="h-2 w-3 rounded bg-purple-500 inline-block" />Profit</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H + 20}`} width="100%" style={{ minWidth: 300 }}>
          {buckets.map((b, i) => {
            const x = pad + i * barW;
            const rH = (b.revenue / maxR) * H;
            const cH = (b.cost / maxR) * H;
            const pH = (b.profit / maxR) * H;
            const gap = barW * 0.08;
            const bw = (barW - gap * 4) / 3;
            return (
              <g key={i}>
                <rect x={x + gap} y={H - rH} width={bw} height={rH} rx="2" fill="#3b82f6" opacity="0.8" />
                <rect x={x + gap + bw + gap} y={H - cH} width={bw} height={cH} rx="2" fill="#f43f5e" opacity="0.7" />
                <rect x={x + gap + bw * 2 + gap * 2} y={H - pH} width={bw} height={pH} rx="2" fill="#a855f7" opacity="0.8" />
                {i % 3 === 0 && <text x={x + barW / 2} y={H + 15} textAnchor="middle" fontSize="7" fill="#64748b">{b.label}</text>}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

type Tab = "overview" | "orders" | "users" | "providers" | "deposits" | "referrals" | "roadmap";

const ROADMAP = [
  { status: "live", label: "Multi-provider routing (EasySMM + LuvSMM + FineSMM)", desc: "Auto cheapest first, balance-aware failover" },
  { status: "live", label: "Razorpay payments with HMAC verification", desc: "Server-side signature check, instant wallet credit" },
  { status: "live", label: "15% markup auto-applied on all services", desc: "Refreshed every 30 minutes from live provider catalog" },
  { status: "live", label: "Admin CRM with manual fund credit", desc: "Full order/user/provider analytics" },
  { status: "next", label: "Broadcast message to all users", desc: "Show a notice/announcement on all dashboards" },
  { status: "next", label: "Coupon / promo code system", desc: "Admin creates codes, users apply at checkout" },
  { status: "next", label: "Provider balance auto-alert email", desc: "Email getkriyava@gmail.com when any provider drops below ₹100" },
  { status: "next", label: "Margin settings per category", desc: "Set 15% for Followers, 20% for Likes, etc." },
  { status: "next", label: "Order status auto-sync from provider", desc: "Poll provider /status and update DB every 5 min" },
  { status: "next", label: "Child panel / reseller accounts", desc: "Give sub-resellers their own panel with custom pricing" },
  { status: "next", label: "Telegram bot alerts for new orders", desc: "Notify admin bot on every new order placed" },
  { status: "future", label: "Affiliate / referral system", desc: "Users earn % on referred orders" },
  { status: "future", label: "Subscription / auto-reorder packs", desc: "Buy 1000 followers/month recurring plan" },
  { status: "future", label: "AI service recommender for users", desc: "Suggest best service based on goal + budget" },
  { status: "future", label: "White-label child panel builder", desc: "Resellers get their own domain + branding" },
];

export default function AdminPage() {
  const { account } = useAccount();
  const router = useRouter();
  const [data, setData] = useState<AdminSummaryResponse | null>(null);
  const [refData, setRefData] = useState<AdminReferralResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [orderFilter, setOrderFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  // Manual fund add state
  const [fundEmail, setFundEmail] = useState("");
  const [fundAmount, setFundAmountStr] = useState("100");
  const [fundNote, setFundNote] = useState("");
  const [fundLoading, setFundLoading] = useState(false);
  const [fundMsg, setFundMsg] = useState("");

  useEffect(() => {
    if (!account.email) return;
    if (account.email !== ADMIN_EMAIL) { router.replace("/dashboard"); return; }
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.email]);

  const fetchData = async () => {
    setLoading(true); setError("");
    try {
      const [summary, referrals] = await Promise.all([api.adminSummary(), api.adminReferrals()]);
      setData(summary);
      setRefData(referrals);
    } catch (e) { setError(e instanceof Error ? e.message : "Load failed"); }
    finally { setLoading(false); }
  };

  const handleRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(fundAmount, 10);
    if (!fundEmail || !amt || amt <= 0) { setFundMsg("❌ Fill email and valid amount"); return; }
    setFundLoading(true); setFundMsg("");
    try {
      const res = await api.adminAddFunds(fundEmail, amt, fundNote || undefined);
      setFundMsg(`✅ Added ${fmtINR(res.added)} to ${fundEmail}. New balance: ${fmtINR(res.newBalance)}`);
      setFundEmail(""); setFundAmountStr("100"); setFundNote("");
      await fetchData();
    } catch (e) { setFundMsg("❌ " + (e instanceof Error ? e.message : "Failed")); }
    finally { setFundLoading(false); }
  };

  if (!account.email || account.email !== ADMIN_EMAIL) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <Shield size={40} className="text-rose-400" />
          <h2 className="text-xl font-black text-white">Admin Access Only</h2>
          <p className="text-slate-400 text-sm">Only getkriyava@gmail.com can view this page.</p>
          <Link href="/dashboard" className="btn btn-primary">← Dashboard</Link>
        </div>
      </DashboardShell>
    );
  }

  const filteredOrders = (data?.recentOrders || []).filter((o) =>
    orderFilter === "All" ? true : o.status.toLowerCase() === orderFilter.toLowerCase()
  );

  const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: BarChart2 },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "users", label: "Users", icon: Users },
    { key: "providers", label: "Providers", icon: Database },
    { key: "deposits", label: "Deposits", icon: Wallet },
    { key: "referrals", label: "Referrals", icon: Gift },
    { key: "roadmap", label: "Roadmap", icon: Lightbulb },
  ];

  return (
    <DashboardShell>
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-5 w-5 grid place-items-center rounded bg-amber-500/20 text-amber-400"><Shield size={11} /></span>
            <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-widest">Admin CRM</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-black text-white">Kriyava Control Panel</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">{data?.asOf ? `Updated: ${data.asOf}` : "Loading…"}</p>
        </div>
        <button onClick={() => void handleRefresh()} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-bold text-slate-300 hover:text-white">
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && <div className="mb-5 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-bold flex items-center gap-2"><AlertTriangle size={13} />{error}</div>}

      {/* TABS */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1 mb-6 border-b border-white/5">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all rounded-t-lg -mb-px border-b-2 ${
              tab === t.key ? "border-blue-500 text-white bg-blue-600/5" : "border-transparent text-slate-400 hover:text-white"
            }`}>
            <t.icon size={13} />{t.label}
          </button>
        ))}
      </div>

      {loading && <div className="flex items-center justify-center py-20 text-slate-500 text-sm font-bold gap-2"><RefreshCw size={16} className="animate-spin" />Loading…</div>}

      {!loading && data && (
        <>
          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={data.totalUsers} sub="registered" color="text-blue-400 bg-blue-500/10" icon={Users} />
                <StatCard label="Today Revenue" value={fmtINR(data.today.revenue)} sub={`${data.today.activeCount} orders`} color="text-emerald-400 bg-emerald-500/10" icon={TrendingUp} />
                <StatCard label="Today Profit" value={fmtINR(data.today.profit)} sub={data.today.revenue > 0 ? `${((data.today.profit/data.today.revenue)*100).toFixed(1)}% margin` : "—"} color="text-purple-400 bg-purple-500/10" icon={Zap} />
                <StatCard label="Today Deposits" value={fmtINR(data.todayDeposits)} sub="via Razorpay" color="text-amber-400 bg-amber-500/10" icon={Wallet} />
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="All-Time Revenue" value={fmtINR(data.allTime.revenue)} sub={`${data.allTime.activeCount} orders`} color="text-cyan-400 bg-cyan-500/10" icon={BarChart2} />
                <StatCard label="All-Time Profit" value={fmtINR(data.allTime.profit)} color="text-violet-400 bg-violet-500/10" icon={TrendingUp} />
                <StatCard label="Provider Cost" value={fmtINR(data.allTime.providerCost)} color="text-rose-400 bg-rose-500/10" icon={Database} />
                <StatCard label="Failed Orders" value={data.allTime.failedCount} sub="wallet refunded" color="text-slate-400 bg-slate-500/10" icon={XCircle} />
              </div>

              <RevenueChart orders={data.recentOrders} />

              {/* Provider health */}
              <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 p-5">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Provider Balances</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(data.providerStatus.balances).map(([name, bal]) => {
                    const [amt, cur] = bal.split(" ");
                    const parsed = parseFloat(amt);
                    const low = Number.isNaN(parsed) || parsed < 5;
                    return (
                      <div key={name} className={`rounded-xl border p-4 ${low ? "border-rose-500/30 bg-rose-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-white">{name}</span>
                          <span className={`text-[10px] font-black ${low ? "text-rose-400" : "text-emerald-400"}`}>{low ? "⚠ LOW" : "✓ OK"}</span>
                        </div>
                        <div className={`text-xl font-black ${low ? "text-rose-400" : "text-emerald-400"}`}>{amt} <span className="text-xs font-bold text-slate-400">{cur}</span></div>
                        <div className="text-[10px] text-slate-500 mt-1">{(data.providerStatus.providers[name] || 0).toLocaleString()} services</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Today orders */}
              <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 p-5">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Today's Orders</h3>
                {data.today.orders.length === 0 && <p className="text-slate-500 text-xs">No orders yet today.</p>}
                {data.today.orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-white/[0.04] last:border-0 text-xs">
                    <div className="min-w-0 flex-1"><div className="text-white font-bold truncate">{o.service}</div><div className="text-slate-500 text-[10px]">{o.time.split(",")[0]} · {o.provider} · qty {o.qty}</div></div>
                    <div className="text-right shrink-0"><div className="font-black text-emerald-400">{fmtINR(o.charge)}</div><div className="text-[10px] text-purple-400">+{fmtINR(o.profit)}</div></div>
                    <StatusBadge status={o.status} />
                  </div>
                ))}
                {data.today.orders.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-3 text-center text-xs">
                    <div><div className="text-slate-500">Charged</div><div className="font-black text-white">{fmtINR(data.today.revenue)}</div></div>
                    <div><div className="text-slate-500">Provider</div><div className="font-black text-rose-400">{fmtINR(data.today.providerCost)}</div></div>
                    <div><div className="text-slate-500">Profit</div><div className="font-black text-purple-400">{fmtINR(data.today.profit)}</div></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-sm font-black text-white">All Orders ({data.recentOrders.length})</h3>
                <div className="flex gap-1 flex-wrap">
                  {["All","Processing","Completed","Failed","Canceled"].map((s) => (
                    <button key={s} onClick={() => setOrderFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold ${orderFilter===s?"bg-blue-600 text-white":"text-slate-400 bg-white/[0.02] border border-white/5"}`}>{s}</button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 overflow-x-auto">
                <table className="w-full text-xs text-slate-300">
                  <thead><tr className="border-b border-white/5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 text-left">Time</th><th className="py-3 px-4 text-left">Service</th>
                    <th className="py-3 px-4 text-right">Qty</th><th className="py-3 px-4 text-right">Charged</th>
                    <th className="py-3 px-4 text-right">Cost</th><th className="py-3 px-4 text-right text-purple-400">Profit</th>
                    <th className="py-3 px-4 text-center">Status</th><th className="py-3 px-4">Provider</th>
                  </tr></thead>
                  <tbody>
                    {filteredOrders.map((o: AdminOrderRow) => (
                      <tr key={o.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{o.time.split(",")[0]}</td>
                        <td className="py-3 px-4 max-w-[160px]"><div className="truncate font-medium">{o.service}</div><div className="text-[10px] text-slate-600">{o.platform}</div></td>
                        <td className="py-3 px-4 text-right">{o.qty.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-black text-white">{fmtINR(o.charge)}</td>
                        <td className="py-3 px-4 text-right text-rose-400">{fmtINR(o.providerCost)}</td>
                        <td className="py-3 px-4 text-right font-black text-purple-400">{fmtINR(o.profit)}</td>
                        <td className="py-3 px-4 text-center"><StatusBadge status={o.status} /></td>
                        <td className="py-3 px-4 text-slate-400">{o.provider}</td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && <tr><td colSpan={8} className="py-10 text-center text-slate-500 text-xs">No orders</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <div className="space-y-5">
              {/* Manual fund add */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <h3 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2"><PlusCircle size={13} /> Manual Fund Credit</h3>
                <form onSubmit={(e) => void handleAddFunds(e)} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block mb-1">User Email</label>
                      <input type="email" value={fundEmail} onChange={(e) => setFundEmail(e.target.value)} placeholder="user@email.com" required
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block mb-1">Amount (₹)</label>
                      <input type="text" inputMode="numeric" value={fundAmount} onChange={(e) => setFundAmountStr(e.target.value.replace(/\D/g,""))} placeholder="100" required
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block mb-1">Note (optional)</label>
                      <input type="text" value={fundNote} onChange={(e) => setFundNote(e.target.value)} placeholder="e.g. bonus credit"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500" />
                    </div>
                  </div>
                  <button type="submit" disabled={fundLoading}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs hover:bg-amber-400 transition-all disabled:opacity-50">
                    {fundLoading ? "Adding…" : "Add Funds to User"}
                  </button>
                  {fundMsg && <p className={`text-xs font-bold mt-2 ${fundMsg.startsWith("✅") ? "text-emerald-400" : "text-rose-400"}`}>{fundMsg}</p>}
                </form>
              </div>

              {/* Users table */}
              <h3 className="text-sm font-black text-white">All Users ({data.users.length})</h3>
              <div className="sm:hidden space-y-3">
                {data.users.map((u: AdminUserRow) => (
                  <div key={u.id} className="rounded-xl border border-white/5 bg-[#0D1321]/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div><div className="text-xs font-black text-white">{u.name}</div><div className="text-[10px] text-slate-400">{u.email}</div></div>
                      {u.role === "admin" && <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">ADMIN</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="rounded-lg bg-white/[0.03] p-2"><div className="text-[9px] text-slate-500">Balance</div><div className="text-xs font-black text-emerald-400">{fmtINR(u.balance)}</div></div>
                      <div className="rounded-lg bg-white/[0.03] p-2"><div className="text-[9px] text-slate-500">Spent</div><div className="text-xs font-black text-white">{fmtINR(u.spent)}</div></div>
                    </div>
                    <button onClick={() => setFundEmail(u.email)} className="w-full py-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] font-bold">+ Add Funds</button>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block rounded-2xl border border-white/5 bg-[#0D1321]/60 overflow-x-auto">
                <table className="w-full text-xs text-slate-300">
                  <thead><tr className="border-b border-white/5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 text-left">User</th><th className="py-3 px-4 text-right">Balance</th>
                    <th className="py-3 px-4 text-right">Spent</th><th className="py-3 px-4 text-center">Role</th>
                    <th className="py-3 px-4 text-left">Joined</th><th className="py-3 px-4 text-center">Action</th>
                  </tr></thead>
                  <tbody>
                    {data.users.map((u: AdminUserRow) => (
                      <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                        <td className="py-3 px-4"><div className="font-bold text-white">{u.name}</div><div className="text-[10px] text-slate-500">{u.email}</div></td>
                        <td className="py-3 px-4 text-right font-black text-emerald-400">{fmtINR(u.balance)}</td>
                        <td className="py-3 px-4 text-right">{fmtINR(u.spent)}</td>
                        <td className="py-3 px-4 text-center">{u.role==="admin"?<span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">ADMIN</span>:<span className="text-[9px] text-slate-500">user</span>}</td>
                        <td className="py-3 px-4 text-slate-500">{u.joined.split(",")[0]}</td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => { setFundEmail(u.email); setTab("users"); }} className="px-2.5 py-1 rounded border border-amber-500/20 bg-amber-500/5 text-amber-400 text-[10px] font-bold hover:bg-amber-500/10">+ Fund</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── PROVIDERS ── */}
          {tab === "providers" && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white">Provider Management</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(data.providerStatus.balances).map(([name, bal]) => {
                  const [amt, cur] = bal.split(" ");
                  const low = parseFloat(amt) < 5;
                  return (
                    <div key={name} className={`rounded-2xl border p-5 space-y-3 ${low?"border-rose-500/30 bg-rose-500/5":"border-white/5 bg-[#0D1321]/60"}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-white">{name}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${low?"text-rose-400 bg-rose-500/10 border-rose-500/20":"text-emerald-400 bg-emerald-500/10 border-emerald-500/20"}`}>{low?"⚠ LOW":"✓ ACTIVE"}</span>
                      </div>
                      <div className={`text-2xl font-black ${low?"text-rose-400":"text-emerald-400"}`}>{amt} <span className="text-xs font-bold text-slate-400">{cur}</span></div>
                      <div className="text-[11px] text-slate-400"><span className="font-bold text-white">{(data.providerStatus.providers[name]||0).toLocaleString()}</span> services</div>
                      {low && <div className="text-[11px] text-rose-400 bg-rose-500/10 rounded-lg p-2 font-bold">⚡ Add funds to resume cheapest routing</div>}
                    </div>
                  );
                })}
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 p-5">
                <div className="text-sm font-bold text-white">{data.providerStatus.services.toLocaleString()} total services</div>
                <div className="text-[11px] text-slate-400 mt-1">Catalog refreshes every 30 min. Cheapest provider auto-selected per service.</div>
              </div>
            </div>
          )}

          {/* ── DEPOSITS ── */}
          {tab === "deposits" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white">All Deposits ({data.deposits.length})</h3>
                <div className="text-xs font-bold text-emerald-400">Total: {fmtINR(data.deposits.reduce((s,d)=>s+d.amount,0))}</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 overflow-hidden">
                {data.deposits.map((d, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.01] text-xs">
                    <div><div className="font-bold text-white">{fmtINR(d.amount)}</div><div className="text-[10px] text-slate-500 mt-0.5">{d.time}</div></div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${d.method==="Manual"?"text-amber-400 bg-amber-500/10 border-amber-500/20":"text-emerald-400 bg-emerald-500/10 border-emerald-500/20"}`}>{d.method}</span>
                      {d.note && <div className="text-[10px] text-slate-500 mt-0.5 max-w-[120px] truncate">{d.note}</div>}
                    </div>
                  </div>
                ))}
                {data.deposits.length === 0 && <div className="py-10 text-center text-slate-500 text-xs">No deposits yet</div>}
              </div>
            </div>
          )}

          {/* ── REFERRALS ── */}
          {tab === "referrals" && refData && (
            <div className="space-y-5">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Active Referrers", value: refData.summary.totalReferrers, color: "text-emerald-400 bg-emerald-500/10" },
                  { label: "Users Referred", value: refData.summary.totalReferred, color: "text-blue-400 bg-blue-500/10" },
                  { label: "Total Paid Out", value: fmtINR(refData.summary.totalPaidOut), color: "text-purple-400 bg-purple-500/10" },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl border border-white/5 bg-[#0D1321]/60 p-4 text-center">
                    <div className={`text-xl font-black ${s.color.split(" ")[0]}`}>{s.value}</div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Top referrers */}
              <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                  <Gift size={13} className="text-emerald-400" />
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">Top Referrers</span>
                </div>
                {refData.topReferrers.length === 0 && <div className="py-8 text-center text-slate-500 text-xs">No referrals yet.</div>}
                {refData.topReferrers.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-white/[0.03] hover:bg-white/[0.01] text-xs">
                    <div>
                      <div className="font-bold text-white">{r.name}</div>
                      <div className="text-[10px] text-slate-500">{r.email}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono text-[11px] text-blue-400">{r.referralCode || "—"}</div>
                      <div className="text-[10px] text-slate-500">{r.referredCount} referrals</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-emerald-400">{fmtINR(r.earned)}</div>
                      <div className="text-[10px] text-slate-500">earned</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent activity */}
              <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 overflow-hidden">
                <div className="px-5 py-3 border-b border-white/5">
                  <span className="text-xs font-extrabold text-white uppercase tracking-wider">Recent Cashback Activity</span>
                </div>
                {refData.recentActivity.length === 0 && <div className="py-8 text-center text-slate-500 text-xs">No activity yet.</div>}
                {refData.recentActivity.map((a, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3 border-b border-white/[0.03] hover:bg-white/[0.01] text-xs">
                    <div>
                      <div className="text-emerald-400 font-black">{fmtINR(a.amount)}</div>
                      <div className="text-[10px] text-slate-500">{a.note}</div>
                    </div>
                    <div className="text-slate-500 text-[10px]">{a.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ROADMAP ── */}
          {tab === "roadmap" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-black text-white mb-1">Kriyava Roadmap & Feature Backlog</h3>
                <p className="text-xs text-slate-400">Track what's live, what's next, and future feature ideas.</p>
              </div>
              {(["live", "next", "future"] as const).map((phase) => (
                <div key={phase} className="space-y-2">
                  <div className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-2 ${phase==="live"?"text-emerald-400":phase==="next"?"text-blue-400":"text-slate-500"}`}>
                    {phase==="live" && <CheckCircle2 size={11} />}
                    {phase==="next" && <Zap size={11} />}
                    {phase==="future" && <Star size={11} />}
                    {phase==="live"?"✓ Live & Deployed":phase==="next"?"⚡ Next Priority":"★ Future Ideas"}
                  </div>
                  <div className="space-y-1.5">
                    {ROADMAP.filter((r)=>r.status===phase).map((r, i) => (
                      <div key={i} className={`rounded-xl border p-3.5 flex items-start gap-3 ${phase==="live"?"border-emerald-500/15 bg-emerald-500/5":phase==="next"?"border-blue-500/15 bg-blue-500/5":"border-white/5 bg-white/[0.01]"}`}>
                        <span className={`mt-0.5 shrink-0 h-2 w-2 rounded-full ${phase==="live"?"bg-emerald-400":phase==="next"?"bg-blue-400":"bg-slate-600"}`} />
                        <div>
                          <div className={`text-xs font-bold ${phase==="live"?"text-white":phase==="next"?"text-white":"text-slate-400"}`}>{r.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{r.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Sticky action hint */}
      <div className="h-6" />
    </DashboardShell>
  );
}
