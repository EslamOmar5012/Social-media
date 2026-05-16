import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export interface IStory {
    userId: Types.ObjectId;
    content?: string;
    media: string; // URL to image/video
    viewers?: Types.ObjectId[];
    createdAt: Date;
}

export type HIStory = HydratedDocument<IStory>;

const storySchema = new Schema<IStory>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    content: {
        type: String,
        trim: true
    },
    media: {
        type: String,
        required: [true, 'Media is required for a story']
    },
    viewers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 24 hours in seconds (Automatically vanishes)
    }
}, {
    collection: "Social-Media-Stories",
    versionKey: false
});

export const StoryModel = model<IStory>('Story', storySchema);
