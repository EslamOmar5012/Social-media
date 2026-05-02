import { userRepo } from '../../db/index.js';
import { decrypt, NotFoundError } from '../../common/index.js';
import type { IProfileResponse } from './user.dto.js';

export class UserService {
    constructor() {}

    async getProfile(userId: string): Promise<IProfileResponse> {
        const user = await userRepo.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        return {
            message: 'User profile retrieved successfully',
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                phone: user.phone ? decrypt(user.phone) : undefined,
                age: user.age,
                gender: user.gender,
                role: user.role,
                isEmailConfirmed: user.isEmailConfirmed
            }
        };
    }
}

export const userService = new UserService();
