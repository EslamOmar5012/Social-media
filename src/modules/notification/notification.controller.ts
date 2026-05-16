import type { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service.js';
import { successResponse, BadRequestError } from '../../common/index.js';
import { redisService } from '../../db/index.js';
import type { ISendNotificationRequest, IUpdateFcmTokenRequest } from './notification.dto.js';

export class NotificationController {
    async sendNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, title, body, data } = req.body as ISendNotificationRequest;

            if (!token || !title || !body) {
                throw new BadRequestError('Token, title, and body are required');
            }

            const response = await NotificationService.sendNotification(req.body as ISendNotificationRequest);

            return successResponse(res, response, 'Notification sent successfully', 200);
        } catch (error) {
            next(error);
        }
    }

    async updateFcmToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { fcmToken } = req.body as IUpdateFcmTokenRequest;
            if (!fcmToken) {
                throw new BadRequestError('FCM Token is required');
            }

            const userId = (req as any).user._id;
            await redisService.addToSet(userId, fcmToken);

            return successResponse(res, null, 'FCM Token updated successfully', 200);
        } catch (error) {
            next(error);
        }
    }
}

export const notificationController = new NotificationController();
