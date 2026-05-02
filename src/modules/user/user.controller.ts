import type { Request, Response, NextFunction } from 'express';
import { userService } from './user.service.js';
import { successResponse } from '../../common/index.js';
import type { IProfileResponse } from './user.dto.js';

export class UserController {
    constructor() {}

    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user._id;
            const result = await userService.getProfile(userId);
            return successResponse<IProfileResponse>(res, result, result.message, 200);
        } catch (error: any) {
            next(error);
        }
    }
}

export const userController = new UserController();
