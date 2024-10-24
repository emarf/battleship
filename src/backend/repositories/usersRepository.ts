import { User } from "../models/userModal";
import { randomUUID } from 'crypto';

const users: Map<string, User> = new Map();

export const usersRepository = {
  checkIsExist: (username: string, password: string): boolean => {
    const user = users.get(username);

    if (!user) {
      return false;
    }

    if (user?.password !== password) {
      throw new Error('Wrong password');
    }

    return true;
  },

  register: (name: string, password: string, wsKey: string): User => {
    const uuid = randomUUID();
    const user = {
      name,
      password,
      index: uuid,
      wsKey: wsKey
    };

    users.set(name, user);
    return user;
  },

  login: (name: string, wsKey: string): User => {
    const user = users.get(name);
    if (!user) {
      throw new Error('User not found');
    }

    // update wsKey if user close and open websocket connection
    users.set(name, { ...user, wsKey });
    return user;
  },

  getUser: (name: string): User => {
    const user = users.get(name);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  getUserByWsKey: (wsKey: string) => {
    for (const user of users.values()) {
      if (user['wsKey'] === wsKey) {
        return user;
      }
    }

    throw new Error('User not found');
  }
};