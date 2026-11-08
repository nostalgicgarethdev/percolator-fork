export type AccountView = {
  role: string;
  owner_hex: string;
  capital_atoms: string;
  pnl_atoms: string;
  position_q: string;
  position_side: string;
  leg_active: boolean;
  leg_stale: boolean;
  leg_b_stale: boolean;
  funding_long_paid: string;
  funding_long_received: string;
  funding_short_paid: string;
  funding_short_received: string;
  cert_valid: boolean;
  cert_equity: string;
  cert_initial_req: string;
  cert_maintenance_req: string;
  cert_liq_deficit: string;
};

export type EngineState = {
  product: string;
  mode: string;
  cluster: string;
  price_source: string;
  oracle: string;
  keeper: string;
  wallet: string;
  program_deployed: boolean;
  collateral: {
    unit: string;
    spl_decimals: number | null;
    note: string;
  };
  risk: {
    initial_margin_bps: number;
    maintenance_margin_bps: number;
    max_trading_fee_bps: number;
    liquidation_fee_bps: number;
    max_price_move_bps_per_slot: number;
    max_abs_funding_e9_per_slot: number;
    max_accrual_dt_slots: number;
    max_trade_size_q: string;
    pos_scale: string;
    profile: string;
  };
  market: {
    asset_index: number;
    slot_last: number;
    header_slot: number;
    effective_price: number;
    raw_oracle_target_price: number;
    oi_eff_long_q: string;
    oi_eff_short_q: string;
    vault_atoms: string;
    capital_total_atoms: string;
    stale_accounts_long: number;
    stale_accounts_short: number;
  };
  trader: AccountView;
  counterparty: AccountView;
  events: string[];
  blockers: string[];
};

export function groupInteger(value: string) {
  const negative = value.startsWith("-");
  const digits = negative ? value.slice(1) : value;
  if (!/^\d+$/.test(digits)) return value;
  const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return negative ? `-${grouped}` : grouped;
}

export function lotsFromQ(positionQ: string, posScale: string) {
  if (!/^-?\d+$/.test(positionQ) || !/^\d+$/.test(posScale) || posScale === "0") {
    return null;
  }
  const q = BigInt(positionQ);
  const scale = BigInt(posScale);
  if (q % scale !== BigInt(0)) return null;
  return (q / scale).toString();
}
