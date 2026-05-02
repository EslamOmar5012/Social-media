import jwt from 'jsonwebtoken';
import { envVars } from '../../config/index.js';

export interface TokenPayload {
    userId: string;
    role: string;
}

/**
 * Generate Access Token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, envVars.accessToken.secret, { 
        expiresIn: envVars.accessToken.expires as any
    });
};

/**
 * Generate Refresh Token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, envVars.refreshToken.secret, { 
        expiresIn: envVars.refreshToken.expires as any
    });
};

/**
 * Generate Access and Refresh Tokens for Login
 */
export const generateAuthTokens = (payload: TokenPayload) => {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload)
    };
};



/**
 * Verify Token
 */
export const verifyToken = (token: string, secret: string): any => {
    try {
        return jwt.verify(token, secret);
    } catch (error) {
        return null;
    }
};
