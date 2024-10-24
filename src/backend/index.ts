import { WebSocket, WebSocketServer } from "ws";
import { registrationService } from "./services/registrationService";
import { IncomingMessage } from "http";
import { WsReceiveCommands } from "./constants";
import { roomService } from "./services/roomService";

export const wsServerConnection = () => {
  const wsServer = new WebSocketServer({ port: 3000 });
  

  wsServer.on("connection", (ws: WebSocket, request: IncomingMessage) => {

    const wsKey = request.headers['sec-websocket-key'];
    console.log("New client connected");

    ws.on("message", (message) => {
      try {
        if (!wsKey) return;

        const parsedMessage = JSON.parse(message.toString());
        console.log('parsedMessage', parsedMessage);
        const { type, data } = parsedMessage;
        commandsParser(ws, wsKey, type, data);
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


const commandsParser = (ws: WebSocket, wsKey: string, type: string, data: string) => {
  if (type === WsReceiveCommands.REG) {
    registrationService.registration(ws, wsKey, data);
  }

  if (type === WsReceiveCommands.CREATE_ROOM) {
    roomService.createRoom(ws, wsKey);
  }

  if (type === WsReceiveCommands.ADD_USER_TO_ROOM) {
    roomService.addUserToRoom(ws, wsKey, data);
  }
};