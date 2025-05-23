
import React from 'react';
import { Roll } from '../types';
import { DICE_OPTIONS } from '../constants';

interface RollHistoryProps {
  rolls: Roll[];
}

const RollHistory: React.FC<RollHistoryProps> = ({ rolls }) => {
  if (rolls.length === 0) {
    return <p className="text-slate-400 text-center py-4">No rolls in this room yet. Be the first!</p>;
  }

  const getDiceLabel = (diceValue: number) => {
    const option = DICE_OPTIONS.find(opt => opt.value === diceValue);
    return option ? option.label : `D${diceValue}`;
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-sky-400 mb-2">Roll History</h3>
      <ul className="space-y-3 max-h-96 overflow-y-auto p-3 bg-slate-700/50 rounded-md thin-scrollbar" aria-live="polite">
        {rolls.map((roll) => ( 
          <li key={roll.id} className="p-3 bg-slate-800 rounded-md shadow text-sm">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sky-300">{roll.userName}</span>
              <span className="text-xs text-slate-400">
                {new Date(roll.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(roll.timestamp).toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 text-slate-200">
              Rolled a <span className="font-bold text-lg text-amber-400">{roll.result}</span> on a {getDiceLabel(roll.diceType)}
            </p>
            {roll.comment && (
              <p className="mt-1 text-xs text-slate-400 italic">
                Comment: {roll.comment}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RollHistory;