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
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="max-w-3xl">
        <p className="text-[13px] text-muted-foreground">Sources</p>
        <h1 className="mt-3 font-serif text-[clamp(2.4rem,5vw,4rem)] leading-[0.95] tracking-[-0.04em]">
          Public upstream. Published desk.
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">
          The engine and the Solana wrapper are Anatoly Yakovenko&apos;s Apache-2.0 code. Upstream
          says the work is educational, unaudited, and not for production or real funds. PERC does
          not change that warning, and it is not an endorsement by the author.
        </p>
      </header>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
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
        />
        <SourceCard
          label="This website"
          href="https://github.com/nostalgicgarethdev/percolator-fork"
          name="nostalgicgarethdev/percolator-fork"
          pin="snapshot 666c4fa72aae30555b12b9451b33637e19baf636"
          className="md:col-span-2"
        />
      </div>
      <section className="glass mt-4 space-y-4 rounded-[28px] px-6 py-6 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          This website&apos;s source is published at{" "}
          <a
            href="https://github.com/nostalgicgarethdev/percolator-fork"
            className="text-foreground underline-offset-2 hover:underline"
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
      className={`glass block rounded-[28px] px-6 py-5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${className}`}
    >
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-2 text-[18px] tracking-[-0.03em]">{name}</p>
      <p className="mt-3 font-mono text-[12px] break-all text-foreground/80">{pin}</p>
    </a>
  );
}
