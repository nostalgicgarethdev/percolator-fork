//! In-process session over the vendored Percolator v16 risk engine.
//!
//! Collateral here is an engine atom, not an SPL token. Prices are example
//! marks passed into the engine's accrual function. Nothing in this crate
//! talks to a Solana cluster, a keeper host, or an oracle network.

use std::fmt::Write as _;

use percolator::{
    active_bitmap_is_empty, EngineAssetSlotV16Account, LiquidationOutcomeV16,
    LiquidationRequestV16, Market, MarketGroupV16HeaderAccount, MarketGroupV16ViewMut,
    PortfolioAccountV16Account, PortfolioLegV16, PortfolioV16ViewMut, ProvenanceHeaderV16,
    ProvenanceHeaderV16Account,     TradeRequestV16, V16Config, V16PodU64, POS_SCALE, MAX_TRADE_SIZE_Q,
};
use serde::Serialize;

pub const EXAMPLE_MARK_PRICE: u64 = 1_000_000;
pub const MAX_FUNDING_RATE_E9: i128 = 10_000;
pub const MAX_MARK_MOVE_BPS: u64 = 9_000;
const TRADER_SEED: u8 = 4;
const COUNTERPARTY_SEED: u8 = 5;

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct EngineSession {
    header: MarketGroupV16HeaderAccount,
    markets: Vec<Market<u64>>,
    trader: PortfolioAccountV16Account,
    counterparty: PortfolioAccountV16Account,
    events: Vec<String>,
}

#[derive(Clone, Debug, Serialize)]
pub struct PublicState {
    pub product: &'static str,
    pub mode: &'static str,
    pub cluster: &'static str,
    pub price_source: &'static str,
    pub oracle: &'static str,
    pub keeper: &'static str,
    pub wallet: &'static str,
    pub program_deployed: bool,
    pub collateral: CollateralDesc,
    pub risk: RiskDesc,
    pub market: MarketDesc,
    pub trader: AccountDesc,
    pub counterparty: AccountDesc,
    pub events: Vec<String>,
    pub blockers: Vec<&'static str>,
}

#[derive(Clone, Debug, Serialize)]
pub struct CollateralDesc {
    pub unit: &'static str,
    pub spl_decimals: Option<u8>,
    pub note: &'static str,
}

#[derive(Clone, Debug, Serialize)]
pub struct RiskDesc {
    pub initial_margin_bps: u64,
    pub maintenance_margin_bps: u64,
    pub max_trading_fee_bps: u64,
    pub liquidation_fee_bps: u64,
    pub max_price_move_bps_per_slot: u64,
    pub max_abs_funding_e9_per_slot: u64,
    pub max_accrual_dt_slots: u64,
    pub max_trade_size_q: String,
    pub pos_scale: String,
    pub profile: &'static str,
}

#[derive(Clone, Debug, Serialize)]
pub struct MarketDesc {
    pub asset_index: u16,
    pub slot_last: u64,
    pub header_slot: u64,
    pub effective_price: u64,
    pub raw_oracle_target_price: u64,
    pub oi_eff_long_q: String,
    pub oi_eff_short_q: String,
    pub vault_atoms: String,
    pub capital_total_atoms: String,
    pub stale_accounts_long: u64,
    pub stale_accounts_short: u64,
}

#[derive(Clone, Debug, Serialize)]
pub struct AccountDesc {
    pub role: &'static str,
    pub owner_hex: String,
    pub capital_atoms: String,
    pub pnl_atoms: String,
    pub position_q: String,
    pub position_side: String,
    pub leg_active: bool,
    pub leg_stale: bool,
    pub leg_b_stale: bool,
    pub funding_long_paid: String,
    pub funding_long_received: String,
    pub funding_short_paid: String,
    pub funding_short_received: String,
    pub cert_valid: bool,
    pub cert_equity: String,
    pub cert_initial_req: String,
    pub cert_maintenance_req: String,
    pub cert_liq_deficit: String,
}

#[derive(Clone, Debug, Serialize)]
pub struct LifecycleStep {
    pub name: &'static str,
    pub ok: bool,
    pub detail: String,
}

