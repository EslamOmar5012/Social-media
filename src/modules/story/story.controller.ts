import type { Request, Response, NextFunction } from 'express';
import { storyService } from './story.service.js';
import { successResponse } from '../../common/index.js';

export class StoryController {
    async createStory(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const file = req.file;
            const result = await storyService.createStory(userId, req.body.content, file);
            return successResponse(res, result, 'Story created successfully', 201);
        } catch (error) {
            next(error);
        }
    }

    async getActiveStories(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await storyService.getActiveStories();
            return successResponse(res, result, 'Active stories retrieved successfully');
        } catch (error) {
            next(error);
        }
    }

    async markAsViewed(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const result = await storyService.addViewer(req.params.storyId as string, userId);
            return successResponse(res, result, 'Story marked as viewed');
        } catch (error) {
            next(error);
        }
    }
}

export const storyController = new StoryController();
