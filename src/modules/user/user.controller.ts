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

    async softDeleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId as string;
            const result = await userService.softDeleteUser(userId);
            return successResponse(res, result, result.message, 200);
        } catch (error: any) {
            next(error);
        }
    }

    async hardDeleteUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId as string;
            const result = await userService.hardDeleteUser(userId);
            return successResponse(res, result, result.message, 200);
        } catch (error: any) {
            next(error);
        }
    }

    async restoreUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.params.userId as string;
            const result = await userService.restoreUser(userId);
            return successResponse(res, result, result.message, 200);
        } catch (error: any) {
            next(error);
        }
    }

    async updateProfilePic(req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.file) {
                return next(new Error('Please upload an image'));
            }

            const userId = (req as any).user._id;
            const result = await userService.updateProfilePic(userId, req.file);
            
            return successResponse(res, result, result.message, 200);
        } catch (error: any) {
            next(error);
        }
    }

    async updateCoverPics(req: Request, res: Response, next: NextFunction) {
        try {
            const files = req.files as Express.Multer.File[];
            if (!files || files.length === 0) {
                return next(new Error('Please upload at least one image'));
            }

            const userId = (req as any).user._id;
            const result = await userService.updateCoverPics(userId, files);

            return successResponse(res, result, result.message, 200);
        } catch (error: any) {
            next(error);
        }
    }

    async downloadImage(req: Request, res: Response, next: NextFunction) {
        try {
            const type = req.params.type as 'profile' | 'cover';
            const index = parseInt(req.query.index as string || '0');
            const userId = (req as any).user._id;

            const { path, isLocal } = await userService.getDownloadInfo(userId, type, index);

            if (isLocal) {
                return res.download(path);
            } else {
                // For cloudinary, we redirect to the URL but try to force attachment
                const downloadUrl = path.replace('/upload/', '/upload/fl_attachment/');
                return res.redirect(downloadUrl);
            }
        } catch (error: any) {
            next(error);
        }
    }

    async deleteImage(req: Request, res: Response, next: NextFunction) {
        try {
            const type = req.params.type as 'profile' | 'cover';
            const index = parseInt(req.query.index as string || '0');
            const userId = (req as any).user._id;

            const result = await userService.deleteImage(userId, type, index);

            return successResponse(res, result, result.message, 200);
        } catch (error: any) {
            next(error);
        }
    }
}

export const userController = new UserController();
