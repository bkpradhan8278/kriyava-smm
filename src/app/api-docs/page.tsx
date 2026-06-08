"use client";
import React, { useState } from "react";
import { Code, KeyRound, Copy, Check, Terminal } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { api } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

const ENDPOINT = `${api.base}/api/v2`;

interface ApiAction {
  action: string;
  desc: string;
  params: [string, string][];
  response: string;
}

const ACTIONS: ApiAction[] = [
  {
    action: "balance",
    desc: "Check your wallet balance.",
    params: [["key", "Your API key"], ["action", "balance"]],
    response: `{ "balance": "1250.00", "currency": "INR" }`,
  },
  {
    action: "services",
    desc: "Get the full list of available services with live prices.",
    params: [["key", "Your API key"], ["action", "services"]],
    response: `[
  {
    "service": "kva641",
    "name": "Instagram Followers | HQ",
    "type": "Default",
    "category": "Instagram — Followers",
    "rate": "12.5000",
    "min": "10",
    "max": "100000",
    "refill": true,
    "cancel": true
  }
]`,
  },
  {
    action: "add",
    desc: "Place a new order.",
    params: [
      ["key", "Your API key"],
      ["action", "add"],
      ["service", "Service ID (from services list)"],
      ["link", "Target link / username"],
      ["quantity", "Quantity to order"],
    ],
    response: `{ "order": "clx9k2p0a0001" }`,
  },
  {
    action: "status",
    desc: "Check the status of one or many orders.",
    params: [
      ["key", "Your API key"],
      ["action", "status"],
      ["order", "Order ID (single)"],
      ["orders", "Comma-separated order IDs (bulk, max 100)"],
    ],
    response: `{
  "charge": "125.0000",
  "start_count": "0",
  "status": "Completed",
  "remains": "0",
  "currency": "INR"
}`,
  },
  {
    action: "refill",
    desc: "Request a refill for an eligible order.",
    params: [["key", "Your API key"], ["action", "refill"], ["order", "Order ID"]],
    response: `{ "refill": "clx9k2p0a0001" }`,
  },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { void navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 shrink-0"
      aria-label="Copy"
    >
      {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
    </button>
  );
}

export default function ApiDocsPage() {
  const { account } = useAccount();
  const apiKey = account.apiKey || "YOUR_API_KEY";

  return (
    <DashboardShell>
      <div className="text-left mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-black text-white">Developer API</h1>
        <p className="text-sm text-slate-400 mt-1">
          Integrate Kriyava into your own panel, bot, or app. Standard SMM-panel v2 format.
        </p>
      </div>

      {/* API KEY + ENDPOINT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5">
          <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
            <KeyRound size={13} className="text-amber-400" /> Your API Key
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 truncate rounded-lg border border-white/10 bg-[#090D16] px-3 py-2.5 text-xs font-mono text-emerald-400">{apiKey}</code>
            <CopyBtn text={apiKey} />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Keep this secret. Regenerate it anytime from Settings.</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5">
          <div className="flex items-center gap-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-3">
            <Terminal size={13} className="text-blue-400" /> API Endpoint
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 truncate rounded-lg border border-white/10 bg-[#090D16] px-3 py-2.5 text-xs font-mono text-blue-400">{ENDPOINT}</code>
            <CopyBtn text={ENDPOINT} />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">HTTP <b className="text-slate-300">POST</b> · <code className="text-slate-400">application/x-www-form-urlencoded</code> or JSON</p>
        </div>
      </div>

      {/* QUICK START */}
      <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 mb-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-3">
          <Code size={16} className="text-emerald-400" /> Quick Start (cURL)
        </h3>
        <div className="relative">
          <pre className="overflow-x-auto rounded-xl border border-white/10 bg-[#090D16] p-4 text-[11.5px] font-mono text-slate-300 leading-relaxed">{`curl -X POST ${ENDPOINT} \\
  -d "key=${apiKey}" \\
  -d "action=add" \\
  -d "service=kva641" \\
  -d "link=https://instagram.com/yourprofile" \\
  -d "quantity=1000"`}</pre>
          <div className="absolute top-3 right-3">
            <CopyBtn text={`curl -X POST ${ENDPOINT} -d "key=${apiKey}" -d "action=add" -d "service=kva641" -d "link=https://instagram.com/yourprofile" -d "quantity=1000"`} />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="space-y-4">
        {ACTIONS.map((a) => (
          <div key={a.action} className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="rounded-md bg-blue-600/15 text-blue-400 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">POST</span>
              <code className="text-sm font-black text-white">action={a.action}</code>
            </div>
            <p className="text-xs text-slate-400 mb-4">{a.desc}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Params */}
              <div>
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Parameters</div>
                <div className="rounded-xl border border-white/5 overflow-hidden">
                  {a.params.map(([k, v], i) => (
                    <div key={k} className={`flex items-start gap-3 px-3 py-2 text-[11px] ${i % 2 ? "bg-white/[0.01]" : ""}`}>
                      <code className="font-mono font-bold text-blue-400 shrink-0 w-20">{k}</code>
                      <span className="text-slate-400">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Response */}
              <div>
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-2">Example Response</div>
                <pre className="overflow-x-auto rounded-xl border border-white/5 bg-[#090D16] p-3 text-[11px] font-mono text-emerald-400/90 leading-relaxed h-full">{a.response}</pre>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-slate-500 mt-6 text-center">
        Order status values: <span className="text-slate-300">Queued · Processing · In progress · Partial · Completed · Canceled · Failed</span>
      </p>
    </DashboardShell>
  );
}
