"use client";
import React, { useState } from "react";
import Link from "next/link";
import { AuthGuard } from "./AuthGuard";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Layers,
  FileText,
  Search,
  Wallet,
  Code,
  Globe,
  Share2,
  Bell,
  Ticket,
  Settings,
  Menu,
  X,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { fmtINR } from "@/lib/account";
import { clearToken } from "@/lib/api";

const MENU_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/new-order", label: "New Order", icon: PlusCircle },
  { href: "/mass-order", label: "Mass Order", icon: Layers },
  { href: "/orders", label: "Orders", icon: FileText },
  { href: "/services", label: "Services", icon: Search },
  { href: "/add-funds", label: "Add Funds", icon: Wallet },
  { href: "/api-docs", label: "API docs", icon: Code },
  { href: "/child-panel", label: "Child Panels", icon: Globe },
  { href: "/affiliate", label: "Affiliates", icon: Share2 },
  { href: "/updates", label: "Updates", icon: RefreshCw },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { account } = useAccount();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);

  const activeLink = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <AuthGuard>
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col md:flex-row">
      {/* BACKGROUND GRAPHICS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <span className="absolute top-[10%] left-[20%] h-[380px] w-[380px] rounded-full opacity-[0.08] blur-[120px] bg-blue-500" />
        <span className="absolute bottom-[20%] right-[10%] h-[420px] w-[420px] rounded-full opacity-[0.08] blur-[140px] bg-purple-500" />
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden flex h-16 items-center justify-between px-4 border-b border-white/5 bg-[#0D1321]/90 backdrop-blur-md sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="h-8 w-8 overflow-hidden rounded-lg bg-blue-600/20 p-1 flex items-center justify-center">
            <Image src="/assets/logo-128.png" alt="" width={24} height={24} />
          </span>
          <span className="font-display font-extrabold text-[17px] tracking-tight">Kriyava</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="text-right mr-1">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Wallet</div>
            <div className="text-xs font-black text-emerald-400 mt-0.5">{fmtINR(account.balance)}</div>
          </div>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5"
            aria-label="Open sidebar"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-[#0D1321] border-r border-white/5 flex flex-col z-50 transition-transform duration-300 md:translate-x-0 md:static ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* LOGO */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="h-9 w-9 overflow-hidden rounded-[10px] bg-blue-600/10 p-1.5 flex items-center justify-center">
              <Image src="/assets/logo-128.png" alt="" width={28} height={28} />
            </span>
            <div className="flex flex-col">
              <span className="font-display font-black text-[18px] tracking-tight leading-none">Kriyava</span>
              <span className="text-[8.5px] font-extrabold text-blue-400 uppercase tracking-[0.18em] mt-0.5">SMM Panel</span>
            </div>
          </Link>
          <button onClick={() => setMobileOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
          {MENU_ITEMS.map((item) => {
            const active = activeLink(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13.5px] font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_4px_15px_rgba(37,99,235,0.25)]"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                }`}
              >
                <item.icon size={17} className={active ? "text-white" : "text-slate-400"} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* FOOTER USER CARD */}
        <div className="p-4 border-t border-white/5 bg-white/[0.01]">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-blue-600/20 text-blue-400 font-extrabold flex items-center justify-center text-sm shadow-inner uppercase">
                {account.name.slice(0, 2)}
              </div>
              <div className="max-w-[12ch]">
                <div className="text-xs font-bold text-white truncate">{account.name}</div>
                <div className="text-[10px] text-slate-400 font-medium">welcome back</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="h-8 w-8 grid place-items-center rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 border-b border-white/5 bg-[#090D16]/60 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-400">
              {pathname === "/dashboard"
                ? "Overview"
                : MENU_ITEMS.find((m) => pathname.startsWith(m.href))?.label || "App"}
            </h2>
          </div>

          <div className="flex items-center gap-5">
            {/* Wallet summary */}
            <div className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Wallet size={14} />
                </span>
                <div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">Balance</div>
                  <div className="text-[13px] font-black text-emerald-400 mt-0.5">{fmtINR(account.balance)}</div>
                </div>
              </div>
              <div className="h-6 w-px bg-white/10" />
              <Link href="/add-funds" className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                + Deposit
              </Link>
            </div>

            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => setNotifsOpen((v) => !v)}
                className="relative h-9 w-9 grid place-items-center rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] text-slate-300 hover:text-white"
                aria-label="Open notifications"
              >
                <Bell size={16} />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              </button>
              {notifsOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-white/10 bg-[#0D1321] p-3.5 shadow-2xl z-50">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                    <b className="text-xs">Notifications</b>
                    <span className="text-[10px] text-blue-400 font-bold cursor-pointer" onClick={() => setNotifsOpen(false)}>Close</span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="text-xs">
                      <div className="font-semibold text-white">Wallet payments enabled</div>
                      <p className="text-[10.5px] text-slate-400 mt-0.5">Razorpay top-ups credit your wallet only after backend verification.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile display */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold leading-none">{account.name}</div>
                <div className="text-[10px] text-blue-400 font-bold mt-1">Creator Tier</div>
              </div>
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md uppercase">
                {account.name.slice(0, 2)}
              </div>
            </div>
          </div>
        </header>

        {/* SCROLLABLE MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-thin">
          {children}
        </main>
      </div>

    </div>
    </AuthGuard>
  );
}
