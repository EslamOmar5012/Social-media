import { z } from 'zod';

export const sendNotificationSchema = {
    body: z.object({
        token: z.string().min(1, 'Token is required'),
        title: z.string().min(1, 'Title is required'),
        body: z.string().min(1, 'Body is required'),
        data: z.record(z.string(), z.string()).optional()
    })
};

export const updateFcmTokenSchema = {
    body: z.object({
        fcmToken: z.string().min(1, 'FCM Token is required')
    })
};
