import { WsSendCommands } from "../constants";
import { AttackStatus, Game } from "../models/gameModel";
import { AddShipsClientResponseData, AttackClientResponseData, AttackServerResponseData, CreateGameServerResponseData, FinishGameServerResponseData, RandomAttackClientResponseData, StartGameServerResponseData } from "../models/response";
import { Room } from "../models/roomModel";
import { gamesRepository } from "../repositories/gamesRepository";
import { usersRepository } from "../repositories/usersRepository";
import { getWsServerResponse } from "../utils";
import { generateShipsField, getFirstEmptyCoordinate, updateGameSettings } from "../utils/gameUtils";
import { winnersService } from "./winnersService";

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
      const updatedGame = { ...game, playerIdToGameSettings: updatedPlayerIdToGameSettings, currentPlayerId };
      gamesRepository.update(updatedGame);

      if (Object.keys(updatedPlayerIdToGameSettings).length === 2) {
        gamesService.startGame(updatedGame);
        gamesService.sendTurn(game, currentPlayerId);
      }

    } catch (error) {
      console.error(error);
    }
  },

  randomAttack: (data: string) => {
    const { gameId, indexPlayer }: RandomAttackClientResponseData = JSON.parse(data);

    const game = gamesRepository.getGameById(gameId);
    const enemyId = game.playerIds.find(playerId => playerId !== indexPlayer);

    if (!enemyId) {
      throw new Error('Enemy not found');
    }

    const { shipsField } = game.playerIdToGameSettings[enemyId];

    console.table(shipsField);
    const coordinates = getFirstEmptyCoordinate(shipsField);
    console.log('coordinates', coordinates);

    if (!coordinates) {
      gamesService.finishGame(game, indexPlayer);
      return;
    }

    const stringifyData = JSON.stringify({
      gameId,
      indexPlayer,
      x: coordinates.x,
      y: coordinates.y
    });

    gamesService.attack(stringifyData);
  },

  attack(data: string) {
    try {
      const { gameId, indexPlayer, x, y }: AttackClientResponseData = JSON.parse(data);
      const game = gamesRepository.getGameById(gameId);

      if (game.currentPlayerId !== indexPlayer) {
        console.error('Not your turn');
        return;
      }

      const enemyId = game.playerIds.find(playerId => playerId !== indexPlayer);

      if (!enemyId) {
        throw new Error('Enemy not found');
      }

      const gameSettings = game.playerIdToGameSettings[enemyId];
      const { updatedGameSettings, status, killedCoordinates, missedCoordinatesAroundKilled, isProhibitedShot } = updateGameSettings(gameSettings, x, y);
      const nextPlayerId = isProhibitedShot ? indexPlayer : status === 'miss' ? enemyId : indexPlayer;

      const updatedPlayerIdToGameSettings = { ...game.playerIdToGameSettings, [enemyId]: updatedGameSettings };
      const updatedGame: Game = { ...game, playerIdToGameSettings: updatedPlayerIdToGameSettings, currentPlayerId: nextPlayerId };
      gamesRepository.update(updatedGame);

      if (status === 'killed' && killedCoordinates && missedCoordinatesAroundKilled) {
        gamesService.sendKilledCoordinates(game, indexPlayer, killedCoordinates);
        gamesService.sendMissedCoordinatesAroundKilled(game, indexPlayer, missedCoordinatesAroundKilled);
      } else {
        gamesService.sendCoordinates(game, { x, y }, indexPlayer, status);
      }

      if (updatedGameSettings.sunkShipCount === updatedGameSettings.ships.length) {
        gamesService.finishGame(game, indexPlayer);
        return;
      }

      gamesService.sendTurn(game, nextPlayerId);
    } catch (error) {
      console.error(error);
    }
  },

  sendTurn(game: Game, currentPlayer: string) {
    try {
      const responseData = { currentPlayer };
      const stringifyData = JSON.stringify(responseData);

      game.playerIds.forEach((playerId) => {
        const user = usersRepository.getUserByField('index', playerId);
        user.ws.send(getWsServerResponse(WsSendCommands.TURN, stringifyData));
      });

    } catch (error) {
      console.error(error);
    }
  },

  finishGame(game: Game, winPlayer: string) {
    try {
      const responseData: FinishGameServerResponseData = { winPlayer };
      const stringifyData = JSON.stringify(responseData);

      const winner = usersRepository.getUserByField('index', winPlayer);
      winner.wins += 1;
      usersRepository.update(winner);

      game.playerIds.forEach((playerId) => {
        const user = usersRepository.getUserByField('index', playerId);
        user.ws.send(getWsServerResponse(WsSendCommands.FINISH, stringifyData));
      });

      winnersService.updateWinners();
    } catch (error) {
      console.error(error);
    }
  },


  sendKilledCoordinates(game: Game, indexPlayer: string, killedCoordinates: { x: number; y: number; }[]) {
    killedCoordinates.forEach((coord) => {
      const response: AttackServerResponseData = {
        position: { x: coord.x, y: coord.y },
        currentPlayer: indexPlayer,
        status: 'killed',
      };

      const stringifyData = JSON.stringify(response);

      game.playerIds.forEach((playerId) => {
        const user = usersRepository.getUserByField('index', playerId);
        user.ws.send(getWsServerResponse(WsSendCommands.ATTACK, stringifyData));
      });
    });
  },

  sendMissedCoordinatesAroundKilled(game: Game, indexPlayer: string, missedCoordinatesAroundKilled: { x: number; y: number; }[]) {
    missedCoordinatesAroundKilled.forEach((coord) => {
      const response: AttackServerResponseData = {
        position: { x: coord.x, y: coord.y },
        currentPlayer: indexPlayer,
        status: 'miss',
      };

      const stringifyData = JSON.stringify(response);

      game.playerIds.forEach((playerId) => {
        const user = usersRepository.getUserByField('index', playerId);
        user.ws.send(getWsServerResponse(WsSendCommands.ATTACK, stringifyData));
      });
    });
  },

  sendCoordinates(game: Game, position: { x: number; y: number; }, currentPlayer: string, status: AttackStatus) {
    const response: AttackServerResponseData = {
      position,
      currentPlayer,
      status,
    };

    const stringifyData = JSON.stringify(response);

    game.playerIds.forEach((playerId) => {
      const user = usersRepository.getUserByField('index', playerId);
      user.ws.send(getWsServerResponse(WsSendCommands.ATTACK, stringifyData));
    });
  }
};