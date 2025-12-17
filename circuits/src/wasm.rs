use std::io::BufReader;
use crate::my_gacha_single::{
    MySingleGachaCircuit, my_single_get_random, my_single_generate_setup_params,
    my_single_generate_keys, my_single_empty_circuit, my_single_create_circuit,
    my_single_generate_proof, my_single_verify,
};
use crate::my_gacha_ten::{
    MyTenGachaCircuit, my_ten_get_randoms, my_ten_empty_circuit, my_ten_generate_keys,
    my_ten_create_circuit, my_ten_generate_proof, my_ten_verify, TEN_DRAWS,
};
use crate::my_gacha_pity::{
    MyPityGachaCircuit, pity_get_random, pity_generate_setup_params,
    pity_generate_keys, pity_empty_circuit, pity_create_circuit,
    pity_generate_proof, pity_verify, pity_compute_rarity, pity_compute_final_rarity,
    pity_compute_streak_next,
};
use crate::my_gacha_ten_pity::{
    MyTenPityGachaCircuit, ten_pity_compute_all,
    ten_pity_generate_setup_params, ten_pity_generate_keys, ten_pity_empty_circuit,
    ten_pity_create_circuit, ten_pity_generate_proof, ten_pity_verify,
};
use halo2_proofs::{
    poly::commitment::Params, 
    pasta::{Fp, EqAffine}, 
    plonk::keygen_vk
};
use js_sys::{Uint8Array, Uint32Array};
use wasm_bindgen::prelude::*;

const N: u64 = 1;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

fn copy_vec_to_u8arr(v: &Vec<u8>) -> Uint8Array {
    let u8_arr = Uint8Array::new_with_length(v.len() as u32);
    u8_arr.copy_from(v);
    u8_arr
}

fn copy_u32slice_to_u32arr(v: &[u32]) -> Uint32Array {
    let arr = Uint32Array::new_with_length(v.len() as u32);
    arr.copy_from(v);
    arr
}

#[wasm_bindgen]
pub fn setup_params(k: u32) -> Uint8Array {
    log("running setup");
    
    let params = my_single_generate_setup_params(k); 
    let mut buf = vec![];
    params.write(&mut buf).expect("Can write params");

    copy_vec_to_u8arr(&buf)
}

#[wasm_bindgen]
pub fn generate_random(seed: u64) -> u64 {
    my_single_get_random(seed, N)
}

#[wasm_bindgen]
pub fn proof_generate(
    seed: u64,
    params_bytes: &[u8],
) -> Uint8Array {
    log("proving...");

    let params = Params::<EqAffine>::read(&mut BufReader::new(params_bytes)).expect("params should not fail to read");

    let random_value = my_single_get_random(seed, N);
    let computed_rarity = pity_compute_rarity(random_value);

    let empty_circuit : MySingleGachaCircuit = my_single_empty_circuit();
    let (pk, _vk) = my_single_generate_keys(&params, &empty_circuit);
    
    let public_inputs = vec![Fp::from(random_value), Fp::from(computed_rarity)];
    let gacha_circuit : MySingleGachaCircuit = my_single_create_circuit(seed);
    let proof = my_single_generate_proof(&params, &pk, gacha_circuit, &public_inputs);
    
    copy_vec_to_u8arr(&proof)
}

#[wasm_bindgen]
pub fn proof_verify(
    params_bytes: &[u8], 
    random_value: u64,
    proof: &[u8]
) -> bool {
    log("verifying...");

    let params = Params::<EqAffine>::read(&mut BufReader::new(params_bytes)).expect("params should not fail to read");

    let empty_circuit: MySingleGachaCircuit = my_single_empty_circuit();
    let vk = keygen_vk(&params, &empty_circuit).expect("vk should not fail to generate");

    let computed_rarity = pity_compute_rarity(random_value);
    let public_inputs = vec![Fp::from(random_value as u64), Fp::from(computed_rarity)];
    let proof_vec = proof.to_vec();

    my_single_verify(&params, &vk, &public_inputs, proof_vec).is_ok()
}

#[wasm_bindgen]
pub fn generate_randoms_ten(seed: u64) -> Uint32Array {
    let outs = my_ten_get_randoms(seed);
    let outs_u32: Vec<u32> = outs.iter().map(|x| *x as u32).collect();
    copy_u32slice_to_u32arr(&outs_u32)
}

