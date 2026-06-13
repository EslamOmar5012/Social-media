import { ChatModel, type IChat } from '../models/chat.model.js';
import { DBRepo } from './db.repo.js';

export class ChatRepo extends DBRepo<IChat> {
    constructor() {
        super(ChatModel);
    }

    async findByRoomId(roomID: string): Promise<any> {
        return await this.findOne({ roomID });
    }
}

export const chatRepo = new ChatRepo();
