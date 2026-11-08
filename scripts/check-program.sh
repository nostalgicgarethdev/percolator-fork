#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
echo "Host library tests for the vendored wrapper. This does not build SBF and does not deploy."
cargo test --manifest-path program/Cargo.toml --lib --no-default-features
echo "Instruction codec and oracle-age checks."
cargo test --manifest-path crates/instruction-bytes/Cargo.toml
