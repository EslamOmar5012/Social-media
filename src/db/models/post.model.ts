import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import { PostPrivacy } from "../../common/index.js";

export interface IPost {
    userId: Types.ObjectId;
    content?: string;
    attachments?: string[];
    likes?: Types.ObjectId[];
    tags?: Types.ObjectId[];
    privacy: PostPrivacy;
    deletedAt?: Date;
}

export type HIPost = HydratedDocument<IPost>;

const postSchema = new Schema<IPost>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    content: {
        type: String,
        trim: true,
        required: true,
    },
    attachments: [{
        type: String
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    privacy: {
        type: String,
        enum: Object.values(PostPrivacy),
        default: PostPrivacy.PUBLIC
    },
    deletedAt: {
        type: Date
    }
}, {
    collection: "Social-Media-Posts",
    timestamps: true,
    versionKey: false
});

export const PostModel = model<IPost>('Post', postSchema);
