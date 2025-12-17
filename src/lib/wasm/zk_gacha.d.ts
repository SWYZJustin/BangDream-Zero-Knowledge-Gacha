/* tslint:disable */
/* eslint-disable */

export function generate_random(seed: bigint): bigint;

export function generate_random_pity(seed: bigint): bigint;

/**
 * ===== Ten-draw circuit interface: generate 10 random numbers and prove/verify them with MyTenGachaCircuit =====
 */
export function generate_randoms_ten(seed: bigint): Uint32Array;

export function proof_generate(seed: bigint, params_bytes: Uint8Array): Uint8Array;

export function proof_generate_pity(seed: bigint, streak_prev: bigint, params_bytes: Uint8Array): any;

export function proof_generate_ten(seed: bigint, params_bytes: Uint8Array): Uint8Array;

export function proof_generate_ten_pity(seed: bigint, streak_prev: bigint, params_bytes: Uint8Array): any;

export function proof_verify(params_bytes: Uint8Array, random_value: bigint, proof: Uint8Array): boolean;

export function proof_verify_pity(params_bytes: Uint8Array, streak_prev: bigint, random_value: bigint, final_rarity: bigint, streak_next: bigint, proof: Uint8Array): boolean;

export function proof_verify_ten(params_bytes: Uint8Array, random_values: Uint32Array, proof: Uint8Array): boolean;

export function proof_verify_ten_pity(params_bytes: Uint8Array, streak_prev: bigint, randoms: Uint32Array, rarities: Uint32Array, streak_next: bigint, proof: Uint8Array): boolean;

export function setup_params(k: number): Uint8Array;

/**
 * ===== Pity circuit interface: generate proof with pity mechanism verification =====
 */
export function setup_params_pity(k: number): Uint8Array;

/**
 * ===== Ten-draw with pity circuit interface =====
 */
export function setup_params_ten_pity(k: number): Uint8Array;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly generate_random: (a: bigint) => bigint;
  readonly proof_generate: (a: bigint, b: number, c: number) => any;
  readonly proof_generate_pity: (a: bigint, b: bigint, c: number, d: number) => any;
  readonly proof_generate_ten: (a: bigint, b: number, c: number) => any;
  readonly proof_generate_ten_pity: (a: bigint, b: bigint, c: number, d: number) => any;
  readonly proof_verify: (a: number, b: number, c: bigint, d: number, e: number) => number;
  readonly proof_verify_pity: (a: number, b: number, c: bigint, d: bigint, e: bigint, f: bigint, g: number, h: number) => number;
  readonly proof_verify_ten: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly proof_verify_ten_pity: (a: number, b: number, c: bigint, d: number, e: number, f: number, g: number, h: bigint, i: number, j: number) => number;
  readonly setup_params: (a: number) => any;
  readonly setup_params_pity: (a: number) => any;
  readonly setup_params_ten_pity: (a: number) => any;
  readonly generate_random_pity: (a: bigint) => bigint;
  readonly generate_randoms_ten: (a: bigint) => any;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
