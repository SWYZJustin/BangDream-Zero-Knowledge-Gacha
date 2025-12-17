use halo2_proofs::{
    plonk::{
        Advice, Circuit, Column, ConstraintSystem, Error, Expression, Instance, Selector, create_proof,
        keygen_pk, keygen_vk, ProvingKey, VerifyingKey, SingleVerifier, verify_proof,
    },
    circuit::{AssignedCell, Layouter, SimpleFloorPlanner, Value},
    poly::{commitment::Params, Rotation},
    pasta::{EqAffine, Fp, group::ff::PrimeField},
    transcript::{Blake2bRead, Blake2bWrite, Challenge255},
};
use rand_core::OsRng;

use crate::my_gacha_pity::pity_compute_rarity;

pub const MY_MODULUS_EXPONENT: u64 = 32;
pub const MY_MODULUS: u64 = 1 << MY_MODULUS_EXPONENT;
pub const MY_MULTIPLIER: u64 = 1103515245;
pub const MY_INCREMENT: u64 = 12345;

#[derive(Clone, Debug)]
struct MyCell(AssignedCell<Fp, Fp>);

#[derive(Clone, Debug)]
pub struct MySingleGachaConfig {
    adv: [Column<Advice>; 3],
    divisor: Column<Advice>,
    inst: Column<Instance>,
    selector: Selector,
    rarity_selector: Selector,
}

