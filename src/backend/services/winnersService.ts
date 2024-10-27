import { WsSendCommands } from "../constants";
import { usersRepository } from "../repositories/usersRepository";
import { broadcastToAllClients } from "../utils";

export const winnersService = {
  updateWinners() {
    const users = usersRepository.getUsers();
    const responseData = users.map((user) => ({ name: user.name, wins: user.wins }));
    const stringifyData = JSON.stringify(responseData);

    broadcastToAllClients(WsSendCommands.UPDATE_WINNERS, stringifyData);
  }
};