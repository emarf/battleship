import { WebSocket } from "ws";
import { usersRepository } from "../repositories/usersRepository";
import { getWsSendPayload } from "../utils";
import { roomService } from "./roomService";
import { WsSendCommands } from "../constants";

export const registrationService = {
  registration(ws: WebSocket, wsKey: string, data: string) {
    const { name, password } = JSON.parse(data);
    try {
      const hasUser = usersRepository.checkIsExist(name, password);
      const user = hasUser ? usersRepository.login(name, wsKey) : usersRepository.register(name, password, wsKey);

      const sendPayload = JSON.stringify({
        name: user.name,
        index: 0,
        error: false,
        errorText: '',
      });

      ws.send(getWsSendPayload(WsSendCommands.REG, sendPayload));
      roomService.updateRoom();
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