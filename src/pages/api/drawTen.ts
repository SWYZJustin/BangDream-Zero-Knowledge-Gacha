import type { NextApiRequest, NextApiResponse } from "next";
import * as gacha from "../../lib/wasm/gacha.js";
import fs from "fs";
import path from "path";

type DrawTenResponse =
  | {
      randoms: string[];
      rarities: number[];
      proof: number[];
    }
  | {
      error: string;
    };

let wasmInited = false;

const initWasmNode = () => {
  if (wasmInited) return;

  const wasmPath = path.join(
    process.cwd(),
    "src",
    "lib",
    "wasm",
    "gacha_bg.wasm"
  );
  const wasmBytes = fs.readFileSync(wasmPath);
  gacha.initSync(wasmBytes);

  wasmInited = true;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DrawTenResponse>
) {
  try {
    initWasmNode();

    const seed = BigInt(Math.floor(Math.random() * Number.MAX_SAFE_INTEGER));

    const params = gacha.setup_params(7);
    const gachaAny: any = gacha;
    const randomsArr = gachaAny.generate_randoms_ten(seed) as Uint32Array;
    const proof = gachaAny.proof_generate_ten(seed, params) as Uint8Array;
    
    const rarities = Array.from(randomsArr).map((r) => {
      const randMod10000 = r % 10000;
      if (randMod10000 < 100) {
        return 4;
      } else if (randMod10000 < 400) {
        return 3;
      } else if (randMod10000 < 5200) {
        return 2;
      } else {
        return 1;
      }
    });

    res.status(200).json({
      randoms: Array.from(randomsArr).map((x) => x.toString()),
      rarities: rarities,
      proof: Array.from(proof),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "draw_ten_failed" });
  }
}