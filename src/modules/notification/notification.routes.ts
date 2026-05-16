import { Router } from 'express';
import { notificationController } from './notification.controller.js';
import { authentication } from '../../middleware/auth.middleware.js';
import { validation } from '../../middleware/index.js';
import { sendNotificationSchema, updateFcmTokenSchema } from './notification.validation.js';

const notificationRouter = Router();

notificationRouter.post('/send-notification', validation(sendNotificationSchema), notificationController.sendNotification.bind(notificationController));
notificationRouter.patch('/token', authentication(), validation(updateFcmTokenSchema), notificationController.updateFcmToken.bind(notificationController));

export default notificationRouter;
