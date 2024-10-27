import { WebSocket } from "ws";
import { usersRepository } from "../repositories/usersRepository";
import { getWsServerResponse } from "../utils";
import { roomsService } from "./roomsService";
import { WsSendCommands } from "../constants";
import { winnersService } from "./winnersService";
import { RegClientResponseData } from "../models/clientResponseData";
import { RegServerResponseData } from "../models/serverResponseData";

export const registrationService = {
  registration(ws: WebSocket, data: string) {
    const { name, password }: RegClientResponseData = JSON.parse(data);
    try {
      const hasUser = usersRepository.checkIsExist(name, password);
      const user = hasUser ? usersRepository.login(name, ws) : usersRepository.register(name, password, ws);

      const responseData: RegServerResponseData = {
        name: user.name,
        index: user.index,
        error: false,
        errorText: '',
      };
      const stringifyData = JSON.stringify(responseData);
      ws.send(getWsServerResponse(WsSendCommands.REG, stringifyData));

      roomsService.updateRoom();
      winnersService.updateWinners();
    } catch (error) {
      const responseErrorData: RegServerResponseData = {
        name,
        index: '',
        error: true,
        errorText: error instanceof Error ? error.message : 'Unknown error',
      };

      const stringifyData = JSON.stringify(responseErrorData);
      ws.send(getWsServerResponse(WsSendCommands.REG, stringifyData));
    }
  }
}; 