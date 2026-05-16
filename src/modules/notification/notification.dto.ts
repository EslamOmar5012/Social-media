export interface ISendNotificationRequest {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
}

export interface IUpdateFcmTokenRequest {
    fcmToken: string;
}

export interface ISendNotificationResponse {
    message: string;
    response?: string;
}

export interface IUserNotificationsResponse {
    message: string;
    responses: string[];
}
