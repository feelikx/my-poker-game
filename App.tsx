
import React, { useState, useEffect, useCallback } from 'react';
import { Card, Player, GamePhase, GameState, Character } from './types';
import { createDeck, evaluateHand } from './utils/pokerLogic';
import { getPokerCommentary, generateAvatar } from './services/geminiService';
import CardComponent from './components/CardComponent';
import ControlPanel from './components/ControlPanel';
import HomePage from './components/HomePage';

const AI_NAMES = [
  'Slick Rick', 'Diamond Dave', 'Neon Viper', 'Old Joe', 
  'The Prodigy', 'Silent Sam', 'Ace High', 'The Count'
];

interface WinnerInfo {
  names: string[];
  handName: string;
  pot: number;
}

const App: React.FC = () => {
  const [session, setSession] = useState<{ email: string, character: Character } | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    communityCards: [],
    deck: createDeck(),
    pot: 0,
    currentBet: 0,
    dealerIndex: 0,
    activePlayerIndex: 0,
    phase: GamePhase.WAITING,
    commentary: "Welcome to the Palace. Ready to lose some chips?",
  });

  const [loadingCommentary, setLoadingCommentary] = useState(false);
  const [splashPot, setSplashPot] = useState(false);
  const [bettingPlayerId, setBettingPlayerId] = useState<string | null>(null);
  const [isGeneratingAvatars, setIsGeneratingAvatars] = useState(false);
  const [winnerPopup, setWinnerPopup] = useState<WinnerInfo | null>(null);
  const [lastRaiserIndex, setLastRaiserIndex] = useState<number>(-1);

  const initializeGame = async (userEmail: string, userChar: Character) => {
    setIsGeneratingAvatars(true);
    const initialPlayers: Player[] = [
      { 
        id: 'player', name: userChar.name, chips: 5000, cards: [], isFolded: false, isAI: false,
        handsPlayed: 0, handsWon: 0, biggestPotWon: 0,
        x: 0, y: 0, radius: 20, health: 100, maxHealth: 100, speed: 5, damage: 10, color: '#4f46e5', exp: 0, nextLevelExp: 100, level: 1, lastFired: 0, fireRate: 500
      },
      ...AI_NAMES.slice(0, 7).map((name, i) => ({
        id: `ai${i}`, name, chips: 5000, cards: [], isFolded: false, isAI: true,
        handsPlayed: 0, handsWon: 0, biggestPotWon: 0,
        x: 0, y: 0, radius: 20, health: 100, maxHealth: 100, speed: 5, damage: 10, color: '#4f46e5', exp: 0, nextLevelExp: 100, level: 1, lastFired: 0, fireRate: 500
      }))
    ];

    const updatedPlayers = await Promise.all(initialPlayers.map(async (p) => {
      const avatarUrl = await generateAvatar(p.name, p.isAI);
      return { ...p, avatarUrl };
    }));

    setGameState(prev => ({ ...prev, players: updatedPlayers }));
    setIsGeneratingAvatars(false);
  };

  const handleEnterGame = (character: Character, email: string) => {
    setSession({ character, email });
    initializeGame(email, character);
  };

  const updateCommentary = async (state: GameState) => {
    if (!session) return;
    const user = state.players.find(p => p.id === 'player');
    if (!user) return;

    setLoadingCommentary(true);
    const comm = await getPokerCommentary(user.cards, state.communityCards, state.phase, state.pot, user.chips);
    setGameState(prev => ({ ...prev, commentary: comm }));
    setLoadingCommentary(false);
  };

  const endHand = () => {
    const players = [...gameState.players];
    const activePlayers = players.filter(p => !p.isFolded);
    if (activePlayers.length === 0) return;

    const results = activePlayers.map(p => ({
        player: p,
        eval: evaluateHand([...gameState.communityCards, ...p.cards])
    }));
    const maxScore = Math.max(...results.map(r => r.eval.score));
    const winners = results.filter(r => r.eval.score === maxScore);
    const handName = winners[0].eval.name;
    const potShare = Math.floor(gameState.pot / winners.length);
    
    setWinnerPopup({
        names: winners.map(w => w.player.name),
        handName: handName,
        pot: gameState.pot
    });

    setGameState(prev => {
        const newPlayers = prev.players.map(p => {
            const isWinner = winners.some(w => w.player.id === p.id);
            if (isWinner) {
                p.chips += potShare;
                p.handsWon += 1;
                if (gameState.pot > p.biggestPotWon) p.biggestPotWon = gameState.pot;
            }
            p.handsPlayed += 1;
            return p;
        });
        return { ...prev, players: newPlayers, phase: GamePhase.SHOWDOWN };
    });
  };

  const startNewHand = () => {
    if (gameState.players.length === 0) return;
    setWinnerPopup(null);
    const newDeck = createDeck();
    const playerCount = gameState.players.length;
    const updatedPlayers = gameState.players.map((p, i) => ({
      ...p,
      cards: [newDeck[i * 2], newDeck[i * 2 + 1]],
      isFolded: false,
      lastAction: undefined,
    }));

    const nextState: GameState = {
      ...gameState,
      deck: newDeck.slice(playerCount * 2),
      players: updatedPlayers,
      communityCards: [],
      pot: 0,
      currentBet: 0,
      phase: GamePhase.PRE_FLOP,
      activePlayerIndex: 0,
    };
    setLastRaiserIndex(-1);
    setGameState(nextState);
    updateCommentary(nextState);
  };

  const proceedPhase = () => {
    if (gameState.phase === GamePhase.RIVER) {
        endHand();
        return;
    }
    setGameState(prev => {
      let nextPhase = prev.phase;
      let newCommunity = [...prev.communityCards];
      let newDeck = [...prev.deck];
      if (prev.phase === GamePhase.PRE_FLOP) {
        nextPhase = GamePhase.FLOP;
        newCommunity = [newDeck[0], newDeck[1], newDeck[2]];
        newDeck = newDeck.slice(3);
      } else if (prev.phase === GamePhase.FLOP) {
        nextPhase = GamePhase.TURN;
        newCommunity.push(newDeck[0]);
        newDeck = newDeck.slice(1);
      } else if (prev.phase === GamePhase.TURN) {
        nextPhase = GamePhase.RIVER;
        newCommunity.push(newDeck[0]);
        newDeck = newDeck.slice(1);
      }
      setLastRaiserIndex(-1);
      const newState = { ...prev, phase: nextPhase, communityCards: newCommunity, deck: newDeck, currentBet: 0, activePlayerIndex: 0 };
      updateCommentary(newState);
      return newState;
    });
  };

  const handleAction = (action: string, amount: number = 0) => {
    const activePlayer = gameState.players[gameState.activePlayerIndex];
    if (!activePlayer) return;

    if (action === 'raise' || action === 'call' || action === 'bet') {
      setBettingPlayerId(activePlayer.id);
      setTimeout(() => {
        setBettingPlayerId(null);
        setSplashPot(true);
        setTimeout(() => setSplashPot(false), 500);
      }, 600);
    }

    setGameState(prev => {
      const players = [...prev.players];
      const player = players[prev.activePlayerIndex];
      if (!player) return prev;

      let newCurrentBet = prev.currentBet;
      let newLastRaiser = lastRaiserIndex;
      
      if (action === 'fold') player.isFolded = true;
      if (action === 'call') {
        const callAmount = prev.currentBet;
        player.chips -= callAmount;
        prev.pot += callAmount;
      }
      if (action === 'raise' || action === 'bet') {
        player.chips -= amount;
        prev.pot += amount;
        newCurrentBet = amount;
        newLastRaiser = prev.activePlayerIndex;
        setLastRaiserIndex(prev.activePlayerIndex);
      }
      player.lastAction = action.toUpperCase();

      const activePlayers = players.filter(p => !p.isFolded);
      if (activePlayers.length === 1) {
          const survivor = activePlayers[0];
          survivor.chips += prev.pot;
          survivor.handsWon += 1;
          if (prev.pot > survivor.biggestPotWon) survivor.biggestPotWon = prev.pot;
          players.forEach(p => p.handsPlayed += 1);
          setWinnerPopup({ names: [survivor.name], handName: "Winner by Surrender", pot: prev.pot });
          return { ...prev, players, phase: GamePhase.SHOWDOWN, currentBet: 0 };
      }
      
      let nextIndex = (prev.activePlayerIndex + 1) % players.length;
      while((players[nextIndex].isFolded || (players[nextIndex].chips <= 0 && players[nextIndex].id !== 'player')) && players.some(p => !p.isFolded)) {
          nextIndex = (nextIndex + 1) % players.length;
      }

      const isRoundOver = (newLastRaiser === -1 && nextIndex === 0) || (newLastRaiser !== -1 && nextIndex === newLastRaiser);
      if (isRoundOver) {
          setTimeout(() => proceedPhase(), 1000);
          return { ...prev, players, activePlayerIndex: nextIndex, currentBet: newCurrentBet };
      }
      if (players[nextIndex].isAI) {
          setTimeout(() => simulateAIMove(nextIndex, newCurrentBet), 1500);
      }
      return { ...prev, players, activePlayerIndex: nextIndex, currentBet: newCurrentBet };
    });
  };

  const simulateAIMove = (index: number, currentBet: number) => {
    setGameState(current => {
      const p = current.players[index];
      if (!p || p.isFolded || current.phase === GamePhase.SHOWDOWN) return current;
      if (currentBet > 0) {
          if (Math.random() > 0.85) handleAction('fold');
          else handleAction('call');
      } else {
          if (Math.random() > 0.75) handleAction('bet', 200);
          else handleAction('call');
      }
      return current;
    });
  };

  if (!session) return <HomePage onEnterGame={handleEnterGame} />;

  const userPlayer = gameState.players.find(p => p.id === 'player');
  const boardEval = evaluateHand([...gameState.communityCards, ...(userPlayer?.cards || [])]);

  const renderPlayerAtPos = (index: number, posClass: string) => {
    const p = gameState.players[index];
    if (!p) return null;
    const isActive = gameState.activePlayerIndex === index;
    const isUser = p.id === 'player';
    const winRate = p.handsPlayed > 0 ? Math.round((p.handsWon / p.handsPlayed) * 100) : 0;

    return (
      <div key={p.id} className={`absolute ${posClass} flex flex-col items-center gap-1 transition-all duration-500 z-[100] group ${p.isFolded ? 'opacity-30' : 'opacity-100'}`}>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-40 bg-black/95 backdrop-blur-md border border-amber-500/30 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-[300] pointer-events-none shadow-2xl scale-90 group-hover:scale-100 origin-bottom">
           <div className="text-[9px] text-amber-500 font-bold uppercase tracking-widest mb-2 border-b border-white/10 pb-1">Stats: {p.name}</div>
           <div className="flex justify-between mb-1 text-[8px] text-white/40">Hands <span className="text-white font-mono">{p.handsPlayed}</span></div>
           <div className="flex justify-between mb-1 text-[8px] text-white/40">Win % <span className="text-cyan-400 font-mono">{winRate}%</span></div>
           <div className="flex justify-between text-[8px] text-white/40">Best Pot <span className="text-green-400 font-mono">${p.biggestPotWon}</span></div>
        </div>

        {bettingPlayerId === p.id && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 bg-amber-400 rounded-full border-2 border-amber-600 animate-chip-toss flex items-center justify-center text-black font-bold text-[6px]">CHIP</div>
          </div>
        )}
        
        <div className={`w-14 h-14 bg-slate-800 rounded-xl border-2 transition-all ${isActive ? 'border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110' : 'border-slate-700'} overflow-hidden relative shadow-lg`}>
          {p.avatarUrl ? <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-lg font-cinzel text-slate-500 animate-pulse">{p.name[0]}</div>}
          {p.lastAction && <div className="absolute inset-x-0 bottom-0 py-0.5 bg-amber-600/95 text-[6px] font-bold text-white text-center uppercase">{p.lastAction}</div>}
        </div>
        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[50px]">{p.name}</div>
        <div className="text-[9px] text-amber-500 font-mono font-bold">${p.chips.toLocaleString()}</div>
        
        <div className={`flex -space-x-4 transition-all duration-700 ${p.isFolded ? 'opacity-0 scale-50' : 'opacity-100'}`}>
           {p.cards.map((c, i) => <div key={i} className="scale-[0.5] origin-top"><CardComponent card={c} hidden={!isUser && gameState.phase !== GamePhase.SHOWDOWN} /></div>)}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-screen h-screen flex flex-col items-center justify-center poker-felt overflow-hidden">
      
      {winnerPopup && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-pop">
           <div className="relative w-[360px] bg-black/90 border-4 border-amber-500/50 p-8 rounded-[3rem] shadow-[0_0_100px_rgba(251,191,36,0.4)] text-center flex flex-col items-center gap-6">
                <span className="text-amber-500 text-xs font-cinzel tracking-[0.5em] uppercase font-bold">Round Victor</span>
                <div className="w-24 h-24 rounded-2xl border-2 border-amber-500/50 flex items-center justify-center text-3xl text-amber-500 font-cinzel bg-slate-900">W</div>
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-cinzel text-white font-bold leading-tight uppercase">{winnerPopup.names.join(' & ')}</h2>
                    <span className="text-cyan-400 font-mono text-[10px] uppercase font-bold tracking-widest">{winnerPopup.handName}</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-white/30 text-[8px] uppercase font-bold tracking-[0.3em]">Total Winnings</span>
                    <span className="text-3xl font-cinzel text-amber-500 font-bold">${winnerPopup.pot.toLocaleString()}</span>
                </div>
                <button onClick={startNewHand} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-2xl transition-all font-cinzel text-md">Collect & Reset</button>
           </div>
        </div>
      )}

      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-[200]">
        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-2.5 rounded-2xl flex items-center gap-3 shadow-2xl">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center text-black font-bold text-lg shadow-[0_0_10px_rgba(251,191,36,0.3)]"><span className="font-cinzel">A</span></div>
          <div className="flex flex-col flex-grow min-w-0">
            <span className="text-amber-500 text-[7px] font-bold uppercase tracking-widest">Moderator</span>
            <p className="text-slate-100 text-[10px] italic font-medium truncate">{loadingCommentary ? "..." : `"${gameState.commentary}"`}</p>
          </div>
        </div>
      </div>

      <div className="relative w-full h-full flex items-center justify-center">
        {/* BOTTOM SIDE: Pairs moved significantly closer to the table border */}
        {renderPlayerAtPos(0, "bottom-16 left-[38%] -translate-x-1/2 scale-110")}
        {renderPlayerAtPos(7, "bottom-16 right-[38%] translate-x-1/2")}

        {/* TOP SIDE: Pairs moved significantly closer to the table border */}
        {renderPlayerAtPos(3, "top-28 left-[38%] -translate-x-1/2")}
        {renderPlayerAtPos(4, "top-28 right-[38%] translate-x-1/2")}

        {/* LEFT SIDE: Pairs moved inward toward the table edge */}
        {renderPlayerAtPos(1, "left-[22%] top-[65%] -translate-y-1/2")}
        {renderPlayerAtPos(2, "left-[22%] top-[35%] -translate-y-1/2")}

        {/* RIGHT SIDE: Pairs moved inward toward the table edge */}
        {renderPlayerAtPos(5, "right-[22%] top-[35%] -translate-y-1/2")}
        {renderPlayerAtPos(6, "right-[22%] top-[65%] -translate-y-1/2")}

        {/* LARGER VERTICAL TABLE */}
        <div className={`relative w-[520px] h-[72vh] bg-black/50 border-[6px] border-slate-900/80 rounded-[120px] shadow-[inset_0_0_120px_rgba(0,0,0,0.9),0_20px_80px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center transition-all duration-500 ${splashPot ? 'scale-[1.02]' : ''}`}>
             <div className="flex flex-col items-center gap-6 py-8">
                <div className="text-center mb-2">
                  <span className="text-[8px] text-white/20 uppercase font-bold tracking-[0.5em] block mb-1">Active Pot</span>
                  <span className={`text-5xl font-cinzel font-bold text-amber-500 tabular-nums transition-all ${splashPot ? 'scale-110 text-amber-400' : ''}`}>
                    ${gameState.pot.toLocaleString()}
                  </span>
                </div>

                <div className={`flex flex-col items-center gap-3 p-6 bg-black/20 rounded-[3rem] border border-white/5 transition-all ${splashPot ? 'animate-splash' : ''}`}>
                    <div className="flex gap-2">
                        {gameState.communityCards.slice(0, 3).map((card, i) => (
                          <div key={i} className="animate-deal scale-[0.75]">
                            <CardComponent card={card} />
                          </div>
                        ))}
                    </div>
                    {gameState.communityCards.length > 3 && (
                        <div className="flex gap-2 -mt-4">
                            {gameState.communityCards.slice(3, 5).map((card, i) => (
                                <div key={i + 3} className="animate-deal scale-[0.75]">
                                    <CardComponent card={card} />
                                </div>
                            ))}
                        </div>
                    )}
                    {gameState.communityCards.length === 0 && (
                        <div className="h-[80px] flex items-center justify-center opacity-10 font-cinzel text-xs uppercase tracking-[0.8em] animate-pulse">Waiting for Dealer</div>
                    )}
                </div>

                <div className="w-56 flex flex-col items-center gap-1.5 mt-4">
                   <div className="flex justify-between w-full px-1">
                      <span className="text-[8px] text-amber-500/80 font-bold uppercase">{boardEval.name}</span>
                      <span className="text-[8px] text-white/40 font-mono">{boardEval.score}%</span>
                   </div>
                   <div className="w-full h-2 bg-black/60 rounded-full border border-white/5 relative overflow-hidden">
                      <div className="h-full transition-all duration-1000" style={{ width: `${boardEval.score}%`, background: `linear-gradient(to right, #10b981, #f59e0b)` }} />
                   </div>
                </div>
             </div>
        </div>
      </div>

      {gameState.phase === GamePhase.WAITING ? (
        <div className="absolute bottom-12 left-12 z-[300] animate-pop">
          <button 
            disabled={isGeneratingAvatars}
            onClick={startNewHand} 
            className={`px-10 py-4 ${isGeneratingAvatars ? 'bg-slate-700 cursor-wait' : 'bg-amber-500 hover:bg-amber-400'} text-black font-bold rounded-2xl transition-all shadow-xl font-cinzel text-md tracking-wider`}
          >
            {isGeneratingAvatars ? 'Preparing...' : 'Start Hand'}
          </button>
        </div>
      ) : (
        <ControlPanel gameState={gameState} onAction={handleAction} onNext={gameState.phase === GamePhase.SHOWDOWN ? startNewHand : undefined} />
      )}
    </div>
  );
};

export default App;
