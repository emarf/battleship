import { WebSocket } from "ws";
import { usersRepository } from "../repositories/usersRepository";
import { getWsServerResponse } from "../utils";
import { roomService } from "./roomService";
import { WsSendCommands } from "../constants";
import { RegClientResponseData, RegServerResponseData } from "../models/response";

export const registrationService = {
  registration(ws: WebSocket, wsKey: string, data: string) {
    const { name, password }: RegClientResponseData = JSON.parse(data);
    try {
      const hasUser = usersRepository.checkIsExist(name, password);
      const user = hasUser ? usersRepository.login(name, wsKey) : usersRepository.register(name, password, wsKey);

      const responseData: RegServerResponseData = {
        name: user.name,
        index: user.index,
        error: false,
        errorText: '',
      };
      const stringifyData = JSON.stringify(responseData);
      ws.send(getWsServerResponse(WsSendCommands.REG, stringifyData));

      roomService.updateRoom();
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