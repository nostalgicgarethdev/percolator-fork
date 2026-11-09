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
    <section className="glass mt-12 rounded-[32px] px-6 py-7 sm:px-8" aria-labelledby="perc-token-heading">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">Token mint</p>
        <h2 id="perc-token-heading" className="text-[13px] text-muted-foreground">
          Not a deposit address
        </h2>
      </div>
      <p
        ref={addressRef}
        className="mt-4 font-mono text-[clamp(1.05rem,2.4vw,1.7rem)] leading-snug tracking-[-0.04em] break-all"
      >
        {PERC_TOKEN_CA}
      </p>
      <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
        Designated mint for this desk. On Solana it is an initialized Token-2022 mint named
        Percolator v2, symbol Percolator, with 6 decimals. The on-chain symbol is not PERC. Mint,
        freeze, and metadata update authorities were empty when this page was written. It is not
        the Percolator trading program, not a treasury, and not a deposit address.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" onClick={copyAddress} className="glass-pill glass-solid text-[14px] font-medium">
          Copy address
        </button>
        <a href={PERC_TOKEN_SOLSCAN} target="_blank" rel="noreferrer" className="glass-pill text-[14px]">
          Solscan
        </a>
        <a href={PERC_TOKEN_PUMP} target="_blank" rel="noreferrer" className="glass-pill text-[14px]">
          pump.fun
        </a>
      </div>
      <p className="mt-4 min-h-5 text-[13px]" role="status" aria-live="polite">
        {message}
      </p>
      <p className="max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
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
