import mongoose, { Schema, type Document } from 'mongoose';
import { Role, Provider, Gender } from '../../common/index.js';

export interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    phone: string;
    age: number;
    profilePic: string;
    coverPics: string[];
    role: Role;
    provider: Provider;
    gender: Gender;
    isEmailConfirmed: boolean;
    expireAt?: Date;
    changeCredentialTime: Date;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    softDelete(): Promise<IUser>;
    restore(): Promise<IUser>;
}

const userSchema = new Schema<IUser>({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: [3, 'Username must be at least 3 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: function() { return this.provider === Provider.SYSTEM; }
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    age: {
        type: Number,
        min: [13, 'Age must be at least 13'],
        max: [100, 'Age must be at most 100']
    },
    profilePic: {
        type: String,
        default: ''
    },
    coverPics: {
        type: [String],
        default: []
    },
    role: {
        type: String,
        enum: Object.values(Role),
        default: Role.USER
    },
    provider: {
        type: String,
        enum: Object.values(Provider),
        default: Provider.SYSTEM
    },
    gender: {
        type: String,
        enum: Object.values(Gender),
        default: Gender.MALE
    },
    isEmailConfirmed: {
        type: Boolean,
        default: false
    },
    expireAt: {
        type: Date,
        index: { expires: 0 }
    },
    changeCredentialTime: {
        type: Date
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    collection: "SocialMedia Users",
    strict: true,
    strictQuery: true,
});

// Query Middleware to exclude deleted users (Paranoid style)
userSchema.pre<mongoose.Query<IUser, IUser>>(['find', 'findOne', 'findOneAndUpdate', 'findOneAndDelete'], function (this: mongoose.Query<IUser, IUser>) {
    if (this.getOptions().withDeleted) {
        return;
    }
    this.where({ deletedAt: null });
});

// Instance method for soft delete
userSchema.methods.softDelete = function (this: IUser) {
    this.deletedAt = new Date();
    return this.save();
};

// Instance method to restore a soft-deleted user
userSchema.methods.restore = function (this: IUser) {
    this.deletedAt = null;
    return this.save();
};

export const User = mongoose.model<IUser>('User', userSchema);
