import Link from "next/link";

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
