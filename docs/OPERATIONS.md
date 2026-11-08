# Operations

Nothing in this repository deploys a program. The local engine binds to `127.0.0.1` only and creates example atoms inside the process. Those atoms are not an SPL mint and have no decimals.

## Run the local engine

```bash
scripts/local-engine.sh
```

Listens on `http://127.0.0.1:43124`. Override with `FORK_ENGINE_PORT`.

Lifecycle report, without the HTTP server:

```bash
scripts/lifecycle.sh
```

## Run the interface

In another shell, from `web/`:

```bash
npm install
npm run dev
```

The dev server listens on `http://127.0.0.1:43123` and proxies `/api/engine/*` to `FORK_ENGINE_URL` (default `http://127.0.0.1:43124`). If the engine is down, the page stays disconnected and read-only. Wallet connect stays disabled.

The interface is deployed as a new Vercel project named `percolator-fork` (`prj_6SwVszTmFmFTJiWlgA80JlJAyZtG`) on team `gareth-lees-projects` / `team_xdTvWzxYDw8CA5EnNb4viG5A`. Production URL: https://percolator-fork.vercel.app. It is not connected to Stockpile, Split, or any other project, and it is not linked to a Git repository yet.

That deployment has no engine, no program, and no oracle. `/api/engine/v1/state` returns 503, and the page stays disconnected and read-only. Do not point `FORK_ENGINE_URL` at a host that accepts deposits of real tokens.

## Tests that this tree runs

```bash
# Upstream engine suite. 132 tests at the pinned revision.
cargo test --manifest-path engine/Cargo.toml

# Upstream engine property tests (feature fuzz).
cargo test --manifest-path engine/Cargo.toml --features fuzz

# Local session: deposit, open, funding, settlement, close, withdraw,
# stale-mark rejection, funding-cap rejection, size bound, healthy-liquidation
# rejection, and the upstream undercollateralized-short liquidation.
cargo test --manifest-path crates/fork-session/Cargo.toml

# Wrapper instruction bytes, oracle age, confidence, and premium funding clamp.
# Requires the program library to compile on the host.
cargo test --manifest-path crates/instruction-bytes/Cargo.toml

# Upstream wrapper unit tests compiled into the library. Not the LiteSVM suite.
cargo test --manifest-path program/Cargo.toml --lib --no-default-features
```

Kani proofs are upstream-only (`engine/scripts`, `program/kani`). This environment did not install Kani, so those proofs were not re-run.

## Solana program build, still local

Upstream documents:

```bash
cargo build-sbf --tools-version v1.52
cargo test --all-targets
```

`cargo test` for the program loads `target/deploy/percolator_prog.so` into LiteSVM, plus matcher fixtures under `program/tests/fixtures`. Platform-tools v1.52 is required for the default Anchor v2 entrypoint. `--no-default-features` is the legacy host-compatible build.

Do not run `cargo test --all-targets` in `program/` until the SBF artifact exists. The integration suite is large and is the upstream SVM proof, not something this tree reimplemented.

A local validator, if you build the `.so`, should be `solana-test-validator` on localhost with a throwaway key and a test mint. That is still not approval to use devnet.

## Public deployment is blocked

```bash
scripts/devnet-prepare.sh
```

The script prints the missing approvals and exits 2. It does not contact a cluster and it ignores any deploy flag.

Approval required before a public write:

1. Exact cluster: devnet or mainnet, said explicitly. "Testnet" in the UI means unconfigured, not a license to deploy.
2. A new deployer key created for that deployment. Do not use a personal wallet, a Phantom session, or any treasury key.
3. Rent and fee-payer SOL on that cluster, from a source you approve.
4. `cargo build-sbf --tools-version v1.52` reviewed for stack-frame diagnostics, as upstream asks.
5. An oracle: Pyth receiver, Switchboard on-demand, or Chainlink transmissions, plus `max_staleness_secs` and confidence bps. AuthMark and EwmaMark are authority-pushed alternatives and need a signer you operate.
6. A keeper host that calls `PermissionlessCrank` and can pay fees. The engine does not liquidate itself.
7. Collateral mint and decimals chosen on purpose. The wrapper rejects mismatched primary and secondary mint decimals. Local mode has no mint.
8. `marketauth` custody. That key sets fees, can rotate itself, can force-shutdown assets, and can resolve the market. Burning it to zero is rejected by the program. Per-asset admins are separate.

Until those exist, there is no public market, no TVL, and no order flow.
