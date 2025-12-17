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

pub const PITY_THRESHOLD: u64 = 50;
pub const PITY_MODULUS_EXPONENT: u64 = 32;
pub const PITY_MODULUS: u64 = 1 << PITY_MODULUS_EXPONENT;
pub const PITY_MULTIPLIER: u64 = 1103515245;
pub const PITY_INCREMENT: u64 = 12345;

pub const RARITY_5STAR_THRESHOLD: u64 = 100;
pub const RARITY_4STAR_THRESHOLD: u64 = 400;
pub const RARITY_3STAR_THRESHOLD: u64 = 5200;
pub const RARITY_2STAR_THRESHOLD: u64 = 10000;

#[derive(Clone, Debug)]
struct PityCell(AssignedCell<Fp, Fp>);

#[derive(Clone, Debug)]
pub struct MyPityGachaConfig {
    adv: [Column<Advice>; 4],
    divisor: Column<Advice>,
    inst: Column<Instance>,
    selector: Selector,
    pity_selector: Selector,
}

impl MyPityGachaConfig {
    pub fn configure(meta: &mut ConstraintSystem<Fp>) -> Self {
        let adv_0 = meta.advice_column();
        let adv_1 = meta.advice_column();
        let adv_2 = meta.advice_column();
        let adv_3 = meta.advice_column();
        let divisor = meta.advice_column();
        let selector = meta.selector();
        let pity_selector = meta.selector();
        let inst = meta.instance_column();

        meta.enable_equality(adv_0);
        meta.enable_equality(adv_1);
        meta.enable_equality(adv_2);
        meta.enable_equality(adv_3);
        meta.enable_equality(inst);

        meta.create_gate("pity lcg", |meta| {
            let x = meta.query_advice(adv_0, Rotation::cur());
            let y = meta.query_advice(adv_1, Rotation::cur());
            let d = meta.query_advice(divisor, Rotation::cur());

            let a = Expression::Constant(Fp::from(PITY_MULTIPLIER));
            let m = Expression::Constant(Fp::from(PITY_MODULUS));
            let c = Expression::Constant(Fp::from(PITY_INCREMENT));

            let s = meta.query_selector(selector);
            vec![s * (a * x + c - y - m * d)]
        });

        meta.create_gate("pity and rarity", |meta| {
            let random = meta.query_advice(adv_1, Rotation(-1));
            let streak_prev = meta.query_advice(adv_2, Rotation(-1));
            let random_mod_10000 = meta.query_advice(adv_3, Rotation::cur());
            let computed_rarity = meta.query_advice(adv_3, Rotation::next());
            let final_rarity = meta.query_advice(adv_0, Rotation::cur());
            let streak_next = meta.query_advice(adv_1, Rotation::cur());

            let s = meta.query_selector(pity_selector);
            
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
            
            let diff_100 = meta.query_advice(adv_3, Rotation(3));
            let diff_400_low = meta.query_advice(adv_3, Rotation(4));
            let diff_400_high = meta.query_advice(adv_3, Rotation(5));
            let diff_5200_low = meta.query_advice(adv_3, Rotation(6));
            let diff_5200_high = meta.query_advice(adv_3, Rotation(7));
            let diff_10000 = meta.query_advice(adv_3, Rotation(8));
            
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
            
            let pity_active_flag = meta.query_advice(divisor, Rotation::next());
            let constraint_pity_flag = pity_active_flag.clone() * (pity_active_flag.clone() - Expression::Constant(Fp::one()));
            let constraint_pity_rarity = pity_active_flag.clone() * (final_rarity.clone() - Expression::Constant(Fp::from(4)));
            let constraint_no_pity_rarity = (Expression::Constant(Fp::one()) - pity_active_flag) * (final_rarity - computed_rarity);
            
            let is_5star_flag = meta.query_advice(divisor, Rotation(9));
            let constraint_5star_flag = is_5star_flag.clone() * (is_5star_flag.clone() - Expression::Constant(Fp::one()));
            let constraint_streak_reset = is_5star_flag.clone() * streak_next.clone();
            let constraint_streak_increment = (Expression::Constant(Fp::one()) - is_5star_flag) * (streak_next - streak_prev - Expression::Constant(Fp::one()));
            
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
                s.clone() * constraint_rarity_2star,
                s.clone() * constraint_pity_flag,
                s.clone() * constraint_pity_rarity,
                s.clone() * constraint_no_pity_rarity,
                s.clone() * constraint_5star_flag,
                s.clone() * constraint_streak_reset,
                s * constraint_streak_increment,
            ]
        });

