import { Room } from "../models/roomModel";
import { User } from "../models/userModal";

const rooms = new Map<number, Room>();


export const roomsRepository = {
  getRooms: () => {
    return Array.from(rooms.values());
  },

  createRoom: (user: User) => {
    const room = {
      roomId: Date.now(),
      roomUsers: [
        {
          name: user.name,
          index: user.index
        }
      ],
    };

    rooms.set(room.roomId, room);
  },

  addUserToRoom: (user: User, roomId: number): Room => {
    const room = rooms.get(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    room.roomUsers.push({
      name: user.name,
      index: user.index
    });

    rooms.set(roomId, room);
    return room;
  }
};