import { Ship } from "./shipModel";

export type RegClientResponseData = {
  name: string;
  password: string;
};

export type AddUserToRoomClientResponseData = {
  indexRoom: string;
};

export type AddShipsClientResponseData = {
  gameId: string;
  ships: Ship[];
  indexPlayer: string;
};

export type AttackClientResponseData = {
  gameId: string;
  x: number;
  y: number;
  indexPlayer: string;
};

export type RandomAttackClientResponseData = {
  gameId: string;
  indexPlayer: string;
};