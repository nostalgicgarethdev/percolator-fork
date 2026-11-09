"use client";

import { useRef, useState } from "react";
import { PERC_TOKEN_CA, PERC_TOKEN_PUMP, PERC_TOKEN_SOLSCAN } from "@/lib/token";

export function TokenCa() {
  const addressRef = useRef<HTMLParagraphElement>(null);
  const [message, setMessage] = useState("");

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(PERC_TOKEN_CA);
      setMessage("Copied the full address.");
    } catch {
      const node = addressRef.current;
      const selection = window.getSelection();
      if (node && selection) {
        const range = document.createRange();
        range.selectNodeContents(node);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setMessage("Clipboard was blocked. The full address is selected.");
    }
  }

  return (
    <section className="border-b border-border px-4 py-6 sm:px-8" aria-labelledby="perc-token-heading">
      <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">Token</p>
      <h2 id="perc-token-heading" className="mt-2 text-[15px] font-medium text-primary">
        PERC token CA
      </h2>
      <p className="mt-3 max-w-[44rem] text-[15px] leading-relaxed text-muted-foreground">
        This is the mint address designated for this desk. On Solana it is an initialized Token-2022
        mint named Percolator v2, symbol Percolator, with 6 decimals. The on-chain symbol is not PERC.
        Mint, freeze, and metadata update authorities were empty when this page was written. It is not
        the Percolator trading program, not a treasury, and not a deposit address. It does not turn on
        trading or deposits here, and it is not an endorsement by Anatoly Yakovenko.
      </p>
      <p
        ref={addressRef}
        className="mt-4 max-w-full font-mono text-[13px] leading-relaxed break-all text-foreground"
      >
        {PERC_TOKEN_CA}
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={copyAddress}
          className="inline-flex h-11 items-center justify-center border border-primary/50 px-4 text-[12px] tracking-[0.14em] text-foreground uppercase focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Copy full address
        </button>
        <a
          href={PERC_TOKEN_SOLSCAN}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center text-[13px] text-primary underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          Solscan token
        </a>
        <a
          href={PERC_TOKEN_PUMP}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center text-[13px] text-primary underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          pump.fun token
        </a>
      </div>
      <p className="mt-3 min-h-5 text-[13px] text-foreground" role="status" aria-live="polite">
        {message}
      </p>
      <p className="max-w-[44rem] text-[13px] leading-relaxed text-muted-foreground">
        The create transaction was signed by{" "}
        <span className="font-mono text-[12px] break-all text-foreground">
          CUNTsD6SU82A66jjfUgKQTvJx47SFDEGcaoJPChity7F
        </span>
        . Solscan and pump.fun label that account as the creator. This site does not claim to hold
        those keys.
      </p>
    </section>
  );
}
