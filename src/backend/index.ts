import { WebSocket, WebSocketServer } from "ws";
import { registrationService } from "./services/registrationService";
import { IncomingMessage } from "http";
import { WsReceiveCommands } from "./constants";
import { roomsService } from "./services/roomsService";
import { gamesService } from "./services/gamesService";

export const wsServer = new WebSocketServer({ port: 3000 });
console.log("WebSocket server started on ws://localhost:3000");

export const wsServerConnection = () => {
  wsServer.on("connection", (ws: WebSocket, _: IncomingMessage) => {
    console.log("Client connected");

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

process.on("SIGINT", () => {
  console.log("Shutting down WebSocket server...");

  wsServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.close();
    }
  });

  wsServer.close(() => {
    console.log("WebSocket server closed.");
    process.exit(0);
  });
});


const commandsParser = (ws: WebSocket, type: string, data: string) => {
  console.log(`Received command: ${type}`, data);

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

  if (type === WsReceiveCommands.RANDOM_ATTACK) {
    gamesService.randomAttack(data);
  }
};