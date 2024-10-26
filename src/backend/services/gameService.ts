import { WsSendCommands } from "../constants";
import { Game } from "../models/gameModel";
import { AddShipsClientResponseData, AttackClientResponseData, AttackServerResponseData, CreateGameServerResponseData, FinishGameServerResponseData, StartGameServerResponseData } from "../models/response";
import { Room } from "../models/roomModel";
import { Ship } from "../models/shipModel";
import { gamesRepository } from "../repositories/gamesRepository";
import { usersRepository } from "../repositories/usersRepository";
import { wsKeyToWsClient } from "../storage/websocketClients";
import { generateShipsField, getShipIndex, getWsServerResponse, markKilledShip } from "../utils";

const playerHits: Record<string, { [key: string]: number; }> = {};

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
      const { gameId, ships, indexPlayer: currentPlayerId }: AddShipsClientResponseData = JSON.parse(data);
      const game = gamesRepository.getGameById(gameId);

      const shipsField = generateShipsField(ships);
      const shipHits = ships.map(ship => ({ length: ship.length, hits: 0 }));

      const updatedPlayerIdToGameSettings = { ...game.playerIdToGameSettings, [currentPlayerId]: { shipsField, ships, shipHits, sunkShipCount: 0 } };
      const updatedGame = { ...game, playerIdToGameSettings: updatedPlayerIdToGameSettings };
      gamesRepository.update(updatedGame);

      if (Object.keys(updatedPlayerIdToGameSettings).length === 2) {
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

      const { ships } = game.playerIdToGameSettings?.[playerId];

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



  attack(wsKey: string, data: string) {
    const { gameId, indexPlayer, x, y }: AttackClientResponseData = JSON.parse(data);

    const game = gamesRepository.getGameById(gameId);
    const enemyId = game.playerIds.find(playerId => playerId !== indexPlayer);

    if (!enemyId) {
      throw new Error('Enemy not found');
    }

    let { ships, shipsField, shipHits, sunkShipCount } = game.playerIdToGameSettings?.[enemyId];

    if (!shipsField) {
      throw new Error('No ships field');
    }

    let status = 'miss' as any;

    if (shipsField[y][x] === 1) {
      shipsField[y][x] = 2;
      status = 'hit';

      let hitShipIndex = getShipIndex(ships, x, y);

      if (hitShipIndex !== -1) {
        shipHits[hitShipIndex].hits += 1;
        if (shipHits[hitShipIndex].hits === shipHits[hitShipIndex].length) {
          sunkShipCount += 1;
          markKilledShip(ships[hitShipIndex], shipsField);
          status = 'kill';
        }
      }
    }

    console.log('status', status);
    console.table(shipsField);
    console.log('sunkShipCount', sunkShipCount);
    const updatedPlayerIdToGameSettings = { ...game.playerIdToGameSettings, [enemyId]: { shipsField, ships, shipHits, sunkShipCount } };
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
      const ws = wsKeyToWsClient.get(user.wsKey);

      if (!ws) return;

      ws.send(getWsServerResponse(WsSendCommands.ATTACK, stringifyData));
    });

    if (sunkShipCount === ships.length) {
      gameService.finishGame(game, indexPlayer);
      return;
    }

    gameService.sendTurn(game, status === 'miss' ? enemyId : indexPlayer);
  },

  sendTurn(game: Game, currentPlayer: string) {
    console.log('currentPlayer', currentPlayer);
    game.playerIds.forEach((playerId) => {
      const user = usersRepository.getUserByField('index', playerId);
      const ws = wsKeyToWsClient.get(user.wsKey);

      if (!ws) return;

      const responseData = { currentPlayer };
      const stringifyData = JSON.stringify(responseData);
      ws.send(getWsServerResponse(WsSendCommands.TURN, stringifyData));
    });
  },

  finishGame(game: Game, winnerPlayerId: string) {
    game.playerIds.forEach((playerId) => {
      const user = usersRepository.getUserByField('index', playerId);
      const ws = wsKeyToWsClient.get(user.wsKey);

      if (!ws) return;

      const responseData: FinishGameServerResponseData = {
        winPlayer: winnerPlayerId
      };
      const stringifyData = JSON.stringify(responseData);
      ws.send(getWsServerResponse(WsSendCommands.FINISH, stringifyData));
    });
  }
};