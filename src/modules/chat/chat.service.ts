import crypto from 'crypto';
import { Types } from 'mongoose';
import { chatRepo, userRepo, messageRepo } from '../../db/index.js';
import { NotFoundError, ForbiddenError, BadRequestError, ChatType } from '../../common/index.js';
import { uploadBufferToCloudinary } from '../../common/cloudinary/cloudinary.utils.js';
import { socketService } from '../../common/services/socket.service.js';
import type { ICreateGroupChatRequest, ISendMessageRequest, ICreateGroupChatByEmailsRequest, ICreateDirectChatRequest } from './chat.dto.js';
import type { IChat } from '../../db/models/chat.model.js';
import type { IMessage, HIMessage } from '../../db/models/message.model.js';

export class ChatService {
    /**
     * Creates a new group chat.
     * Performs referential integrity checks on participant IDs, maps them to ObjectIds,
     * appends the creator, uploads the avatar to Cloudinary, and saves the chat model.
     */
    async createGroupChat(
        creatorId: string,
        chatData: ICreateGroupChatRequest,
        file?: Express.Multer.File
    ): Promise<IChat> {
        const { groupName, participants } = chatData;

        // 1. Referential Integrity Audit
        // Deduplicate input participant IDs to prevent double counting
        const uniqueParticipants = Array.from(new Set(participants));
        
        // Count matching, non-deleted users in the database
        const matchingUsersCount = await userRepo.countDocuments({
            _id: { $in: uniqueParticipants.map(id => new Types.ObjectId(id)) },
            deletedAt: null
        });

        if (matchingUsersCount !== uniqueParticipants.length) {
            throw new NotFoundError('One or more participant users do not exist in the system');
        }

        // 2. Data Transformation & Room Setup
        // Cast all validated participant strings to Mongoose ObjectId instances
        const participantObjectIds = uniqueParticipants.map(id => new Types.ObjectId(id));
        const creatorObjectId = new Types.ObjectId(creatorId);

        // Add the creator if they aren't already included in the participants list
        if (!participantObjectIds.some(id => id.equals(creatorObjectId))) {
            participantObjectIds.push(creatorObjectId);
        }

        // Generate a secure, unique roomID string
        const roomID = crypto.randomUUID();

        // 3. Cloudinary Space Allocation (If avatar image is uploaded)
        let groupImage = 'https://res.cloudinary.com/dqaq6ju4d/image/upload/v1700000000/default-group-avatar.png';
        if (file) {
            const folderPath = `social-media/chats/group/${roomID}`;
            const uploadResult = await uploadBufferToCloudinary(file.buffer, folderPath, 'avatar');
            groupImage = uploadResult.secure_url;
        }

        // 4. Database Persistence
        const chat = await chatRepo.create({
            createdBy: creatorObjectId,
            participants: participantObjectIds,
            chatType: ChatType.GROUP,
            groupName,
            groupImage,
            roomID
        });

        // 5. Emit Socket.io real-time event to all participants (non-blocking)
        try {
            const allParticipantIds = participantObjectIds.map(id => id.toString());
            allParticipantIds.forEach(participantId => {
                socketService.emitToUser(participantId, 'group_created', {
                    chatId: chat._id,
                    groupName: chat.groupName,
                    roomID: chat.roomID,
                    createdBy: chat.createdBy,
                    participants: chat.participants,
                    groupImage: chat.groupImage,
                    createdAt: chat.createdAt
                });
            });
        } catch (socketError) {
            console.error('[ChatService] Failed to emit group_created socket event:', socketError);
        }

        return chat;
    }

    /**
     * Retrieves all group chats that the requesting user belongs to.
     */
    async getUserGroups(userId: string): Promise<IChat[]> {
        const userObjectId = new Types.ObjectId(userId);

        const groups = await chatRepo.findAll({
            participants: userObjectId,
            chatType: ChatType.GROUP,
            deletedAt: null
        });

        return groups;
    }

    /**
     * Retrieves paginated message history for a chat room.
     * Validates the requesting user is a participant of the room.
     */
    async getChatHistory(
        userId: string,
        roomID: string,
        page: number = 1,
        limit: number = 50
    ): Promise<{ messages: IMessage[]; chat: IChat }> {
        // 1. Find the chat by roomID
        const chat = await chatRepo.findByRoomId(roomID);
        if (!chat) {
            throw new NotFoundError('Chat room not found');
        }

        // 2. Authorization: user must be a participant
        const userObjectId = new Types.ObjectId(userId);
        const isParticipant = chat.participants.some((p: Types.ObjectId) => p.equals(userObjectId));
        if (!isParticipant) {
            throw new ForbiddenError('You are not a participant of this chat room');
        }

        // 3. Fetch paginated message history
        const messages = await messageRepo.findByChatId(chat._id, page, limit);

        return { messages, chat };
    }

