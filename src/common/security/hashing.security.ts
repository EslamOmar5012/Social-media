import bcrypt from 'bcryptjs';
import { envVars } from '../../config/index.js';

/**
 * Hash a plain text string using bcrypt.
 */
export const hash = (plainText: string): string => {
    return bcrypt.hashSync(plainText, envVars.bcryptSalt);
};

/**
 * Compare a plain text string with a hash.
 */
export const compare = (plainText: string, hashedText: string): boolean => {
    return bcrypt.compareSync(plainText, hashedText);
};
