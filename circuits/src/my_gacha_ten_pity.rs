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

pub const TEN_PITY_DRAWS: usize = 10;
pub const TEN_PITY_MODULUS_EXPONENT: u64 = 32;
pub const TEN_PITY_MODULUS: u64 = 1 << TEN_PITY_MODULUS_EXPONENT;
pub const TEN_PITY_MULTIPLIER: u64 = 1664525;
pub const TEN_PITY_INCREMENT: u64 = 1013904223;

use crate::my_gacha_pity::{pity_compute_rarity, pity_compute_final_rarity, pity_compute_streak_next};

#[derive(Clone, Debug)]
struct TenPityCell(AssignedCell<Fp, Fp>);

#[derive(Clone, Debug)]
pub struct MyTenPityGachaConfig {
    adv: [Column<Advice>; 4],
    divisor: Column<Advice>,
    inst: Column<Instance>,
    selector: Selector,
    pity_selector: Selector,
}

impl MyTenPityGachaConfig {
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

        meta.create_gate("ten pity lcg", |meta| {
            let x = meta.query_advice(adv_0, Rotation::cur());
            let y = meta.query_advice(adv_1, Rotation::cur());
            let d = meta.query_advice(divisor, Rotation::cur());

            let a = Expression::Constant(Fp::from(TEN_PITY_MULTIPLIER));
            let m = Expression::Constant(Fp::from(TEN_PITY_MODULUS));
            let c = Expression::Constant(Fp::from(TEN_PITY_INCREMENT));

            let s = meta.query_selector(selector);
            vec![s * (a * x + c - y - m * d)]
        });

