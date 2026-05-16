import { z } from 'zod';
import { PostPrivacy } from '../../common/index.js';

export const createPostSchema = {
    body: z.object({
        content: z.string().min(1, 'Content is required').max(5000),
        privacy: z.nativeEnum(PostPrivacy).optional(),
        tags: z.array(z.string()).optional()
    })
};

export const updatePostSchema = {
    body: z.object({
        content: z.string().min(1).max(5000).optional(),
        privacy: z.nativeEnum(PostPrivacy).optional(),
        tags: z.array(z.string()).optional()
    })
};

export const postIdSchema = {
    params: z.object({
        postId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Post ID')
    })
};

export const getAllPostsSchema = {
    query: z.object({
        page: z.string().optional().refine(v => !v || !isNaN(Number(v)), 'Page must be a number'),
        limit: z.string().optional().refine(v => !v || !isNaN(Number(v)), 'Limit must be a number')
    })
};
