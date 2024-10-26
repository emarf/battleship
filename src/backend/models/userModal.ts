import { WebSocket } from "ws";

export type User = {
  name: string;
  index: string;
  password: string;
  ws: WebSocket;
};