#[derive(Clone, Debug, Serialize)]
pub struct LifecycleReport {
    pub engine_revision: &'static str,
    pub program_revision: &'static str,
    pub steps: Vec<LifecycleStep>,
    pub final_state: PublicState,
}

impl EngineSession {
    pub fn new() -> Result<Self, String> {
        let market_group_id = [9u8; 32];
        let mut cfg = V16Config::public_user_fund_with_market_slots(1, 1, 0, 10);
        cfg.max_abs_funding_e9_per_slot = MAX_FUNDING_RATE_E9 as u64;
        cfg.max_price_move_bps_per_slot = MAX_MARK_MOVE_BPS;
        cfg.validate_public_user_fund()
            .map_err(|err| format!("public user fund config rejected: {err:?}"))?;
        let mut header =
            MarketGroupV16HeaderAccount::new_dynamic(market_group_id, cfg, 1, 0)
                .map_err(|err| format!("market header rejected: {err:?}"))?;
        let mut markets = vec![Market::new(0u64, EngineAssetSlotV16Account::default())];
        header
            .activate_empty_asset_slot_not_atomic(
                0,
                &mut markets[0].engine,
                EXAMPLE_MARK_PRICE,
                1,
            )
            .map_err(|err| format!("asset activation rejected: {err:?}"))?;
        {
            let view = MarketGroupV16ViewMut::new(&mut header, &mut markets);
            view.validate_shape()
                .map_err(|err| format!("fresh market failed shape check: {err:?}"))?;
        }
        let mut session = Self {
            header,
            markets,
            trader: account_fixture(market_group_id, TRADER_SEED),
            counterparty: account_fixture(market_group_id, COUNTERPARTY_SEED),
            events: Vec::new(),
        };
        session.push_event("session opened on the v16 engine with an example mark and no collateral");
        session.validate_accounts()?;
        Ok(session)
    }

    pub fn deposit(&mut self, who: Who, amount: u128) -> Result<PublicState, String> {
        if amount == 0 {
            return Err("deposit amount must be greater than zero".into());
        }
        self.transact(|session| {
            {
                let mut market =
                    MarketGroupV16ViewMut::new(&mut session.header, &mut session.markets);
                let result = match who {
                    Who::Trader => {
                        let mut account = PortfolioV16ViewMut::new(&mut session.trader);
                        market.deposit_not_atomic(&mut account, amount)
                    }
                    Who::Counterparty => {
                        let mut account = PortfolioV16ViewMut::new(&mut session.counterparty);
                        market.deposit_not_atomic(&mut account, amount)
                    }
                };
                result.map_err(|err| format!("engine deposit rejected: {err:?}"))?;
            }
            session.push_event(&format!(
                "deposited {amount} example atoms into {}",
                who.label()
            ));
            Ok(())
        })
    }

    pub fn withdraw(&mut self, who: Who, amount: u128) -> Result<PublicState, String> {
        if amount == 0 {
            return Err("withdraw amount must be greater than zero".into());
        }
        self.transact(|session| {
            {
                let mut market =
                    MarketGroupV16ViewMut::new(&mut session.header, &mut session.markets);
                let result = match who {
                    Who::Trader => {
                        let mut account = PortfolioV16ViewMut::new(&mut session.trader);
                        market.withdraw_not_atomic(&mut account, amount)
                    }
                    Who::Counterparty => {
                        let mut account = PortfolioV16ViewMut::new(&mut session.counterparty);
                        market.withdraw_not_atomic(&mut account, amount)
                    }
                };
                result.map_err(|err| format!("engine withdraw rejected: {err:?}"))?;
            }
            session.push_event(&format!(
                "withdrew {amount} example atoms from {}",
                who.label()
            ));
            Ok(())
        })
    }