impl MySingleGachaConfig {
    pub fn configure(meta: &mut ConstraintSystem<Fp>) -> Self {
        let adv_0 = meta.advice_column();
        let adv_1 = meta.advice_column();
        let adv_2 = meta.advice_column();
        let divisor = meta.advice_column();
        let selector = meta.selector();
        let rarity_selector = meta.selector();
        let inst = meta.instance_column();

        meta.enable_equality(adv_0);
        meta.enable_equality(adv_1);
        meta.enable_equality(adv_2);
        meta.enable_equality(inst);

        meta.create_gate("my single lcg", |meta| {
            let x = meta.query_advice(adv_0, Rotation::cur());
            let y = meta.query_advice(adv_1, Rotation::cur());
            let d = meta.query_advice(divisor, Rotation::cur());

            let a = Expression::Constant(Fp::from(MY_MULTIPLIER));
            let m = Expression::Constant(Fp::from(MY_MODULUS));
            let c = Expression::Constant(Fp::from(MY_INCREMENT));

            let s = meta.query_selector(selector);

            let constraint_lcg = a * x + c - y.clone() - m * d;
            
            vec![s * constraint_lcg]
        });

        meta.create_gate("my single rarity", |meta| {
            let random = meta.query_advice(adv_1, Rotation(-1));
            let random_mod_10000 = meta.query_advice(adv_2, Rotation::cur());
            let computed_rarity = meta.query_advice(adv_2, Rotation::next());

            let s = meta.query_selector(rarity_selector);
            
            let quotient_10000 = meta.query_advice(divisor, Rotation::cur());
            let constraint1 = random - random_mod_10000.clone() - Expression::Constant(Fp::from(10000)) * quotient_10000.clone();
            
            let cr_minus_1 = computed_rarity.clone() - Expression::Constant(Fp::from(1));
            let cr_minus_2 = computed_rarity.clone() - Expression::Constant(Fp::from(2));
            let cr_minus_3 = computed_rarity.clone() - Expression::Constant(Fp::from(3));
            let cr_minus_4 = computed_rarity.clone() - Expression::Constant(Fp::from(4));
            let constraint2 = cr_minus_1 * cr_minus_2 * cr_minus_3 * cr_minus_4;
            
            let flag_5star = meta.query_advice(divisor, Rotation(3));
            let flag_4star = meta.query_advice(divisor, Rotation(4));
            let flag_3star = meta.query_advice(divisor, Rotation(5));
            let flag_2star = meta.query_advice(divisor, Rotation(6));
            
            let constraint_flag_5star = flag_5star.clone() * (flag_5star.clone() - Expression::Constant(Fp::one()));
            let constraint_flag_4star = flag_4star.clone() * (flag_4star.clone() - Expression::Constant(Fp::one()));
            let constraint_flag_3star = flag_3star.clone() * (flag_3star.clone() - Expression::Constant(Fp::one()));
            let constraint_flag_2star = flag_2star.clone() * (flag_2star.clone() - Expression::Constant(Fp::one()));
            
            let constraint_flags_sum = flag_5star.clone() + flag_4star.clone() + flag_3star.clone() + flag_2star.clone() - Expression::Constant(Fp::one());
            
            let diff_100 = meta.query_advice(adv_2, Rotation(3));
            let diff_400_low = meta.query_advice(adv_2, Rotation(4));
            let diff_400_high = meta.query_advice(adv_2, Rotation(5));
            let diff_5200_low = meta.query_advice(adv_2, Rotation(6));
            let diff_5200_high = meta.query_advice(adv_2, Rotation(7));
            let diff_10000 = meta.query_advice(adv_2, Rotation(8));
            
            let constraint_flag_5star_range = flag_5star.clone() * (Expression::Constant(Fp::from(100)) - random_mod_10000.clone() - diff_100.clone());
            let constraint_flag_4star_range_low = flag_4star.clone() * (random_mod_10000.clone() - Expression::Constant(Fp::from(100)) - diff_400_low.clone());
            let constraint_flag_4star_range_high = flag_4star.clone() * (Expression::Constant(Fp::from(400)) - random_mod_10000.clone() - diff_400_high.clone());
            let constraint_flag_3star_range_low = flag_3star.clone() * (random_mod_10000.clone() - Expression::Constant(Fp::from(400)) - diff_5200_low.clone());
            let constraint_flag_3star_range_high = flag_3star.clone() * (Expression::Constant(Fp::from(5200)) - random_mod_10000.clone() - diff_5200_high.clone());
            let constraint_flag_2star_range = flag_2star.clone() * (random_mod_10000.clone() - Expression::Constant(Fp::from(5200)) - diff_10000.clone());
            
            let constraint_rarity_5star = flag_5star.clone() * (computed_rarity.clone() - Expression::Constant(Fp::from(4)));
            let constraint_rarity_4star = flag_4star.clone() * (computed_rarity.clone() - Expression::Constant(Fp::from(3)));
            let constraint_rarity_3star = flag_3star.clone() * (computed_rarity.clone() - Expression::Constant(Fp::from(2)));
            let constraint_rarity_2star = flag_2star.clone() * (computed_rarity.clone() - Expression::Constant(Fp::from(1)));
            
            vec![
                s.clone() * constraint1,
                s.clone() * constraint2,
                s.clone() * constraint_flag_5star,
                s.clone() * constraint_flag_4star,
                s.clone() * constraint_flag_3star,
                s.clone() * constraint_flag_2star,
                s.clone() * constraint_flags_sum,
                s.clone() * constraint_flag_5star_range,
                s.clone() * constraint_flag_4star_range_low,
                s.clone() * constraint_flag_4star_range_high,
                s.clone() * constraint_flag_3star_range_low,
                s.clone() * constraint_flag_3star_range_high,
                s.clone() * constraint_flag_2star_range,
                s.clone() * constraint_rarity_5star,
                s.clone() * constraint_rarity_4star,
                s.clone() * constraint_rarity_3star,
                s * constraint_rarity_2star,
            ]
        });

        MySingleGachaConfig {
            adv: [adv_0, adv_1, adv_2],
            divisor,
            inst,
            selector,
            rarity_selector,
        }
    }

    fn next_value(prev_val: Value<Fp>) -> Value<Fp> {
        prev_val.map(|a| a * Fp::from(MY_MULTIPLIER) + Fp::from(MY_INCREMENT))
    }

