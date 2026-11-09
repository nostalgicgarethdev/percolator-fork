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
      <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6">
        <div className="glass mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 rounded-full px-3 py-2 sm:px-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-full px-1 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Mark className="size-6 text-foreground" />
            <span className="text-[18px] font-semibold tracking-[-0.05em]">PERC</span>
          </Link>
          <nav aria-label="Sections" className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
            {TABS.map((tab) => {
              const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-full px-3 py-2 text-[13px] font-medium whitespace-nowrap focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
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
            className="rounded-full px-3 py-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            @percolatorv2
          </a>
          <span className="hidden rounded-full bg-white/8 px-3 py-1.5 text-[12px] text-muted-foreground sm:inline">
            Read-only
          </span>
        </div>
      </header>
      <div id="content">{children}</div>
    </div>
  );
}
