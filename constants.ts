
import { Dice } from './types';

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

// Read API_BASE_URL from environment variable with a fallback
// Ensure process and process.env are checked to avoid errors in environments where they might not exist.
const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL;
  }
  return 'http://localhost:3001/api'; // Default fallback
};

export const API_BASE_URL = getApiBaseUrl();
