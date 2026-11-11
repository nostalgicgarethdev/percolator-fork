"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Well } from "@/components/machine";

const Machine = dynamic(() => import("@/components/machine").then((mod) => mod.Machine), {
  ssr: false,
  loading: () => <div className="h-[min(52vh,520px)] min-h-[380px] lg:h-[min(64vh,600px)] lg:min-h-[480px]" />,
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

  const selected = wells.find((well) => well.id === assetId) ?? wells[2];

  return (
    <div>
      <div className="grid lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-[auto_1fr] lg:items-center">
        <header className="order-1 px-1 pt-8 lg:col-start-1 lg:row-start-1 lg:pt-10 lg:pr-8">
          <h1 className="font-serif text-[clamp(3rem,5.4vw,4.7rem)] leading-[0.9] tracking-[-0.045em]">
            One market
            <br />
            is one slab.
          </h1>
          <p className="mt-5 max-w-sm text-[16px] leading-relaxed text-white/70">
            A trade reads only the book of the trader who sent it. Insurance stays in its well.
          </p>
        </header>

        <div className="relative order-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[12%] bottom-[14%] h-28 rounded-full bg-[radial-gradient(closest-side,oklch(0.72_0.04_200/16%),transparent)]"
          />
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
        </div>

        <div className="order-3 px-1 pt-2 pb-4 lg:col-start-1 lg:row-start-2 lg:self-end lg:pr-8 lg:pb-10">
          <p
            className={`font-serif text-[clamp(5.2rem,11vw,7.6rem)] leading-none tracking-[-0.06em] ${
              blocked ? "text-[#9945FF]" : "text-foreground"
            }`}
          >
            {attempt.toFixed(0)}
          </p>
          <p className="mt-2 text-[13px] text-white/40">mark</p>
          <p className="mt-5 text-[16px] text-foreground/85" aria-live="polite">
            {status}
          </p>
          <p className="mt-1 text-[15px] text-white/50">
            {blocked
              ? `Book holds at ${applied.toFixed(0)}.`
              : flat
                ? "Insurance is sitting in each well."
                : "The loser pays first. Then that well."}
          </p>

          {flat ? null : (
            <div className="mt-8 grid max-w-md grid-cols-2">
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

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={crank}
                className="inline-flex h-12 min-w-28 cursor-pointer items-center justify-center border border-white/35 px-6 text-[15px] text-white touch-manipulation hover:bg-white hover:text-[#07060b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:bg-white active:text-[#07060b]"
              >
                Crank
              </button>
              <button
                type="button"
                onClick={reset}
                className="text-[14px] text-white/45 hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
              >
                Reset
              </button>
            </div>
            <div className="flex items-center gap-1 sm:ml-auto">
              <button
                type="button"
                className="grid size-11 place-items-center text-[18px] text-white/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
                onClick={() => setLots((n) => Math.max(1, n - 1))}
                aria-label="Fewer lots"
              >
                −
              </button>
              <p className="min-w-16 text-center text-[14px] tabular-nums">{lots} lots</p>
              <button
                type="button"
                className="grid size-11 place-items-center text-[18px] text-white/55 hover:text-foreground focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none"
                onClick={() => setLots((n) => Math.min(12, n + 1))}
                aria-label="More lots"
              >
                +
              </button>
            </div>
          </div>
          <p className="mt-8 max-w-sm text-[13px] leading-relaxed text-white/40">
            Example atoms. This host takes nothing.{" "}
            <Link href="/terminal" className="text-foreground/80 underline-offset-2 hover:underline">
              The terminal runs an example session.
            </Link>
          </p>
        </div>
      </div>

      <section className="mt-6 border-t border-white/10 px-1 pt-14 pb-4" aria-labelledby="wells-title">
        <h2
          id="wells-title"
          className="max-w-xl font-serif text-[clamp(2.4rem,5vw,3.8rem)] leading-[0.95] tracking-[-0.04em]"
        >
          Each well pays only itself.
        </h2>
        <p className="mt-6 max-w-lg text-[18px] leading-relaxed text-white/75">{wellLine(selected)}</p>
        <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3" role="group" aria-label="Choose a well">
          {ASSETS.map((item) => {
            const on = item.id === assetId;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => setAssetId(item.id)}
                className={`border-b pb-1 font-serif text-[clamp(1.8rem,3vw,2.5rem)] leading-none tracking-[-0.04em] focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none ${
                  on ? "border-white text-foreground" : "border-transparent text-white/35 hover:text-white/70"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function wellLine(well: Well) {
  if (well.win === 0) {
    if (well.insurance === 0) return "402 is dry. A win here is cut.";
    if (well.id === "0") return "BASE is holding a hundred thousand.";
    if (well.id === "14") return "14 is holding twenty thousand.";
    return "88 is holding five thousand.";
  }
  if (well.cut === 0) return `${well.label} pays the whole win.`;
  if (well.insurance === 0) return "Nothing in the well. The win is cut.";
  return `${well.label} pays ${atoms(well.paid)}. The rest is cut.`;
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
