import type { IUser } from '../../db/models/user.model.js';

export interface IProfileResponse {
    message: string;
    user: {
        id: string;
        username: string;
        email: string;
        phone?: string | undefined;
        age?: number | undefined;
        gender?: string | undefined;
        role: string;
        isEmailConfirmed: boolean;
    };
}
