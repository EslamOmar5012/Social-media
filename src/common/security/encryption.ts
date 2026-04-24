import CryptoJS from 'crypto-js';
import { envVars } from '../../config/index.js';

/**
 * Encrypt a plain text string using AES.
 */
export const encrypt = (plainText: string): string => {
    return CryptoJS.AES.encrypt(plainText, envVars.encryptionKey).toString();
};

/**
 * Decrypt an AES encrypted string.
 */
export const decrypt = (cipherText: string): string => {
    const bytes = CryptoJS.AES.decrypt(cipherText, envVars.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
};