        meta.create_gate("ten pity and rarity", |meta| {
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

        MyTenPityGachaConfig {
            adv: [adv_0, adv_1, adv_2, adv_3],
            divisor,
            inst,
            selector,
            pity_selector,
        }
    }

    fn next_value(prev_val: Value<Fp>) -> Value<Fp> {
        prev_val.map(|a| a * Fp::from(TEN_PITY_MULTIPLIER) + Fp::from(TEN_PITY_INCREMENT))
    }

    fn assign_first_draw(
        &self,
        mut layouter: impl Layouter<Fp>,
        seed: Value<Fp>,
        streak_prev: Value<Fp>,
    ) -> Result<(TenPityCell, TenPityCell, TenPityCell, Value<Fp>), Error> {
        layouter.assign_region(
            || "ten pity first draw",
            |mut region| {
                let offset = 0;
                self.selector.enable(&mut region, offset)?;

                let seed_val = seed.map(rem_ten_pity);
                let next_val = Self::next_value(seed_val);
                let rem_val = next_val.map(rem_ten_pity);
                let quot_val = next_val.map(quot_ten_pity);

                region.assign_advice(|| "seed", self.adv[0], offset, || seed_val)?;
                let streak_prev_cell = region
                    .assign_advice(|| "streak_prev", self.adv[2], offset, || streak_prev)
                    .map(TenPityCell)?;
                let random_cell = region
                    .assign_advice(|| "random", self.adv[1], offset, || rem_val)
                    .map(TenPityCell)?;
                region.assign_advice(|| "quotient", self.divisor, offset, || quot_val)?;

                let computed_rarity = compute_rarity_from_random(rem_val);
                let final_rarity_val = compute_final_rarity_value(streak_prev, computed_rarity);
                
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
                
                let rarity_cell = region
                    .assign_advice(|| "final_rarity", self.adv[0], offset + 1, || final_rarity_val)
                    .map(TenPityCell)?;

                let streak_next_val = compute_streak_next_value(streak_prev, final_rarity_val);
                region.assign_advice(|| "streak_next", self.adv[1], offset + 1, || streak_next_val)?;
                
                let computed_rarity_val = computed_rarity.map(|rc| Fp::from(rc));
                region.assign_advice(|| "computed_rarity", self.adv[3], offset + 2, || computed_rarity_val)?;
                
                let pity_active_flag_val = streak_prev.map(|sp| {
                    let repr = sp.to_repr();
                    let sp_u64 = u64::from_le_bytes([
                        repr[0], repr[1], repr[2], repr[3],
                        repr[4], repr[5], repr[6], repr[7],
                    ]);
                    if sp_u64 >= crate::my_gacha_pity::PITY_THRESHOLD {
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

                Ok((streak_prev_cell, random_cell, rarity_cell, streak_next_val))
            },
        )
    }

    fn assign_next_draw(
        &self,
        mut layouter: impl Layouter<Fp>,
        prev: &TenPityCell,
        streak_prev: Value<Fp>,
    ) -> Result<(TenPityCell, TenPityCell, Value<Fp>), Error> {
        layouter.assign_region(
            || "ten pity next draw",
            |mut region| {
                let offset = 0;
                self.selector.enable(&mut region, offset)?;

                let prev_val = prev.0.value().copied();
                let next_val = Self::next_value(prev_val);
                let rem_val = next_val.map(rem_ten_pity);
                let quot_val = next_val.map(quot_ten_pity);

                prev.0.copy_advice(|| "prev", &mut region, self.adv[0], offset)?;
                region.assign_advice(|| "streak_prev", self.adv[2], offset, || streak_prev)?;
                let random_cell = region
                    .assign_advice(|| "random", self.adv[1], offset, || rem_val)
                    .map(TenPityCell)?;
                region.assign_advice(|| "quotient", self.divisor, offset, || quot_val)?;

                let computed_rarity = compute_rarity_from_random(rem_val);
                let final_rarity_val = compute_final_rarity_value(streak_prev, computed_rarity);
                
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
                
                let rarity_cell = region
                    .assign_advice(|| "final_rarity", self.adv[0], offset + 1, || final_rarity_val)
                    .map(TenPityCell)?;

                let streak_next_val = compute_streak_next_value(streak_prev, final_rarity_val);
                region.assign_advice(|| "streak_next", self.adv[1], offset + 1, || streak_next_val)?;
                
                let computed_rarity_val = computed_rarity.map(|rc| Fp::from(rc));
                region.assign_advice(|| "computed_rarity", self.adv[3], offset + 2, || computed_rarity_val)?;
                
                let pity_active_flag_val = streak_prev.map(|sp| {
                    let repr = sp.to_repr();
                    let sp_u64 = u64::from_le_bytes([
                        repr[0], repr[1], repr[2], repr[3],
                        repr[4], repr[5], repr[6], repr[7],
                    ]);
                    if sp_u64 >= crate::my_gacha_pity::PITY_THRESHOLD {
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

                Ok((random_cell, rarity_cell, streak_next_val))
            },
        )
    }

    fn expose_public(
        &self,
        mut layouter: impl Layouter<Fp>,
        cell: &TenPityCell,
        row: usize,
    ) -> Result<(), Error> {
        layouter.constrain_instance(cell.0.cell(), self.inst, row)
    }
}

fn rem_ten_pity(input: Fp) -> Fp {
    let divisor: usize = (TEN_PITY_MODULUS_EXPONENT / 8).try_into().unwrap();
    let repr = input.to_repr();
    let mut rem_repr: [u8; 32] = [0; 32];
    for i in 0..divisor {
        rem_repr[i] = repr[i];
    }
    Fp::from_repr(rem_repr).unwrap()
}

fn quot_ten_pity(input: Fp) -> Fp {
    let divisor: usize = (TEN_PITY_MODULUS_EXPONENT / 8).try_into().unwrap();
    let repr = input.to_repr();
    let mut ret_repr: [u8; 32] = [0; 32];
    for i in 0..(32 - divisor) {
        ret_repr[i] = repr[i + divisor];
    }
    Fp::from_repr(ret_repr).unwrap()
}

fn compute_rarity_from_random(random_val: Value<Fp>) -> Value<u64> {
    random_val.map(|r| {
        let v = rem_ten_pity(r);
        let repr = v.to_repr();
        let v_u64 = u64::from_le_bytes([
            repr[0], repr[1], repr[2], repr[3],
            repr[4], repr[5], repr[6], repr[7],
        ]) % 10000;
        pity_compute_rarity(v_u64)
    })
}

fn compute_final_rarity_value(streak_prev: Value<Fp>, computed_rarity: Value<u64>) -> Value<Fp> {
    computed_rarity.map(|rc_u64| {
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

fn compute_streak_next_value(streak_prev: Value<Fp>, final_rarity: Value<Fp>) -> Value<Fp> {
    final_rarity.map(|fr_fp| {
        streak_prev.map(|sp_fp| {
            let repr_fr = fr_fp.to_repr();
            let final_r_u64 = u64::from_le_bytes([
                repr_fr[0], repr_fr[1], repr_fr[2], repr_fr[3],
                repr_fr[4], repr_fr[5], repr_fr[6], repr_fr[7],
            ]);
            let repr_sp = sp_fp.to_repr();
            let sp_u64 = u64::from_le_bytes([
                repr_sp[0], repr_sp[1], repr_sp[2], repr_sp[3],
                repr_sp[4], repr_sp[5], repr_sp[6], repr_sp[7],
            ]);
            let sn = pity_compute_streak_next(sp_u64, final_r_u64);
            Fp::from(sn)
        })
    })
    .and_then(|inner| inner)
}

#[derive(Debug, Default)]
pub struct MyTenPityGachaCircuit {
    pub seed: Value<Fp>,
    pub streak_prev: Value<Fp>,
}

impl Circuit<Fp> for MyTenPityGachaCircuit {
    type Config = MyTenPityGachaConfig;
    type FloorPlanner = SimpleFloorPlanner;

    fn without_witnesses(&self) -> Self {
        Self::default()
    }

    fn configure(meta: &mut ConstraintSystem<Fp>) -> Self::Config {
        MyTenPityGachaConfig::configure(meta)
    }

    fn synthesize(
        &self,
        config: Self::Config,
        mut layouter: impl Layouter<Fp>,
    ) -> Result<(), Error> {
        let (streak_prev_cell, random_cell_0, rarity_cell_0, streak_after_0) = config.assign_first_draw(
            layouter.namespace(|| "first draw"),
            self.seed,
            self.streak_prev,
        )?;
        
        config.expose_public(layouter.namespace(|| "streak_prev"), &streak_prev_cell, 0)?;
        config.expose_public(layouter.namespace(|| "random_0"), &random_cell_0, 1)?;
        config.expose_public(layouter.namespace(|| "rarity_0"), &rarity_cell_0, TEN_PITY_DRAWS + 1)?;

        let mut streak_current = streak_after_0;
        let mut prev_random = random_cell_0;
        
        for i in 1..TEN_PITY_DRAWS {
            let (random_cell, rarity_cell, streak_next) = config.assign_next_draw(
                layouter.namespace(|| format!("draw {}", i)),
                &prev_random,
                streak_current,
            )?;
            
            config.expose_public(layouter.namespace(|| format!("random_{}", i)), &random_cell, i + 1)?;
            config.expose_public(layouter.namespace(|| format!("rarity_{}", i)), &rarity_cell, TEN_PITY_DRAWS + i + 1)?;
            
            prev_random = random_cell;
            streak_current = streak_next;
        }

        let streak_next_cell = layouter.assign_region(|| "streak_next_final", |mut region| {
            region.assign_advice(|| "streak_next", config.adv[0], 0, || streak_current).map(TenPityCell)
        })?;
        
        config.expose_public(
            layouter.namespace(|| "streak_next"),
            &streak_next_cell,
            2 * TEN_PITY_DRAWS + 1,
        )?;

        Ok(())
    }
}

pub fn ten_pity_get_randoms(seed: u64) -> [u64; TEN_PITY_DRAWS] {
    let mut ret = seed % TEN_PITY_MODULUS;
    let mut outs = [0u64; TEN_PITY_DRAWS];
    for i in 0..TEN_PITY_DRAWS {
        ret = (ret * TEN_PITY_MULTIPLIER + TEN_PITY_INCREMENT) % TEN_PITY_MODULUS;
        outs[i] = ret;
    }
    outs
}

pub fn ten_pity_compute_all(
    seed: u64,
    streak_prev: u64,
) -> ([u64; TEN_PITY_DRAWS], [u64; TEN_PITY_DRAWS], u64) {
    let randoms = ten_pity_get_randoms(seed);
    let mut rarities = [0u64; TEN_PITY_DRAWS];
    let mut streak_current = streak_prev;
    
    for i in 0..TEN_PITY_DRAWS {
        let computed_rarity = pity_compute_rarity(randoms[i]);
        let final_rarity = pity_compute_final_rarity(streak_current, computed_rarity);
        rarities[i] = final_rarity;
        streak_current = pity_compute_streak_next(streak_current, final_rarity);
    }
    
    (randoms, rarities, streak_current)
}

pub fn ten_pity_generate_setup_params(k: u32) -> Params<EqAffine> {
    Params::<EqAffine>::new(k)
}

pub fn ten_pity_empty_circuit() -> MyTenPityGachaCircuit {
    MyTenPityGachaCircuit {
        seed: Value::unknown(),
        streak_prev: Value::unknown(),
    }
}

pub fn ten_pity_create_circuit(seed: u64, streak_prev: u64) -> MyTenPityGachaCircuit {
    MyTenPityGachaCircuit {
        seed: Value::known(Fp::from(seed)),
        streak_prev: Value::known(Fp::from(streak_prev)),
    }
}

pub fn ten_pity_generate_keys(
    params: &Params<EqAffine>,
    circuit: &MyTenPityGachaCircuit,
) -> (ProvingKey<EqAffine>, VerifyingKey<EqAffine>) {
    let vk = keygen_vk(params, circuit).expect("vk should not fail");
    let pk = keygen_pk(params, vk.clone(), circuit).expect("pk should not fail");
    (pk, vk)
}

pub fn ten_pity_generate_proof(
    params: &Params<EqAffine>,
    pk: &ProvingKey<EqAffine>,
    circuit: MyTenPityGachaCircuit,
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

pub fn ten_pity_verify(
    params: &Params<EqAffine>,
    vk: &VerifyingKey<EqAffine>,
    pub_input: &Vec<Fp>,
    proof: Vec<u8>,
) -> Result<(), Error> {
    let strategy = SingleVerifier::new(params);
    let mut transcript = Blake2bRead::<_, _, Challenge255<_>>::init(&proof[..]);
    verify_proof(params, vk, strategy, &[&[pub_input]], &mut transcript)
}

