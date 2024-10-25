import { WebSocket } from "ws";
import { broadcastToAllClients, getWsServerResponse } from "../utils";
import { roomsRepository } from "../repositories/roomsRepository";
import { WsSendCommands } from "../constants";
import { usersRepository } from "../repositories/usersRepository";
import { gameService } from "./gameService";
import { AddUserToRoomClientResponseData } from "../models/response";

export const roomService = {
  createRoom: (wsKey: string) => {
    try {
      const user = usersRepository.getUserByField('wsKey', wsKey);
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
      const stringifyData = JSON.stringify(filteredRooms);

      broadcastToAllClients(WsSendCommands.UPDATE_ROOM, stringifyData);
    } catch (error) {
      console.error(error);
    }
  },

  addUserToRoom: (wsKey: string, data: string) => {
    try {
      const { indexRoom }: AddUserToRoomClientResponseData = JSON.parse(data);
      const user = usersRepository.getUserByField('wsKey', wsKey);
      const room = roomsRepository.getRoom(indexRoom);

      const isAlreadyInRoom = room.roomUsers.some(({ index }) => index === user.index);
      if (isAlreadyInRoom) return;

      room.roomUsers.push({ name: user.name, index: user.index });

      roomsRepository.update(room);
      roomService.updateRoom();

      gameService.createGame(room);
    } catch (error) {
      console.error(error);
    }
  }
};