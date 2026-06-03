"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart2, Users, ShoppingBag, Wallet, TrendingUp, RefreshCw,
  AlertTriangle, CheckCircle2, XCircle, Zap, Database, Shield,
} from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { api, type AdminSummaryResponse, type AdminOrderRow, type AdminUserRow } from "@/lib/api";
import { fmtINR } from "@/lib/account";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const ADMIN_EMAIL = "getkriyava@gmail.com";

function StatCard({ label, value, sub, color, icon: Icon }: { label: string; value: string | number; sub?: string; color: string; icon: React.ElementType }) {
  return (
    <div className={`rounded-2xl border border-white/5 bg-[#0D1321]/60 p-5 flex items-start gap-4`}>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${color}`}>
        <Icon size={20} />
      </span>
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

type Tab = "overview" | "orders" | "users" | "providers" | "deposits";

export default function AdminPage() {
  const { account } = useAccount();
  const router = useRouter();
  const [data, setData] = useState<AdminSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [orderFilter, setOrderFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Wait for account to load
    if (!account.email) return;
    if (account.email !== ADMIN_EMAIL) {
      router.replace("/dashboard");
      return;
    }
    void fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account.email]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.adminSummary();
      setData(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (!account.email || (account.email && account.email !== ADMIN_EMAIL)) {
    return (
      <DashboardShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <Shield size={40} className="text-rose-400" />
          <h2 className="text-xl font-black text-white">Admin Access Only</h2>
          <p className="text-slate-400 text-sm">Only getkriyava@gmail.com can access this page.</p>
          <Link href="/dashboard" className="btn btn-primary">← Back to Dashboard</Link>
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
  ];

  return (
    <DashboardShell>
      {/* HEADER */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-6 w-6 grid place-items-center rounded bg-blue-600/20 text-blue-400"><Shield size={13} /></span>
            <span className="text-[10px] font-extrabold text-blue-400 uppercase tracking-widest">Admin CRM</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-black text-white">Kriyava Control Panel</h1>
          <p className="text-xs text-slate-400 mt-1">{data?.asOf ? `Last updated: ${data.asOf}` : "Loading..."}</p>
        </div>
        <button
          onClick={() => void handleRefresh()}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {/* TAB NAV */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none pb-1 mb-6 border-b border-white/5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition-all rounded-t-lg -mb-px border-b-2 ${
              tab === t.key
                ? "border-blue-500 text-white bg-blue-600/5"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <t.icon size={13} />
            {t.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-slate-500 text-sm font-bold gap-2">
          <RefreshCw size={16} className="animate-spin" /> Loading admin data...
        </div>
      )}

      {!loading && data && (
        <>
          {/* ── OVERVIEW ── */}
          {tab === "overview" && (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total Users" value={data.totalUsers} sub="registered accounts" color="text-blue-400 bg-blue-500/10" icon={Users} />
                <StatCard label="Today Revenue" value={fmtINR(data.today.revenue)} sub={`${data.today.activeCount} orders`} color="text-emerald-400 bg-emerald-500/10" icon={TrendingUp} />
                <StatCard label="Today Profit" value={fmtINR(data.today.profit)} sub={`${((data.today.profit / Math.max(data.today.revenue, 0.01)) * 100).toFixed(1)}% margin`} color="text-purple-400 bg-purple-500/10" icon={Zap} />
                <StatCard label="Today Deposits" value={fmtINR(data.todayDeposits)} sub="via Razorpay" color="text-amber-400 bg-amber-500/10" icon={Wallet} />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="All-Time Revenue" value={fmtINR(data.allTime.revenue)} sub={`${data.allTime.activeCount} orders`} color="text-cyan-400 bg-cyan-500/10" icon={BarChart2} />
                <StatCard label="All-Time Profit" value={fmtINR(data.allTime.profit)} color="text-violet-400 bg-violet-500/10" icon={TrendingUp} />
                <StatCard label="All-Time Provider Cost" value={fmtINR(data.allTime.providerCost)} color="text-rose-400 bg-rose-500/10" icon={Database} />
                <StatCard label="Failed Orders" value={data.allTime.failedCount} sub="wallet auto-refunded" color="text-slate-400 bg-slate-500/10" icon={XCircle} />
              </div>

              {/* Provider health */}
              <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 p-5">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Provider Health</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {Object.entries(data.providerStatus.balances).map(([name, bal]) => {
                    const [amount, currency] = bal.split(" ");
                    const low = parseFloat(amount) < 5;
                    return (
                      <div key={name} className={`rounded-xl border p-4 ${low ? "border-rose-500/30 bg-rose-500/5" : "border-emerald-500/20 bg-emerald-500/5"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-white">{name}</span>
                          <span className={`text-[10px] font-black ${low ? "text-rose-400" : "text-emerald-400"}`}>{low ? "LOW" : "OK"}</span>
                        </div>
                        <div className={`text-xl font-black ${low ? "text-rose-400" : "text-emerald-400"}`}>{amount} <span className="text-xs font-bold text-slate-400">{currency}</span></div>
                        <div className="text-[10px] text-slate-500 mt-1">{data.providerStatus.providers[name] || 0} services</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Today's orders quick view */}
              <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 p-5">
                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-4">Today's Orders ({data.today.count})</h3>
                <div className="space-y-2">
                  {data.today.orders.length === 0 && <p className="text-slate-500 text-xs">No orders today yet.</p>}
                  {data.today.orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between gap-3 py-2 border-b border-white/5 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="text-white font-bold truncate">{o.service}</div>
                        <div className="text-slate-500 text-[10px]">{o.time} · {o.provider} · qty {o.qty}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-black text-emerald-400">{fmtINR(o.charge)}</div>
                        <div className="text-[10px] text-purple-400">+{fmtINR(o.profit)}</div>
                      </div>
                      <StatusBadge status={o.status} />
                    </div>
                  ))}
                </div>
                {data.today.orders.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-3 text-center text-xs">
                    <div><div className="text-slate-400 font-bold">Charged</div><div className="text-white font-black">{fmtINR(data.today.revenue)}</div></div>
                    <div><div className="text-slate-400 font-bold">Provider Cost</div><div className="text-rose-400 font-black">{fmtINR(data.today.providerCost)}</div></div>
                    <div><div className="text-slate-400 font-bold">Profit</div><div className="text-purple-400 font-black">{fmtINR(data.today.profit)}</div></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {tab === "orders" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-white">All Orders ({data.recentOrders.length})</h3>
                <div className="flex gap-1 flex-wrap">
                  {["All", "Processing", "Completed", "Failed", "Canceled"].map((s) => (
                    <button key={s} onClick={() => setOrderFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${orderFilter === s ? "bg-blue-600 text-white" : "text-slate-400 bg-white/[0.02] border border-white/5"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 overflow-x-auto">
                <table className="w-full text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 text-left">Time</th>
                      <th className="py-3 px-4 text-left">Service</th>
                      <th className="py-3 px-4 text-right">Qty</th>
                      <th className="py-3 px-4 text-right">Charged</th>
                      <th className="py-3 px-4 text-right">Cost</th>
                      <th className="py-3 px-4 text-right">Profit</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-left">Provider</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o: AdminOrderRow) => (
                      <tr key={o.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{o.time.split(",")[0]}</td>
                        <td className="py-3 px-4 max-w-[180px]"><div className="truncate font-medium">{o.service}</div><div className="text-[10px] text-slate-500">{o.platform}</div></td>
                        <td className="py-3 px-4 text-right font-semibold">{o.qty.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right font-black text-white">{fmtINR(o.charge)}</td>
                        <td className="py-3 px-4 text-right text-rose-400">{fmtINR(o.providerCost)}</td>
                        <td className="py-3 px-4 text-right font-black text-purple-400">{fmtINR(o.profit)}</td>
                        <td className="py-3 px-4 text-center"><StatusBadge status={o.status} /></td>
                        <td className="py-3 px-4 text-slate-400">{o.provider}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredOrders.length === 0 && <div className="py-10 text-center text-slate-500 text-xs">No orders found</div>}
              </div>
            </div>
          )}

          {/* ── USERS ── */}
          {tab === "users" && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-white">Registered Users ({data.users.length})</h3>
              <div className="grid grid-cols-1 gap-3 sm:hidden">
                {data.users.map((u: AdminUserRow) => (
                  <div key={u.id} className="rounded-xl border border-white/5 bg-[#0D1321]/60 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div><div className="text-xs font-black text-white">{u.name}</div><div className="text-[10px] text-slate-400">{u.email}</div></div>
                      {u.role === "admin" && <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">ADMIN</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-white/[0.03] p-2"><div className="text-[9px] text-slate-500">Balance</div><div className="text-xs font-black text-emerald-400">{fmtINR(u.balance)}</div></div>
                      <div className="rounded-lg bg-white/[0.03] p-2"><div className="text-[9px] text-slate-500">Spent</div><div className="text-xs font-black text-white">{fmtINR(u.spent)}</div></div>
                      <div className="rounded-lg bg-white/[0.03] p-2"><div className="text-[9px] text-slate-500">Joined</div><div className="text-xs font-black text-slate-300">{u.joined.split(",")[0]}</div></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden sm:block rounded-2xl border border-white/5 bg-[#0D1321]/60 overflow-x-auto">
                <table className="w-full text-xs text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 text-left">Name / Email</th>
                      <th className="py-3 px-4 text-right">Balance</th>
                      <th className="py-3 px-4 text-right">Spent</th>
                      <th className="py-3 px-4 text-center">Role</th>
                      <th className="py-3 px-4 text-left">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.users.map((u: AdminUserRow) => (
                      <tr key={u.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                        <td className="py-3 px-4"><div className="font-bold text-white">{u.name}</div><div className="text-[10px] text-slate-500">{u.email}</div></td>
                        <td className="py-3 px-4 text-right font-black text-emerald-400">{fmtINR(u.balance)}</td>
                        <td className="py-3 px-4 text-right font-semibold">{fmtINR(u.spent)}</td>
                        <td className="py-3 px-4 text-center">
                          {u.role === "admin"
                            ? <span className="text-[9px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">ADMIN</span>
                            : <span className="text-[9px] font-bold text-slate-500">user</span>}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{u.joined.split(",")[0]}</td>
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
                  const [amount, currency] = bal.split(" ");
                  const low = parseFloat(amount) < 5;
                  const svcCount = data.providerStatus.providers[name] || 0;
                  return (
                    <div key={name} className={`rounded-2xl border p-5 space-y-3 ${low ? "border-rose-500/30 bg-rose-500/5" : "border-emerald-500/20 bg-[#0D1321]/60"}`}>
                      <div className="flex items-center justify-between">
                        <div className="font-black text-white text-sm">{name}</div>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${low ? "text-rose-400 bg-rose-500/10 border-rose-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"}`}>
                          {low ? "⚠ LOW" : "✓ ACTIVE"}
                        </span>
                      </div>
                      <div><div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Account Balance</div>
                        <div className={`text-2xl font-black mt-1 ${low ? "text-rose-400" : "text-emerald-400"}`}>{amount} <span className="text-sm font-bold text-slate-400">{currency}</span></div>
                      </div>
                      <div className="text-[11px] text-slate-400"><span className="font-bold text-white">{svcCount.toLocaleString()}</span> services indexed</div>
                      {low && <div className="text-[11px] text-rose-400 font-bold bg-rose-500/10 rounded-lg p-2">⚡ Add funds to {name} to resume cheapest routing</div>}
                    </div>
                  );
                })}
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 p-5">
                <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Catalog Summary</h4>
                <div className="text-sm font-bold text-white">{data.providerStatus.services.toLocaleString()} total services</div>
                <div className="text-[11px] text-slate-400 mt-1">Refreshed every 30 minutes. Cheapest provider per service auto-selected.</div>
              </div>
            </div>
          )}

          {/* ── DEPOSITS ── */}
          {tab === "deposits" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white">All Deposits ({data.deposits.length})</h3>
                <div className="text-xs font-bold text-emerald-400">Total: {fmtINR(data.deposits.reduce((s, d) => s + d.amount, 0))}</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-[#0D1321]/60 overflow-hidden">
                {data.deposits.map((d, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.03] hover:bg-white/[0.01] text-xs">
                    <div><div className="font-bold text-white">{fmtINR(d.amount)}</div><div className="text-[10px] text-slate-500 mt-0.5">{d.time}</div></div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-black text-[10px] border border-emerald-500/20">{d.method}</span>
                      {d.note && <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[120px]">{d.note}</div>}
                    </div>
                  </div>
                ))}
                {data.deposits.length === 0 && <div className="py-10 text-center text-slate-500 text-xs">No deposits yet</div>}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardShell>
  );
}
