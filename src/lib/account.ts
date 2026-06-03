// ============================================================
// KRIYAVA — account store (localStorage) + helpers
// Shared by every app page AND the AI agent, so state stays in sync.
// ============================================================
import type { Account, MarketService, Order } from "./types";

const KEY = "kriyava_account_v1";
const THEME_KEY = "kriyava_theme";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadAccount(): Account {
  if (!isBrowser()) return blank();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const a = JSON.parse(raw) as Account;
    if (a.balance == null) return blank();
    if (!a.orders) a.orders = [];
    return a;
  } catch {
    return blank();
  }
}

function blank(): Account {
  return { name: "Creator", balance: 0, spent: 0, orders: [], favorites: [], _seeded: true };
}

export function saveAccount(a: Account) {
  if (!isBrowser()) return;
  localStorage.setItem(KEY, JSON.stringify(a));
  window.dispatchEvent(new CustomEvent("kriyava:account", { detail: a }));
}

/** Ensure an account exists (seeds a demo wallet on first run). */
export function ensureAccount(): Account {
  const a = loadAccount();
  if (!isBrowser()) return a;
  if (!localStorage.getItem(KEY)) saveAccount(a);
  return a;
}

export function fmtINR(v: number | null | undefined): string {
  if (v == null || isNaN(v)) return "₹0";
  if (v < 1) return "₹" + Math.round(v * 1000) / 1000;
  return "₹" + Number(v).toLocaleString("en-IN");
}

export function addFunds(amount: number): number {
  const a = ensureAccount();
  amount = Math.max(0, amount || 0);
  a.balance = +(a.balance + amount).toFixed(2);
  a.txns = a.txns || [];
  a.txns.unshift({
    id: "TXN" + (1000 + a.txns.length + 1),
    type: "Deposit",
    amount,
    at: Date.now(),
    method: "Razorpay",
  });
  saveAccount(a);
  return a.balance;
}

export type OrderResult =
  | { ok: true; order: Order; balance: number }
  | { ok: false; error: "insufficient"; total: number; balance: number };

export function placeOrder(svc: MarketService, qty: number, link?: string): OrderResult {
  const a = ensureAccount();
  qty = Math.max(svc.min || 1, qty || 0);
  const total = +((svc.price * qty) / 1000).toFixed(2);
  if (a.balance < total) return { ok: false, error: "insufficient", total, balance: a.balance };
  a.balance = +(a.balance - total).toFixed(2);
  a.spent = +((a.spent || 0) + total).toFixed(2);
  const order: Order = {
    id: "ORD" + (10000 + a.orders.length + 1),
    service: svc.name,
    qty,
    link: link || "(none)",
    charge: total,
    status: "Processing",
    at: Date.now(),
    provider: svc.provider || "auto",
  };
  a.orders.unshift(order);
  saveAccount(a);
  return { ok: true, order, balance: a.balance };
}

export function getTheme(): "dark" | "light" {
  if (!isBrowser()) return "dark";
  return (localStorage.getItem(THEME_KEY) as "dark" | "light") || "dark";
}
export function setTheme(t: "dark" | "light") {
  if (!isBrowser()) return;
  localStorage.setItem(THEME_KEY, t);
  document.documentElement.setAttribute("data-theme", t);
}
