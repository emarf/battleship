import { WebSocket } from "ws";
import { broadcastToAllClients, getWsSendPayload } from "../utils";
import { roomsRepository } from "../repositories/roomsRepository";
import { WsSendCommands } from "../constants";
import { usersRepository } from "../repositories/usersRepository";
import { gameService } from "./gameService";

export const roomService = {
  createRoom: (wsKey: string) => {
    try {
      const user = usersRepository.getUserByWsKey(wsKey);
      console.log('user', user);
      roomsRepository.createRoom(user);
      roomService.updateRoom();
    } catch (error) {
      console.error(error);
    }
  },

  updateRoom: () => {
    try {
      const rooms = roomsRepository.getRooms();
      const filteredRooms = rooms.filter(room => room.roomUsers.length < 2);
      const payload = JSON.stringify(filteredRooms);

      broadcastToAllClients(WsSendCommands.UPDATE_ROOM, payload);
    } catch (error) {
      console.error(error);
    }
  },

  addUserToRoom: (wsKey: string, data: string) => {
    try {
      const { indexRoom } = JSON.parse(data);
      const user = usersRepository.getUserByWsKey(wsKey);
      const room = roomsRepository.getRoom(indexRoom);

      const isUserInRoom = room.roomUsers.some(({ index }) => index === user.index);
      if (isUserInRoom) return;
      room.roomUsers.push({ name: user.name, index: user.index });

      roomsRepository.update(room);
      roomService.updateRoom();

      gameService.createGame(room);
    } catch (error) {
      console.error(error);
    }
  }
};