        MyPityGachaConfig {
            adv: [adv_0, adv_1, adv_2, adv_3],
            divisor,
            inst,
            selector,
            pity_selector,
        }
    }

    fn next_value(prev_val: Value<Fp>) -> Value<Fp> {
        prev_val.map(|a| a * Fp::from(PITY_MULTIPLIER) + Fp::from(PITY_INCREMENT))
    }

    fn compute_final_rarity_in_closure(streak_prev: Value<Fp>, rarity_code: Value<u64>) -> Value<Fp> {
        rarity_code.map(|rc_u64| {
            streak_prev.map(|sp_fp| {
                let repr = sp_fp.to_repr();
                let sp_u64 = u64::from_le_bytes([
                    repr[0], repr[1], repr[2], repr[3],
                    repr[4], repr[5], repr[6], repr[7],
                ]);
                let final_r = pity_compute_final_rarity(sp_u64, rc_u64);
                Fp::from(final_r)
            })
        })
        .and_then(|inner| inner)
    }

    fn compute_streak_next_in_closure(streak_prev: Value<Fp>, rarity_code: Value<u64>) -> Value<Fp> {
        rarity_code.map(|rc_u64| {
            streak_prev.map(|sp_fp| {
                let repr = sp_fp.to_repr();
                let sp_u64 = u64::from_le_bytes([
                    repr[0], repr[1], repr[2], repr[3],
                    repr[4], repr[5], repr[6], repr[7],
                ]);
                let final_r = pity_compute_final_rarity(sp_u64, rc_u64);
                let sn = pity_compute_streak_next(sp_u64, final_r);
                Fp::from(sn)
            })
        })
        .and_then(|inner| inner)
    }

    fn compute_rarity_from_random(random_val: Value<Fp>) -> Value<u64> {
        random_val.map(|r| {
            let v = rem_pity(r);
            let repr = v.to_repr();
            let v_u64 = u64::from_le_bytes([
                repr[0], repr[1], repr[2], repr[3],
                repr[4], repr[5], repr[6], repr[7],
            ]) % 10000;
            if v_u64 < RARITY_5STAR_THRESHOLD {
                4
            } else if v_u64 < RARITY_4STAR_THRESHOLD {
                3
            } else if v_u64 < RARITY_3STAR_THRESHOLD {
                2
            } else {
                1
            }
        })
    }

    fn assign_pity_draw(
        &self,
        mut layouter: impl Layouter<Fp>,
        seed: Value<Fp>,
        streak_prev: Value<Fp>,
    ) -> Result<(PityCell, PityCell, PityCell, PityCell), Error> {
        layouter.assign_region(
            || "pity draw",
            |mut region| {
                let offset = 0;

                self.selector.enable(&mut region, offset)?;

                let seed_val = seed.map(rem_pity);
                let next_val = Self::next_value(seed_val);
                let rem_val = next_val.map(rem_pity);
                let quot_val = next_val.map(quot_pity);

                region.assign_advice(|| "seed", self.adv[0], offset, || seed_val)?;
                let random_cell = region
                    .assign_advice(|| "random", self.adv[1], offset, || rem_val)
                    .map(PityCell)?;
                region.assign_advice(|| "quotient", self.divisor, offset, || quot_val)?;

                let rarity_code = Self::compute_rarity_from_random(rem_val);

                let streak_prev_cell = region
                    .assign_advice(|| "streak_prev", self.adv[2], offset, || streak_prev)
                    .map(PityCell)?;
                
                self.pity_selector.enable(&mut region, offset + 1)?;
                
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
                
                region.assign_advice(|| "random_mod_10000", self.adv[3], offset + 1, || random_mod_10000_val)?;
                region.assign_advice(|| "quotient_10000", self.divisor, offset + 1, || quotient_10000_val)?;
                
                let final_rarity_val = Self::compute_final_rarity_in_closure(streak_prev, rarity_code);
                
                let rarity_cell = region
                    .assign_advice(|| "final_rarity", self.adv[0], offset + 1, || final_rarity_val)
                    .map(PityCell)?;

                let streak_next_cell = region
                    .assign_advice(|| "streak_next", self.adv[1], offset + 1, || {
                        Self::compute_streak_next_in_closure(streak_prev, rarity_code)
                    })
                    .map(PityCell)?;
                
                let computed_rarity_val = rarity_code.map(|rc| Fp::from(rc));
                region.assign_advice(|| "computed_rarity", self.adv[3], offset + 2, || computed_rarity_val)?;
                
                let pity_active_flag_val = streak_prev.map(|sp| {
                    let repr = sp.to_repr();
                    let sp_u64 = u64::from_le_bytes([
                        repr[0], repr[1], repr[2], repr[3],
                        repr[4], repr[5], repr[6], repr[7],
                    ]);
                    if sp_u64 >= PITY_THRESHOLD {
                        Fp::one()
                    } else {
                        Fp::zero()
                    }
                });
                region.assign_advice(|| "pity_active_flag", self.divisor, offset + 2, || pity_active_flag_val)?;
                
                region.assign_advice(|| "placeholder", self.adv[3], offset + 3, || Value::known(Fp::zero()))?;
                
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
                
                region.assign_advice(|| "diff_100", self.adv[3], offset + 4, || diff_100_val)?;
                region.assign_advice(|| "diff_400_low", self.adv[3], offset + 5, || diff_400_low_val)?;
                region.assign_advice(|| "diff_400_high", self.adv[3], offset + 6, || diff_400_high_val)?;
                region.assign_advice(|| "diff_5200_low", self.adv[3], offset + 7, || diff_5200_low_val)?;
                region.assign_advice(|| "diff_5200_high", self.adv[3], offset + 8, || diff_5200_high_val)?;
                region.assign_advice(|| "diff_10000", self.adv[3], offset + 9, || diff_10000_val)?;
                
                let is_5star_flag_val = final_rarity_val.map(|fr| {
                    let repr = fr.to_repr();
                    let fr_u64 = u64::from_le_bytes([
                        repr[0], repr[1], repr[2], repr[3],
                        repr[4], repr[5], repr[6], repr[7],
                    ]);
                    if fr_u64 == 4 {
                        Fp::one()
                    } else {
                        Fp::zero()
                    }
                });
                region.assign_advice(|| "is_5star_flag", self.divisor, offset + 10, || is_5star_flag_val)?;

                Ok((streak_prev_cell, random_cell, rarity_cell, streak_next_cell))
            },
        )
    }

    fn expose_public(
        &self,
        mut layouter: impl Layouter<Fp>,
        streak_prev_cell: &PityCell,
        random_cell: &PityCell,
        rarity_cell: &PityCell,
        streak_next_cell: &PityCell,
    ) -> Result<(), Error> {
        layouter.constrain_instance(streak_prev_cell.0.cell(), self.inst, 0)?;
        layouter.constrain_instance(random_cell.0.cell(), self.inst, 1)?;
        layouter.constrain_instance(rarity_cell.0.cell(), self.inst, 2)?;
        layouter.constrain_instance(streak_next_cell.0.cell(), self.inst, 3)?;
        Ok(())
    }
}


