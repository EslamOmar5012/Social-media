import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export interface IComment {
    content: string;
    attachments?: string[];
    likes?: Types.ObjectId[];
    tags?: Types.ObjectId[];
    postId: Types.ObjectId;
    commentId?: Types.ObjectId;
    createdBy: Types.ObjectId;
    deletedAt?: Date;
}

export type HIComment = HydratedDocument<IComment>;

const commentSchema = new Schema<IComment>({
    content: {
        type: String,
        trim: true,
        required: [true, 'Comment content is required']
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
    postId: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: [true, 'Post ID is required']
    },
    commentId: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator ID is required']
    },
    deletedAt: {
        type: Date
    }
}, {
    collection: 'Social-Media-Comments',
    timestamps: true,
    versionKey: false
});

export const CommentModel = model<IComment>('Comment', commentSchema);