    pub fn open(&mut self, side: SideReq, lots: u128) -> Result<PublicState, String> {
        if lots == 0 {
            return Err("size must be at least one lot".into());
        }
        let size_q = lots
            .checked_mul(POS_SCALE)
            .ok_or_else(|| "size overflowed while converting lots".to_string())?;
        if size_q > MAX_TRADE_SIZE_Q {
            return Err(format!(
                "size {size_q} exceeds engine MAX_TRADE_SIZE_Q {MAX_TRADE_SIZE_Q}"
            ));
        }
        let signed = match side {
            SideReq::Long => i128::try_from(size_q).map_err(|_| "size does not fit i128")?,
            SideReq::Short => -i128::try_from(size_q).map_err(|_| "size does not fit i128")?,
        };
        let price = self.effective_price()?;
        self.transact(|session| {
            {
                let mut market =
                    MarketGroupV16ViewMut::new(&mut session.header, &mut session.markets);
                let mut trader = PortfolioV16ViewMut::new(&mut session.trader);
                let mut counterparty = PortfolioV16ViewMut::new(&mut session.counterparty);
                market
                    .execute_trade_with_fee_loss_stale_scoped_not_atomic(
                        &mut trader,
                        &mut counterparty,
                        TradeRequestV16 {
                            asset_index: 0,
                            size_q: signed,
                            exec_price: price,
                            fee_bps: 0,
                        },
                    )
                    .map_err(|err| format!("engine trade rejected: {err:?}"))?;
            }
            session.push_event(&format!(
                "opened {} {lots} lot(s) at example mark {price}",
                side.label()
            ));
            Ok(())
        })
    }

    pub fn close(&mut self) -> Result<PublicState, String> {
        let position = self.trader_position()?;
        if position == 0 {
            return Err("trader has no open position to close".into());
        }
        let price = self.effective_price()?;
        self.transact(|session| {
            {
                let mut market =
                    MarketGroupV16ViewMut::new(&mut session.header, &mut session.markets);
                let mut trader = PortfolioV16ViewMut::new(&mut session.trader);
                let mut counterparty = PortfolioV16ViewMut::new(&mut session.counterparty);
                market
                    .execute_trade_with_fee_loss_stale_scoped_not_atomic(
                        &mut trader,
                        &mut counterparty,
                        TradeRequestV16 {
                            asset_index: 0,
                            size_q: -position,
                            exec_price: price,
                            fee_bps: 0,
                        },
                    )
                    .map_err(|err| format!("engine close rejected: {err:?}"))?;
            }
            session.push_event(&format!(
                "submitted an offsetting trade of {position} at example mark {price}"
            ));
            Ok(())
        })
    }

    pub fn crank(&mut self, price: u64, funding_rate_e9: i128) -> Result<PublicState, String> {
        if price == 0 {
            return Err("example mark must be non-zero".into());
        }
        let slot_last = self.asset_slot_last()?;
        let now_slot = slot_last
            .checked_add(1)
            .ok_or_else(|| "slot clock overflow".to_string())?;
        self.transact(|session| {
            {
                let mut market =
                    MarketGroupV16ViewMut::new(&mut session.header, &mut session.markets);
                market
                    .accrue_asset_to_not_atomic(0, now_slot, price, funding_rate_e9, true)
                    .map_err(|err| {
                        format!(
                            "engine crank rejected ({err:?}). One crank may move the mark at most {MAX_MARK_MOVE_BPS} bps and funding at most ±{MAX_FUNDING_RATE_E9} e9."
                        )
                    })?;
                market.markets[0].engine.asset.raw_oracle_target_price = V16PodU64::new(price);
            }
            session.push_event(&format!(
                "cranked asset 0 to slot {now_slot} at example mark {price}, funding {funding_rate_e9} e9"
            ));
            Ok(())
        })
    }

