import { Action } from './types'

export const ACTIONS: Action[] = [
  // Basic Actions
  { category: 'Basic', name: 'Attack', type: 'Roll', subtype: 'Damage', description: 'Basic attack roll', rollFormula: '1d100 + MR + WR + other bonuses' },
  { category: 'Basic', name: 'Recover', type: 'Roll', subtype: 'Heal', description: 'Recover your HP by 1d20 with advantage and gain the same amount to any roll next cycle.\nAdded as of 6/21/25', rollFormula: '1d20 with advantage' },

  // Defense Actions
  { category: 'Defense', name: 'Protect', type: 'Roll', subtype: 'Damage', description: 'You may now protect yourself, but it only applies to the damage dealt by the enemy you attack. If AoE or Torment AoE is used, protect works against the most damaging attack among your targets.', rollFormula: '1d100 + MR + WR + other bonuses' },
  { category: 'Defense', name: 'Ultra Protect', type: 'Roll', subtype: 'Damage', description: 'Protect 3 allies within range and gain Vulnerability. Cannot protect self.', rollFormula: '1d100 + MR + WR + other bonuses' },
  { category: 'Defense', name: 'Counter', type: 'Roll', subtype: 'Damage', description: 'Distribute 10 (D), 15 (C), 20 (B), 25 (A), 30 (S) mitigation between up to 3 targets in multiples of 5s.', rollFormula: '1d100 + MR + WR + other bonuses' },
  { category: 'Defense', name: 'Ultra Counter', type: 'Roll', subtype: 'Damage', description: 'Gain Vulnerability. If you are adjacent to or on the space as your attack target, gain +30.\nIf successful, +30 (D), +40 (B), +50 (S) extra damage and negate Vulnerability. Max: +80.\nSucceed on: 30+', rollFormula: '1d100 + [30*] + [x] + MR + WR + other bonuses' },
  
  // Offense Actions
  { category: 'Offense', name: 'Stable Attack', type: 'Roll', subtype: 'Damage', description: 'Note: Upped the base slightly.', rollFormula: '7d20 + (1d20 per MR) + WR + other bonuses, EXP on 17-20 (20% explosion)' },
  { category: 'Offense', name: 'Special Burst Attack', type: 'Roll', subtype: 'Damage', description: '(B) Upgrade. Base 12d20 → 13d20\n(S) Upgrade. Base 13d20 → 14d20\nNote: As of 8:35 AM MST, this has changed. Dropped the passive and instead increased explosion chance.', rollFormula: '12d20 + (1d20 per MR) + WR + other bonuses, EXP on 16-20 (25% explosion)' },
  { category: 'Offense', name: 'Sneak Attack', type: 'Roll', subtype: 'Damage', description: 'If successful, +20 (D) +25 (C) +30 (B) +35 (A) +40 (S) extra damage, otherwise +10.\nSucceed on: 30+', rollFormula: '1d100 + [*] + MR + WR + other bonuses' },
  { category: 'Offense', name: 'Special Critical Attack', type: 'Roll', subtype: 'Damage', description: 'Passive: Multiply your total damage by 1.2\nIf 85+ multiply your total damage by 1.5 D, 1.6 C, 1.7 B, 1.8 A, 2 S.\nIf 100. multiply your total damage by 3.', rollFormula: '2d100 + (MR) + (WR) + other bonuses' },
  { category: 'Offense', name: 'Sharp Attack', type: 'Roll', subtype: 'Damage', description: 'Free Action. Convert other bonuses into more dice that may trigger crits. +1d100 for each 40 you spend. Leftovers are added as mod.', rollFormula: '2d100kh1 + MR + WR + other bonuses' },
  { category: 'Offense', name: 'Special Reckless Attack', type: 'Roll', subtype: 'Damage', description: 'Free Action. Convert other bonuses into more dice that may trigger crits. +1d100 for each 40 you spend. Leftovers are added as mod.', rollFormula: 'E, D, C: 1d200 + 1d100 + MR + WR + other bonuses\nB, A, S: 1d200 + 1d100 + 1d100 + MR + WR + other bonuses' },
  
  // Support Actions
  { category: 'Support', name: 'Heal', type: 'Roll', subtype: 'Heal', description: 'Explosion: 17-20 grants you another d20 (20% explosion)\nCleanse: 1 curable condition', rollFormula: '2d20 + MR + WR + other bonuses then divide by 3 if AoE' },
  { category: 'Support', name: 'Power Heal', type: 'Roll', subtype: 'Heal', description: 'Explosion: 15-20 grants you another d20 (30% explosion)\nCleanse 2 curable conditions (D) 3 (B) 4 (S) after healing. +5 HP per unused cleanse charge.\nNote: Reduced base roll, but giving it a 30% chance for explosion.', rollFormula: '4d20 + MR + WR + other bonuses then divide by 3 if AoE' },
  { category: 'Support', name: 'Buff', type: 'Roll', subtype: 'Bonus', description: 'Three stacks on one target or one stack on three targets. Unapplied stacks are lost.', rollFormula: '1d100 + MR + WR + other bonuses then divide by 3' },
  { category: 'Support', name: 'Power Buff', type: 'Roll', subtype: 'Bonus', description: 'Three stacks on one target or one stack on three targets. Unapplied stacks are lost.', rollFormula: '2d100 + MR + WR + other bonuses then divide by 3' },
]

export const ACTION_CATEGORIES = ['Basic', 'Defense', 'Offense', 'Support'] as const