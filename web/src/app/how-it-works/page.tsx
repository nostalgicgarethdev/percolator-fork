import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How it works — PERC",
  description:
    "How the PERC website, the Percolator risk engine, the Solana wrapper, a matcher, and a keeper fit together.",
};

const SESSION = [
  {
    name: "Deposit",
    body: "Example atoms are credited to a trader account. They exist only in that process.",
  },
  {
    name: "Open",
    body: "A long or a short is sized in lots. The other side is an example account, not a public book.",
  },
  {
    name: "Funding",
    body: "A crank nudges the contract toward a reference price, inside a cap the engine enforces.",
  },
  {
    name: "Close",
    body: "The position settles. The example atoms can then be withdrawn from that same local account.",
  },
];

const PIECES = [
  {
    name: "Website",
    plain: "What you are reading, and the terminal.",
    detail:
      "It draws the desk and sends calls only to an engine on the same machine. On this host that call fails, and the page stays read-only.",
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
      "The wrapper source describes a matcher. PERC does not run one, and the terminal counterparty is only an example account inside a local process.",
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
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-[12px] tracking-[0.18em] text-white/40 uppercase">How it works</p>
        <h1 className="mt-4 font-serif text-[clamp(2.8rem,6vw,5rem)] leading-[0.92] tracking-[-0.045em]">
          The website is the only piece that is on.
        </h1>
        <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/70">
          PERC is the pages you are reading and the terminal. Under that sits Percolator, a risk
          engine that allows or rejects a position. A Solana program would put that engine on a
          chain. A matcher would agree a trade. A keeper would move the market forward. Those three
          are not running.
        </p>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-white/50">
          On a local machine the engine has been stepped through deposit, open, funding,
          settlement, close, withdraw, a few rejections, and one liquidation. Sixteen steps, on
          example numbers. That is not a public market.
        </p>
      </header>

      <section className="mt-16" aria-labelledby="session-title">
        <h2 id="session-title" className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em]">
          What a local session does
        </h2>
        <p className="mt-4 max-w-xl text-[16px] leading-relaxed text-white/55">
          On your own machine those four steps can run against example numbers. On this host they
          do not start.
        </p>
        <ol className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {SESSION.map((step, index) => (
            <li key={step.name} className="grid gap-3 py-8 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:items-baseline sm:gap-8">
              <p className="font-mono text-[12px] text-white/35">{String(index + 1).padStart(2, "0")}</p>
              <div>
                <h3 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] leading-none tracking-[-0.04em]">
                  {step.name}
                </h3>
                <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-white/60">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 max-w-3xl" aria-labelledby="run-title">
        <h2 id="run-title" className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em]">
          Run the example yourself.
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-white/60">
          The public site will not attach an engine for you. From the published source:
        </p>
        <pre className="mt-6 overflow-x-auto border border-white/15 bg-white/[0.03] px-5 py-4 font-mono text-[13px] leading-relaxed text-foreground">
          <code>{`scripts/local-engine.sh\ncd web && npm install && npm run dev`}</code>
        </pre>
        <p className="mt-4 text-[15px] leading-relaxed text-white/50">
          The engine listens on 127.0.0.1:43124. The site listens on 127.0.0.1:43123. Open
          /terminal there and the ticket turns on. The atoms are still examples. Nothing is sent
          to a chain.
        </p>
      </section>

      <section className="mt-16" aria-labelledby="pieces-title">
        <h2 id="pieces-title" className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em]">
          The pieces
        </h2>
        <ol className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {PIECES.map((piece, index) => (
            <li key={piece.name} className="grid gap-3 py-8 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-8">
              <p className="font-mono text-[12px] text-white/35">{String(index + 1).padStart(2, "0")}</p>
              <div>
                <h3 className="font-serif text-[clamp(1.8rem,3vw,2.6rem)] leading-none tracking-[-0.04em]">
                  {piece.name}
                </h3>
                <p className="mt-3 text-[16px]">{piece.plain}</p>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/55">{piece.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 max-w-2xl border-t border-white/10 pt-12" aria-labelledby="name-title">
        <h2 id="name-title" className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em]">
          The name
        </h2>
        <p className="mt-5 text-[16px] leading-relaxed text-white/60">
          Two coffees and a beer at four in the morning is how Anatoly Yakovenko has described the
          idea behind Solana. It is not the origin of Percolator. The domain is a nod to that
          sentence. It is not an endorsement of this desk.
        </p>
        <p className="mt-8">
          <Link
            href="/terminal"
            className="text-[16px] text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
          >
            Open the terminal
          </Link>
        </p>
      </section>
    </main>
  );
}
