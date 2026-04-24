import type { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { successResponse } from '../../common/index.js';
import type { ISignup, ILogin } from './auth.dto.js';

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
}


export const authController = new AuthController();
