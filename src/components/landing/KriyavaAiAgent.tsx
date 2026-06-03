"use client";
import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Send, X, Bot, User, ChevronRight, CheckCircle2 } from "lucide-react";
import { useAccount } from "@/lib/useAccount";
import { useMarket } from "@/lib/useServices";
import { fmtINR } from "@/lib/account";
import type { MarketService } from "@/lib/types";

interface Message {
  sender: "bot" | "user";
  text: string;
  card?: React.ReactNode;
  at: number;
}

export function KriyavaAiAgent() {
  const { account } = useAccount();
  const { services } = useMarket();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize chatbot welcome message
  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text: `Hey, I'm Kriyava AI! Spark your social growth by telling me what you need. 

Try asking:
• "What is my current wallet balance?"
• "Find the cheapest Instagram followers service."
• "Why do cheap followers drop, and how do quality tiers work?"
• "Order 1,000 views on link: https://instagram.com/p/growth"`,
        at: Date.now(),
      },
    ]);
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    setInput("");
    
    // Add user message
    setMessages((prev) => [...prev, { sender: "user", text: userText, at: Date.now() }]);
    setTyping(true);

    setTimeout(() => {
      processCommand(userText);
    }, 900);
  };

  const processCommand = (query: string) => {
    const q = query.toLowerCase();
    setTyping(false);

    // 1. CHECK BALANCE
    if (q.includes("balance") || q.includes("money") || q.includes("wallet") || q.includes("fund")) {
      const text = `Your current Kriyava wallet balance is **${fmtINR(account.balance)}** (Total spent: ${fmtINR(account.spent)} across ${account.orders.length} orders). Let me know if you need to add more funds!`;
      setMessages((prev) => [...prev, { sender: "bot", text, at: Date.now() }]);
      return;
    }

    // 2. EXPLAIN QUALITY TIERS / DROPS
    if (q.includes("drop") || q.includes("quality") || q.includes("tier") || q.includes("refill")) {
      const text = `SMM services fall into three distinct quality tiers:
      
• **High Quality (HQ)**: Active profiles with profile pictures (DP) and organic posts. Extremely low drop rate (0-5%) and usually comes with a 30-day to Lifetime Refill guarantee.
• **Medium Quality (MQ)**: Real-looking accounts with global names. Low drop rate (5-15%) with active refill options.
• **Low Quality (LQ)**: Bot-driven profiles. High drop rate (40-80%) and no refill option, but extremely inexpensive.

*Pro tip: Always filter by 'High' quality in the services menu for organic branding.*`;
      setMessages((prev) => [...prev, { sender: "bot", text, at: Date.now() }]);
      return;
    }

    // 3. ORDER PLACEMENT PARSING
    const orderMatch = q.match(/(?:order|buy|get)\s+([\d,]+)\s+([\w\s]+)\s+(?:for|on|link)\s+(https?:\/\/[^\s]+)/i);
    if (orderMatch) {
      const qtyStr = orderMatch[1].replace(/,/g, "");
      const niche = orderMatch[2].trim();
      const link = orderMatch[3].trim();
      const qty = parseInt(qtyStr, 10);

      if (isNaN(qty) || qty <= 0) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "Please specify a valid numeric quantity.", at: Date.now() },
        ]);
        return;
      }

      // Search for cheapest matching service
      const targetSvc = findCheapestServiceForNiche(niche);
      if (!targetSvc) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: `I couldn't find a service matching "${niche}". Please try terms like "instagram followers", "instagram likes", "youtube views", or "telegram members".`,
            at: Date.now(),
          },
        ]);
        return;
      }

      prepareOrderSuggestion(targetSvc, qty, link);
      return;
    }

    // 4. CHEAPEST SERVICE QUERY
    const keywords = ["instagram", "youtube", "tiktok", "telegram", "facebook", "followers", "likes", "views", "comments", "members"];
    const matchedKws = keywords.filter((k) => q.includes(k));
    
    if (matchedKws.length > 0) {
      const bestSvc = findCheapestServiceForNiche(q);
      if (bestSvc) {
        const text = `I found a highly recommended match for your search! Here is the cheapest **${bestSvc.platform} ${bestSvc.category}** service available:`;
        
        const card = (
          <div className="mt-3 rounded-xl border border-[color:var(--color-line)] bg-white p-3.5 shadow-sm text-left">
            <span className="inline-block text-[10.5px] font-extrabold uppercase tracking-wide text-[color:var(--color-primary)] bg-blue-50 px-2 py-0.5 rounded-md mb-1.5">
              {bestSvc.platform} • Quality Tier {bestSvc.quality}/5
            </span>
            <div className="text-[13px] font-bold leading-snug mb-1 text-[color:var(--color-ink)] line-clamp-2">
              {bestSvc.name}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-[color:var(--color-line-soft)] text-xs text-[color:var(--color-muted)]">
              <div>Price: <b className="text-[14px] text-[color:var(--color-ink)]">{fmtINR(bestSvc.price)}</b> / 1K</div>
              <div>Speed: <span className="font-semibold text-emerald-600">{bestSvc.speed}</span></div>
            </div>
            <button
              onClick={() => {
                setMessages((prev) => [
                  ...prev,
                  { sender: "user", text: `Order 1,000 units on service ${bestSvc.id}`, at: Date.now() },
                ]);
                prepareOrderSuggestion(bestSvc, 1000, "https://instagram.com/myprofile");
              }}
              className="btn btn-primary btn-block !py-2 !text-xs mt-3"
            >
              Order 1,000 Units Now (₹{(bestSvc.price).toFixed(2)})
            </button>
          </div>
        );

        setMessages((prev) => [...prev, { sender: "bot", text, card, at: Date.now() }]);
        return;
      }
    }

    // 5. DEFAULT BACKFALL RESPONSE
    const fallbackText = `I heard you, but I wasn't sure how to process that. You can ask me to:
    
• Find the cheapest service (e.g. "cheapest instagram followers")
• Check your current wallet balance
• Place an order (e.g. "order 1000 likes on https://instagram.com/my-post")
• Ask about low-drop vs high-quality tiers.`;
    setMessages((prev) => [...prev, { sender: "bot", text: fallbackText, at: Date.now() }]);
  };

  const findCheapestServiceForNiche = (nicheStr: string): MarketService | null => {
    if (!services || services.length === 0) return null;
    const keywords = nicheStr.toLowerCase().split(/\s+/).filter(Boolean);
    
    let matches = services.filter((s) => {
      const haystack = (s.name + " " + s.platform + " " + s.category).toLowerCase();
      return keywords.every((kw) => haystack.includes(kw));
    });

    if (matches.length === 0) return null;
    // Sort by price ascending
    return matches.sort((a, b) => a.price - b.price)[0];
  };

  const prepareOrderSuggestion = (svc: MarketService, qty: number, link: string) => {
    const total = +((svc.price * qty) / 1000).toFixed(2);

    if (account.balance < total) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `❌ **Insufficient Funds**: Ordering ${qty.toLocaleString()} units of *${svc.name.slice(0, 40)}...* costs **${fmtINR(total)}**, but you only have **${fmtINR(account.balance)}** in your wallet.

Go to the [Add Funds](/add-funds) page and complete a verified Razorpay top-up first.`,
          at: Date.now(),
        },
      ]);
      return;
    }

    const res = {
      order: {
        id: "ready",
        service: svc.name,
        charge: total,
      },
      balance: account.balance,
    };
    if (res.order) {
      
      const card = (
        <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm text-left">
          <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-sm mb-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            Order Ready
          </div>
          <div className="text-xs text-emerald-800 space-y-1.5">
            <div>Service: <span className="font-medium">{res.order.service}</span></div>
            <div>Quantity: <span className="font-bold">{qty.toLocaleString()} units</span></div>
            <div>Total Cost: <span className="font-extrabold">{fmtINR(res.order.charge)}</span></div>
            <div>Target Link: <span className="underline truncate block max-w-[20ch]">{link}</span></div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-emerald-700 bg-white/80 rounded-lg px-2.5 py-1.5">
            <span>Next step:</span>
            <span>Place it in dashboard</span>
          </div>
        </div>
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Great choice. I found the best matching service. Please place it from the dashboard so the backend can verify wallet balance and create the order securely.",
          card,
          at: Date.now(),
        },
      ]);
    }
  };

  return (
    <>
      {/* floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-5 py-3 text-[14.5px] font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          background: "linear-gradient(135deg, #7C3AED, #2563EB)",
          boxShadow: "0 8px 30px rgba(124, 58, 237, 0.4)",
        }}
        aria-label="Open Kriyava AI Assistant"
      >
        <Sparkles size={18} className="animate-pulse" />
        <span>Ask Kriyava AI</span>
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
        </span>
      </button>

      {/* chat dialog */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-55 flex h-[500px] w-[370px] flex-col rounded-2xl border border-[color:var(--color-line)] bg-white/95 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300"
          style={{ boxShadow: "var(--shadow-lg-soft)" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3.5 text-white"
            style={{ background: "linear-gradient(135deg, #2563EB, #7C3AED)" }}
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/20">
                <Sparkles size={16} />
              </span>
              <div>
                <h3 className="text-sm font-bold leading-none">Kriyava growth assistant</h3>
                <span className="text-[10px] text-white/80 font-medium mt-0.5 block flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  AI Agent Online
                </span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white" aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          {/* Messages body */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : ""}`}>
                <span
                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-white text-xs ${
                    m.sender === "bot" ? "icontint-violet" : "icontint-blue"
                  }`}
                >
                  {m.sender === "bot" ? <Bot size={14} /> : <User size={14} />}
                </span>
                <div className="max-w-[78%]">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
                      m.sender === "user"
                        ? "bg-[color:var(--color-primary)] text-white rounded-tr-none"
                        : "bg-white border border-[color:var(--color-line-soft)] text-[color:var(--color-ink)] rounded-tl-none font-medium"
                    }`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {m.text}
                  </div>
                  {m.card && m.card}
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full icontint-violet text-white text-xs">
                  <Bot size={14} />
                </span>
                <div className="bg-white border border-[color:var(--color-line-soft)] rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-[color:var(--color-muted)] shadow-sm font-semibold flex items-center gap-1">
                  Agent is planning
                  <span className="flex gap-0.5 ml-1">
                    <span className="h-1 w-1 bg-[color:var(--color-muted)] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-1 w-1 bg-[color:var(--color-muted)] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-1 w-1 bg-[color:var(--color-muted)] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Form input */}
          <form onSubmit={handleSend} className="border-t border-[color:var(--color-line)] p-3 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to find cheapest services, check balance..."
              className="flex-1 rounded-[10px] border border-[color:var(--color-line)] px-3.5 py-2 text-[13px] text-[color:var(--color-ink)] placeholder-[#94a3b8] focus:border-[color:var(--color-primary)] focus:ring-1 focus:ring-[color:var(--color-primary)] outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="grid h-9 w-9 place-items-center rounded-[10px] bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-600)] transition-colors active:scale-95 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
