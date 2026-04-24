import { type Request, type Response, type NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../common/index.js';
import { verifyToken } from '../common/security/token.js';
import { envVars } from '../config/index.js';
import { User } from '../db/index.js';

type TokenKey = 'accessToken' | 'refreshToken' | 'revokeToken';

/**
 * Authentication Middleware (General)
 * Verifies different types of JWT tokens and attaches the user to the request.
 * @param tokenKey - The key in envVars representing the token type to verify.
 */
export const authentication = (tokenKey: TokenKey = 'accessToken') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return next(new UnauthorizedError('Please authenticate'));
            }

            const token = authHeader.split(' ')[1]!;
            const secret = (envVars as any)[tokenKey].secret;
            const decoded = verifyToken(token, secret);

            if (!decoded || !decoded.userId) {
                return next(new UnauthorizedError(`Invalid ${tokenKey.replace('Token', '')} token`));
            }

            const user = await User.findById(decoded.userId);
            if (!user) {
                return next(new UnauthorizedError('User not found'));
            }

            // Check if credentials changed after token issuance
            if (user.changeCredentialTime) {
                const tokenIssuedAt = (decoded as any).iat * 1000;
                if (user.changeCredentialTime.getTime() > tokenIssuedAt) {
                    return next(new UnauthorizedError('Credentials changed, please login again'));
                }
            }

            // Attach user to request
            (req as any).user = user;
            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Authorization Middleware
 * Checks if the authenticated user has one of the required roles.
 */
export const authorization = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;
        
        if (!user || !roles.includes(user.role)) {
            return next(new ForbiddenError('You do not have permission to perform this action'));
        }
        
        next();
    };
};
