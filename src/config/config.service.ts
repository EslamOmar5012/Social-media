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
        redis: {
            username: process.env.REDIS_USERNAME || 'default',
            password: process.env.REDIS_PASSWORD,
            host: process.env.REDIS_HOST || '127.0.0.1',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        
        // Email Settings
        email: {
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || ''
        },
        
        // Token Settings
        accessToken: {
            secret: process.env.ACCESS_TOKEN_SECRET || 'default_access_secret',
            expires: process.env.ACCESS_TOKEN_EXPIRES || '1h'
        },
        refreshToken: {
            secret: process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret',
            expires: process.env.REFRESH_TOKEN_EXPIRES || '7d'
        },

        bcryptSalt: parseInt(process.env.BCRYPT_SALT || '10'),
        encryptionKey: process.env.ENCRYPTION_KEY || 'default_secret'
    };
};
