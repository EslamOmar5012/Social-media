import type { Request, Response, NextFunction } from 'express';
import { commentService } from './comment.service.js';
import { successResponse } from '../../common/index.js';

export class CommentController {
    async createComment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const files = req.files as Express.Multer.File[];
            const result = await commentService.createComment(userId, req.body, files);
            return successResponse(res, result, 'Comment added successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    async replyToComment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const { commentId } = req.params;
            const files = req.files as Express.Multer.File[];
            
            // Find parent to get postId automatically
            const parentComment = await commentService.getCommentById(commentId as string);
            
            const result = await commentService.createComment(userId, {
                ...req.body,
                commentId,
                postId: parentComment.postId.toString()
            }, files);
            
            return successResponse(res, result, 'Reply added successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    async getCommentsByPost(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await commentService.getCommentsByPost(req.params.postId as string, page, limit);
            return successResponse(res, result, 'Comments retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    async updateComment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const result = await commentService.updateComment(req.params.commentId as string, userId, req.body);
            return successResponse(res, result, 'Comment updated successfully');
        } catch (error) {
            next(error);
        }
    }

    async deleteComment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const result = await commentService.deleteComment(req.params.commentId as string, userId);
            return successResponse(res, result, 'Comment deleted successfully');
        } catch (error) {
            next(error);
        }
    }

    async likeComment(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const result = await commentService.likeComment(req.params.commentId as string, userId);
            return successResponse(res, result, 'Comment like status updated');
        } catch (error) {
            next(error);
        }
    }
}

export const commentController = new CommentController();
