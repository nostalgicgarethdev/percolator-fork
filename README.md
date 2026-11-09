# PERC

Public source: [github.com/nostalgicgarethdev/percolator-fork](https://github.com/nostalgicgarethdev/percolator-fork).

PERC is an independent perpetual-futures interface built on Anatoly Yakovenko's Percolator v16 risk engine. The website and the local session are original. The engine and the Solana wrapper are his Apache-2.0 code, pinned in [UPSTREAM.md](UPSTREAM.md).

`MANIFEST.txt` records sanitized snapshot `666c4fa72aae30555b12b9451b33637e19baf636` (942 source files, no snapshot Git history, no dependency installs). The commit that publishes this tree is a GitHub commit of that snapshot. It is not the same identifier as `666c4fa`.

This is not an official Percolator product, and it is not endorsed by Anatoly Yakovenko, Solana Labs, or the operators of percolator.trade. Upstream's own warning stands: the engine is educational, unaudited, and not for production or real funds.

A perpetual (perp) is a futures contract with no expiry. One side is long, the other is short, and funding nudges the contract toward a reference price. The risk engine decides whether a position is allowed. A Solana program would wrap that library. A matcher would agree a trade. A keeper would advance the market. None of those chain pieces are deployed from this tree.

## What is public

The public site is read-only. It does not attach an engine, take deposits, or place trades.

Verified fallback: [https://percolator-fork.vercel.app](https://percolator-fork.vercel.app)

Custom domain: `percolator.beer` (apex redirects to `www`). Checked from this environment on 8 Nov 2026, `https://www.percolator.beer` returned HTTPS 200 and served the earlier production desk, deployment `dpl_FikX272D9MkkosV7rVqq9hm6hBRR`. The tabbed pages in the latest commit are not on that deployment yet.

The name is a nod, not a claim about Percolator. Anatoly Yakovenko has described a four-in-the-morning idea after two coffees and a beer. That story is about Solana and Proof of History, in a [Cointelegraph interview](https://cointelegraph.com/interview/solana-genesis-story-powering-nasdaq-on-public-blockchain). It is not the origin of the Percolator engine, and it is not an endorsement of PERC.

## Architecture

| Piece | Where | What it does here |
| --- | --- | --- |
| Website | `web/` | Overview, How it works, Sources, and `/terminal`. Original. |
| Local session | `crates/fork-session` | In-process v16 calls and a loopback HTTP server. Original. |
| Instruction checks | `crates/instruction-bytes` | Codec and oracle-age checks against the wrapper. Original. |
| Risk engine | `engine/` | Vendored [aeyakovenko/percolator](https://github.com/aeyakovenko/percolator) @ `4db11a8cb0053815e23a35d3a7d3edc265d8d866`. Unmodified. Apache-2.0. |
| Solana wrapper | `program/` | Vendored [aeyakovenko/percolator-prog](https://github.com/aeyakovenko/percolator-prog) @ `5cb331dde354517c6371a8acf92cecb194f3bb73`. Apache-2.0. Only `Cargo.toml` was edited, to use `../engine`. Not deployed. |

The engine is a `no_std` library. The program is the on-chain wrapper (oracles, token vault, admin keys, crank, matcher interface). Neither was deployed. No funds moved. `percolator.trade` and `percolator-cli` were not copied. See [NOTICE](NOTICE).

## Run it locally

The engine creates example atoms in memory. You do not need a wallet.

```bash
scripts/local-engine.sh
```

```bash
cd web && npm install && npm run dev
```

- Engine: http://127.0.0.1:43124
- Site: http://127.0.0.1:43123
- Terminal: http://127.0.0.1:43123/terminal

Routes: `/` Overview, `/how-it-works`, `/sources`, `/terminal`. If the engine process is down, the terminal stays disconnected and read-only. Actions stay off. The first visit shows a short branded entrance; it does not pretend a market is connecting.

```bash
scripts/lifecycle.sh
```

That prints the deposit, open, funding, settlement, close, withdraw, rejection, and liquidation sequence. The same sequence is the integration test below. Sixteen steps passed on this tree. That is a local engine pass, not a Solana deployment.

## Tests

```bash
cargo test --manifest-path engine/Cargo.toml
cargo test --manifest-path engine/Cargo.toml --features fuzz
cargo test --manifest-path crates/fork-session/Cargo.toml
cargo test --manifest-path crates/instruction-bytes/Cargo.toml
cargo test --manifest-path program/Cargo.toml --lib --no-default-features
cd web && npm run build
```

LiteSVM and `cargo build-sbf --tools-version v1.52` are upstream's full program suite. They are not part of the commands above. Kani was not run.

## Public operation

[docs/OPERATIONS.md](docs/OPERATIONS.md) lists the cluster, key, oracle, keeper, and collateral decisions required before any devnet or mainnet write. [docs/SECURITY.md](docs/SECURITY.md) says what the local session does and does not prove.

```bash
scripts/devnet-prepare.sh
```

The script prints those blockers and exits 2. It does not contact a cluster.

A Vercel build of `web/` is only the interface. It does not host the engine, a matcher, a keeper, or an oracle.
