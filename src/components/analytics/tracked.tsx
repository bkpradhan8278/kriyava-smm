"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { track, type KriyavaEvent } from "@/lib/analytics";

/**
 * Thin wrappers that fire a semantic analytics event when something is clicked
 * or seen. Deliberately dumb: they push an event and get out of the way, so
 * wrapping an existing CTA changes nothing about how it behaves.
 */

type TrackedProps = {
  event: KriyavaEvent;
  params?: Record<string, unknown>;
  children: ReactNode;
  className?: string;
};

export function TrackedLink({
  event,
  params,
  href,
  children,
  className,
  ...rest
}: TrackedProps & { href: string } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "href" | "onClick"
  >) {
  return (
    <Link href={href} className={className} onClick={() => track(event, params)} {...rest}>
      {children}
    </Link>
  );
}

export function TrackedAnchor({
  event,
  params,
  children,
  className,
  ...rest
}: TrackedProps & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={className} onClick={() => track(event, params)} {...rest}>
      {children}
    </a>
  );
}

/**
 * Fires once on mount. The ref guard matters in development: StrictMode mounts
 * twice, which would silently double every view number.
 */
export function TrackView({
  event,
  params,
}: {
  event: KriyavaEvent;
  params?: Record<string, unknown>;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
