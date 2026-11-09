"use client";

import { useState } from "react";

const MINT = "Fwagv9buEaaMr9mUZcB6Hit8K9JpWyiS8Q1DYGr5pump";
const COIN = `https://pump.fun/coin/${MINT}`;

export function Ca() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(MINT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="border-b border-white/10">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3 sm:px-6">
        <span className="text-[11px] tracking-[0.16em] text-muted-foreground uppercase">CA</span>
        <code className="min-w-0 font-mono text-[13px] break-all text-foreground">{MINT}</code>
        <button
          type="button"
          onClick={copy}
          className="text-[13px] text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <a
          href={COIN}
          target="_blank"
          rel="noreferrer"
          className="text-[13px] text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
        >
          pump.fun
        </a>
      </div>
    </div>
  );
}
