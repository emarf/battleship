export type Room = {
  roomId: number;
  roomUsers: {
    name: string;
    index: number;
  }[]
}