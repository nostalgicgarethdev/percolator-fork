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

  const capLeft = ((anchor - CAP - MARK_MIN) / (MARK_MAX - MARK_MIN)) * 100;
  const capWidth = ((CAP * 2) / (MARK_MAX - MARK_MIN)) * 100;
  const paidRatio = book.win === 0 ? 0 : book.paid / book.win;
  const status = blocked
    ? "One crank. Six points."
    : book.win === 0
      ? "Flat."
      : book.cut === 0
        ? "This asset can pay it."
        : "This asset stops here. The others don't cover the rest.";

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
    <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
      <section>
        <p className="font-mono text-[12px] tracking-[0.14em] text-muted-foreground uppercase">Example book</p>
        <h1 className="mt-3 text-[clamp(4.2rem,11vw,7.4rem)] leading-[0.82] font-semibold tracking-[-0.07em]">
          PERC
        </h1>
        <p className="mt-4 max-w-md text-[clamp(1.35rem,2.2vw,1.85rem)] leading-[1.05] tracking-[-0.04em]">
          Push the mark. This asset pays, or it does not.
        </p>

        <div className="relative mt-8 aspect-square w-full max-w-[420px]">
          <svg viewBox="0 0 200 200" className="h-full w-full text-foreground" aria-hidden="true">
            <circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <circle cx="100" cy="100" r="66" fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="0.75" />
            <path d="M28 100H172" stroke="currentColor" strokeOpacity="0.16" strokeWidth="6" />
            <path
              d={`M${100 - 72 * paidRatio} 100H${100 + 72 * paidRatio}`}
              stroke="#b7d4e6"
              strokeWidth="6"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p
              className={`font-mono text-[clamp(3.4rem,8vw,5.4rem)] leading-none tracking-[-0.06em] ${
                blocked ? "text-destructive" : "text-foreground"
              }`}
            >
              {attempt.toFixed(0)}
            </p>
            <p className="mt-2 font-mono text-[12px] text-muted-foreground">
              {blocked ? `book holds ${applied.toFixed(0)}` : `entry ${ENTRY}`}
            </p>
          </div>
        </div>
      </section>

      <section className="glass rounded-[32px] px-5 py-5 sm:px-7 sm:py-7" aria-label="Example slab">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-[13px] font-medium tracking-[0.14em] text-muted-foreground uppercase">One account</h2>
          <p className="font-mono text-[12px] text-muted-foreground">insurance stays on its asset</p>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2" role="listbox" aria-label="Assets in the slab">
          {ASSETS.map((item) => {
            const on = item.id === assetId;
            const depth = 18 + (item.insurance / 100_000) * 46;
            return (
              <button
                key={item.id}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => setAssetId(item.id)}
                className={`rounded-2xl px-2 py-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ${
                  on ? "bg-white/12" : "hover:bg-white/6"
                }`}
              >
                <svg viewBox="0 0 64 28" className="h-7 w-full" aria-hidden="true">
                  <circle cx="14" cy="14" r="10" fill="none" stroke="currentColor" strokeOpacity={on ? 0.9 : 0.35} />
                  <path d={`M${14 - depth / 4} 14H${14 + depth / 4}`} stroke="#b7d4e6" strokeWidth="2" />
                </svg>
                <p className="mt-1 font-mono text-[13px]">{item.label}</p>
                <p className="font-mono text-[11px] text-muted-foreground">{atoms(item.insurance)}</p>
              </button>
            );
          })}
        </div>

        <div className="relative mt-6">
          <div className="pointer-events-none absolute top-1/2 right-[2%] left-[2%] h-3 -translate-y-1/2">
            <div
              className="absolute h-full rounded-full bg-[#b7d4e6]/25"
              style={{ left: `${capLeft}%`, width: `${capWidth}%` }}
            />
          </div>
          <label className="sr-only" htmlFor="perc-mark">
            Example mark
          </label>
          <input
            id="perc-mark"
            className="perc-range relative z-10"
            type="range"
            min={MARK_MIN}
            max={MARK_MAX}
            step={1}
            value={attempt}
            onChange={(event) => setAttempt(Number(event.target.value))}
          />
          <div className="mt-2 flex justify-between font-mono text-[11px] text-muted-foreground">
            <span>{MARK_MIN}</span>
            <span className={blocked ? "text-destructive" : ""}>{status}</span>
            <span>{MARK_MAX}</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Side
            name="Long"
            winning={book.longWins}
            paid={book.paid}
            cut={book.cut}
            loss={book.shortWins ? book.fromLoser : 0}
          />
          <Side
            name="Short"
            winning={book.shortWins}
            paid={book.paid}
            cut={book.cut}
            loss={book.longWins ? book.fromLoser : 0}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <button type="button" className="glass-pill glass-solid text-[14px] font-medium" onClick={crank}>
            Crank
          </button>
          <button type="button" className="glass-pill text-[14px] font-medium" onClick={reset}>
            Reset
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="glass-pill size-11 px-0 text-[18px]"
              onClick={() => setLots((n) => Math.max(1, n - 1))}
              aria-label="Fewer lots"
            >
              −
            </button>
            <p className="min-w-14 text-center font-mono text-[13px]">{lots} lots</p>
            <button
              type="button"
              className="glass-pill size-11 px-0 text-[18px]"
              onClick={() => setLots((n) => Math.min(12, n + 1))}
              aria-label="More lots"
            >
              +
            </button>
          </div>
        </div>
        <p className="mt-4 font-mono text-[11px] text-muted-foreground">Made-up atoms. This host takes nothing.</p>
      </section>
    </div>
  );
}

function Side({
  name,
  winning,
  paid,
  cut,
  loss,
}: {
  name: string;
  winning: boolean;
  paid: number;
  cut: number;
  loss: number;
}) {
  return (
    <div className="rounded-2xl bg-black/20 px-4 py-4">
      <p className="font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{name}</p>
      {winning ? (
        <>
          <p className="mt-2 font-mono text-[1.65rem] leading-none tracking-[-0.04em]">{atoms(paid)}</p>
          <p className="mt-2 text-[13px] text-muted-foreground">{cut > 0 ? `${atoms(cut)} not paid` : "paid in full"}</p>
        </>
      ) : loss > 0 ? (
        <>
          <p className="mt-2 font-mono text-[1.65rem] leading-none tracking-[-0.04em]">{atoms(CAPITAL - loss)}</p>
          <p className="mt-2 text-[13px] text-muted-foreground">down {atoms(loss)}</p>
        </>
      ) : (
        <>
          <p className="mt-2 font-mono text-[1.65rem] leading-none tracking-[-0.04em]">{atoms(CAPITAL)}</p>
          <p className="mt-2 text-[13px] text-muted-foreground">untouched</p>
        </>
      )}
    </div>
  );
}
