import dotenv from 'dotenv';
import path from 'path';

export const configService = () => {
    const env = process.env.NODE_ENV || 'development';
    const envPath = path.resolve(`src/config/.env.${env}`);
    
    dotenv.config({ path: envPath });

    return {
        port: process.env.PORT || 3000,
        nodeEnv: process.env.NODE_ENV,
        dbUrl: process.env.DB_URL,
        
        // Token Settings
        accessToken: {
            secret: process.env.ACCESS_TOKEN_SECRET || 'default_access_secret',
            expires: process.env.ACCESS_TOKEN_EXPIRES || '1h'
        },
        refreshToken: {
            secret: process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret',
            expires: process.env.REFRESH_TOKEN_EXPIRES || '7d'
        },
        revokeToken: {
            secret: process.env.REVOKE_TOKEN_SECRET || 'default_revoke_secret',
            expires: process.env.REVOKE_TOKEN_EXPIRES || '24h'
        },

        bcryptSalt: parseInt(process.env.BCRYPT_SALT || '10'),
        encryptionKey: process.env.ENCRYPTION_KEY || 'default_secret'
    };
};
