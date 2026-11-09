import type { AccountView, EngineState } from "@/lib/engine";

const MARK = BigInt(1000000);
const POS_SCALE = BigInt(1000000);
const MAX_TRADE_Q = BigInt(100000000000000);
const MAX_MOVE_BPS = BigInt(9000);
const MAX_FUNDING = BigInt(10000);

type Book = {
  price: bigint;
  slot: bigint;
  traderCap: bigint;
  cpCap: bigint;
  traderPnl: bigint;
  cpPnl: bigint;
  lots: bigint;
  longPaid: bigint;
  longReceived: bigint;
  shortPaid: bigint;
  shortReceived: bigint;
  cpLongPaid: bigint;
  cpLongReceived: bigint;
  cpShortPaid: bigint;
  cpShortReceived: bigint;
  events: string[];
};

function account(
  role: string,
  owner: string,
  capital: bigint,
  pnl: bigint,
  lots: bigint,
  funding: [bigint, bigint, bigint, bigint],
): AccountView {
  const q = lots * POS_SCALE;
  const side = lots > BigInt(0) ? "long" : lots < BigInt(0) ? "short" : "flat";
  return {
    role,
    owner_hex: owner,
    capital_atoms: capital.toString(),
    pnl_atoms: pnl.toString(),
    position_q: q.toString(),
    position_side: side,
    leg_active: lots !== BigInt(0),
    leg_stale: false,
    leg_b_stale: false,
    funding_long_paid: funding[0].toString(),
    funding_long_received: funding[1].toString(),
    funding_short_paid: funding[2].toString(),
    funding_short_received: funding[3].toString(),
    cert_valid: false,
    cert_equity: capital.toString(),
    cert_initial_req: "0",
    cert_maintenance_req: "0",
    cert_liq_deficit: "0",
  };
}

function publish(book: Book): EngineState {
  const q = book.lots < BigInt(0) ? -book.lots : book.lots;
  const size = (q * POS_SCALE).toString();
  return {
    product: "Percolator Fork",
    mode: "example-session",
    cluster: "this page",
    price_source: "example session",
    oracle: "none",
    keeper: "the crank on this page",
    wallet: "disabled",
    program_deployed: false,
    collateral: {
      unit: "example-atom",
      spl_decimals: null,
      note: "Example atoms live in this page. They are not a token and they cannot leave the browser.",
    },
    risk: {
      initial_margin_bps: 0,
      maintenance_margin_bps: 0,
      max_trading_fee_bps: 0,
      liquidation_fee_bps: 0,
      max_price_move_bps_per_slot: Number(MAX_MOVE_BPS),
      max_abs_funding_e9_per_slot: Number(MAX_FUNDING),
      max_accrual_dt_slots: 1,
      max_trade_size_q: MAX_TRADE_Q.toString(),
      pos_scale: POS_SCALE.toString(),
      profile: "example session of the slab rule, not the v16 process",
    },
    market: {
      asset_index: 0,
      slot_last: Number(book.slot),
      header_slot: Number(book.slot),
      effective_price: Number(book.price),
      raw_oracle_target_price: Number(book.price),
      oi_eff_long_q: book.lots === BigInt(0) ? "0" : size,
      oi_eff_short_q: book.lots === BigInt(0) ? "0" : size,
      vault_atoms: (book.traderCap + book.cpCap).toString(),
      capital_total_atoms: (book.traderCap + book.cpCap).toString(),
      stale_accounts_long: 0,
      stale_accounts_short: 0,
    },
    trader: account("trader", "04".repeat(32), book.traderCap, book.traderPnl, book.lots, [
      book.longPaid,
      book.longReceived,
      book.shortPaid,
      book.shortReceived,
    ]),
    counterparty: account(
      "example-counterparty",
      "05".repeat(32),
      book.cpCap,
      book.cpPnl,
      -book.lots,
      [book.cpLongPaid, book.cpLongReceived, book.cpShortPaid, book.cpShortReceived],
    ),
    events: book.events,
    blockers: [
      "Example session in this page. The v16 engine still runs only on your machine.",
      "No program, oracle, or keeper is deployed.",
    ],
  };
}

