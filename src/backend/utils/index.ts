import { WsSendCommands } from "../constants";

export const getWsSendPayload = (type: WsSendCommands, data: any) => {
  return JSON.stringify({
    type,
    data,
    id: 0
  });
}; 