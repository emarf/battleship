import { WebSocket } from "ws";
import { usersRepository } from "../repositories/usersRepository";
import { getWsSendPayload } from "../utils";
import { roomService } from "./roomService";
import { WsSendCommands } from "../constants";

export const registrationService = {
  registration(ws: WebSocket, wsKey: string, data: string) {
    const { name, password } = JSON.parse(data);
    try {
      const hasUser = usersRepository.checkIsExist(wsKey, password);
      const user = hasUser ? usersRepository.getUser(wsKey) : usersRepository.registerUser(wsKey, name, password);

      const sendPayload = JSON.stringify({
        name: user.name,
        index: 0,
        error: false,
        errorText: '',
      });

      roomService.updateRoom(ws);
      ws.send(getWsSendPayload(WsSendCommands.REG, sendPayload));
    } catch (error) {
      const sendPayload = JSON.stringify({
        name,
        index: '',
        error: true,
        errorText: error instanceof Error ? error.message : 'Unknown error',
      });
      ws.send(getWsSendPayload(WsSendCommands.REG, sendPayload));
    }
  }
}; 