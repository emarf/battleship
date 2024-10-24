export enum WsSendCommands {
  REG = 'reg',
  UPDATE_ROOM = 'update_room',
  CREATE_GAME = 'create_game'
}

export enum WsReceiveCommands {
  REG = 'reg',
  CREATE_ROOM = 'create_room',
  ADD_USER_TO_ROOM = 'add_user_to_room',
  ADD_SHIPS = 'add_ships'
}