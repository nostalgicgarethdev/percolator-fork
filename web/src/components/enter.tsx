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
      <div className="enter-hold">{children}</div>
      {open ? (
        <div
          className="enter-screen fixed inset-0 z-50 bg-[#07060b] p-3 sm:p-4"
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
            <p className="pt-6 font-mono text-[12px] tracking-[0.22em] text-white/45">PERC</p>
            <div className="flex flex-1 flex-col justify-end pb-[max(2.5rem,env(safe-area-inset-bottom))]">
              <div className="w-full max-w-xl">
                <h1
                  id="perc-enter-title"
                  className="font-serif text-[clamp(3.2rem,8vw,5.2rem)] leading-[0.9] tracking-[-0.045em] text-white"
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
        </div>
      ) : null}
    </>
  );
}