    fn assign_first_row(
        &self,
        mut layouter: impl Layouter<Fp>,
        seed: Value<Fp>,
    ) -> Result<(MyCell, MyCell), Error> {
        layouter.assign_region(
            || "my single lcg first row",
            |mut region| {
                let offset = 0;

                self.selector.enable(&mut region, offset)?;

                let seed_val = seed.map(rem_single);
                let next_val = Self::next_value(seed_val);
                let rem_val = next_val.map(rem_single);
                let quot_val = next_val.map(quot_single);

                region
                    .assign_advice(|| "seed", self.adv[0], offset, || seed_val)
                    .map(MyCell)?;
                let next_cell = region
                    .assign_advice(|| "next value mod m", self.adv[1], offset, || rem_val)
                    .map(MyCell)?;
                region.assign_advice(|| "quotient", self.divisor, offset, || quot_val)?;

                let computed_rarity = compute_rarity_from_random(rem_val);
                
                self.rarity_selector.enable(&mut region, offset + 1)?;
                
                let random_mod_10000_val = rem_val.map(|r| {
                    let repr = r.to_repr();
                    let r_u64 = u64::from_le_bytes([
                        repr[0], repr[1], repr[2], repr[3],
                        repr[4], repr[5], repr[6], repr[7],
                    ]);
                    Fp::from(r_u64 % 10000)
                });
                let quotient_10000_val = rem_val.map(|r| {
                    let repr = r.to_repr();
                    let r_u64 = u64::from_le_bytes([
                        repr[0], repr[1], repr[2], repr[3],
                        repr[4], repr[5], repr[6], repr[7],
                    ]);
                    Fp::from(r_u64 / 10000)
                });
                
                region.assign_advice(|| "random_mod_10000", self.adv[2], offset + 1, || random_mod_10000_val)?;
                region.assign_advice(|| "quotient_10000", self.divisor, offset + 1, || quotient_10000_val)?;
                
                let computed_rarity_val = computed_rarity.map(|rc| Fp::from(rc));
                let rarity_cell = region
                    .assign_advice(|| "computed_rarity", self.adv[2], offset + 2, || computed_rarity_val)
                    .map(MyCell)?;
                
                region.assign_advice(|| "placeholder", self.adv[2], offset + 3, || Value::known(Fp::zero()))?;
                
                let flags_and_diffs = random_mod_10000_val.map(|rm| {
                    let repr = rm.to_repr();
                    let rm_u64 = u64::from_le_bytes([
                        repr[0], repr[1], repr[2], repr[3],
                        repr[4], repr[5], repr[6], repr[7],
                    ]);
                    
                    let flag_5star = if rm_u64 < 100 { Fp::one() } else { Fp::zero() };
                    let flag_4star = if rm_u64 >= 100 && rm_u64 < 400 { Fp::one() } else { Fp::zero() };
                    let flag_3star = if rm_u64 >= 400 && rm_u64 < 5200 { Fp::one() } else { Fp::zero() };
                    let flag_2star = if rm_u64 >= 5200 && rm_u64 < 10000 { Fp::one() } else { Fp::zero() };
                    
                    let diff_100 = if rm_u64 < 100 { Fp::from(100 - rm_u64) } else { Fp::zero() };
                    let diff_400_low = if rm_u64 >= 100 { Fp::from(rm_u64 - 100) } else { Fp::zero() };
                    let diff_400_high = if rm_u64 < 400 { Fp::from(400 - rm_u64) } else { Fp::zero() };
                    let diff_5200_low = if rm_u64 >= 400 { Fp::from(rm_u64 - 400) } else { Fp::zero() };
                    let diff_5200_high = if rm_u64 < 5200 { Fp::from(5200 - rm_u64) } else { Fp::zero() };
                    let diff_10000 = if rm_u64 >= 5200 { Fp::from(rm_u64 - 5200) } else { Fp::zero() };
                    
                    (flag_5star, flag_4star, flag_3star, flag_2star,
                     diff_100, diff_400_low, diff_400_high,
                     diff_5200_low, diff_5200_high, diff_10000)
                });
                
                let flag_5star_val = flags_and_diffs.map(|(f5, _, _, _, _, _, _, _, _, _)| f5);
                let flag_4star_val = flags_and_diffs.map(|(_, f4, _, _, _, _, _, _, _, _)| f4);
                let flag_3star_val = flags_and_diffs.map(|(_, _, f3, _, _, _, _, _, _, _)| f3);
                let flag_2star_val = flags_and_diffs.map(|(_, _, _, f2, _, _, _, _, _, _)| f2);
                let diff_100_val = flags_and_diffs.map(|(_, _, _, _, d100, _, _, _, _, _)| d100);
                let diff_400_low_val = flags_and_diffs.map(|(_, _, _, _, _, d400l, _, _, _, _)| d400l);
                let diff_400_high_val = flags_and_diffs.map(|(_, _, _, _, _, _, d400h, _, _, _)| d400h);
                let diff_5200_low_val = flags_and_diffs.map(|(_, _, _, _, _, _, _, d5200l, _, _)| d5200l);
                let diff_5200_high_val = flags_and_diffs.map(|(_, _, _, _, _, _, _, _, d5200h, _)| d5200h);
                let diff_10000_val = flags_and_diffs.map(|(_, _, _, _, _, _, _, _, _, d10000)| d10000);
                
                region.assign_advice(|| "flag_5star", self.divisor, offset + 4, || flag_5star_val)?;
                region.assign_advice(|| "flag_4star", self.divisor, offset + 5, || flag_4star_val)?;
                region.assign_advice(|| "flag_3star", self.divisor, offset + 6, || flag_3star_val)?;
                region.assign_advice(|| "flag_2star", self.divisor, offset + 7, || flag_2star_val)?;
                
                region.assign_advice(|| "diff_100", self.adv[2], offset + 4, || diff_100_val)?;
                region.assign_advice(|| "diff_400_low", self.adv[2], offset + 5, || diff_400_low_val)?;
                region.assign_advice(|| "diff_400_high", self.adv[2], offset + 6, || diff_400_high_val)?;
                region.assign_advice(|| "diff_5200_low", self.adv[2], offset + 7, || diff_5200_low_val)?;
                region.assign_advice(|| "diff_5200_high", self.adv[2], offset + 8, || diff_5200_high_val)?;
                region.assign_advice(|| "diff_10000", self.adv[2], offset + 9, || diff_10000_val)?;
                

                Ok((next_cell, rarity_cell))
            },
        )
    }

