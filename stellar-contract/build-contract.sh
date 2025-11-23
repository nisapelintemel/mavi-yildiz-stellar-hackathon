#!/usr/bin/env bash
set -euo pipefail

# build-contract.sh
# Cross-platform (Unix) helper to build the Soroban contract to WASM and produce a dist/ with metadata.

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
cd "$ROOT_DIR"

echo "Checking Rust toolchain..."
if ! command -v rustup >/dev/null 2>&1; then
  echo "ERROR: rustup not found. Install Rust: https://www.rust-lang.org/tools/install" >&2
  exit 1
fi

echo "$(rustup --version)"
echo "$(rustc --version)"
echo "$(cargo --version)"

echo "Adding wasm target..."
rustup target add wasm32-unknown-unknown || true

echo "Building contract (wasm target release)..."
cargo build --release --target wasm32-unknown-unknown

PKG=$(grep '^name\s*=\s*"' Cargo.toml | sed -E 's/^name\s*=\s*"(.+)"/\1/')
WASM_PATH="target/wasm32-unknown-unknown/release/${PKG}.wasm"

if [ ! -f "$WASM_PATH" ]; then
  echo "ERROR: wasm artifact not found at $WASM_PATH" >&2
  exit 1
fi

mkdir -p dist
cp "$WASM_PATH" dist/contract.wasm

SHA256=$(sha256sum dist/contract.wasm | awk '{print $1}')

cat > dist/build-metadata.json <<EOF
{
  "package": "${PKG}",
  "wasm": "contract.wasm",
  "wasm_sha256": "${SHA256}",
  "built_at": "$(date --utc +%Y-%m-%dT%H:%M:%SZ)",
  "rustc": "$(rustc --version | sed 's/"/\\"/g')",
  "cargo": "$(cargo --version | sed 's/"/\\"/g')"
}
EOF

echo "Built artifact and metadata in dist/"
