import { randomUUID } from "node:crypto";
import { Game } from "../models/gameModel";

const games = new Map<string, Game>();

export const gamesRepository = {
  createGame: (playerIds: string[]): Game => {
    const uuid = randomUUID();

    const game = {
      idGame: uuid
    }

    games.set(uuid, game);

    return game;
  }
}