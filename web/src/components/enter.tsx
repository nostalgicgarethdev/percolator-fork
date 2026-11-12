"use client";

import { useEffect, useRef, useState } from "react";
import { Mark } from "@/components/mark";

export function Enter({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const [leaving, setLeaving] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (document.documentElement.dataset.entered === "1") setOpen(false);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
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

  function finish() {
    try {
      sessionStorage.setItem("perc-entered", "1");
    } catch {
      /* private mode */
    }
    document.documentElement.dataset.entered = "1";
    setOpen(false);
  }

  function go() {
    if (leaving) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      finish();
      return;
    }
    setLeaving(true);
    timer.current = window.setTimeout(finish, 460);
  }

  return (
    <>
      <div className="enter-hold">{children}</div>
      {open ? (
        <div
          className="enter-screen fixed inset-0 z-50 bg-[#07060b] p-3 sm:p-4"
          data-leaving={leaving ? "1" : undefined}
          role="dialog"
          aria-modal="true"
          aria-labelledby="perc-enter-title"
          onKeyDown={(event) => {
            if (event.key === "Tab") {
              event.preventDefault();
              buttonRef.current?.focus();
            }
          }}
        >
          <div className="flex h-full flex-col border border-white/15 px-6 sm:px-10">
            <div className="flex items-center justify-between pt-6">
              <p className="font-mono text-[12px] tracking-[0.22em] text-white/45">PERC</p>
              <p className="font-mono text-[12px] tracking-[0.08em] text-white/35">percolator.beer</p>
            </div>
            <div className="relative flex flex-1 items-center justify-center">
              <div
                aria-hidden
                className="absolute size-[22rem] rounded-full bg-[radial-gradient(circle,oklch(0.55_0.04_210/18%),transparent_68%)] sm:size-[28rem]"
              />
              <Mark className="enter-mark relative size-32 text-white sm:size-44" />
            </div>
            <div className="pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <h1
                id="perc-enter-title"
                className="font-serif text-[clamp(3.4rem,7vw,6.2rem)] leading-[0.9] tracking-[-0.045em] text-white"
              >
                One market is one slab.
              </h1>
              <button
                ref={buttonRef}
                type="button"
                onClick={go}
                className="mt-8 flex h-14 w-full cursor-pointer items-center justify-center border border-white/40 bg-transparent text-[16px] text-white touch-manipulation hover:bg-white hover:text-[#07060b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:bg-white active:text-[#07060b]"
              >
                Open
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
