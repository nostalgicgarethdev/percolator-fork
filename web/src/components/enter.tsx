"use client";

import { useEffect, useRef, useState } from "react";

export function Enter({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (document.documentElement.dataset.entered === "1") setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    if (document.documentElement.dataset.entered === "1") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    buttonRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function go() {
    try {
      sessionStorage.setItem("perc-entered", "1");
    } catch {
      /* private mode */
    }
    document.documentElement.dataset.entered = "1";
    setOpen(false);
  }

  return (
    <>
      <div inert={open ? true : undefined}>{children}</div>
      {open ? (
        <div
          className="enter-screen fixed inset-0 z-50 flex items-center justify-center px-6 touch-none"
          role="dialog"
          aria-modal="true"
          aria-labelledby="perc-enter-title"
        >
          <div className="w-full max-w-md text-center">
            <svg viewBox="0 0 64 64" className="mx-auto size-16" aria-hidden="true">
              <defs>
                <linearGradient id="enter-sol" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#9945FF" />
                  <stop offset="1" stopColor="#14F195" />
                </linearGradient>
              </defs>
              <circle className="enter-ring" cx="32" cy="32" r="22" fill="none" stroke="url(#enter-sol)" strokeWidth="1.4" />
              <circle cx="32" cy="32" r="16" fill="none" stroke="white" strokeOpacity="0.25" strokeWidth="0.6" />
              <path d="M22 32H42" stroke="#14F195" strokeWidth="2" />
            </svg>
            <h1 id="perc-enter-title" className="enter-line mt-8 font-serif text-[clamp(4.5rem,14vw,6.5rem)] leading-none tracking-[-0.05em]">
              PERC
            </h1>
            <p className="enter-line mx-auto mt-6 max-w-sm text-[16px] leading-relaxed text-foreground/70" style={{ animationDelay: "0.4s" }}>
              An independent desk, not the official Percolator. Drag one mark. Four assets answer. Green is paid. Purple is the cut. Nothing here takes a deposit.
            </p>
            <button
              ref={buttonRef}
              type="button"
              onClick={go}
              className="enter-line mt-10 font-serif text-[2rem] leading-none text-[#14F195] italic underline decoration-[#14F195]/30 underline-offset-8 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
              style={{ animationDelay: "0.7s" }}
            >
              Open
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
