import { WsSendCommands } from "../constants";
import { Game } from "../models/gameModel";
import { AddShipsClientResponseData, CreateGameServerResponseData, StartGameServerResponseData } from "../models/response";
import { Room } from "../models/roomModel";
import { gamesRepository } from "../repositories/gamesRepository";
import { usersRepository } from "../repositories/usersRepository";
import { wsKeyToWsClient } from "../storage/websocketClients";
import { getWsServerResponse } from "../utils";

export const gameService = {
  createGame(room: Room) {
    try {
      const playerIds = room.roomUsers.map(user => user.index);
      const game = gamesRepository.createGame(playerIds);

      playerIds.forEach((playerId) => {
        const user = usersRepository.getUserByField('index', playerId);
        const ws = wsKeyToWsClient.get(user.wsKey);

        if (!ws) return;

        const responseData: CreateGameServerResponseData = {
          idGame: game.idGame,
          idPlayer: playerId,
        };
        const stringifyData = JSON.stringify(responseData);
        ws.send(getWsServerResponse(WsSendCommands.CREATE_GAME, stringifyData));
      });
    } catch (error) {
      console.error(error);
    }
  },

  addShips(wsKey: string, data: string) {
    try {
      console.log('wsKey', wsKey);
      console.log('data', JSON.parse(data));
      const { gameId, ships, indexPlayer }: AddShipsClientResponseData = JSON.parse(data);
      const game = gamesRepository.getGameById(gameId);
      const hasUser = game.playerIds.some(playerId => playerId === indexPlayer);

      if (!hasUser) {
        throw new Error('User not found');
      }

      const updatedPlayerIdToShips = { ...game.playerIdToShips, [indexPlayer]: ships };
      const updatedGame = { ...game, playerIdToShips: updatedPlayerIdToShips };
      gamesRepository.update(updatedGame);

      if (Object.keys(updatedPlayerIdToShips).length === 2) {
        const currentPlayerId = indexPlayer;

        console.log('updatedGame', updatedGame);
        console.log('start game');
        gameService.startGame(updatedGame);
        gameService.sendTurn(game, currentPlayerId);
      }

    } catch (error) {
      console.error(error);
    }
  },

  startGame(game: Game) {
    game.playerIds.forEach((playerId) => {
      const user = usersRepository.getUserByField('index', playerId);
      const ws = wsKeyToWsClient.get(user.wsKey);

      if (!ws) return;

      const ships = game.playerIdToShips?.[playerId];

      if (!ships) {
        throw new Error('No ships');
      }

      const responseData: StartGameServerResponseData = {
        ships,
        currentPlayerIndex: playerId
      };
      const stringifyData = JSON.stringify(responseData);
      ws.send(getWsServerResponse(WsSendCommands.START_GAME, stringifyData));
    });
  },

  sendTurn(game: Game, currentPlayer: string) {
    game.playerIds.forEach((playerId) => {
      const user = usersRepository.getUserByField('index', playerId);
      const ws = wsKeyToWsClient.get(user.wsKey);

      if (!ws) return;

      const responseData = { currentPlayer };
      const stringifyData = JSON.stringify(responseData);
      ws.send(getWsServerResponse(WsSendCommands.TURN, stringifyData));
    });
  }
};