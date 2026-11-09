"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[oklch(0.12_0.02_255/0.78)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-5 px-4 sm:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Mark className="size-5 text-foreground" />
            <span className="text-[15px] font-medium tracking-[-0.04em]">PERC</span>
          </Link>
          <nav aria-label="Sections" className="flex min-w-0 flex-1 gap-4 overflow-x-auto">
            {TABS.map((tab) => {
              const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 border-b py-1 text-[13px] whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                    active
                      ? "border-[#b7d4e6] text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
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
            className="shrink-0 font-mono text-[12px] text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <span className="sm:hidden">X</span>
            <span className="hidden sm:inline">@percolatorv2</span>
          </a>
          <span className="hidden font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase sm:inline">
            Read-only
          </span>
        </div>
      </header>
      <div id="content">{children}</div>
    </div>
  );
}
