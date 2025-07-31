
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
  avatarUrl?: string; // User's avatar URL
}

export interface Mastery {
  Mastery: string;
  Rank: Rank;
}

export interface Equipment {
  Weapon?: Rank;
  'Heavy Armor'?: Rank;
  'Medium Armor'?: Rank;
  'Light Armor'?: Rank;
  Armor?: Rank;
}

export interface TerraRPData {
  username: string;
  user_id: number;
  avatar_urls: {
    o: string;
    h: string;
    l: string;
    m: string;
    s: string;
  };
  banner_urls?: {
    l: string;
    m: string;
  };
  Race: string;
  equipment: Equipment[];
  masteries: Mastery[];
  racial_traits: string[];
  custom_title?: string;
  main_account?: {
    name: string;
    url: string;
  };
}

export interface RoomParticipant {
  id: string;
  name: string;
  terraRP?: {
    user_id: number;
    username: string;
    race: string;
    avatar_url: string;
    weapon_rank: Rank | null;
    armor_rank: Rank | null; // For display only, not used for mastery rank defaults
    armor_type: string | null; // Type of armor (Heavy Armor, Medium Armor, etc.)
    masteries: Mastery[];
    custom_title?: string;
  };
  joinedAt: Date;
  lastActivity: Date;
}

export interface Room {
  id: string;
  name: string;
  rolls: Roll[];
  participants: RoomParticipant[];
  created_at: Date;
  updated_at: Date;
  creator_name?: string;
  creator_terrarp_id?: number;
  room_code?: string;
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