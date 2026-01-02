
import React from 'react';
import { Card } from '../types';

interface CardProps {
  card: Card;
  hidden?: boolean;
}

const CardComponent: React.FC<CardProps> = ({ card, hidden }) => {
  const isRed = card?.suit === 'hearts' || card?.suit === 'diamonds';
  const getSuitSymbol = (suit: string) => {
    switch(suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  if (hidden) {
    return (
      <div className="w-16 h-24 bg-slate-900 border-2 border-slate-700 rounded-lg card-shadow flex items-center justify-center card-container overflow-hidden">
        <div className="w-full h-full border-2 border-amber-500/20 rounded-lg flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 relative">
           <div className="text-amber-500/10 text-2xl font-cinzel select-none">?</div>
           <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '8px 8px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-container group">
      <div className="w-20 h-28 bg-white border border-slate-200 rounded-xl card-shadow flex flex-col p-2 transition-all duration-500 card-hover group-hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] cursor-default animate-reveal">
        <div className={`text-lg font-bold leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {card.rank}
          <div className="text-xs mt-0.5">{getSuitSymbol(card.suit)}</div>
        </div>
        <div className={`text-3xl flex-1 flex items-center justify-center select-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {getSuitSymbol(card.suit)}
        </div>
        <div className={`text-lg font-bold self-end rotate-180 leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
          {card.rank}
          <div className="text-xs mt-0.5">{getSuitSymbol(card.suit)}</div>
        </div>
      </div>
    </div>
  );
};

export default CardComponent;
