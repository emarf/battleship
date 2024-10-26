import { WebSocket } from "ws";
import { wsServer } from "..";
import { WsSendCommands } from "../constants";
import { Ship } from "../models/shipModel";

export const getWsServerResponse = (type: WsSendCommands, data: string) => {
  const payload = JSON.stringify({
    type,
    data,
    id: 0
  });
  return payload;
};

export const broadcastToAllClients = (type: WsSendCommands, data: string) => {
  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(getWsServerResponse(type, data));
    }
  });
};