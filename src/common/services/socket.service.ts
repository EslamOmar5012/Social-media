import { Server, Socket } from 'socket.io';
import type { Server as HttpServer } from 'http';
import { verifyToken } from '../security/token.security.js';
import { envVars } from '../../config/index.js';

export class SocketService {
    private io: Server | null = null;
    // Maps userId to a set of active socket IDs
    private userSockets = new Map<string, Set<string>>();

    /**
     * Initializes the Socket.io server and registers connection handlers and authentication.
     */
    init(server: HttpServer) {
        this.io = new Server(server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST']
            }
        });

        // Socket.io Middleware for JWT authentication
        this.io.use((socket: Socket, next) => {
            try {
                const token = socket.handshake.auth['token'] || socket.handshake.query['token'];
                if (!token) {
                    return next(new Error('Authentication token required'));
                }

                // Strip 'Bearer ' if present
                const cleanedToken = typeof token === 'string' && token.startsWith('Bearer ') 
                    ? token.slice(7) 
                    : token;

                const secret = envVars.accessToken.secret;
                const decoded = verifyToken(cleanedToken as string, secret);

                if (!decoded || !decoded.userId) {
                    return next(new Error('Invalid authentication token'));
                }

                // Attach verified userId to the socket
                (socket as any).userId = decoded.userId;
                next();
            } catch (error) {
                next(new Error('Socket authentication failed'));
            }
        });

        this.io.on('connection', (socket: Socket) => {
            const userId = (socket as any).userId;
            console.log(`[SocketService] User ${userId} connected on socket ${socket.id}`);

            // Add socket ID to user mapping
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId)!.add(socket.id);

            // Handle joining an explicit room (e.g. roomId)
            socket.on('join_room', (roomID: string) => {
                socket.join(roomID);
                console.log(`[SocketService] Socket ${socket.id} joined room ${roomID}`);
            });

            // Handle leaving a room
            socket.on('leave_room', (roomID: string) => {
                socket.leave(roomID);
                console.log(`[SocketService] Socket ${socket.id} left room ${roomID}`);
            });

            /**
             * Client emits: send_message
             * Payload: { roomID: string, content: string }
             * Server persists the message and broadcasts new_message to the room.
             */
            socket.on('send_message', async (payload: { roomID: string; content: string }) => {
                try {
                    const { roomID, content } = payload;
                    if (!roomID || !content?.trim()) {
                        socket.emit('error', { message: 'roomID and content are required' });
                        return;
                    }

                    // Lazy-import to avoid circular dependency at module load time
                    const { chatService } = await import('../../modules/chat/chat.service.js');
                    const message = await chatService.sendMessage(userId, roomID, { content });

                    // Acknowledge the sender that the message was saved
                    socket.emit('message_sent', { messageId: message._id, roomID });
                } catch (err: any) {
                    console.error(`[SocketService] send_message error for user ${userId}:`, err.message);
                    socket.emit('error', { message: err.message ?? 'Failed to send message' });
                }
            });

            socket.on('disconnect', () => {
                console.log(`[SocketService] Socket ${socket.id} disconnected`);
                const sockets = this.userSockets.get(userId);
                if (sockets) {
                    sockets.delete(socket.id);
                    if (sockets.size === 0) {
                        this.userSockets.delete(userId);
                    }
                }
            });
        });
    }

    /**
     * Gets the initialized Socket.io Server instance.
     */
    getIO(): Server {
        if (!this.io) {
            throw new Error('Socket.io server has not been initialized');
        }
        return this.io;
    }

    /**
     * Emits an event to all active sockets of a specific user.
     */
    emitToUser(userId: string, event: string, data: any) {
        if (!this.io) return;
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            for (const socketId of sockets) {
                this.io.to(socketId).emit(event, data);
            }
        }
    }

    /**
     * Emits an event to all sockets joined in a room.
     */
    emitToRoom(roomId: string, event: string, data: any) {
        if (!this.io) return;
        this.io.to(roomId).emit(event, data);
    }
}

export const socketService = new SocketService();