#[wasm_bindgen]
pub fn proof_generate_ten(
    seed: u64,
    params_bytes: &[u8],
) -> Uint8Array {
    log("proving ten-draw...");

    let params = Params::<EqAffine>::read(&mut BufReader::new(params_bytes))
        .expect("params should not fail to read");

    let random_values = my_ten_get_randoms(seed);
    
    let mut rarities = Vec::new();
    for &r in &random_values {
        rarities.push(pity_compute_rarity(r));
    }
    
    let mut public_inputs: Vec<Fp> = random_values.iter().map(|x| Fp::from(*x)).collect();
    for &rarity in &rarities {
        public_inputs.push(Fp::from(rarity));
    }

    let empty_circuit: MyTenGachaCircuit = my_ten_empty_circuit();
    let (pk, _vk) = my_ten_generate_keys(&params, &empty_circuit);

    let circuit: MyTenGachaCircuit = my_ten_create_circuit(seed);
    let proof = my_ten_generate_proof(&params, &pk, circuit, &public_inputs);

    copy_vec_to_u8arr(&proof)
}

#[wasm_bindgen]
pub fn proof_verify_ten(
    params_bytes: &[u8],
    random_values: &[u32],
    proof: &[u8],
) -> bool {
    log("verifying ten-draw...");

    let params = Params::<EqAffine>::read(&mut BufReader::new(params_bytes))
        .expect("params should not fail to read");

    let empty_circuit: MyTenGachaCircuit = my_ten_empty_circuit();
    let vk = keygen_vk(&params, &empty_circuit).expect("vk should not fail to generate");

    assert_eq!(
        random_values.len(),
        TEN_DRAWS,
        "ten-draw verify expects exactly TEN_DRAWS random values"
    );
    
    let mut rarities = Vec::new();
    for &r in random_values {
        rarities.push(pity_compute_rarity(r as u64));
    }
    
    let mut public_inputs: Vec<Fp> = random_values.iter().map(|x| Fp::from(*x as u64)).collect();
    for &rarity in &rarities {
        public_inputs.push(Fp::from(rarity));
    }

    let proof_vec = proof.to_vec();

    my_ten_verify(&params, &vk, &public_inputs, proof_vec).is_ok()
}

#[wasm_bindgen]
pub fn setup_params_pity(k: u32) -> Uint8Array {
    log("running pity setup");
    
    let params = pity_generate_setup_params(k); 
    let mut buf = vec![];
    params.write(&mut buf).expect("Can write params");

    copy_vec_to_u8arr(&buf)
}

#[wasm_bindgen]
pub fn generate_random_pity(seed: u64) -> u64 {
    pity_get_random(seed, 1)
}

#[wasm_bindgen]
pub fn proof_generate_pity(
    seed: u64,
    streak_prev: u64,
    params_bytes: &[u8],
) -> JsValue {
    log("proving pity draw...");

    let params = Params::<EqAffine>::read(&mut BufReader::new(params_bytes))
        .expect("params should not fail to read");

    let random_value = pity_get_random(seed, 1);
    let computed_rarity = pity_compute_rarity(random_value);
    let final_rarity = pity_compute_final_rarity(streak_prev, computed_rarity);
    let streak_next = pity_compute_streak_next(streak_prev, final_rarity);

    let public_inputs: Vec<Fp> = vec![
        Fp::from(streak_prev),
        Fp::from(random_value),
        Fp::from(final_rarity),
        Fp::from(streak_next),
    ];

    let empty_circuit: MyPityGachaCircuit = pity_empty_circuit();
    let (pk, _vk) = pity_generate_keys(&params, &empty_circuit);
    
    let circuit: MyPityGachaCircuit = pity_create_circuit(seed, streak_prev);
    let proof = pity_generate_proof(&params, &pk, circuit, &public_inputs);
    
    let result = js_sys::Object::new();
    js_sys::Reflect::set(&result, &JsValue::from_str("random"), &JsValue::from_f64(random_value as f64)).unwrap();
    js_sys::Reflect::set(&result, &JsValue::from_str("rarity"), &JsValue::from_f64(final_rarity as f64)).unwrap();
    js_sys::Reflect::set(&result, &JsValue::from_str("streakNext"), &JsValue::from_f64(streak_next as f64)).unwrap();
    js_sys::Reflect::set(&result, &JsValue::from_str("proof"), &copy_vec_to_u8arr(&proof)).unwrap();
    result.into()
}

