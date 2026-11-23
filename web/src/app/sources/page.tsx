import type { Metadata } from "next";
import { FORK_LABEL, FORK_URL, TOLY_FORK, TOLY_OWN_MARKETS, TOLY_STEAL_IDEA } from "@/lib/links";

export const metadata: Metadata = {
  title: "Sources — PERC",
  description:
    "Upstream Percolator repositories, Toly's public posts, and the limit of what this desk has verified.",
};

const ENGINE = "4db11a8cb0053815e23a35d3a7d3edc265d8d866";
const PROGRAM = "5cb331dde354517c6371a8acf92cecb194f3bb73";

const SOURCES = [
  {
    label: "This fork",
    href: FORK_URL,
    name: "nostalgicgarethdev/percolator-fork",
    pin: "snapshot 666c4fa72aae30555b12b9451b33637e19baf636",
  },
  {
    label: "Risk engine",
    href: "https://github.com/aeyakovenko/percolator",
    name: "aeyakovenko/percolator",
    pin: ENGINE,
  },
  {
    label: "Solana wrapper",
    href: "https://github.com/aeyakovenko/percolator-prog",
    name: "aeyakovenko/percolator-prog",
    pin: PROGRAM,
  },
] as const;

const POSTS = [
  {
    href: TOLY_STEAL_IDEA,
    date: "20 October 2025",
    text: "Pls steal the idea. I want to see if it’s possible to replicate the same prop-amm competition for spot but for perps.",
  },
  {
    href: TOLY_OWN_MARKETS,
    date: "6 February 2026",
    text: "It’s a small Open Source formally verified library for managing risk that devs can use to build their own markets.",
  },
  {
    href: TOLY_FORK,
    date: "21 February 2026",
    text: "Fork percolator",
  },
] as const;

export default function SourcesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="max-w-3xl">
        <p className="font-mono text-[12px] tracking-[0.18em] text-white/40 uppercase">Sources</p>
        <h1 className="mt-4 font-serif text-[clamp(2.8rem,6vw,5rem)] leading-[0.92] tracking-[-0.045em]">
          Public upstream. Published fork.
        </h1>
        <p className="mt-6 max-w-2xl text-[18px] leading-relaxed text-white/70">
          The engine and the Solana wrapper are Anatoly Yakovenko&apos;s Apache-2.0 code. Upstream
          says the work is educational, unaudited, and not for production or real funds. PERC does
          not change that warning, and it is not an endorsement by the author.
        </p>
      </header>

      <ul className="mt-14 divide-y divide-white/10 border-y border-white/10">
        {SOURCES.map((source) => (
          <li key={source.href}>
            <a
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="group grid gap-2 py-7 focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-baseline sm:gap-8"
            >
              <span className="font-mono text-[12px] tracking-[0.12em] text-white/35 uppercase">{source.label}</span>
              <span>
                <span className="block font-serif text-[clamp(1.7rem,3vw,2.5rem)] leading-none tracking-[-0.04em] text-white/85 group-hover:text-white">
                  {source.name}
                </span>
                <span className="mt-3 block font-mono text-[12px] break-all text-white/45">{source.pin}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <section className="mt-16" aria-labelledby="posts-title">
        <h2 id="posts-title" className="font-serif text-[clamp(2rem,4vw,3rem)] leading-none tracking-[-0.04em]">
          What Toly said
        </h2>
        <ul className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {POSTS.map((post) => (
            <li key={post.href}>
              <a
                href={post.href}
                target="_blank"
                rel="noreferrer"
                className="block py-7 focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
              >
                <p className="font-serif text-[clamp(1.3rem,2.5vw,1.8rem)] leading-snug tracking-[-0.03em] text-white/85">
                  “{post.text}”
                </p>
                <p className="mt-3 font-mono text-[12px] text-white/40">@toly, {post.date}</p>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12 max-w-2xl space-y-4 text-[15px] leading-relaxed text-white/55">
        <p>
          This website&apos;s source is published at{" "}
          <a
            href={FORK_URL}
            className="text-foreground underline-offset-2 hover:underline"
          >
            {FORK_LABEL}
          </a>
          . <span className="font-mono text-[12px]">MANIFEST.txt</span> records sanitized snapshot{" "}
          <span className="font-mono text-[12px]">666c4fa72aae30555b12b9451b33637e19baf636</span>.
          That snapshot id is not this repository&apos;s Git commit hash.
        </p>
        <p>
          What was checked: a 16-step local lifecycle on the vendored engine. Deposit, open,
          funding, settlement, close, withdraw, rejected cranks and trades, and one
          undercollateralized liquidation. What was not checked: a Solana deployment, an oracle, a
          matcher, or a keeper. This public host does not run live trading and does not take
          deposits.
        </p>
        <p>
          Both upstream licenses are Apache-2.0. The program crate metadata does not repeat the
          license field; the license file itself is Apache-2.0.
        </p>
      </div>
    </main>
  );
}
