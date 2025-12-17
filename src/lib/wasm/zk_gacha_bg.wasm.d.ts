/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export const generate_random: (a: bigint) => bigint;
export const proof_generate: (a: bigint, b: number, c: number) => any;
export const proof_generate_pity: (a: bigint, b: bigint, c: number, d: number) => any;
export const proof_generate_ten: (a: bigint, b: number, c: number) => any;
export const proof_generate_ten_pity: (a: bigint, b: bigint, c: number, d: number) => any;
export const proof_verify: (a: number, b: number, c: bigint, d: number, e: number) => number;
export const proof_verify_pity: (a: number, b: number, c: bigint, d: bigint, e: bigint, f: bigint, g: number, h: number) => number;
export const proof_verify_ten: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
export const proof_verify_ten_pity: (a: number, b: number, c: bigint, d: number, e: number, f: number, g: number, h: bigint, i: number, j: number) => number;
export const setup_params: (a: number) => any;
export const setup_params_pity: (a: number) => any;
export const setup_params_ten_pity: (a: number) => any;
export const generate_random_pity: (a: bigint) => bigint;
export const generate_randoms_ten: (a: bigint) => any;
export const __wbindgen_malloc: (a: number, b: number) => number;
export const __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
export const __wbindgen_exn_store: (a: number) => void;
export const __externref_table_alloc: () => number;
export const __wbindgen_externrefs: WebAssembly.Table;
export const __wbindgen_start: () => void;
