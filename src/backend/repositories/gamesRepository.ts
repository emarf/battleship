import { User } from "../models/userModal";

const games = new Map();

export const gamesRepository = {
  getGame: (isGame: number) => {
    const game = games.get(isGame);
    if (!game) {
      throw new Error('Game not found');
    }

    return game;
  },
  createGame: (users: User[]) => {
    const game = {
      idGame: Date.now(),
      playerIds: [users.map(user => user.index)],
    }

    games.set(game.idGame, game);
  }
}