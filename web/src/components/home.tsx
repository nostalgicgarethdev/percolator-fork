import Link from "next/link";

const IDEA = [
  {
    title: "One market lives in one account",
    body: "A market is a single slab account that can hold many assets. A trade reads that trader's portfolio. It does not walk every account in the market, so the cost stays bounded as the asset list grows.",
  },
  {
    title: "Deposits come before profit",
    body: "A deposit is senior capital. Profit is junior. The engine lets that profit be used only when the same asset domain can show backing or insurance for it. The book is shaped so it does not pay out more than it holds.",
  },
  {
    title: "A new asset can be opened for a fee",
    body: "Inside a market, anyone can add an asset when the creation fee is above zero, and that fee funds the base asset's insurance. A fee of zero means only the market authority can add one. Each asset keeps its own insurance and its own backing.",
  },
  {
    title: "The engine decides. It does not hold the money.",
    body: "The library allows or rejects the state change. A wrapper would move tokens, check an oracle, and call a matcher. The program treats that matcher as untrusted, apart from the rules a liquidity provider chose, and it still checks the result. He published both under Apache-2.0, with a Kani proof suite on the engine. The proofs are bounded. They do not clear a live market.",
  },
];

const BUILT = [
  {
    title: "A desk you can read",
    body: "Overview, how it works, sources, and a terminal. On this host the terminal stays blank. There is no price, no deposit, and no trade.",
  },
  {
    title: "His engine, run locally",
    body: "A session on your own machine calls the unmodified v16 engine in memory. We stepped deposit, open, funding, settlement, close, withdraw, rejected calls, and one liquidation. Sixteen steps, on example numbers. Nothing is sent to a chain.",
  },
  {
    title: "The chain program is pinned, not deployed",
    body: "The Solana wrapper is his Apache-2.0 code, pointed at that local engine. It is not deployed. This site has no program address and no token address.",
  },
  {
    title: "What is still off",
    body: "No oracle, no matcher, and no keeper. The public site will not attach the engine for you. The same steps can be run from the published source, on 127.0.0.1, still with example numbers.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Read the desk",
    body: "This site is the interface. You can look through it with no wallet and no deposit.",
  },
  {
    n: "02",
    title: "Open the terminal",
    body: "The sheet stays blank here. No engine is attached on this host, so nothing pretends to be a price.",
  },
  {
    n: "03",
    title: "Run it yourself",
    body: "On your computer the same terminal can talk to a local engine. That engine uses example numbers in memory.",
  },
];

export function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
        <div>
          <p className="text-[15px] text-muted-foreground">Independent perpetuals desk</p>
          <h1 className="mt-3 text-[clamp(4.6rem,12vw,8.4rem)] leading-[0.84] font-semibold tracking-[-0.065em]">
            PERC
          </h1>
          <p className="mt-6 max-w-xl text-[clamp(1.45rem,2.6vw,2.15rem)] leading-[1.12] tracking-[-0.045em]">
            See how a perp desk is put together. Nothing here takes a deposit.
          </p>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
            A perp is a contract for a long or a short on a price, with no expiry. PERC shows that
            desk. The public host does not attach an engine, place trades, or hold funds.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/terminal" className="glass-pill glass-solid font-medium">
              Open terminal
            </Link>
            <Link href="/how-it-works" className="glass-pill font-medium">
              How it works
            </Link>
            <a
              href="https://x.com/percolatorv2"
              target="_blank"
              rel="noreferrer"
              className="glass-pill font-medium"
            >
              @percolatorv2
            </a>
          </div>
        </div>
        <div className="glass hidden aspect-square place-items-center rounded-[36px] lg:grid" aria-hidden="true">
          <svg viewBox="0 0 200 200" className="w-44 text-foreground">
            <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.75" />
            <path d="M28 100H172" stroke="white" strokeWidth="1.8" />
          </svg>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="idea-title">
        <p className="text-[13px] text-muted-foreground">From the published design</p>
        <h2 id="idea-title" className="mt-3 max-w-3xl text-[clamp(2rem,4vw,3.2rem)] leading-[0.95] font-semibold tracking-[-0.05em]">
          What Percolator is
        </h2>
        <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-muted-foreground">
          Anatoly Yakovenko published Percolator as research: a risk engine for perpetual futures,
          and a Solana program that would host it. His own notes call the work educational,
          unaudited, and not for real funds. The notes below are a reading of those repositories.
          They are not a product announcement from him, and this desk is not endorsed by him.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {IDEA.map((item) => (
            <article key={item.title} className="glass rounded-[28px] px-6 py-6">
              <h3 className="text-[18px] font-medium tracking-[-0.03em]">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-4" aria-labelledby="built-title">
        <p className="text-[13px] text-muted-foreground">This desk</p>
        <h2 id="built-title" className="mt-3 max-w-3xl text-[clamp(2rem,4vw,3.2rem)] leading-[0.95] font-semibold tracking-[-0.05em]">
          What is built
        </h2>
        <p className="mt-4 max-w-3xl text-[17px] leading-relaxed text-muted-foreground">
          PERC is an independent interface on top of that pinned code. The website and the local
          session are ours. The engine is his, unmodified.
        </p>
        <ol className="mt-6 grid gap-4">
          {BUILT.map((item, index) => (
            <li key={item.title} className="glass grid gap-3 rounded-[28px] px-6 py-5 sm:grid-cols-[4.5rem_minmax(0,1fr)]">
              <p className="font-mono text-[13px] text-muted-foreground">{String(index + 1).padStart(2, "0")}</p>
              <div>
                <h3 className="text-[18px] font-medium tracking-[-0.03em]">{item.title}</h3>
                <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <ol className="mt-12 grid gap-4 md:grid-cols-3">
        {STEPS.map((step) => (
          <li key={step.n} className="glass rounded-[28px] px-6 py-6">
            <p className="font-mono text-[12px] text-muted-foreground">{step.n}</p>
            <h2 className="mt-3 text-[20px] font-medium tracking-[-0.03em]">{step.title}</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <article className="glass rounded-[28px] px-6 py-6">
          <h2 className="text-[18px] font-medium tracking-[-0.03em]">What the desk does</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            One side is long. The other is short. Funding nudges the contract toward a reference
            price. A risk engine decides whether the position is allowed. A matcher would agree the
            trade. A keeper would move the market forward. On this site you can see those pieces.
            Only the website is running.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            The engine and the Solana wrapper are upstream Apache-2.0 code. They are educational
            and unaudited. PERC is not an official Percolator product.
          </p>
        </article>
        <article className="glass rounded-[28px] px-6 py-6">
          <h2 className="text-[18px] font-medium tracking-[-0.03em]">On this host</h2>
          <ul className="mt-4 space-y-3 text-[15px] leading-relaxed">
            <li className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground" aria-hidden />
              <span>Pages you can read, including a blank terminal.</span>
            </li>
            <li className="flex gap-3 text-muted-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-white/30" aria-hidden />
              <span>No public trading.</span>
            </li>
            <li className="flex gap-3 text-muted-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-white/30" aria-hidden />
              <span>No deposits.</span>
            </li>
            <li className="flex gap-3 text-muted-foreground">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-white/30" aria-hidden />
              <span>No live chain, price feed, or keeper.</span>
            </li>
          </ul>
        </article>
      </section>
    </main>
  );
}
