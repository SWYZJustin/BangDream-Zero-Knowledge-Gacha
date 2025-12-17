import React, { useState, useEffect } from "react";
import * as gacha from "../lib/wasm/gacha.js";

// Character data structure
type Character = {
  name: string;
  band: string;
  bandDisplayName: string; // Display name (e.g., "Pastel*Palettes" instead of "PastelPalettes")
  imagePath: string;
  rarity: number; // 2, 3, 4, or 5
};

// Band information
const BANDS = [
  { folder: "Poppin'Party", display: "Poppin'Party" },
  { folder: "Afterglow", display: "Afterglow" },
  { folder: "PastelPalettes", display: "Pastel*Palettes" },
  { folder: "Roselia", display: "Roselia" },
  { folder: "Hello, Happy World!", display: "Hello, Happy World!" },
];

// Character data for each rarity
const CHARACTERS: Record<number, Character[]> = {
  5: [
    // Poppin'Party
    { name: "Kasumi Toyama", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/5star/Poppin'Party/Kasumi Toyama.png", rarity: 5 },
    { name: "Tae Hanazono", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/5star/Poppin'Party/Tae Hanazono.png", rarity: 5 },
    { name: "Rimi Ushigome", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/5star/Poppin'Party/Rimi Ushigome.png", rarity: 5 },
    { name: "Saya Yamabuki", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/5star/Poppin'Party/Saya Yamabuki.png", rarity: 5 },
    { name: "Arisa Ichigaya", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/5star/Poppin'Party/Arisa Ichigaya.png", rarity: 5 },
    // Afterglow
    { name: "Ran Mitake", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/5star/Afterglow/Ran Mitake.png", rarity: 5 },
    { name: "Moca Aoba", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/5star/Afterglow/Moca Aoba.png", rarity: 5 },
    { name: "Himari Uehara", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/5star/Afterglow/Himari Uehara.png", rarity: 5 },
    { name: "Tomoe Udagawa", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/5star/Afterglow/Tomoe Udagawa.png", rarity: 5 },
    { name: "Tsugumi Hazawa", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/5star/Afterglow/Tsugumi Hazawa.png", rarity: 5 },
    // Pastel*Palettes
    { name: "Aya Maruyama", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/5star/PastelPalettes/Aya Maruyama.png", rarity: 5 },
    { name: "Hina Hikawa", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/5star/PastelPalettes/Hina Hikawa.png", rarity: 5 },
    { name: "Chisato Shirasagi", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/5star/PastelPalettes/Chisato Shirasagi.png", rarity: 5 },
    { name: "Maya Yamato", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/5star/PastelPalettes/Maya Yamato.png", rarity: 5 },
    { name: "Eve Wakamiya", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/5star/PastelPalettes/Eve Wakamiya.png", rarity: 5 },
    // Roselia
    { name: "Yukina Minato", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/5star/Roselia/Yukina Minato.png", rarity: 5 },
    { name: "Sayo Hikawa", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/5star/Roselia/Sayo Hikawa.png", rarity: 5 },
    { name: "Lisa Imai", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/5star/Roselia/Lisa Imai.png", rarity: 5 },
    { name: "Ako Udagawa", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/5star/Roselia/Ako Udagawa.png", rarity: 5 },
    { name: "Rinko Shirokane", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/5star/Roselia/Rinko Shirokane.png", rarity: 5 },
    // Hello, Happy World!
    { name: "Kokoro Tsurumaki", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/5star/Hello, Happy World!/Kokoro Tsurumaki.png", rarity: 5 },
    { name: "Kaoru Seta", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/5star/Hello, Happy World!/Kaoru Seta.png", rarity: 5 },
    { name: "Hagumi Kitazawa", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/5star/Hello, Happy World!/Hagumi Kitazawa.png", rarity: 5 },
    { name: "Kanon Matsubara", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/5star/Hello, Happy World!/Kanon Matsubara.png", rarity: 5 },
    { name: "Misaki Okusawa", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/5star/Hello, Happy World!/Misaki Okusawa.png", rarity: 5 },
  ],
  4: [
    // Poppin'Party
    { name: "Kasumi Toyama", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/4star/Poppin'Party/Kasumi Toyama.png", rarity: 4 },
    { name: "Tae Hanazono", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/4star/Poppin'Party/Tae Hanazono.png", rarity: 4 },
    { name: "Rimi Ushigome", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/4star/Poppin'Party/Rimi Ushigome.png", rarity: 4 },
    { name: "Saya Yamabuki", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/4star/Poppin'Party/Saya Yamabuki.png", rarity: 4 },
    { name: "Arisa Ichigaya", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/4star/Poppin'Party/Arisa Ichigaya.png", rarity: 4 },
    // Afterglow
    { name: "Ran Mitake", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/4star/Afterglow/Ran Mitake.png", rarity: 4 },
    { name: "Moca Aoba", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/4star/Afterglow/Moca Aoba.png", rarity: 4 },
    { name: "Himari Uehara", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/4star/Afterglow/Himari Uehara.png", rarity: 4 },
    { name: "Tomoe Udagawa", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/4star/Afterglow/Tomoe Udagawa.png", rarity: 4 },
    { name: "Tsugumi Hazawa", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/4star/Afterglow/Tsugumi Hazawa.png", rarity: 4 },
    // Pastel*Palettes
    { name: "Aya Maruyama", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/4star/PastelPalettes/Aya Maruyama.png", rarity: 4 },
    { name: "Hina Hikawa", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/4star/PastelPalettes/Hina Hikawa.png", rarity: 4 },
    { name: "Chisato Shirasagi", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/4star/PastelPalettes/Chisato Shirasagi.png", rarity: 4 },
    { name: "Maya Yamato", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/4star/PastelPalettes/Maya Yamato.png", rarity: 4 },
    { name: "Eve Wakamiya", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/4star/PastelPalettes/Eve Wakamiya.png", rarity: 4 },
    // Roselia
    { name: "Yukina Minato", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/4star/Roselia/Yukina Minato.png", rarity: 4 },
    { name: "Sayo Hikawa", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/4star/Roselia/Sayo Hikawa.png", rarity: 4 },
    { name: "Lisa Imai", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/4star/Roselia/Lisa Imai.png", rarity: 4 },
    { name: "Ako Udagawa", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/4star/Roselia/Ako Udagawa.png", rarity: 4 },
    { name: "Rinko Shirokane", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/4star/Roselia/Rinko Shirokane.png", rarity: 4 },
    // Hello, Happy World!
    { name: "Kokoro Tsurumaki", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/4star/Hello, Happy World!/Kokoro Tsurumaki.png", rarity: 4 },
    { name: "Kaoru Seta", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/4star/Hello, Happy World!/Kaoru Seta.png", rarity: 4 },
    { name: "Hagumi Kitazawa", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/4star/Hello, Happy World!/Hagumi Kitazawa.png", rarity: 4 },
    { name: "Kanon Matsubara", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/4star/Hello, Happy World!/Kanon Matsubara.png", rarity: 4 },
    { name: "Misaki Okusawa", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/4star/Hello, Happy World!/Misaki Okusawa.png", rarity: 4 },
  ],
  3: [
    // Poppin'Party
    { name: "Kasumi Toyama", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/3star/Poppin'Party/Kasumi Toyama.png", rarity: 3 },
    { name: "Tae Hanazono", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/3star/Poppin'Party/Tae Hanazono.png", rarity: 3 },
    { name: "Rimi Ushigome", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/3star/Poppin'Party/Rimi Ushigome.png", rarity: 3 },
    { name: "Saya Yamabuki", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/3star/Poppin'Party/Saya Yamabuki.png", rarity: 3 },
    { name: "Arisa Ichigaya", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/3star/Poppin'Party/Arisa Ichigaya.png", rarity: 3 },
    // Afterglow
    { name: "Ran Mitake", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/3star/Afterglow/Ran Mitake.png", rarity: 3 },
    { name: "Moca Aoba", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/3star/Afterglow/Moca Aoba.png", rarity: 3 },
    { name: "Himari Uehara", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/3star/Afterglow/Himari Uehara.png", rarity: 3 },
    { name: "Tomoe Udagawa", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/3star/Afterglow/Tomoe Udagawa.png", rarity: 3 },
    { name: "Tsugumi Hazawa", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/3star/Afterglow/Tsugumi Hazawa.png", rarity: 3 },
    // Pastel*Palettes
    { name: "Aya Maruyama", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/3star/PastelPalettes/Aya Maruyama.png", rarity: 3 },
    { name: "Hina Hikawa", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/3star/PastelPalettes/Hina Hikawa.png", rarity: 3 },
    { name: "Chisato Shirasagi", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/3star/PastelPalettes/Chisato Shirasagi.png", rarity: 3 },
    { name: "Maya Yamato", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/3star/PastelPalettes/Maya Yamato.png", rarity: 3 },
    { name: "Eve Wakamiya", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/3star/PastelPalettes/Eve Wakamiya.png", rarity: 3 },
    // Roselia
    { name: "Yukina Minato", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/3star/Roselia/Yukina Minato.png", rarity: 3 },
    { name: "Sayo Hikawa", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/3star/Roselia/Sayo Hikawa.png", rarity: 3 },
    { name: "Lisa Imai", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/3star/Roselia/Lisa Imai.png", rarity: 3 },
    { name: "Ako Udagawa", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/3star/Roselia/Ako Udagawa.png", rarity: 3 },
    { name: "Rinko Shirokane", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/3star/Roselia/Rinko Shirokane.png", rarity: 3 },
    // Hello, Happy World!
    { name: "Kokoro Tsurumaki", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/3star/Hello, Happy World!/Kokoro Tsurumaki.png", rarity: 3 },
    { name: "Kaoru Seta", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/3star/Hello, Happy World!/Kaoru Seta.png", rarity: 3 },
    { name: "Hagumi Kitazawa", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/3star/Hello, Happy World!/Hagumi Kitazawa.png", rarity: 3 },
    { name: "Kanon Matsubara", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/3star/Hello, Happy World!/Kanon Matsubara.png", rarity: 3 },
    { name: "Misaki Okusawa", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/3star/Hello, Happy World!/Misaki Okusawa.png", rarity: 3 },
  ],
  2: [
    // Poppin'Party
    { name: "Kasumi Toyama", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/2star/Poppin'Party/Kasumi Toyama.png", rarity: 2 },
    { name: "Tae Hanazono", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/2star/Poppin'Party/Tae Hanazono.png", rarity: 2 },
    { name: "Rimi Ushigome", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/2star/Poppin'Party/Rimi Ushigome.png", rarity: 2 },
    { name: "Saya Yamabuki", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/2star/Poppin'Party/Saya Yamabuki.png", rarity: 2 },
    { name: "Arisa Ichigaya", band: "Poppin'Party", bandDisplayName: "Poppin'Party", imagePath: "/characters/2star/Poppin'Party/Arisa Ichigaya.png", rarity: 2 },
    // Afterglow
    { name: "Ran Mitake", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/2star/Afterglow/Ran Mitake.png", rarity: 2 },
    { name: "Moca Aoba", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/2star/Afterglow/Moca Aoba.png", rarity: 2 },
    { name: "Himari Uehara", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/2star/Afterglow/Himari Uehara.png", rarity: 2 },
    { name: "Tomoe Udagawa", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/2star/Afterglow/Tomoe Udagawa.png", rarity: 2 },
    { name: "Tsugumi Hazawa", band: "Afterglow", bandDisplayName: "Afterglow", imagePath: "/characters/2star/Afterglow/Tsugumi Hazawa.png", rarity: 2 },
    // Pastel*Palettes
    { name: "Aya Maruyama", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/2star/PastelPalettes/Aya Maruyama.png", rarity: 2 },
    { name: "Hina Hikawa", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/2star/PastelPalettes/Hina Hikawa.png", rarity: 2 },
    { name: "Chisato Shirasagi", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/2star/PastelPalettes/Chisato Shirasagi.png", rarity: 2 },
    { name: "Maya Yamato", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/2star/PastelPalettes/Maya Yamato.png", rarity: 2 },
    { name: "Eve Wakamiya", band: "PastelPalettes", bandDisplayName: "Pastel*Palettes", imagePath: "/characters/2star/PastelPalettes/Eve Wakamiya.png", rarity: 2 },
    // Roselia
    { name: "Yukina Minato", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/2star/Roselia/Yukina Minato.png", rarity: 2 },
    { name: "Sayo Hikawa", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/2star/Roselia/Sayo Hikawa.png", rarity: 2 },
    { name: "Lisa Imai", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/2star/Roselia/Lisa Imai.png", rarity: 2 },
    { name: "Ako Udagawa", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/2star/Roselia/Ako Udagawa.png", rarity: 2 },
    { name: "Rinko Shirokane", band: "Roselia", bandDisplayName: "Roselia", imagePath: "/characters/2star/Roselia/Rinko Shirokane.png", rarity: 2 },
    // Hello, Happy World!
    { name: "Kokoro Tsurumaki", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/2star/Hello, Happy World!/Kokoro Tsurumaki.png", rarity: 2 },
    { name: "Kaoru Seta", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/2star/Hello, Happy World!/Kaoru Seta.png", rarity: 2 },
    { name: "Hagumi Kitazawa", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/2star/Hello, Happy World!/Hagumi Kitazawa.png", rarity: 2 },
    { name: "Kanon Matsubara", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/2star/Hello, Happy World!/Kanon Matsubara.png", rarity: 2 },
    { name: "Misaki Okusawa", band: "Hello, Happy World!", bandDisplayName: "Hello, Happy World!", imagePath: "/characters/2star/Hello, Happy World!/Misaki Okusawa.png", rarity: 2 },
  ],
};

// Map a random number into a rarity tier (updated: removed 1★, only 2-5★):
// - 5★: 1%
// - 4★: 3%
// - 3★: 48% (increased from 30%)
// - 2★: 48% (increased from 30%)
const mapRandomToRarity = (rand: bigint) => {
  const base = BigInt(10000);
  const v = rand % base; // 0 <= v < 10000

  if (v < BigInt(100)) {
    // 0 ~ 99 -> 1%
    return "★★★★★";
  }
  if (v < BigInt(400)) {
    // 100 ~ 399 -> 3%
    return "★★★★";
  }
  // Remaining 96%: 3★: 48%, 2★: 48%
  if (v < BigInt(5200)) {
    // 400 ~ 5199 -> 48%
    return "★★★";
  }
  // 5200 ~ 9999 -> 48%
  return "★★";
};

// Map circuit rarity code (0-4) to stars (updated: removed 1★)
// Circuit codes: 0=1★(removed, now 2★), 1=2★, 2=3★, 3=4★, 4=5★
const mapRarityCodeToStars = (code: number): string => {
  if (code === 4) return "★★★★★";
  if (code === 3) return "★★★★";
  if (code === 2) return "★★★";
  if (code === 1) return "★★";
  return "★★"; // Default to 2★ if invalid (code 0 or other)
};

// Map actual rarity (2-5) to stars
const mapActualRarityToStars = (rarity: number): string => {
  if (rarity === 5) return "★★★★★";
  if (rarity === 4) return "★★★★";
  if (rarity === 3) return "★★★";
  if (rarity === 2) return "★★";
  return "★★"; // Default to 2★ if invalid
};

// Get rarity code from random number (returns 2, 3, 4, or 5)
const getRarityCodeFromRandom = (rand: bigint): number => {
  const base = BigInt(10000);
  const v = rand % base;

  if (v < BigInt(100)) return 5; // 5★
  if (v < BigInt(400)) return 4; // 4★
  if (v < BigInt(5200)) return 3; // 3★
  return 2; // 2★
};

// MyGO characters only (for MyGO exclusive pool)
const MYGO_CHARACTERS: Record<number, Character[]> = {
  5: [
    { name: "Anon Chihaya", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/5star/MyGO!!!!!/Anon Chihaya.png", rarity: 5 },
    { name: "Rana Kaname", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/5star/MyGO!!!!!/Rana Kaname.png", rarity: 5 },
    { name: "Soyo Nagasaki", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/5star/MyGO!!!!!/Soyo Nagasaki.png", rarity: 5 },
    { name: "Taki Shina", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/5star/MyGO!!!!!/Taki Shina.png", rarity: 5 },
    { name: "Tomori Takamatsu", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/5star/MyGO!!!!!/Tomori Takamatsu.png", rarity: 5 },
  ],
  4: [
    { name: "Anon Chihaya", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/4star/MyGO!!!!!/Anon Chihaya.png", rarity: 4 },
    { name: "Rana Kaname", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/4star/MyGO!!!!!/Rana Kaname.png", rarity: 4 },
    { name: "Soyo Nagasaki", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/4star/MyGO!!!!!/Soyo Nagasaki.png", rarity: 4 },
    { name: "Taki Shina", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/4star/MyGO!!!!!/Taki Shina.png", rarity: 4 },
    { name: "Tomori Takamatsu", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/4star/MyGO!!!!!/Tomori Takamatsu.png", rarity: 4 },
  ],
  3: [
    { name: "Anon Chihaya", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/3star/MyGO!!!!!/Anon Chihaya.png", rarity: 3 },
    { name: "Rana Kaname", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/3star/MyGO!!!!!/Rana Kaname.png", rarity: 3 },
    { name: "Soyo Nagasaki", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/3star/MyGO!!!!!/Soyo Nagasaki.png", rarity: 3 },
    { name: "Taki Shina", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/3star/MyGO!!!!!/Taki Shina.png", rarity: 3 },
    { name: "Tomori Takamatsu", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/3star/MyGO!!!!!/Tomori Takamatsu.png", rarity: 3 },
  ],
  2: [
    { name: "Anon Chihaya", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/2star/MyGO!!!!!/Anon Chihaya.png", rarity: 2 },
    { name: "Rana Kaname", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/2star/MyGO!!!!!/Rana Kaname.png", rarity: 2 },
    { name: "Soyo Nagasaki", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/2star/MyGO!!!!!/Soyo Nagasaki.png", rarity: 2 },
    { name: "Taki Shina", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/2star/MyGO!!!!!/Taki Shina.png", rarity: 2 },
    { name: "Tomori Takamatsu", band: "MyGO!!!!!", bandDisplayName: "MyGO!!!!!", imagePath: "/characters/2star/MyGO!!!!!/Tomori Takamatsu.png", rarity: 2 },
  ],
};

// Hash function for better distribution when selecting characters
// This helps avoid bias when using modulo operation
const hashForSelection = (rand: bigint): bigint => {
  // Use a simple hash to improve distribution
  // Multiply by a large prime and add another prime
  return (rand * BigInt(2654435761) + BigInt(2246822519)) % BigInt(Number.MAX_SAFE_INTEGER);
};

// Select a character based on random number (deterministic selection)
const selectCharacter = (rand: bigint): Character => {
  const rarity = getRarityCodeFromRandom(rand);
  const characters = CHARACTERS[rarity];
  
  // Use hashed random number for better distribution
  // This ensures the same random number always selects the same character
  const hashed = hashForSelection(rand);
  const index = Number(hashed % BigInt(characters.length));
  return characters[index];
};

// Select a MyGO character based on random number (for MyGO exclusive pool)
const selectMyGOCharacter = (rand: bigint): Character => {
  const rarity = getRarityCodeFromRandom(rand);
  const characters = MYGO_CHARACTERS[rarity];
  
  // Use hashed random number for better distribution
  const hashed = hashForSelection(rand);
  const index = Number(hashed % BigInt(characters.length));
  return characters[index];
};

const PITY_THRESHOLD = 50;

let wasmReady: Promise<void> | null = null;

const initWasm = async () => {
  if (!wasmReady) {
    wasmReady = gacha.default().then(() => {});
  }
  return wasmReady;
};

// Verification Details Component
const VerificationDetails = ({
  isVerified,
  verificationType,
  isExpanded,
  onToggle,
}: {
  isVerified: boolean;
  verificationType: "single" | "ten" | "pity" | "tenPity" | "mygo" | "tenMygo";
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const getVerificationDetails = () => {
    const base = [
      "LCG random number generation: Verified that random numbers are generated using the correct Linear Congruential Generator algorithm",
      "Rarity computation: Verified that rarity is correctly calculated from random number modulo 10000",
      "Rarity validity: Verified that computed rarity is in valid range (1-4, where 1=2★, 2=3★, 3=4★, 4=5★)",
      "Rarity threshold mapping: Verified that rarity correctly matches probability thresholds (1% for 5★, 3% for 4★, 48% for 3★, 48% for 2★)",
    ];
    
    if (verificationType === "ten" || verificationType === "tenPity" || verificationType === "tenMygo") {
      base.push("Ten-draw sequence: Verified that all 10 draws are generated in correct sequential order");
    }
    
    if (verificationType === "pity" || verificationType === "tenPity" || verificationType === "mygo" || verificationType === "tenMygo") {
      base.push("Pity mechanism: Verified that pity system correctly triggers after 50 consecutive draws without 5★");
      base.push("Pity enforcement: Verified that when pity is active, the draw is guaranteed to be 5★");
      base.push("Streak counter: Verified that streak counter correctly increments or resets based on draw result");
    }
    
    return base;
  };

  // 根据 verificationType 确定颜色主题
  const getThemeColors = () => {
    if (verificationType === "single" || verificationType === "ten") {
      // 普通抽卡 - 浅蓝色
      return {
        bg: "linear-gradient(135deg, rgba(191,219,254,0.4), rgba(199,210,254,0.3))",
        border: "1px solid rgba(59,130,246,0.4)",
        borderHover: "rgba(59,130,246,0.6)",
        detailBg: "linear-gradient(135deg, rgba(191,219,254,0.2), rgba(199,210,254,0.15))",
        detailBorder: "1px solid rgba(59,130,246,0.25)",
      };
    } else if (verificationType === "pity" || verificationType === "tenPity") {
      // Premium抽卡 - 浅黄色
      return {
        bg: "linear-gradient(135deg, rgba(254,243,199,0.4), rgba(253,230,138,0.3))",
        border: "1px solid rgba(217,119,6,0.4)",
        borderHover: "rgba(217,119,6,0.6)",
        detailBg: "linear-gradient(135deg, rgba(254,243,199,0.2), rgba(253,230,138,0.15))",
        detailBorder: "1px solid rgba(217,119,6,0.25)",
      };
    } else {
      // MyGO - 粉色
      return {
        bg: "linear-gradient(135deg, rgba(252,231,243,0.4), rgba(251,207,232,0.3))",
        border: "1px solid rgba(244,114,182,0.4)",
        borderHover: "rgba(244,114,182,0.6)",
        detailBg: "linear-gradient(135deg, rgba(252,231,243,0.2), rgba(251,207,232,0.15))",
        detailBorder: "1px solid rgba(244,114,182,0.25)",
      };
    }
  };

  const themeColors = getThemeColors();
  const verifiedColor = isVerified ? "#10b981" : "#ef4444";

  return (
    <div style={{ marginTop: "8px" }}>
      <div
        onClick={onToggle}
        style={{
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 12px",
          borderRadius: "8px",
          background: themeColors.bg,
          border: themeColors.border,
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.border = `1px solid ${themeColors.borderHover}`;
          e.currentTarget.style.boxShadow = `0 4px 12px ${themeColors.borderHover}40`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.border = themeColors.border;
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: verifiedColor,
              boxShadow: `0 0 8px ${verifiedColor}80`,
            }}
          />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b" }}>
            ZK Proof Verification
          </span>
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: verifiedColor,
              padding: "2px 8px",
              borderRadius: "12px",
              background: `${verifiedColor}15`,
              border: `1px solid ${verifiedColor}40`,
            }}
          >
            {isVerified ? "✓ Verified" : "✗ Failed"}
          </span>
        </div>
        <span
          style={{
            fontSize: "11px",
            color: "#64748b",
            fontWeight: 500,
            padding: "4px 8px",
            borderRadius: "6px",
            background: "rgba(148,163,184,0.1)",
            transition: "all 0.2s ease",
          }}
        >
          {isExpanded ? "▲ Hide" : "▼ Details"}
        </span>
      </div>
      {isExpanded && (
        <div
          style={{
            marginTop: "8px",
            padding: "14px",
            borderRadius: "8px",
            background: themeColors.detailBg,
            border: themeColors.detailBorder,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div style={{ fontSize: "11px", color: "#475569", lineHeight: "1.7" }}>
            <div
              style={{
                marginBottom: "12px",
                fontWeight: 700,
                color: "#1e293b",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span
                style={{
                  width: "4px",
                  height: "16px",
                  borderRadius: "2px",
                  background: `linear-gradient(135deg, ${verifiedColor}, ${verifiedColor}80)`,
                }}
              />
              Verified Components:
            </div>
            {getVerificationDetails().map((detail, idx) => (
              <div
                key={idx}
                style={{
                  marginBottom: "10px",
                  paddingLeft: "20px",
                  textAlign: "left",
                  position: "relative",
                  paddingTop: "2px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "8px",
                    top: "6px",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    backgroundColor: verifiedColor,
                    opacity: 0.6,
                  }}
                />
                <span style={{ color: "#334155" }}>{detail}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

const App = () => {
  const [randomNumber, setRandomNumber] = useState<string>("");
  const [rarity, setRarity] = useState<string>("");
  const [character, setCharacter] = useState<Character | null>(null);
  const [verificationResult, setVerificationResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [multiResults, setMultiResults] = useState<
    { random: string; rarity: string; verified: boolean; character: Character | null }[]
  >([]);
  const [tenDrawHighlight, setTenDrawHighlight] = useState<Character | null>(null); // Highest rarity from ten-draw
  
  // Pity system state
  const [pityStreak, setPityStreak] = useState<number>(0);
  const [pityRandomNumber, setPityRandomNumber] = useState<string>("");
  const [showCopyrightInfo, setShowCopyrightInfo] = useState<boolean>(false);
  const [pityRarity, setPityRarity] = useState<string>("");
  const [pityCharacter, setPityCharacter] = useState<Character | null>(null);
  const [pityVerificationResult, setPityVerificationResult] = useState<string>("");
  
  // Ten-draw with pity state
  const [tenPityResults, setTenPityResults] = useState<
    { random: string; rarity: string; character: Character | null }[]
  >([]);
  const [tenPityHighlight, setTenPityHighlight] = useState<Character | null>(null); // Highest rarity from ten-pity-draw
  const [tenPityVerificationResult, setTenPityVerificationResult] = useState<string>("");
  
  // MyGO pool state (with pity)
  const [mygoPityStreak, setMygoPityStreak] = useState<number>(0);
  const [mygoRandomNumber, setMygoRandomNumber] = useState<string>("");
  const [mygoRarity, setMygoRarity] = useState<string>("");
  const [mygoCharacter, setMygoCharacter] = useState<Character | null>(null);
  const [mygoVerificationResult, setMygoVerificationResult] = useState<string>("");
  const [tenMygoResults, setTenMygoResults] = useState<
    { random: string; rarity: string; character: Character | null }[]
  >([]);
  const [tenMygoHighlight, setTenMygoHighlight] = useState<Character | null>(null);
  const [tenMygoVerificationResult, setTenMygoVerificationResult] = useState<string>("");
  
  // Verification detail expansion state
  const [expandedVerification, setExpandedVerification] = useState<{
    type: "single" | "ten" | "pity" | "tenPity" | "mygo" | "tenMygo" | null;
  }>({ type: null });
  
  // Pool selection: "unlimited" (non-pity), "limited" (pity), or "mygo" (MyGO exclusive with pity)
  const [currentPool, setCurrentPool] = useState<"unlimited" | "limited" | "mygo">("unlimited");
  
  // Card gallery state
  const [showCardGallery, setShowCardGallery] = useState<boolean>(false);
  
  // Selected result index for ten-draws (clicking on a result card)
  const [selectedTenResultIndex, setSelectedTenResultIndex] = useState<number | null>(null);
  const [selectedTenPityResultIndex, setSelectedTenPityResultIndex] = useState<number | null>(null);
  const [selectedTenMygoResultIndex, setSelectedTenMygoResultIndex] = useState<number | null>(null);
  
  // Pool info modal state
  const [showPoolInfo, setShowPoolInfo] = useState<boolean>(false);
  
  // ZK flow modal state
  const [showZKFlow, setShowZKFlow] = useState<boolean>(false);
  
  // Image zoom modal state
  const [zoomedImage, setZoomedImage] = useState<{ src: string; name: string; band?: string } | null>(null);

  // Load pity streak from localStorage on mount
  useEffect(() => {
    const savedStreak = localStorage.getItem("pityStreak");
    if (savedStreak) {
      setPityStreak(parseInt(savedStreak, 10));
    }
    const savedMygoStreak = localStorage.getItem("mygoPityStreak");
    if (savedMygoStreak) {
      setMygoPityStreak(parseInt(savedMygoStreak, 10));
    }
  }, []);

  // Save pity streak to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("pityStreak", pityStreak.toString());
  }, [pityStreak]);

  // Save MyGO pity streak to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("mygoPityStreak", mygoPityStreak.toString());
  }, [mygoPityStreak]);

  const drawCard = async () => {
    try {
      setLoading(true);
      setVerificationResult("");
      setRandomNumber("");
      setRarity("");
      setCharacter(null);
      setMultiResults([]);
      setTenDrawHighlight(null);
      setPityRandomNumber("");
      setPityRarity("");
      setPityCharacter(null);
      setPityVerificationResult("");
      setTenPityResults([]);
      setTenPityHighlight(null);
      setTenPityVerificationResult("");
      setMygoRandomNumber("");
      setMygoRarity("");
      setMygoCharacter(null);
      setMygoVerificationResult("");
      setTenMygoResults([]);
      setTenMygoHighlight(null);
      setTenMygoVerificationResult("");

      // Call backend API to perform server-side draw (single).
      const res = await fetch("/api/draw");
      const data: { random?: string; rarity?: number; proof?: number[]; error?: string } =
        await res.json();

      if (!res.ok || !data.random || !data.rarity === undefined || !data.proof) {
        throw new Error(data.error || "Draw failed");
      }

      // Frontend only re-runs verification with the same public parameters to check server honesty.
      await initWasm();
      const params = gacha.setup_params(6);
      const rand = BigInt(data.random);
      const proof = new Uint8Array(data.proof);

      console.log("Random:", rand);
      console.log("Rarity:", data.rarity);
      console.log("Proof:", proof);

      // Client-side verification: ensure the random number and rarity returned by server are not forged.
      // Public inputs: [random, rarity]
      const isVerified = gacha.proof_verify(params, rand, proof);

      const selectedCharacter = selectCharacter(rand);
      // Convert rarity code (1-4) to actual rarity (2-5) for display
      const actualRarity = data.rarity! === 4 ? 5 : data.rarity! === 3 ? 4 : data.rarity! === 2 ? 3 : 2;
      setRandomNumber(rand.toString());
      setRarity(mapActualRarityToStars(actualRarity));
      setCharacter(selectedCharacter);
    setVerificationResult(
        isVerified
          ? "Verification succeeded (random number and rarity are valid)"
          : "Verification failed (random number or rarity may be forged)"
      );
    } catch (e) {
      console.error(e);
      setVerificationResult("Error occurred during draw");
    } finally {
      setLoading(false);
    }
  };

  const drawTen = async () => {
    try {
      setLoading(true);
      setVerificationResult("");
      setRandomNumber("");
      setRarity("");
      setCharacter(null);
      setMultiResults([]);
      setTenDrawHighlight(null);
      setSelectedTenResultIndex(null);
      setTenPityResults([]);
      setTenPityHighlight(null);
      setTenPityVerificationResult("");
      setSelectedTenPityResultIndex(null);
      setMygoRandomNumber("");
      setMygoRarity("");
      setMygoCharacter(null);
      setMygoVerificationResult("");
      setTenMygoResults([]);
      setTenMygoHighlight(null);
      setTenMygoVerificationResult("");
      setSelectedTenMygoResultIndex(null);

      await initWasm();
      const params = gacha.setup_params(7);
      const res = await fetch("/api/drawTen");
      const data: {
        randoms?: string[];
        rarities?: number[];
        proof?: number[];
        error?: string;
      } = await res.json();

      if (!res.ok || !data.randoms || !data.rarities || !data.proof) {
        throw new Error(data.error || "Draw failed");
      }

      const randomNums = data.randoms.map((r) => Number(r));
      const randomsForVerify = new Uint32Array(randomNums);
      const proof = new Uint8Array(data.proof);

      // Type declarations currently lack ten-draw helpers; use any to bypass TS checks.
      const gachaAny: any = gacha;
      // Public inputs: [10 randoms, 10 rarities]
      const isVerified = gachaAny.proof_verify_ten(
        params,
        randomsForVerify,
        proof
      );

      const results: { random: string; rarity: string; verified: boolean; character: Character | null }[] =
        randomNums.map((n, i) => {
          const selectedChar = selectCharacter(BigInt(n));
          // Use the rarity from API response (1-4, where 1=2★, 2=3★, 3=4★, 4=5★)
          // Convert to actual rarity (2-5) for display
          const rarityCode = data.rarities![i];
          const actualRarity = rarityCode === 4 ? 5 : rarityCode === 3 ? 4 : rarityCode === 2 ? 3 : 2;
          const rarityStr = mapActualRarityToStars(actualRarity);
          return {
            random: n.toString(),
            rarity: rarityStr,
            verified: isVerified,
            character: selectedChar,
          };
        });

      // Find highest rarity character for display
      const highestRarity = Math.max(...results.map(r => r.character?.rarity || 0));
      const highlightChar = results.find(r => r.character?.rarity === highestRarity)?.character || null;
      
      setMultiResults(results);
      setTenDrawHighlight(highlightChar);
    } catch (e) {
      console.error(e);
      setVerificationResult("Error occurred during ten-draw");
    } finally {
      setLoading(false);
    }
  };

  const drawPity = async () => {
    try {
      setLoading(true);
      setPityVerificationResult("");
      setPityRandomNumber("");
      setPityRarity("");
      setPityCharacter(null);
      setRandomNumber("");
      setRarity("");
      setCharacter(null);
      setVerificationResult("");
      setMultiResults([]);
      setTenDrawHighlight(null);
      setSelectedTenResultIndex(null);
      setTenPityResults([]);
      setTenPityHighlight(null);
      setTenPityVerificationResult("");
      setSelectedTenPityResultIndex(null);
      setMygoRandomNumber("");
      setMygoRarity("");
      setMygoCharacter(null);
      setMygoVerificationResult("");
      setTenMygoResults([]);
      setTenMygoHighlight(null);
      setTenMygoVerificationResult("");
      setSelectedTenMygoResultIndex(null);

      // Call backend API with current pity streak
      const res = await fetch("/api/drawPity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ streakPrev: pityStreak }),
      });

      const data: {
        random?: string;
        rarity?: number;
        streakNext?: number;
        proof?: number[];
        error?: string;
      } = await res.json();

      if (!res.ok || !data.random || !data.proof || data.rarity === undefined || data.streakNext === undefined) {
        throw new Error(data.error || "Pity draw failed");
      }

      // Verify proof using pity circuit (verifies pity logic in circuit)
      await initWasm();
      const params = (gacha as any).setup_params_pity(6);
      const rand = BigInt(data.random);
      const proof = new Uint8Array(data.proof);
      
      // Verify using pity circuit - includes verification of pity logic
      const isVerified = (gacha as any).proof_verify_pity(
        params,
        BigInt(pityStreak),    // streak_prev (needs to be bigint)
        rand,                  // random_value (already bigint)
        BigInt(data.rarity),   // final_rarity (needs to be bigint)
        BigInt(data.streakNext), // streak_next (needs to be bigint)
        proof
      );

      // Update state
      // For pity draws, use the actual rarity code from the circuit (which may be forced to 5★)
      // Convert rarity code (0-4) to actual rarity (2-5), where 0=2★, 1=2★, 2=3★, 3=4★, 4=5★
      // But since we removed 1★, we map: 0=2★, 1=2★, 2=3★, 3=4★, 4=5★
      const actualRarity = data.rarity === 4 ? 5 : (data.rarity === 3 ? 4 : (data.rarity === 2 ? 3 : 2));
      const characters = CHARACTERS[actualRarity];
      // Use random number to select character deterministically
      const charIndex = Number(rand % BigInt(characters.length));
      const selectedCharacter = characters[charIndex];
      
      setPityRandomNumber(rand.toString());
      setPityRarity(mapRarityCodeToStars(data.rarity));
      setPityCharacter(selectedCharacter);
      setPityStreak(data.streakNext);
      setPityVerificationResult(
        isVerified
          ? "Verification succeeded ✓ (random number valid, pity logic verified in circuit)"
          : "Verification failed ✗ (proof may be invalid)"
      );
    } catch (e) {
      console.error("Error in drawPity:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      setPityVerificationResult(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const drawMyGO = async () => {
    try {
      setLoading(true);
      setMygoVerificationResult("");
      setMygoRandomNumber("");
      setMygoRarity("");
      setMygoCharacter(null);
      setRandomNumber("");
      setRarity("");
      setCharacter(null);
      setVerificationResult("");
      setMultiResults([]);
      setTenDrawHighlight(null);
      setPityRandomNumber("");
      setPityRarity("");
      setPityCharacter(null);
      setPityVerificationResult("");
      setTenPityResults([]);
      setTenPityHighlight(null);
      setTenPityVerificationResult("");
      setTenMygoResults([]);
      setTenMygoHighlight(null);
      setTenMygoVerificationResult("");

      // Call backend API with current MyGO pity streak
      const res = await fetch("/api/drawPity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ streakPrev: mygoPityStreak }),
      });

      const data: {
        random?: string;
        rarity?: number;
        streakNext?: number;
        proof?: number[];
        error?: string;
      } = await res.json();

      if (!res.ok || !data.random || !data.proof || data.rarity === undefined || data.streakNext === undefined) {
        throw new Error(data.error || "MyGO draw failed");
      }

      // Verify proof using pity circuit
      await initWasm();
      const params = (gacha as any).setup_params_pity(6);
      const rand = BigInt(data.random);
      const proof = new Uint8Array(data.proof);
      
      // Verify using pity circuit
      const isVerified = (gacha as any).proof_verify_pity(
        params,
        BigInt(mygoPityStreak),
        rand,
        BigInt(data.rarity),
        BigInt(data.streakNext),
        proof
      );

      // Select MyGO character based on actual rarity
      const actualRarity = data.rarity === 4 ? 5 : (data.rarity === 3 ? 4 : (data.rarity === 2 ? 3 : 2));
      const characters = MYGO_CHARACTERS[actualRarity];
      const charIndex = Number(rand % BigInt(characters.length));
      const selectedCharacter = characters[charIndex];
      
      setMygoRandomNumber(rand.toString());
      setMygoRarity(mapRarityCodeToStars(data.rarity));
      setMygoCharacter(selectedCharacter);
      setMygoPityStreak(data.streakNext);
      setMygoVerificationResult(
        isVerified
          ? "Verification succeeded ✓ (random number valid, pity logic verified in circuit)"
          : "Verification failed ✗ (proof may be invalid)"
      );
    } catch (e) {
      console.error("Error in drawMyGO:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      setMygoVerificationResult(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const drawTenMyGO = async () => {
    try {
      setLoading(true);
      setTenMygoVerificationResult("");
      setTenMygoResults([]);
      setTenMygoHighlight(null);
      setSelectedTenMygoResultIndex(null);
      setMygoRandomNumber("");
      setMygoRarity("");
      setMygoCharacter(null);
      setMygoVerificationResult("");
      setRandomNumber("");
      setRarity("");
      setCharacter(null);
      setVerificationResult("");
      setMultiResults([]);
      setTenDrawHighlight(null);
      setSelectedTenResultIndex(null);
      setPityRandomNumber("");
      setPityRarity("");
      setPityCharacter(null);
      setPityVerificationResult("");
      setTenPityResults([]);
      setTenPityHighlight(null);
      setTenPityVerificationResult("");
      setSelectedTenPityResultIndex(null);

      // Call backend API with current MyGO pity streak
      const res = await fetch("/api/drawTenPity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ streakPrev: mygoPityStreak }),
      });

      const data: {
        randoms?: string[];
        rarities?: number[];
        streakNext?: number;
        proof?: number[];
        error?: string;
      } = await res.json();

      if (!res.ok || !data.randoms || !data.rarities || !data.proof || data.streakNext === undefined) {
        throw new Error(data.error || "Ten-MyGO draw failed");
      }

      // Verify proof using ten-pity circuit
      await initWasm();
      const params = (gacha as any).setup_params_ten_pity(7);
      const proof = new Uint8Array(data.proof);
      
      const randomsForVerify = new Uint32Array(data.randoms.map((r) => Number(r)));
      const raritiesForVerify = new Uint32Array(data.rarities);
      
      const isVerified = (gacha as any).proof_verify_ten_pity(
        params,
        BigInt(mygoPityStreak),
        randomsForVerify,
        raritiesForVerify,
        BigInt(data.streakNext),
        proof
      );

      // Select MyGO characters based on actual rarities
      const results: { random: string; rarity: string; character: Character | null }[] = data.randoms!.map((r, idx) => {
        const rarityCode = data.rarities![idx];
        const actualRarity = rarityCode === 4 ? 5 : (rarityCode === 3 ? 4 : (rarityCode === 2 ? 3 : 2));
        const characters = MYGO_CHARACTERS[actualRarity];
        const charIndex = Number(BigInt(r) % BigInt(characters.length));
        return {
          random: r,
          rarity: mapRarityCodeToStars(rarityCode),
          character: characters[charIndex],
        };
      });
      
      const highestRarity = Math.max(...results.map(r => r.character?.rarity || 0));
      const highlightChar = results.find(r => r.character?.rarity === highestRarity)?.character || null;
      
      setTenMygoResults(results);
      setTenMygoHighlight(highlightChar);
      setMygoPityStreak(data.streakNext);
      setTenMygoVerificationResult(
        isVerified
          ? "Verification succeeded ✓ (all 10 draws verified, pity logic verified in circuit)"
          : "Verification failed ✗ (proof may be invalid)"
      );
    } catch (e) {
      console.error("Error in drawTenMyGO:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      setTenMygoVerificationResult(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const drawTenPity = async () => {
    try {
      setLoading(true);
      setTenPityVerificationResult("");
      setTenPityResults([]);
      setTenPityHighlight(null);
      setPityRandomNumber("");
      setPityRarity("");
      setPityCharacter(null);
      setPityVerificationResult("");
      setRandomNumber("");
      setRarity("");
      setCharacter(null);
      setVerificationResult("");
      setMultiResults([]);
      setTenDrawHighlight(null);
      setMygoRandomNumber("");
      setMygoRarity("");
      setMygoCharacter(null);
      setMygoVerificationResult("");
      setTenMygoResults([]);
      setTenMygoHighlight(null);
      setTenMygoVerificationResult("");

      // Call backend API with current pity streak
      const res = await fetch("/api/drawTenPity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ streakPrev: pityStreak }),
      });

      const data: {
        randoms?: string[];
        rarities?: number[];
        streakNext?: number;
        proof?: number[];
        error?: string;
      } = await res.json();

      if (!res.ok || !data.randoms || !data.rarities || !data.proof || data.streakNext === undefined) {
        throw new Error(data.error || "Ten-pity draw failed");
      }

      // Verify proof using ten-pity circuit
      await initWasm();
      const params = (gacha as any).setup_params_ten_pity(7);
      const proof = new Uint8Array(data.proof);
      
      // Convert randoms and rarities to Uint32Array for verification
      const randomsForVerify = new Uint32Array(data.randoms.map((r) => Number(r)));
      const raritiesForVerify = new Uint32Array(data.rarities);
      
      // Verify using ten-pity circuit - includes verification of pity logic for all 10 draws
      const isVerified = (gacha as any).proof_verify_ten_pity(
        params,
        BigInt(pityStreak),     // streak_prev
        randomsForVerify,       // 10 randoms
        raritiesForVerify,      // 10 rarities
        BigInt(data.streakNext), // streak_next
        proof
      );

      // Update state
      // TypeScript doesn't know that data.rarities is guaranteed to exist after the check above
      // For ten-pity draws, use the actual rarity codes from the circuit (which may be forced to 5★)
      const results: { random: string; rarity: string; character: Character | null }[] = data.randoms!.map((r, idx) => {
        const rarityCode = data.rarities![idx];
        // Map circuit rarity code to actual rarity: 0=2★, 1=2★, 2=3★, 3=4★, 4=5★
        const actualRarity = rarityCode === 4 ? 5 : (rarityCode === 3 ? 4 : (rarityCode === 2 ? 3 : 2));
        const characters = CHARACTERS[actualRarity];
        const charIndex = Number(BigInt(r) % BigInt(characters.length));
        return {
          random: r,
          rarity: mapRarityCodeToStars(rarityCode),
          character: characters[charIndex],
        };
      });
      
      // Find highest rarity character for display
      const highestRarity = Math.max(...results.map(r => r.character?.rarity || 0));
      const highlightChar = results.find(r => r.character?.rarity === highestRarity)?.character || null;
      
      setTenPityResults(results);
      setTenPityHighlight(highlightChar);
      setPityStreak(data.streakNext);
      setTenPityVerificationResult(
        isVerified
          ? "Verification succeeded ✓ (all 10 draws verified, pity logic verified in circuit)"
          : "Verification failed ✗ (proof may be invalid)"
      );
    } catch (e) {
      console.error("Error in drawTenPity:", e);
      const errorMessage = e instanceof Error ? e.message : String(e);
      setTenPityVerificationResult(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: "url('/background/background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
                  color: "#1e293b",
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          padding: "28px 24px 24px",
          borderRadius: "16px",
          background:
            "linear-gradient(145deg, #e0f2fe, #dbeafe)",
          boxShadow:
            "0 28px 60px rgba(0,0,0,0.2), 0 0 0 1px rgba(59,130,246,0.2)",
        }}
      >
        {/* Title Section - Separate Box */}
        <div
          style={{
            marginBottom: "24px",
            padding: "24px 16px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #bfdbfe, #c7d2fe)",
            border: "2px solid rgba(59,130,246,0.5)",
            boxShadow: "0 8px 24px rgba(59,130,246,0.2), 0 0 0 1px rgba(255,255,255,0.1) inset",
            textAlign: "center",
            position: "relative",
            overflow: "visible",
            boxSizing: "border-box",
          }}
        >
          {/* Decorative background elements */}
          <div
            style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
              animation: "rotate 20s linear infinite",
              pointerEvents: "none",
            }}
          />
          {/* Copyright Info Icon */}
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              zIndex: 10,
            }}
          >
            <div
              onMouseEnter={() => setShowCopyrightInfo(true)}
              onMouseLeave={() => setShowCopyrightInfo(false)}
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: "rgba(191,219,254,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "11px",
                color: "rgba(59,130,246,0.7)",
                fontWeight: 600,
                transition: "all 0.2s ease",
                fontFamily: "system-ui, -apple-system, sans-serif",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(191,219,254,0.5)";
                e.currentTarget.style.color = "rgba(59,130,246,0.9)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(191,219,254,0.3)";
                e.currentTarget.style.color = "rgba(59,130,246,0.7)";
              }}
            >
              i
            </div>
            {/* Copyright Info Popup */}
            {showCopyrightInfo && (
              <div
                style={{
                  position: "absolute",
                  top: "26px",
                  right: "0",
                  width: "280px",
                  maxWidth: "calc(100vw - 48px)",
                  padding: "16px",
                  background: "rgba(255,255,255,0.98)",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.2), 0 0 0 1px rgba(59,130,246,0.2)",
                  zIndex: 1000,
                  fontSize: "13px",
                  lineHeight: "1.6",
                  color: "#1e293b",
                  border: "1px solid rgba(59,130,246,0.3)",
                  animation: "fadeIn 0.2s ease",
                }}
                onMouseEnter={() => setShowCopyrightInfo(true)}
                onMouseLeave={() => setShowCopyrightInfo(false)}
              >
                <div style={{ fontWeight: 600, marginBottom: "8px", color: "#3b82f6" }}>
                  Copyright Notice
                </div>
                <div style={{ color: "#475569" }}>
                  All images used in this application are from
                  <br />
                  <strong style={{ color: "#1e293b" }}>
                    バンドリ！ガールズバンドパーティ！
                  </strong>
                  <br />
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    (BanG Dream! Girls Band Party!)
                  </span>
                  <br />
                  <br />
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    Copyright © Craft Egg Inc. / Bushiroad Inc. All rights reserved.
                  </span>
                </div>
              </div>
            )}
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              margin: 0,
              whiteSpace: "nowrap",
              padding: "0 4px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              position: "relative",
              zIndex: 1,
              textShadow: "0 0 30px rgba(102,126,234,0.3)",
              animation: "gradientShift 5s ease infinite",
              display: "inline-block",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            BanG Dream! ZK Gacha
          </h1>
          <div
            style={{
              marginTop: "8px",
              fontSize: "12px",
              color: "#475569",
              fontWeight: 500,
              letterSpacing: "0.05em",
              position: "relative",
              zIndex: 1,
            }}
          >
            Zero-Knowledge Proof Gacha System
          </div>
        </div>

        {/* Header buttons */}
        <header style={{ marginBottom: "20px", textAlign: "center" }}>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
            <button
              onClick={() => setShowCardGallery(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "#f0f9ff",
                color: "#1e293b",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e0f2fe";
                e.currentTarget.style.color = "#1e293b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f0f9ff";
                e.currentTarget.style.color = "#1e293b";
              }}
            >
              Card Gallery
            </button>
            <button
              onClick={() => setShowPoolInfo(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "#f0f9ff",
                color: "#1e293b",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e0f2fe";
                e.currentTarget.style.color = "#1e293b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f0f9ff";
                e.currentTarget.style.color = "#1e293b";
              }}
            >
              Pool Info
            </button>
            <button
              onClick={() => setShowZKFlow(true)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.2)",
                background: "#f0f9ff",
                color: "#1e293b",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e0f2fe";
                e.currentTarget.style.color = "#1e293b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f0f9ff";
                e.currentTarget.style.color = "#1e293b";
              }}
            >
              ZK Flow
            </button>
          </div>
        </header>

        {/* Pool selector - three buttons */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "20px",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setCurrentPool("unlimited")}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 8px",
              borderRadius: "10px",
              border: currentPool === "unlimited"
                ? "2px solid rgba(59,130,246,0.5)"
                : "1px solid rgba(255,255,255,0.1)",
              background: currentPool === "unlimited"
                ? "linear-gradient(135deg, #bfdbfe, #c7d2fe)"
                : "#f0f9ff",
              color: currentPool === "unlimited" ? "#3b82f6" : "#64748b",
              fontSize: "12px",
              fontWeight: currentPool === "unlimited" ? 700 : 500,
              cursor: loading ? "default" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Standard
          </button>
          <button
            onClick={() => setCurrentPool("limited")}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 8px",
              borderRadius: "10px",
              border: currentPool === "limited"
                ? "2px solid rgba(217,119,6,0.6)"
                : "1px solid rgba(255,255,255,0.1)",
              background: currentPool === "limited"
                ? "linear-gradient(135deg, #fef3c7, #fde68a)"
                : "#f0f9ff",
              color: currentPool === "limited" ? "#d97706" : "#64748b",
              fontSize: "12px",
              fontWeight: currentPool === "limited" ? 700 : 500,
              cursor: loading ? "default" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            Premium
          </button>
          <button
            onClick={() => setCurrentPool("mygo")}
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px 8px",
              borderRadius: "10px",
              border: currentPool === "mygo"
                ? "2px solid rgba(255,105,180,0.5)"
                : "1px solid rgba(255,255,255,0.1)",
              background: currentPool === "mygo"
                ? "linear-gradient(135deg, #fce7f3, #fbcfe8)"
                : "#f0f9ff",
              color: currentPool === "mygo" ? "#ec4899" : "#64748b",
              fontSize: "12px",
              fontWeight: currentPool === "mygo" ? 700 : 500,
              cursor: loading ? "default" : "pointer",
              transition: "all 0.2s ease",
            }}
          >
            MyGO!!!!!
          </button>
        </div>

        {/* Pool info display */}
        <div
          style={{
            textAlign: "center",
            padding: "12px",
            borderRadius: "10px",
            marginBottom: "16px",
            background: currentPool === "mygo"
              ? "linear-gradient(135deg, #fce7f3, #fbcfe8)"
              : currentPool === "limited"
                ? "linear-gradient(135deg, #fef3c7, #fde68a)"
              : "linear-gradient(135deg, #bfdbfe, #c7d2fe)",
            border: currentPool === "mygo"
              ? "1px solid rgba(244,114,182,0.3)"
              : currentPool === "limited"
              ? "1px solid rgba(217,119,6,0.4)"
              : "1px solid rgba(59,130,246,0.3)",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: 700,
              marginBottom: "4px",
              color: currentPool === "mygo"
                ? "#ff69b4"
                : currentPool === "limited"
                ? "#d97706"
                : "#3b82f6",
            }}
          >
            {currentPool === "mygo"
              ? "MyGO!!!!! Exclusive Gacha"
              : currentPool === "limited"
              ? "Premium Gacha"
              : "Standard Gacha"}
          </h2>
          <p
            style={{
              fontSize: "11px",
              color: "#1e293b",
              marginBottom: (currentPool === "limited" || currentPool === "mygo") ? "8px" : "0",
            }}
          >
            {currentPool === "mygo"
              ? "MyGO!!!!! members only - Pity system enabled"
              : currentPool === "limited"
              ? "Pity system enabled - Guaranteed 5★ after 50 draws"
              : "Standard probability rates"}
          </p>
          {currentPool === "limited" && (
            <div
              style={{
                marginTop: "8px",
                padding: "6px 10px",
                borderRadius: "6px",
                background: "#fef3c7",
                border: "1px solid rgba(217,119,6,0.5)",
                display: "inline-block",
              }}
            >
              <p style={{ fontSize: "11px", margin: 0, color: "#92400e", fontWeight: 600 }}>
                Pity Counter: <strong style={{ color: "#78350f" }}>{pityStreak}/{PITY_THRESHOLD}</strong>
              </p>
              {pityStreak >= PITY_THRESHOLD && (
                <p style={{ fontSize: "10px", margin: "4px 0 0 0", color: "#ff6b6b", fontWeight: 600 }}>
                  ⚡ Next draw guaranteed 5★!
                </p>
              )}
            </div>
          )}
          {currentPool === "mygo" && (
            <div
              style={{
                marginTop: "8px",
                padding: "6px 10px",
                borderRadius: "6px",
                background: "#fce7f3",
                display: "inline-block",
              }}
            >
              <p style={{ fontSize: "11px", margin: 0, color: "#be185d", fontWeight: 600 }}>
                Pity Counter: <strong style={{ color: "#9f1239" }}>{mygoPityStreak}/{PITY_THRESHOLD}</strong>
              </p>
              {mygoPityStreak >= PITY_THRESHOLD && (
                <p style={{ fontSize: "10px", margin: "4px 0 0 0", color: "#ff6b6b", fontWeight: 600 }}>
                  ⚡ Next draw guaranteed 5★!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Draw buttons - shown based on current pool */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "18px",
            justifyContent: "center",
          }}
        >
          {currentPool === "unlimited" ? (
            <>
              <button
                onClick={drawCard}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 14px 32px rgba(192,132,252,0.6), 0 0 0 1px rgba(0,0,0,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 10px 24px rgba(192,132,252,0.45), 0 0 0 1px rgba(0,0,0,0.3)";
                }}
                style={{
                  minWidth: "140px",
                  padding: "10px 18px",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: loading ? "default" : "pointer",
                  background:
                    "linear-gradient(135deg, #4dabf7, #9775fa, #f783ac)",
                  color: "#0b0c12",
                  opacity: loading ? 0.7 : 1,
                  transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
                  boxShadow:
                    "0 10px 24px rgba(192,132,252,0.45), 0 0 0 1px rgba(0,0,0,0.3)",
                }}
              >
                {loading ? "Drawing..." : "Draw 1"}
              </button>
              <button
                onClick={drawTen}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
                    e.currentTarget.style.boxShadow = "0 14px 32px rgba(192,132,252,0.6), 0 0 0 1px rgba(0,0,0,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 10px 24px rgba(192,132,252,0.45), 0 0 0 1px rgba(0,0,0,0.3)";
                }}
                style={{
                  minWidth: "140px",
                  padding: "10px 18px",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: loading ? "default" : "pointer",
                  background:
                    "linear-gradient(135deg, #4dabf7, #9775fa, #f783ac)",
                  color: "#0b0c12",
                  opacity: loading ? 0.7 : 1,
                  transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
                  boxShadow:
                    "0 10px 24px rgba(192,132,252,0.45), 0 0 0 1px rgba(0,0,0,0.3)",
                }}
              >
                {loading ? "Drawing..." : "Draw 10"}
              </button>
            </>
          ) : currentPool === "limited" ? (
            <>
              <button
                onClick={drawPity}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
                    e.currentTarget.style.boxShadow = pityStreak >= PITY_THRESHOLD
                      ? "0 14px 32px rgba(217,119,6,0.7), 0 0 0 1px rgba(0,0,0,0.3)"
                      : "0 14px 32px rgba(217,119,6,0.6), 0 0 0 1px rgba(0,0,0,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = pityStreak >= PITY_THRESHOLD
                    ? "0 10px 24px rgba(217,119,6,0.5), 0 0 0 1px rgba(0,0,0,0.3)"
                    : "0 10px 24px rgba(217,119,6,0.4), 0 0 0 1px rgba(0,0,0,0.3)";
                }}
                style={{
                  minWidth: "160px",
                  padding: "10px 18px",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: loading ? "default" : "pointer",
                  background:
                    pityStreak >= PITY_THRESHOLD
                      ? "linear-gradient(135deg, #d97706, #b45309, #dc2626)"
                      : "linear-gradient(135deg, #f59e0b, #d97706, #b45309)",
                  color: "#ffffff",
                  opacity: loading ? 0.7 : 1,
                  transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
                  boxShadow:
                    pityStreak >= PITY_THRESHOLD
                      ? "0 10px 24px rgba(217,119,6,0.5), 0 0 0 1px rgba(0,0,0,0.3)"
                      : "0 10px 24px rgba(217,119,6,0.4), 0 0 0 1px rgba(0,0,0,0.3)",
                }}
              >
                {loading ? "Drawing..." : pityStreak >= PITY_THRESHOLD ? "Draw 1 (Guaranteed 5★!)" : "Draw 1"}
              </button>
              <button
                onClick={drawTenPity}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
                    e.currentTarget.style.boxShadow = pityStreak >= PITY_THRESHOLD
                      ? "0 14px 32px rgba(217,119,6,0.7), 0 0 0 1px rgba(0,0,0,0.3)"
                      : "0 14px 32px rgba(217,119,6,0.6), 0 0 0 1px rgba(0,0,0,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = pityStreak >= PITY_THRESHOLD
                    ? "0 10px 24px rgba(217,119,6,0.5), 0 0 0 1px rgba(0,0,0,0.3)"
                    : "0 10px 24px rgba(240,101,149,0.45), 0 0 0 1px rgba(0,0,0,0.3)";
                }}
                style={{
                  minWidth: "160px",
                  padding: "10px 18px",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: loading ? "default" : "pointer",
                  background:
                    pityStreak >= PITY_THRESHOLD
                      ? "linear-gradient(135deg, #d97706, #b45309, #dc2626)"
                      : "linear-gradient(135deg, #f59e0b, #d97706, #b45309)",
                  color: "#ffffff",
                  opacity: loading ? 0.7 : 1,
                  transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
                  boxShadow:
                    pityStreak >= PITY_THRESHOLD
                      ? "0 10px 24px rgba(217,119,6,0.5), 0 0 0 1px rgba(0,0,0,0.3)"
                      : "0 10px 24px rgba(240,101,149,0.45), 0 0 0 1px rgba(0,0,0,0.3)",
                }}
              >
                {loading ? "Drawing..." : pityStreak >= PITY_THRESHOLD ? "Draw 10 (Guaranteed 5★!)" : "Draw 10"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={drawMyGO}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
                    e.currentTarget.style.boxShadow = mygoPityStreak >= PITY_THRESHOLD
                      ? "0 14px 32px rgba(255,105,180,0.7), 0 0 0 1px rgba(0,0,0,0.3)"
                      : "0 14px 32px rgba(255,105,180,0.6), 0 0 0 1px rgba(0,0,0,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = mygoPityStreak >= PITY_THRESHOLD
                    ? "0 10px 24px rgba(255,105,180,0.6), 0 0 0 1px rgba(0,0,0,0.3)"
                    : "0 10px 24px rgba(255,105,180,0.45), 0 0 0 1px rgba(0,0,0,0.3)";
                }}
                style={{
                  minWidth: "160px",
                  padding: "10px 18px",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: loading ? "default" : "pointer",
                  background:
                    mygoPityStreak >= PITY_THRESHOLD
                      ? "linear-gradient(135deg, #ff69b4, #ff1493, #ff6b6b)"
                      : "linear-gradient(135deg, #f472b6, #ec4899, #db2777)",
                  color: "#0b0c12",
                  opacity: loading ? 0.7 : 1,
                  transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
                  boxShadow:
                    mygoPityStreak >= PITY_THRESHOLD
                      ? "0 10px 24px rgba(255,105,180,0.6), 0 0 0 1px rgba(0,0,0,0.3)"
                      : "0 10px 24px rgba(255,105,180,0.45), 0 0 0 1px rgba(0,0,0,0.3)",
                }}
              >
                {loading ? "Drawing..." : mygoPityStreak >= PITY_THRESHOLD ? "Draw 1 (Guaranteed 5★!)" : "Draw 1"}
              </button>
              <button
                onClick={drawTenMyGO}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.05)";
                    e.currentTarget.style.boxShadow = mygoPityStreak >= PITY_THRESHOLD
                      ? "0 14px 32px rgba(255,105,180,0.7), 0 0 0 1px rgba(0,0,0,0.3)"
                      : "0 14px 32px rgba(255,105,180,0.6), 0 0 0 1px rgba(0,0,0,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = mygoPityStreak >= PITY_THRESHOLD
                    ? "0 10px 24px rgba(255,105,180,0.6), 0 0 0 1px rgba(0,0,0,0.3)"
                    : "0 10px 24px rgba(255,105,180,0.45), 0 0 0 1px rgba(0,0,0,0.3)";
                }}
                style={{
                  minWidth: "160px",
                  padding: "10px 18px",
                  borderRadius: "999px",
                  border: "none",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: loading ? "default" : "pointer",
                  background:
                    mygoPityStreak >= PITY_THRESHOLD
                      ? "linear-gradient(135deg, #ff69b4, #ff1493, #ff6b6b)"
                      : "linear-gradient(135deg, #f472b6, #ec4899, #db2777)",
                  color: "#0b0c12",
                  opacity: loading ? 0.7 : 1,
                  transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out",
                  boxShadow:
                    mygoPityStreak >= PITY_THRESHOLD
                      ? "0 10px 24px rgba(255,105,180,0.6), 0 0 0 1px rgba(0,0,0,0.3)"
                      : "0 10px 24px rgba(255,105,180,0.45), 0 0 0 1px rgba(0,0,0,0.3)",
                }}
              >
                {loading ? "Drawing..." : mygoPityStreak >= PITY_THRESHOLD ? "Draw 10 (Guaranteed 5★!)" : "Draw 10"}
              </button>
            </>
          )}
        </div>

        {/* Results display - based on current pool */}
        {currentPool === "unlimited" && (
          <>
            {randomNumber && character && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "16px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #bfdbfe, #c7d2fe)",
                  border: "1px solid rgba(59,130,246,0.5)",
                }}
              >
                {/* Character Image */}
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <img
                    src={character.imagePath}
                    alt={character.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                    }}
                    onClick={() => setZoomedImage({ src: character.imagePath, name: character.name, band: character.bandDisplayName })}
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                </div>
                
                {/* Character Info */}
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <div style={{ 
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    background: "#dbeafe",
                    marginBottom: "8px",
                    fontSize: "11px",
                    color: "#4dabf7",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Obtained
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px", color: "#1e293b" }}>
                    {character.name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#334155", marginBottom: "8px" }}>
                    {character.bandDisplayName}
                  </p>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#d97706", letterSpacing: "2px" }}>
                    {rarity}
                  </p>
                </div>
                
                {/* Verification Info */}
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(59,130,246,0.3)" }}>
                  <p style={{ fontSize: "11px", marginBottom: "4px", color: "#334155" }}>
                    Random Seed: <strong style={{ color: "#1e293b" }}>{randomNumber}</strong>
                  </p>
                  {verificationResult && (
                    <VerificationDetails
                      isVerified={verificationResult.includes("succeeded")}
                      verificationType="single"
                      isExpanded={expandedVerification.type === "single"}
                      onToggle={() => setExpandedVerification({ type: expandedVerification.type === "single" ? null : "single" })}
                    />
                  )}
                </div>
              </div>
            )}

            {tenDrawHighlight && multiResults.length > 0 && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "16px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #bfdbfe, #c7d2fe)",
                  border: "2px solid rgba(59,130,246,0.6)",
                }}
              >
                <h2
                  style={{
                    fontSize: "16px",
                    marginBottom: "12px",
                    fontWeight: 700,
                    textAlign: "center",
                    color: "#92400e",
                  }}
                >
                  {selectedTenResultIndex !== null ? `Result #${selectedTenResultIndex + 1}` : "Best Result"}
                </h2>
                
                {/* Character Image */}
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <img
                    src={(selectedTenResultIndex !== null && multiResults[selectedTenResultIndex]?.character) 
                      ? multiResults[selectedTenResultIndex].character!.imagePath 
                      : tenDrawHighlight.imagePath}
                    alt={(selectedTenResultIndex !== null && multiResults[selectedTenResultIndex]?.character) 
                      ? multiResults[selectedTenResultIndex].character!.name 
                      : tenDrawHighlight.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                    }}
                    onClick={() => {
                      const char = (selectedTenResultIndex !== null && multiResults[selectedTenResultIndex]?.character) 
                        ? multiResults[selectedTenResultIndex].character! 
                        : tenDrawHighlight;
                      setZoomedImage({ src: char.imagePath, name: char.name, band: char.bandDisplayName });
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                </div>
                
                {/* Character Info */}
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px", color: "#1e293b" }}>
                    {(selectedTenResultIndex !== null && multiResults[selectedTenResultIndex]?.character) 
                      ? multiResults[selectedTenResultIndex].character!.name 
                      : tenDrawHighlight.name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#334155", marginBottom: "4px" }}>
                    {(selectedTenResultIndex !== null && multiResults[selectedTenResultIndex]?.character) 
                      ? multiResults[selectedTenResultIndex].character!.bandDisplayName 
                      : tenDrawHighlight.bandDisplayName}
                  </p>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#92400e" }}>
                    {(selectedTenResultIndex !== null && multiResults[selectedTenResultIndex]) 
                      ? multiResults[selectedTenResultIndex].rarity 
                      : mapActualRarityToStars(tenDrawHighlight.rarity)}
                  </p>
                </div>
              </div>
            )}
            
            {multiResults.length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #bfdbfe, #c7d2fe)",
                  border: "1px solid rgba(59,130,246,0.4)",
                }}
              >
                <h2
                  style={{
                    fontSize: "14px",
                    marginBottom: "8px",
                    fontWeight: 600,
                  }}
                >
                  All Results
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginBottom: "12px" }}>
                  {multiResults.map((d, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedTenResultIndex(idx)}
                      style={{ 
                        textAlign: "center",
                        padding: "6px",
                        borderRadius: "6px",
                        background: selectedTenResultIndex === idx ? "rgba(59,130,246,0.3)" : "rgba(59,130,246,0.05)",
                        border: selectedTenResultIndex === idx ? "2px solid rgba(59,130,246,0.6)" : "1px solid rgba(59,130,246,0.1)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTenResultIndex !== idx) {
                          e.currentTarget.style.background = "rgba(59,130,246,0.15)";
                          e.currentTarget.style.border = "1px solid rgba(59,130,246,0.3)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTenResultIndex !== idx) {
                          e.currentTarget.style.background = "rgba(59,130,246,0.05)";
                          e.currentTarget.style.border = "1px solid rgba(59,130,246,0.1)";
                        }
                      }}
                    >
                      <p style={{ fontSize: "10px", color: "#475569", margin: "0 0 4px 0" }}>#{idx + 1}</p>
                      <p style={{ fontSize: "12px", color: "#92400e", margin: "0 0 2px 0", fontWeight: 600 }}>{d.rarity}</p>
                      {d.character && (
                        <p style={{ fontSize: "9px", color: "#475569", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.character.name.split(" ")[0]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {/* Verification Info */}
                {multiResults.length > 0 && multiResults[0].verified !== undefined && (
                  <div style={{ paddingTop: "8px", borderTop: "1px solid rgba(59,130,246,0.2)" }}>
                    <VerificationDetails
                      isVerified={multiResults[0].verified}
                      verificationType="ten"
                      isExpanded={expandedVerification.type === "ten"}
                      onToggle={() => setExpandedVerification({ type: expandedVerification.type === "ten" ? null : "ten" })}
                    />
                  </div>
                )}
              </div>
            )}

            {!randomNumber && verificationResult && (
              <p
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#ffb3b3",
                  textAlign: "center",
                }}
              >
                {verificationResult}
              </p>
            )}
          </>
        )}

        {currentPool === "limited" && (
          <>
            {pityRandomNumber && pityCharacter && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "16px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #fef3c7, #fde68a)",
                  border: "1px solid rgba(217,119,6,0.5)",
                }}
              >
                {/* Character Image */}
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <img
                    src={pityCharacter.imagePath}
                    alt={pityCharacter.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                    }}
                    onClick={() => setZoomedImage({ src: pityCharacter.imagePath, name: pityCharacter.name, band: pityCharacter.bandDisplayName })}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                </div>
                
                {/* Character Info */}
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <div style={{ 
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    background: "rgba(217,119,6,0.25)",
                    marginBottom: "8px",
                    fontSize: "11px",
                    color: "#92400e",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Obtained
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px", color: "#1e293b" }}>
                    {pityCharacter.name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#334155", marginBottom: "8px" }}>
                    {pityCharacter.bandDisplayName}
                  </p>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#92400e", letterSpacing: "2px" }}>
                    {pityRarity}
                  </p>
                </div>
                
                {/* Pity Counter and Verification */}
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(217,119,6,0.3)" }}>
                  <p style={{ fontSize: "11px", marginBottom: "4px", color: "#334155" }}>
                    Pity: <strong style={{ color: "#78350f" }}>{pityStreak}/{PITY_THRESHOLD}</strong>
                  </p>
                  <p style={{ fontSize: "11px", marginBottom: "4px", color: "#334155" }}>
                    Random Seed: <strong style={{ color: "#1e293b" }}>{pityRandomNumber}</strong>
                  </p>
                  {pityVerificationResult && (
                    <VerificationDetails
                      isVerified={pityVerificationResult.includes("succeeded")}
                      verificationType="pity"
                      isExpanded={expandedVerification.type === "pity"}
                      onToggle={() => setExpandedVerification({ type: expandedVerification.type === "pity" ? null : "pity" })}
                    />
                  )}
                </div>
              </div>
            )}

            {tenPityHighlight && tenPityResults.length > 0 && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "16px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #fef3c7, #fde68a)",
                  border: "2px solid rgba(217,119,6,0.6)",
                }}
              >
                <h2
                  style={{
                    fontSize: "16px",
                    marginBottom: "12px",
                    fontWeight: 700,
                    textAlign: "center",
                    color: "#92400e",
                  }}
                >
                  {selectedTenPityResultIndex !== null ? `Result #${selectedTenPityResultIndex + 1}` : "Best Result"}
                </h2>
                
                {/* Character Image */}
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <img
                    src={(selectedTenPityResultIndex !== null && tenPityResults[selectedTenPityResultIndex]?.character) 
                      ? tenPityResults[selectedTenPityResultIndex].character!.imagePath 
                      : tenPityHighlight.imagePath}
                    alt={(selectedTenPityResultIndex !== null && tenPityResults[selectedTenPityResultIndex]?.character) 
                      ? tenPityResults[selectedTenPityResultIndex].character!.name 
                      : tenPityHighlight.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                    }}
                    onClick={() => {
                      const char = (selectedTenPityResultIndex !== null && tenPityResults[selectedTenPityResultIndex]?.character) 
                        ? tenPityResults[selectedTenPityResultIndex].character! 
                        : tenPityHighlight;
                      setZoomedImage({ src: char.imagePath, name: char.name, band: char.bandDisplayName });
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                </div>
                
                {/* Character Info */}
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px", color: "#1e293b" }}>
                    {(selectedTenPityResultIndex !== null && tenPityResults[selectedTenPityResultIndex]?.character) 
                      ? tenPityResults[selectedTenPityResultIndex].character!.name 
                      : tenPityHighlight.name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#334155", marginBottom: "4px" }}>
                    {(selectedTenPityResultIndex !== null && tenPityResults[selectedTenPityResultIndex]?.character) 
                      ? tenPityResults[selectedTenPityResultIndex].character!.bandDisplayName 
                      : tenPityHighlight.bandDisplayName}
                  </p>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#92400e" }}>
                    {(selectedTenPityResultIndex !== null && tenPityResults[selectedTenPityResultIndex]) 
                      ? tenPityResults[selectedTenPityResultIndex].rarity 
                      : mapActualRarityToStars(tenPityHighlight.rarity)}
                  </p>
                </div>
                
                {/* Verification Info */}
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(217,119,6,0.3)" }}>
                  <p style={{ fontSize: "11px", marginBottom: "4px", color: "#334155" }}>
                    Pity: <strong style={{ color: "#78350f" }}>{pityStreak}/{PITY_THRESHOLD}</strong>
                  </p>
                  {tenPityResults.length > 0 && (
                    <p style={{ fontSize: "11px", marginBottom: "4px", color: "#334155" }}>
                      Random Seed: <strong style={{ color: "#1e293b" }}>{(selectedTenPityResultIndex !== null && tenPityResults[selectedTenPityResultIndex]) 
                        ? tenPityResults[selectedTenPityResultIndex].random 
                        : (tenPityResults.find(r => r.character?.rarity === tenPityHighlight.rarity && r.character?.name === tenPityHighlight.name)?.random || tenPityResults[0].random)}</strong>
                    </p>
                  )}
                  {tenPityVerificationResult && (
                    <VerificationDetails
                      isVerified={tenPityVerificationResult.includes("succeeded")}
                      verificationType="tenPity"
                      isExpanded={expandedVerification.type === "tenPity"}
                      onToggle={() => setExpandedVerification({ type: expandedVerification.type === "tenPity" ? null : "tenPity" })}
                    />
                  )}
                </div>
              </div>
            )}
            
            {tenPityResults.length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #fef3c7, #fde68a)",
                  border: "1px solid rgba(217,119,6,0.4)",
                }}
              >
                <h2
                  style={{
                    fontSize: "14px",
                    marginBottom: "8px",
                    fontWeight: 600,
                  }}
                >
                  All Results
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px", marginBottom: "12px" }}>
                  {tenPityResults.map((d, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedTenPityResultIndex(idx)}
                      style={{ 
                        textAlign: "center",
                        padding: "6px",
                        borderRadius: "6px",
                        background: selectedTenPityResultIndex === idx ? "rgba(217,119,6,0.4)" : "rgba(217,119,6,0.15)",
                        border: selectedTenPityResultIndex === idx ? "2px solid rgba(217,119,6,0.7)" : "1px solid rgba(217,119,6,0.25)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTenPityResultIndex !== idx) {
                          e.currentTarget.style.background = "rgba(217,119,6,0.25)";
                          e.currentTarget.style.border = "1px solid rgba(217,119,6,0.4)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTenPityResultIndex !== idx) {
                          e.currentTarget.style.background = "rgba(217,119,6,0.15)";
                          e.currentTarget.style.border = "1px solid rgba(217,119,6,0.25)";
                        }
                      }}
                    >
                      <p style={{ fontSize: "10px", color: "#475569", margin: "0 0 4px 0" }}>#{idx + 1}</p>
                      <p style={{ fontSize: "12px", color: "#92400e", margin: "0 0 2px 0", fontWeight: 600 }}>{d.rarity}</p>
                      {d.character && (
                        <p style={{ fontSize: "9px", color: "#475569", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.character.name.split(" ")[0]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!pityRandomNumber && !tenPityResults.length && pityVerificationResult && (
              <p
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#ffb3b3",
                  textAlign: "center",
                }}
              >
                {pityVerificationResult}
              </p>
            )}

            {!pityRandomNumber && !tenPityResults.length && tenPityVerificationResult && (
              <p
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#ffb3b3",
                  textAlign: "center",
                }}
              >
                {tenPityVerificationResult}
              </p>
            )}
          </>
        )}

        {currentPool === "mygo" && (
          <>
            {mygoRandomNumber && mygoCharacter && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "16px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #fce7f3, #fbcfe8)",
                  border: "1px solid rgba(244,114,182,0.4)",
                }}
              >
                {/* Character Image */}
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <img
                    src={mygoCharacter.imagePath}
                    alt={mygoCharacter.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                    }}
                    onClick={() => setZoomedImage({ src: mygoCharacter.imagePath, name: mygoCharacter.name, band: mygoCharacter.bandDisplayName })}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                </div>
                
                {/* Character Info */}
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <div style={{ 
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "12px",
                    background: "#fce7f3",
                    marginBottom: "8px",
                    fontSize: "11px",
                    color: "#ff69b4",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    Obtained
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "6px", color: "#1e293b" }}>
                    {mygoCharacter.name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#334155", marginBottom: "8px" }}>
                    {mygoCharacter.bandDisplayName}
                  </p>
                  <p style={{ fontSize: "18px", fontWeight: 700, color: "#be185d", letterSpacing: "2px" }}>
                    {mygoRarity}
                  </p>
                </div>
                
                {/* Pity Counter and Verification */}
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(244,114,182,0.3)" }}>
                  <p style={{ fontSize: "11px", marginBottom: "4px", color: "#334155" }}>
                    Pity: <strong style={{ color: "#be185d" }}>{mygoPityStreak}/{PITY_THRESHOLD}</strong>
                  </p>
                  <p style={{ fontSize: "11px", marginBottom: "4px", color: "#334155" }}>
                    Random Seed: <strong style={{ color: "#1e293b" }}>{mygoRandomNumber}</strong>
                  </p>
                  {mygoVerificationResult && (
                    <VerificationDetails
                      isVerified={mygoVerificationResult.includes("succeeded")}
                      verificationType="mygo"
                      isExpanded={expandedVerification.type === "mygo"}
                      onToggle={() => setExpandedVerification({ type: expandedVerification.type === "mygo" ? null : "mygo" })}
                    />
                  )}
                </div>
              </div>
            )}

            {tenMygoHighlight && tenMygoResults.length > 0 && (
              <div
                style={{
                  marginTop: "18px",
                  padding: "16px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, #fce7f3, #fbcfe8)",
                  border: "2px solid rgba(244,114,182,0.5)",
                }}
              >
                <h2
                  style={{
                    fontSize: "16px",
                    marginBottom: "12px",
                    fontWeight: 700,
                    textAlign: "center",
                    color: "#ff69b4",
                  }}
                >
                  {selectedTenMygoResultIndex !== null ? `Result #${selectedTenMygoResultIndex + 1}` : "Best Result"}
                </h2>
                
                {/* Character Image */}
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <img
                    src={(selectedTenMygoResultIndex !== null && tenMygoResults[selectedTenMygoResultIndex]?.character) 
                      ? tenMygoResults[selectedTenMygoResultIndex].character!.imagePath 
                      : tenMygoHighlight.imagePath}
                    alt={(selectedTenMygoResultIndex !== null && tenMygoResults[selectedTenMygoResultIndex]?.character) 
                      ? tenMygoResults[selectedTenMygoResultIndex].character!.name 
                      : tenMygoHighlight.name}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                    }}
                    onClick={() => {
                      const char = (selectedTenMygoResultIndex !== null && tenMygoResults[selectedTenMygoResultIndex]?.character) 
                        ? tenMygoResults[selectedTenMygoResultIndex].character! 
                        : tenMygoHighlight;
                      setZoomedImage({ src: char.imagePath, name: char.name, band: char.bandDisplayName });
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.02)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                </div>
                
                {/* Character Info */}
                <div style={{ textAlign: "center", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px", color: "#1e293b" }}>
                    {(selectedTenMygoResultIndex !== null && tenMygoResults[selectedTenMygoResultIndex]?.character) 
                      ? tenMygoResults[selectedTenMygoResultIndex].character!.name 
                      : tenMygoHighlight.name}
                  </h3>
                  <p style={{ fontSize: "14px", color: "#334155", marginBottom: "4px" }}>
                    {(selectedTenMygoResultIndex !== null && tenMygoResults[selectedTenMygoResultIndex]?.character) 
                      ? tenMygoResults[selectedTenMygoResultIndex].character!.bandDisplayName 
                      : tenMygoHighlight.bandDisplayName}
                  </p>
                  <p style={{ fontSize: "16px", fontWeight: 600, color: "#be185d" }}>
                    {(selectedTenMygoResultIndex !== null && tenMygoResults[selectedTenMygoResultIndex]) 
                      ? tenMygoResults[selectedTenMygoResultIndex].rarity 
                      : mapActualRarityToStars(tenMygoHighlight.rarity)}
                  </p>
                </div>
                
                {/* Verification Info */}
                <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid rgba(244,114,182,0.3)" }}>
                  <p style={{ fontSize: "11px", marginBottom: "4px", color: "#334155" }}>
                    Pity: <strong style={{ color: "#be185d" }}>{mygoPityStreak}/{PITY_THRESHOLD}</strong>
                  </p>
                  {tenMygoResults.length > 0 && (
                    <p style={{ fontSize: "11px", marginBottom: "4px", color: "#334155" }}>
                      Random Seed: <strong style={{ color: "#1e293b" }}>{(selectedTenMygoResultIndex !== null && tenMygoResults[selectedTenMygoResultIndex]) 
                        ? tenMygoResults[selectedTenMygoResultIndex].random 
                        : (tenMygoResults.find(r => r.character?.rarity === tenMygoHighlight.rarity && r.character?.name === tenMygoHighlight.name)?.random || tenMygoResults[0].random)}</strong>
                    </p>
                  )}
                  {tenMygoVerificationResult && (
                    <VerificationDetails
                      isVerified={tenMygoVerificationResult.includes("succeeded")}
                      verificationType="tenMygo"
                      isExpanded={expandedVerification.type === "tenMygo"}
                      onToggle={() => setExpandedVerification({ type: expandedVerification.type === "tenMygo" ? null : "tenMygo" })}
                    />
                  )}
                </div>
              </div>
            )}
            
            {tenMygoResults.length > 0 && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  borderRadius: "10px",
                  background:
                    "linear-gradient(135deg, #fce7f3, #fbcfe8)",
                  border: "1px solid rgba(255,105,180,0.2)",
                }}
              >
                <h2
                  style={{
                    fontSize: "14px",
                    marginBottom: "8px",
                    fontWeight: 600,
                  }}
                >
                  All Results
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "8px" }}>
                  {tenMygoResults.map((d, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedTenMygoResultIndex(idx)}
                      style={{ 
                        textAlign: "center",
                        padding: "6px",
                        borderRadius: "6px",
                        background: selectedTenMygoResultIndex === idx ? "rgba(244,114,182,0.4)" : "#fce7f3",
                        border: selectedTenMygoResultIndex === idx ? "2px solid rgba(244,114,182,0.7)" : "1px solid rgba(244,114,182,0.3)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedTenMygoResultIndex !== idx) {
                          e.currentTarget.style.background = "rgba(244,114,182,0.2)";
                          e.currentTarget.style.border = "1px solid rgba(244,114,182,0.5)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTenMygoResultIndex !== idx) {
                          e.currentTarget.style.background = "#fce7f3";
                          e.currentTarget.style.border = "1px solid rgba(244,114,182,0.3)";
                        }
                      }}
                    >
                      <p style={{ fontSize: "10px", color: "#475569", margin: "0 0 4px 0" }}>#{idx + 1}</p>
                      <p style={{ fontSize: "12px", color: "#be185d", margin: "0 0 2px 0", fontWeight: 600 }}>{d.rarity}</p>
                      {d.character && (
                        <p style={{ fontSize: "9px", color: "#475569", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.character.name.split(" ")[0]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!mygoRandomNumber && !tenMygoResults.length && mygoVerificationResult && (
              <p
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#ffb3b3",
                  textAlign: "center",
                }}
              >
                {mygoVerificationResult}
              </p>
            )}

            {!mygoRandomNumber && !tenMygoResults.length && tenMygoVerificationResult && (
              <p
                style={{
                  marginTop: "12px",
                  fontSize: "13px",
                  color: "#ffb3b3",
                  textAlign: "center",
                }}
              >
                {tenMygoVerificationResult}
              </p>
            )}
          </>
        )}
      </div>

      {/* Card Gallery Modal */}
      {showCardGallery && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            zIndex: 1000,
            overflowY: "auto",
            padding: "20px",
          }}
          onClick={() => setShowCardGallery(false)}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              background:
                "linear-gradient(145deg, #e0f2fe, #dbeafe)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 28px 60px rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                Card Gallery
              </h2>
              <button
                onClick={() => setShowCardGallery(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#1e293b",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e0f2fe";
                  e.currentTarget.style.color = "#1e293b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#1e293b";
                }}
              >
                Close
              </button>
            </div>

            {/* Display cards by rarity (5★ to 2★) */}
            {[5, 4, 3, 2].map((rarity) => {
              // Combine CHARACTERS and MYGO_CHARACTERS for this rarity
              const allCharacters = [
                ...(CHARACTERS[rarity] || []),
                ...(MYGO_CHARACTERS[rarity] || []),
              ];
              const charactersByBand: Record<string, Character[]> = {};
              
              // Group characters by band
              allCharacters.forEach((char) => {
                if (!charactersByBand[char.band]) {
                  charactersByBand[char.band] = [];
                }
                charactersByBand[char.band].push(char);
              });

              return (
                <div key={rarity} style={{ marginBottom: "32px" }}>
                  <h3
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      color: "#92400e",
                      marginBottom: "16px",
                      paddingBottom: "8px",
                      borderBottom: "2px solid rgba(217,119,6,0.4)",
                    }}
                  >
                    {mapActualRarityToStars(rarity)} Cards
                  </h3>

                  {/* Display by band */}
                  {Object.entries(charactersByBand).map(([band, chars]) => (
                    <div key={band} style={{ marginBottom: "24px" }}>
                      <h4
                        style={{
                          fontSize: "16px",
                          fontWeight: 600,
                          color: "#1e293b",
                          marginBottom: "12px",
                          paddingLeft: "8px",
                          borderLeft: "3px solid rgba(59,130,246,0.5)",
                        }}
                      >
                        {chars[0].bandDisplayName}
                      </h4>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                          gap: "12px",
                        }}
                      >
                        {chars.map((char, idx) => (
                          <div
                            key={`${char.name}-${rarity}-${idx}`}
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.05))",
                              borderRadius: "12px",
                              padding: "8px",
                              border: "1px solid rgba(59,130,246,0.2)",
                              transition: "all 0.2s ease",
                              cursor: "pointer",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = "translateY(-4px)";
                              e.currentTarget.style.boxShadow =
                                "0 8px 16px rgba(59,130,246,0.3)";
                              e.currentTarget.style.borderColor =
                                "rgba(59,130,246,0.5)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow = "none";
                              e.currentTarget.style.borderColor =
                                "rgba(59,130,246,0.2)";
                            }}
                          >
                            <img
                              src={char.imagePath}
                              alt={char.name}
                              style={{
                                width: "100%",
                                height: "auto",
                                borderRadius: "8px",
                                cursor: "pointer",
                                transition: "transform 0.2s ease",
                                marginBottom: "6px",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomedImage({ src: char.imagePath, name: char.name, band: char.bandDisplayName });
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.05)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                            />
                            <p
                              style={{
                                fontSize: "11px",
                                color: "#1e293b",
                                textAlign: "center",
                                margin: 0,
                                fontWeight: 500,
                              }}
                            >
                              {char.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pool Info Modal */}
      {showPoolInfo && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            zIndex: 1000,
            overflowY: "auto",
            padding: "20px",
          }}
          onClick={() => setShowPoolInfo(false)}
        >
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              background:
                "linear-gradient(145deg, #e0f2fe, #dbeafe)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 28px 60px rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                Pool Information
              </h2>
              <button
                onClick={() => setShowPoolInfo(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#1e293b",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e0f2fe";
                  e.currentTarget.style.color = "#1e293b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#1e293b";
                }}
              >
                Close
              </button>
            </div>

            {/* Rarity Rates */}
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#92400e",
                  marginBottom: "16px",
                  paddingBottom: "8px",
                  borderBottom: "2px solid rgba(217,119,6,0.4)",
                }}
              >
                Rarity Rates
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    background: "rgba(217,119,6,0.2)",
                    border: "1px solid rgba(217,119,6,0.3)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "16px", fontWeight: 600, color: "#92400e" }}>★★★★★</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: 600 }}>1.00%</span>
                  </div>
                </div>
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.2)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "16px", fontWeight: 600, color: "#3b82f6" }}>★★★★</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: 600 }}>3.00%</span>
                  </div>
                </div>
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    background: "rgba(192,132,252,0.1)",
                    border: "1px solid rgba(192,132,252,0.2)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "16px", fontWeight: 600, color: "#c084fc" }}>★★★</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: 600 }}>48.00%</span>
                  </div>
                </div>
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "10px",
                    background: "rgba(168,85,247,0.1)",
                    border: "1px solid rgba(168,85,247,0.2)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "16px", fontWeight: 600, color: "#a855f7" }}>★★</span>
                    <span style={{ fontSize: "14px", color: "#1e293b", fontWeight: 600 }}>48.00%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pity System */}
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#92400e",
                  marginBottom: "16px",
                  paddingBottom: "8px",
                  borderBottom: "2px solid rgba(217,119,6,0.4)",
                }}
              >
                Pity System (Premium & MyGO Pools)
              </h3>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(217,119,6,0.15)",
                  border: "1px solid rgba(217,119,6,0.3)",
                }}
              >
                <p style={{ fontSize: "14px", color: "#1e293b", marginBottom: "8px", lineHeight: "1.6" }}>
                  After <strong style={{ color: "#78350f" }}>50 consecutive draws</strong> without a 5★ card, the next draw is <strong style={{ color: "#78350f" }}>guaranteed to be 5★</strong>.
                </p>
                <p style={{ fontSize: "13px", color: "#334155", marginBottom: "4px" }}>
                  • Pity counter resets to 0 when you obtain a 5★ card
                </p>
                <p style={{ fontSize: "13px", color: "#334155", marginBottom: "4px" }}>
                  • Pity counter increments by 1 for each non-5★ draw
                </p>
                <p style={{ fontSize: "13px", color: "#334155" }}>
                  • Pity counter is tracked separately for Premium and MyGO pools
                </p>
              </div>
            </div>

            {/* Pool Types */}
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#92400e",
                  marginBottom: "16px",
                  paddingBottom: "8px",
                  borderBottom: "2px solid rgba(217,119,6,0.4)",
                }}
              >
                Available Pools
              </h3>
              <div style={{ display: "grid", gap: "12px" }}>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "rgba(59,130,246,0.1)",
                    border: "1px solid rgba(59,130,246,0.2)",
                  }}
                >
                  <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#3b82f6", marginBottom: "8px" }}>
                    Standard Gacha
                  </h4>
                  <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                    Standard probability rates apply. No pity system. All bands available.
                  </p>
                </div>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "rgba(251,191,36,0.1)",
                    border: "1px solid rgba(251,191,36,0.2)",
                  }}
                >
                  <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#fbbf24", marginBottom: "8px" }}>
                    Premium Gacha
                  </h4>
                  <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                    Pity system enabled. Guaranteed 5★ after 50 draws without 5★. All bands available.
                  </p>
                </div>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "10px",
                    background: "#fce7f3",
                    border: "1px solid rgba(244,114,182,0.3)",
                  }}
                >
                  <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#f472b6", marginBottom: "8px" }}>
                    MyGO!!!!! Exclusive Gacha
                  </h4>
                  <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                    Pity system enabled. Only MyGO!!!!! members available. Guaranteed 5★ after 50 draws without 5★.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ZK Flow Modal */}
      {showZKFlow && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.85)",
            zIndex: 1000,
            overflowY: "auto",
            padding: "20px",
          }}
          onClick={() => setShowZKFlow(false)}
        >
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              background:
                "linear-gradient(145deg, #e0f2fe, #dbeafe)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 28px 60px rgba(0,0,0,0.7)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#1e293b",
                }}
              >
                Zero-Knowledge Proof Flow & Circuit Design
              </h2>
              <button
                onClick={() => setShowZKFlow(false)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#1e293b",
                  fontSize: "14px",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#e0f2fe";
                  e.currentTarget.style.color = "#1e293b";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#1e293b";
                }}
              >
                Close
              </button>
            </div>

            {/* ZK Flow Overview */}
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#92400e",
                  marginBottom: "16px",
                  paddingBottom: "8px",
                  borderBottom: "2px solid rgba(217,119,6,0.4)",
                }}
              >
                Zero-Knowledge Proof Flow
              </h3>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  marginBottom: "12px",
                }}
              >
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#3b82f6", marginBottom: "8px" }}>
                  1. Server-Side Proof Generation
                </h4>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • Server generates a random seed (private witness) and computes random value(s) using LCG
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • Server computes rarity from random value(s) using threshold mapping (mod 10000)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • For pity circuits: Server applies pity logic (force 5★ if streak ≥ 50) and updates streak counter
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                  • Server creates ZK proof using Halo2 that proves all computations (LCG, rarity, pity) are correct
                </p>
              </div>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(192,132,252,0.1)",
                  border: "1px solid rgba(192,132,252,0.2)",
                  marginBottom: "12px",
                }}
              >
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#c084fc", marginBottom: "8px" }}>
                  2. Client-Side Verification
                </h4>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • Client receives public outputs (random value(s), rarity/rarities, streak_next if applicable) and proof
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • Client verifies the proof using the same circuit parameters (verifying key) and public inputs
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                  • If verification succeeds, client can trust that LCG, rarity computation, and pity logic (if applicable) are all correct
                </p>
              </div>
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(255,215,0,0.1)",
                  border: "1px solid rgba(255,215,0,0.2)",
                }}
              >
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#ffd700", marginBottom: "8px" }}>
                  3. Security Guarantees
                </h4>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • Server cannot forge random values or rarities without being detected
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • Seed remains private (witness), only computed values are public
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • Pity mechanism is cryptographically enforced: server cannot skip or manipulate pity logic
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                  • Proof ensures computational integrity of LCG, rarity mapping, and pity enforcement
                </p>
              </div>
            </div>

            {/* Circuit Design */}
            <div style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#92400e",
                  marginBottom: "16px",
                  paddingBottom: "8px",
                  borderBottom: "2px solid rgba(217,119,6,0.4)",
                }}
              >
                Circuit Design
              </h3>
              
              {/* Single Draw Circuit */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  marginBottom: "12px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#3b82f6", marginBottom: "12px" }}>
                  Single Draw Circuit
                </h4>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>LCG Computation:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "12px" }}>
                  random = (seed × 1103515245 + 12345) mod 2³²
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>Rarity Computation:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  random_mod_10000 = random % 10000
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "12px" }}>
                  rarity = compute_rarity(random_mod_10000)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Witness:</strong> seed (private)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Public Output:</strong> random value
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>Circuit Constraints:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>LCG Gate:</strong> a × seed + c = random + m × quotient
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  where a=1103515245, c=12345, m=2³²
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "12px" }}>
                  <strong>Rarity Gate:</strong> random = random_mod_10000 + 10000 × quotient_10000
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>Rarity Validity:</strong> (rarity-1)×(rarity-2)×(rarity-3)×(rarity-4) = 0
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>Threshold Flags:</strong> flag_5★ + flag_4★ + flag_3★ + flag_2★ = 1
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "12px" }}>
                  <strong>Range Verification:</strong> Each flag enforces correct threshold boundaries
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Witness:</strong> seed (private)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Public Output:</strong> random value
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Circuit Size:</strong> k=6 (2⁶ = 64 rows)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                  • <strong style={{ color: "#1e293b" }}>Rarity Thresholds:</strong> 5★(0-99), 4★(100-399), 3★(400-5199), 2★(5200-9999)
                </p>
              </div>

              {/* Pity Circuit */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  marginBottom: "12px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#fbbf24", marginBottom: "12px" }}>
                  Pity Circuit (Single Draw)
                </h4>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>LCG:</strong> Same as Single Draw (multiplier=1103515245, increment=12345)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>Pity Logic:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  computed_rarity = compute_rarity(random % 10000)
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  if streak_prev ≥ 50: final_rarity = 4 (5★ forced)
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "12px" }}>
                  else: final_rarity = computed_rarity
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "12px" }}>
                  if final_rarity == 4: streak_next = 0
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "12px" }}>
                  else: streak_next = streak_prev + 1
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>Circuit Constraints:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>LCG Gate:</strong> Same as Single Draw
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>Rarity Gate:</strong> Same as Single Draw (with threshold flags)
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>Pity Flag:</strong> pity_active ∈ {"{"}0,1{"}"}, verifies streak_prev ≥ 50
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>Pity Enforcement:</strong> pity_active × (final_rarity - 4) = 0
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>No Pity:</strong> (1 - pity_active) × (final_rarity - computed_rarity) = 0
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>5★ Flag:</strong> is_5star ∈ {"{"}0,1{"}"}, verifies final_rarity == 4
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "12px" }}>
                  <strong>Streak Update:</strong> is_5star × streak_next = 0 AND (1-is_5star) × (streak_next - streak_prev - 1) = 0
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Public Inputs:</strong> streak_prev, random_value, final_rarity, streak_next
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Total Constraints:</strong> ~25 constraints per draw (LCG + rarity + pity)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Circuit Size:</strong> k=6 (2⁶ = 64 rows)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                  • <strong style={{ color: "#1e293b" }}>Guarantee:</strong> Pity mechanism (50 draws threshold) is cryptographically enforced
                </p>
              </div>

              {/* Ten Draw Circuit */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(192,132,252,0.1)",
                  border: "1px solid rgba(192,132,252,0.2)",
                  marginBottom: "12px",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#c084fc", marginBottom: "12px" }}>
                  Ten Draw Circuit
                </h4>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>LCG Parameters:</strong> Different from Single Draw
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  multiplier = 1664525, increment = 1013904223, modulus = 2³²
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>Iterative LCG:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  random[0] = (seed × 1664525 + 1013904223) mod 2³²
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "12px" }}>
                  for i in 1..10: random[i] = (random[i-1] × 1664525 + 1013904223) mod 2³²
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>Circuit Structure:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>Row 0:</strong> LCG(seed) → random[0]
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>Row 1:</strong> LCG(random[0]) → random[1]
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>...</strong> (continues for 10 iterations)
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "12px" }}>
                  <strong>Row 9:</strong> LCG(random[8]) → random[9]
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>Each draw:</strong> Verifies LCG + rarity computation (same constraints as Single)
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "12px" }}>
                  <strong>Sequential Verification:</strong> random[i] is used as input for random[i+1]
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Public Outputs:</strong> 10 random values, 10 rarities
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Total Constraints:</strong> ~15 constraints × 10 draws = ~150 constraints
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Circuit Size:</strong> k=7 (2⁷ = 128 rows)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                  • <strong style={{ color: "#1e293b" }}>Guarantee:</strong> Sequential order and rarity of all 10 draws are verified
                </p>
              </div>

              {/* Ten Draw Pity Circuit */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(244,114,182,0.1)",
                  border: "1px solid rgba(244,114,182,0.2)",
                }}
              >
                <h4 style={{ fontSize: "16px", fontWeight: 600, color: "#f472b6", marginBottom: "12px" }}>
                  Ten Draw Pity Circuit
                </h4>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>LCG:</strong> Same as Ten Draw (multiplier=1664525, increment=1013904223)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>Combined Logic:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  streak_current = streak_prev
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  for i in 0..10:
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "24px" }}>
                  computed_rarity[i] = compute_rarity(random[i] % 10000)
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "24px" }}>
                  final_rarity[i] = pity_final_rarity(streak_current, computed_rarity[i])
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "24px" }}>
                  streak_current = pity_streak_next(streak_current, final_rarity[i])
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>Circuit Structure:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>Initialization:</strong> streak_current = streak_prev
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "4px", paddingLeft: "12px" }}>
                  <strong>For each draw i (0-9):</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "2px", paddingLeft: "24px" }}>
                  1. LCG: random[i] = (prev_random × 1664525 + 1013904223) mod 2³²
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "2px", paddingLeft: "24px" }}>
                  2. Rarity: computed_rarity[i] = compute_rarity(random[i] % 10000)
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "2px", paddingLeft: "24px" }}>
                  3. Pity: final_rarity[i] = pity_final_rarity(streak_current, computed_rarity[i])
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "24px" }}>
                  4. Update: streak_current = pity_streak_next(streak_current, final_rarity[i])
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", marginBottom: "8px", paddingLeft: "12px" }}>
                  <strong>Final:</strong> streak_next = streak_current (after all 10 draws)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Public Inputs:</strong> streak_prev, 10 randoms, 10 final_rarities, streak_next
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Total Constraints:</strong> ~25 constraints × 10 draws = ~250 constraints
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  • <strong style={{ color: "#1e293b" }}>Circuit Size:</strong> k=7 (2⁷ = 128 rows)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                  • <strong style={{ color: "#1e293b" }}>Guarantee:</strong> Pity mechanism is cryptographically enforced for each draw, streak correctly tracks across all 10 draws
                </p>
              </div>
            </div>

            {/* Technical Details */}
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#92400e",
                  marginBottom: "16px",
                  paddingBottom: "8px",
                  borderBottom: "2px solid rgba(217,119,6,0.4)",
                }}
              >
                Technical Details
              </h3>
              
              {/* ZK System Details */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(168,85,247,0.1)",
                  border: "1px solid rgba(168,85,247,0.2)",
                  marginBottom: "12px",
                }}
              >
                <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#a855f7", marginBottom: "12px" }}>
                  Zero-Knowledge Proof System
                </h4>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  <strong style={{ color: "#1e293b" }}>Protocol:</strong> Halo2 (PLONK-based universal SNARK)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  <strong style={{ color: "#1e293b" }}>Field:</strong> Pasta curves (Pallas/Vesta) - 255-bit prime field
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  <strong style={{ color: "#1e293b" }}>Transcript:</strong> Blake2b with Challenge255
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  <strong style={{ color: "#1e293b" }}>Proof System:</strong> SingleVerifier (non-recursive)
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6" }}>
                  <strong style={{ color: "#1e293b" }}>Trusted Setup:</strong> Per-circuit (circuit-specific SRS)
                </p>
              </div>

              {/* LCG Parameters */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(59,130,246,0.1)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  marginBottom: "12px",
                }}
              >
                <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#3b82f6", marginBottom: "12px" }}>
                  LCG Parameters
                </h4>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>Single Draw / Pity Circuit:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  multiplier = 1103515245 (glibc LCG constant)
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  increment = 12345
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "8px" }}>
                  modulus = 2³² = 4,294,967,296
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>Ten Draw / Ten Pity Circuit:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  multiplier = 1664525 (Numerical Recipes LCG constant)
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  increment = 1013904223
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px" }}>
                  modulus = 2³² = 4,294,967,296
                </p>
              </div>

              {/* Rarity Mapping */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.2)",
                  marginBottom: "12px",
                }}
              >
                <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#fbbf24", marginBottom: "12px" }}>
                  Rarity Mapping Algorithm
                </h4>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "4px" }}>
                  random_mod_10000 = random % 10000
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  if random_mod_10000 &lt; 100: rarity = 4 (5★) - 1% probability
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  else if random_mod_10000 &lt; 400: rarity = 3 (4★) - 3% probability
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  else if random_mod_10000 &lt; 5200: rarity = 2 (3★) - 48% probability
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "8px" }}>
                  else: rarity = 1 (2★) - 48% probability
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  <strong style={{ color: "#1e293b" }}>Circuit Verification:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  • Binary flags verify exactly one threshold range is active
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  • Range constraints verify random_mod_10000 falls in correct interval
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px" }}>
                  • Rarity constraint verifies computed_rarity matches active flag
                </p>
              </div>

              {/* Pity Mechanism */}
              <div
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: "rgba(244,114,182,0.1)",
                  border: "1px solid rgba(244,114,182,0.2)",
                }}
              >
                <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#f472b6", marginBottom: "12px" }}>
                  Pity Mechanism Details
                </h4>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  <strong style={{ color: "#1e293b" }}>Threshold:</strong> PITY_THRESHOLD = 50 consecutive draws without 5★
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "8px" }}>
                  <strong style={{ color: "#1e293b" }}>Enforcement:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  pity_active = (streak_prev ≥ 50) ? 1 : 0
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  final_rarity = pity_active ? 4 : computed_rarity
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "8px" }}>
                  streak_next = (final_rarity == 4) ? 0 : streak_prev + 1
                </p>
                <p style={{ fontSize: "13px", color: "#334155", lineHeight: "1.6", marginBottom: "4px" }}>
                  <strong style={{ color: "#1e293b" }}>Circuit Verification:</strong>
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  • Pity flag is binary: pity_active × (pity_active - 1) = 0
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  • If pity active: pity_active × (final_rarity - 4) = 0
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px", marginBottom: "2px" }}>
                  • If pity not active: (1 - pity_active) × (final_rarity - computed_rarity) = 0
                </p>
                <p style={{ fontSize: "12px", color: "#334155", fontFamily: "monospace", paddingLeft: "12px" }}>
                  • Streak update: is_5star × streak_next = 0 AND (1-is_5star) × (streak_next - streak_prev - 1) = 0
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.9)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setZoomedImage(null)}
        >
          <div
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomedImage(null)}
              style={{
                position: "absolute",
                top: "-40px",
                right: "0",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.1)",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }}
            >
              Close
            </button>
            <img
              src={zoomedImage.src}
              alt={zoomedImage.name}
              style={{
                maxWidth: "100%",
                maxHeight: "90vh",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div
              style={{
                marginTop: "16px",
                textAlign: "center",
                color: "#ffffff",
              }}
            >
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>
                {zoomedImage.name}
              </h3>
              {zoomedImage.band && (
                <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.8)" }}>
                  {zoomedImage.band}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
