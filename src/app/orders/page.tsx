"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2, ShoppingBag, Filter } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { fmtINR } from "@/lib/account";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const STATUS_TABS = ["All", "Processing", "In progress", "Partial", "Completed", "Canceled"];

const TYPE_FILTERS = [
  { key: "All", label: "All Types", icon: "📋" },
  { key: "Followers", label: "Followers", icon: "👥" },
  { key: "Likes", label: "Likes", icon: "❤️" },
  { key: "Views", label: "Views", icon: "👁️" },
  { key: "Comments", label: "Comments", icon: "💬" },
  { key: "Reels", label: "Reels", icon: "🎬" },
  { key: "Subscribers", label: "Subscribers", icon: "🔔" },
  { key: "Members", label: "Members", icon: "👤" },
  { key: "Other", label: "Other", icon: "⚡" },
];

const PLATFORM_FILTERS = [
  { key: "All", label: "All", icon: "🌐" },
  { key: "Instagram", label: "Instagram", icon: "📸" },
  { key: "YouTube", label: "YouTube", icon: "🎥" },
  { key: "TikTok", label: "TikTok", icon: "🎵" },
  { key: "Telegram", label: "Telegram", icon: "✈️" },
  { key: "Facebook", label: "Facebook", icon: "📘" },
];

function getServiceType(name: string) {
  const n = name.toLowerCase();
  if (n.includes("follower")) return "Followers";
  if (n.includes("like")) return "Likes";
  if (n.includes("view") || n.includes("watch")) return "Views";
  if (n.includes("comment")) return "Comments";
  if (n.includes("reel")) return "Reels";
  if (n.includes("subscriber") || n.includes("sub")) return "Subscribers";
  if (n.includes("member")) return "Members";
  return "Other";
}

function getServicePlatform(name: string) {
  const n = name.toLowerCase();
  if (n.includes("instagram")) return "Instagram";
  if (n.includes("youtube")) return "YouTube";
  if (n.includes("tiktok") || n.includes("tik tok")) return "TikTok";
  if (n.includes("telegram")) return "Telegram";
  if (n.includes("facebook")) return "Facebook";
  return "Other";
}

