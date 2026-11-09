"use client";

import { useMemo, useState } from "react";

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

function xOf(mark: number) {
  return 28 + ((mark - MARK_MIN) / (MARK_MAX - MARK_MIN)) * 144;
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
  const paidRatio = book.win === 0 ? 0 : book.paid / book.win;
  const status = blocked
    ? "One crank. Six points."
    : book.win === 0
      ? "Flat."
      : book.cut === 0
        ? "This asset can pay it."
        : "This asset stops here. The others do not.";

  const capX1 = xOf(anchor - CAP);
  const capX2 = xOf(anchor + CAP);

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
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">Example</p>
        <p className="font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">One account</p>
      </div>

      <div className="relative mx-auto mt-6 aspect-square w-full max-w-[460px]">
        <svg viewBox="0 0 200 200" className="h-full w-full text-foreground" aria-hidden="true">
          <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" strokeOpacity="0.9" strokeWidth="0.6" />
          <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.5" />
          <path d="M28 108H172" stroke="currentColor" strokeOpacity="0.14" strokeWidth="3" />
          <path d={`M${capX1} 108H${capX2}`} stroke="currentColor" strokeOpacity="0.45" strokeWidth="3" />
          <path
            d={`M${100 - 72 * paidRatio} 108H${100 + 72 * paidRatio}`}
            stroke="#b7d4e6"
            strokeWidth="3"
          />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 top-[27%] text-center">
          <p
            className={`font-serif text-[clamp(4.6rem,12vw,6.4rem)] leading-none tracking-[-0.045em] ${
              blocked ? "text-destructive" : "text-foreground"
            }`}
          >
            {attempt.toFixed(0)}
          </p>
        </div>
        <label className="sr-only" htmlFor="perc-mark">
          Example mark
        </label>
        <input
          id="perc-mark"
          className="perc-range perc-range-bare absolute top-[54%] right-[14%] left-[14%] z-10 -translate-y-1/2"
          type="range"
          min={MARK_MIN}
          max={MARK_MAX}
          step={1}
          value={attempt}
          onChange={(event) => setAttempt(Number(event.target.value))}
        />
      </div>

      <p className="mt-1 text-center font-mono text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
        {blocked ? `holds ${applied.toFixed(0)}` : `entry ${ENTRY}`}
      </p>
      <p className="mx-auto mt-3 max-w-md text-center font-serif text-[1.65rem] leading-none tracking-[-0.03em]">
        {status}
      </p>

      <div className="mx-auto mt-8 grid max-w-xl grid-cols-2 border-y border-white/10">
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

      <div className="mt-8" role="listbox" aria-label="Assets in the account">
        <div className="grid grid-cols-[4.5rem_1fr_auto] px-1 pb-2 font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          <span>Asset</span>
          <span>Insurance</span>
          <span>At this mark</span>
        </div>
        {ASSETS.map((item) => {
          const on = item.id === assetId;
          const row = settle(applied, lots, item.insurance);
          const note = row.win === 0 ? "flat" : row.cut === 0 ? "pays" : `cut ${atoms(row.cut)}`;
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={on}
              onClick={() => setAssetId(item.id)}
              className={`grid h-12 w-full grid-cols-[4.5rem_1fr_auto] items-center border-t border-white/10 px-1 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                on ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2 font-mono text-[13px]">
                <span className={`size-1.5 rounded-full ${on ? "bg-[#b7d4e6]" : "bg-white/20"}`} aria-hidden />
                {item.label}
              </span>
              <span className="font-mono text-[13px]">{atoms(item.insurance)}</span>
              <span className={`font-mono text-[13px] ${on && row.cut > 0 ? "text-[#b7d4e6]" : ""}`}>{note}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={crank}
            className="bg-foreground text-background h-10 px-4 text-[13px] font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Crank
          </button>
          <button
            type="button"
            onClick={reset}
            className="h-10 px-1 text-[13px] text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            Reset
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="size-10 border border-white/15 text-[18px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={() => setLots((n) => Math.max(1, n - 1))}
            aria-label="Fewer lots"
          >
            −
          </button>
          <p className="min-w-16 text-center font-mono text-[12px] tracking-[0.08em]">{String(lots).padStart(2, "0")} lots</p>
          <button
            type="button"
            className="size-10 border border-white/15 text-[18px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={() => setLots((n) => Math.min(12, n + 1))}
            aria-label="More lots"
          >
            +
          </button>
        </div>
      </div>
      <p className="mt-6 text-center font-mono text-[11px] tracking-[0.08em] text-muted-foreground">
        Example atoms. This host takes nothing.
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
  return (
    <div className={`py-5 ${align === "right" ? "border-r border-white/10 pr-6 text-right" : "pl-6"}`}>
      <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">{name}</p>
      <p className="mt-2 font-mono text-[clamp(1.7rem,4vw,2.4rem)] leading-none tracking-[-0.04em]">{figure}</p>
      <p className="mt-2 text-[13px] text-muted-foreground">{detail}</p>
    </div>
  );
}
