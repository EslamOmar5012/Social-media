export interface ICreateGroupChatRequest {
    groupName: string;
    participants: string[];
}

export interface ISendMessageRequest {
    content: string;
}
