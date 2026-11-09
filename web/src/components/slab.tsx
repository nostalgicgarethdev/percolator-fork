"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Well } from "@/components/machine";

const Machine = dynamic(() => import("@/components/machine").then((mod) => mod.Machine), {
  ssr: false,
  loading: () => <div className="h-[min(48vh,460px)] min-h-[340px]" />,
});

const ENTRY = 100;
const CAP = 6;
const UNIT = 5_000;
const CAPITAL = 40_000;
const MARK_MIN = 70;
const MARK_MAX = 130;

const ASSETS = [
  { id: "0", label: "BASE", insurance: 100_000 },
  { id: "14", label: "14", insurance: 20_000 },
  { id: "88", label: "88", insurance: 5_000 },
  { id: "402", label: "402", insurance: 0 },
] as const;

type AssetId = (typeof ASSETS)[number]["id"];

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function atoms(n: number) {
  return new Intl.NumberFormat("en-US").format(Math.round(n));
}

function settle(mark: number, lots: number, insurance: number) {
  const raw = lots * (mark - ENTRY) * UNIT;
  const win = Math.abs(raw);
  const fromLoser = Math.min(win, CAPITAL);
  const fromInsurance = Math.min(Math.max(0, win - fromLoser), insurance);
  const paid = fromLoser + fromInsurance;
  return { raw, win, paid, cut: win - paid, longWins: raw > 0, shortWins: raw < 0, fromLoser };
}

export function Slab() {
  const [assetId, setAssetId] = useState<AssetId>("88");
  const [lots, setLots] = useState(4);
  const [attempt, setAttempt] = useState(ENTRY);
  const [anchor, setAnchor] = useState(ENTRY);

  const asset = ASSETS.find((item) => item.id === assetId) ?? ASSETS[2];
  const applied = clamp(attempt, anchor - CAP, anchor + CAP);
  const blocked = attempt !== applied;
  const book = useMemo(() => settle(applied, lots, asset.insurance), [applied, lots, asset.insurance]);
  const flat = book.win === 0;
  const status = blocked
    ? "One crank. Six points."
    : flat
      ? "Drag the heat."
      : book.cut === 0
        ? "Paid in full."
        : "The rest is cut.";
  const wells: Well[] = ASSETS.map((item) => {
    const row = settle(applied, lots, item.insurance);
    return { id: item.id, label: item.label, insurance: item.insurance, paid: row.paid, cut: row.cut, win: row.win };
  });

  function crank() {
    setAnchor(applied);
    setAttempt(applied);
  }

  function reset() {
    setAnchor(ENTRY);
    setAttempt(ENTRY);
    setLots(4);
    setAssetId("88");
  }

  return (
    <div>
      <header className="max-w-xl px-1 pt-8 pb-4 sm:pt-10">
        <h1 className="font-serif text-[clamp(2rem,4vw,2.65rem)] leading-[1.05] tracking-[-0.035em]">
          One market is one slab.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground/75">
          A trade reads only the book of the trader who sent it. Insurance stays in its well.
        </p>
      </header>
      <label className="sr-only" htmlFor="perc-mark">
        Example mark
      </label>
      <input
        id="perc-mark"
        className="sr-only"
        type="range"
        min={MARK_MIN}
        max={MARK_MAX}
        step={1}
        value={attempt}
        aria-valuetext={blocked ? `${attempt}, holds ${applied}` : String(attempt)}
        onChange={(event) => setAttempt(Number(event.target.value))}
      />
      <Machine
        attempt={attempt}
        applied={applied}
        anchor={anchor}
        blocked={blocked}
        assetId={assetId}
        wells={wells}
        onAttempt={setAttempt}
        onSelect={(id) => setAssetId(id as AssetId)}
      />

      <p
        className={`mt-2 text-center font-serif text-[clamp(4.4rem,12vw,6.6rem)] leading-none tracking-[-0.05em] ${
          blocked ? "text-[#9945FF]" : "text-foreground"
        }`}
      >
        {attempt.toFixed(0)}
      </p>
      <p className="mt-2 text-center text-[13px] text-muted-foreground">mark</p>
      <p className="mt-5 text-center text-[15px] text-foreground/80">{status}</p>
      <p className="mt-3 text-center text-[15px] text-muted-foreground">
        {blocked
          ? `Book holds at ${applied.toFixed(0)}.`
          : flat
            ? "Insurance is sitting in each well."
            : "The loser pays first. Then that well."}
      </p>

      {flat ? null : (
        <div className="mx-auto mt-10 grid max-w-xl grid-cols-2">
          <Side
            name="Long"
            align="right"
            winning={book.longWins}
            paid={book.paid}
            cut={book.cut}
            loss={book.shortWins ? book.fromLoser : 0}
          />
          <Side
            name="Short"
            align="left"
            winning={book.shortWins}
            paid={book.paid}
            cut={book.cut}
            loss={book.longWins ? book.fromLoser : 0}
          />
        </div>
      )}

      <div className="mx-auto mt-12 flex max-w-md flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-5">
          <button
            type="button"
            onClick={crank}
            className="inline-flex h-12 min-w-28 cursor-pointer items-center justify-center border border-white/30 px-6 text-[15px] text-white touch-manipulation hover:bg-white hover:text-[#07060b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:bg-white active:text-[#07060b]"
          >
            Crank
          </button>
          <button
            type="button"
            onClick={reset}
            className="text-[14px] text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
          >
            Reset
          </button>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-[18px] text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
            onClick={() => setLots((n) => Math.max(1, n - 1))}
            aria-label="Fewer lots"
          >
            −
          </button>
          <p className="min-w-14 text-center text-[14px] tabular-nums">{lots} lots</p>
          <button
            type="button"
            className="text-[18px] text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
            onClick={() => setLots((n) => Math.min(12, n + 1))}
            aria-label="More lots"
          >
            +
          </button>
        </div>
      </div>
      <p className="mt-16 max-w-xl text-[13px] leading-relaxed text-muted-foreground">
        Example atoms. Independent, not the official engine. This host takes nothing.{" "}
        <Link href="/terminal" className="text-foreground underline-offset-2 hover:underline">
          The terminal runs an example session.
        </Link>
      </p>
    </div>
  );
}

function Side({
  name,
  align,
  winning,
  paid,
  cut,
  loss,
}: {
  name: string;
  align: "left" | "right";
  winning: boolean;
  paid: number;
  cut: number;
  loss: number;
}) {
  const figure = winning ? atoms(paid) : atoms(loss > 0 ? CAPITAL - loss : CAPITAL);
  const detail = winning ? (cut > 0 ? `${atoms(cut)} not paid` : "paid in full") : loss > 0 ? `down ${atoms(loss)}` : "untouched";
  const detailClass = winning ? (cut > 0 ? "text-[#9945FF]" : "text-[#14F195]") : "text-muted-foreground";
  return (
    <div className={align === "right" ? "pr-6 text-right" : "border-l border-white/10 pl-6"}>
      <p className="text-[13px] text-muted-foreground">{name}</p>
      <p className="mt-2 font-serif text-[clamp(2rem,5vw,2.8rem)] leading-none tracking-[-0.04em]">{figure}</p>
      <p className={`mt-2 text-[13px] ${detailClass}`}>{detail}</p>
    </div>
  );
}
