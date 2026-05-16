import fs from 'fs';
import { commentRepo, postRepo, userRepo } from '../../db/index.js';
import { NotFoundError, UnauthorizedError } from '../../common/index.js';
import type { ICreateCommentRequest, IUpdateCommentRequest } from './comment.dto.js';
import { Types } from 'mongoose';
import cloudinary from '../../common/cloudinary/cloudinary.utils.js';
import { NotificationService } from '../notification/notification.service.js';

export class CommentService {
    async createComment(userId: string, commentData: ICreateCommentRequest, files?: Express.Multer.File[]) {
        const SIZE_THRESHOLD = 1 * 1024 * 1024; // 1MB
        const attachments: string[] = [];

        // Verify post exists
        const post = await postRepo.findById(commentData.postId);
        if (!post || post.deletedAt) {
            throw new NotFoundError('Post not found');
        }

        // If it's a reply, verify parent comment exists
        if (commentData.commentId) {
            const parentComment = await commentRepo.findById(commentData.commentId);
            if (!parentComment || parentComment.deletedAt) {
                throw new NotFoundError('Parent comment not found');
            }
        }

        try {
            if (files && files.length > 0) {
                for (const file of files) {
                    if (file.size < SIZE_THRESHOLD) {
                        const result = await cloudinary.uploader.upload(file.path, {
                            folder: `social-media/posts/${commentData.postId}/comments/${userId}/attachments`
                        });
                        attachments.push(result.secure_url);
                        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                    } else {
                        attachments.push(`${file.destination}/${file.filename}`);
                    }
                }
            }

            const data: any = {
                createdBy: new Types.ObjectId(userId),
                content: commentData.content,
                postId: new Types.ObjectId(commentData.postId),
                attachments
            };

            if (commentData.commentId) {
                data.commentId = new Types.ObjectId(commentData.commentId);
            }

            if (commentData.tags) {
                data.tags = commentData.tags.map(tagId => new Types.ObjectId(tagId));
            }

            const comment = await commentRepo.create(data);

            // Handle Notifications
            this.handleCommentNotifications(userId, commentData, comment._id.toString(), post.userId.toString());

            return comment;
        } catch (error) {
            if (files) {
                files.forEach(file => {
                    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
                });
            }
            throw error;
        }
    }

    private async handleCommentNotifications(creatorId: string, commentData: ICreateCommentRequest, commentId: string, postAuthorId: string) {
        try {
            const creator = await userRepo.findById(creatorId);
            const creatorName = creator?.username || 'Someone';

            // 1. Notify Post Author (if not the one commenting)
            if (creatorId !== postAuthorId) {
                await NotificationService.sendToUser(
                    postAuthorId,
                    'New Comment',
                    `${creatorName} commented on your post.`,
                    { postId: commentData.postId, commentId, type: 'comment' }
                );
            }

            // 2. Notify tagged users
            if (commentData.tags && commentData.tags.length > 0) {
                await Promise.all(
                    commentData.tags.map(tagId => 
                        NotificationService.sendToUser(
                            tagId,
                            'Tagged in Comment',
                            `${creatorName} tagged you in a comment.`,
                            { postId: commentData.postId, commentId, type: 'comment_tag' }
                        )
                    )
                );
            }
        } catch (error) {
            console.error('Failed to send comment notifications:', error);
        }
    }

    async getCommentsByPost(postId: string, page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;
        const query = { postId: new Types.ObjectId(postId), deletedAt: null };

        const [comments, total] = await Promise.all([
            commentRepo.findAll(query, { skip, limit, sort: { createdAt: -1 } }),
            commentRepo.countDocuments(query)
        ]);

        return {
            comments,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    }

    async getCommentById(commentId: string) {
        const comment = await commentRepo.findById(commentId);
        if (!comment || comment.deletedAt) {
            throw new NotFoundError('Comment not found');
        }
        return comment;
    }

    async updateComment(commentId: string, userId: string, updateData: IUpdateCommentRequest) {
        const comment = await commentRepo.findById(commentId);
        if (!comment || comment.deletedAt) {
            throw new NotFoundError('Comment not found');
        }

        if (comment.createdBy.toString() !== userId.toString()) {
            throw new UnauthorizedError('You are not authorized to update this comment');
        }

        const data: any = { ...updateData };
        if (updateData.tags) {
            data.tags = updateData.tags.map(tagId => new Types.ObjectId(tagId));
        }

        return await commentRepo.findOneAndUpdate({ _id: new Types.ObjectId(commentId) }, data);
    }

    async deleteComment(commentId: string, userId: string) {
        const comment = await commentRepo.findById(commentId);
        if (!comment || comment.deletedAt) {
            throw new NotFoundError('Comment not found');
        }

        // Only creator or post owner can delete comment
        const post = await postRepo.findById(comment.postId.toString());
        const isPostOwner = post?.userId.toString() === userId.toString();
        const isCommentCreator = comment.createdBy.toString() === userId.toString();

        if (!isPostOwner && !isCommentCreator) {
            throw new UnauthorizedError('You are not authorized to delete this comment');
        }

        return await commentRepo.findOneAndUpdate({ _id: new Types.ObjectId(commentId) }, { deletedAt: new Date() });
    }

    async likeComment(commentId: string, userId: string) {
        const comment = await commentRepo.findById(commentId);
        if (!comment || comment.deletedAt) {
            throw new NotFoundError('Comment not found');
        }

        const userIdObj = new Types.ObjectId(userId);
        const isLiked = comment.likes?.some((id: Types.ObjectId) => id.equals(userIdObj));

        const update = isLiked 
            ? { $pull: { likes: userIdObj } }
            : { $addToSet: { likes: userIdObj } };

        return await commentRepo.findOneAndUpdate({ _id: new Types.ObjectId(commentId) }, update);
    }
}

export const commentService = new CommentService();
