import type { Request, Response, NextFunction } from 'express';
import { chatService } from './chat.service.js';
import { successResponse } from '../../common/index.js';

export class ChatController {
    /**
     * POST /chat/create-group
     * Creates a new group chat with optional avatar upload.
     */
    async createGroupChat(req: Request, res: Response, next: NextFunction) {
        try {
            const creatorId = (req as any).user._id.toString();
            const file = req.file;
            const result = await chatService.createGroupChat(creatorId, req.body, file);
            return successResponse(res, result, 'Group chat created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /chat/my-groups
     * Returns all group chats the authenticated user belongs to.
     */
    async getMyGroups(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id.toString();
            const groups = await chatService.getUserGroups(userId);
            return successResponse(res, groups, 'User groups retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /chat/room/:roomID/messages
     * Returns paginated message history for a chat room.
     * User must be a participant of the room.
     */
    async getChatHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id.toString();
            const roomID = String(req.params['roomID']);;
            const page = Math.max(1, Number(req.query['page']) || 1);
            const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 50));

            const result = await chatService.getChatHistory(userId, roomID, page, limit);
            return successResponse(res, result, 'Chat history retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /chat/room/:roomID/messages
     * Sends a new message to a chat room.
     * Supports optional file attachment via multipart/form-data.
     */
    async sendMessage(req: Request, res: Response, next: NextFunction) {
        try {
            const senderId = (req as any).user._id.toString();
            const roomID = String(req.params['roomID']);;
            const file = req.file;

            const message = await chatService.sendMessage(senderId, roomID, req.body, file as Express.Multer.File | undefined);
            return successResponse(res, message, 'Message sent successfully', 201);
        } catch (error) {
            next(error);
        }
    }
}

export const chatController = new ChatController();
