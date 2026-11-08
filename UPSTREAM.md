# Upstream pins

| Piece | Source | Revision | License | Role |
| --- | --- | --- | --- | --- |
| Risk engine | https://github.com/aeyakovenko/percolator | `4db11a8cb0053815e23a35d3a7d3edc265d8d866` | Apache-2.0 (`engine/LICENSE`) | Zero-copy perpetual risk engine. Not a deployed program. |
| Solana program | https://github.com/aeyakovenko/percolator-prog | `5cb331dde354517c6371a8acf92cecb194f3bb73` | Apache-2.0 (`program/LICENSE`) | Instruction wrapper, oracle adapters, custody, admin keys. |
| Engine HEAD at import | same engine repository, `master` | `37cb14ee1436eaf3b7d97e1901b0dc1bf38f5311` (2026-10-28) | Apache-2.0 | Newer than the program pin. Not what this tree builds. |

The program's `Cargo.toml` declared `percolator` rev `4db11a8cb0053815e23a35d3a7d3edc265d8d866` before this import. This tree keeps that pair. `program/Cargo.toml` now uses `path = "../engine"` and carries a modification notice. No file under `program/src` or `engine/` was edited.

## What the engine is

`engine/` is a `no_std` library. A market is `MarketGroupV16ViewMut`. A trader is `PortfolioV16ViewMut`. Asset 0 is the base domain. The engine checks risk transitions and expects the caller to roll back on `Err`. It does not move SPL tokens, read Pyth, or know about wallets.

Spec: `engine/spec.md`, described by upstream as v16.9.1. Upstream says the project is educational, not production ready, and not audited.

## What the program adds

`program/src/v16_program.rs` is the wrapper. It declares program id `Perco1ator111111111111111111111111111111111` in source. That id is not a deployment performed by this tree.

The wrapper owns:

- instruction codecs (`ix::Instruction`) for deposit, withdraw, trade, permissionless crank, authority rotation, oracle configuration, insurance, and close
- Pyth receiver, Switchboard, and Chainlink account parsing, with publish-time staleness and confidence checks, scaling prices to 1e6
- SPL token vault custody and mint-decimal equality across quote rails
- `marketauth` and per-asset admin keys
- permissionless crank, liquidation reward accounts, and stale resolution

Upstream LiteSVM coverage lives in `program/tests` and expects `cargo build-sbf` output at `target/deploy/percolator_prog.so`. Those tests were not executed here. See `docs/OPERATIONS.md`.

## Not imported

- `aeyakovenko/percolator-cli`. The file named LICENSE starts as Apache-2.0 and then changes section 8. GitHub SPDX is `NOASSERTION`. No CLI source was copied.
- https://percolator.trade frontend, fonts, icons, and marketing copy.
- Any keeper key, mainnet market json, or wallet.