function blank(): Book {
  return {
    price: MARK,
    slot: BigInt(1),
    traderCap: BigInt(0),
    cpCap: BigInt(0),
    traderPnl: BigInt(0),
    cpPnl: BigInt(0),
    lots: BigInt(0),
    longPaid: BigInt(0),
    longReceived: BigInt(0),
    shortPaid: BigInt(0),
    shortReceived: BigInt(0),
    cpLongPaid: BigInt(0),
    cpLongReceived: BigInt(0),
    cpShortPaid: BigInt(0),
    cpShortReceived: BigInt(0),
    events: ["example session opened at mark 1000000 with no collateral"],
  };
}

function read(state: EngineState): Book {
  const lots = BigInt(state.trader.position_q) / POS_SCALE;
  return {
    price: BigInt(state.market.effective_price),
    slot: BigInt(state.market.slot_last),
    traderCap: BigInt(state.trader.capital_atoms),
    cpCap: BigInt(state.counterparty.capital_atoms),
    traderPnl: BigInt(state.trader.pnl_atoms),
    cpPnl: BigInt(state.counterparty.pnl_atoms),
    lots,
    longPaid: BigInt(state.trader.funding_long_paid),
    longReceived: BigInt(state.trader.funding_long_received),
    shortPaid: BigInt(state.trader.funding_short_paid),
    shortReceived: BigInt(state.trader.funding_short_received),
    cpLongPaid: BigInt(state.counterparty.funding_long_paid),
    cpLongReceived: BigInt(state.counterparty.funding_long_received),
    cpShortPaid: BigInt(state.counterparty.funding_short_paid),
    cpShortReceived: BigInt(state.counterparty.funding_short_received),
    events: state.events.slice(),
  };
}

function note(book: Book, text: string) {
  book.events.push(text);
  if (book.events.length > 40) book.events.splice(0, book.events.length - 40);
}

function pay(book: Book, traderWins: bigint) {
  if (traderWins === BigInt(0)) return "flat";
  if (traderWins > BigInt(0)) {
    const paid = traderWins < book.cpCap ? traderWins : book.cpCap;
    book.cpCap -= paid;
    book.traderCap += paid;
    book.traderPnl += paid;
    book.cpPnl -= paid;
    const cut = traderWins - paid;
    return cut === BigInt(0) ? `paid ${paid}` : `paid ${paid}, cut ${cut}`;
  }
  const owed = -traderWins;
  const paid = owed < book.traderCap ? owed : book.traderCap;
  book.traderCap -= paid;
  book.cpCap += paid;
  book.traderPnl -= paid;
  book.cpPnl += paid;
  const cut = owed - paid;
  return cut === BigInt(0) ? `paid ${paid}` : `paid ${paid}, cut ${cut}`;
}

function integer(value: unknown, label: string) {
  const text = String(value ?? "").trim();
  if (!/^-?\d+$/.test(text)) throw new Error(`expected an integer ${label}`);
  return BigInt(text);
}

export function openExampleSession(): EngineState {
  return publish(blank());
}

