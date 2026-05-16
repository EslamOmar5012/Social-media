import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createCommentSchema = {
    body: z.object({
        content: z.string().min(1, 'Content is required').max(1000),
        postId: z.string().regex(objectIdRegex, 'Invalid Post ID'),
        commentId: z.string().regex(objectIdRegex, 'Invalid Parent Comment ID').optional(),
        tags: z.array(z.string().regex(objectIdRegex)).optional()
    })
};

export const replyCommentSchema = {
    params: z.object({
        commentId: z.string().regex(objectIdRegex, 'Invalid Comment ID')
    }),
    body: z.object({
        content: z.string().min(1, 'Content is required').max(1000),
        tags: z.array(z.string().regex(objectIdRegex)).optional()
    })
};

export const updateCommentSchema = {
    body: z.object({
        content: z.string().min(1).max(1000).optional(),
        tags: z.array(z.string().regex(objectIdRegex)).optional()
    })
};

export const commentIdSchema = {
    params: z.object({
        commentId: z.string().regex(objectIdRegex, 'Invalid Comment ID')
    })
};

export const postIdParamsSchema = {
    params: z.object({
        postId: z.string().regex(objectIdRegex, 'Invalid Post ID')
    })
};
