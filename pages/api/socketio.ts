import type { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { setIO } from '@/lib/serverSockets';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type NextApiResponseWithSocket = NextApiResponse & {
  socket: NetServer & {
    server: NetServer & { io?: SocketIOServer };
  };
};

let onlineUsers = 0;

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
      },
    });

    io.on('connection', (socket: Socket) => {
      onlineUsers += 1;
      io.emit('online-users', onlineUsers);

      socket.on('join', (payload) => {
        if (payload?.userId) {
          socket.join(`user-${payload.userId}`);
        }
      });

      socket.on('chat-message', (msg) => {
        io.emit('chat-message', {
          id: msg?.id ?? String(Date.now()),
          userId: msg?.userId ?? 'unknown',
          message: msg?.message ?? '',
          isAdmin: !!msg?.isAdmin,
          createdAt: new Date().toISOString(),
          user: msg?.user ?? {},
        });
      });

      // Support message namespace
      socket.on('support-message', async (payload) => {
        try {
          if (payload?.userId && payload?.message) {
            await prisma.chatMessage.create({
              data: {
                userId: String(payload.userId),
                message: String(payload.message),
                isAdmin: !!payload.isAdmin,
              }
            });
          }
        } catch (e) {
          // log and continue broadcasting
          console.error('Failed to persist support-message:', e);
        }
        // Broadcast to admins and to the user's room
        io.emit('support-message', payload);
        if (payload?.userId) {
          io.to(`user-${payload.userId}`).emit('support-message', payload);
        }
      });

      socket.on('disconnect', () => {
        onlineUsers = Math.max(0, onlineUsers - 1);
        io.emit('online-users', onlineUsers);
      });
    });

    // @ts-ignore
    res.socket.server.io = io;
    setIO(io);
  }
  // Always end the request here and let Socket.IO handle its own handshake
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};


