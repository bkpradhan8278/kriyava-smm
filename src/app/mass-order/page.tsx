"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Play, Clipboard, CheckCircle2, AlertCircle, HelpCircle } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { useMarket } from "@/lib/useServices";
import { placeOrder, fmtINR } from "@/lib/account";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { MarketService } from "@/lib/types";

interface MassPreviewItem {
  lineText: string;
  service?: MarketService;
  link: string;
  qty: number;
  charge: number;
  error?: string;
  valid: boolean;
}

export default function MassOrderPage() {
  const { account, refresh } = useAccount();
  const { services } = useMarket();

  const [bulkText, setBulkText] = useState("");
  const [previews, setPreviews] = useState<MassPreviewItem[]>([]);
  const [totalCharge, setTotalCharge] = useState(0);
  const [validCount, setValidCount] = useState(0);
  const [toastMsg, setToastMsg] = useState("");

  const handleInsertSample = () => {
    if (services.length > 0) {
      const topSvcs = services.slice(0, 3);
      const lines = topSvcs.map((s, idx) => {
        return `${s.id} | https://instagram.com/profile_${idx + 1} | ${(idx + 1) * 1000}`;
      });
      setBulkText(lines.join("\n"));
    }
  };

  const handlePreview = () => {
    const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
    const parsedItems: MassPreviewItem[] = [];
    let sumCharge = 0;
    let validItems = 0;

    lines.forEach((line) => {
      const parts = line.split("|").map((p) => p.trim());
      const svcId = parts[0];
      const link = parts[1] || "";
      const qty = parseInt(parts[2] || "0", 10);

      const svc = services.find((s) => s.id.toUpperCase() === svcId.toUpperCase());
      
      if (!svc) {
        parsedItems.push({
          lineText: line,
          link,
          qty,
          charge: 0,
          error: "Invalid Service ID",
          valid: false,
        });
        return;
      }

      if (isNaN(qty) || qty < (svc.min || 10)) {
        parsedItems.push({
          lineText: line,
          service: svc,
          link,
          qty,
          charge: 0,
          error: `Below Min Limit (${(svc.min || 10).toLocaleString()})`,
          valid: false,
        });
        return;
      }

      if (svc.max && qty > svc.max) {
        parsedItems.push({
          lineText: line,
          service: svc,
          link,
          qty,
          charge: 0,
          error: `Exceeds Max Limit (${svc.max.toLocaleString()})`,
          valid: false,
        });
        return;
      }

      if (!link) {
        parsedItems.push({
          lineText: line,
          service: svc,
          link,
          qty,
          charge: 0,
          error: "Target URL Link Missing",
          valid: false,
        });
        return;
      }

      const charge = +((svc.price * qty) / 1000).toFixed(2);
      sumCharge += charge;
      validItems++;

      parsedItems.push({
        lineText: line,
        service: svc,
        link,
        qty,
        charge,
        valid: true,
      });
    });

    setPreviews(parsedItems);
    setTotalCharge(+sumCharge.toFixed(2));
    setValidCount(validItems);
  };

  const handlePlaceAll = () => {
    if (validCount === 0) return;
    if (account.balance < totalCharge) {
      showToast(`❌ Insufficient balance — need ${fmtINR(totalCharge)}`);
      return;
    }

    let successes = 0;
    previews.forEach((p) => {
      if (p.valid && p.service) {
        const res = placeOrder(p.service, p.qty, p.link);
        if (res.ok) {
          successes++;
        }
      }
    });

    refresh();
    showToast(`✅ Successfully processed ${successes} bulk orders!`);
    setBulkText("");
    setPreviews([]);
    setTotalCharge(0);
    setValidCount(0);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  return (
    <DashboardShell>
      {/* PAGE TITLE */}
      <div className="text-left mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-black text-white">Mass Order</h1>
        <p className="text-sm text-slate-400 mt-1">Place multiple orders at once — one campaign per line. Perfect for marketing agencies and resellers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 items-start">
        {/* TEXT INPUT CARD */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md text-left space-y-5">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Bulk Input Console</h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-md">
              Pipe Separated format
            </span>
          </div>

          <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 text-[12px] font-mono text-slate-400 space-y-1">
            <div className="text-white font-bold mb-1.5 uppercase font-sans text-[10px] tracking-wider">Line Format Syntax:</div>
            <div><b>service_id | target_link | quantity</b></div>
            <div>KV3135 | https://instagram.com/p/myprofile | 1000</div>
            <div>KV1644 | https://instagram.com/reel/abc123 | 5000</div>
          </div>

          <div className="flex flex-col">
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="KV3135 | https://instagram.com/p/myprofile | 1000&#10;KV1644 | https://instagram.com/reel/abc123 | 5000"
              className="w-full h-44 rounded-xl border border-white/5 bg-white/[0.01] p-4 text-xs font-mono text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:bg-white/[0.03]"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handlePreview}
              className="btn btn-ghost !px-4 !py-2.5 !text-xs flex items-center gap-1.5"
            >
              <Clipboard size={14} />
              <span>Preview Orders</span>
            </button>
            <button
              onClick={handleInsertSample}
              className="btn btn-ghost !px-4 !py-2.5 !text-xs flex items-center gap-1.5"
            >
              <HelpCircle size={14} />
              <span>Insert Samples</span>
            </button>
          </div>
        </div>

        {/* SIDE PREVIEW BOX */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md text-left sticky top-24 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Preview</h3>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded">
              {validCount} valid campaigns
            </span>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {previews.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs font-semibold">
                Paste your campaign lines on the left and click <b>Preview Orders</b>.
              </div>
            ) : (
              previews.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-bold py-2 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-white truncate block">
                      {p.service ? p.service.name : p.lineText.slice(0, 24)}
                    </div>
                    <span className="text-[9.5px] text-slate-500 font-bold block mt-0.5">
                      Qty: {p.qty.toLocaleString()} • Link: {p.link ? p.link.slice(0, 16) + "..." : "—"}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    {p.valid ? (
                      <span className="text-emerald-400">{fmtINR(p.charge)}</span>
                    ) : (
                      <span className="text-rose-400 text-[10px] leading-tight flex items-center gap-1">
                        <AlertCircle size={10} /> {p.error}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 border border-white/5 bg-white/[0.01] rounded-xl flex items-center justify-between text-sm font-bold mt-4">
            <span className="text-slate-400">Total charge:</span>
            <b className="text-xl text-blue-400 font-extrabold">{fmtINR(totalCharge)}</b>
          </div>

          <button
            onClick={handlePlaceAll}
            disabled={validCount === 0}
            className="btn btn-cta btn-block btn-lg flex items-center justify-center gap-2"
          >
            <Play size={14} className="fill-current" />
            <span>Place all orders ({validCount})</span>
          </button>

          <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs font-bold text-slate-400">
            <span>Your Wallet Balance:</span>
            <b className="text-white">{fmtINR(account.balance)}</b>
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
