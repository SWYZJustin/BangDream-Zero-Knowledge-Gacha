# BanG Dream! ZK Gacha

A zero-knowledge proof gacha system demonstrating cryptographic verification of random number generation, rarity computation, and pity mechanisms.

## Overview

This application implements a gacha (loot box) system for BanG Dream! Girls Band Party characters with cryptographic guarantees. All random draws, rarity calculations, and pity logic are verified using zero-knowledge proofs, ensuring the server cannot manipulate outcomes without detection.

## Live Demo

🔗 **[Try it on Vercel](https://bang-dream-zero-knowledge-gacha.vercel.app)**

## Gacha Pools

### Standard Gacha
- Standard probability rates apply
- No pity system
- All bands available: Poppin'Party, Afterglow, Pastel*Palettes, Roselia, Hello Happy World!
- Single draw and ten-draw options

### Premium Gacha
- Pity system enabled
- Guaranteed 5★ after 50 consecutive draws without 5★
- All bands available
- Single draw and ten-draw options
- Streak counter tracks consecutive non-5★ draws

### MyGO!!!!! Exclusive Gacha
- Pity system enabled
- Only MyGO!!!!! members available
- Guaranteed 5★ after 50 consecutive draws without 5★
- Single draw and ten-draw options

## Rarity Distribution

All pools use the same probability rates:
- 5★: 1% (0-99 out of 10000)
- 4★: 3% (100-399 out of 10000)
- 3★: 48% (400-5199 out of 10000)
- 2★: 48% (5200-9999 out of 10000)

Rarity is computed from `random % 10000` using threshold mapping.

## Zero-Knowledge Proof Flow

### 1. Server-Side Proof Generation
- Server generates a random seed (private witness)
- Server computes random value(s) using Linear Congruential Generator (LCG)
- Server computes rarity from random value(s) using threshold mapping (mod 10000)
- For pity circuits: Server applies pity logic (force 5★ if streak ≥ 50) and updates streak counter
- Server creates ZK proof using Halo2 that proves all computations (LCG, rarity, pity) are correct

### 2. Client-Side Verification
- Client receives public outputs (random value(s), rarity/rarities, streak_next if applicable) and proof
- Client verifies the proof using the same circuit parameters (verifying key) and public inputs
- If verification succeeds, client can trust that LCG, rarity computation, and pity logic (if applicable) are all correct

### 3. Security Guarantees
- Server cannot forge random values or rarities without being detected
- Seed remains private (witness), only computed values are public
- Pity mechanism is cryptographically enforced: server cannot skip or manipulate pity logic
- Proof ensures computational integrity of LCG, rarity mapping, and pity enforcement

## Circuit Design

### Single Draw Circuit
- **LCG Computation:** `random = (seed × 1103515245 + 12345) mod 2³²`
- **Rarity Computation:** `random_mod_10000 = random % 10000`, then threshold mapping
- **Witness:** seed (private)
- **Public Output:** random value, rarity
- **Circuit Size:** k=6 (2⁶ = 64 rows)
- **Constraints:** LCG gate, rarity gate with threshold flags, range verification

### Pity Circuit (Single Draw)
- **LCG:** Same as Single Draw (multiplier=1103515245, increment=12345)
- **Pity Logic:**
  - `computed_rarity = compute_rarity(random % 10000)`
  - `if streak_prev ≥ 50: final_rarity = 4 (5★ forced)`
  - `else: final_rarity = computed_rarity`
  - `if final_rarity == 4: streak_next = 0`
  - `else: streak_next = streak_prev + 1`
- **Public Inputs:** streak_prev, random_value, final_rarity, streak_next
- **Circuit Size:** k=6 (2⁶ = 64 rows)
- **Total Constraints:** ~25 constraints per draw (LCG + rarity + pity)

### Ten Draw Circuit
- **LCG Parameters:** multiplier=1664525, increment=1013904223, modulus=2³²
- **Iterative LCG:**
  - `random[0] = (seed × 1664525 + 1013904223) mod 2³²`
  - `for i in 1..10: random[i] = (random[i-1] × 1664525 + 1013904223) mod 2³²`
- **Circuit Structure:** Sequential LCG iterations, each draw verifies LCG + rarity computation
- **Public Outputs:** 10 random values, 10 rarities
- **Circuit Size:** k=7 (2⁷ = 128 rows)
- **Total Constraints:** ~15 constraints × 10 draws = ~150 constraints

### Ten Draw Pity Circuit
- **LCG:** Same as Ten Draw (multiplier=1664525, increment=1013904223)
- **Combined Logic:** For each of 10 draws:
  - LCG computation
  - Rarity computation
  - Pity logic (if streak_current ≥ 50, force 5★)
  - Streak update (reset on 5★, increment otherwise)
- **Public Inputs:** streak_prev, 10 randoms, 10 final_rarities, streak_next
- **Circuit Size:** k=7 (2⁷ = 128 rows)
- **Total Constraints:** ~25 constraints × 10 draws = ~250 constraints

## Technical Details

### Zero-Knowledge Proof System
- **Protocol:** Halo2 (PLONK-based universal SNARK)
- **Field:** Pasta curves (Pallas/Vesta) - 255-bit prime field
- **Transcript:** Blake2b with Challenge255
- **Proof System:** SingleVerifier (non-recursive)
- **Trusted Setup:** Per-circuit (circuit-specific SRS)

### LCG Parameters

**Single Draw / Pity Circuit:**
- multiplier = 1103515245 (glibc LCG constant)
- increment = 12345
- modulus = 2³² = 4,294,967,296

**Ten Draw / Ten Pity Circuit:**
- multiplier = 1664525 (Numerical Recipes LCG constant)
- increment = 1013904223
- modulus = 2³² = 4,294,967,296

### Rarity Mapping Algorithm
```
random_mod_10000 = random % 10000
if random_mod_10000 < 100: rarity = 4 (5★) - 1% probability
else if random_mod_10000 < 400: rarity = 3 (4★) - 3% probability
else if random_mod_10000 < 5200: rarity = 2 (3★) - 48% probability
else: rarity = 1 (2★) - 48% probability
```

Circuit verification uses binary flags to verify exactly one threshold range is active, with range constraints verifying random_mod_10000 falls in the correct interval.

### Pity Mechanism Details
- **Threshold:** PITY_THRESHOLD = 50 consecutive draws without 5★
- **Enforcement:**
  - `pity_active = (streak_prev ≥ 50) ? 1 : 0`
  - `final_rarity = pity_active ? 4 : computed_rarity`
  - `streak_next = (final_rarity == 4) ? 0 : streak_prev + 1`
- **Circuit Verification:**
  - Pity flag is binary: `pity_active × (pity_active - 1) = 0`
  - If pity active: `pity_active × (final_rarity - 4) = 0`
  - If pity not active: `(1 - pity_active) × (final_rarity - computed_rarity) = 0`
  - Streak update: `is_5star × streak_next = 0 AND (1-is_5star) × (streak_next - streak_prev - 1) = 0`

## Technology Stack

- **Frontend:** Next.js 13, React, TypeScript
- **Backend:** Next.js API Routes
- **ZK Proofs:** Halo2 (Rust), compiled to WebAssembly
- **UI:** Custom CSS-in-JS styling

## Building

### Prerequisites
- Node.js
- Rust (with wasm32-unknown-unknown target)
- wasm-pack

### Build Steps

1. Install dependencies:
```bash
yarn install
```

2. Build WebAssembly modules:
```bash
yarn build:wasm
```

3. Build for production:
```bash
yarn build
```

4. Run development server:
```bash
yarn dev
```

## Project Structure

```
.
├── circuits/          # Rust Halo2 circuits
│   └── src/
│       ├── my_gacha_single.rs      # Single draw circuit
│       ├── my_gacha_pity.rs        # Single draw with pity
│       ├── my_gacha_ten.rs         # Ten draw circuit
│       ├── my_gacha_ten_pity.rs    # Ten draw with pity
│       └── wasm.rs                 # WASM bindings
├── src/
│   ├── pages/
│   │   ├── index.tsx               # Main UI
│   │   └── api/                    # API routes
│   └── lib/wasm/                   # Compiled WASM modules
└── public/
    └── characters/                 # Character images
```

## Copyright Notice

All images used in this application are from バンドリ！ガールズバンドパーティ！ (BanG Dream! Girls Band Party!). Copyright © Craft Egg Inc. / Bushiroad Inc. All rights reserved.
