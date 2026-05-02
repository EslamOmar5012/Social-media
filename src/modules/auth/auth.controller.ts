import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { successResponse, UnauthorizedError } from '../../common/index.js';
import type { ISignup, ILogin, IConfirmEmail, IResendConfirmEmail, IForgotPassword, IResetPassword } from './auth.dto.js';

export class AuthController {
    constructor() {}

    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.signup(req.body);
            return successResponse<ISignup>(res, result, result.message, 201);
        } catch (error: any) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.login(req.body);
            return successResponse<ILogin>(res, result, result.message, 200);
        } catch (error: any) {
            next(error);
        }
    }

    async confirmEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.confirmEmail(req.body);
            return successResponse<IConfirmEmail>(res, result, result.message, 200);
        } catch (error: any) {
            next(error);
        }
    }

    async resendConfirmEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.resendConfirmEmail(req.body);
            return successResponse<IResendConfirmEmail>(res, result, result.message, 200);
        } catch (error: any) {
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.forgotPassword(req.body);
            return successResponse<IForgotPassword>(res, result, result.message, 200);
        } catch (error: any) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await authService.resetPassword(req.body);
            return successResponse<IResetPassword>(res, result, result.message, 200);
        } catch (error: any) {
            next(error);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if ((req as any).user.email !== email) {
                throw new UnauthorizedError('You can only logout your own account');
            }
            const result = await authService.logout(req.body);
            return successResponse(res, result, result.message, 200);
        } catch (error: any) {
            next(error);
        }
    }
}


export const authController = new AuthController();
