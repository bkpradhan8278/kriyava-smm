"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Search, CheckCircle2, ShoppingBag } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { fmtINR } from "@/lib/account";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const STATUS_TABS = ["All", "Processing", "In progress", "Partial", "Completed", "Canceled", "Failed"];

function getTimeAgo(at: number) {
  const diff = Date.now() - at;
  const hrs = Math.floor(diff / 3600000);
  if (hrs < 1) return `${Math.max(1, Math.floor(diff / 60000))}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatusBadge({ status }: { status: string }) {
  const l = (status || "").toLowerCase();
  const cls =
    l === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    : l === "canceled" ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
    : l === "failed" ? "bg-red-500/10 text-red-400 border-red-500/20"
    : l === "partial" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
    : "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${cls}`}>{status}</span>;
}

export default function OrdersPage() {
  const { account, sync } = useAccount();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg: string) => { setToastMsg(msg); setTimeout(() => setToastMsg(""), 3000); };

  const handleRefill = async (id: string) => {
    try { await api.refillOrder(id); showToast("Refill requested."); }
    catch (e) { showToast(e instanceof Error ? e.message : "Refill failed."); }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await api.cancelOrder(id);
      await sync();
      showToast(`Canceled. Refunded: ${fmtINR(res.refunded)}`);
    } catch (e) { showToast(e instanceof Error ? e.message : "Cancel failed."); }
  };

  const orders = (account.orders || []).filter((o) => {
    if (filter !== "All" && o.status.toLowerCase() !== filter.toLowerCase()) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return o.id.toLowerCase().includes(q) || o.service.toLowerCase().includes(q) || o.link.toLowerCase().includes(q);
    }
    return true;
  });

  const totalSpent = (account.orders || []).reduce((s, o) => (o.status !== "Canceled" && o.status !== "Failed" ? s + o.charge : s), 0);
  const completedCount = (account.orders || []).filter((o) => o.status === "Completed").length;
  const activeCount = (account.orders || []).filter((o) => o.status !== "Completed" && o.status !== "Canceled" && o.status !== "Failed").length;

  return (
    <DashboardShell>
      {/* HEAD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-black text-white">Orders</h1>
          <p className="text-xs text-slate-400 mt-1">Track every campaign, trigger refills, check delivery.</p>
        </div>
        <Link href="/new-order" className="btn btn-primary !px-5 !py-3 !text-sm shrink-0">+ New Order</Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: account.orders.length, color: "from-blue-600/20" },
          { label: "Completed", value: completedCount, color: "from-emerald-600/20" },
          { label: "Active", value: activeCount, color: "from-amber-600/20" },
          { label: "Spent", value: fmtINR(totalSpent), color: "from-purple-600/20" },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl border border-white/5 bg-[#0D1321]/50 p-4 bg-gradient-to-tr ${s.color} to-transparent`}>
            <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">{s.label}</div>
            <div className="font-display text-xl font-black text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* SEARCH + STATUS TABS */}
      <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-4 mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            type="text"
            placeholder="Search by ID, service, or link…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/5 bg-white/[0.01] px-4 py-2.5 pl-9 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                filter === tab ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white bg-white/[0.02] border border-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-slate-500 font-bold mb-3">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>

      {orders.length === 0 && (
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 py-16 flex flex-col items-center gap-3 text-center">
          <ShoppingBag size={32} className="text-slate-600" />
          <p className="text-slate-400 text-sm font-semibold">No orders found</p>
          <Link href="/new-order" className="text-blue-400 hover:underline text-xs font-bold">Place a new order →</Link>
        </div>
      )}

      {/* MOBILE: cards */}
      {orders.length > 0 && (
        <div className="sm:hidden space-y-3">
          {orders.map((o) => {
            const done = o.status === "Completed" || o.status === "Partial";
            const cancellable = o.status === "Processing" || o.status === "Pending";
            return (
              <div key={o.id} className="rounded-2xl border border-white/5 bg-[#0D1321]/60 p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-white leading-snug line-clamp-2">{o.service}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{getTimeAgo(o.at)}</div>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wide font-bold">Qty</div>
                    <div className="text-xs font-black text-white mt-0.5">{o.qty.toLocaleString()}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wide font-bold">Charge</div>
                    <div className="text-xs font-black text-emerald-400 mt-0.5">{fmtINR(o.charge)}</div>
                  </div>
                  <div className="rounded-lg bg-white/[0.03] px-2 py-1.5">
                    <div className="text-[9px] text-slate-500 uppercase tracking-wide font-bold">ID</div>
                    <div className="text-[10px] font-black text-slate-300 mt-0.5 truncate">…{o.id.slice(-6)}</div>
                  </div>
                </div>
                {o.link && o.link !== "(none)" && (
                  <a href={o.link} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-blue-400 truncate hover:underline">{o.link}</a>
                )}
                {(done || cancellable) && (
                  <div className="flex gap-2">
                    {done && <button onClick={() => void handleRefill(o.id)} className="flex-1 py-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold">♻️ Refill</button>}
                    {cancellable && <button onClick={() => void handleCancel(o.id)} className="flex-1 py-2 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-xs font-bold">✕ Cancel</button>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DESKTOP: table */}
      {orders.length > 0 && (
        <div className="hidden sm:block rounded-2xl border border-white/5 bg-[#0D1321]/50 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Service</th>
                <th className="py-3 px-4 hidden lg:table-cell">Link</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4 text-right">Charge</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const done = o.status === "Completed" || o.status === "Partial";
                const cancellable = o.status === "Processing" || o.status === "Pending";
                return (
                  <tr key={o.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                    <td className="py-3.5 px-4">
                      <div className="font-black text-white text-[11px]">…{o.id.slice(-8)}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{getTimeAgo(o.at)}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-medium text-slate-200 truncate text-[11px]">{o.service}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[130px] hidden lg:table-cell">
                      <a href={o.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate block text-[11px]">{o.link}</a>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold">{o.qty.toLocaleString()}</td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-400">{fmtINR(o.charge)}</td>
                    <td className="py-3.5 px-4 text-center"><StatusBadge status={o.status} /></td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {done && <button onClick={() => void handleRefill(o.id)} className="px-2.5 py-1 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 text-[10px] font-bold">♻️ Refill</button>}
                        {cancellable && <button onClick={() => void handleCancel(o.id)} className="px-2.5 py-1 rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 text-[10px] font-bold">✕ Cancel</button>}
                        {!done && !cancellable && <span className="text-slate-600 font-bold">—</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-24 left-4 right-4 sm:left-6 sm:right-auto sm:w-80 z-55 rounded-xl border border-white/10 bg-[#0D1321]/95 px-4 py-3 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-black border-l-4 border-l-emerald-500">
          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}
    </DashboardShell>
  );
}
