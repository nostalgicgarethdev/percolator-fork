"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { Mark } from "@/components/mark";

const TABS = [
  { href: "/", label: "Overview" },
  { href: "/terminal", label: "Terminal" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/sources", label: "Sources" },
] as const;

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [entered, setEntered] = useState(false);

  useLayoutEffect(() => {
    const finish = () => {
      try {
        sessionStorage.setItem("perc-entered", "1");
      } catch {
        /* the page still opens */
      }
      document.documentElement.dataset.entered = "1";
      setEntered(true);
    };
    try {
      if (document.documentElement.dataset.entered === "1") {
        setEntered(true);
        return;
      }
    } catch {
      finish();
      return;
    }
    const timer = window.setTimeout(finish, 1400);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {entered ? null : <Entrance onEnter={() => {
        try {
          sessionStorage.setItem("perc-entered", "1");
        } catch {
          /* still open */
        }
        document.documentElement.dataset.entered = "1";
        setEntered(true);
      }} />}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95">
        <div className="flex items-center gap-3 px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
            <Mark className="size-6 text-foreground" />
            <span className="emboss text-[14px] font-semibold tracking-[0.28em]">PERC</span>
          </Link>
        </div>
        <nav aria-label="Sections" className="flex gap-px overflow-x-auto border-t border-border bg-border">
          {TABS.map((tab) => {
            const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`min-h-11 min-w-[5.5rem] flex-1 px-3 py-2 text-center text-[11px] font-medium tracking-[0.12em] uppercase focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:text-[12px] ${
                  active ? "bg-background text-primary" : "bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className={active ? "border-b border-primary pb-0.5" : ""}>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>
      <p className="border-b border-border px-4 py-2 text-[12px] text-muted-foreground sm:px-6">
        <span className="mr-2 inline-block h-px w-4 -translate-y-0.5 bg-primary align-middle" aria-hidden />
        Read-only preview. No deposits.
      </p>
      <div id="content">{children}</div>
    </div>
  );
}

function Entrance({ onEnter }: { onEnter: () => void }) {
  return (
    <div
      className="enter-screen fixed inset-0 z-50 flex flex-col items-center justify-center bg-background px-6"
      role="dialog"
      aria-modal="true"
      aria-label="PERC"
    >
      <svg viewBox="0 0 32 32" className="size-32 text-foreground" aria-hidden="true" fill="none">
        <circle cx="16" cy="16" r="12.1" stroke="currentColor" strokeWidth="1.35" />
        <circle cx="16" cy="16" r="10.15" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.75" />
        <path className="enter-score" d="M5.6 16H26.4" stroke="var(--primary)" strokeWidth="1.7" />
      </svg>
      <p className="emboss mt-8 text-5xl font-semibold tracking-[0.28em]">PERC</p>
      <p className="mt-4 text-center text-[15px] text-muted-foreground">Read-only. No deposits.</p>
      <button
        type="button"
        autoFocus
        onClick={onEnter}
        className="mt-8 h-11 border border-primary/50 px-5 text-[12px] tracking-[0.14em] text-foreground uppercase focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        Enter
      </button>
    </div>
  );
}
