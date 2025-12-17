import type { NextApiRequest, NextApiResponse } from "next";
import * as gacha from "../../lib/wasm/gacha.js";
import fs from "fs";
import path from "path";

type DrawResponse =
  | {
      random: string;
      rarity: number;
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
  res: NextApiResponse<DrawResponse>
) {
  try {
    initWasmNode();

    const seed = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));

    const params = gacha.setup_params(6);
    const rand = gacha.generate_random(seed) as bigint;
    const proof = gacha.proof_generate(seed, params) as Uint8Array;
    
    const randMod10000 = Number(rand % BigInt(10000));
    let rarity = 1;
    if (randMod10000 < 100) {
      rarity = 4;
    } else if (randMod10000 < 400) {
      rarity = 3;
    } else if (randMod10000 < 5200) {
      rarity = 2;
    }

    res.status(200).json({
      random: rand.toString(),
      rarity: rarity,
      proof: Array.from(proof),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "draw_failed" });
  }
}
