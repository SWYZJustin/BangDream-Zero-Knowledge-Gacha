#[cfg(not(target_family = "wasm"))]
fn main() {
    use halo2_proofs::pasta::Fp;
    use zk_gacha::my_gacha_single::{
        MySingleGachaCircuit, my_single_get_random, my_single_generate_setup_params,
        my_single_generate_keys, my_single_empty_circuit, my_single_create_circuit,
        my_single_generate_proof, my_single_verify,
    };

    let k = 6;

    let seed: u64 = 54352;
    let random_value = my_single_get_random(seed, 1);

    let params = my_single_generate_setup_params(k);

    let empty_circuit: MySingleGachaCircuit = my_single_empty_circuit();
    let (pk, vk) = my_single_generate_keys(&params, &empty_circuit);

    let circuit: MySingleGachaCircuit = my_single_create_circuit(seed);

    let proof = my_single_generate_proof(&params, &pk, circuit, &vec![Fp::from(random_value)]);

    let verify_res =
        my_single_verify(&params, &vk, &vec![Fp::from(random_value)], proof).is_ok();
    println!("MySingleGachaCircuit verify result: {}", verify_res);
}