import { WsSendCommands } from "../constants";
import { Room } from "../models/roomModel";
import { gamesRepository } from "../repositories/gamesRepository";
import { usersRepository } from "../repositories/usersRepository";
import { wsKeyToWsClient } from "../storage/websocketClients";
import { getWsSendPayload } from "../utils";

export const gameService = {
  createGame(room: Room) {
    try {
      const playerIds = room.roomUsers.map((user) => user.index);
      const game = gamesRepository.createGame(playerIds);
      console.log('players', playerIds);
      console.log('game', game.idGame);
      room.roomUsers.forEach(({ name }) => {
        const user = usersRepository.getUser(name);
        const ws = wsKeyToWsClient.get(user.wsKey);

        if (!ws) return;

        const payload = JSON.stringify({
          idGame: game.idGame,
          playerId: user.index,
        });

        ws.send(getWsSendPayload(WsSendCommands.CREATE_GAME, payload));
      });
    } catch (error) {
      console.error(error);
    }
  },

  addShips(wsKey: string, data: string) {
    console.log('wsKey', wsKey);
    console.log('data', JSON.parse(data));

  }
};