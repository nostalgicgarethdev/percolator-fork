import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works — PERC",
  description:
    "How the PERC website, the Percolator risk engine, the Solana wrapper, a matcher, and a keeper fit together.",
};

const PIECES = [
  {
    name: "Website",
    plain: "What you are reading, and the terminal.",
    detail:
      "It draws the mark sheet and sends calls only to an engine on the same machine. On this host that call fails, and the page stays read-only.",
  },
  {
    name: "Risk engine",
    plain: "The library that allows or rejects a position.",
    detail:
      "Percolator v16 checks margin, funding, and liquidation. It does not hold tokens and it does not know wallets. Upstream calls the project educational and unaudited.",
  },
  {
    name: "Solana wrapper",
    plain: "The program that would put that library on a chain.",
    detail:
      "It is in the source as a pinned Apache-2.0 crate. It is not deployed. There is no program address you can trade against.",
  },
  {
    name: "Matcher",
    plain: "The piece that would agree two sides of a trade.",
    detail:
      "The wrapper's source describes a matcher. PERC does not run one, and the terminal's counterparty is only an example account inside a local process.",
  },
  {
    name: "Keeper",
    plain: "The process that would advance the market.",
    detail:
      "A keeper cranks funding and marks. Nothing here hosts one. The local engine cranks only when you ask it to, on your own machine.",
  },
];

export default function HowItWorksPage() {
  return (
    <main>
      <header className="border-b border-border px-4 py-8 sm:px-8">
        <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">How it works</p>
        <h1 className="mt-2 max-w-[40rem] text-[clamp(1.7rem,4vw,2.4rem)] leading-tight">
          The website is the only piece that is on.
        </h1>
        <p className="mt-4 max-w-[42rem] text-[16px] leading-relaxed text-muted-foreground">
          PERC is the pages you are reading and the terminal. Under that sits Percolator, a risk
          engine that allows or rejects a position. A Solana program would put that engine on a
          chain. A matcher would agree a trade. A keeper would move the market forward. Those three
          are not running.
        </p>
        <p className="mt-3 max-w-[42rem] text-[15px] leading-relaxed text-muted-foreground">
          On a local machine the engine has been stepped through deposit, open, funding,
          settlement, close, withdraw, a few rejections, and one liquidation. Sixteen steps, on
          example numbers. That is not a public market.
        </p>
      </header>
      <ol>
        {PIECES.map((piece, index) => (
          <li key={piece.name} className="grid gap-2 border-b border-border px-4 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:px-8">
            <p className="font-mono text-[12px] text-primary">{String(index + 1).padStart(2, "0")}</p>
            <div>
              <h2 className="text-[16px] font-medium">{piece.name}</h2>
              <p className="mt-1 text-[15px]">{piece.plain}</p>
              <p className="mt-2 max-w-[46rem] text-[14px] leading-relaxed text-muted-foreground">{piece.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <section className="px-4 py-8 sm:px-8">
        <h2 className="text-[10px] font-medium tracking-[0.2em] uppercase">The name, again</h2>
        <p className="mt-3 max-w-[44rem] text-[15px] leading-relaxed text-muted-foreground">
          Two coffees and a beer at four in the morning is how Anatoly Yakovenko has described the
          idea behind Solana. It is not the origin of Percolator. The domain is a nod to that
          sentence. It is not an endorsement of this desk.
        </p>
        <p className="mt-6">
          <Link href="/terminal" className="text-[13px] tracking-[0.08em] text-primary uppercase hover:underline">
            Open the terminal
          </Link>
        </p>
      </section>
    </main>
  );
}
