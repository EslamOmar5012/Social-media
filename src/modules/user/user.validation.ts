import { z } from 'zod';

export const addFriendSchema = {
    body: z.object({
        friendId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid friend User ID')
    })
};

export const searchUsersSchema = {
    query: z.object({
        q: z.string().min(1, 'Search query q is required').max(100, 'Search query too long')
    })
};
