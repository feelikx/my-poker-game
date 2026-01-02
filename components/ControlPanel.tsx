
import React, { useState, useEffect } from 'react';
import { GameState, GamePhase } from '../types';

interface ControlPanelProps {
  gameState: GameState;
  onAction: (action: string, amount?: number) => void;
  onNext?: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ gameState, onAction, onNext }) => {
  const user = gameState.players.find(p => p.id === 'player');
  const isBettingRound = gameState.currentBet === 0;
  const isUserTurn = gameState.activePlayerIndex === 0;
  
  const minBet = isBettingRound ? 100 : gameState.currentBet + 100;
  const [amountInput, setAmountInput] = useState<string>(Math.min(minBet, user?.chips || 0).toString());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
        const recommended = Math.min(isBettingRound ? 100 : gameState.currentBet + 100, user.chips);
        setAmountInput(recommended.toString());
        setError(null);
    }
  }, [gameState.phase, gameState.currentBet, user?.chips]);

  const handleAmountChange = (val: string) => {
    if (!user) return;
    const num = parseInt(val);
    setAmountInput(val);
    
    if (isNaN(num)) {
      setError("Invalid Amount");
    } else if (num > user.chips) {
      setError("Max reached");
    } else if (num < gameState.currentBet) {
      setError(`Match: $${gameState.currentBet}`);
    } else {
      setError(null);
    }
  };

  const submitAction = (action: string) => {
    if (!isUserTurn || !user) return;
    const num = parseInt(amountInput);
    if (action === 'raise' || action === 'bet') {
      if (isNaN(num) || num <= 0 || num > user.chips) return;
      onAction('raise', num);
    } else {
      onAction(action);
    }
  };

  if (onNext || !user) return null;

  return (
    <div className={`absolute bottom-8 left-8 w-72 pointer-events-none z-[300] transition-opacity duration-300 ${!isUserTurn ? 'opacity-50' : 'opacity-100'}`}>
      <div className="bg-black/85 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] flex flex-col gap-6 shadow-2xl pointer-events-auto ring-1 ring-white/10 relative overflow-hidden">
        
        {!isUserTurn && (
            <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center z-10">
                <div className="text-amber-500 font-cinzel text-xs font-bold animate-pulse uppercase tracking-[0.2em]">Waiting for Move...</div>
            </div>
        )}

        <div className="flex flex-col gap-4 border-b border-white/5 pb-4">
            <div className="flex flex-col">
                <span className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5">Your Stack</span>
                <span className="text-2xl font-cinzel text-amber-500 font-bold tabular-nums">${user.chips.toLocaleString()}</span>
            </div>

            <div className="flex flex-col">
                <span className="text-white/30 text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5">Stake Requirement</span>
                <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-cinzel font-bold tabular-nums ${gameState.currentBet > 0 ? 'text-rose-500 animate-pulse' : 'text-white/90'}`}>
                        ${gameState.currentBet.toLocaleString()}
                    </span>
                    {gameState.currentBet > 0 && <span className="text-[8px] text-rose-500/60 uppercase font-bold font-mono">Unmatched Raise</span>}
                </div>
            </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/50 font-mono">$</span>
            <input 
              type="number" 
              value={amountInput}
              onChange={(e) => handleAmountChange(e.target.value)}
              className={`w-full bg-white/5 border-2 ${error ? 'border-rose-500/50' : 'border-white/5 group-hover:border-amber-500/30'} p-3 pl-8 rounded-xl text-lg font-mono text-white focus:outline-none focus:border-amber-500 transition-all`}
              placeholder="0"
            />
            {error && (
              <span className="absolute -top-5 left-0 text-rose-500 text-[9px] font-bold uppercase tracking-tight">
                {error}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button 
                onClick={() => submitAction('fold')}
                className="py-4 bg-white/5 hover:bg-rose-900/20 text-white/60 font-bold rounded-xl border border-white/5 transition-all uppercase text-[10px] tracking-widest"
            >
                Fold Hand
            </button>
            <button 
                onClick={() => submitAction('call')}
                className={`py-4 font-bold rounded-xl border transition-all uppercase text-[10px] tracking-widest ${
                    gameState.currentBet > 0 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-white/5 border-white/5 text-white/80'
                }`}
            >
                {gameState.currentBet > 0 ? 'Accept Raise' : 'Check'}
            </button>
          </div>
          
          <button 
            onClick={() => submitAction(isBettingRound ? 'bet' : 'raise')}
            disabled={!!error || !amountInput || !isUserTurn}
            className={`w-full py-4 font-bold rounded-xl transition-all uppercase text-[11px] tracking-[0.2em] shadow-xl ${
              error || !amountInput 
              ? 'bg-white/5 text-white/20 cursor-not-allowed border border-white/5' 
              : 'bg-amber-500 hover:bg-amber-400 text-black active:scale-95 shadow-amber-500/10'
            }`}
          >
            {isBettingRound ? 'Open Stake' : 'Increase Raise'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
