
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
  timestamp: Date;
  comment?: string; // Optional comment for the roll
}

export interface Room {
  id: string;
  name: string;
  rolls: Roll[];
}