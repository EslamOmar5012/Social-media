import { Schema, model, type HydratedDocument, type Types } from "mongoose";
import { ChatType } from "../../common/index.js";

export interface IChat {
    createdBy: Types.ObjectId;
    participants: Types.ObjectId[];
    chatType: ChatType;
    groupName?: string;
    groupImage: string;
    roomID: string;
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export type HIChat = HydratedDocument<IChat>;

const chatSchema = new Schema<IChat>({
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator User ID is required']
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Participants are required']
    }],
    chatType: {
        type: String,
        enum: Object.values(ChatType),
        default: ChatType.GROUP,
        required: true
    },
    groupName: {
        type: String,
        trim: true,
        required: function(this: any) {
            return this.chatType === ChatType.GROUP;
        }
    },
    groupImage: {
        type: String,
        default: 'https://res.cloudinary.com/dqaq6ju4d/image/upload/v1700000000/default-group-avatar.png'
    },
    roomID: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    collection: "Social-Media-Chats",
    timestamps: true,
    versionKey: false
});

// Exclude soft-deleted chats by default
chatSchema.pre<any>(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete'], function (this: any) {
    if (this.getOptions().withDeleted) {
        return;
    }
    this.where({ deletedAt: null });
});

export const ChatModel = model<IChat>('Chat', chatSchema);
