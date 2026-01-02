
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  defaultAvatarUrl?: string;
}

export interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  chips: number;
  cards: Card[];
  isFolded: boolean;
  isAI: boolean;
  lastAction?: string;
  // Stats
  handsPlayed: number;
  handsWon: number;
  biggestPotWon: number;
  // Space game properties (kept for compatibility)
  x: number;
  y: number;
  radius: number;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  color: string;
  exp: number;
  nextLevelExp: number;
  level: number;
  lastFired: number;
  fireRate: number;
}

export interface Enemy {
  id: string;
  x: number;
  y: number;
  radius: number;
  health: number;
  maxHealth: number;
  color: string;
  type: string;
  speed: number;
  damage: number;
  score: number;
}

export interface Projectile {
  x: number;
  y: number;
  dx: number;
  dy: number;
  damage: number;
  color: string;
}

export interface ExperienceGem {
  x: number;
  y: number;
  value: number;
  color: string;
}

export interface Upgrade {
  id: string;
  type: string;
  name: string;
  description: string;
}

export interface EnemyType {
  name: string;
  healthMult: number;
  speedMult: number;
  color: string;
}

export interface GameTheme {
  enemyTypes: EnemyType[];
  playerTitle: string;
  upgrades: Upgrade[];
}

export enum GamePhase {
  WAITING = 'WAITING',
  PRE_FLOP = 'PRE_FLOP',
  FLOP = 'FLOP',
  TURN = 'TURN',
  RIVER = 'RIVER',
  SHOWDOWN = 'SHOWDOWN'
}

export interface GameState {
  players: Player[];
  communityCards: Card[];
  deck: Card[];
  pot: number;
  currentBet: number;
  dealerIndex: number;
  activePlayerIndex: number;
  phase: GamePhase;
  commentary: string;
}

export enum GameStatus {
  START = 'START',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  LEVEL_UP = 'LEVEL_UP',
  GAME_OVER = 'GAME_OVER'
}
