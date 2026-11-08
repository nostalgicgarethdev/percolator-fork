#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
exec cargo run --manifest-path crates/fork-session/Cargo.toml --bin fork-engine -- lifecycle
