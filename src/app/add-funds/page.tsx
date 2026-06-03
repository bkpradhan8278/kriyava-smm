"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Shield, Wallet, CheckCircle2, CreditCard, Smartphone, DollarSign, Calendar } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { fmtINR, saveAccount } from "@/lib/account";
import { api, loadRazorpay, ApiError } from "@/lib/api";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function AddFundsPage() {
  const { account, sync } = useAccount();
  const [amount, setAmount] = useState(10);
  const [method, setMethod] = useState<"razorpay" | "upi" | "bank">("razorpay");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(amount) || amount < 10) {
      showToast("❌ Minimum deposit is ₹10.");
      return;
    }
    setCheckoutOpen(true);
  };

  // Real Razorpay payment → backend verifies signature → wallet credited.
  const handlePayment = async () => {
    setPaying(true);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load payment gateway");

      const order = await api.createPaymentOrder(amount); // backend creates Razorpay order

      await new Promise<void>((resolve, reject) => {
        // @ts-expect-error Razorpay is injected by the checkout script
        const rzp = new window.Razorpay({
          key: order.keyId,
          amount: Math.round(order.amount * 100),
          currency: order.currency,
          name: "Kriyava SMM",
          description: "Wallet top-up",
          order_id: order.orderId,
          prefill: { name: account.name || "", email: account.email || "" },
          theme: { color: "#2563EB" },
          handler: async (resp: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const res = await api.verifyPayment(resp); // backend verifies + credits
              const a = { ...account, balance: res.balance };
              a.txns = a.txns || [];
              a.txns.unshift({
                id: resp.razorpay_payment_id,
                type: "Deposit",
                amount: res.added,
                at: Date.now(),
                method: "Razorpay",
              });
              saveAccount(a);
              await sync();
              setCheckoutOpen(false);
              showToast(`✅ Added ${fmtINR(res.added)} to your wallet!`);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: { ondismiss: () => reject(new Error("Payment cancelled")) },
        });
        rzp.open();
      });
    } catch (err) {
      const msg =
        err instanceof ApiError && err.status === 503
          ? "Payments are being set up. Please try again soon."
          : err instanceof Error
            ? err.message
            : "Payment failed";
      if (!/cancel/i.test(msg)) showToast("❌ " + msg);
    } finally {
      setPaying(false);
    }
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
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-md flex items-center gap-1">
              <Shield size={11} /> Secured by Razorpay
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
                  min={10}
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value, 10) || 0))}
                  required
                  className="w-full rounded-xl border border-white/5 bg-white/[0.01] px-4 py-3.5 pl-8 font-display text-lg font-black text-white placeholder-slate-600 outline-none focus:border-blue-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 font-bold mt-1.5 block">
                Minimum deposit: ₹10. Pay securely via UPI, cards or netbanking.
              </span>
            </div>

            {/* Methods chips */}
            <div className="flex flex-col">
              <label className="text-[10.5px] font-extrabold uppercase tracking-wide text-slate-400 mb-2">Payment Method</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: "razorpay", label: "Razorpay Checkout", desc: "Cards, Netbanking", icon: CreditCard },
                  { id: "upi", label: "UPI Instant", desc: "Google Pay, PhonePe", icon: Smartphone },
                  { id: "bank", label: "Net Banking", desc: "All major banks", icon: DollarSign },
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

          {/* Security note */}
          <div className="flex gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-[11px] leading-relaxed text-slate-400">
            <Shield size={18} className="text-blue-400 shrink-0 mt-0.5" />
            <p>
              All payments are processed securely through Razorpay with 256-bit encryption. Funds are credited to your wallet instantly after a successful payment.
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

            {/* Transactions */}
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
              <Shield size={18} className="text-blue-400" />
              Confirm deposit
            </h3>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Platform:</span>
                <span className="text-white font-semibold">Kriyava SMM</span>
              </div>
              <div className="flex justify-between">
                <span>Pay via:</span>
                <span className="text-white font-bold">Razorpay (UPI / Cards / Netbanking)</span>
              </div>
              <div className="flex justify-between border-t border-white/5 pt-3">
                <span>Amount:</span>
                <b className="text-white text-base">{fmtINR(amount)}</b>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setCheckoutOpen(false)}
                className="btn btn-ghost flex-1 !py-2.5 !text-xs font-bold"
                disabled={paying}
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="btn btn-cta flex-1 !py-2.5 !text-xs font-bold"
                disabled={paying}
              >
                {paying ? "Opening…" : `Pay ${fmtINR(amount)}`}
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
