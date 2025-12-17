use zk_gacha::my_gacha_ten_pity::{MyTenPityGachaCircuit, ten_pity_empty_circuit};
use halo2_proofs::{
    plonk::{create_proof, keygen_pk, keygen_vk, verify_proof, SingleVerifier},
    poly::commitment::Params,
    pasta::{EqAffine, Fp},
    transcript::{Blake2bRead, Blake2bWrite, Challenge255},
};
use rand_core::OsRng;

#[test]
fn test_ten_pity_keygen() {
    println!("Creating empty circuit...");
    let empty_circuit = ten_pity_empty_circuit();
    
    println!("Generating params...");
    let k = 17;
    let params: Params<EqAffine> = Params::new(k);
    
    println!("Generating verifying key...");
    let vk = keygen_vk(&params, &empty_circuit);
    
    match vk {
        Ok(_) => println!("VK generation succeeded!"),
        Err(e) => {
            println!("VK generation failed: {:?}", e);
            panic!("VK generation failed");
        }
    }
}

