import { MessageModel, type IMessage } from '../models/message.model.js';
import { DBRepo } from './db.repo.js';
import type { Types } from 'mongoose';

export class MessageRepo extends DBRepo<IMessage> {
    constructor() {
        super(MessageModel);
    }

    /**
     * Fetches paginated messages for a chat room, sorted oldest-first.
     */
    async findByChatId(
        chatId: Types.ObjectId,
        page: number = 1,
        limit: number = 50
    ): Promise<any[]> {
        const skip = (page - 1) * limit;
        return await MessageModel
            .find({ chatId, deletedAt: null })
            .populate('sender', 'username profileImage _id')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(limit)
            .lean();
    }
}

export const messageRepo = new MessageRepo();
