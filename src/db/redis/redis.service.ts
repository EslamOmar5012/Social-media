import { redisClient } from './redis.connection.js';
import { EmailType } from '../../common/index.js';

class RedisService {
    // --- Key Generators ---
    public getBlacklistTokenKey(userId: string, tokenId: string): string {
        return `blacklist:${userId}:token:${tokenId}`;
    }

    public getOtpKey(email: string, emailType: EmailType | string): string {
        return `otp:${emailType}:${email}`;
    }

    public getOtpReqNoKey(email: string, emailType: EmailType | string): string {
        return `otp:reqNo:${emailType}:${email}`;
    }

    public getOtpBlockedKey(email: string, emailType: EmailType | string): string {
        return `otp:blocked:${emailType}:${email}`;
    }

    // --- Core Redis Operations ---
    public async set(key: string, value: string, expireInSeconds?: number | null) {
        if (expireInSeconds) {
            return await redisClient.set(key, value, {
                EX: expireInSeconds
            });
        }
        return await redisClient.set(key, value);
    }

    public async get(key: string): Promise<string | null> {
        return await redisClient.get(key);
    }

    public async mget(keys: string[]): Promise<(string | null)[]> {
        return await redisClient.mGet(keys);
    }

    public async update(key: string, value: string, expireInSeconds?: number | null) {
        return await this.set(key, value, expireInSeconds);
    }

    public async del(key: string) {
        return await redisClient.del(key);
    }

    public async remove(key: string) {
        return await this.del(key);
    }

    public async incr(key: string) {
        return await redisClient.incr(key);
    }

    public async decr(key: string) {
        return await redisClient.decr(key);
    }

    public async hset(key: string, field: string, value: string) {
        return await redisClient.hSet(key, field, value);
    }

    public async exists(key: string): Promise<number> {
        return await redisClient.exists(key);
    }

    public async expire(key: string, seconds: number) {
        return await redisClient.expire(key, seconds);
    }

    public async setExpire(key: string, seconds: number) {
        return await this.expire(key, seconds);
    }

    public async removeExpire(key: string) {
        return await redisClient.persist(key);
    }

    public async ttl(key: string): Promise<number> {
        return await redisClient.ttl(key);
    }
}

export const redisService = new RedisService();