export default function OrdersPage() {
  const { account, sync } = useAccount();
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const getStatusClass = (s: string) => {
    const l = (s || "").toLowerCase();
    if (l === "completed") return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
    if (l === "canceled") return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
    if (l === "partial") return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
    return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
  };

  const getTimeAgo = (at: number) => {
    const diff = Date.now() - at;
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const handleRefill = async (id: string) => {
    try {
      await api.refillOrder(id);
      showToast("Refill requested.");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Refill failed.");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await api.cancelOrder(id);
      await sync();
      showToast(`Canceled. Refunded: ${fmtINR(res.refunded)}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Cancel failed.");
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const filteredOrders = (account.orders || []).filter((o) => {
    if (statusFilter !== "All" && o.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (typeFilter !== "All" && getServiceType(o.service) !== typeFilter) return false;
    if (platformFilter !== "All" && getServicePlatform(o.service) !== platformFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return o.id.toLowerCase().includes(q) || o.service.toLowerCase().includes(q) || o.link.toLowerCase().includes(q);
    }
    return true;
  });

  const totalSpent = (account.orders || []).reduce((s, o) => (o.status !== "Canceled" ? s + o.charge : s), 0);
  const completedCount = (account.orders || []).filter((o) => o.status === "Completed").length;
  const activeCount = (account.orders || []).filter((o) => o.status !== "Completed" && o.status !== "Canceled").length;

  const activeFilterCount = (statusFilter !== "All" ? 1 : 0) + (typeFilter !== "All" ? 1 : 0) + (platformFilter !== "All" ? 1 : 0);

  return (
    <DashboardShell>
      {/* PAGE HEAD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-black text-white">Orders</h1>
          <p className="text-xs text-slate-400 mt-1">Track every campaign, trigger refills, and check delivery.</p>
        </div>
        <Link href="/new-order" className="btn btn-primary !px-5 !py-3 !text-sm shrink-0">
          + New Order
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Orders", value: account.orders.length, color: "from-blue-600/20" },
          { label: "Completed", value: completedCount, color: "from-emerald-600/20" },
          { label: "Active", value: activeCount, color: "from-amber-600/20" },
          { label: "Total Spent", value: fmtINR(totalSpent), color: "from-purple-600/20" },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl border border-white/5 bg-[#0D1321]/50 p-4 bg-gradient-to-tr ${s.color} to-transparent`}>
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">{s.label}</div>
            <div className="font-display text-xl font-black text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* FILTER PANEL */}
      <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-4 mb-4 space-y-3">
        {/* Search + filter toggle */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Search by ID, service, or link…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-white/[0.01] px-4 py-2.5 pl-9 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:bg-white/[0.03]"
            />
          </div>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all shrink-0 ${
              showFilters || activeFilterCount > 0
                ? "border-blue-500/40 bg-blue-600/10 text-blue-400"
                : "border-white/5 bg-white/[0.01] text-slate-400 hover:text-white"
            }`}
          >
            <Filter size={13} />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="h-4 w-4 rounded-full bg-blue-600 text-[9px] font-black text-white grid place-items-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Status tabs - always visible, horizontal scroll on mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                statusFilter === tab ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white bg-white/[0.02] border border-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Expandable: platform + type filters */}
        {showFilters && (
          <div className="space-y-3 pt-1 border-t border-white/5">
            {/* Platform */}
            <div>
              <div className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase mb-1.5">Platform</div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                {PLATFORM_FILTERS.map((pf) => (
                  <button
                    key={pf.key}
                    onClick={() => setPlatformFilter(pf.key)}
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      platformFilter === pf.key
                        ? "bg-purple-600 text-white"
                        : "text-slate-400 hover:text-white bg-white/[0.02] border border-white/5"
                    }`}
                  >
                    <span>{pf.icon}</span>
                    <span>{pf.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Type */}
            <div>
              <div className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase mb-1.5">Category</div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                {TYPE_FILTERS.map((tf) => (
                  <button
                    key={tf.key}
                    onClick={() => setTypeFilter(tf.key)}
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                      typeFilter === tf.key
                        ? "bg-emerald-600 text-white"
                        : "text-slate-400 hover:text-white bg-white/[0.02] border border-white/5"
                    }`}
                  >
                    <span>{tf.icon}</span>
                    <span>{tf.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setStatusFilter("All"); setTypeFilter("All"); setPlatformFilter("All"); }}
                className="text-[11px] font-bold text-rose-400 hover:text-rose-300 transition-colors"
              >
                ✕ Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* RESULTS COUNT */}
      <div className="text-[11px] text-slate-500 font-bold mb-3">
        {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""} found
        {activeFilterCount > 0 && " (filtered)"}
      </div>

      {/* EMPTY STATE */}
      {filteredOrders.length === 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 py-16 flex flex-col items-center justify-center gap-3 text-center">
          <ShoppingBag size={32} className="text-slate-600" />
          <div className="font-semibold text-sm text-slate-400">No orders match your filters</div>
          <Link href="/new-order" className="text-blue-400 hover:underline font-bold text-xs">
            Place a new order →
          </Link>
        </div>
      )}

      {/* MOBILE: CARD LIST (visible on <sm) */}
      <div className="sm:hidden space-y-3">
        {filteredOrders.map((o) => {
          const isCompleted = o.status === "Completed";
          const isPartial = o.status === "Partial";
          const isCancelable = o.status === "Processing" || o.status === "Pending";
          const isRefillable = isCompleted || isPartial;
          return (
            <div key={o.id} className="rounded-2xl border border-white/5 bg-[#0D1321]/60 p-4 space-y-3">
              {/* Top row: service + status */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-white leading-snug line-clamp-2">{o.service}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-bold">{getTimeAgo(o.at)}</div>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${getStatusClass(o.status)}`}>
                  {o.status}
                </span>
              </div>

              {/* Meta row */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Qty</div>
                  <div className="text-xs font-black text-white mt-0.5">{o.qty.toLocaleString()}</div>
                </div>
                <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">Charge</div>
                  <div className="text-xs font-black text-emerald-400 mt-0.5">{fmtINR(o.charge)}</div>
                </div>
                <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
                  <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">ID</div>
                  <div className="text-[10px] font-black text-slate-300 mt-0.5 truncate">{o.id.slice(-6)}</div>
                </div>
              </div>

              {/* Link */}
              {o.link && o.link !== "(none)" && (
                <a
                  href={o.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[11px] text-blue-400 font-medium truncate hover:underline"
                >
                  {o.link}
                </a>
              )}

              {/* Actions */}
              {(isRefillable || isCancelable) && (
                <div className="flex gap-2 pt-1">
                  {isRefillable && (
                    <button
                      onClick={() => void handleRefill(o.id)}
                      className="flex-1 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold"
                    >
                      ♻️ Refill
                    </button>
                  )}
                  {isCancelable && (
                    <button
                      onClick={() => void handleCancel(o.id)}
                      className="flex-1 py-2 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-bold"
                    >
                      ✕ Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DESKTOP: TABLE (hidden on <sm) */}
      <div className="hidden sm:block rounded-2xl border border-white/5 bg-[#0D1321]/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/5 text-slate-500 text-[10px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4 hidden lg:table-cell">Link</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4 text-right">Charge</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => {
                const isCompleted = o.status === "Completed";
                const isPartial = o.status === "Partial";
                const isCancelable = o.status === "Processing" || o.status === "Pending";
                const isRefillable = isCompleted || isPartial;
                return (
                  <tr key={o.id} className="border-b border-white/[0.03] hover:bg-white/[0.01] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-black text-white text-[11px]">{o.id.slice(-8)}</div>
                      <div className="text-[10px] text-slate-500 font-bold mt-0.5">{getTimeAgo(o.at)}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-medium text-slate-200 truncate text-[11px]">{o.service}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{getServicePlatform(o.service)} · {getServiceType(o.service)}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[130px] hidden lg:table-cell">
                      <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate block text-[11px]">
                        {o.link}
                      </a>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold">{o.qty.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-400">{fmtINR(o.charge)}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${getStatusClass(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {isRefillable && (
                          <button onClick={() => void handleRefill(o.id)} className="px-2.5 py-1 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 text-[10px] font-bold">
                            ♻️ Refill
                          </button>
                        )}
                        {isCancelable && (
                          <button onClick={() => void handleCancel(o.id)} className="px-2.5 py-1 rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 text-[10px] font-bold">
                            ✕ Cancel
                          </button>
                        )}
                        {!isRefillable && !isCancelable && <span className="text-slate-600 font-bold">—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* TOAST */}
      {toastMsg && (
        <div className="fixed bottom-24 left-4 right-4 sm:left-6 sm:right-auto sm:w-80 z-55 rounded-xl border border-white/10 bg-[#0D1321]/95 px-4 py-3 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-black border-l-4 border-l-emerald-500">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </DashboardShell>
  );
}
