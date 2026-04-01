import {
  Player,
  MatchRecord,
  Transaction,
  SeasonSummary,
  CreateTransactionRequest,
} from './types';

const BASE_URL = 'https://pff-management-production.up.railway.app';

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Players
export const getPlayers = () => fetchJSON<Player[]>('/players');
export const createPlayer = (player: Partial<Player>) =>
  fetchJSON<Player>('/players', { method: 'POST', body: JSON.stringify(player) });
export const updatePlayer = (id: number, patch: Partial<Player>) =>
  fetchJSON<Player>(`/players/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });

// Match Records
export const getMatchRecords = () => fetchJSON<MatchRecord[]>('/match-records');
export const getMatchRecord = (id: number) => fetchJSON<MatchRecord>(`/match-records/${id}`);
export const createMatchRecord = (record: Partial<MatchRecord>) =>
  fetchJSON<MatchRecord>('/match-records', { method: 'POST', body: JSON.stringify(record) });
export const deleteMatchRecord = (id: number) =>
  fetchJSON<void>(`/match-records/${id}`, { method: 'DELETE' });

// Finance
export const getBalance = () => fetchJSON<number>('/finance/balance');
export const getPlayerTransactions = (playerId: number) =>
  fetchJSON<Transaction[]>(`/finance/transactions/player/${playerId}`);
export const createTransaction = (req: CreateTransactionRequest) =>
  fetchJSON<Transaction>('/finance/transactions', { method: 'POST', body: JSON.stringify(req) });

// Season Summaries
export const getSeasonSummaries = () => fetchJSON<SeasonSummary[]>('/season-summaries');
export const getSeasonSummary = (season: string) =>
  fetchJSON<SeasonSummary[]>(`/season-summaries/${season}`);
