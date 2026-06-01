"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Key, Play, Shield, Terminal, CheckCircle2, Copy } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { useMarket } from "@/lib/useServices";
import { fmtINR, saveAccount } from "@/lib/account";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function ApiDocsPage() {
  const { account, refresh } = useAccount();
  const { services } = useMarket();
  const [apiKey, setApiKey] = useState("");
  const [action, setAction] = useState<"services" | "balance" | "add" | "status">("balance");
  const [apiLogs, setApiLogs] = useState<string>("");
  const [toastMsg, setToastMsg] = useState("");

  // Sync / generate default API key if none exists
  useEffect(() => {
    if (account.apiKey) {
      setApiKey(account.apiKey);
    } else {
      const mockKey = "key_de3cc3ad9a132cc52dc67ff923f5b56c";
      const a = { ...account, apiKey: mockKey };
      saveAccount(a);
      setApiKey(mockKey);
      refresh();
    }
  }, [account, refresh]);

  const handleGenerateKey = () => {
    const nextKey = "key_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const a = { ...account, apiKey: nextKey };
    saveAccount(a);
    setApiKey(nextKey);
    refresh();
    showToast("🔑 New API Key generated successfully!");
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    showToast("📋 API Key copied to clipboard!");
  };

  const handleExecuteRequest = () => {
    let mockResult: any = {};
    const timestamp = new Date().toISOString();

    if (action === "balance") {
      mockResult = {
        status: "success",
        balance: account.balance,
        currency: "INR",
        username: account.name,
        timestamp,
      };
    } else if (action === "services") {
      mockResult = services.slice(0, 3).map((s) => ({
        service: s.id,
        name: s.name,
        type: s.category,
        rate: s.price,
        min: s.min,
        max: s.max,
        refill: s.refill !== "No refill",
      }));
    } else if (action === "add") {
      mockResult = {
        order: 10045,
        charge: 50.0,
        currency: "INR",
        status: "success",
        timestamp,
      };
    } else if (action === "status") {
      mockResult = {
        status: "Completed",
        charge: 50.0,
        start_count: 1000,
        remains: 0,
        currency: "INR",
        timestamp,
      };
    }

    setApiLogs(JSON.stringify(mockResult, null, 2));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <DashboardShell>
      {/* PAGE HEAD */}
      <div className="text-left mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-black text-white">Developer API Suite</h1>
        <p className="text-sm text-slate-400 mt-1">Integrate SMM growth services directly into your own app or reseller panels. Fully automated JSON endpoints.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-6 items-start">
        {/* CREDENTIALS CARD */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md text-left space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Shield size={16} className="text-blue-400" />
              API credentials
            </h3>
          </div>

          <div className="space-y-4 text-xs font-bold">
            <div className="flex flex-col">
              <span className="text-slate-400 mb-1.5 uppercase text-[10px] tracking-wide">Developer Endpoint URL</span>
              <div className="bg-white/[0.01] border border-white/5 px-3 py-2.5 rounded-xl text-white font-mono select-all">
                https://kriyava.com/api/v2
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-slate-400 mb-1.5 uppercase text-[10px] tracking-wide">Your private API key</span>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  readOnly
                  className="flex-1 bg-white/[0.01] border border-white/5 px-3.5 py-2.5 rounded-xl text-white font-mono text-xs outline-none"
                />
                <button
                  onClick={handleCopyKey}
                  className="px-3.5 rounded-xl border border-white/10 hover:border-white text-slate-300 hover:text-white"
                  title="Copy Key"
                >
                  <Copy size={14} />
                </button>
              </div>
            </div>

            <button
              onClick={handleGenerateKey}
              className="btn btn-primary btn-block !py-2.5 !text-xs"
            >
              Generate New API Key
            </button>
          </div>
        </div>

        {/* INTERACTIVE TESTING CONSOLE */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md text-left space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal size={16} className="text-amber-400" />
              Live API Console
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md">
              Simulated sandbox
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400 shrink-0">Request Action:</span>
              <div className="flex flex-wrap gap-1.5 p-1 rounded-xl border border-white/5 bg-white/[0.01] text-[11px] font-bold">
                {[
                  { id: "balance", label: "Check Balance" },
                  { id: "services", label: "Check Services" },
                  { id: "add", label: "Place Order" },
                  { id: "status", label: "Check Status" },
                ].map((act) => (
                  <button
                    key={act.id}
                    onClick={() => setAction(act.id as any)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      action === act.id ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {act.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Code request parameters view */}
            <div className="bg-black/30 border border-white/5 rounded-xl p-3.5 font-mono text-[10.5px] text-slate-400 space-y-1">
              <div><b>POST Method URL parameters:</b></div>
              <div>key: <span className="text-emerald-400">&quot;{apiKey.slice(0, 10)}...&quot;</span></div>
              <div>action: <span className="text-blue-400">&quot;{action}&quot;</span></div>
              {action === "add" && (
                <>
                  <div>service: <span className="text-white">3135</span></div>
                  <div>link: <span className="text-white">&quot;https://instagram.com/mybrand&quot;</span></div>
                  <div>quantity: <span className="text-white">1000</span></div>
                </>
              )}
              {action === "status" && <div>order: <span className="text-white">10003</span></div>}
            </div>

            <button
              onClick={handleExecuteRequest}
              className="btn btn-cta !px-5 !py-2.5 !text-xs flex items-center gap-1.5"
            >
              <Play size={12} className="fill-current" />
              <span>Execute Sandbox Request</span>
            </button>

            {/* Results Logs console */}
            {apiLogs && (
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-500 mb-2">JSON Response Body</span>
                <pre className="w-full overflow-x-auto rounded-xl border border-white/5 bg-black/50 p-4 font-mono text-[11px] text-emerald-400 text-left select-all max-h-[220px]">
                  {apiLogs}
                </pre>
              </div>
            )}
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
