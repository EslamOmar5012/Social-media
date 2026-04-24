import mongoose from 'mongoose';
import { envVars } from '../config/index.js';
import { User } from './models/user.model.js';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(envVars.dbUrl || '');
        console.log(`[database]: MongoDB Connected: ${conn.connection.host}`);
        
        // Sync Indexes
        await User.syncIndexes();
        console.log('[database]: User indexes synchronized');
    } catch (error: any) {
        console.error(`[database]: Error: ${error.message}`);
        process.exit(1);
    }
};
