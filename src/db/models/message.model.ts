import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export interface IMessage {
    chatId: Types.ObjectId;
    sender: Types.ObjectId;
    content: string;
    attachmentUrl?: string;
    readBy: Types.ObjectId[];
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export type HIMessage = HydratedDocument<IMessage>;

const messageSchema = new Schema<IMessage>({
    chatId: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: [true, 'Chat ID is required'],
        index: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Sender is required']
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        maxlength: [5000, 'Message cannot exceed 5000 characters']
    },
    attachmentUrl: {
        type: String,
        default: null
    },
    readBy: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    collection: 'Social-Media-Messages',
    timestamps: true,
    versionKey: false
});

// Compound index for efficient history queries (by chat, sorted by time)
messageSchema.index({ chatId: 1, createdAt: 1 });

// Exclude soft-deleted messages by default
messageSchema.pre<any>(['find', 'findOne', 'findOneAndUpdate'], function (this: any) {
    if (this.getOptions().withDeleted) return;
    this.where({ deletedAt: null });
});

export const MessageModel = model<IMessage>('Message', messageSchema);
