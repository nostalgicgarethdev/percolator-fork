import Link from "next/link";

export function Home() {
  return (
    <main>
      <section className="border-b border-border px-4 py-8 sm:px-8 sm:py-12 lg:grid lg:grid-cols-[minmax(0,40rem)_16rem] lg:items-center lg:gap-12 lg:py-16">
        <div>
          <svg viewBox="0 0 32 32" className="mb-6 size-16 text-foreground lg:hidden" aria-hidden="true" fill="none">
            <circle cx="16" cy="16" r="12.1" stroke="currentColor" strokeWidth="1.35" />
            <circle cx="16" cy="16" r="10.15" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.75" />
            <path d="M5.6 16H26.4" stroke="var(--primary)" strokeWidth="1.7" />
          </svg>
          <h1 className="emboss text-[clamp(3rem,10vw,5.5rem)] leading-[0.9] font-semibold tracking-[0.12em]">
            PERC
          </h1>
          <p className="mt-4 max-w-[36rem] text-[clamp(1.2rem,2.2vw,1.55rem)] leading-snug">
            An independent, experimental perpetuals interface built on Percolator.
          </p>
          <p className="mt-4 max-w-[36rem] text-[16px] leading-relaxed text-muted-foreground">
            A perp is a contract for taking a long or a short on a price, without an expiry date.
          </p>
          <p className="mt-3 max-w-[36rem] text-[16px] leading-relaxed text-muted-foreground">
            Today this is a site you can look through. There is no public trading and no deposits.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/terminal"
              className="inline-flex h-12 items-center justify-center bg-primary px-5 text-[14px] font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              Explore terminal
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex h-12 items-center justify-center px-2 text-[14px] text-foreground underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              How it works
            </Link>
          </div>
        </div>
        <svg viewBox="0 0 200 200" className="mt-10 hidden w-full text-foreground lg:block" aria-hidden="true">
          <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeWidth="1.25" />
          <circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.75" />
          <path d="M28 100H172" stroke="var(--primary)" strokeWidth="1.6" />
        </svg>
      </section>

      <section className="grid border-b border-border md:grid-cols-2" aria-label="What is available">
        <div className="border-b border-primary/40 px-4 py-6 sm:px-8 md:border-r md:border-b-0">
          <h2 className="text-[15px] font-medium text-primary">What you can do now</h2>
          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed">
            <li>Read what PERC is, and what a perp is.</li>
            <li>Open the terminal and see that no market is attached.</li>
            <li>On your own computer, run the local engine behind that same terminal.</li>
          </ul>
        </div>
        <div className="px-4 py-6 sm:px-8">
          <h2 className="text-[15px] font-medium text-muted-foreground">Not enabled yet</h2>
          <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-muted-foreground">
            <li>Public trading.</li>
            <li>Deposits.</li>
            <li>A live chain, price feed, or keeper.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
