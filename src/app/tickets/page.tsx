"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageSquare, AlertCircle, Send, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { saveAccount } from "@/lib/account";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import type { Ticket } from "@/lib/types";

export default function TicketsPage() {
  const { account, refresh } = useAccount();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Order");
  const [message, setMessage] = useState("");
  
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatThreads, setChatThreads] = useState<Record<string, { sender: "user" | "support", text: string, at: number }[]>>({});
  
  const [toastMsg, setToastMsg] = useState("");

  // Seed default tickets if none exist
  useEffect(() => {
    const a = { ...account };
    if (!a.tickets || a.tickets.length === 0) {
      a.tickets = [
        {
          id: "TCK1001",
          subject: "Speed issue with order ORD10003",
          cat: "Order",
          msg: "Hello, my YouTube views order has been in processing for 1 hour. Can you speed it up?",
          status: "Answered",
          at: Date.now() - 86400000,
        },
        {
          id: "TCK1002",
          subject: "API connection rejected",
          cat: "API",
          msg: "Getting 'Invalid API Key' when executing POST from python panel_compare.",
          status: "Closed",
          at: Date.now() - 86400000 * 3,
        },
      ];
      saveAccount(a);
      refresh();
    }
  }, [account, refresh]);

  // Sync chat threads for tickets
  useEffect(() => {
    if (account.tickets) {
      const threads: typeof chatThreads = {};
      account.tickets.forEach((t) => {
        threads[t.id] = [
          { sender: "user", text: t.msg, at: t.at },
          ...(t.status === "Answered" || t.status === "Closed"
            ? [
                {
                  sender: "support" as const,
                  text: `Hello! Kriyava SMM Support here. We have processed a manual ping request to the LuvSMM gateway for your ticket reference. The speed should normalize in 10-15 minutes. Let us know if you need anything else!`,
                  at: t.at + 3600000,
                },
              ]
            : []),
        ];
      });
      setChatThreads(threads);
      if (account.tickets.length > 0 && !activeTicketId) {
        setActiveTicketId(account.tickets[0].id);
      }
    }
  }, [account, activeTicketId]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      showToast("❌ Enter ticket subject first!");
      return;
    }
    if (!message.trim()) {
      showToast("❌ Enter message description!");
      return;
    }

    const tckId = "TCK" + (1000 + (account.tickets?.length || 0) + 1);
    const newTck: Ticket = {
      id: tckId,
      subject: subject.trim(),
      cat: category,
      msg: message.trim(),
      status: "Open",
      at: Date.now(),
    };

    const a = { ...account };
    a.tickets = a.tickets || [];
    a.tickets.unshift(newTck);
    saveAccount(a);
    refresh();

    setActiveTicketId(tckId);
    setSubject("");
    setMessage("");
    showToast(`✅ Support ticket ${tckId} created!`);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeTicketId) return;

    const userMsg = chatInput.trim();
    setChatInput("");

    // Add user message locally
    setChatThreads((prev) => ({
      ...prev,
      [activeTicketId]: [
        ...prev[activeTicketId],
        { sender: "user", text: userMsg, at: Date.now() },
      ],
    }));

    // Trigger simulated support responder after 3 seconds
    setTimeout(() => {
      setChatThreads((prev) => ({
        ...prev,
        [activeTicketId]: [
          ...prev[activeTicketId],
          {
            sender: "support",
            text: `🛠️ **Support Alert**: Billing and SMM gateway experts are looking into TCK-${activeTicketId}. A live agent will provide logs updates shortly. Thank you for your patience!`,
            at: Date.now(),
          },
        ],
      }));
    }, 3000);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const activeTicket = account.tickets?.find((t) => t.id === activeTicketId);
  const activeMessages = activeTicketId ? chatThreads[activeTicketId] || [] : [];

  return (
    <DashboardShell>
      {/* PAGE HEAD */}
      <div className="text-left mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-black text-white">Customer Support Center</h1>
        <p className="text-sm text-slate-400 mt-1">Open billing, API, or order status tickets. Active agents resolve logs within 15 minutes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1.7fr] gap-6 items-start">
        {/* LEFT COLUMN: TICKET CREATOR & LIST */}
        <div className="space-y-6 text-left">
          {/* Ticket submission form */}
          <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
              Create New Ticket
            </h3>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label className="text-slate-400 mb-1.5 uppercase text-[10px] tracking-wide">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/5 bg-white/[0.01] p-2.5 text-xs text-white outline-none focus:border-blue-500"
                  >
                    <option value="Order" className="bg-[#090D16]">Order Status</option>
                    <option value="Payment" className="bg-[#090D16]">Payment / Billing</option>
                    <option value="API" className="bg-[#090D16]">Developer API</option>
                    <option value="Child Panel" className="bg-[#090D16]">Child Panels</option>
                  </select>
                </div>

                <div className="flex flex-col">
                  <label className="text-slate-400 mb-1.5 uppercase text-[10px] tracking-wide">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Speed issue with ORD..."
                    className="rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-slate-400 mb-1.5 uppercase text-[10px] tracking-wide">Message Details</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide full order ID details or deposit txn hashes so our team can resolve immediately."
                  className="w-full h-24 rounded-xl border border-white/5 bg-white/[0.01] p-3 text-xs text-white outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block !py-2.5 !text-xs"
              >
                Submit support ticket
              </button>
            </form>
          </div>

          {/* Past tickets logs list */}
          <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/5 pb-3">
              Your Support Tickets
            </h3>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {!account.tickets || account.tickets.length === 0 ? (
                <div className="text-slate-500 text-xs py-4 text-center font-semibold">No tickets created yet.</div>
              ) : (
                account.tickets.map((t) => {
                  const isActive = t.id === activeTicketId;
                  const isClosed = t.status === "Closed";
                  const isAnswered = t.status === "Answered";

                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTicketId(t.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                        isActive
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="min-w-0 pr-4">
                        <div className="text-xs font-bold text-white truncate">{t.subject}</div>
                        <span className="text-[9.5px] text-slate-500 block font-bold mt-1 uppercase tracking-wide">
                          ID: {t.id} • {t.cat}
                        </span>
                      </div>

                      <span className={`shrink-0 inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        isClosed
                          ? "bg-slate-500/10 text-slate-400"
                          : isAnswered
                          ? "bg-emerald-500/10 text-emerald-400 animate-pulse"
                          : "bg-amber-500/10 text-amber-400"
                      }`}>
                        {t.status}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE CHAT CONVERSATION */}
        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-5 backdrop-blur-md text-left flex flex-col h-[480px]">
          {activeTicket ? (
            <>
              {/* Chat Header */}
              <div className="border-b border-white/5 pb-3 mb-4 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">{activeTicket.subject}</h3>
                  <span className="text-[10px] text-slate-500 font-bold mt-0.5 block">
                    Reference ID: {activeTicket.id} • Category: {activeTicket.cat}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[9.5px] font-black uppercase ${
                  activeTicket.status === "Closed"
                    ? "bg-slate-500/10 text-slate-400"
                    : activeTicket.status === "Answered"
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}>
                  {activeTicket.status}
                </span>
              </div>

              {/* Chat Viewport Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 scrollbar-thin">
                {activeMessages.map((msg, idx) => {
                  const isSupport = msg.sender === "support";
                  return (
                    <div key={idx} className={`flex gap-2.5 ${!isSupport ? "flex-row-reverse" : ""}`}>
                      <span className={`grid h-7 w-7 place-items-center rounded-full text-white text-[10px] font-extrabold shrink-0 ${
                        isSupport ? "icontint-violet" : "icontint-blue"
                      }`}>
                        {isSupport ? "S" : "U"}
                      </span>
                      <div className="max-w-[80%]">
                        <div
                          className={`rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                            !isSupport
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none font-medium"
                          }`}
                          dangerouslySetInnerHTML={{
                            __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat input box */}
              {activeTicket.status !== "Closed" ? (
                <form onSubmit={handleSendChatMessage} className="flex gap-2 shrink-0 pt-3 border-t border-white/5">
                  <input
                    type="text"
                    placeholder="Type support reply messages..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 rounded-xl border border-white/5 bg-white/[0.01] px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500 placeholder-slate-600 focus:bg-white/[0.03]"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 hover:bg-blue-500 text-white shrink-0 active:scale-95 disabled:opacity-40"
                  >
                    <Send size={14} />
                  </button>
                </form>
              ) : (
                <div className="text-center py-2.5 border-t border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/[0.01] rounded-xl shrink-0">
                  🔒 Support Thread Closed
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-500 text-center">
              <MessageSquare size={36} className="text-slate-600" />
              <span className="font-semibold text-xs">Select or create a support ticket thread.</span>
            </div>
          )}
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
