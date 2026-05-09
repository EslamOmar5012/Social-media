import { ConflictError, UnauthorizedError, hash, encrypt, decrypt, generateAuthTokens, compare, EmailType } from '../../common/index.js';
import { sendOtpEmail } from '../../common/email/index.js';
import { userRepo, redisService } from '../../db/index.js';
import type { ISignup, ILogin, IConfirmEmail, IConfirmEmailRequest, IResendConfirmEmail, IResendConfirmEmailRequest, IForgotPassword, IForgotPasswordRequest, IResetPassword, IResetPasswordRequest, ILogoutRequest } from './auth.dto.js';

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
        dataToSave.expireAt = new Date(Date.now() + 5 * 60 * 1000); // Set TTL to 5 minutes

        // 4. Create user
        const newUser = await userRepo.create(dataToSave);

        // 5. Send OTP
        await sendOtpEmail(newUser.email, EmailType.CONFIRM_EMAIL);

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

        // 1. Find user (include deleted to check status)
        const user = await userRepo.findOne({ email }, { withDeleted: true });
        
        if (!user) {
            throw new UnauthorizedError('Invalid email or password');
        }

        // Check if account is soft-deleted
        if (user.deletedAt) {
            throw new UnauthorizedError('Your account has been soft-deleted. Please contact support to restore it.');
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

    async confirmEmail(data: IConfirmEmailRequest): Promise<IConfirmEmail> {
        const { email, otp } = data;
        const otpKey = redisService.getOtpKey(email, EmailType.CONFIRM_EMAIL);
        const storedOtp = await redisService.get(otpKey);

        if (!storedOtp || storedOtp !== otp) {
            throw new UnauthorizedError('Invalid or expired OTP');
        }

        const user = await userRepo.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        if (user.isEmailConfirmed) {
            throw new ConflictError('Email is already confirmed');
        }

        await userRepo.findOneAndUpdate({ _id: user._id }, { isEmailConfirmed: true, $unset: { expireAt: 1 } });
        
        // Remove OTP from Redis
        await redisService.remove(otpKey);

        return { message: 'Email confirmed successfully' };
    }

    async resendConfirmEmail(data: IResendConfirmEmailRequest): Promise<IResendConfirmEmail> {
        const { email } = data;

        const user = await userRepo.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        if (user.isEmailConfirmed) {
            throw new ConflictError('Email is already confirmed');
        }

        await sendOtpEmail(user.email, EmailType.CONFIRM_EMAIL);

        await userRepo.findOneAndUpdate(
            { _id: user._id },
            { expireAt: new Date(Date.now() + 5 * 60 * 1000) }
        );

        return { message: 'Confirmation OTP resent successfully' };
    }

    async forgotPassword(data: IForgotPasswordRequest): Promise<IForgotPassword> {
        const { email } = data;

        const user = await userRepo.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        await sendOtpEmail(user.email, EmailType.FORGOT_PASSWORD);

        // Revoke all existing tokens immediately when forgot password is requested
        await userRepo.findOneAndUpdate(
            { _id: user._id },
            { changeCredentialTime: new Date() }
        );

        return { message: 'Password reset OTP sent successfully' };
    }

    async resetPassword(data: IResetPasswordRequest): Promise<IResetPassword> {
        const { email, otp, newPassword } = data;

        const otpKey = redisService.getOtpKey(email, EmailType.FORGOT_PASSWORD);
        const storedOtp = await redisService.get(otpKey);

        if (!storedOtp || storedOtp !== otp) {
            throw new UnauthorizedError('Invalid or expired OTP');
        }

        const user = await userRepo.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        const hashedPassword = hash(newPassword);
        await userRepo.findOneAndUpdate(
            { _id: user._id },
            { 
                password: hashedPassword,
                changeCredentialTime: new Date()
            }
        );

        await redisService.remove(otpKey);

        return { message: 'Password reset successfully' };
    }

    async logout(data: ILogoutRequest): Promise<any> {
        const { email } = data;
        const user = await userRepo.findByEmail(email);
        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        await userRepo.findOneAndUpdate(
            { _id: user._id },
            { changeCredentialTime: new Date() }
        );
        return { message: 'Logged out successfully' };
    }
}

export const authService = new AuthService();
