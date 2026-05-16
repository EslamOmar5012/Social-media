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
        encryptionKey: process.env.ENCRYPTION_KEY || 'default_secret',
        
        // Cloudinary Settings
        cloudinary: {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
            apiKey: process.env.CLOUDINARY_API_KEY || '',
            apiSecret: process.env.CLOUDINARY_API_SECRET || ''
        },

    }
};  

//FE configrations

// const firebaseConfig = {
//   apiKey: "AIzaSyB-MpIinkXayArSLCnAN47qnkhVK_lxFuw",
//   authDomain: "social-media-app-41d4a.firebaseapp.com",
//   projectId: "social-media-app-41d4a",
//   storageBucket: "social-media-app-41d4a.firebasestorage.app",
//   messagingSenderId: "550159446576",
//   appId: "1:550159446576:web:4f9d8acb8fa84ee87433f5",
//   measurementId: "G-8G64J06PGW"
// };

//key -> BA93vVr8dvODRjc3knK0Pzfh6n7aOWqfd-OgcFWjwBW-tIbe0k89l6s7lAP6f1_NudRch-FXwvWme6Uv1jDOO5U


//be config
// var admin = require("firebase-admin");

// var serviceAccount = require("path/to/serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

