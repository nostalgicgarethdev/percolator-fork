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
    <div className="min-h-dvh text-foreground">
      {entered ? null : (
        <Entrance
          onEnter={() => {
            try {
              sessionStorage.setItem("perc-entered", "1");
            } catch {
              /* still open */
            }
            document.documentElement.dataset.entered = "1";
            setEntered(true);
          }}
        />
      )}
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
          <span className="hidden rounded-full bg-white/8 px-3 py-1.5 text-[12px] text-muted-foreground sm:inline">
            Read-only
          </span>
        </div>
      </header>
      <div id="content">{children}</div>
    </div>
  );
}

function Entrance({ onEnter }: { onEnter: () => void }) {
  return (
    <div
      className="enter-screen fixed inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label="PERC"
    >
      <div className="glass w-full max-w-md rounded-[32px] px-8 py-10 text-center">
        <svg viewBox="0 0 32 32" className="mx-auto size-20 text-foreground" aria-hidden="true" fill="none">
          <circle cx="16" cy="16" r="12.1" stroke="currentColor" strokeWidth="1.35" />
          <circle cx="16" cy="16" r="10.15" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.75" />
          <path className="enter-score" d="M5.6 16H26.4" stroke="var(--primary)" strokeWidth="1.7" />
        </svg>
        <p className="mt-6 text-6xl font-semibold tracking-[-0.06em]">PERC</p>
        <p className="mt-3 text-[16px] text-muted-foreground">A read-only perpetuals desk.</p>
        <button
          type="button"
          autoFocus
          onClick={onEnter}
          className="glass-pill glass-solid mt-8 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Enter
        </button>
      </div>
    </div>
  );
}
