"use client";

import { useMemo, useState } from "react";

const ENTRY = 100;
const CAP = 6;
const UNIT = 5_000;
const CAPITAL = 40_000;
const MARK_MIN = 70;
const MARK_MAX = 130;
const ARC_R = 76;
const VB_X = 0;
const VB_Y = 6;
const VB_W = 200;
const VB_H = 146;
const HOLE = 58;
const TICKS = [70, 100, 130] as const;

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

function polar(mark: number, r: number) {
  const u = (mark - MARK_MIN) / (MARK_MAX - MARK_MIN);
  const rad = ((160 + u * 220) * Math.PI) / 180;
  return { x: 100 + r * Math.cos(rad), y: 100 + r * Math.sin(rad) };
}

function gaugeArc(a: number, b: number) {
  const start = Math.min(a, b);
  const end = Math.max(a, b);
  if (end - start < 0.01) return "";
  const p0 = polar(start, ARC_R);
  const p1 = polar(end, ARC_R);
  const sweep = ((end - start) / (MARK_MAX - MARK_MIN)) * 220;
  const large = sweep > 180 ? 1 : 0;
  return `M${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A${ARC_R} ${ARC_R} 0 ${large} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`;
}

function markFromVector(x: number, y: number) {
  let deg = (Math.atan2(y, x) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  if (deg > 20 && deg < 160) return deg < 90 ? MARK_MAX : MARK_MIN;
  const swept = deg >= 160 ? deg - 160 : deg + 200;
  return clamp(Math.round(MARK_MIN + (swept / 220) * (MARK_MAX - MARK_MIN)), MARK_MIN, MARK_MAX);
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
      ? "At the entry."
      : book.cut === 0
        ? "Paid in full."
        : "The rest is cut.";

  const capPath = gaugeArc(clamp(anchor - CAP, MARK_MIN, MARK_MAX), clamp(anchor + CAP, MARK_MIN, MARK_MAX));
  const movePath = gaugeArc(ENTRY, applied);
  const thumb = polar(attempt, ARC_R);
  const hold = polar(applied, ARC_R);

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

  function vector(event: React.PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VB_W + VB_X - 100,
      y: ((event.clientY - rect.top) / rect.height) * VB_H + VB_Y - 100,
    };
  }

  function onPointerDown(event: React.PointerEvent<SVGSVGElement>) {
    const point = vector(event);
    if (Math.hypot(point.x, point.y) < HOLE) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setAttempt(markFromVector(point.x, point.y));
  }

  function onPointerMove(event: React.PointerEvent<SVGSVGElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const point = vector(event);
    if (Math.hypot(point.x, point.y) < 8) return;
    setAttempt(markFromVector(point.x, point.y));
  }

  return (
    <div>
      <div className="relative mx-auto w-full max-w-[540px]">
        <label className="sr-only" htmlFor="perc-mark">
          Example mark
        </label>
        <input
          id="perc-mark"
          className="peer sr-only"
          type="range"
          min={MARK_MIN}
          max={MARK_MAX}
          step={1}
          value={attempt}
          aria-valuetext={blocked ? `${attempt}, holds ${applied}` : String(attempt)}
          onChange={(event) => setAttempt(Number(event.target.value))}
        />
        <svg
          viewBox={`${VB_X} ${VB_Y} ${VB_W} ${VB_H}`}
          className="h-auto w-full cursor-pointer touch-none text-foreground select-none peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-[#14F195]"
          aria-hidden="true"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
        >
          <path d={gaugeArc(MARK_MIN, MARK_MAX)} fill="none" stroke="currentColor" strokeOpacity="0.16" strokeWidth="0.8" />
          {capPath ? <path d={capPath} fill="none" stroke="#9945FF" strokeOpacity="0.42" strokeWidth="5" strokeLinecap="round" /> : null}
          {movePath ? <path d={movePath} fill="none" stroke="#14F195" strokeWidth="1.8" strokeLinecap="round" /> : null}
          {TICKS.map((mark) => {
            const inner = polar(mark, 82);
            const outer = polar(mark, 87);
            return (
              <line
                key={mark}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={mark === ENTRY ? "#14F195" : "currentColor"}
                strokeOpacity={mark === ENTRY ? 0.9 : 0.35}
                strokeWidth="0.8"
              />
            );
          })}
          {[MARK_MIN, MARK_MAX].map((mark) => {
            const point = polar(mark, 95);
            return (
              <text
                key={mark}
                x={point.x}
                y={point.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="currentColor"
                fillOpacity="0.38"
                fontSize="4.5"
              >
                {mark}
              </text>
            );
          })}
          {blocked ? <circle cx={hold.x} cy={hold.y} r="1.8" fill="#14F195" /> : null}
          <circle cx={thumb.x} cy={thumb.y} r="6.2" fill="none" stroke={blocked ? "#9945FF" : "#14F195"} strokeOpacity="0.45" strokeWidth="0.6" />
          <circle cx={thumb.x} cy={thumb.y} r="2.6" fill={blocked ? "#9945FF" : "#14F195"} />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-[12%]">
          <p
            className={`font-serif text-[clamp(4.8rem,13vw,7rem)] leading-none tracking-[-0.05em] ${
              blocked ? "text-[#9945FF]" : "text-foreground"
            }`}
          >
            {attempt.toFixed(0)}
          </p>
        </div>
      </div>

      <p className="mt-1 text-center font-serif text-[1.85rem] leading-none tracking-[-0.03em] italic">{status}</p>
      <p className="mt-3 text-center text-[13px] text-muted-foreground">
        {blocked ? `Holding ${applied.toFixed(0)}` : `Entry ${ENTRY}`}
      </p>
      <div className="mx-auto mt-5 h-[2px] w-44 bg-white/10">
        {book.win > 0 ? (
          <div className="flex h-full">
            <div className="h-full bg-[#14F195]" style={{ width: `${paidRatio * 100}%` }} />
            <div className="h-full bg-[#9945FF]" style={{ width: `${(1 - paidRatio) * 100}%` }} />
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-center text-[13px]">
        <span className={book.paid > 0 ? "text-[#14F195]" : "text-muted-foreground"}>paid {atoms(book.paid)}</span>
        <span className="px-2 text-white/25">·</span>
        <span className={book.cut > 0 ? "text-[#9945FF]" : "text-muted-foreground"}>cut {atoms(book.cut)}</span>
      </p>

      <div className="mx-auto mt-14 grid max-w-md grid-cols-2">
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

      <div className="mx-auto mt-16 max-w-md" role="listbox" aria-label="Assets in the account">
        <p className="pb-3 text-[13px] text-muted-foreground">Insurance stays with the asset.</p>
        {ASSETS.map((item) => {
          const on = item.id === assetId;
          const row = settle(applied, lots, item.insurance);
          const note = row.win === 0 ? "flat" : row.cut === 0 ? "pays" : `cut ${atoms(row.cut)}`;
          const noteClass = row.win === 0 ? "text-muted-foreground" : row.cut === 0 ? "text-[#14F195]" : "text-[#9945FF]";
          return (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={on}
              onClick={() => setAssetId(item.id)}
              className={`grid h-12 w-full grid-cols-[5.5rem_1fr_auto] items-center border-t border-white/10 text-left focus-visible:ring-2 focus-visible:ring-[#14F195] focus-visible:outline-none ${
                on ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="flex items-center gap-2.5 text-[15px]">
                <span className={`size-1.5 rounded-full ${on ? "bg-[#14F195]" : "bg-white/15"}`} aria-hidden />
                {item.label}
              </span>
              <span className="text-[14px] tabular-nums">{atoms(item.insurance)}</span>
              <span className={`text-[14px] tabular-nums ${noteClass}`}>{note}</span>
            </button>
          );
        })}
      </div>

      <div className="mx-auto mt-12 flex max-w-md flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-5">
          <button
            type="button"
            onClick={crank}
            className="font-serif text-[1.7rem] leading-none text-[#14F195] italic underline decoration-[#14F195]/30 underline-offset-8 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
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
      <p className="mt-14 text-center text-[13px] text-muted-foreground">Example atoms. This host takes nothing.</p>
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
