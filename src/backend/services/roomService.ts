import { WebSocket } from "ws";
import { getWsSendPayload } from "../utils";
import { roomsRepository } from "../repositories/roomsRepository";
import { WsSendCommands } from "../constants";
import { usersRepository } from "../repositories/usersRepository";
import { gameService } from "./gameService";

export const roomService = {

  createRoom: (ws: WebSocket, wsKey: string) => {
    try {
      const user = usersRepository.getCurrentUser(wsKey);

      roomsRepository.createRoom(user);
      roomService.updateRoom(ws);
    } catch (error) {
      console.error(error);
    }
  },

  updateRoom: (ws: WebSocket) => {
    const rooms = roomsRepository.getRooms();
    const filteredRooms = rooms.filter(room => room.roomUsers.length < 2);
    const payload = JSON.stringify(filteredRooms);

    ws.send(getWsSendPayload(WsSendCommands.UPDATE_ROOM, payload));
  },

  addUserToRoom: (ws: WebSocket, wsKey: string, data: string) => {
    try {
      const user = usersRepository.getCurrentUser(wsKey);
      const { indexRoom } = JSON.parse(data);

      roomsRepository.addUserToRoom(user, indexRoom);
      roomService.updateRoom(ws);
      // gameService.createGame(ws, wsKey, room.roomUsers);
    } catch (error) {
      console.error(error);
    }
  }
};