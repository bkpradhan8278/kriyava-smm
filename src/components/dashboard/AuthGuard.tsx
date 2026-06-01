"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadAccount } from "@/lib/account";
import { RefreshCw } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "redirect">("loading");

  useEffect(() => {
    const account = loadAccount();
    if (account.email) {
      setStatus("ok");
    } else {
      setStatus("redirect");
      router.replace("/login");
    }
  }, [router]);

  if (status === "loading" || status === "redirect") {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-blue-500" size={32} />
          <span className="text-xs font-bold text-slate-400">
            Verifying authentication…
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
