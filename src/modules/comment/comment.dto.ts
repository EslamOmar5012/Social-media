export interface ICreateCommentRequest {
    content: string;
    postId: string;
    commentId?: string; // For replies
    tags?: string[];
}

export interface IUpdateCommentRequest {
    content?: string;
    tags?: string[];
}
