import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';

export interface SocketServer extends SocketIOServer {
  server?: NetServer;
}

// Updated interfaces for App Router compatibility
export interface SocketRequest {
  socket: {
    server: NetServer & {
      io: SocketServer;
    };
  };
}

export interface SocketResponse {
  socket: {
    server: NetServer & {
      io: SocketServer;
    };
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export const initSocket = (req: SocketRequest, res: SocketResponse) => {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Join user to their personal room
      socket.on('join-user-room', (userId: string) => {
        socket.join(`user-${userId}`);
        console.log(`User ${userId} joined their room`);
      });

      // Handle signal updates
      socket.on('signal-update', (data) => {
        io.emit('signal-updated', data);
      });

      // Handle trade updates
      socket.on('trade-update', (data) => {
        io.emit('trade-updated', data);
      });

      // Handle portfolio updates
      socket.on('portfolio-update', (data) => {
        io.emit('portfolio-updated', data);
      });

      // Handle market data updates
      socket.on('market-update', (data) => {
        io.emit('market-updated', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }

  return res.socket.server.io;
};
