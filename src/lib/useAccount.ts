"use client";
// React hook that subscribes to the shared account store and re-renders on change.
import { useEffect, useState, useCallback } from "react";
import type { Account } from "./types";
import { loadAccount, ensureAccount } from "./account";

export function useAccount() {
  const [account, setAccount] = useState<Account>(() => loadAccount());

  const refresh = useCallback(() => setAccount(loadAccount()), []);

  useEffect(() => {
    ensureAccount();
    refresh();
    const onChange = () => refresh();
    window.addEventListener("kriyava:account", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("kriyava:account", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [refresh]);

  return { account, refresh };
}
