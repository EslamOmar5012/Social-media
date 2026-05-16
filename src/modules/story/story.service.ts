import fs from 'fs';
import { storyRepo } from '../../db/index.js';
import { NotFoundError } from '../../common/index.js';
import { Types } from 'mongoose';
import cloudinary from '../../common/cloudinary/cloudinary.utils.js';

export class StoryService {
    async createStory(userId: string, content?: string, file?: Express.Multer.File) {
        if (!file) throw new Error('Media file is required for a story');

        const SIZE_THRESHOLD = 1 * 1024 * 1024; // 1MB
        let mediaUrl = '';

        try {
            if (file.size < SIZE_THRESHOLD) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: `social-media/stories/${userId}`,
                    resource_type: 'auto' // Supports both image and video
                });
                mediaUrl = result.secure_url;
                if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            } else {
                mediaUrl = `${file.destination}/${file.filename}`;
            }

            const data: any = {
                userId: new Types.ObjectId(userId),
                media: mediaUrl
            };

            if (content) {
                data.content = content;
            }

            const story = await storyRepo.create(data);

            return story;
        } catch (error) {
            if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            throw error;
        }
    }

    async getActiveStories() {
        // Since MongoDB handles the TTL, we just return everything that hasn't expired yet
        return await storyRepo.findAll({}, { sort: { createdAt: -1 } });
    }

    async addViewer(storyId: string, userId: string) {
        const story = await storyRepo.findById(storyId);
        if (!story) throw new NotFoundError('Story not found or expired');

        return await storyRepo.findOneAndUpdate(
            { _id: new Types.ObjectId(storyId) },
            { $addToSet: { viewers: new Types.ObjectId(userId) } }
        );
    }
}

export const storyService = new StoryService();
