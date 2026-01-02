
import React, { useState } from 'react';
import { GameStatus, GameTheme, Player } from '../types';

interface UIOverlayProps {
  status: GameStatus;
  setStatus: (s: GameStatus) => void;
  theme: GameTheme | null;
  onStart: (input: string) => void;
  player: Player;
  score: number;
  timer: number;
  onUpgrade: (type: string) => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ status, theme, onStart, player, score, timer, onUpgrade }) => {
  const [input, setInput] = useState('');

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (status === GameStatus.START) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 p-8 z-50">
        <h1 className="text-6xl font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-4 animate-pulse">
          STELLAR FORGE
        </h1>
        <p className="text-slate-400 mb-8 max-w-md text-center">
          Every run is dynamic. Describe your adventure theme below and let Gemini forge your universe.
        </p>
        <div className="flex flex-col w-full max-w-md gap-4">
          <input 
            type="text"
            className="w-full bg-slate-900 border border-slate-700 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
            placeholder="e.g. Cyberpunk Neon City, Underwater Abyss..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            onClick={() => onStart(input || 'Space Adventure')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            FORGE WORLD
          </button>
        </div>
      </div>
    );
  }

  if (status === GameStatus.LOADING) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 z-50">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="font-orbitron text-xl text-indigo-400 animate-pulse">Consulting the Cosmic Mind...</p>
        <p className="text-slate-500 mt-2">Gemini is building your world.</p>
      </div>
    );
  }

  if (status === GameStatus.PLAYING) {
    return (
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
             <div className="px-3 py-1 bg-indigo-600 rounded-full text-xs font-bold font-orbitron">LV {player.level}</div>
             <span className="text-sm font-semibold text-slate-300">{theme?.playerTitle}</span>
          </div>
          <div className="w-48 h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
             <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${(player.health / player.maxHealth) * 100}%` }}></div>
          </div>
          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-400 transition-all duration-300" style={{ width: `${(player.exp / player.nextLevelExp) * 100}%` }}></div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="text-2xl font-orbitron font-bold text-white">{score}</div>
          <div className="text-slate-400 font-mono">{formatTime(timer)}</div>
        </div>
      </div>
    );
  }

  if (status === GameStatus.LEVEL_UP) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm z-50">
        <h2 className="text-4xl font-orbitron font-bold text-indigo-400 mb-8">POWER REFINED</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full px-4">
          {theme?.upgrades.map((u, i) => (
            <button 
              key={u.id + i}
              onClick={() => onUpgrade(u.type)}
              className="group bg-slate-900 border-2 border-slate-800 p-6 rounded-xl hover:border-indigo-500 transition-all text-left flex flex-col gap-2"
            >
              <div className="text-indigo-400 font-orbitron text-lg group-hover:text-indigo-300">{u.name}</div>
              <div className="text-slate-400 text-sm leading-relaxed">{u.description}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (status === GameStatus.GAME_OVER) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-50">
        <h2 className="text-6xl font-orbitron font-bold text-rose-500 mb-4">LOST TO THE VOID</h2>
        <div className="text-3xl font-orbitron mb-8">{score} POINTS</div>
        <div className="text-slate-400 mb-12">Survived for {formatTime(timer)}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-12 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold transition-all shadow-lg"
        >
          FORGE AGAIN
        </button>
      </div>
    );
  }

  return null;
};

export default UIOverlay;
