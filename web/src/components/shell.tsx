"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Enter } from "@/components/enter";
import { Mark } from "@/components/mark";

const TABS = [
  { href: "/", label: "Overview" },
  { href: "/terminal", label: "Terminal" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/sources", label: "Sources" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh text-foreground">
      <Enter>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-30 bg-[#07060b]/80 backdrop-blur-xl">
          <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 border-b border-white/10 px-5 sm:px-8">
            <Link
              href="/"
              className="flex shrink-0 items-center gap-2.5 focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
            >
              <Mark className="size-5 text-foreground" />
              <span className="font-serif text-[18px] leading-none tracking-[-0.03em]">PERC</span>
            </Link>
            <nav aria-label="Sections" className="flex min-w-0 flex-1 gap-5 overflow-x-auto">
              {TABS.map((tab) => {
                const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
                return (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    aria-current={active ? "page" : undefined}
                    className={`shrink-0 border-b py-1 text-[14px] whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none ${
                      active
                        ? "border-white text-foreground"
                        : "border-transparent text-white/45 hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>
            <a
              href="https://x.com/percolatorv2"
              target="_blank"
              rel="noreferrer"
              className="shrink-0 text-[13px] text-white/45 hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
            >
              <span className="sm:hidden">X</span>
              <span className="hidden sm:inline">@percolatorv2</span>
            </a>
            <span className="hidden font-mono text-[11px] tracking-[0.14em] text-white/35 uppercase sm:inline">
              Read only
            </span>
          </div>
        </header>
        <div id="content">{children}</div>
        <footer className="border-t border-white/10">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-8 sm:flex-row sm:items-baseline sm:justify-between sm:px-8">
            <p className="max-w-md text-[13px] leading-relaxed text-white/45">
              Example atoms. Independent, not the official engine. This host takes nothing.
            </p>
            <a
              href="https://x.com/percolatorv2"
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[12px] text-white/45 hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
            >
              @percolatorv2
            </a>
          </div>
        </footer>
      </Enter>
    </div>
  );
}
