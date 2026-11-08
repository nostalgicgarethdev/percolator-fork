# Security notes

This is a review of what this tree does and does not prove. It is not an audit. Upstream says the engine and the program are not audited and must not be used with real funds. That warning still applies.

## Reused without modification

`engine/src` and `program/src` match the pinned revisions. The only upstream edit is `program/Cargo.toml`, which points `percolator` at `../engine` instead of git. Behavior of the risk checks is the upstream code.

The local session calls the public engine methods and, on `Err` or a failed post-state `validate_shape` / `validate_with_market`, restores the previous session. That imitates the SVM rollback the engine assumes. It is not the SVM.

## Admin

`marketauth` and per-asset authorities live in the program, not in the engine session. The local HTTP API has no admin key and no way to rotate one. Authenticated admin instructions are covered as serialized codecs in `crates/instruction-bytes` (`UpdateAuthority` round-trips). Their signer checks run only when the program processes an instruction. Those checks were not executed on a validator in this import.

Anyone who can reach `fork-engine` can deposit example atoms and mutate the in-memory session. The listener is `127.0.0.1`. Do not publish that port.

## Oracle and staleness

Local marks are numbers passed to `accrue_asset_to_not_atomic`. With open interest, a move past `max_price_move_bps_per_slot` returns `RecoveryRequired` and the session rolls back. Funding past `max_abs_funding_e9_per_slot` returns `InvalidConfig`. There is no Pyth, Switchboard, or Chainlink account in the local path, and the UI says so.

The wrapper's `oracle_publish_time_is_fresh` rejects a non-positive age and an age above `max_staleness_secs`. `oracle_confidence_is_too_wide` rejects a wide confidence interval. `premium_funding_rate_e9` clamps and keeps sign. Those are library checks. They do not prove a live feed.

## Collateral and bounds

Local collateral is a `u128` engine atom. `spl_decimals` is null. The program scales oracle answers toward 1e6 and compares mint decimals when two quote rails are configured. That conversion is not active locally.

`MAX_TRADE_SIZE_Q` is enforced before `execute_trade_with_fee_loss_stale_scoped_not_atomic`. The public-user-fund profile used here sets initial and maintenance margin to 10000 bps. That is 1x notional margin, copied from the upstream fixture, not a leverage product setting.

## Liquidation and keepers

`liquidate_account_not_atomic` on a healthy trader is rejected and rolled back. The armed example uses the same deposits, quantity reduction, and two capped mark steps as upstream test `v16_post_quantity_adl_bankrupt_effective_full_close_stays_live`, then calls liquidation once. If that call fails, the UI shows the error. There is no background liquidator.

## What was not proven here

- SBF build and LiteSVM instruction execution
- Kani proofs
- Token-account custody, PDA signing, or matcher CPI
- A real oracle account
- Devnet or mainnet behavior
- Key management

Do not describe a passing `cargo test` or a Vercel page as a working public exchange.
