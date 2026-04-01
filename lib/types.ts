export type PlayerStatus = 'PLAYING' | 'RETIRED';
export type ShirtSize = 'L' | 'XL' | 'XLL';
export type MatchOutcome = 'WIN' | 'LOSE' | 'DRAW';
export type TransactionType = 'IN' | 'OUT';

export interface Player {
  id: number;
  imageUrl?: string;
  fullName: string;
  shirtNumber?: number;
  shirtSize?: ShirtSize;
  nickname?: string;
  isManager?: boolean;
  balance?: number;
  status?: PlayerStatus;
}

export interface GoalDetail {
  id?: number;
  playerScoredName?: string;
  playerAssistedName?: string;
}

export interface MatchRecord {
  id: number;
  date: string;
  time?: string;
  matchResult?: string;
  matchOutcome?: MatchOutcome;
  goalDetails?: GoalDetail[];
  mvpPlayerName?: string;
  season?: string;
  playerIds?: number[];
  matchFee?: number;
}

export interface Transaction {
  id: number;
  transactionType: TransactionType;
  amount: number;
  date: string;
  sourcePlayerId?: number;
  description?: string;
}

export interface SeasonSummary {
  id: number;
  season: string;
  playerName: string;
  goalScored: number;
  goalAssisted: number;
  numberOfMvp: number;
}

export interface CreateTransactionRequest {
  transactionType: TransactionType;
  amount: number;
  sourcePlayerId?: number;
  description?: string;
}
