import mongoose, { Schema, type Document } from 'mongoose';

export enum Role {
    USER = 'user',
    ADMIN = 'admin'
}

export enum Provider {
    SYSTEM = 'system',
    GOOGLE = 'google',
    FACEBOOK = 'facebook'
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female'
}

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
    changeCredentialTime: Date;
    createdAt: Date;
    updatedAt: Date;
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
    changeCredentialTime: {
        type: Date
    }
}, {
    timestamps: true,
    collection: "SocialMedia Users",
    strict: true,
    strictQuery: true,
});

export const User = mongoose.model<IUser>('User', userSchema);
