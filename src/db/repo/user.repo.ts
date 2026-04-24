import { User, type IUser } from '../models/user.model.js';
import { DBRepo } from './db.repo.js';

/**
 * User Repository
 * Extends the generic DBRepo to provide specialized operations for the User model.
 */
export class UserRepo extends DBRepo<IUser> {
    constructor() {
        super(User);
    }

    // You can add user-specific repository methods here
    async findByEmail(email: string) {
        return await this.findOne({ email });
    }

    async checkUserExists(email: string) {
        return await this.exists({ email });
    }
}

export const userRepo = new UserRepo();
