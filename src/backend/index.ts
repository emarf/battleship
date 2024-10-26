import { WebSocket, WebSocketServer } from "ws";
import { registrationService } from "./services/registrationService";
import { IncomingMessage } from "http";
import { WsReceiveCommands } from "./constants";
import { roomService } from "./services/roomService";
import { wsKeyToWsClient } from "./storage/websocketClients";
import { gameService } from "./services/gameService";

export const wsServer = new WebSocketServer({ port: 3000 });
export const wsServerConnection = () => {
  wsServer.on("connection", (ws: WebSocket, request: IncomingMessage) => {
    console.log("New client connected");
    const wsKey = request.headers['sec-websocket-key'];

    if (wsKey && !wsKeyToWsClient.has(wsKey)) {
      wsKeyToWsClient.set(wsKey, ws);
    }

    ws.on("message", (message) => {
      try {
        if (!wsKey) return;
        const parsedMessage = JSON.parse(message.toString());
        // console.log('===socket message===', parsedMessage);

        const { type, data } = parsedMessage;
        commandsParser(ws, wsKey, type, data);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");

      if (wsKey) {
        wsKeyToWsClient.delete(wsKey);
      }
    });

    ws.on("error", (error) => {
      console.error("Error occurred:", error);
    });

  });
};


const commandsParser = (ws: WebSocket, wsKey: string, type: string, data: string) => {
  if (type === WsReceiveCommands.REG) {
    registrationService.registration(ws, wsKey, data);
  }

  if (type === WsReceiveCommands.CREATE_ROOM) {
    roomService.createRoom(wsKey);
  }

  if (type === WsReceiveCommands.ADD_USER_TO_ROOM) {
    roomService.addUserToRoom(wsKey, data);
  }

  if (type === WsReceiveCommands.ADD_SHIPS) {
    gameService.addShips(wsKey, data);
  }

  if (type === WsReceiveCommands.ATTACK) {
    gameService.attack(wsKey, data);
  }
};