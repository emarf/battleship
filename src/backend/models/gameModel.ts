import { Ship } from "./shipModel";


type GameSettings = {
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
};