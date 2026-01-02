
import { Card, Suit, Rank } from '../types';

export const createDeck = (): Card[] => {
  const suits: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: Rank[] = ['2' , '3' , '4' , '5' , '6' , '7' , '8' , '9' , '10' , 'J' , 'Q' , 'K' , 'A'];
  const deck: Card[] = [];
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ suit, rank });
    }
  }
  return shuffle(deck);
};

export const shuffle = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

export interface HandEvaluation {
  name: string;
  score: number; // 1-100
}

export const evaluateHand = (cards: Card[]): HandEvaluation => {
  if (cards.length === 0) return { name: "N/A", score: 0 };
  
  const rankCounts: Record<string, number> = {};
  const suitCounts: Record<string, number> = {};
  cards.forEach(c => {
    rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
  });

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const maxSuitCount = Math.max(...Object.values(suitCounts));
  const isFlush = maxSuitCount >= 5;

  // Rarity Scoring (Abstracted logic for game feel)
  if (isFlush) {
     if (rankCounts['A'] && rankCounts['K'] && rankCounts['Q'] && rankCounts['J'] && rankCounts['10']) {
        return { name: "Royal Flush", score: 100 };
     }
     return { name: "Flush", score: 85 };
  }

  if (counts[0] === 4) return { name: "Four of a Kind", score: 95 };
  if (counts[0] === 3 && counts[1] === 2) return { name: "Full House", score: 90 };
  if (counts[0] === 3) return { name: "Three of a Kind", score: 55 };
  if (counts[0] === 2 && counts[1] === 2) return { name: "Two Pair", score: 40 };
  if (counts[0] === 2) return { name: "One Pair", score: 25 };
  
  return { name: "High Card", score: 10 };
};

export const getHandStrengthName = (cards: Card[]): string => {
  return evaluateHand(cards).name;
};