    pub fn refresh(&mut self) -> Result<PublicState, String> {
        self.transact(|session| {
            let trader_equity;
            let counterparty_equity;
            {
                let mut market =
                    MarketGroupV16ViewMut::new(&mut session.header, &mut session.markets);
                let mut trader = PortfolioV16ViewMut::new(&mut session.trader);
                let trader_cert = market
                    .full_account_refresh_not_atomic(&mut trader)
                    .map_err(|err| format!("trader settlement rejected: {err:?}"))?;
                drop(trader);
                let mut counterparty = PortfolioV16ViewMut::new(&mut session.counterparty);
                let counterparty_cert = market
                    .full_account_refresh_not_atomic(&mut counterparty)
                    .map_err(|err| format!("counterparty settlement rejected: {err:?}"))?;
                trader_equity = trader_cert.certified_equity;
                counterparty_equity = counterparty_cert.certified_equity;
            }
            session.push_event(&format!(
                "refreshed both portfolios (trader equity {trader_equity}, counterparty equity {counterparty_equity})"
            ));
            Ok(())
        })
    }

    pub fn liquidate(&mut self, who: Who) -> Result<(PublicState, LiquidationOutcomeV16), String> {
        let mut outcome = None;
        let state = self.transact(|session| {
            let result = {
                let mut market =
                    MarketGroupV16ViewMut::new(&mut session.header, &mut session.markets);
                match who {
                    Who::Trader => {
                        let mut account = PortfolioV16ViewMut::new(&mut session.trader);
                        market.liquidate_account_not_atomic(
                            &mut account,
                            LiquidationRequestV16 { asset_index: 0 },
                        )
                    }
                    Who::Counterparty => {
                        let mut account = PortfolioV16ViewMut::new(&mut session.counterparty);
                        market.liquidate_account_not_atomic(
                            &mut account,
                            LiquidationRequestV16 { asset_index: 0 },
                        )
                    }
                }
            };
            match result {
                Ok(got) => {
                    session.push_event(&format!(
                        "liquidated {} closed_q={} insurance_used={} fee_charged={}",
                        who.label(),
                        got.closed_q,
                        got.insurance_used,
                        got.fee_charged
                    ));
                    outcome = Some(got);
                    Ok(())
                }
                Err(err) => Err(format!(
                    "engine liquidation rejected: {err:?}. A healthy account is not closed by this call."
                )),
            }
        })?;
        Ok((
            state,
            outcome.ok_or_else(|| "liquidation produced no outcome".to_string())?,
        ))
    }

    /// Rebuilds the upstream undercollateralized-short fixture and stops
    /// before liquidation, so the next `liquidate` call is the real engine step.
    pub fn prepare_liquidation_example(&mut self) -> Result<PublicState, String> {
        *self = Self::new()?;
        const PRICE: u64 = EXAMPLE_MARK_PRICE;
        const OPEN_LOTS: u128 = 12;
        self.deposit(Who::Trader, 100_000_000)?;
        self.deposit(Who::Counterparty, 13_000_000)?;
        self.open(SideReq::Long, OPEN_LOTS)?;
        // The upstream spec test reduces the long by 3 lots before the move.
        self.transact(|session| {
            {
                let mut market =
                    MarketGroupV16ViewMut::new(&mut session.header, &mut session.markets);
                let mut trader = PortfolioV16ViewMut::new(&mut session.trader);
                market
                    .rebalance_reduce_position_not_atomic(
                        &mut trader,
                        percolator::RebalanceRequestV16 {
                            asset_index: 0,
                            reduce_q: 3 * POS_SCALE,
                        },
                    )
                    .map_err(|err| format!("quantity reduction rejected: {err:?}"))?;
            }
            session.push_event("reduced the long by 3 lots through the engine rebalance path");
            Ok(())
        })?;
        self.crank(PRICE + 900_000, 0)?;
        self.crank(PRICE + 1_800_000, 0)?;
        self.push_event(
            "liquidation example is armed: counterparty is the short. Liquidate has not run yet.",
        );
        Ok(self.public_state())
    }

