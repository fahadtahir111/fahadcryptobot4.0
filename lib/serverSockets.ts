import type { Server as SocketIOServer } from 'socket.io';

declare global {
  // eslint-disable-next-line no-var
  var __io__: SocketIOServer | undefined;
}

export function setIO(io: SocketIOServer) {
  global.__io__ = io;
}

export function getIO(): SocketIOServer | undefined {
  return global.__io__;
}


