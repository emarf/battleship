import { AttackStatus, GameSettings } from "../models/gameModel";
import { Ship } from "../models/shipModel";

enum CellStatus {
  EMPTY = 0,
  SHIP = 1
}

export enum ShotStatus {
  MISS = 1,
  SHOT = 2,
  KILL = 3,
}

export const generateShipsField = (ships: Ship[]): number[][] => {
  const shipsField = new Array(10).fill(CellStatus.EMPTY).map(() => new Array(10).fill(CellStatus.EMPTY));

  ships.forEach(ship => {
    const { position, length, direction } = ship;
    let { x, y } = position;

    for (let i = 0; i < length; i += 1) {
      if (x >= 0 && x < 10 && y >= 0 && y < 10) {
        shipsField[y][x] = CellStatus.SHIP;
      }

      direction ? y += 1 : x += 1;
    }
  });

  return shipsField;
};

export const updateGameSettings = (gameSettings: GameSettings, targetX: number, targetY: number): {
  updatedGameSettings: GameSettings;
  status: AttackStatus;
} => {
  const shipsField = gameSettings.shipsField.map((row) => [...row]);
  const shipHits = gameSettings.shipHits.map((hit) => ({ ...hit }));
  const ships = [...gameSettings.ships];
  let sunkShipCount = gameSettings.sunkShipCount;
  let status: AttackStatus = 'miss';


  if (shipsField[targetY][targetX] === CellStatus.SHIP) {
    shipsField[targetY][targetX] = ShotStatus.SHOT;
    status = 'shot';

    let hitShipIndex = getShipIndex(ships, targetX, targetY);

    if (hitShipIndex !== -1) {
      shipHits[hitShipIndex].hits += 1;
      if (shipHits[hitShipIndex].hits === shipHits[hitShipIndex].length) {
        sunkShipCount += 1;
        markKilledShip(ships[hitShipIndex], shipsField);
        status = 'killed';
      }
    }
  }

  return {
    updatedGameSettings: {
      ...gameSettings,
      shipsField,
      shipHits,
      sunkShipCount,
    },
    status,
  };
};

const markKilledShip = (ship: Ship, field: number[][]) => {
  const { position, direction, length } = ship;
  let { x, y } = position;

  for (let i = 0; i < length; i += 1) {
    field[y][x] = ShotStatus.KILL;

    // for (let dx = -1; dx <= 1; dx++) {
    //   for (let dy = -1; dy <= 1; dy++) {
    //     let nx = x + dx;
    //     let ny = y + dy;
    //     if (nx >= 0 && nx < FIELD_SIZE && ny >= 0 && ny < FIELD_SIZE && field[ny][nx] === EMPTY) {
    //       field[ny][nx] = MISS;
    //     }
    //   }
    // }

    direction ? y += 1 : x += 1;
  }
};

const getShipIndex = (ships: Ship[], x: number, y: number) => {
  return ships.findIndex((ship) => {
    let { position, direction, length } = ship;
    let { x: startX, y: startY } = position;

    for (let i = 0; i < length; i += 1) {
      if (startX === x && startY === y) {
        return true;
      }

      direction ? startY += 1 : startX += 1;
    }
    return false;
  });
};