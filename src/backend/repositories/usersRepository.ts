import { User } from "../models/userModal";

const users: Map<string, User> = new Map();

export const usersRepository = {
  checkIsExist: (wsKey: string, password: string): boolean => {
    const user = users.get(wsKey);

    if (!user) {
      return false;
    }

    if (user?.password !== password) {
      throw new Error('Wrong password');
    }

    return true;
  },

  registerUser: (wsKey: string, name: string, password: string): User => {
    const user = {
      name,
      password,
      index: Math.floor(Date.now() * Math.random())
    };
    users.set(wsKey, user);

    return user;
  },

  getUser: (wsKey: string): User => {
    const user = users.get(wsKey);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  getCurrentUser: (wsKey: string) => {
    const user = users.get(wsKey);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
};