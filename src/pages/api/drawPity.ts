import type { NextApiRequest, NextApiResponse } from "next";
import * as gacha from "../../lib/wasm/gacha.js";
import fs from "fs";
import path from "path";

type DrawPityResponse =
  | {
      random: string;
      rarity: number;
      streakNext: number;
      proof: number[];
    }
  | {
      error: string;
    };

let wasmInited = false;

const initWasmNode = () => {
  if (wasmInited) return;

  const wasmPath = path.join(process.cwd(), "src", "lib", "wasm", "gacha_bg.wasm");
  const wasmBytes = fs.readFileSync(wasmPath);
  gacha.initSync(wasmBytes);

  wasmInited = true;
};

const PITY_THRESHOLD = 50;

const computeRarity = (random: bigint): number => {
  const v = Number(random % BigInt(10000));
  if (v < 100) return 4;
  if (v < 400) return 3;
  if (v < 3400) return 2;
  if (v < 6400) return 1;
  return 0;
};

const computeFinalRarity = (streakPrev: number, computedRarity: number): number => {
  if (streakPrev >= PITY_THRESHOLD) {
    return 4;
  }
  return computedRarity;
};

const computeStreakNext = (streakPrev: number, finalRarity: number): number => {
  if (finalRarity === 4) {
    return 0;
  }
  return streakPrev + 1;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DrawPityResponse>
) {
  try {
    initWasmNode();

    const streakPrev = parseInt(req.body?.streakPrev || "0", 10) || 0;

    const seed = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    const params = (gacha as any).setup_params_pity(6);
    
    const proofResult = (gacha as any).proof_generate_pity(
      seed,
      BigInt(streakPrev),
      params
    ) as {
      random: number;
      rarity: number;
      streakNext: number;
      proof: Uint8Array;
    };

    res.status(200).json({
      random: proofResult.random.toString(),
      rarity: proofResult.rarity,
      streakNext: proofResult.streakNext,
      proof: Array.from(proofResult.proof),
    });
  } catch (e) {
    console.error("Error in drawPity API:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("Error details:", errorMessage);
    res.status(500).json({ error: `draw_pity_failed: ${errorMessage}` });
  }
}

