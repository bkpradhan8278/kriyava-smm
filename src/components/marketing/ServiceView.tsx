import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, AlertTriangle } from "lucide-react";
import { SERVICE_PAGES, SITE, serviceBySlug, type ServicePage } from "@/lib/marketing-data";

/**
 * Renderer for the platform service pages.
 *
 * The caveat block is not a disclaimer bolted on the end — it sits above the
 * FAQ, in the reader's path, because it is the part that decides whether they
 * order the right thing. A reseller who understands what drops and why comes
 * back; one who was told it was risk-free does not.
 */

export function serviceMetadata(slug: string): Metadata {
  const p = serviceBySlug(slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.description,
    alternates: { canonical: `/${p.slug}` },
    openGraph: {
      title: p.title,
      description: p.description,
      url: `${SITE.url}/${p.slug}`,
      siteName: "Kriyava SMM",
      type: "article",
    },
  };
}

export function ServiceView({ slug }: { slug: string }) {
  const p = serviceBySlug(slug) as ServicePage;
  const others = SERVICE_PAGES.filter((s) => s.slug !== p.slug);

  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Kriyava SMM", item: SITE.url },
        { "@type": "ListItem", position: 2, name: p.navLabel, item: `${SITE.url}/${p.slug}` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faqs.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ];

  return (
    <div className="min-h-screen">
      {ld.map((d, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />
      ))}

      <div className="mx-auto max-w-3xl px-5 py-12">
        <nav aria-label="Breadcrumb" className="text-[12px] opacity-60">
          <Link href="/" className="hover:underline">Kriyava SMM</Link> / <span>{p.navLabel}</span>
        </nav>

        <p className="mt-8 text-[12px] font-semibold uppercase tracking-[0.18em] opacity-70">{p.platform}</p>
        <h1 className="mt-3 text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl">{p.h1}</h1>
        <p className="mt-5 text-base leading-relaxed opacity-70">{p.lede}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/services" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90">
            Browse services <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 rounded-xl border border-current/20 px-5 py-3 text-sm opacity-80 transition-opacity hover:opacity-100">
            Sign in to order
          </Link>
        </div>

        <section className="mt-12 border-t border-current/10 pt-10">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">What you get</h2>
          <ul className="mt-5 space-y-2.5">
            {p.what.map((w) => (
              <li key={w} className="flex items-start gap-2.5 text-[14px] opacity-80">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Above the FAQ deliberately. This is the part that decides whether
            the customer orders the right service, so it goes where it will be
            read rather than in small print at the bottom. */}
        <section className="mt-10 border-t border-current/10 pt-10">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-[15px] font-semibold">Read this before ordering</p>
                <p className="mt-2 text-[14px] leading-relaxed opacity-80">{p.caveat}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 border-t border-current/10 pt-10">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Common questions</h2>
          <dl className="mt-5 space-y-5">
            {p.faqs.map(([q, a]) => (
              <div key={q}>
                <dt className="text-[15px] font-medium">{q}</dt>
                <dd className="mt-1.5 text-[14px] leading-relaxed opacity-70">{a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="mt-10 border-t border-current/10 pt-10">
          <h2 className="text-xl font-semibold tracking-tight">Other services</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {others.map((o) => (
              <Link key={o.slug} href={`/${o.slug}`} className="rounded-xl border border-current/10 p-4 transition-colors hover:border-current/30">
                <p className="text-sm font-medium">{o.navLabel}</p>
                <p className="mt-1 text-xs leading-relaxed opacity-60">{o.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
