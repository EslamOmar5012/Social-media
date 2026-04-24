import { ConflictError, UnauthorizedError, hash, encrypt, decrypt, generateAuthTokens, compare } from '../../common/index.js';
import { userRepo } from '../../db/index.js';
import type { ISignup, ILogin } from './auth.dto.js';

export class AuthService {
    constructor() {}

    async signup(userData: any): Promise<ISignup> {
        // 1. Check if user already exists
        const userExists = await userRepo.checkUserExists(userData.email);
        if (userExists) {
            throw new ConflictError('User with this email already exists');
        }

        // 2. Hash password and encrypt phone
        if (userData.password) {
            userData.password = hash(userData.password);
        }
        if (userData.phone) {
            userData.phone = encrypt(userData.phone);
        }

        // 3. Prepare data (remove confirmPassword)
        const { confirmPassword, ...dataToSave } = userData;

        // 4. Create user
        const newUser = await userRepo.create(dataToSave);

        return { 
            message: 'User signed up successfully', 
            user: {
                id: newUser._id.toString(),
                username: newUser.username,
                email: newUser.email,
                phone: newUser.phone ? decrypt(newUser.phone) : undefined,
                role: newUser.role
            } 
        };
    }

    async login(credentials: any): Promise<ILogin> {
        const { email, password } = credentials;

        // 1. Find user
        const user = await userRepo.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // 2. Compare password
        const isMatch = compare(password, user.password || '');
        if (!isMatch) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // 3. Generate tokens
        const tokens = generateAuthTokens({
            userId: user._id as string,
            role: user.role
        });

        return { 
            message: 'User logged in successfully', 
            ...tokens 
        };
    }
}

export const authService = new AuthService();