    pub fn public_state(&self) -> PublicState {
        let asset = self
            .markets
            .first()
            .and_then(|market| market.engine.asset.try_to_runtime().ok());
        let cfg_initial = self.header.config.initial_margin_bps.get();
        let cfg_maint = self.header.config.maintenance_margin_bps.get();
        PublicState {
            product: "Percolator Fork",
            mode: "local-engine",
            cluster: "in-process",
            price_source: "example-mark",
            oracle: "none",
            keeper: "in-process crank only",
            wallet: "disabled",
            program_deployed: false,
            collateral: CollateralDesc {
                unit: "engine-atom",
                spl_decimals: None,
                note: "Local session atoms are created inside this process. They are not an SPL mint, have no decimals, and cannot be withdrawn to a wallet.",
            },
            risk: RiskDesc {
                initial_margin_bps: cfg_initial,
                maintenance_margin_bps: cfg_maint,
                max_trading_fee_bps: self.header.config.max_trading_fee_bps.get(),
                liquidation_fee_bps: self.header.config.liquidation_fee_bps.get(),
                max_price_move_bps_per_slot: self.header.config.max_price_move_bps_per_slot.get(),
                max_abs_funding_e9_per_slot: self.header.config.max_abs_funding_e9_per_slot.get(),
                max_accrual_dt_slots: self.header.config.max_accrual_dt_slots.get(),
                max_trade_size_q: MAX_TRADE_SIZE_Q.to_string(),
                pos_scale: POS_SCALE.to_string(),
                profile: "upstream public_user_fund_with_market_slots, with the funding-fixture funding cap and 9000 bps mark cap",
            },
            market: MarketDesc {
                asset_index: 0,
                slot_last: asset.as_ref().map(|asset| asset.slot_last).unwrap_or(0),
                header_slot: self.header.current_slot.get(),
                effective_price: asset.as_ref().map(|asset| asset.effective_price).unwrap_or(0),
                raw_oracle_target_price: asset
                    .as_ref()
                    .map(|asset| asset.raw_oracle_target_price)
                    .unwrap_or(0),
                oi_eff_long_q: asset
                    .as_ref()
                    .map(|asset| asset.oi_eff_long_q.to_string())
                    .unwrap_or_else(|| "0".into()),
                oi_eff_short_q: asset
                    .as_ref()
                    .map(|asset| asset.oi_eff_short_q.to_string())
                    .unwrap_or_else(|| "0".into()),
                vault_atoms: self.header.vault.get().to_string(),
                capital_total_atoms: self.header.c_tot.get().to_string(),
                stale_accounts_long: asset
                    .as_ref()
                    .map(|asset| asset.stale_account_count_long)
                    .unwrap_or(0),
                stale_accounts_short: asset
                    .as_ref()
                    .map(|asset| asset.stale_account_count_short)
                    .unwrap_or(0),
            },
            trader: describe_account("trader", &self.trader),
            counterparty: describe_account("example-counterparty", &self.counterparty),
            events: self.events.clone(),
            blockers: BLOCKERS.to_vec(),
        }
    }

    fn transact(
        &mut self,
        body: impl FnOnce(&mut Self) -> Result<(), String>,
    ) -> Result<PublicState, String> {
        let saved = self.clone();
        match body(self) {
            Ok(()) => match self.validate_accounts() {
                Ok(()) => Ok(self.public_state()),
                Err(err) => {
                    *self = saved;
                    Err(format!(
                        "engine accepted the call but the post-state failed validation ({err}). Session rolled back."
                    ))
                }
            },
            Err(err) => {
                *self = saved;
                Err(err)
            }
        }
    }

    fn validate_accounts(&mut self) -> Result<(), String> {
        {
            let market = MarketGroupV16ViewMut::new(&mut self.header, &mut self.markets);
            market
                .validate_shape()
                .map_err(|err| format!("market shape: {err:?}"))?;
            {
                let trader = PortfolioV16ViewMut::new(&mut self.trader);
                trader
                    .validate_with_market(&market.as_view())
                    .map_err(|err| format!("trader portfolio: {err:?}"))?;
            }
            let counterparty = PortfolioV16ViewMut::new(&mut self.counterparty);
            counterparty
                .validate_with_market(&market.as_view())
                .map_err(|err| format!("counterparty portfolio: {err:?}"))?;
        }
        let capital_sum = self
            .trader
            .capital
            .get()
            .checked_add(self.counterparty.capital.get())
            .ok_or_else(|| "capital sum overflow".to_string())?;
        if self.header.c_tot.get() != capital_sum {
            return Err(format!(
                "capital total {} != trader+counterparty {capital_sum}",
                self.header.c_tot.get()
            ));
        }
        Ok(())
    }

