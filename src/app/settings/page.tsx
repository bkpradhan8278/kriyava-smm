"use client";
import React, { useState, useEffect } from "react";
import { User, Shield, AlertTriangle, CheckCircle2, Moon, Sun, Bell, Phone } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { saveAccount, getTheme, setTheme } from "@/lib/account";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function SettingsPage() {
  const { account, refresh } = useAccount();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");

  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    notifOrders: true,
    notifWa: true,
    notifPrice: false,
    notifMarketing: false,
  });

  const [toastMsg, setToastMsg] = useState("");

  // Sync profile details
  useEffect(() => {
    if (account) {
      setName(account.name || "");
      setEmail(account.email || "");
      setPhone(account.phone || "");
      setThemeMode(getTheme());
      if (account.prefs) {
        setPrefs({
          notifOrders: !!account.prefs.notifOrders,
          notifWa: !!account.prefs.notifWa,
          notifPrice: !!account.prefs.notifPrice,
          notifMarketing: !!account.prefs.notifMarketing,
        });
      }
    }
  }, [account]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const a = { ...account };
    a.name = name.trim() || a.name;
    a.email = email.trim();
    a.phone = phone.trim();
    a.prefs = { ...a.prefs, ...prefs };

    saveAccount(a);
    refresh();
    showToast("✅ Profile details updated successfully!");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw1.length < 6) {
      showToast("❌ Password must be at least 6 characters.");
      return;
    }
    if (pw1 !== pw2) {
      showToast("❌ Passwords do not match.");
      return;
    }

    setPw1("");
    setPw2("");
    showToast("✅ Security password updated successfully!");
  };

  const handleTogglePref = (k: string) => {
    const next = { ...prefs, [k]: !prefs[k] };
    setPrefs(next);

    const a = { ...account };
    a.prefs = { ...a.prefs, ...next };
    saveAccount(a);
    refresh();
  };

  const handleThemeChange = (mode: "dark" | "light") => {
    setThemeMode(mode);
    setTheme(mode);
    showToast(`🎨 Theme switched to ${mode} mode!`);
  };

  const handleResetAccount = () => {
    if (window.confirm("Are you sure you want to reset your mock account? This will clear all balance logs, ticket threads, and campaign orders.")) {
      localStorage.removeItem("kriyava_account_v1");
      showToast("🧹 Account data wiped! Reloading...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <DashboardShell>
      {/* PAGE HEAD */}
      <div className="text-left mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-black text-white">Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your profiles, security, WhatsApp notification links, and dashboard appearance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: PROFILE & SECURITY */}
        <div className="space-y-6 text-left">
          {/* Profile form */}
          <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
              Profile Configurations
            </h3>

            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 text-white font-extrabold flex items-center justify-center text-xl shadow-md uppercase">
                {name.slice(0, 2)}
              </div>
              <div>
                <div className="text-sm font-bold text-white">{name || "Creator"}</div>
                <div className="text-xs text-slate-400 mt-0.5">{email || "No email set"}</div>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-bold">
              <div className="flex flex-col">
                <label className="text-slate-400 mb-1.5 uppercase text-[9.5px] tracking-wide">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-slate-400 mb-1.5 uppercase text-[9.5px] tracking-wide">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-slate-400 mb-1.5 uppercase text-[9.5px] tracking-wide">WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="+91..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block !py-2.5 !text-xs mt-4"
              >
                Save Profile Changes
              </button>
            </form>
          </div>

          {/* Security details */}
          <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
              Update password
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-bold">
              <div className="flex flex-col">
                <label className="text-slate-400 mb-1.5 uppercase text-[9.5px] tracking-wide">New Password</label>
                <input
                  type="password"
                  value={pw1}
                  onChange={(e) => setPw1(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex flex-col">
                <label className="text-slate-400 mb-1.5 uppercase text-[9.5px] tracking-wide">Confirm Password</label>
                <input
                  type="password"
                  value={pw2}
                  onChange={(e) => setPw2(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="btn btn-ghost btn-block !py-2.5 !text-xs mt-2"
              >
                Update password
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: APPEARANCE & NOTIFICATION SWITCHES */}
        <div className="space-y-6 text-left">
          {/* Appearance theme */}
          <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
              Theme Appearance
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex flex-col items-center p-4 rounded-xl border text-center transition-all ${
                  themeMode === "dark"
                    ? "border-blue-500 bg-blue-500/10 text-white"
                    : "border-white/5 bg-white/[0.01] text-slate-400 hover:text-white"
                }`}
              >
                <Moon size={20} className={themeMode === "dark" ? "text-blue-400" : "text-slate-500"} />
                <span className="text-xs font-bold mt-2">Dark mode</span>
              </button>

              <button
                onClick={() => handleThemeChange("light")}
                className={`flex flex-col items-center p-4 rounded-xl border text-center transition-all ${
                  themeMode === "light"
                    ? "border-blue-500 bg-blue-500/10 text-white"
                    : "border-white/5 bg-white/[0.01] text-slate-400 hover:text-white"
                }`}
              >
                <Sun size={20} className={themeMode === "light" ? "text-blue-400" : "text-slate-500"} />
                <span className="text-xs font-bold mt-2">Light mode</span>
              </button>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
              Notification Links
            </h3>

            <div className="space-y-3.5">
              {[
                { k: "notifOrders", title: "Order Campaign Updates", desc: "Instantly alert when orders transition to completed" },
                { k: "notifWa", title: "WhatsApp Direct Alerts", desc: "Order status dispatches straight to your phone" },
                { k: "notifPrice", title: "Market Price Hikes/Drops", desc: "Alert when services in your favorites list change rate" },
                { k: "notifMarketing", title: "Promotional Emails", desc: "Newsletter updates on reseller margins" },
              ].map((pref) => (
                <div
                  key={pref.k}
                  onClick={() => handleTogglePref(pref.k)}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 pb-3 last:pb-0 cursor-pointer"
                >
                  <div className="pr-4">
                    <div className="text-xs font-bold text-white">{pref.title}</div>
                    <span className="text-[10px] text-slate-500 block font-bold mt-0.5">
                      {pref.desc}
                    </span>
                  </div>

                  <button
                    className={`h-5 w-9 rounded-full shrink-0 relative transition-colors ${
                      prefs[pref.k] ? "bg-emerald-500" : "bg-white/10"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 bg-white rounded-full transition-transform ${
                        prefs[pref.k] ? "translate-x-4" : ""
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* DANGER ZONE WIPE ACCOUNT */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.02] p-6 backdrop-blur-md text-left space-y-4">
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider border-b border-rose-500/10 pb-3 flex items-center gap-2">
              <AlertTriangle size={16} /> Danger zone
            </h3>
            <p className="text-xs leading-relaxed text-slate-400">
              Reset clears your simulated workspace memory cache (balance log, support tickets, campaign logs). This action is irreversible.
            </p>
            <button
              onClick={handleResetAccount}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white transition-colors"
            >
              Reset simulated demo account
            </button>
          </div>
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
