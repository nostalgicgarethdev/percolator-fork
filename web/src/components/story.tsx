import { FORK_LABEL, FORK_URL, TOLY_FORK, TOLY_OWN_MARKETS, TOLY_STEAL_IDEA } from "@/lib/links";

export function Story() {
  return (
    <div>
      <section className="mt-8 border-t border-white/10 px-1 pt-14" aria-labelledby="what-title">
        <h2
          id="what-title"
          className="font-serif text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[0.95] tracking-[-0.04em]"
        >
          A risk engine, offered to be forked.
        </h2>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/65">
          Percolator is Anatoly Yakovenko&apos;s open-source library for managing perpetual-market
          risk on Solana. In February 2026 he described it as{" "}
          <a
            href={TOLY_OWN_MARKETS}
            target="_blank"
            rel="noreferrer"
            className="text-foreground/90 underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
          >
            “a small Open Source formally verified library for managing risk that devs can use to
            build their own markets.”
          </a>{" "}
          It is not a hosted exchange. Upstream still says the work is educational, unaudited, and
          not for production or real funds.
        </p>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-white/65">
          PERC is an independent interface on that work. It is not an official Percolator product,
          and it is not endorsed by Yakovenko, Solana Labs, or the operators of percolator.trade.
        </p>
      </section>

      <section className="mt-16 px-1" aria-labelledby="ask-title">
        <h2
          id="ask-title"
          className="font-serif text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[0.95] tracking-[-0.04em]"
        >
          He asked people to steal the idea.
        </h2>
        <blockquote className="mt-8 max-w-2xl border-l border-white/20 pl-6">
          <p className="font-serif text-[clamp(1.45rem,3vw,2rem)] leading-[1.15] tracking-[-0.03em] text-foreground">
            “Pls steal the idea. I want to see if it’s possible to replicate the same prop-amm
            competition for spot but for perps.”
          </p>
          <footer className="mt-4 text-[14px] text-white/45">
            <a
              href={TOLY_STEAL_IDEA}
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
            >
              @toly, 20 October 2025
            </a>
          </footer>
        </blockquote>
        <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-white/65">
          Months later, in a reply, he put it in two words:{" "}
          <a
            href={TOLY_FORK}
            target="_blank"
            rel="noreferrer"
            className="text-foreground/90 underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
          >
            “Fork percolator.”
          </a>{" "}
          The work is meant to be taken and used to ship markets, not left as a private prototype.
        </p>
      </section>

      <section className="mt-16 px-1 pb-4" aria-labelledby="build-title">
        <h2
          id="build-title"
          className="font-serif text-[clamp(2.2rem,4.5vw,3.4rem)] leading-[0.95] tracking-[-0.04em]"
        >
          Build your own perps.
        </h2>
        <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-white/65">
          The published fork vendors his engine and Solana wrapper, plus this website and a local
          example session. On your own machine you can step through a trade against example
          numbers. On this host the engine is not attached, so the terminal stays disconnected and
          read-only.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a
            href={FORK_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-12 items-center justify-center border border-white/35 px-6 text-[15px] text-white hover:bg-white hover:text-[#07060b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Open the fork
          </a>
          <p className="font-mono text-[13px] break-all text-white/45">{FORK_LABEL}</p>
        </div>
        <p className="mt-8 max-w-xl text-[14px] leading-relaxed text-white/45">
          Status of this host: read-only. No live trading. No deposits. No matcher or keeper is
          running here.
        </p>
      </section>
    </div>
  );
}
