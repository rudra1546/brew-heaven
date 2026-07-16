import type { ReactNode } from "react";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function LegalPage({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 text-walnut-950 flex flex-col">
      <SiteNav />
      <main className="max-w-3xl mx-auto px-6 py-20 flex-1">
        <p className="text-xs uppercase tracking-[0.3em] text-brass-600 mb-4">{eyebrow}</p>
        <h1 className="font-serif text-5xl md:text-6xl mb-10">{title}</h1>
        <div className="prose-legal space-y-6 text-walnut-950/75 leading-relaxed">{children}</div>
        <p className="mt-16 text-xs text-walnut-950/40">Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</p>
      </main>
      <SiteFooter />
      <WhatsAppButton />
    </div>
  );
}

export function LegalH2({ children }: { children: ReactNode }) {
  return <h2 className="font-serif text-2xl text-walnut-950 mt-10 mb-3">{children}</h2>;
}
