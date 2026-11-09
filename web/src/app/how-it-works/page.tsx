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
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-3xl">
        <p className="text-[13px] text-muted-foreground">How it works</p>
        <h1 className="mt-3 text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.95] font-semibold tracking-[-0.05em]">
          The website is the only piece that is on.
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">
          PERC is the pages you are reading and the terminal. Under that sits Percolator, a risk
          engine that allows or rejects a position. A Solana program would put that engine on a
          chain. A matcher would agree a trade. A keeper would move the market forward. Those three
          are not running.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          On a local machine the engine has been stepped through deposit, open, funding,
          settlement, close, withdraw, a few rejections, and one liquidation. Sixteen steps, on
          example numbers. That is not a public market.
        </p>
      </header>
      <section className="mt-10" aria-labelledby="session-title">
        <h2 id="session-title" className="text-[18px] font-medium tracking-[-0.03em]">
          What a local session does
        </h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          On your own machine those four steps can run against example numbers. On this host they
          do not start.
        </p>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SESSION.map((step, index) => (
            <li key={step.name} className="glass rounded-[28px] px-5 py-5">
              <p className="font-mono text-[12px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-3 text-[16px] font-medium tracking-[-0.03em]">{step.name}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="glass mt-4 rounded-[28px] px-6 py-6">
        <h2 className="text-[18px] font-medium tracking-[-0.03em]">Run the example yourself</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          The public site will not attach an engine for you. From the published source:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/30 px-4 py-3 font-mono text-[13px] leading-relaxed text-foreground">
          <code>{`scripts/local-engine.sh\ncd web && npm install && npm run dev`}</code>
        </pre>
        <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-muted-foreground">
          The engine listens on 127.0.0.1:43124. The site listens on 127.0.0.1:43123. Open
          /terminal there and the ticket turns on. The atoms are still examples. Nothing is sent
          to a chain.
        </p>
      </section>
      <h2 className="mt-12 text-[18px] font-medium tracking-[-0.03em]">The pieces</h2>
      <ol className="mt-4 grid gap-4">
        {PIECES.map((piece, index) => (
          <li key={piece.name} className="glass grid gap-3 rounded-[28px] px-6 py-5 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
            <p className="font-mono text-[13px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</p>
            <div>
              <h3 className="text-[18px] font-medium tracking-[-0.03em]">{piece.name}</h3>
              <p className="mt-1 text-[15px]">{piece.plain}</p>
              <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-muted-foreground">{piece.detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <section className="glass mt-4 rounded-[28px] px-6 py-6">
        <h2 className="text-[18px] font-medium tracking-[-0.03em]">The name</h2>
        <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          Two coffees and a beer at four in the morning is how Anatoly Yakovenko has described the
          idea behind Solana. It is not the origin of Percolator. The domain is a nod to that
          sentence. It is not an endorsement of this desk.
        </p>
        <p className="mt-6">
          <Link href="/terminal" className="glass-pill glass-solid text-[14px] font-medium">
            Open terminal
          </Link>
        </p>
      </section>
    </main>
  );
}
