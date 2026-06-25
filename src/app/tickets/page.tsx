"use client";
import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, MessageSquare, RefreshCw } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { api, type ApiTicket } from "@/lib/api";

function toDate(at: string) {
  const d = new Date(at);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString();
}

export default function TicketsPage() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Order");
  const [message, setMessage] = useState("");
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const loadTickets = async () => {
    setLoading(true);
    try {
      const rows = await api.tickets();
      setTickets(rows);
      setActiveTicketId((current) => current || rows[0]?.id || null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return showToast("Enter ticket subject first.");
    if (!message.trim()) return showToast("Enter message details.");

    setSaving(true);
    try {
      const created = await api.createTicket(subject.trim(), category, message.trim());
      await loadTickets();
      setActiveTicketId(created.id);
      setSubject("");
      setMessage("");
      showToast(`Support ticket ${created.id} created.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Ticket creation failed.");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const activeTicket = tickets.find((t) => t.id === activeTicketId);

  return (
    <DashboardShell>
      <div className="text-left mb-8">
        <h1 className="font-display text-2xl md:text-3xl font-black text-white">Customer Support Center</h1>
        <p className="text-sm text-slate-400 mt-1">Open billing, API, or order status tickets. Replies are handled by the support team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)] gap-6 items-start">
        <div className="space-y-6 text-left">
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
                    placeholder="Issue with order or payment"
                    className="rounded-xl border border-white/5 bg-white/[0.01] px-3.5 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label className="text-slate-400 mb-1.5 uppercase text-[10px] tracking-wide">Message Details</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share the order ID, payment ID, or full issue details."
                  className="w-full h-24 rounded-xl border border-white/5 bg-white/[0.01] p-3 text-xs text-white outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <button type="submit" disabled={saving} className="btn btn-primary btn-block !py-2.5 !text-xs">
                {saving ? "Submitting..." : "Submit support ticket"}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Support Tickets</h3>
              <button onClick={() => void loadTickets()} className="text-slate-400 hover:text-white" aria-label="Refresh tickets">
                <RefreshCw size={14} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {loading ? (
                <div className="text-slate-500 text-xs py-4 text-center font-semibold">Loading tickets...</div>
              ) : tickets.length === 0 ? (
                <div className="text-slate-500 text-xs py-4 text-center font-semibold">No tickets created yet.</div>
              ) : (
                tickets.map((t) => {
                  const isActive = t.id === activeTicketId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTicketId(t.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                        isActive ? "border-blue-500 bg-blue-500/10" : "border-white/5 bg-white/[0.01] hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="min-w-0 pr-4">
                        <div className="text-xs font-bold text-white truncate">{t.subject}</div>
                        <span className="text-[9.5px] text-slate-500 block font-bold mt-1 uppercase tracking-wide">
                          ID: {t.id} | {t.category}
                        </span>
                      </div>
                      <span className="shrink-0 inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/10 text-amber-400">
                        {t.status}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#0D1321]/50 p-6 backdrop-blur-md text-left min-h-[420px]">
          {activeTicket ? (
            <div className="space-y-5">
              <div className="border-b border-white/5 pb-4 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">{activeTicket.subject}</h3>
                  <span className="text-[10px] text-slate-500 font-bold mt-1 block">
                    Reference ID: {activeTicket.id} | {activeTicket.category} | {toDate(activeTicket.at)}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[9.5px] font-black uppercase bg-amber-500/10 text-amber-400">
                  {activeTicket.status}
                </span>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-full icontint-blue text-white text-[10px] font-extrabold shrink-0">U</span>
                  <p className="text-xs leading-relaxed text-slate-200">{activeTicket.message}</p>
                </div>
              </div>

              <div className="flex gap-2.5 rounded-xl border border-amber-500/10 bg-amber-500/[0.03] p-4 text-[11px] leading-relaxed text-slate-400">
                <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                <p>Support replies are handled outside this chat view for now. Keep the ticket ID for WhatsApp or email follow-up.</p>
              </div>
            </div>
          ) : (
            <div className="min-h-[360px] flex flex-col items-center justify-center gap-2 text-slate-500 text-center">
              <MessageSquare size={36} className="text-slate-600" />
              <span className="font-semibold text-xs">Select or create a support ticket.</span>
            </div>
          )}
        </div>
      </div>

      {toastMsg && (
        <div className="fixed bottom-24 left-6 z-55 rounded-xl border border-white/10 bg-[#0D1321]/95 px-5 py-3 shadow-2xl backdrop-blur-md flex items-center gap-2.5 text-xs font-black border-l-4 border-l-emerald-500 animate-slideup">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}
    </DashboardShell>
  );
}
