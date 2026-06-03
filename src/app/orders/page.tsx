"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, CheckCircle2, ShoppingBag } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { fmtINR } from "@/lib/account";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const TABS = ["All", "Processing", "In progress", "Partial", "Completed", "Canceled"];

export default function OrdersPage() {
  const { account, sync } = useAccount();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Orders come from real user activity — no seeded demo data.

  const getStatusClass = (s: string) => {
    const l = (s || "").toLowerCase();
    if (l === "completed") return "bg-emerald-500/10 text-emerald-400";
    if (l === "canceled") return "bg-rose-500/10 text-rose-400";
    if (l === "partial") return "bg-cyan-500/10 text-cyan-400";
    return "bg-amber-500/10 text-amber-400";
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
      showToast(`Refill requested successfully for order ${id}.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Refill request failed.");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await api.cancelOrder(id);
      await sync();
      showToast(`Order ${id} canceled. Wallet refunded: ${fmtINR(res.refunded)}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Cancel request failed.");
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const filteredOrders = (account.orders || []).filter((o) => {
    if (filter !== "All" && o.status.toLowerCase() !== filter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.service.toLowerCase().includes(q) ||
        o.link.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalSpent = (account.orders || []).reduce((sum, o) => {
    if (o.status !== "Canceled") return sum + o.charge;
    return sum;
  }, 0);

  const completedOrders = (account.orders || []).filter((o) => o.status === "Completed").length;
  const activeOrders = (account.orders || []).filter((o) => o.status !== "Completed" && o.status !== "Canceled").length;

  return (
    <DashboardShell>
      {/* PAGE HEAD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="text-left">
          <h1 className="font-display text-2xl md:text-3xl font-black text-white">Orders log</h1>
          <p className="text-sm text-slate-400 mt-1">Track every campaign, trigger refills, and check delivery pings.</p>
        </div>
        <Link href="/new-order" className="btn btn-primary !px-5 !py-3 !text-sm">
          + Place New Order
        </Link>
      </div>

      {/* METRIC BOXES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Total Orders", value: account.orders.length, color: "from-blue-600/20" },
          { label: "Completed", value: completedOrders, color: "from-emerald-600/20" },
          { label: "Active Campaigns", value: activeOrders, color: "from-amber-600/20" },
          { label: "Total Spent", value: fmtINR(totalSpent), color: "from-purple-600/20" },
        ].map((stat, i) => (
          <div
            key={i}
            className={`rounded-2xl border border-white/5 bg-[#0D1321]/50 p-4 text-left bg-gradient-to-tr ${stat.color} to-transparent`}
          >
            <div className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-1.5">
              {stat.label}
            </div>
            <div className="font-display text-xl font-black text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* FILTER & TABLE CONSOLE */}
      <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md text-left space-y-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search by Order ID, service keyword, or link..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/5 bg-white/[0.01] px-4 py-2.5 pl-10 text-xs text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:bg-white/[0.03]"
            />
          </div>

          {/* Platform Tab Buttons */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl border border-white/5 bg-white/[0.01] self-start text-[11px] font-bold">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === tab ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Table wrapper */}
        <div className="overflow-x-auto">
          <table className="tbl w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-white/5 text-slate-400">
                <th className="py-2.5 px-3">Order Info</th>
                <th className="py-2.5 px-3">Service Name</th>
                <th className="py-2.5 px-3">Target URL Link</th>
                <th className="py-2.5 px-3 text-right">Quantity</th>
                <th className="py-2.5 px-3 text-right">Charge</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Action Trigger</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingBag size={28} className="text-slate-600" />
                      <span className="font-semibold text-xs">No matching orders found in logs.</span>
                      <Link href="/new-order" className="text-blue-400 hover:underline font-bold mt-1 text-[11px]">
                        Place a campaign order &rarr;
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => {
                  const isCompleted = o.status === "Completed";
                  const isPartial = o.status === "Partial";
                  const isCancelable = o.status === "Processing" || o.status === "Pending";
                  const isRefillable = isCompleted || isPartial;

                  return (
                    <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-black text-white">{o.id}</div>
                        <div className="text-[10px] text-slate-500 font-bold mt-0.5">
                          {getTimeAgo(o.at)}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 max-w-[220px] truncate font-medium text-slate-200">
                        {o.service}
                      </td>
                      <td className="py-3.5 px-3 max-w-[150px] truncate">
                        <a
                          href={o.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:underline font-medium"
                        >
                          {o.link}
                        </a>
                      </td>
                      <td className="py-3.5 px-3 text-right font-semibold">
                        {o.qty.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right font-black text-emerald-400">
                        {fmtINR(o.charge)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${getStatusClass(
                            o.status
                          )}`}
                        >
                          <span className="h-1 w-1 rounded-full bg-currentColor" />
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isRefillable && (
                            <button
                              onClick={() => void handleRefill(o.id)}
                              className="px-2.5 py-1 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 text-[10.5px] font-bold tracking-wide transition-all"
                            >
                              ♻️ Refill
                            </button>
                          )}
                          {isCancelable && (
                            <button
                              onClick={() => void handleCancel(o.id)}
                              className="px-2.5 py-1 rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 text-[10.5px] font-bold tracking-wide transition-all"
                            >
                              ✕ Cancel
                            </button>
                          )}
                          {!isRefillable && !isCancelable && (
                            <span className="text-slate-600 font-bold text-xs">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
