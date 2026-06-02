// ============================================================
// KRIYAVA — API client (talks to the NestJS backend)
// Base URL from NEXT_PUBLIC_API_URL; falls back to localhost in dev.
// Token stored in localStorage; auto-attached to requests.
// ============================================================
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:4000";

const TOKEN_KEY = "kriyava_token";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  if (isBrowser()) localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  if (isBrowser()) localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = data?.message || data?.error || `Request failed (${res.status})`;
    throw new ApiError(Array.isArray(msg) ? msg.join(", ") : msg, res.status);
  }
  return data as T;
}

// ---- typed API surface ----
export interface ApiUser {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  balance: number;
  spent: number;
  apiKey: string;
}
export interface ApiOrder {
  id: string;
  serviceId: string;
  service: string;
  platform?: string | null;
  link: string;
  qty: number;
  charge: number;
  status: string;
  provider: string;
  at: string;
}
export interface ApiTxn {
  id: string;
  type: string;
  amount: number;
  method: string;
  note?: string | null;
  at: string;
}

export const api = {
  base: API_BASE,
  health: () => request<{ status: string; services: number }>("/health", { auth: false }),

  register: (email: string, name: string, password: string) =>
    request<{ token: string; user: ApiUser }>("/auth/register", {
      method: "POST",
      body: { email, name, password },
      auth: false,
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>("/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    }),
  me: () => request<ApiUser>("/auth/me"),

  balance: () => request<{ balance: number; spent: number }>("/wallet/balance"),
  addFunds: (amount: number) =>
    request<{ added: number; cashback: number; balance: number }>("/wallet/add-funds", {
      method: "POST",
      body: { amount },
    }),
  transactions: () => request<ApiTxn[]>("/wallet/transactions"),

  orders: () => request<ApiOrder[]>("/orders"),
  createOrder: (serviceId: string, quantity: number, link: string) =>
    request<ApiOrder>("/orders", { method: "POST", body: { serviceId, quantity, link } }),
  refillOrder: (id: string) => request<{ ok: boolean }>(`/orders/${id}/refill`, { method: "POST" }),
  cancelOrder: (id: string) =>
    request<{ ok: boolean; refunded: number }>(`/orders/${id}/cancel`, { method: "POST" }),

  tickets: () => request<unknown[]>("/tickets"),
  createTicket: (subject: string, category: string, message: string) =>
    request<unknown>("/tickets", { method: "POST", body: { subject, category, message } }),
};
