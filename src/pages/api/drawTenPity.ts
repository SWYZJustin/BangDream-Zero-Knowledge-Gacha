import type { NextApiRequest, NextApiResponse } from "next";
import * as gacha from "../../lib/wasm/gacha.js";
import fs from "fs";
import path from "path";

type DrawTenPityResponse =
  | {
      randoms: string[];
      rarities: number[];
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DrawTenPityResponse>
) {
  try {
    initWasmNode();

    const streakPrev = parseInt(req.body?.streakPrev || "0", 10) || 0;

    const seed = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));
    const params = (gacha as any).setup_params_ten_pity(7);
    
    const proofResult = (gacha as any).proof_generate_ten_pity(
      seed,
      BigInt(streakPrev),
      params
    ) as {
      randoms: number[];
      rarities: number[];
      streakNext: number;
      proof: Uint8Array;
    };

    res.status(200).json({
      randoms: proofResult.randoms.map((r: number) => r.toString()),
      rarities: proofResult.rarities,
      streakNext: proofResult.streakNext,
      proof: Array.from(proofResult.proof),
    });
  } catch (e) {
    console.error("Error in drawTenPity API:", e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("Error details:", errorMessage);
    res.status(500).json({ error: `draw_ten_pity_failed: ${errorMessage}` });
  }
}

