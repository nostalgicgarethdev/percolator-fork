import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sources — PERC",
  description:
    "Upstream Percolator repositories, licenses, and the limit of what this desk has verified.",
};

const ENGINE = "4db11a8cb0053815e23a35d3a7d3edc265d8d866";
const PROGRAM = "5cb331dde354517c6371a8acf92cecb194f3bb73";

export default function SourcesPage() {
  return (
    <main>
      <header className="border-b border-border px-4 py-8 sm:px-8">
        <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">Sources</p>
        <h1 className="mt-2 max-w-[36rem] font-serif text-[clamp(1.8rem,4vw,2.6rem)] leading-tight italic">
          Public upstream. Published desk.
        </h1>
        <p className="mt-4 max-w-[44rem] text-[15px] leading-relaxed text-muted-foreground">
          The engine and the Solana wrapper are Anatoly Yakovenko&apos;s Apache-2.0 code. Upstream
          says the work is educational, unaudited, and not for production or real funds. PERC does
          not change that warning, and it is not an endorsement by the author.
        </p>
      </header>
      <div className="grid border-b border-border md:grid-cols-2">
        <SourceCard
          label="Risk engine"
          href="https://github.com/aeyakovenko/percolator"
          name="aeyakovenko/percolator"
          pin={ENGINE}
        />
        <SourceCard
          label="Solana wrapper"
          href="https://github.com/aeyakovenko/percolator-prog"
          name="aeyakovenko/percolator-prog"
          pin={PROGRAM}
          className="border-t border-border md:border-t-0 md:border-l"
        />
        <SourceCard
          label="This website"
          href="https://github.com/nostalgicgarethdev/percolator-fork"
          name="nostalgicgarethdev/percolator-fork"
          pin="snapshot 666c4fa72aae30555b12b9451b33637e19baf636"
          className="border-t border-border md:col-span-2"
        />
      </div>
      <section className="space-y-4 px-4 py-8 text-[15px] leading-relaxed text-muted-foreground sm:px-8">
        <p>
          This website&apos;s source is published at{" "}
          <a
            href="https://github.com/nostalgicgarethdev/percolator-fork"
            className="text-primary underline-offset-2 hover:underline"
          >
            github.com/nostalgicgarethdev/percolator-fork
          </a>
          . <span className="font-mono text-[12px]">MANIFEST.txt</span> records sanitized snapshot{" "}
          <span className="font-mono text-[12px]">666c4fa72aae30555b12b9451b33637e19baf636</span>.
          That snapshot id is not this repository&apos;s Git commit hash.
        </p>
        <p>
          What was checked: a 16-step local lifecycle on the vendored engine. Deposit, open,
          funding, settlement, close, withdraw, rejected cranks and trades, and one
          undercollateralized liquidation. What was not checked: a Solana deployment, an oracle, a
          matcher, or a keeper.
        </p>
        <p>Both upstream licenses are Apache-2.0. The program crate metadata does not repeat the license field; the license file itself is Apache-2.0.</p>
        <p>
          The overview also shows a token mint,{" "}
          <span className="font-mono text-[12px] break-all">EkNJH54jo23bPa45bY1WDDy4Qvg2CjAJjjEWqgbypump</span>
          . That account is a Token-2022 mint named Percolator v2, symbol Percolator. It is not the
          program id in this tree and it is not a deposit address.
        </p>
      </section>
    </main>
  );
}

function SourceCard({
  label,
  href,
  name,
  pin,
  className = "",
}: {
  label: string;
  href: string;
  name: string;
  pin: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`block px-4 py-5 hover:bg-card focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none sm:px-8 ${className}`}
    >
      <p className="text-[10px] tracking-[0.18em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 text-[16px]">{name}</p>
      <p className="mt-2 font-mono text-[11px] break-all text-primary">{pin}</p>
    </a>
  );
}
