#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
export FORK_ENGINE_PORT="${FORK_ENGINE_PORT:-43124}"
exec cargo run --manifest-path crates/fork-session/Cargo.toml --bin fork-engine
