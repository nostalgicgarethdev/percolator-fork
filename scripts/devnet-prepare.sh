#!/usr/bin/env bash
set -euo pipefail

cat <<'EOF'
Public deployment is blocked.

This script does not run solana program deploy, does not contact a cluster,
and does not read a keypair.

Before any devnet or mainnet write, all of the following have to be chosen
explicitly:

  1. The exact cluster URL.
  2. A new deployer key for that deployment. Not a personal wallet, not a
     Phantom session, and not a treasury key.
  3. A reviewed SBF build: cargo build-sbf --tools-version v1.52
     (upstream also allows --no-default-features for the legacy entrypoint).
  4. An oracle source: Pyth receiver, Switchboard, Chainlink, or an
     AuthMark / EwmaMark signer you operate, with staleness and confidence.
  5. A keeper process for PermissionlessCrank and liquidations.
  6. A collateral mint and its decimals.
  7. Who holds marketauth.

A local validator with a throwaway mint is a separate step and still is not
approval to use devnet. See docs/OPERATIONS.md.
EOF

if [[ -n "${PERCOLATOR_FORK_PUBLIC_DEPLOY:-}" ]]; then
  echo "PERCOLATOR_FORK_PUBLIC_DEPLOY is set and was ignored."
fi

exit 2
