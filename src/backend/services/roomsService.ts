import { WebSocket } from "ws";
import { WsSendCommands } from "../constants";
import { roomsRepository } from "../repositories/roomsRepository";
import { usersRepository } from "../repositories/usersRepository";
import { broadcastToAllClients } from "../utils";
import { gamesService } from "./gamesService";
import { AddUserToRoomClientResponseData } from "../models/clientResponseData";

export const roomsService = {
  createRoom: (ws: WebSocket) => {
    try {
      const user = usersRepository.getUserByField('ws', ws);
      roomsRepository.createRoom(user);
      roomsService.updateRoom();
    } catch (error) {
      console.error(error);
    }
  },

  updateRoom: () => {
    try {
      const rooms = roomsRepository.getRooms();
      const filteredRooms = rooms.filter(room => room.roomUsers.length < 2);
      const stringifyData = JSON.stringify(filteredRooms);

      broadcastToAllClients(WsSendCommands.UPDATE_ROOM, stringifyData);
    } catch (error) {
      console.error(error);
    }
  },

  addUserToRoom: (ws: WebSocket, data: string) => {
    try {
      const { indexRoom }: AddUserToRoomClientResponseData = JSON.parse(data);
      const user = usersRepository.getUserByField('ws', ws);
      const room = roomsRepository.getRoom(indexRoom);

      const isAlreadyInRoom = room.roomUsers.some(({ index }) => index === user.index);
      if (isAlreadyInRoom) return;

      room.roomUsers.push({ name: user.name, index: user.index });

      roomsRepository.update(room);
      roomsService.updateRoom();
      gamesService.createGame(room);
    } catch (error) {
      console.error(error);
    }
  }
};