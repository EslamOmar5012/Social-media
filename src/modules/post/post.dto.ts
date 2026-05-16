import { PostPrivacy } from "../../common/index.js";

export interface ICreatePostRequest {
    content: string;
    privacy?: PostPrivacy;
    tags?: string[];
}

export interface IUpdatePostRequest {
    content?: string;
    privacy?: PostPrivacy;
    tags?: string[];
}

export interface IPostResponse {
    id: string;
    userId: string;
    content: string;
    attachments: string[];
    likes: string[];
    tags: string[];
    privacy: PostPrivacy;
    createdAt: Date;
    updatedAt: Date;
}
