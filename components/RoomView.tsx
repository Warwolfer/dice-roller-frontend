
import React, { useState, useEffect } from 'react';
import { Room, Dice, Roll } from '../types';
import DiceSelector from './DiceSelector';
import RollHistory from './RollHistory';
import Button from './Button';
import { DICE_OPTIONS } from '../constants';

interface RoomViewProps {
  room: Room;
  userName: string;
  onRoll: (roomId: string, diceType: Dice, userName: string, comment?: string) => Promise<Roll | null>;
  onLeaveRoom: () => void;
  isSubmittingRoll: boolean;
}

const RoomView: React.FC<RoomViewProps> = ({ room, userName, onRoll, onLeaveRoom, isSubmittingRoll }) => {
  const [selectedDice, setSelectedDice] = useState<Dice>(DICE_OPTIONS[0].value);
  const [rollComment, setRollComment] = useState('');
  const [isAnimatingRoll, setIsAnimatingRoll] = useState(false);
  const [animatedRollResult, setAnimatedRollResult] = useState<number | null>(null);


  const handleRoll = async () => {
    setIsAnimatingRoll(true);
    setAnimatedRollResult(null); 
    
    const rollAnimationDuration = 700; // ms
    let interimRolls = 0;
    const animationInterval = setInterval(() => {
      setAnimatedRollResult(Math.floor(Math.random() * selectedDice) + 1);
      interimRolls++;
      if (interimRolls >= 5) clearInterval(animationInterval); 
    }, rollAnimationDuration / 6);

    try {
      // Pass the comment to the onRoll handler
      const newRoll = await onRoll(room.id, selectedDice, userName, rollComment);
      clearInterval(animationInterval);
      if (newRoll) {
        setAnimatedRollResult(newRoll.result);
        setRollComment(''); // Clear comment input on successful roll
      } else {
        setAnimatedRollResult(prev => prev); 
      }
    } catch (error) {
      console.error("Error during roll execution in RoomView:", error);
      clearInterval(animationInterval);
      setAnimatedRollResult(null); 
    } finally {
      setTimeout(() => {
        setIsAnimatingRoll(false);
      }, 500); 
    }
  };
  
  useEffect(() => {
    setAnimatedRollResult(null);
  }, [room.id, selectedDice]);


  const isLoading = isSubmittingRoll || isAnimatingRoll;
  const buttonText = () => {
    if (isAnimatingRoll) return 'Rolling...';
    if (isSubmittingRoll) return 'Submitting...';
    return `Roll ${DICE_OPTIONS.find(d => d.value === selectedDice)?.label || ''}`;
  }

  return (
    <div className="p-6 bg-slate-800 rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-sky-400">{room.name}</h2>
        <Button onClick={onLeaveRoom} variant="secondary" size="sm" disabled={isLoading}>
          Leave Room
        </Button>
      </div>
      
      <div className="mb-6 p-4 bg-slate-700/50 rounded-md">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-grow w-full sm:w-auto">
            <DiceSelector selectedDice={selectedDice} onChange={setSelectedDice} disabled={isLoading} />
            <div className="mt-3">
              <label htmlFor="rollComment" className="block text-xs font-medium text-slate-400 mb-1">
                Comment (optional):
              </label>
              <input
                id="rollComment"
                type="text"
                value={rollComment}
                onChange={(e) => setRollComment(e.target.value)}
                placeholder="E.g., Attacking the goblin"
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 text-sm"
                disabled={isLoading}
                aria-label="Roll comment"
              />
            </div>
          </div>
          <Button 
            onClick={handleRoll} 
            disabled={isLoading || !userName} 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto sm:self-end mt-3 sm:mt-0" // Adjust button alignment
            aria-live="polite"
          >
            {buttonText()}
          </Button>
        </div>
        {animatedRollResult !== null && (
          <div className={`mt-4 text-center p-3 bg-slate-600 rounded-md ${isAnimatingRoll ? '' : 'animate-pulse'}`}>
            <span className="text-slate-300">You rolled: </span>
            <span className="text-3xl font-bold text-amber-400">{animatedRollResult}</span>
          </div>
        )}
      </div>

      <RollHistory rolls={room.rolls} />
    </div>
  );
};

export default RoomView;