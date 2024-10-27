import { Ship } from "./shipModel";

export type GameSettings = {
  shipsField: number[][];
  ships: Ship[];
  shipHits: {
    length: number;
    hits: number;
  }[];
  sunkShipCount: number;
};

export type Game = {
  idGame: string,
  playerIds: string[];
  playerIdToGameSettings: Record<string, GameSettings>;
  currentPlayerId?: string;
};

export type AttackStatus = 'shot' | 'killed' | 'miss';