fn rem_pity(input: Fp) -> Fp {
    let divisor: usize = (PITY_MODULUS_EXPONENT / 8).try_into().unwrap();
    let repr = input.to_repr();
    let mut rem_repr: [u8; 32] = [0; 32];
    for i in 0..divisor {
        rem_repr[i] = repr[i];
    }
    Fp::from_repr(rem_repr).unwrap()
}

fn quot_pity(input: Fp) -> Fp {
    let divisor: usize = (PITY_MODULUS_EXPONENT / 8).try_into().unwrap();
    let repr = input.to_repr();
    let mut ret_repr: [u8; 32] = [0; 32];
    for i in 0..(32 - divisor) {
        ret_repr[i] = repr[i + divisor];
    }
    Fp::from_repr(ret_repr).unwrap()
}

#[derive(Debug, Default)]
pub struct MyPityGachaCircuit {
    pub seed: Value<Fp>,
    pub streak_prev: Value<Fp>,
}

impl Circuit<Fp> for MyPityGachaCircuit {
    type Config = MyPityGachaConfig;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self::default()
    }

    fn configure(meta: &mut ConstraintSystem<Fp>) -> Self::Config {
        MyPityGachaConfig::configure(meta)
    }

    fn synthesize(
        &self,
        config: Self::Config,
        mut layouter: impl Layouter<Fp>,
    ) -> Result<(), Error> {
        let (streak_prev_cell, random_cell, rarity_cell, streak_next_cell) = config.assign_pity_draw(
            layouter.namespace(|| "pity draw"),
            self.seed,
            self.streak_prev,
        )?;

        config.expose_public(
            layouter.namespace(|| "public outputs"),
            &streak_prev_cell,
            &random_cell,
            &rarity_cell,
            &streak_next_cell,
        )?;

        Ok(())
    }
}

