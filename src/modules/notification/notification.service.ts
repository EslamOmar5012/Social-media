import admin from '../../config/firebase.config.js';
import { redisService } from '../../db/index.js';
import type { ISendNotificationRequest } from './notification.dto.js';

export class NotificationService {
    static async sendNotification(notificationData: ISendNotificationRequest) {
        try {
            const { token, title, body, data } = notificationData;
            const message = {
                notification: {
                    title,
                    body,
                },
                token,
                data: data || {},
            };

            const response = await admin.messaging().send(message);
            console.log('Successfully sent message:', response);
            return response;
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    static async sendToUser(userId: string, title: string, body: string, data?: any) {
        try {
            const tokens = await redisService.getSetMembers(userId);
            
            if (!tokens || tokens.length === 0) {
                console.log(`No FCM tokens found for user ${userId}`);
                return [];
            }

            const results = await Promise.allSettled(
                tokens.map(token => this.sendNotification({ token, title, body, data }))
            );

            const successfulResponses: string[] = [];
            
            for (const [i, result] of results.entries()) {
                const currentToken = tokens[i];
                if (!currentToken) continue;

                if (result.status === 'fulfilled') {
                    successfulResponses.push(result.value);
                } else {
                    const error = result.reason as any;
                    console.error(`Failed to send notification to token ${currentToken}:`, error);
                    
                    // If the error indicates an invalid/expired token, remove it from Redis
                    if (error && (error.code === 'messaging/registration-token-not-registered' || 
                        error.code === 'messaging/invalid-registration-token')) {
                        console.log(`Removing invalid token ${currentToken} for user ${userId}`);
                        await redisService.removeFromSet(userId, currentToken);
                    }
                }
            }

            return successfulResponses;
        } catch (error) {
            console.error(`Error sending notification to user ${userId}:`, error);
            throw error;
        }
    }
}
