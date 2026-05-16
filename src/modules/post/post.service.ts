import fs from 'fs';
import { postRepo, userRepo } from '../../db/index.js';
import { NotFoundError, UnauthorizedError, PostPrivacy } from '../../common/index.js';
import type { ICreatePostRequest, IUpdatePostRequest } from './post.dto.js';
import { Types } from 'mongoose';
import cloudinary from '../../common/cloudinary/cloudinary.utils.js';
import { NotificationService } from '../notification/notification.service.js';

export class PostService {
    async createPost(userId: string, postData: ICreatePostRequest, files?: Express.Multer.File[]) {
        const SIZE_THRESHOLD = 1 * 1024 * 1024; // 1MB
        const attachments: string[] = [];

        try {
            if (files && files.length > 0) {
                for (const file of files) {
                    if (file.size < SIZE_THRESHOLD) {
                        const result = await cloudinary.uploader.upload(file.path, {
                            folder: `social-media/posts/${userId}/attachments`
                        });
                        attachments.push(result.secure_url);
                        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                    } else {
                        attachments.push(`${file.destination}/${file.filename}`);
                    }
                }
            }

            const data: any = {
                userId: new Types.ObjectId(userId),
                content: postData.content,
                privacy: postData.privacy,
                attachments
            };

            if (postData.tags) {
                data.tags = postData.tags.map(tagId => new Types.ObjectId(tagId));
            }

            const post = await postRepo.create(data);

            // Handle Notifications
            this.handlePostNotifications(userId, postData.tags || [], post._id.toString());

            return post;
        } catch (error) {
            // Cleanup any uploaded files on error
            if (files) {
                files.forEach(file => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
            }
            throw error;
        }
    }

    private async handlePostNotifications(authorId: string, taggedUserIds: string[], postId: string) {
        try {
            const author = await userRepo.findById(authorId);
            const authorName = author?.username || 'Someone';

            // 1. Notify tagged users
            if (taggedUserIds.length > 0) {
                const tagTitle = 'New Tag!';
                const tagBody = `${authorName} tagged you in a new post.`;
                const tagData = { postId, type: 'tag' };

                await Promise.all(
                    taggedUserIds.map(userId => 
                        NotificationService.sendToUser(userId, tagTitle, tagBody, tagData)
                    )
                );
            }

            // 2. Notify author about success (Optional but good for UX)
            await NotificationService.sendToUser(
                authorId,
                'Post Uploaded',
                'Your post has been successfully uploaded!',
                { postId, type: 'post_success' }
            );
        } catch (error) {
            console.error('Failed to send post notifications:', error);
            // We don't throw here to avoid failing the post creation request
        }
    }

    async getAllPosts(authenticatedUserId: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        
        // Privacy Filter:
        // 1. All Public posts
        // 2. The user's own posts (even if private)
        const query = {
            deletedAt: null,
            $or: [
                { privacy: PostPrivacy.PUBLIC },
                { userId: new Types.ObjectId(authenticatedUserId) }
            ]
        };

        const [posts, total] = await Promise.all([
            postRepo.findAll(query, { skip, limit, sort: { createdAt: -1 } }),
            postRepo.countDocuments(query)
        ]);

        return {
            posts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getPostById(postId: string) {
        const post = await postRepo.findOne({ _id: new Types.ObjectId(postId), deletedAt: null });
        if (!post) {
            throw new NotFoundError('Post not found');
        }
        return post;
    }

    async updatePost(postId: string, userId: string, updateData: IUpdatePostRequest) {
        const post = await this.getPostById(postId);
        
        if (post.userId.toString() !== userId.toString()) {
            throw new UnauthorizedError('You are not authorized to update this post');
        }

        const data: any = { ...updateData };
        if (updateData.tags) {
            data.tags = updateData.tags.map(tagId => new Types.ObjectId(tagId));
        }

        const updatedPost = await postRepo.findOneAndUpdate({ _id: new Types.ObjectId(postId) }, data);

        // Handle Notifications
        this.handlePostUpdateNotifications(userId, updateData.tags || [], postId);

        return updatedPost;
    }

    private async handlePostUpdateNotifications(authorId: string, taggedUserIds: string[], postId: string) {
        try {
            // 1. Notify author about success
            await NotificationService.sendToUser(
                authorId,
                'Post Updated',
                'Your post has been successfully updated!',
                { postId, type: 'post_update_success' }
            );

            // 2. Notify tagged users (Optional: only if you want to re-notify or notify new ones)
            // For now, just notifying the author as requested.
        } catch (error) {
            console.error('Failed to send post update notifications:', error);
        }
    }

    async deletePost(postId: string, userId: string) {
        const post = await this.getPostById(postId);
        
        if (post.userId.toString() !== userId.toString()) {
            throw new UnauthorizedError('You are not authorized to delete this post');
        }

        return await postRepo.findOneAndUpdate({ _id: new Types.ObjectId(postId) }, { deletedAt: new Date() });
    }

    async likePost(postId: string, userId: string) {
        const post = await this.getPostById(postId);
        const userIdObj = new Types.ObjectId(userId);

        const isLiked = post.likes?.some((id: Types.ObjectId) => id.equals(userIdObj));
        
        const update = isLiked 
            ? { $pull: { likes: userIdObj } }
            : { $addToSet: { likes: userIdObj } };

        return await postRepo.findOneAndUpdate({ _id: new Types.ObjectId(postId) }, update);
    }
}

export const postService = new PostService();
