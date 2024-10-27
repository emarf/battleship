import { AttackStatus, GameSettings } from "../models/gameModel";
import { Ship } from "../models/shipModel";

enum CellStatus {
  EMPTY = 0,
  SHIP = 1,
  MISS = 2,
  SHOT = 3,
  KILL = 4,
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
  killedCoordinates?: { x: number; y: number; }[];
  missedCoordinatesAroundKilled?: { x: number; y: number; }[];
  isProhibitedShot?: boolean;
} => {
  const shipsField = gameSettings.shipsField.map((row) => [...row]);
  const shipHits = gameSettings.shipHits.map((hit) => ({ ...hit }));
  const ships = [...gameSettings.ships];
  let sunkShipCount = gameSettings.sunkShipCount;

  let status: AttackStatus = 'miss';
  let killedCoordinates: { x: number; y: number; }[] = [];
  let missedCoordinatesAroundKilled: { x: number; y: number; }[] = [];
  const cell = shipsField[targetY][targetX];

  if (cell === CellStatus.MISS || cell === CellStatus.SHOT || cell === CellStatus.KILL) {
    return { updatedGameSettings: gameSettings, status: cell === CellStatus.MISS ? 'miss' : cell === CellStatus.SHOT ? 'shot' : 'killed', isProhibitedShot: true };
  }

  if (cell === CellStatus.SHIP) {
    shipsField[targetY][targetX] = CellStatus.SHOT;
    status = 'shot';

    let hitShipIndex = getShipIndex(ships, targetX, targetY);

    if (hitShipIndex !== -1) {
      shipHits[hitShipIndex].hits += 1;
      if (shipHits[hitShipIndex].hits === shipHits[hitShipIndex].length) {
        sunkShipCount += 1;
        const markedCoordinates = markKilledShip(ships[hitShipIndex], shipsField);
        killedCoordinates = markedCoordinates.filter(coord => shipsField[coord.y][coord.x] === CellStatus.KILL);
        missedCoordinatesAroundKilled = markedCoordinates.filter(coord => shipsField[coord.y][coord.x] === CellStatus.MISS);

        status = 'killed';
      }
    }
  } else {
    shipsField[targetY][targetX] = CellStatus.MISS;
  }

  // console.table(shipsField);

  return {
    updatedGameSettings: {
      ...gameSettings,
      shipsField,
      shipHits,
      sunkShipCount,
    },
    status,
    killedCoordinates,
    missedCoordinatesAroundKilled
  };
};

const markKilledShip = (ship: Ship, field: number[][]): { x: number; y: number; }[] => {
  const { position, direction, length } = ship;
  let { x, y } = position;
  let markedCoordinates: { x: number; y: number; }[] = [];

  for (let i = 0; i < length; i += 1) {
    markedCoordinates.push({ x, y });
    field[y][x] = CellStatus.KILL;
    direction ? y += 1 : x += 1;
  }

  let { x: startX, y: startY } = position;

  const endX = direction ? startX + 1 : startX + length;
  const endY = direction ? startY + length : startY + 1;

  for (let i = startY - 1; i <= endY; i += 1) {
    for (let j = startX - 1; j <= endX; j += 1) {
      if (
        i >= 0 && i < field.length &&
        j >= 0 && j < field[i].length &&
        field[i][j] === CellStatus.EMPTY
      ) {
        field[i][j] = CellStatus.MISS;
        markedCoordinates.push({ x: j, y: i });
      }
    }
  }

  return markedCoordinates;
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

export const getFirstEmptyCoordinate = (shipsField: number[][]): { x: number; y: number; } | null => {
  for (let y = 0; y < shipsField.length; y += 1) {
    for (let x = 0; x < shipsField[y].length; x += 1) {
      if (shipsField[y][x] === CellStatus.EMPTY || shipsField[y][x] === CellStatus.SHIP) {
        return { x, y };
      }
    }
  }
  return null;
};