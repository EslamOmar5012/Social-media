import { z } from 'zod';

const participantsSchema = z.preprocess((val) => {
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            return val.split(',').map(s => s.trim()).filter(Boolean);
        }
        return [val].filter(Boolean);
    }
    if (Array.isArray(val)) {
        return val.filter(Boolean);
    }
    return [];
}, z.array(
    z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid participant User ID')
).min(1, 'At least one participant is required'));

export const createGroupChatSchema = {
    body: z.object({
        groupName: z.string().min(3, 'Group name must be at least 3 characters').max(100, 'Group name cannot exceed 100 characters'),
        participants: participantsSchema
    })
};

export const sendMessageSchema = {
    params: z.object({
        roomID: z.string().min(1, 'Room ID is required')
    }),
    body: z.object({
        content: z.string().min(1, 'Message content cannot be empty').max(5000, 'Message cannot exceed 5000 characters')
    })
};

export const getChatHistorySchema = {
    params: z.object({
        roomID: z.string().min(1, 'Room ID is required')
    }),
    query: z.object({
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional()
    }).optional()
};
