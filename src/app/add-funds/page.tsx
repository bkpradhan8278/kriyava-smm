"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Shield, Sparkles, Wallet, CheckCircle2, CreditCard, Smartphone, DollarSign, Calendar } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { addFunds, fmtINR, saveAccount } from "@/lib/account";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function AddFundsPage() {
  const { account, refresh } = useAccount();
  const [amount, setAmount] = useState(1000);
  const [method, setMethod] = useState<"razorpay" | "upi" | "bank">("razorpay");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(amount) || amount <= 0) {
      showToast("❌ Please enter a valid deposit amount.");
      return;
    }
    setCheckoutOpen(true);
  };

  const handleSimulatePayment = () => {
    setPaying(true);

    setTimeout(() => {
      // Automatically calculate 5% cashback
      const bonus = amount >= 1000 ? Math.round(amount * 0.05) : 0;
      const credit = amount + bonus;

      const a = { ...account };
      a.balance = +((a.balance || 0) + credit).toFixed(2);
      
      a.txns = a.txns || [];
      a.txns.unshift({
        id: "TXN" + (1000 + a.txns.length + 1),
        type: "Deposit",
        amount: credit,
        at: Date.now(),
        method: method === "razorpay" ? "Razorpay Card" : method === "upi" ? "UPI QR Scan" : "Bank Transfer IMPS",
      });

      saveAccount(a);
      refresh();
      
      setPaying(false);
      setCheckoutOpen(false);

      if (bonus > 0) {
        showToast(`✅ Deposited ${fmtINR(amount)} + ₹${bonus} Cashback Bonus successfully!`);
      } else {
        showToast(`✅ Deposited ${fmtINR(amount)} successfully!`);
      }
    }, 1500);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <DashboardShell>
      {/* PAGE HEAD */}
      <div className="text-left mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-black text-white">Add Funds</h1>
        <p className="text-sm text-slate-400 mt-1">Refill your Kriyava wallet instantly. Choose cards, netbanking, UPI, or wholesale wire transfers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
        {/* INPUT DEPOSIT CARD */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md text-left space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Fund Wallet</h3>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Sparkles size={11} /> 5% Cashback Active
            </span>
          </div>

          <form onSubmit={handleDepositSubmit} className="space-y-5">
            {/* Amount input */}
            <div className="flex flex-col">
              <label className="text-[10.5px] font-extrabold uppercase tracking-wide text-slate-400 mb-2">Deposit Amount (INR)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg font-black text-slate-500">₹</span>
                <input
                  type="number"
                  min={100}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value, 10) || 0))}
                  required
                  className="w-full rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3.5 pl-8 font-display text-lg font-black text-white placeholder-slate-600 outline-none focus:border-blue-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-bold mt-1.5 block">
                Minimum deposit: ₹100. Wholesale bonuses automatically calculated.
              </span>
            </div>

            {/* Methods chips */}
            <div className="flex flex-col">
              <label className="text-[10.5px] font-extrabold uppercase tracking-wide text-slate-400 mb-2">Payment Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "razorpay", label: "Razorpay Checkout", desc: "Cards, Netbanking", icon: CreditCard },
                  { id: "upi", label: "UPI Instant QR", desc: "Google Pay, PhonePe", icon: Smartphone },
                  { id: "bank", label: "Wire IMPS / NEFT", desc: "Wholesale (2% Bonus)", icon: DollarSign },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id as any)}
                      className={`flex flex-col items-center text-center p-4 rounded-xl border transition-all ${
                        method === m.id
                          ? "border-blue-500 bg-blue-500/10 text-white shadow-[0_4px_12px_rgba(37,99,235,0.15)]"
                          : "border-white/5 bg-white/[0.01] text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon size={20} className={method === m.id ? "text-blue-400" : "text-slate-500"} />
                      <span className="text-xs font-bold mt-2">{m.label}</span>
                      <span className="text-[9.5px] text-slate-500 font-bold mt-0.5">{m.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-cta btn-block btn-lg mt-3"
            >
              Secure checkout payment
            </button>
          </form>

          {/* Cashback highlight */}
          <div className="flex gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-[11px] leading-relaxed text-slate-400">
            <Sparkles size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <p>
              🎁 **Wholesale Cashback Offer**: Top up ₹1,000.00 or more in a single transaction, and automatically receive a **5% cash bonus** directly added to your Kriyava wallet. No coupons needed.
            </p>
          </div>
        </div>

        {/* SIDE BALANCE & TRANSACTION HISTORIES */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md text-left sticky top-24 space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Wallet Balance</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-xs font-bold">Current Balance:</span>
              <b className="text-2xl font-display font-black text-emerald-400">{fmtINR(account.balance)}</b>
            </div>
            {amount >= 1000 && (
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-t border-white/5 pt-3">
                <span>Calculated 5% Bonus:</span>
                <span className="text-emerald-400">+ ₹{Math.round(amount * 0.05)} Bonus Wallet Credits</span>
              </div>
            )}

            {/* Simulated Transactions */}
            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase mb-3.5">
                Recent Wallet Deposits
              </h4>
              <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                {!account.txns || account.txns.length === 0 ? (
                  <div className="text-slate-500 text-xs py-4 text-center font-semibold">No recent deposits found.</div>
                ) : (
                  account.txns.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between text-xs font-bold py-2 border-b border-white/5 last:border-0">
                      <div>
                        <div className="text-white font-bold">{txn.type} ({txn.method})</div>
                        <span className="text-[9.5px] text-slate-500 block font-bold mt-0.5">
                          ID: {txn.id} • {new Date(txn.at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-emerald-400 font-extrabold">{fmtINR(txn.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CHECKOUT MODAL OVERLAY */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadein">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0D1321] p-6 shadow-2xl relative text-left">
            <h3 className="font-display text-lg font-black text-white mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
              <Shield size={18} className="text-emerald-400" />
              Secure deposit simulator
            </h3>
            
            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Vendor:</span>
                <span className="text-white font-semibold">Kriyava Social Platform</span>
              </div>
              <div className="flex justify-between">
                <span>Method:</span>
                <span className="text-white font-bold uppercase">{method} Gateway</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <b className="text-white">{fmtINR(amount)}</b>
              </div>
              {amount >= 1000 && (
                <div className="flex justify-between text-emerald-400 font-bold bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                  <span>Cashback bonus credit:</span>
                  <span>+ ₹{Math.round(amount * 0.05)}</span>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setCheckoutOpen(false)}
                className="btn btn-ghost flex-1 !py-2.5 !text-xs font-bold"
                disabled={paying}
              >
                Cancel Checkout
              </button>
              <button
                onClick={handleSimulatePayment}
                className="btn btn-cta flex-1 !py-2.5 !text-xs font-bold"
                disabled={paying}
              >
                {paying ? "authorizing..." : "Simulate Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

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
