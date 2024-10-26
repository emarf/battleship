import { WsSendCommands } from "../constants";
import { Game } from "../models/gameModel";
import { AddShipsClientResponseData, AttackClientResponseData, AttackServerResponseData, CreateGameServerResponseData, FinishGameServerResponseData, StartGameServerResponseData } from "../models/response";
import { Room } from "../models/roomModel";
import { gamesRepository } from "../repositories/gamesRepository";
import { usersRepository } from "../repositories/usersRepository";
import { getWsServerResponse } from "../utils";
import { generateShipsField, updateGameSettings } from "../utils/gameUtils";

export const gamesService = {
  createGame(room: Room) {
    try {
      const playerIds = room.roomUsers.map(user => user.index);
      const game = gamesRepository.createGame(playerIds);

      playerIds.forEach((playerId) => {
        const user = usersRepository.getUserByField('index', playerId);

        const responseData: CreateGameServerResponseData = {
          idGame: game.idGame,
          idPlayer: playerId,
        };

        const stringifyData = JSON.stringify(responseData);
        user.ws.send(getWsServerResponse(WsSendCommands.CREATE_GAME, stringifyData));
      });
    } catch (error) {
      console.error(error);
    }
  },

  startGame(game: Game) {
    try {
      game.playerIds.forEach((playerId) => {
        const user = usersRepository.getUserByField('index', playerId);
        const { ships } = game.playerIdToGameSettings[playerId];

        const responseData: StartGameServerResponseData = {
          ships,
          currentPlayerIndex: playerId
        };
        const stringifyData = JSON.stringify(responseData);
        user.ws.send(getWsServerResponse(WsSendCommands.START_GAME, stringifyData));
      });
    } catch (error) {
      console.error(error);
    }
  },

  addShips(data: string) {
    try {
      const { gameId, ships, indexPlayer: currentPlayerId }: AddShipsClientResponseData = JSON.parse(data);
      const game = gamesRepository.getGameById(gameId);

      const shipsField = generateShipsField(ships);
      const shipHits = ships.map(ship => ({ length: ship.length, hits: 0 }));
      const sunkShipCount = 0;

      const updatedPlayerIdToGameSettings = { ...game.playerIdToGameSettings, [currentPlayerId]: { shipsField, ships, shipHits, sunkShipCount } };
      const updatedGame = { ...game, playerIdToGameSettings: updatedPlayerIdToGameSettings };
      gamesRepository.update(updatedGame);

      if (Object.keys(updatedPlayerIdToGameSettings).length === 2) {
        gamesService.startGame(updatedGame);
        gamesService.sendTurn(game, currentPlayerId);
      }

    } catch (error) {
      console.error(error);
    }
  },

  sendTurn(game: Game, currentPlayer: string) {
    try {
      game.playerIds.forEach((playerId) => {
        const user = usersRepository.getUserByField('index', playerId);

        const responseData = { currentPlayer };
        const stringifyData = JSON.stringify(responseData);
        user.ws.send(getWsServerResponse(WsSendCommands.TURN, stringifyData));
      });
    } catch (error) {
      console.error(error);
    }
  },


  attack(data: string) {
    try {
      const { gameId, indexPlayer, x, y }: AttackClientResponseData = JSON.parse(data);
      const game = gamesRepository.getGameById(gameId);
      const enemyId = game.playerIds.find(playerId => playerId !== indexPlayer);

      if (!enemyId) {
        throw new Error('Enemy not found');
      }

      const gameSettings = game.playerIdToGameSettings[enemyId];
      const { updatedGameSettings, status } = updateGameSettings(gameSettings, x, y);

      const updatedPlayerIdToGameSettings = { ...game.playerIdToGameSettings, [enemyId]: updatedGameSettings };
      const updatedGame = { ...game, playerIdToGameSettings: updatedPlayerIdToGameSettings };
      gamesRepository.update(updatedGame);

      const response: AttackServerResponseData = {
        position: { x, y },
        currentPlayer: indexPlayer,
        status,
      };

      const stringifyData = JSON.stringify(response);

      game.playerIds.forEach((playerId) => {
        const user = usersRepository.getUserByField('index', playerId);
        user.ws.send(getWsServerResponse(WsSendCommands.ATTACK, stringifyData));
      });

      if (updatedGameSettings.sunkShipCount === updatedGameSettings.ships.length) {
        gamesService.finishGame(game, indexPlayer);
        return;
      }

      gamesService.sendTurn(game, status === 'miss' ? enemyId : indexPlayer);
    } catch (error) {
      console.error(error);
    }
  },

  finishGame(game: Game, winnerPlayerId: string) {
    try {
      game.playerIds.forEach((playerId) => {
        const user = usersRepository.getUserByField('index', playerId);
        const responseData: FinishGameServerResponseData = {
          winPlayer: winnerPlayerId
        };

        const stringifyData = JSON.stringify(responseData);
        user.ws.send(getWsServerResponse(WsSendCommands.FINISH, stringifyData));
      });
    } catch (error) {
      console.error(error);
    }
  }
};