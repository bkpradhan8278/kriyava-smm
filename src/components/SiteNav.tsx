"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/services", label: "Services" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/login?redirect=/api-docs", label: "API" },
  { href: "/blog", label: "Blog" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="sticky top-0 z-60">
      <div className="container-x">
        <nav
          aria-label="Primary"
          className="flex h-[72px] items-center justify-between transition-[border-color,box-shadow] duration-300"
          style={{
            background: scrolled ? "rgba(255, 255, 255, 0.72)" : "transparent",
            backdropFilter: "saturate(180%) blur(16px)",
            WebkitBackdropFilter: "saturate(180%) blur(16px)",
            borderBottom: scrolled ? "1px solid var(--color-line)" : "1px solid transparent",
            boxShadow: scrolled ? "var(--shadow-sm-soft)" : "none",
          }}
        >
          <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Kriyava SMM home">
            <span className="h-8.5 w-8.5 overflow-hidden rounded-[10px] shrink-0" style={{ boxShadow: "var(--shadow-glow)" }}>
              <Image src="/assets/logo-128.png" alt="" width={34} height={34} />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-[18px] font-extrabold tracking-tight leading-none text-[color:var(--color-ink)]">
                Kriyava
              </span>
              <small className="text-[9px] font-semibold tracking-[0.14em] text-slate-500 uppercase mt-[1px]">
                SMM Panel
              </small>
            </div>
          </Link>

          <div className="hidden items-center gap-4 xl:gap-6 lg:flex mx-4 overflow-hidden">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-[13.5px] font-bold text-[#475569] transition-colors hover:text-[color:var(--color-ink)] whitespace-nowrap">
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="btn btn-cta !px-[18px] !py-[9px] !text-[13px] inline-flex rounded-xl shadow-[0_8px_20px_rgba(245,158,11,0.25)] border border-amber-500/10 hover:border-amber-400/30"
            >
              Login
            </Link>
            <button
              className="grid h-[38px] w-[38px] place-items-center rounded-[10px] border border-[color:var(--color-line)] bg-white text-[color:var(--color-ink)] lg:hidden cursor-pointer hover:bg-[color:var(--color-surface)] transition-colors"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile menu overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile menu panel */}
      <div
        className={`absolute inset-x-0 z-55 border-b border-[color:var(--color-line)] bg-white/95 backdrop-blur-md shadow-2xl lg:hidden transition-all duration-300 ${
          open ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="p-6 space-y-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-[10px] px-3 py-3.5 font-semibold text-slate-700 hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-ink)] transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <div className="pt-3">
            <Link href="/login" onClick={() => setOpen(false)} className="btn btn-cta btn-block">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