    /**
     * Persists a message to a chat room and broadcasts it via Socket.io.
     * Validates that the sender is an active participant of the target room.
     */
    async sendMessage(
        senderId: string,
        roomID: string,
        messageData: ISendMessageRequest,
        file?: Express.Multer.File
    ): Promise<HIMessage> {
        // 1. Find and validate the chat room
        const chat = await chatRepo.findByRoomId(roomID);
        if (!chat) {
            throw new NotFoundError('Chat room not found');
        }

        // 2. Authorization: sender must be a participant
        const senderObjectId = new Types.ObjectId(senderId);
        const isParticipant = chat.participants.some((p: Types.ObjectId) => p.equals(senderObjectId));
        if (!isParticipant) {
            throw new ForbiddenError('You are not a participant of this chat room');
        }

        // 3. Handle optional file attachment
        let attachmentUrl: string | undefined;
        if (file) {
            const folderPath = `social-media/chats/messages/${chat._id}`;
            const uploadResult = await uploadBufferToCloudinary(file.buffer, folderPath, `msg_${Date.now()}`);
            attachmentUrl = uploadResult.secure_url;
        }

        // 4. Persist the message
        const message = await messageRepo.create({
            chatId: chat._id,
            sender: senderObjectId,
            content: messageData.content,
            ...(attachmentUrl ? { attachmentUrl } : {}),
            readBy: [senderObjectId]
        });

        // 5. Populate sender info for the socket payload
        const populatedMessage = await messageRepo.findOne(
            { _id: message._id },
        );
        await populatedMessage?.populate('sender', 'username profileImage _id');

        // 6. Broadcast message to the room via Socket.io (non-blocking)
        try {
            socketService.emitToRoom(roomID, 'new_message', {
                messageId: message._id,
                chatId: chat._id,
                roomID,
                sender: populatedMessage?.sender ?? message.sender,
                content: message.content,
                attachmentUrl: message.attachmentUrl,
                createdAt: message.createdAt
            });

            // Also notify each participant who is not in the room with a push-style notification
            const allParticipantIds: string[] = chat.participants.map((p: Types.ObjectId) => p.toString());
            allParticipantIds.forEach(participantId => {
                if (participantId !== senderId) {
                    socketService.emitToUser(participantId, 'message_notification', {
                        chatId: chat._id,
                        roomID,
                        groupName: chat.groupName,
                        sender: populatedMessage?.sender ?? message.sender,
                        preview: message.content.substring(0, 100),
                        createdAt: message.createdAt
                    });
                }
            });
        } catch (socketError) {
            console.error('[ChatService] Failed to emit new_message socket event:', socketError);
        }

        return message;
    }

    /**
     * Creates a group chat using participants' emails instead of their user IDs.
     * Resolves the emails to user IDs, then invokes createGroupChat.
     */
    async createGroupChatByEmails(
        creatorId: string,
        chatData: ICreateGroupChatByEmailsRequest,
        file?: Express.Multer.File
    ): Promise<IChat> {
        const { groupName, emails } = chatData;

        // Deduplicate input emails to prevent double-counting
        const uniqueEmails = Array.from(new Set(emails.map(e => e.trim().toLowerCase())));

        // Fetch corresponding active users from the database
        const matchingUsers = await userRepo.findAll({
            email: { $in: uniqueEmails },
            deletedAt: null
        });

        // Verify that all emails mapped to active users
        const foundEmails = matchingUsers.map(u => u.email.toLowerCase());
        const missingEmails = uniqueEmails.filter(email => !foundEmails.includes(email));

        if (missingEmails.length > 0) {
            throw new NotFoundError(`Users with the following emails were not found or are deleted: ${missingEmails.join(', ')}`);
        }

        const participantIdStrings = matchingUsers.map(u => u._id.toString());

        // Delegate to the main group chat creation service
        return await this.createGroupChat(creatorId, { groupName, participants: participantIdStrings }, file);
    }

    /**
     * Finds or creates a direct (one-to-one) chat between two users.
     */
    async getOrCreateDirectChat(
        userId: string,
        chatData: ICreateDirectChatRequest
    ): Promise<IChat> {
        const { recipientId } = chatData;

        if (userId === recipientId) {
            throw new BadRequestError('You cannot start a direct chat with yourself');
        }

        // 1. Verify recipient user exists and is active
        const recipient = await userRepo.findById(recipientId);
        if (!recipient) {
            throw new NotFoundError('Recipient user not found');
        }

        const userObjectId = new Types.ObjectId(userId);
        const recipientObjectId = new Types.ObjectId(recipientId);

        // 2. Check if a direct chat between these two users already exists
        const existingChat = await chatRepo.findOne({
            chatType: ChatType.DIRECT,
            participants: { $all: [userObjectId, recipientObjectId] },
            deletedAt: null
        });

        if (existingChat) {
            return existingChat;
        }

        // 3. Create a new direct chat room
        const roomID = crypto.randomUUID();
        const chat = await chatRepo.create({
            createdBy: userObjectId,
            participants: [userObjectId, recipientObjectId],
            chatType: ChatType.DIRECT,
            groupImage: recipient.profilePic || 'https://res.cloudinary.com/dqaq6ju4d/image/upload/v1700000000/default-group-avatar.png',
            roomID
        });

        // 4. Emit Socket.io event to the recipient (non-blocking)
        try {
            socketService.emitToUser(recipientId, 'direct_chat_created', {
                chatId: chat._id,
                roomID: chat.roomID,
                createdBy: chat.createdBy,
                participants: chat.participants,
                createdAt: chat.createdAt
            });
        } catch (socketError) {
            console.error('[ChatService] Failed to emit direct_chat_created socket event:', socketError);
        }

        return chat;
    }
}

export const chatService = new ChatService();
