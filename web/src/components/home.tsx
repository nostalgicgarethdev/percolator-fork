import Link from "next/link";
import { TokenCa } from "@/components/token-ca";

export function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
        <div>
          <p className="text-[15px] text-muted-foreground">Independent perpetuals desk</p>
          <h1 className="mt-3 text-[clamp(4.6rem,12vw,8.4rem)] leading-[0.84] font-semibold tracking-[-0.065em]">
            PERC
          </h1>
          <p className="mt-6 max-w-xl text-[clamp(1.45rem,2.6vw,2.15rem)] leading-[1.12] tracking-[-0.045em]">
            One desk. No deposits. Built on Percolator.
          </p>
          <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
            A perp is a contract for a long or a short on a price, with no expiry. This site is
            the interface. The public host does not attach an engine, take deposits, or place trades.
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

      <TokenCa />

      <section className="mt-4 grid gap-4 md:grid-cols-2" aria-label="What is available">
        <article className="glass rounded-[28px] px-6 py-6">
          <h2 className="text-[18px] font-medium tracking-[-0.03em]">What you can do now</h2>
          <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-muted-foreground">
            <li>Read what PERC is, and what a perp is.</li>
            <li>Open the terminal and see that no market is attached.</li>
            <li>On your own computer, run the local engine behind that same terminal.</li>
          </ul>
        </article>
        <article className="glass rounded-[28px] px-6 py-6">
          <h2 className="text-[18px] font-medium tracking-[-0.03em]">Not enabled yet</h2>
          <ul className="mt-4 space-y-2 text-[15px] leading-relaxed text-muted-foreground">
            <li>Public trading.</li>
            <li>Deposits.</li>
            <li>A live chain, price feed, or keeper.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
