
import { Dice, Rank } from './types';

export interface DiceOption {
  label: string;
  value: Dice;
}

export const DICE_OPTIONS: DiceOption[] = [
  { label: '1d4', value: Dice.D4 },
  { label: '1d6', value: Dice.D6 },
  { label: '1d8', value: Dice.D8 },
  { label: '1d10', value: Dice.D10 },
  { label: '1d12', value: Dice.D12 },
  { label: '1d20', value: Dice.D20 },
  { label: '1d100', value: Dice.D100 },
];

export interface RankOption {
  label: string;
  value: Rank;
  bonus: number;
}

export const RANK_OPTIONS: RankOption[] = [
  { label: 'E', value: Rank.E, bonus: 0 },
  { label: 'D', value: Rank.D, bonus: 10 },
  { label: 'C', value: Rank.C, bonus: 20 },
  { label: 'B', value: Rank.B, bonus: 30 },
  { label: 'A', value: Rank.A, bonus: 40 },
  { label: 'S', value: Rank.S, bonus: 50 },
];

// Read API_BASE_URL from Vite environment variable with a fallback
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
