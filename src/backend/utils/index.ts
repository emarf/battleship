import { wsServer } from "..";
import { WsSendCommands } from "../constants";

export const getWsSendPayload = (type: WsSendCommands, data: any) => {
  return JSON.stringify({
    type,
    data,
    id: 0
  });
}; 

export const broadcastToAllClients = (type: WsSendCommands, data: string) => {
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(getWsSendPayload(type, data));
    }
  });
}; 