#!/bin/bash
set -e

# Install Rust using rustup if not already installed
if ! command -v rustc &> /dev/null; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  source "$HOME/.cargo/env"
fi

# Install wasm32-unknown-unknown target
source "$HOME/.cargo/env" 2>/dev/null || true
rustup target add wasm32-unknown-unknown || true

# Install wasm-pack if not already installed
if ! command -v wasm-pack &> /dev/null; then
  curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
  source "$HOME/.cargo/env"
fi

# Ensure PATH is set for subsequent commands
export PATH="$HOME/.cargo/bin:$PATH"

# Install yarn dependencies
yarn install