    fn effective_price(&self) -> Result<u64, String> {
        self.markets
            .first()
            .ok_or_else(|| "market has no asset slot".to_string())?
            .engine
            .asset
            .try_to_runtime()
            .map(|asset| asset.effective_price)
            .map_err(|err| format!("asset price unreadable: {err:?}"))
    }

    fn asset_slot_last(&self) -> Result<u64, String> {
        self.markets
            .first()
            .ok_or_else(|| "market has no asset slot".to_string())?
            .engine
            .asset
            .try_to_runtime()
            .map(|asset| asset.slot_last)
            .map_err(|err| format!("asset slot unreadable: {err:?}"))
    }

    fn trader_position(&self) -> Result<i128, String> {
        let leg = self.trader.legs[0]
            .try_to_runtime()
            .map_err(|err| format!("trader leg unreadable: {err:?}"))?;
        if !leg.active {
            return Ok(0);
        }
        Ok(leg.basis_pos_q)
    }

    fn push_event(&mut self, text: &str) {
        self.events.push(text.to_string());
        if self.events.len() > 40 {
            let drain = self.events.len() - 40;
            self.events.drain(0..drain);
        }
    }
}

impl Default for EngineSession {
    fn default() -> Self {
        Self::new().expect("default session config is the upstream public-user-fund profile")
    }
}

#[derive(Clone, Copy, Debug)]
pub enum Who {
    Trader,
    Counterparty,
}

impl Who {
    pub fn parse(value: &str) -> Result<Self, String> {
        match value {
            "trader" => Ok(Self::Trader),
            "counterparty" => Ok(Self::Counterparty),
            _ => Err("who must be trader or counterparty".into()),
        }
    }

    fn label(self) -> &'static str {
        match self {
            Self::Trader => "trader",
            Self::Counterparty => "counterparty",
        }
    }
}

#[derive(Clone, Copy, Debug)]
pub enum SideReq {
    Long,
    Short,
}

impl SideReq {
    pub fn parse(value: &str) -> Result<Self, String> {
        match value {
            "long" => Ok(Self::Long),
            "short" => Ok(Self::Short),
            _ => Err("side must be long or short".into()),
        }
    }

    fn label(self) -> &'static str {
        match self {
            Self::Long => "long",
            Self::Short => "short",
        }
    }
}