    fn expose_public(
        &self,
        mut layouter: impl Layouter<Fp>,
        cell: &MyCell,
        row: usize,
    ) -> Result<(), Error> {
        layouter.constrain_instance(cell.0.cell(), self.inst, row)
    }
}

#[derive(Debug, Default)]
pub struct MySingleGachaCircuit {
    pub seed: Value<Fp>,
}

impl Circuit<Fp> for MySingleGachaCircuit {
    type Config = MySingleGachaConfig;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self::default()
    }

    fn configure(meta: &mut ConstraintSystem<Fp>) -> Self::Config {
        MySingleGachaConfig::configure(meta)
    }

    fn synthesize(
        &self,
        config: Self::Config,
        mut layouter: impl Layouter<Fp>,
    ) -> Result<(), Error> {
        let (out_cell, rarity_cell) = config.assign_first_row(layouter.namespace(|| "first row"), self.seed)?;

        config.expose_public(layouter.namespace(|| "out"), &out_cell, 0)?;
        config.expose_public(layouter.namespace(|| "rarity"), &rarity_cell, 1)?;

        Ok(())
    }
}

fn rem_single(input: Fp) -> Fp {
    let divisor: usize = (MY_MODULUS_EXPONENT / 8).try_into().unwrap();
    let repr = input.to_repr();
    let mut rem_repr: [u8; 32] = [0; 32];
    for i in 0..divisor {
        rem_repr[i] = repr[i];
    }
    Fp::from_repr(rem_repr).unwrap()
}