pub fn pity_get_random(seed: u64, number_of_iter: u64) -> u64 {
    let mut ret = seed % PITY_MODULUS;
    for _ in 0..number_of_iter {
        ret = (ret * PITY_MULTIPLIER + PITY_INCREMENT) % PITY_MODULUS;
    }
    ret
}

pub fn pity_compute_rarity(random: u64) -> u64 {
    let v = random % 10000;
    if v < RARITY_5STAR_THRESHOLD {
        4
    } else if v < RARITY_4STAR_THRESHOLD {
        3
    } else if v < RARITY_3STAR_THRESHOLD {
        2
    } else {
        1
    }
}

pub fn pity_compute_streak_next(streak_prev: u64, rarity_code: u64) -> u64 {
    if rarity_code == 4 {
        0
    } else {
        streak_prev + 1
    }
}

pub fn pity_compute_final_rarity(streak_prev: u64, computed_rarity: u64) -> u64 {
    if streak_prev >= PITY_THRESHOLD {
        4
    } else {
        computed_rarity
    }
}

pub fn pity_generate_setup_params(k: u32) -> Params<EqAffine> {
    Params::<EqAffine>::new(k)
}

pub fn pity_generate_keys(
    params: &Params<EqAffine>,
    circuit: &MyPityGachaCircuit,
) -> (ProvingKey<EqAffine>, VerifyingKey<EqAffine>) {
    let vk = keygen_vk(params, circuit).expect("vk should not fail");
    let pk = keygen_pk(params, vk.clone(), circuit).expect("pk should not fail");
    (pk, vk)
}

pub fn pity_empty_circuit() -> MyPityGachaCircuit {
    MyPityGachaCircuit {
        seed: Value::unknown(),
        streak_prev: Value::unknown(),
    }
}

pub fn pity_create_circuit(seed: u64, streak_prev: u64) -> MyPityGachaCircuit {
    MyPityGachaCircuit {
        seed: Value::known(Fp::from(seed)),
        streak_prev: Value::known(Fp::from(streak_prev)),
    }
}

pub fn pity_generate_proof(
    params: &Params<EqAffine>,
    pk: &ProvingKey<EqAffine>,
    circuit: MyPityGachaCircuit,
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

pub fn pity_verify(
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
    fn test_pity_normal_draw_logic() {
        let seed: u64 = 123456789;
        let streak_prev: u64 = 30;

        let random = pity_get_random(seed, 1);
        let computed_rarity = pity_compute_rarity(random);
        let final_rarity = pity_compute_final_rarity(streak_prev, computed_rarity);
        let streak_next = pity_compute_streak_next(streak_prev, final_rarity);

        assert_eq!(final_rarity, computed_rarity);
        if final_rarity == 4 {
            assert_eq!(streak_next, 0);
        } else {
            assert_eq!(streak_next, streak_prev + 1);
        }
    }

    #[test]
    fn test_pity_guaranteed_5star_logic() {
        let seed: u64 = 999999;
        let streak_prev: u64 = PITY_THRESHOLD;

        let random = pity_get_random(seed, 1);
        let computed_rarity = pity_compute_rarity(random);
        let final_rarity = pity_compute_final_rarity(streak_prev, computed_rarity);
        let streak_next = pity_compute_streak_next(streak_prev, final_rarity);

        assert_eq!(final_rarity, 4, "Pity should guarantee 5★ when streak_prev == PITY_THRESHOLD");
        assert_eq!(streak_next, 0, "Streak should reset to 0 after getting 5★");
    }

    #[test]
    fn test_pity_streak_increment() {
        for streak_prev in 0..PITY_THRESHOLD {
            for rarity in 0..4 {
                let streak_next = pity_compute_streak_next(streak_prev, rarity);
                assert_eq!(streak_next, streak_prev + 1, 
                    "Streak should increment for rarity {}, streak {}", rarity, streak_prev);
            }
            let streak_next_5star = pity_compute_streak_next(streak_prev, 4);
            assert_eq!(streak_next_5star, 0, 
                "Streak should reset to 0 when getting 5★ at streak {}", streak_prev);
        }
    }
}