pub fn run_documented_lifecycle() -> LifecycleReport {
    let mut steps = Vec::new();
    let mut session = match EngineSession::new() {
        Ok(session) => session,
        Err(err) => {
            return LifecycleReport {
                engine_revision: ENGINE_REVISION,
                program_revision: PROGRAM_REVISION,
                steps: vec![LifecycleStep {
                    name: "open-session",
                    ok: false,
                    detail: err,
                }],
                final_state: EngineSession::default().public_state(),
            };
        }
    };

    let record = |steps: &mut Vec<LifecycleStep>, name: &'static str, result: Result<(), String>| {
        match result {
            Ok(()) => steps.push(LifecycleStep {
                name,
                ok: true,
                detail: "engine accepted the transition".into(),
            }),
            Err(err) => steps.push(LifecycleStep {
                name,
                ok: false,
                detail: err,
            }),
        }
    };

    record(&mut steps, "deposit-trader", session.deposit(Who::Trader, 20_000_000).map(|_| ()));
    record(
        &mut steps,
        "deposit-counterparty",
        session.deposit(Who::Counterparty, 20_000_000).map(|_| ()),
    );
    record(&mut steps, "open-long", session.open(SideReq::Long, 1).map(|_| ()));
    record(
        &mut steps,
        "funding-crank",
        session.crank(EXAMPLE_MARK_PRICE, MAX_FUNDING_RATE_E9).map(|_| ()),
    );
    record(&mut steps, "settle-refresh", session.refresh().map(|_| ()));
    let funding_moved = session.trader.funding_long_paid_atoms_total.get()
        + session.trader.funding_long_received_atoms_total.get()
        + session.trader.funding_short_paid_atoms_total.get()
        + session.trader.funding_short_received_atoms_total.get()
        + session.counterparty.funding_long_paid_atoms_total.get()
        + session.counterparty.funding_long_received_atoms_total.get()
        + session.counterparty.funding_short_paid_atoms_total.get()
        + session.counterparty.funding_short_received_atoms_total.get();
    steps.push(LifecycleStep {
        name: "funding-counters-moved",
        ok: funding_moved > 0,
        detail: format!("combined funding counter atoms {funding_moved}"),
    });
    steps.push(LifecycleStep {
        name: "vault-conserves-deposited-atoms",
        ok: session.header.vault.get() == 40_000_000,
        detail: format!(
            "vault {} c_tot {} (funding can move atoms out of capital and leave them inside the vault)",
            session.header.vault.get(),
            session.header.c_tot.get()
        ),
    });

    let before = session.clone();
    let rejected = session.crank(EXAMPLE_MARK_PRICE.saturating_mul(3), 0);
    steps.push(LifecycleStep {
        name: "reject-discontinuous-mark",
        ok: rejected.is_err() && session.header == before.header && session.trader == before.trader,
        detail: rejected.err().unwrap_or_else(|| {
            "engine accepted a 3x mark jump while a position was open".into()
        }),
    });
    let price_now = session.effective_price().unwrap_or(EXAMPLE_MARK_PRICE);
    let before = session.clone();
    let rejected = session.crank(price_now, MAX_FUNDING_RATE_E9 + 1);
    steps.push(LifecycleStep {
        name: "reject-funding-above-cap",
        ok: rejected.is_err() && session.header == before.header,
        detail: rejected
            .err()
            .unwrap_or_else(|| "engine accepted funding above the cap".into()),
    });
    let before = session.clone();
    let rejected = session.open(SideReq::Long, (MAX_TRADE_SIZE_Q / POS_SCALE) + 1);
    steps.push(LifecycleStep {
        name: "reject-oversized-trade",
        ok: rejected.is_err() && session.trader == before.trader,
        detail: rejected
            .err()
            .unwrap_or_else(|| "engine accepted an oversized trade".into()),
    });
    let before = session.clone();
    let rejected = session.liquidate(Who::Trader);
    steps.push(LifecycleStep {
        name: "reject-liquidation-of-healthy-account",
        ok: rejected.is_err() && session.trader == before.trader,
        detail: match rejected {
            Err(err) => err,
            Ok(_) => "liquidation reported success on a healthy account".into(),
        },
    });

    let flat_before_close = session.trader_position().unwrap_or(0) != 0;
    record(&mut steps, "close", session.close().map(|_| ()));
    let flat = session.trader_position().ok() == Some(0);
    steps.push(LifecycleStep {
        name: "flat-after-close",
        ok: flat_before_close && flat,
        detail: format!("position_q={}", session.trader_position().unwrap_or(i128::MIN)),
    });
    let withdraw_amount = session.trader.capital.get();
    record(
        &mut steps,
        "withdraw-trader",
        session.withdraw(Who::Trader, withdraw_amount).map(|_| ()),
    );

    match session.prepare_liquidation_example() {
        Ok(_) => {
            steps.push(LifecycleStep {
                name: "arm-liquidation-example",
                ok: true,
                detail: "upstream undercollateralized-short fixture loaded".into(),
            });
            match session.liquidate(Who::Counterparty) {
                Ok((_, outcome)) => {
                    let short_flat = session
                        .counterparty
                        .legs[0]
                        .try_to_runtime()
                        .map(|leg| !leg.active || leg.basis_pos_q == 0)
                        .unwrap_or(false);
                    let bitmap_clear = active_bitmap_is_empty(
                        session.counterparty.active_bitmap.map(V16PodU64::get),
                    );
                    steps.push(LifecycleStep {
                        name: "liquidate-undercollateralized-short",
                        ok: outcome.closed_q == 9 * POS_SCALE && short_flat && bitmap_clear,
                        detail: format!(
                            "closed_q={} insurance_used={} fee_charged={} flat={short_flat}",
                            outcome.closed_q, outcome.insurance_used, outcome.fee_charged
                        ),
                    });
                }
                Err(err) => steps.push(LifecycleStep {
                    name: "liquidate-undercollateralized-short",
                    ok: false,
                    detail: err,
                }),
            }
        }
        Err(err) => steps.push(LifecycleStep {
            name: "arm-liquidation-example",
            ok: false,
            detail: err,
        }),
    }

    LifecycleReport {
        engine_revision: ENGINE_REVISION,
        program_revision: PROGRAM_REVISION,
        steps,
        final_state: session.public_state(),
    }
}

