import { Ship } from "./shipModel";


type GameSettings = {
  playerIds: string[],

}
export type Game = {
  idGame: string,
  playerIds: string[];
  playerIdToShips?: Record<string, Ship[]>;
};