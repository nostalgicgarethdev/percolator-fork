"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type AccountView,
  type EngineState,
  groupInteger,
  lotsFromQ,
} from "@/lib/engine";

const ENGINE = "4db11a8cb0053815e23a35d3a7d3edc265d8d866";
const PROGRAM = "5cb331dde354517c6371a8acf92cecb194f3bb73";

export function Desk() {
  const [state, setState] = useState<EngineState | null>(null);
  const [connected, setConnected] = useState(false);
  const [phase, setPhase] = useState<"checking" | "attached" | "disconnected">("checking");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [deposit, setDeposit] = useState("20000000");
  const [seed, setSeed] = useState("20000000");
  const [lots, setLots] = useState("1");
  const [side, setSide] = useState<"long" | "short">("long");
  const [price, setPrice] = useState("");
  const [funding, setFunding] = useState("10000");
  const longRef = useRef<HTMLButtonElement>(null);
  const shortRef = useRef<HTMLButtonElement>(null);
  const lockId = useId();

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/engine/v1/state", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) {
        setConnected(false);
        setPhase("disconnected");
        setState(null);
        setError(body.error ?? "Local engine did not respond.");
        return;
      }
      setConnected(true);
      setPhase("attached");
      setState(body as EngineState);
      setError(null);
      setPrice((current) =>
        current === "" ? String((body as EngineState).market.effective_price) : current,
      );
    } catch {
      setConnected(false);
      setPhase("disconnected");
      setState(null);
      setError("Local engine is not reachable.");
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 4000);
    return () => window.clearInterval(timer);
  }, [load]);

  async function call(path: string, payload?: unknown) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload === undefined ? "{}" : JSON.stringify(payload),
      });
      const body = await response.json();
      if (!response.ok) {
        setError(body.error ?? "The engine rejected the call.");
        if (body.state) setState(body.state as EngineState);
        return;
      }
      setConnected(true);
      setPhase("attached");
      setState(body as EngineState);
    } catch {
      setConnected(false);
      setPhase("disconnected");
      setError("The local engine connection dropped.");
    } finally {
      setBusy(false);
    }
  }

  const disabled = !connected || busy;
  const quietDisconnect =
    !!error && /not reachable|did not respond|connection dropped/i.test(error);
  const lockText = phase === "checking"
    ? "Checking whether a local engine is attached. Buttons stay off until it answers."
    : !connected
    ? "Buttons stay off. This host has no engine, so it cannot take a deposit or place a trade."
    : busy
      ? "Waiting for the engine."
      : "Each call hits the vendored v16 engine in this process. A rejection rolls the session back.";

  function moveSide(next: "long" | "short") {
    setSide(next);
    (next === "long" ? longRef : shortRef).current?.focus();
  }

  return (
    <div className="terminal mx-auto w-full max-w-6xl px-4 pt-6 pb-12 text-foreground sm:px-6">
      {phase === "attached" ? (
        <a
          href="#engine-ticket"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to engine ticket
        </a>
      ) : null}

      <header className="glass rounded-[28px]">
        <div className="flex items-baseline justify-between gap-3 px-5 py-4">
          <h1 className="text-[10px] font-medium tracking-[0.2em] uppercase">Terminal</h1>
          <p className="font-mono text-[10px] text-muted-foreground">
            {phase === "checking" ? "Checking" : phase === "attached" ? "Engine attached" : "Disconnected"}
          </p>
        </div>
        <StatusRail phase={phase} />
      </header>

      <div role="status" aria-live="polite" aria-atomic="true">
        {error && !quietDisconnect ? (
          <p className="border-b border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive sm:px-4" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      {phase !== "attached" ? (
        <section className="mt-16 max-w-xl px-1" aria-labelledby="mark-sheet-title">
          <h2
            id="mark-sheet-title"
            className="font-serif text-[clamp(2.6rem,7vw,4rem)] leading-none tracking-[-0.04em]"
          >
            {phase === "checking" ? "Checking." : "Blank."}
          </h2>
          <p className="mt-5 text-[16px] leading-relaxed text-foreground/75">
            {phase === "checking"
              ? "Looking for a local engine. This is not a price."
              : "No engine is attached, so there is no mark. The sheet does not invent one."}
          </p>
        </section>
      ) : null}

      {phase === "attached" ? (
      <main className="mt-4 flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:items-start">
        <div className="glass contents overflow-hidden rounded-[28px] lg:block lg:min-w-0">
          <MarkSheet state={connected ? state : null} phase={phase} className="order-1" />
          <MarketBoard state={connected ? state : null} className="order-2" />
          <section
            className="order-4 grid border-b border-border md:grid-cols-2"
            aria-label="Portfolios"
          >
            <AccountLedger
              title="Trader"
              account={connected ? state?.trader : undefined}
              posScale={state?.risk.pos_scale ?? "1000000"}
              emptyHint={
                connected
                  ? "No example atoms yet. Looking around does not require a deposit."
                  : "No portfolio is loaded. This host is not running the engine."
              }
            />
            <AccountLedger
              title="Counterparty"
              account={connected ? state?.counterparty : undefined}
              posScale={state?.risk.pos_scale ?? "1000000"}
              emptyHint={
                connected
                  ? "This account exists only so a trade has a second portfolio. It is not external liquidity."
                  : "No counterparty is loaded. There is no order book on this host."
              }
              className="border-t border-border md:border-t-0 md:border-l"
            />
          </section>
          <SessionTape events={connected ? (state?.events ?? []) : []} className="order-5" />
          <p className="order-6 border-t border-border px-3 py-2 text-[12px] text-muted-foreground sm:px-4">
            Program, oracle, keeper, and live trades are not deployed.{" "}
            <Link href="/how-it-works" className="underline-offset-2 hover:text-foreground hover:underline">
              How the pieces fit
            </Link>
            .
          </p>
        </div>

        <Ticket
          className="order-3"
          lockId={lockId}
          lockText={lockText}
          disabled={disabled}
          deposit={deposit}
          setDeposit={setDeposit}
          seed={seed}
          setSeed={setSeed}
          lots={lots}
          setLots={setLots}
          side={side}
          moveSide={moveSide}
          longRef={longRef}
          shortRef={shortRef}
          price={price}
          setPrice={setPrice}
          funding={funding}
          setFunding={setFunding}
          markCap={connected ? state?.risk.max_price_move_bps_per_slot : undefined}
          fundingCap={connected ? state?.risk.max_abs_funding_e9_per_slot : undefined}
          onSubmit={(path, payload) => {
            if (disabled) return;
            void call(path, payload);
          }}
          withdrawAmount={connected ? (state?.trader.capital_atoms ?? "0") : "0"}
        />
      </main>
      ) : null}

      <footer className="glass mt-4 rounded-[28px] px-5 py-4 text-[12px] leading-relaxed text-muted-foreground">
        <p>
          PERC is an independent Percolator fork. Not endorsed by Anatoly Yakovenko, Solana Labs,
          or the operators of percolator.trade. This interface does not use that site&apos;s brand.
        </p>
        <p className="mt-1 font-mono text-[10px] leading-relaxed break-all">
          Engine Apache-2.0 {ENGINE}
          <span className="mx-1.5 text-foreground/30">/</span>
          Wrapper Apache-2.0 {PROGRAM}
        </p>
      </footer>
    </div>
  );
}

function StatusRail({ phase }: { phase: "checking" | "attached" | "disconnected" }) {
  const cells = [
    ["Local", phase === "checking" ? "Checking" : phase === "attached" ? "Engine" : "Idle"],
    ["Chain", "Not deployed"],
    ["Link", phase === "checking" ? "Checking" : phase === "attached" ? "Attached" : "Disconnected"],
    ["Session", phase === "attached" ? "Local writes" : "Read-only"],
  ] as const;
  return (
    <div
      className="grid grid-cols-2 border-t border-white/10 sm:grid-cols-4"
      aria-label="Connection status"
    >
      {cells.map(([key, value]) => {
        const live = phase === "attached" && (key === "Local" || key === "Link" || key === "Session");
        return (
          <div key={key} className="min-w-0 px-5 py-3">
            <p className="text-[9px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
              {key}
            </p>
            <p className={`mt-0.5 truncate font-mono text-[11px] tracking-wide ${live ? "text-primary" : "text-foreground"}`}>
              {value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function MarkSheet({
  state,
  phase,
  className = "",
}: {
  state: EngineState | null;
  phase: "checking" | "attached" | "disconnected";
  className?: string;
}) {
  const mark = state ? groupInteger(String(state.market.effective_price)) : null;
  const quiet = phase === "checking" ? "Checking." : "Blank.";
  const quietNote =
    phase === "checking"
      ? "Looking for a local engine. This is not a price."
      : "No engine is attached, so there is no mark. The sheet does not invent one.";
  return (
    <section
      aria-labelledby="mark-sheet-title"
      className={`mark-sheet relative min-h-[220px] border-b border-border sm:min-h-[280px] ${className}`}
    >
      <span aria-hidden className="absolute top-3 left-3 size-3 border-t border-l border-primary" />
      <span aria-hidden className="absolute top-3 right-3 size-3 border-t border-r border-primary" />
      <span aria-hidden className="absolute bottom-3 left-3 size-3 border-b border-l border-primary" />
      <span aria-hidden className="absolute right-3 bottom-3 size-3 border-r border-b border-primary" />
      <div className="flex items-start justify-between gap-3 px-5 pt-4 sm:px-6">
        <h2 id="mark-sheet-title" className="text-[10px] font-medium tracking-[0.2em] uppercase">
          Mark sheet
        </h2>
        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
          {mark ? "Example mark" : phase === "checking" ? "Checking" : "Blank"}
        </p>
      </div>
      <div className="flex min-h-[148px] flex-col items-center justify-center px-6 py-6 text-center sm:min-h-[168px]">
        {mark ? (
          <>
            <p className="font-mono text-[clamp(2rem,5vw,3.25rem)] leading-none tracking-[-0.04em] tabular-nums">
              {mark}
            </p>
            <span className="mt-3 h-px w-10 bg-primary" aria-hidden />
            <p className="mt-3 max-w-[34ch] text-xs leading-relaxed text-muted-foreground">
              One engine reading. This sheet does not invent candles, prints, or a history.
            </p>
          </>
        ) : (
          <>
            <p className="font-serif text-[clamp(2.1rem,6vw,3.4rem)] leading-none tracking-[-0.03em]">
              {quiet}
            </p>
            <span className="mt-3 h-px w-10 bg-primary" aria-hidden />
            <p className="mt-3 max-w-[36ch] text-xs leading-relaxed text-muted-foreground">
              {quietNote}
            </p>
          </>
        )}
      </div>
      <dl className="grid grid-cols-3 border-t border-border/80 bg-background/35">
        <SheetStat label="Slot" value={state ? String(state.market.slot_last) : "—"} />
        <SheetStat label="Source" value={state?.price_source ?? "—"} />
        <SheetStat label="Oracle" value={state?.oracle ?? "—"} />
      </dl>
    </section>
  );
}

function SheetStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 px-3 py-2 sm:px-4">
      <dt className="text-[9px] font-medium tracking-[0.16em] text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-0.5 truncate font-mono text-[11px]" title={value}>
        {value}
      </dd>
    </div>
  );
}

function MarketBoard({ state, className = "" }: { state: EngineState | null; className?: string }) {
  const risk = state?.risk;
  return (
    <section aria-labelledby="market-title" className={`border-b border-border ${className}`}>
      <div className="flex items-baseline justify-between gap-3 border-b border-border px-3 py-2 sm:px-4">
        <h2 id="market-title" className="text-[10px] font-medium tracking-[0.2em] uppercase">
          Market
        </h2>
        <p className="min-w-0 truncate text-[11px] text-muted-foreground">
          {state ? "Local atoms. Not TVL and not a book." : "No engine is attached."}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 xl:grid-cols-4">
        <Metric label="Example mark" value={state ? groupInteger(String(state.market.effective_price)) : "—"} />
        <Metric label="Target mark" value={state ? groupInteger(String(state.market.raw_oracle_target_price)) : "—"} />
        <Metric label="Vault atoms" value={state ? groupInteger(state.market.vault_atoms) : "—"} />
        <Metric label="Capital total" value={state ? groupInteger(state.market.capital_total_atoms) : "—"} />
        <Metric label="Open interest long" value={state ? groupInteger(state.market.oi_eff_long_q) : "—"} />
        <Metric label="Open interest short" value={state ? groupInteger(state.market.oi_eff_short_q) : "—"} />
        <Metric
          label="Stale long / short"
          value={state ? `${state.market.stale_accounts_long} / ${state.market.stale_accounts_short}` : "—"}
        />
        <Metric
          label="Initial / maintenance"
          value={risk ? `${risk.initial_margin_bps} / ${risk.maintenance_margin_bps} bps` : "—"}
        />
        <Metric label="Mark cap" value={risk ? `${risk.max_price_move_bps_per_slot} bps` : "—"} />
        <Metric label="Funding cap" value={risk ? `±${groupInteger(String(risk.max_abs_funding_e9_per_slot))} e9` : "—"} />
        <Metric label="Max trade" value={risk ? groupInteger(risk.max_trade_size_q) : "—"} />
        <Metric label="Wallet" value={state?.wallet ?? "—"} />
      </dl>
      <p className="border-t border-border px-3 py-2 text-[11px] leading-relaxed text-muted-foreground sm:px-4">
        {risk
          ? risk.profile
          : "Unread until an engine is attached."}
      </p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 bg-background px-3 py-2.5 sm:px-4">
      <dt className="text-[9px] font-medium tracking-[0.16em] text-muted-foreground uppercase">{label}</dt>
      <dd className="mt-1 font-mono text-[13px] leading-snug break-words tabular-nums" title={value}>
        {value}
      </dd>
    </div>
  );
}

function AccountLedger({
  title,
  account,
  posScale,
  emptyHint,
  className = "",
}: {
  title: string;
  account?: AccountView;
  posScale: string;
  emptyHint: string;
  className?: string;
}) {
  const lots = account ? lotsFromQ(account.position_q, posScale) : null;
  const position = !account
    ? "—"
    : `${account.position_side}${lots ? ` · ${lots} lots` : ""} · q ${groupInteger(account.position_q)}`;
  return (
    <section aria-labelledby={`${title}-ledger`} className={`min-w-0 ${className}`}>
      <div className="border-b border-border px-3 py-2 sm:px-4">
        <h2 id={`${title}-ledger`} className="text-[10px] font-medium tracking-[0.2em] uppercase">
          {title}
        </h2>
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{account ? account.role : emptyHint}</p>
      </div>
      <dl>
        <LedgerRow label="Capital" value={account ? groupInteger(account.capital_atoms) : "—"} />
        <LedgerRow label="PnL" value={account ? groupInteger(account.pnl_atoms) : "—"} />
        <LedgerRow label="Position" value={position} />
        <LedgerRow
          label="Leg / B-leg"
          value={
            account
              ? `${account.leg_stale ? "stale" : "fresh"} / ${account.leg_b_stale ? "b-stale" : "fresh"}`
              : "—"
          }
        />
        <LedgerRow
          label="Certificate"
          value={
            account
              ? account.cert_valid
                ? `valid · equity ${groupInteger(account.cert_equity)}`
                : "not valid until refresh"
              : "—"
          }
        />
        <LedgerRow
          label="Initial / maint. req"
          value={
            account
              ? `${groupInteger(account.cert_initial_req)} / ${groupInteger(account.cert_maintenance_req)}`
              : "—"
          }
        />
        <LedgerRow
          label="Liq. deficit"
          value={account ? groupInteger(account.cert_liq_deficit) : "—"}
        />
        <LedgerRow
          label="Funding paid L / S"
          value={
            account
              ? `${groupInteger(account.funding_long_paid)} / ${groupInteger(account.funding_short_paid)}`
              : "—"
          }
        />
        <LedgerRow
          label="Funding recv. L / S"
          value={
            account
              ? `${groupInteger(account.funding_long_received)} / ${groupInteger(account.funding_short_received)}`
              : "—"
          }
        />
      </dl>
    </section>
  );
}

function LedgerRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border px-3 py-1.5 last:border-b-0 sm:px-4">
      <dt className="shrink-0 text-[10px] tracking-[0.12em] text-muted-foreground uppercase">{label}</dt>
      <dd className="min-w-0 text-right font-mono text-[12px] leading-snug break-words tabular-nums">{value}</dd>
    </div>
  );
}

function SessionTape({ events, className = "" }: { events: string[]; className?: string }) {
  return (
    <section aria-labelledby="tape-title" className={className}>
      <div className="flex items-baseline justify-between gap-3 px-3 py-2 sm:px-4">
        <h2 id="tape-title" className="text-[10px] font-medium tracking-[0.2em] uppercase">
          Session tape
        </h2>
        <p className="text-[11px] text-muted-foreground">Calls this process made. Not volume.</p>
      </div>
      <div className="border-t border-border">
        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-b border-border px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] text-muted-foreground uppercase sm:px-4">
          <span>#</span>
          <span>Call</span>
        </div>
        {events.length === 0 ? (
          <p className="grid grid-cols-[2.5rem_minmax(0,1fr)] px-3 py-3 font-mono text-[12px] sm:px-4">
            <span className="text-muted-foreground">—</span>
            <span className="text-muted-foreground">No engine calls yet.</span>
          </p>
        ) : (
          <ol>
            {events.map((event, index) => (
              <li
                key={`${index}-${event}`}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] border-b border-border px-3 py-2 font-mono text-[12px] leading-snug last:border-b-0 sm:px-4"
              >
                <span className="text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <span className="break-words">{event}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function Ticket({
  className = "",
  lockId,
  lockText,
  disabled,
  deposit,
  setDeposit,
  seed,
  setSeed,
  lots,
  setLots,
  side,
  moveSide,
  longRef,
  shortRef,
  price,
  setPrice,
  funding,
  setFunding,
  markCap,
  fundingCap,
  onSubmit,
  withdrawAmount,
}: {
  className?: string;
  lockId: string;
  lockText: string;
  disabled: boolean;
  deposit: string;
  setDeposit: (value: string) => void;
  seed: string;
  setSeed: (value: string) => void;
  lots: string;
  setLots: (value: string) => void;
  side: "long" | "short";
  moveSide: (next: "long" | "short") => void;
  longRef: React.RefObject<HTMLButtonElement | null>;
  shortRef: React.RefObject<HTMLButtonElement | null>;
  price: string;
  setPrice: (value: string) => void;
  funding: string;
  setFunding: (value: string) => void;
  markCap: number | undefined;
  fundingCap: number | undefined;
  onSubmit: (path: string, payload?: unknown) => void;
  withdrawAmount: string;
}) {
  return (
    <aside
      id="engine-ticket"
      aria-labelledby="ticket-title"
      className={`glass rounded-[28px] lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:self-start lg:overflow-y-auto ${className}`}
    >
      <div className="flex items-baseline justify-between gap-3 border-b border-border px-3 py-2.5 sm:px-4">
        <h2 id="ticket-title" className="text-[10px] font-medium tracking-[0.2em] uppercase">
          Engine ticket
        </h2>
        <p className="font-mono text-[10px] tracking-[0.14em] text-primary uppercase">Local only</p>
      </div>
      <p id={lockId} className="border-b border-border px-3 py-2.5 text-[12px] leading-relaxed text-muted-foreground sm:px-4">
        {lockText}
      </p>

      <form
        className="flex flex-col gap-3 border-b border-border px-3 py-3 sm:px-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit("/api/engine/v1/deposit", { who: "trader", amount: deposit });
        }}
      >
        <Field id="deposit" label="Create trader atoms" value={deposit} onChange={setDeposit} />
        <Action type="submit" disabled={disabled} describedBy={lockId}>
          Deposit example atoms
        </Action>
      </form>

      <form
        className="flex flex-col gap-3 border-b border-border px-3 py-3 sm:px-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit("/api/engine/v1/deposit", { who: "counterparty", amount: seed });
        }}
      >
        <Field id="seed" label="Seed example counterparty" value={seed} onChange={setSeed} />
        <Action type="submit" disabled={disabled} describedBy={lockId} variant="outline">
          Deposit counterparty atoms
        </Action>
      </form>

      <form
        className="flex flex-col gap-3 border-b border-border px-3 py-3 sm:px-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit("/api/engine/v1/open", { side, lots });
        }}
      >
        <div className="flex flex-col gap-1.5">
          <span id="side-label" className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
            Side
          </span>
          <div
            role="radiogroup"
            aria-labelledby="side-label"
            className="grid grid-cols-2 overflow-hidden rounded-full border border-white/15"
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                moveSide("short");
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                moveSide("long");
              }
            }}
          >
            <SideButton
              pressed={side === "long"}
              buttonRef={longRef}
              onSelect={() => moveSide("long")}
            >
              Long
            </SideButton>
            <SideButton
              pressed={side === "short"}
              buttonRef={shortRef}
              onSelect={() => moveSide("short")}
            >
              Short
            </SideButton>
          </div>
        </div>
        <Field id="lots" label="Lots" value={lots} onChange={setLots} />
        <Action type="submit" disabled={disabled} describedBy={lockId}>
          Open against counterparty
        </Action>
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Action
            type="button"
            disabled={disabled}
            describedBy={lockId}
            variant="outline"
            onClick={() => onSubmit("/api/engine/v1/close")}
          >
            Close position
          </Action>
          <Action
            type="button"
            disabled={disabled}
            describedBy={lockId}
            variant="outline"
            onClick={() =>
              onSubmit("/api/engine/v1/withdraw", { who: "trader", amount: withdrawAmount })
            }
          >
            Withdraw capital
          </Action>
        </div>
      </form>

      <form
        className="flex flex-col gap-3 border-b border-border px-3 py-3 sm:px-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit("/api/engine/v1/crank", { price, funding_rate_e9: funding });
        }}
      >
        <Field id="price" label="Next example mark" value={price} onChange={setPrice} />
        <Field id="funding" label="Funding rate e9" value={funding} onChange={setFunding} />
        <Action type="submit" disabled={disabled} describedBy={lockId}>
          Crank one slot
        </Action>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          One crank may move the mark at most {markCap === undefined ? "—" : `${markCap} bps`} and
          funding at most {fundingCap === undefined ? "—" : `±${fundingCap} e9`}. A larger jump is
          rejected. Refresh settles accrued funding and price PnL onto the portfolios.
        </p>
        <Action
          type="button"
          disabled={disabled}
          describedBy={lockId}
          variant="outline"
          onClick={() => onSubmit("/api/engine/v1/refresh")}
        >
          Refresh / settle accounts
        </Action>
        <div className="grid grid-cols-1 gap-2 min-[420px]:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <Action
            type="button"
            disabled={disabled}
            describedBy={lockId}
            variant="outline"
            className="text-destructive"
            onClick={() => onSubmit("/api/engine/v1/liquidate", { who: "trader" })}
          >
            Liquidate trader
          </Action>
          <Action
            type="button"
            disabled={disabled}
            describedBy={lockId}
            variant="outline"
            className="text-destructive"
            onClick={() => onSubmit("/api/engine/v1/liquidate", { who: "counterparty" })}
          >
            Liquidate counterparty
          </Action>
        </div>
      </form>

      <div className="flex flex-col gap-2 px-3 py-3 sm:px-4">
        <Action
          type="button"
          disabled={disabled}
          describedBy={lockId}
          variant="outline"
          onClick={() => onSubmit("/api/engine/v1/examples/liquidation-setup")}
        >
          Arm liquidation example
        </Action>
        <Action
          type="button"
          disabled={disabled}
          describedBy={lockId}
          variant="ghost"
          onClick={() => onSubmit("/api/engine/v1/reset")}
        >
          Reset session
        </Action>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Arming reloads the upstream undercollateralized-short fixture and stops before
          liquidation. The next liquidate call is the engine step. It does not invent a fill.
        </p>
      </div>
    </aside>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-[10px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        className="h-11 rounded-2xl border-white/15 bg-white/6 font-mono text-sm tabular-nums"
      />
    </div>
  );
}

function Action({
  children,
  describedBy,
  className = "",
  variant = "default",
  ...props
}: React.ComponentProps<typeof Button> & { describedBy: string }) {
  const locked = Boolean(props.disabled);
  return (
    <Button
      variant={locked ? "outline" : variant}
      aria-describedby={describedBy}
      className={`h-11 w-full rounded-full px-3 text-[13px] font-medium ${
        locked ? "border-border text-muted-foreground" : className
      }`}
      {...props}
    >
      {children}
    </Button>
  );
}

function SideButton({
  pressed,
  onSelect,
  buttonRef,
  children,
}: {
  pressed: boolean;
  onSelect: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  children: string;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="radio"
      aria-checked={pressed}
      tabIndex={pressed ? 0 : -1}
      onClick={onSelect}
      className={`h-11 text-[13px] font-medium outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring ${
        pressed ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
