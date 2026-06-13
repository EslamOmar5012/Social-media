export interface ICreateGroupChatRequest {
    groupName: string;
    participants: string[];
}

export interface ICreateGroupChatByEmailsRequest {
    groupName: string;
    emails: string[];
}

export interface ICreateDirectChatRequest {
    recipientId: string;
}

export interface ISendMessageRequest {
    content: string;
}
