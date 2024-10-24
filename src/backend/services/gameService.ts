import { User } from "../models/userModal";
import { gamesRepository } from "../repositories/gamesRepository";

export const gameService = {
  createGame(ws: WebSocket, wsKey: string, users: User[]) {
    gamesRepository.createGame(users);
    // const game = gamesRepository.getGame();
  }
}