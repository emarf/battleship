import { Room } from "../models/roomModel";
import { User } from "../models/userModal";
import { randomUUID } from "node:crypto";

const rooms = new Map<string, Room>();

export const roomsRepository = {
  getRooms: () => {
    return Array.from(rooms.values());
  },

  createRoom: (user: User): Room => {
    const uuid = randomUUID();
    const room = {
      roomId: uuid,
      roomUsers: [
        {
          name: user.name,
          index: user.index
        }
      ],
    };

    rooms.set(room.roomId, room);
    return room;
  },

  getRoom: (roomId: string) => {
    const room = rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  },

  update: (updatedRoom: Room) => {
    const room = rooms.get(updatedRoom.roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    rooms.set(updatedRoom.roomId, updatedRoom);
  }
};