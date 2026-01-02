
import React, { useState } from 'react';
import { Character } from '../types';

const CHARACTERS: Character[] = [
  { id: 'shark', name: 'The Shark', title: 'Aggressive Pro', description: 'Never bluffs. Or always bluffs? You will never know.' },
  { id: 'lady', name: 'Lady Luck', title: 'Mysterious Heiress', description: 'The cards seem to whisper their secrets to her.' },
  { id: 'count', name: 'The Count', title: 'Old Guard', description: 'Formal, polite, and absolutely lethal with a stack.' },
  { id: 'viper', name: 'Neon Viper', title: 'Cyberpunk Hustler', description: 'Calculates odds faster than a quantum computer.' },
  { id: 'joe', name: 'Old Joe', title: 'Road Veteran', description: 'Seen every trick in the book twice. Patient as a stone.' },
  { id: 'prodigy', name: 'The Prodigy', title: 'Math Genius', description: 'Sees the game in pure mathematical fractals.' },
  { id: 'diva', name: 'Diamond Diva', title: 'High Roller', description: 'Raised in casinos. The felt is her natural habitat.' },
  { id: 'sam', name: 'Silent Sam', title: 'The Enigma', description: 'Hasn\'t spoken a word in three years of play.' },
  { id: 'ace', name: 'Ace High', title: 'Classic Gambler', description: 'Living for the big reveal and the bigger risk.' },
  { id: 'strat', name: 'The Cold Eye', title: 'Risk Analyst', description: 'Emotions are for losers. Strategy is for winners.' },
];

interface HomePageProps {
  onEnterGame: (character: Character, email: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onEnterGame }) => {
  const [email, setEmail] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);

  const selectedChar = CHARACTERS.find(c => c.id === selectedId);

  const handleEnter = () => {
    if (selectedChar && email) {
      onEnterGame(selectedChar, email);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#050505] overflow-y-auto font-inter">
      {/* Background Decor */}
      <div className="absolute inset-0 poker-felt opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col items-center">
        <header className="text-center mb-16 animate-pop">
          <h1 className="text-7xl font-cinzel font-bold text-white tracking-tighter mb-4 drop-shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            PALACE <span className="text-amber-500">POKER</span>
          </h1>
          <p className="text-amber-500/60 font-cinzel tracking-[0.4em] uppercase text-sm">The Ultimate AI Texas Hold'em</p>
        </header>

        {isLoginView ? (
          <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] shadow-2xl animate-pop">
            <h2 className="text-2xl font-cinzel text-white font-bold mb-8 text-center">Member Access</h2>
            <div className="flex flex-col gap-6">
              <button className="flex items-center justify-center gap-3 w-full py-4 bg-white hover:bg-slate-100 text-black font-bold rounded-2xl transition-all shadow-xl">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-white/10"></div>
                <span className="text-white/20 text-xs uppercase font-bold">or email</span>
                <div className="flex-1 h-px bg-white/10"></div>
              </div>

              <input 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 p-4 rounded-2xl text-white focus:outline-none focus:border-amber-500 transition-all text-center"
              />

              <button 
                onClick={() => email && setIsLoginView(false)}
                disabled={!email}
                className="w-full py-5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-white/20 text-black font-bold rounded-2xl transition-all shadow-xl shadow-amber-500/10 uppercase tracking-widest"
              >
                Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center animate-pop">
            <div className="flex justify-between items-center w-full mb-10">
                <button onClick={() => setIsLoginView(true)} className="text-white/40 hover:text-white transition-colors flex items-center gap-2 font-bold uppercase text-xs tracking-widest">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                   Back
                </button>
                <h2 className="text-2xl font-cinzel text-white font-bold text-center">Select Your Persona</h2>
                <div className="w-16"></div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 w-full">
              {CHARACTERS.map((char) => (
                <button 
                  key={char.id}
                  onClick={() => setSelectedId(char.id)}
                  className={`group relative flex flex-col items-center p-6 rounded-3xl transition-all duration-500 border-2 ${
                    selectedId === char.id 
                    ? 'bg-amber-500/10 border-amber-500 scale-105 shadow-[0_0_30px_rgba(245,158,11,0.2)]' 
                    : 'bg-white/5 border-transparent hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className={`w-20 h-20 rounded-2xl mb-4 overflow-hidden shadow-2xl transition-transform duration-500 ${selectedId === char.id ? 'rotate-3 scale-110' : 'group-hover:scale-105'}`}>
                     <div className="w-full h-full bg-slate-800 flex items-center justify-center text-2xl text-amber-500 font-cinzel">
                        {char.name[0]}
                     </div>
                  </div>
                  <span className={`text-sm font-bold transition-colors ${selectedId === char.id ? 'text-amber-500' : 'text-white/80'}`}>{char.name}</span>
                  <span className="text-[10px] text-white/40 uppercase font-bold tracking-tighter mt-1">{char.title}</span>
                </button>
              ))}
            </div>

            <div className="mt-16 w-full max-w-2xl bg-black/60 backdrop-blur-md border border-white/5 p-8 rounded-[2rem] flex items-center justify-between shadow-2xl">
              <div className="flex flex-col gap-1 flex-1 pr-10">
                <h3 className="text-xl font-cinzel text-amber-500 font-bold">{selectedChar?.name || 'Choose a Character'}</h3>
                <p className="text-sm text-white/60 italic">"{selectedChar?.description || 'Pick a legend to begin your journey at the palace.'}"</p>
              </div>
              <button 
                onClick={handleEnter}
                disabled={!selectedId}
                className="px-12 py-5 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-800 disabled:text-white/20 text-black font-bold rounded-2xl transition-all shadow-xl shadow-amber-500/20 uppercase tracking-[0.2em] font-cinzel text-lg whitespace-nowrap"
              >
                Enter Palace
              </button>
            </div>
          </div>
        )}

        <footer className="mt-20 text-white/20 text-[10px] font-bold uppercase tracking-[0.5em] text-center">
          Experience the pinnacle of AI Poker
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
