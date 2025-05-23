import React from 'react';
import { Dice } from '../types';
import { DICE_OPTIONS } from '../constants';

interface DiceSelectorProps {
  selectedDice: Dice;
  onChange: (dice: Dice) => void;
  disabled?: boolean;
}

const DiceSelector: React.FC<DiceSelectorProps> = ({ selectedDice, onChange, disabled }) => {
  return (
    <div className="flex items-center space-x-2">
      <label htmlFor="dice-type" className="text-slate-300 font-medium">
        Select Dice:
      </label>
      <select
        id="dice-type"
        value={selectedDice}
        onChange={(e) => onChange(parseInt(e.target.value) as Dice)}
        disabled={disabled}
        className="p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 disabled:opacity-50"
      >
        {DICE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DiceSelector;