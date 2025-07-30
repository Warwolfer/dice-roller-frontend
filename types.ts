
export enum Dice {
  D4 = 4,
  D6 = 6,
  D8 = 8,
  D10 = 10,
  D12 = 12,
  D20 = 20,
  D100 = 100,
}

export interface Roll {
  id: string;
  userName: string;
  diceType: Dice; // Stores the enum value, e.g., Dice.D20
  result: number;
  rawDiceResult?: number; // Raw dice total before bonuses/modifiers
  timestamp: Date;
  comment?: string; // Optional comment for the roll
}

export interface Room {
  id: string;
  name: string;
  rolls: Roll[];
}

export enum Rank {
  E = 'E',
  D = 'D',
  C = 'C',
  B = 'B',
  A = 'A',
  S = 'S'
}

export interface Action {
  category: string;
  name: string;
  type: 'Roll' | 'Action' | 'Passive';
  subtype: 'Damage' | 'Heal' | 'Bonus' | 'Mitigation' | '';
  description: string;
  rollFormula: string;
}

export interface DiceGroup {
  type: string;
  rolls: number[];
  sum: number;
  keepHighest?: number;
  keepLowest?: number;
}

export interface BonusBreakdown {
  type: string;
  rank?: string;
  value: number;
  display: string;
}

export interface ModifierBreakdown {
  type: string;
  description: string;
  value: number;
  multiplier: number;
  explosionRolls?: number[];
}

export interface RollDetails {
  diceGroups: DiceGroup[];
  bonusBreakdown: BonusBreakdown[];
  modifierBreakdown: ModifierBreakdown[];
  explosionRolls: number[];
  rawDiceTotal: number;
  baseTotal: number;
  finalResult: number;
  breakdown: string;
}

export interface ActionRoll extends Omit<Roll, 'diceType'> {
  actionName: string;
  weaponRank: Rank;
  masteryRank: Rank;
  rollFormula: string;
  rollDetails?: RollDetails;
}