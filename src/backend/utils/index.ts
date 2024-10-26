import { WebSocket } from "ws";
import { wsServer } from "..";
import { WsSendCommands } from "../constants";
import { Ship } from "../models/shipModel";

export const getWsServerResponse = (type: WsSendCommands, data: string) => {
  const payload = JSON.stringify({
    type,
    data,
    id: 0
  });
  return payload;
};

export const broadcastToAllClients = (type: WsSendCommands, data: string) => {
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(getWsServerResponse(type, data));
    }
  });
};




export const generateShipsField = (ships: Ship[]): number[][] => {
  const shipsField = new Array(10).fill(0).map(() => new Array(10).fill(0));

  ships.forEach(ship => {
    const { position, length, direction } = ship;
    let { x, y } = position;

    for (let i = 0; i < length; i++) {
      if (x >= 0 && x < 10 && y >= 0 && y < 10) {
        shipsField[y][x] = 1;
      }

      if (direction) {
        y += 1;
      } else {
        x += 1;
      }
    }
  });

  return shipsField;
};

export const getShipIndex = (ships: Ship[], x: number, y: number) => {
  return ships.findIndex((ship) => {
    let { position, direction, length } = ship;
    let { x: startX, y: startY } = position;

    for (let i = 0; i < length; i++) {
      if (startX === x && startY === y) {
        return true;
      }
      if (direction) {
        startY += 1;
      } else {
        startX += 1;
      }
    }
    return false;
  });
};

export const markKilledShip = (ship: Ship, field: number[][]) => {
  const { position, direction, length } = ship;
  let { x, y } = position;

  for (let i = 0; i < length; i++) {
    field[y][x] = 3;

    // // Обозначить клетки вокруг корабля как MISS
    // for (let dx = -1; dx <= 1; dx++) {
    //   for (let dy = -1; dy <= 1; dy++) {
    //     let nx = x + dx;
    //     let ny = y + dy;
    //     if (nx >= 0 && nx < FIELD_SIZE && ny >= 0 && ny < FIELD_SIZE && field[ny][nx] === EMPTY) {
    //       field[ny][nx] = MISS;
    //     }
    //   }
    // }

    if (direction) {
      y++;
    } else {
      x++;
    }
  }
};