#[wasm_bindgen]
pub fn proof_verify_pity(
    params_bytes: &[u8], 
    streak_prev: u64,
    random_value: u64,
    final_rarity: u64,
    streak_next: u64,
    proof: &[u8]
) -> bool {
    log("verifying pity draw...");

    let params = Params::<EqAffine>::read(&mut BufReader::new(params_bytes))
        .expect("params should not fail to read");

    let empty_circuit: MyPityGachaCircuit = pity_empty_circuit();
    let vk = keygen_vk(&params, &empty_circuit).expect("vk should not fail to generate");

    let public_inputs = vec![
        Fp::from(streak_prev),
        Fp::from(random_value),
        Fp::from(final_rarity),
        Fp::from(streak_next),
    ];
    let proof_vec = proof.to_vec();

    pity_verify(&params, &vk, &public_inputs, proof_vec).is_ok()
}

#[wasm_bindgen]
pub fn setup_params_ten_pity(k: u32) -> Uint8Array {
    log("running ten-pity setup");
    
    let params = ten_pity_generate_setup_params(k); 
    let mut buf = vec![];
    params.write(&mut buf).expect("Can write params");

    copy_vec_to_u8arr(&buf)
}

#[wasm_bindgen]
pub fn proof_generate_ten_pity(
    seed: u64,
    streak_prev: u64,
    params_bytes: &[u8],
) -> JsValue {
    log("proving ten-pity draw...");

    let params = Params::<EqAffine>::read(&mut BufReader::new(params_bytes))
        .expect("params should not fail to read");

    let (randoms, rarities, streak_next) = ten_pity_compute_all(seed, streak_prev);

    let mut public_inputs: Vec<Fp> = vec![Fp::from(streak_prev)];
    for &r in &randoms {
        public_inputs.push(Fp::from(r));
    }
    for &rarity in &rarities {
        public_inputs.push(Fp::from(rarity));
    }
    public_inputs.push(Fp::from(streak_next));

    let empty_circuit: MyTenPityGachaCircuit = ten_pity_empty_circuit();
    let (pk, _vk) = ten_pity_generate_keys(&params, &empty_circuit);
    
    let circuit: MyTenPityGachaCircuit = ten_pity_create_circuit(seed, streak_prev);
    let proof = ten_pity_generate_proof(&params, &pk, circuit, &public_inputs);
    
    let result = js_sys::Object::new();
    
    let randoms_js = js_sys::Array::new();
    for &r in &randoms {
        randoms_js.push(&JsValue::from_f64(r as f64));
    }
    js_sys::Reflect::set(&result, &JsValue::from_str("randoms"), &randoms_js).unwrap();
    
    let rarities_js = js_sys::Array::new();
    for &rarity in &rarities {
        rarities_js.push(&JsValue::from_f64(rarity as f64));
    }
    js_sys::Reflect::set(&result, &JsValue::from_str("rarities"), &rarities_js).unwrap();
    
    js_sys::Reflect::set(&result, &JsValue::from_str("streakNext"), &JsValue::from_f64(streak_next as f64)).unwrap();
    js_sys::Reflect::set(&result, &JsValue::from_str("proof"), &copy_vec_to_u8arr(&proof)).unwrap();
    result.into()
}

#[wasm_bindgen]
pub fn proof_verify_ten_pity(
    params_bytes: &[u8], 
    streak_prev: u64,
    randoms: &[u32],
    rarities: &[u32],
    streak_next: u64,
    proof: &[u8]
) -> bool {
    log("verifying ten-pity draw...");

    let params = Params::<EqAffine>::read(&mut BufReader::new(params_bytes))
        .expect("params should not fail to read");

    let empty_circuit: MyTenPityGachaCircuit = ten_pity_empty_circuit();
    let vk = keygen_vk(&params, &empty_circuit).expect("vk should not fail to generate");

    let mut public_inputs = vec![Fp::from(streak_prev)];
    for &r in randoms {
        public_inputs.push(Fp::from(r as u64));
    }
    for &rarity in rarities {
        public_inputs.push(Fp::from(rarity as u64));
    }
    public_inputs.push(Fp::from(streak_next));
    
    let proof_vec = proof.to_vec();

    ten_pity_verify(&params, &vk, &public_inputs, proof_vec).is_ok()
}