fn quot_single(input: Fp) -> Fp {
    let divisor: usize = (MY_MODULUS_EXPONENT / 8).try_into().unwrap();
    let repr = input.to_repr();
    let mut ret_repr: [u8; 32] = [0; 32];
    for i in 0..(32 - divisor) {
        ret_repr[i] = repr[i + divisor];
    }
    Fp::from_repr(ret_repr).unwrap()
}

fn compute_rarity_from_random(random_val: Value<Fp>) -> Value<u64> {
    random_val.map(|r| {
        let v = rem_single(r);
        let repr = v.to_repr();
        let v_u64 = u64::from_le_bytes([
            repr[0], repr[1], repr[2], repr[3],
            repr[4], repr[5], repr[6], repr[7],
        ]) % 10000;
        pity_compute_rarity(v_u64)
    })
}

pub fn my_single_get_random(seed: u64, number_of_iter: u64) -> u64 {
    let mut ret = seed % MY_MODULUS;
    for _ in 0..number_of_iter {
        ret = (ret * MY_MULTIPLIER + MY_INCREMENT) % MY_MODULUS;
    }
    ret
}

pub fn my_single_generate_setup_params(k: u32) -> Params<EqAffine> {
    Params::<EqAffine>::new(k)
}

pub fn my_single_generate_keys(
    params: &Params<EqAffine>,
    circuit: &MySingleGachaCircuit,
) -> (ProvingKey<EqAffine>, VerifyingKey<EqAffine>) {
    let vk = keygen_vk(params, circuit).expect("vk should not fail");
    let pk = keygen_pk(params, vk.clone(), circuit).expect("pk should not fail");
    (pk, vk)
}

pub fn my_single_empty_circuit() -> MySingleGachaCircuit {
    MySingleGachaCircuit {
        seed: Value::unknown(),
    }
}

pub fn my_single_create_circuit(seed: u64) -> MySingleGachaCircuit {
    MySingleGachaCircuit {
        seed: Value::known(Fp::from(seed)),
    }
}

pub fn my_single_generate_proof(
    params: &Params<EqAffine>,
    pk: &ProvingKey<EqAffine>,
    circuit: MySingleGachaCircuit,
    pub_input: &Vec<Fp>,
) -> Vec<u8> {
    let mut transcript = Blake2bWrite::<_, _, Challenge255<_>>::init(vec![]);
    create_proof(
        params,
        pk,
        &[circuit],
        &[&[pub_input]],
        OsRng,
        &mut transcript,
    )
    .expect("Prover should not fail");
    transcript.finalize()
}

pub fn my_single_verify(
    params: &Params<EqAffine>,
    vk: &VerifyingKey<EqAffine>,
    pub_input: &Vec<Fp>,
    proof: Vec<u8>,
) -> Result<(), Error> {
    let strategy = SingleVerifier::new(params);
    let mut transcript = Blake2bRead::<_, _, Challenge255<_>>::init(&proof[..]);
    verify_proof(params, vk, strategy, &[&[pub_input]], &mut transcript)
}

#[cfg(test)]
mod tests {
    use super::*;
    use halo2_proofs::{dev::MockProver, pasta::Fp};

    #[test]
    fn test_my_single_random_consistency() {
        let seed: u64 = 123456789;
        let number_of_iter: u64 = 1;

        let expected = my_single_get_random(seed, number_of_iter);

        let circuit = MySingleGachaCircuit {
            seed: Value::known(Fp::from(seed)),
        };

        let public_inputs = vec![Fp::from(expected)];
        let prover = MockProver::run(10, &circuit, vec![public_inputs]).unwrap();
        prover.assert_satisfied();
    }
}