pub const ENGINE_REVISION: &str = "4db11a8cb0053815e23a35d3a7d3edc265d8d866";
pub const PROGRAM_REVISION: &str = "5cb331dde354517c6371a8acf92cecb194f3bb73";

const BLOCKERS: &[&str] = &[
    "No Solana program is deployed. Devnet and mainnet deployment are blocked until you approve an exact cluster.",
    "No Pyth, Switchboard, or Chainlink account is read. The mark is an example value supplied to the engine.",
    "No keeper process is hosted. Crank and refresh run only inside this local process, when you invoke them.",
    "Wallet connection is off because there is no transaction path on a configured cluster.",
    "The example counterparty is local state, not an order book and not external liquidity.",
];

fn account_fixture(market_group_id: [u8; 32], seed: u8) -> PortfolioAccountV16Account {
    let header = ProvenanceHeaderV16Account::from_runtime(&ProvenanceHeaderV16::new(
        market_group_id,
        [seed; 32],
        [seed.wrapping_add(16); 32],
    ));
    let mut account = PortfolioAccountV16Account::default();
    account
        .init_empty_in_place(header)
        .expect("empty portfolio initialization is infallible for a fresh header");
    account
}

fn describe_account(role: &'static str, account: &PortfolioAccountV16Account) -> AccountDesc {
    let leg = account.legs[0].try_to_runtime().unwrap_or(PortfolioLegV16::EMPTY);
    let cert = account.health_cert.try_to_runtime().ok();
    let side = if !leg.active {
        "flat".to_string()
    } else if leg.basis_pos_q > 0 {
        "long".to_string()
    } else if leg.basis_pos_q < 0 {
        "short".to_string()
    } else {
        "flat".to_string()
    };
    AccountDesc {
        role,
        owner_hex: hex_bytes(&account.owner),
        capital_atoms: account.capital.get().to_string(),
        pnl_atoms: account.pnl.get().to_string(),
        position_q: leg.basis_pos_q.to_string(),
        position_side: side,
        leg_active: leg.active,
        leg_stale: leg.stale,
        leg_b_stale: leg.b_stale,
        funding_long_paid: account.funding_long_paid_atoms_total.get().to_string(),
        funding_long_received: account.funding_long_received_atoms_total.get().to_string(),
        funding_short_paid: account.funding_short_paid_atoms_total.get().to_string(),
        funding_short_received: account.funding_short_received_atoms_total.get().to_string(),
        cert_valid: cert.as_ref().map(|cert| cert.valid).unwrap_or(false),
        cert_equity: cert
            .as_ref()
            .map(|cert| cert.certified_equity.to_string())
            .unwrap_or_else(|| "0".into()),
        cert_initial_req: cert
            .as_ref()
            .map(|cert| cert.certified_initial_req.to_string())
            .unwrap_or_else(|| "0".into()),
        cert_maintenance_req: cert
            .as_ref()
            .map(|cert| cert.certified_maintenance_req.to_string())
            .unwrap_or_else(|| "0".into()),
        cert_liq_deficit: cert
            .as_ref()
            .map(|cert| cert.certified_liq_deficit.to_string())
            .unwrap_or_else(|| "0".into()),
    }
}

fn hex_bytes(bytes: &[u8]) -> String {
    let mut out = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        let _ = write!(&mut out, "{byte:02x}");
    }
    out
}
