import type { Request, Response, NextFunction } from 'express';
import { postService } from './post.service.js';
import { successResponse } from '../../common/index.js';

export class PostController {
    async createPost(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const files = req.files as Express.Multer.File[];
            const result = await postService.createPost(userId, req.body, files);
            return successResponse(res, result, 'Post created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    async getAllPosts(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await postService.getAllPosts(userId, page, limit);
            return successResponse(res, result, 'Posts retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    async getPostById(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await postService.getPostById(req.params.postId as string);
            return successResponse(res, result, 'Post retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    async updatePost(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const result = await postService.updatePost(req.params.postId as string, userId, req.body);
            return successResponse(res, result, 'Post updated successfully');
        } catch (error) {
            next(error);
        }
    }

    async deletePost(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const result = await postService.deletePost(req.params.postId as string, userId);
            return successResponse(res, result, 'Post deleted successfully');
        } catch (error) {
            next(error);
        }
    }

    async likePost(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const result = await postService.likePost(req.params.postId as string, userId);
            return successResponse(res, result, 'Post like status updated');
        } catch (error) {
            next(error);
        }
    }
}

export const postController = new PostController();
