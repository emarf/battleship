import { randomUUID } from "node:crypto";
import { Game } from "../models/gameModel";

const games = new Map<string, Game>();

export const gamesRepository = {
  createGame: (playerIds: string[]): Game => {
    const uuid = randomUUID();

    const game = {
      idGame: uuid,
      playerIds,
      playerIdToGameSettings: {}
    };

    games.set(uuid, game);

    return game;
  },

  getGameById: (gameId: string): Game => {
    const game = games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    return game;
  },

  update: (updatedGame: Game) => {
    const game = games.get(updatedGame.idGame);
    if (!game) {
      throw new Error('Game not found');
    }

    games.set(updatedGame.idGame, updatedGame);
  }

};