import { WebSocket, WebSocketServer } from "ws";
import { registrationService } from "./services/registrationService";
import { IncomingMessage } from "http";
import { WsReceiveCommands } from "./constants";
import { roomsService } from "./services/roomsService";
import { gamesService } from "./services/gamesService";

export const wsServer = new WebSocketServer({ port: 3000 });
export const wsServerConnection = () => {
  wsServer.on("connection", (ws: WebSocket, request: IncomingMessage) => {
    ws.on("message", (message) => {
      try {
        const parsedMessage = JSON.parse(message.toString());

        const { type, data } = parsedMessage;
        commandsParser(ws, type, data);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    });

    ws.on("close", () => {
      console.log("Client disconnected");
    });

    ws.on("error", (error) => {
      console.error("Error occurred:", error);
    });

  });
};


const commandsParser = (ws: WebSocket, type: string, data: string) => {
  if (type === WsReceiveCommands.REG) {
    registrationService.registration(ws, data);
  }

  if (type === WsReceiveCommands.CREATE_ROOM) {
    roomsService.createRoom(ws);
  }

  if (type === WsReceiveCommands.ADD_USER_TO_ROOM) {
    roomsService.addUserToRoom(ws, data);
  }

  if (type === WsReceiveCommands.ADD_SHIPS) {
    gamesService.addShips(data);
  }

  if (type === WsReceiveCommands.ATTACK) {
    gamesService.attack(data);
  }
};