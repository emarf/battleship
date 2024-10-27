import { AttackStatus } from "./gameModel";
import { Ship } from "./shipModel";

export type RegServerResponseData = {
  name: string;
  index: string;
  error: boolean;
  errorText: string;
};

export type CreateGameServerResponseData = {
  idGame: string;
  idPlayer: string;
};

export type StartGameServerResponseData = {
  ships: Ship[];
  currentPlayerIndex: string;
};

export type AttackServerResponseData = {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: string;
  status: AttackStatus;
};

export type FinishGameServerResponseData = {
  winPlayer: string;
};