import { WebSocket } from "ws";
import { User } from "../models/userModal";
import { randomUUID } from 'crypto';

const userByName: Map<string, User> = new Map();
const userByIndex: Map<string, User> = new Map();
const userByWs: Map<WebSocket, User> = new Map();

const userMaps: Record<keyof User, Map<string | WebSocket, User>> = {
  name: userByName,
  index: userByIndex,
  password: new Map(),
  ws: userByWs,
  wins: new Map(),
};

export const usersRepository = {
  checkIsExist: (name: string, password: string): boolean => {
    const user = userByName.get(name);

    if (!user) {
      return false;
    }

    if (user.password !== password) {
      throw new Error('Wrong password');
    }

    return true;
  },

  register: (name: string, password: string, ws: WebSocket): User => {
    const uuid = randomUUID();
    const user: User = {
      name,
      password,
      index: uuid,
      ws: ws,
      wins: 0
    };

    userByName.set(name, user);
    userByIndex.set(uuid, user);
    userByWs.set(ws, user);

    return user;
  },

  login: (name: string, ws: WebSocket): User => {
    const user = userByName.get(name);
    if (!user) {
      throw new Error('User not found');
    }

    // Update WebSocket if user closes and reopens websocket connection
    const updatedUser = { ...user, ws };
    userByName.set(name, updatedUser);
    userByIndex.set(user.index, updatedUser);
    userByWs.set(ws, updatedUser);

    return updatedUser;
  },

  getUserByField: (field: keyof User, value: string | WebSocket): User => {
    const userMap = userMaps[field];
    if (!userMap) {
      throw new Error('Unsupported field for search');
    }

    const user = userMap.get(value);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  update: (user: User) => {
    userByName.set(user.name, user);
    userByIndex.set(user.index, user);
    userByWs.set(user.ws, user);
  },

  getUsers() {
    return Array.from(userByName.values());
  }
};
