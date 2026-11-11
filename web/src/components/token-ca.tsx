"use client";

import { useState } from "react";
import { PERC_TOKEN_CA, PERC_TOKEN_PUMP, PERC_TOKEN_SOLSCAN } from "@/lib/token";

export function TokenCaBar() {
  const [message, setMessage] = useState("");

  return (
    <div className="border-b border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 sm:px-8">
        <span className="font-mono text-[11px] tracking-[0.18em] text-white/40">CA</span>
        <p className="min-w-0 flex-1 font-mono text-[12px] leading-relaxed break-all text-foreground">{PERC_TOKEN_CA}</p>
        <button
          type="button"
          onClick={() => void copyCa(setMessage)}
          className="text-[13px] text-white/70 hover:text-white focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
        >
          Copy
        </button>
        <a
          href={PERC_TOKEN_PUMP}
          target="_blank"
          rel="noreferrer"
          className="text-[13px] text-white/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
        >
          pump.fun
        </a>
        <p className="sr-only" role="status" aria-live="polite">
          {message}
        </p>
      </div>
    </div>
  );
}

export function TokenCa() {
  const [message, setMessage] = useState("");

  return (
    <section className="mt-4 border-t border-white/10 px-1 pt-14" aria-labelledby="perc-token-heading">
      <h2
        id="perc-token-heading"
        className="font-serif text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[0.95] tracking-[-0.04em]"
      >
        The mint.
      </h2>
      <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/65">
        Initialized Token-2022 mint. Name Percolator, symbol Percolator, 6 decimals. Mint, freeze,
        and metadata update authorities were empty when this page was written. It is not the
        trading program, not a treasury, and not a deposit address. It does not turn trading on
        here.
      </p>
      <p className="mt-6 max-w-full font-mono text-[14px] leading-relaxed break-all text-foreground">{PERC_TOKEN_CA}</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button
          type="button"
          onClick={() => void copyCa(setMessage)}
          className="inline-flex h-11 items-center justify-center border border-white/35 px-5 text-[14px] text-white hover:bg-white hover:text-[#07060b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          Copy
        </button>
        <a
          href={PERC_TOKEN_SOLSCAN}
          target="_blank"
          rel="noreferrer"
          className="text-[14px] text-white/70 underline-offset-2 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
        >
          Solscan
        </a>
        <a
          href={PERC_TOKEN_PUMP}
          target="_blank"
          rel="noreferrer"
          className="text-[14px] text-white/70 underline-offset-2 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
        >
          pump.fun
        </a>
      </div>
      <p className="mt-3 min-h-5 text-[13px] text-white/70" role="status" aria-live="polite">
        {message}
      </p>
    </section>
  );
}

async function copyCa(setMessage: (value: string) => void) {
  try {
    await navigator.clipboard.writeText(PERC_TOKEN_CA);
    setMessage("Copied.");
  } catch {
    setMessage("Clipboard was blocked. Select the address.");
  }
}
