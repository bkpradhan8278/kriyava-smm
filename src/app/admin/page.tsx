"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart2, Users, ShoppingBag, Wallet, TrendingUp, RefreshCw,
  AlertTriangle, XCircle, Zap, Database, Shield, PlusCircle, CheckCircle2,
  Lightbulb, Star, Gift, Settings, Inbox, MessageSquare, Bot, Mail,
} from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { api, type AdminSummaryResponse, type AdminOrderRow, type AdminUserRow, type AdminReferralResponse, type AdminServiceCatalogMeta, type AdminCatalogService, type AdminLeadsResponse, type AdminLeadRow } from "@/lib/api";
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

type Tab = "overview" | "orders" | "users" | "providers" | "deposits" | "referrals" | "roadmap" | "services" | "leads";

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

  const [providerRefreshing, setProviderRefreshing] = useState(false);
  const [providerMsg, setProviderMsg] = useState("");

  const [svcMeta, setSvcMeta] = useState<AdminServiceCatalogMeta | null>(null);
  const [catalog, setCatalog] = useState<AdminCatalogService[]>([]);
  const [svcLoading, setSvcLoading] = useState(false);
  const [svcMsg, setSvcMsg] = useState("");
  const [svcSearch, setSvcSearch] = useState("");
  const [svcPlatform, setSvcPlatform] = useState("All");
  const [svcProviderFilter, setSvcProviderFilter] = useState("All");
  const [svcEnabledFilter, setSvcEnabledFilter] = useState<"All" | "Enabled" | "Disabled">("All");
  const [svcPage, setSvcPage] = useState(0);
  const [markupEdit, setMarkupEdit] = useState<Record<string, string>>({});

  // Leads state
  const [leadsData, setLeadsData] = useState<AdminLeadsResponse | null>(null);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadFilter, setLeadFilter] = useState<"All" | "contact" | "ai_chat" | "ticket">("All");
  const [expandedLead, setExpandedLead] = useState<string | null>(null);

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

  useEffect(() => {
    if (tab === "services") void loadServiceTab();
    if (tab === "leads") void loadLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const loadLeads = async () => {
    setLeadsLoading(true);
    try {
      const res = await api.adminLeads();
      setLeadsData(res);
    } catch (e) { setError(e instanceof Error ? e.message : "Leads load failed"); }
    finally { setLeadsLoading(false); }
  };

  const handleLeadStatus = async (lead: AdminLeadRow, status: string) => {
    try {
      await api.adminLeadStatus(lead.id, lead.kind, status);
      setLeadsData((prev) => prev ? {
        ...prev,
        leads: prev.leads.map((l) => l.id === lead.id ? { ...l, status } : l),
        counts: { ...prev.counts, unresolved: prev.leads.filter((l) => l.id === lead.id ? (status === "New" || status === "Open") : (l.status === "New" || l.status === "Open")).length },
      } : prev);
    } catch { /* silent */ }
  };

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

  const handleProviderRefresh = async () => {
    setProviderRefreshing(true); setProviderMsg("");
    try {
      const res = await api.adminRefreshProviders();
      setData((prev) => prev ? { ...prev, providerStatus: res.providerStatus } : prev);
      setProviderMsg("✅ Balances refreshed from all providers");
    } catch (e) { setProviderMsg("❌ " + (e instanceof Error ? e.message : "Refresh failed")); }
    finally { setProviderRefreshing(false); }
  };

  const loadServiceTab = async () => {
    if (svcMeta) return; // already loaded
    setSvcLoading(true); setSvcMsg("");
    try {
      const [meta, full] = await Promise.all([api.adminServiceCatalogMeta(), api.adminFullCatalog()]);
      setSvcMeta(meta);
      setCatalog(full.services);
      // Seed markup edit from overrides
      const init: Record<string, string> = {};
      for (const [k, v] of Object.entries(meta.markupOverrides)) init[k] = String(v);
      setMarkupEdit(init);
    } catch (e) { setSvcMsg("❌ " + (e instanceof Error ? e.message : "Load failed")); }
    finally { setSvcLoading(false); }
  };

  const handleToggleProvider = async (key: string, currentEnabled: boolean) => {
    setSvcMsg("");
    try {
      await api.adminToggleProvider(key, !currentEnabled);
      setSvcMeta(prev => prev ? { ...prev, providers: prev.providers.map(p => p.key === key ? { ...p, enabled: !currentEnabled } : p) } : prev);
      setCatalog(prev => prev.map(s => s.providerKey === key ? { ...s, enabled: !currentEnabled } : s));
      setSvcMsg(`✅ ${key.toUpperCase()} ${!currentEnabled ? "enabled" : "disabled"}`);
    } catch (e) { setSvcMsg("❌ " + (e instanceof Error ? e.message : "Failed")); }
  };

  const handleToggleService = async (serviceId: string, currentEnabled: boolean) => {
    try {
      await api.adminToggleService(serviceId, !currentEnabled);
      setCatalog(prev => prev.map(s => s.id === serviceId ? { ...s, enabled: !currentEnabled } : s));
    } catch { /* silent */ }
  };

  const handleMarkupSave = async (target: string) => {
    const valStr = markupEdit[target];
    const val = valStr === "" || valStr === undefined ? null : Number(valStr);
    if (val !== null && (isNaN(val) || val < 1 || val > 200)) { setSvcMsg("❌ Markup must be 1–200%"); return; }
    setSvcMsg("");
    try {
      await api.adminSetMarkup(target, val);
      setSvcMeta(prev => {
        if (!prev) return prev;
        const overrides = { ...prev.markupOverrides };
        if (val === null) delete overrides[target];
        else overrides[target] = val;
        return { ...prev, markupOverrides: overrides };
      });
      setSvcMsg(`✅ Markup for "${target}" set to ${val === null ? "auto" : val + "%"}`);
      // Reload catalog since prices changed
      setTimeout(() => { setSvcMeta(null); void api.adminFullCatalog().then(r => setCatalog(r.services)); }, 2000);
    } catch (e) { setSvcMsg("❌ " + (e instanceof Error ? e.message : "Failed")); }
  };

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
    { key: "leads" as Tab, label: "Leads", icon: Inbox },
    { key: "orders", label: "Orders", icon: ShoppingBag },
    { key: "users", label: "Users", icon: Users },
    { key: "providers", label: "Providers", icon: Database },
    { key: "services" as Tab, label: "Services", icon: Settings },
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

          {/* ── LEADS ── */}
          {tab === "leads" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white">Leads Inbox</h3>
                  <p className="text-[11px] text-slate-500">Contact forms, AI chats, and support tickets — all in one place.</p>
                </div>
                <button onClick={() => void loadLeads()} disabled={leadsLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[11px] font-bold hover:bg-blue-500/20 disabled:opacity-50">
                  <RefreshCw size={11} className={leadsLoading ? "animate-spin" : ""} /> Refresh
                </button>
              </div>

              {/* Count chips */}
              {leadsData && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button onClick={() => setLeadFilter("All")} className={`rounded-xl border p-3 text-left transition-all ${leadFilter === "All" ? "border-blue-500/40 bg-blue-500/10" : "border-white/5 bg-[#0D1321]/60 hover:border-white/10"}`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider"><Inbox size={12} /> All</div>
                    <div className="text-xl font-black text-white mt-1">{leadsData.counts.total}</div>
                  </button>
                  <button onClick={() => setLeadFilter("contact")} className={`rounded-xl border p-3 text-left transition-all ${leadFilter === "contact" ? "border-emerald-500/40 bg-emerald-500/10" : "border-white/5 bg-[#0D1321]/60 hover:border-white/10"}`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider"><Mail size={12} /> Contact</div>
                    <div className="text-xl font-black text-emerald-400 mt-1">{leadsData.counts.contact}</div>
                  </button>
                  <button onClick={() => setLeadFilter("ai_chat")} className={`rounded-xl border p-3 text-left transition-all ${leadFilter === "ai_chat" ? "border-purple-500/40 bg-purple-500/10" : "border-white/5 bg-[#0D1321]/60 hover:border-white/10"}`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider"><Bot size={12} /> AI Chat</div>
                    <div className="text-xl font-black text-purple-400 mt-1">{leadsData.counts.ai_chat}</div>
                  </button>
                  <button onClick={() => setLeadFilter("ticket")} className={`rounded-xl border p-3 text-left transition-all ${leadFilter === "ticket" ? "border-amber-500/40 bg-amber-500/10" : "border-white/5 bg-[#0D1321]/60 hover:border-white/10"}`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider"><MessageSquare size={12} /> Tickets</div>
                    <div className="text-xl font-black text-amber-400 mt-1">{leadsData.counts.ticket}</div>
                  </button>
                </div>
              )}

              {leadsLoading && <div className="flex items-center gap-2 justify-center py-10 text-slate-500 text-sm"><RefreshCw size={14} className="animate-spin" /> Loading leads…</div>}

              {/* Lead list */}
              {leadsData && (
                <div className="space-y-2.5">
                  {leadsData.leads.filter((l) => leadFilter === "All" || l.source === leadFilter).map((l) => {
                    const open = expandedLead === l.id;
                    const srcStyle = l.source === "contact" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : l.source === "ai_chat" ? "text-purple-400 bg-purple-500/10 border-purple-500/20"
                      : "text-amber-400 bg-amber-500/10 border-amber-500/20";
                    const SrcIcon = l.source === "contact" ? Mail : l.source === "ai_chat" ? Bot : MessageSquare;
                    const resolved = l.status !== "New" && l.status !== "Open";
                    return (
                      <div key={l.id} className={`rounded-xl border bg-[#0D1321]/50 overflow-hidden ${resolved ? "border-white/5 opacity-60" : "border-white/10"}`}>
                        <button onClick={() => setExpandedLead(open ? null : l.id)} className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-white/[0.02]">
                          <span className={`shrink-0 mt-0.5 grid h-8 w-8 place-items-center rounded-lg border ${srcStyle}`}><SrcIcon size={14} /></span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[13px] font-bold text-white truncate">{l.name || l.email || "Anonymous"}</span>
                              <span className={`text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${srcStyle}`}>{l.source === "ai_chat" ? "AI Chat" : l.source}</span>
                              {resolved && <span className="text-[8.5px] font-black uppercase text-slate-500">✓ {l.status}</span>}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 truncate">{l.subject ? `${l.subject} · ` : ""}{l.message}</div>
                            <div className="text-[9.5px] text-slate-600 mt-0.5">{l.time}{l.email ? ` · ${l.email}` : ""}</div>
                          </div>
                        </button>
                        {open && (
                          <div className="border-t border-white/5 bg-white/[0.01] p-4 space-y-3">
                            <div>
                              <div className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Message</div>
                              <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">{l.message}</p>
                            </div>
                            {l.reply && (
                              <div>
                                <div className="text-[9px] font-extrabold text-purple-400 uppercase tracking-wider mb-1">AI Reply</div>
                                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-purple-500/5 border border-purple-500/10 rounded-lg p-2.5">{l.reply}</p>
                              </div>
                            )}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              {l.email && (
                                <a href={`mailto:${l.email}`} className="px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[11px] font-bold">✉ Reply by email</a>
                              )}
                              {!resolved ? (
                                <button onClick={() => void handleLeadStatus(l, l.kind === "ticket" ? "Closed" : "Resolved")} className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold">✓ Mark resolved</button>
                              ) : (
                                <button onClick={() => void handleLeadStatus(l, l.kind === "ticket" ? "Open" : "New")} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 text-[11px] font-bold">↺ Reopen</button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {leadsData.leads.filter((l) => leadFilter === "All" || l.source === leadFilter).length === 0 && (
                    <div className="py-12 text-center text-slate-600 text-xs">No leads in this category yet.</div>
                  )}
                </div>
              )}
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
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-white">Provider Management</h3>
                <button
                  onClick={() => void handleProviderRefresh()}
                  disabled={providerRefreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[11px] font-bold hover:bg-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw size={11} className={providerRefreshing ? "animate-spin" : ""} />
                  {providerRefreshing ? "Refreshing…" : "Refresh Balances"}
                </button>
              </div>
              {providerMsg && <div className="text-[11px] font-bold text-slate-300 bg-white/5 rounded-lg px-3 py-2">{providerMsg}</div>}
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

          {/* ── SERVICES ── */}
          {tab === "services" && (
            <div className="space-y-6">
              {svcMsg && <div className="text-[11px] font-bold rounded-lg px-3 py-2 bg-white/5 text-slate-300">{svcMsg}</div>}
              {svcLoading && <div className="flex items-center gap-2 text-slate-500 text-sm py-8 justify-center"><RefreshCw size={14} className="animate-spin" />Loading catalog…</div>}

              {/* Provider Toggles */}
              {svcMeta && (
                <>
                  <div>
                    <h3 className="text-sm font-black text-white mb-3">Provider Management</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {svcMeta.providers.map(p => (
                        <div key={p.key} className={`rounded-2xl border p-4 space-y-3 ${p.enabled ? "border-white/5 bg-[#0D1321]/60" : "border-rose-500/20 bg-rose-500/5"}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-black text-white text-sm">{p.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.apiKeyMasked}</div>
                            </div>
                            <button
                              onClick={() => void handleToggleProvider(p.key, p.enabled)}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-black border transition-all ${
                                p.enabled
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                              }`}
                            >
                              {p.enabled ? "✓ ON" : "✗ OFF"}
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            <span className="text-white font-bold">{p.balance}</span> balance · <span className="text-white font-bold">{p.serviceCount.toLocaleString()}</span> services
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Markup Overrides */}
                  <div>
                    <h3 className="text-sm font-black text-white mb-1">Markup Control</h3>
                    <p className="text-[11px] text-slate-500 mb-3">Set % markup per platform. Leave blank to use auto-calculated markup. Changes rebuild the full catalog (~30s).</p>
                    <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* Global override */}
                        <div className="col-span-2 sm:col-span-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                          <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider mb-2">Global Override (overrides all platforms)</div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={1} max={200}
                              placeholder="e.g. 25 → auto"
                              value={markupEdit["global"] ?? ""}
                              onChange={e => setMarkupEdit(prev => ({ ...prev, global: e.target.value }))}
                              className="w-28 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500"
                            />
                            <span className="text-slate-500 text-xs">%</span>
                            <button onClick={() => void handleMarkupSave("global")} className="px-3 py-2 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-400 text-[11px] font-bold hover:bg-amber-500/20">Save</button>
                            {svcMeta.markupOverrides["global"] && <span className="text-[10px] text-amber-400 font-bold">Currently: {svcMeta.markupOverrides["global"]}%</span>}
                          </div>
                        </div>
                        {/* Per-platform */}
                        {svcMeta.platforms.map(platform => (
                          <div key={platform} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                            <div className="text-[10px] font-bold text-slate-400 mb-2">{platform}</div>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={1} max={200}
                                placeholder="Auto"
                                value={markupEdit[platform] ?? ""}
                                onChange={e => setMarkupEdit(prev => ({ ...prev, [platform]: e.target.value }))}
                                className="w-16 rounded border border-white/10 bg-white/[0.03] px-2 py-1.5 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500"
                              />
                              <span className="text-slate-500 text-[10px]">%</span>
                              <button onClick={() => void handleMarkupSave(platform)} className="px-2 py-1.5 rounded border border-blue-500/20 bg-blue-500/10 text-blue-400 text-[10px] font-bold">Set</button>
                            </div>
                            {svcMeta.markupOverrides[platform] && <div className="text-[10px] text-blue-400 mt-1">→ {svcMeta.markupOverrides[platform]}%</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Service Catalog */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-sm font-black text-white">Service Catalog</h3>
                        <p className="text-[11px] text-slate-500">{catalog.length.toLocaleString()} total · {catalog.filter(s => !s.enabled).length} disabled</p>
                      </div>
                    </div>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Search service name…"
                        value={svcSearch}
                        onChange={e => { setSvcSearch(e.target.value); setSvcPage(0); }}
                        className="flex-1 min-w-[180px] rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500"
                      />
                      <select value={svcPlatform} onChange={e => { setSvcPlatform(e.target.value); setSvcPage(0); }}
                        className="rounded-lg border border-white/5 bg-[#0D1321] px-3 py-2 text-xs text-slate-300 outline-none">
                        <option>All</option>
                        {svcMeta.platforms.map(p => <option key={p}>{p}</option>)}
                      </select>
                      <select value={svcProviderFilter} onChange={e => { setSvcProviderFilter(e.target.value); setSvcPage(0); }}
                        className="rounded-lg border border-white/5 bg-[#0D1321] px-3 py-2 text-xs text-slate-300 outline-none">
                        <option>All</option>
                        {svcMeta.providers.map(p => <option key={p.key}>{p.name}</option>)}
                      </select>
                      <select value={svcEnabledFilter} onChange={e => { setSvcEnabledFilter(e.target.value as "All" | "Enabled" | "Disabled"); setSvcPage(0); }}
                        className="rounded-lg border border-white/5 bg-[#0D1321] px-3 py-2 text-xs text-slate-300 outline-none">
                        <option>All</option>
                        <option>Enabled</option>
                        <option>Disabled</option>
                      </select>
                    </div>
                    {/* Table */}
                    {(() => {
                      const filtered = catalog.filter(s => {
                        if (svcPlatform !== "All" && s.platform !== svcPlatform) return false;
                        if (svcProviderFilter !== "All" && s.provider !== svcProviderFilter) return false;
                        if (svcEnabledFilter === "Enabled" && !s.enabled) return false;
                        if (svcEnabledFilter === "Disabled" && s.enabled) return false;
                        if (svcSearch.trim()) return s.name.toLowerCase().includes(svcSearch.toLowerCase());
                        return true;
                      });
                      const PAGE = 50;
                      const totalPages = Math.ceil(filtered.length / PAGE);
                      const page = Math.min(svcPage, Math.max(0, totalPages - 1));
                      const visible = filtered.slice(page * PAGE, (page + 1) * PAGE);
                      return (
                        <>
                          <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs text-slate-300">
                                <thead>
                                  <tr className="border-b border-white/5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                                    <th className="py-3 px-3">Service</th>
                                    <th className="py-3 px-3">Platform</th>
                                    <th className="py-3 px-3">Provider</th>
                                    <th className="py-3 px-3 text-right">Cost/k</th>
                                    <th className="py-3 px-3 text-right">Markup</th>
                                    <th className="py-3 px-3 text-right">Price/k</th>
                                    <th className="py-3 px-3 text-center">Status</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {visible.map(s => (
                                    <tr key={s.id} className={`border-b border-white/[0.03] hover:bg-white/[0.01] ${!s.enabled ? "opacity-40" : ""}`}>
                                      <td className="py-2.5 px-3 max-w-[220px]">
                                        <div className="font-medium text-slate-200 truncate text-[11px]">{s.name}</div>
                                        <div className="text-[9px] text-slate-600 mt-0.5">{s.category}</div>
                                      </td>
                                      <td className="py-2.5 px-3 text-[11px]">{s.platform}</td>
                                      <td className="py-2.5 px-3 text-[11px] text-slate-400">{s.provider}</td>
                                      <td className="py-2.5 px-3 text-right text-[11px] text-slate-400">₹{s.providerCostInr.toFixed(3)}</td>
                                      <td className="py-2.5 px-3 text-right text-[11px] text-amber-400 font-bold">{s.margin_pct}%</td>
                                      <td className="py-2.5 px-3 text-right text-[11px] text-emerald-400 font-bold">₹{s.price.toFixed(3)}</td>
                                      <td className="py-2.5 px-3 text-center">
                                        <button
                                          onClick={() => void handleToggleService(s.id, s.enabled)}
                                          className={`px-2 py-1 rounded text-[10px] font-black border transition-all ${
                                            s.enabled
                                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                              : "bg-slate-500/10 border-slate-500/20 text-slate-500 hover:bg-slate-500/20"
                                          }`}
                                        >
                                          {s.enabled ? "ON" : "OFF"}
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                  {visible.length === 0 && (
                                    <tr><td colSpan={7} className="py-8 text-center text-slate-600 text-xs">No services match filters</td></tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-[11px] text-slate-500">{filtered.length.toLocaleString()} services · page {page + 1}/{totalPages}</span>
                              <div className="flex gap-1.5">
                                <button disabled={page === 0} onClick={() => setSvcPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-white/5 text-xs text-slate-400 disabled:opacity-30 hover:bg-white/5">← Prev</button>
                                <button disabled={page >= totalPages - 1} onClick={() => setSvcPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-white/5 text-xs text-slate-400 disabled:opacity-30 hover:bg-white/5">Next →</button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </>
              )}
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
