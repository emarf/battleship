import { Ship } from "./shipModel";

export type RegClientResponseData = {
  name: string;
  password: string;
};

export type RegServerResponseData = {
  name: string;
  index: string;
  error: boolean;
  errorText: string;
};

export type AddUserToRoomClientResponseData = {
  indexRoom: string;
};

export type CreateGameServerResponseData = {
  idGame: string;
  idPlayer: string;
};

export type AddShipsClientResponseData = {
  gameId: string;
  ships: Ship[];
  indexPlayer: string;
};

export type StartGameServerResponseData = {
  ships: Ship[];
  currentPlayerIndex: string;
};

export type AttackClientResponseData = {
  gameId: string;
  x: number;
  y: number;
  indexPlayer: string;
};

export type AttackServerResponseData = {
  position: {
    x: number;
    y: number;
  };
  currentPlayer: string;
  status: 'miss' | 'killed' | 'shot';
};

export type FinishGameServerResponseData = {
  winPlayer: string;
}