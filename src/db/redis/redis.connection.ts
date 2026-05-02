import { createClient, type RedisClientType } from 'redis';
import { envVars } from '../../config/index.js';

export const redisClient: RedisClientType = createClient({
    username: envVars.redis.username,
    ...(envVars.redis.password && { password: envVars.redis.password }),
    socket: {
        host: envVars.redis.host,
        port: envVars.redis.port
    }
});

redisClient.on('error', (err) => console.error('[redis]: Redis Client Error', err));
redisClient.on('connect', () => console.log('[redis]: Redis Connected'));

export const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error: any) {
        console.error(`[redis]: Error: ${error.message}`);
        process.exit(1);
    }
};