export function applyExample(
  state: EngineState,
  path: string,
  payload?: Record<string, unknown>,
): { state: EngineState; error?: string } {
  const book = read(state);
  const route = path.replace(/^\/api\/engine/, "");
  try {
    if (route === "/v1/reset") {
      return { state: publish(blank()) };
    }
    if (route === "/v1/deposit") {
      const who = String(payload?.who ?? "");
      const amount = integer(payload?.amount, "amount");
      if (amount <= BigInt(0)) throw new Error("deposit amount must be greater than zero");
      if (who === "trader") book.traderCap += amount;
      else if (who === "counterparty") book.cpCap += amount;
      else throw new Error("who must be trader or counterparty");
      note(book, `deposited ${amount} example atoms into ${who}`);
    } else if (route === "/v1/withdraw") {
      const who = String(payload?.who ?? "");
      const amount = integer(payload?.amount, "amount");
      if (amount <= BigInt(0)) throw new Error("withdraw amount must be greater than zero");
      if (who === "trader") {
        if (amount > book.traderCap) throw new Error("withdraw is larger than trader capital");
        book.traderCap -= amount;
      } else if (who === "counterparty") {
        if (amount > book.cpCap) throw new Error("withdraw is larger than counterparty capital");
        book.cpCap -= amount;
      } else throw new Error("who must be trader or counterparty");
      note(book, `withdrew ${amount} example atoms from ${who}`);
    } else if (route === "/v1/open") {
      const side = String(payload?.side ?? "");
      const lots = integer(payload?.lots, "lots");
      if (lots <= BigInt(0)) throw new Error("size must be at least one lot");
      if (lots * POS_SCALE > MAX_TRADE_Q) throw new Error("size exceeds the example session cap");
      if (book.lots !== BigInt(0)) throw new Error("close the open position before opening another");
      if (book.traderCap === BigInt(0) || book.cpCap === BigInt(0)) {
        throw new Error("both sides need example atoms before an open");
      }
      if (side !== "long" && side !== "short") throw new Error("side must be long or short");
      book.lots = side === "long" ? lots : -lots;
      note(book, `opened ${side} ${lots} lot(s) at example mark ${book.price}`);
    } else if (route === "/v1/close") {
      if (book.lots === BigInt(0)) throw new Error("trader has no open position to close");
      const closed = book.lots;
      book.lots = BigInt(0);
      note(book, `closed ${closed} lot(s) at example mark ${book.price}`);
    } else if (route === "/v1/crank") {
      const next = integer(payload?.price, "price");
      const funding = integer(payload?.funding_rate_e9, "funding");
      if (next <= BigInt(0)) throw new Error("example mark must be non-zero");
      if (funding > MAX_FUNDING || funding < -MAX_FUNDING) {
        throw new Error(`funding stays inside ±${MAX_FUNDING} e9`);
      }
      const span = book.price > next ? book.price - next : next - book.price;
      const bps = (span * BigInt(10000)) / book.price;
      if (bps > MAX_MOVE_BPS) {
        throw new Error(`one crank may move the mark at most ${MAX_MOVE_BPS} bps`);
      }
      const raw = book.lots * (next - book.price);
      const settled = pay(book, raw);
      let fundingNote = "funding 0";
      if (book.lots !== BigInt(0) && funding !== BigInt(0)) {
        const size = book.lots < BigInt(0) ? -book.lots : book.lots;
        const wanted = (size * (funding < BigInt(0) ? -funding : funding)) / BigInt(1000);
        const longPays = funding > BigInt(0);
        const traderIsLong = book.lots > BigInt(0);
        const traderPays = longPays === traderIsLong;
        const owed = traderPays ? wanted : -wanted;
        const moved = pay(book, -owed);
        if (traderIsLong) {
          if (longPays) {
            book.longPaid += wanted;
            book.cpShortReceived += wanted;
          } else {
            book.longReceived += wanted;
            book.cpShortPaid += wanted;
          }
        } else if (longPays) {
          book.shortReceived += wanted;
          book.cpLongPaid += wanted;
        } else {
          book.shortPaid += wanted;
          book.cpLongReceived += wanted;
        }
        fundingNote = `funding ${funding} e9, ${moved}`;
      }
      book.price = next;
      book.slot += BigInt(1);
      note(book, `cranked to mark ${next}. pnl ${settled}. ${fundingNote}`);
    } else if (route === "/v1/refresh") {
      note(book, `refreshed. trader capital ${book.traderCap}, counterparty capital ${book.cpCap}`);
    } else if (route === "/v1/liquidate") {
      const who = String(payload?.who ?? "");
      const trader = who === "trader";
      const other = who === "counterparty";
      if (!trader && !other) throw new Error("who must be trader or counterparty");
      const capital = trader ? book.traderCap : book.cpCap;
      if (book.lots === BigInt(0)) throw new Error("there is no position to liquidate");
      if (capital !== BigInt(0)) throw new Error("capital remains, so this example session will not liquidate it");
      book.lots = BigInt(0);
      note(book, `flattened ${who}. unpaid pnl stays cut`);
    } else if (route === "/v1/examples/liquidation-setup") {
      throw new Error("crank a position until one side has no capital left, then liquidate that side");
    } else {
      throw new Error(`unknown path ${route}`);
    }
    return { state: publish(book) };
  } catch (error) {
    return {
      state: publish(book),
      error: error instanceof Error ? error.message : "the example session rejected the call",
    };
  }
}
