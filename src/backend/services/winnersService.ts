import { WebSocket } from "ws";
import { wsServer } from "..";
import { WsSendCommands } from "../constants";
import { usersRepository } from "../repositories/usersRepository";
import { getWsServerResponse } from "../utils";

export const winnersService = {
  updateWinners() {
    const users = usersRepository.getUsers();
    const responseData = users.map((user) => ({ name: user.name, wins: user.wins }));
    const stringifyData = JSON.stringify(responseData);
    wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(getWsServerResponse(WsSendCommands.UPDATE_WINNERS, stringifyData));
      }
    });
  }
};