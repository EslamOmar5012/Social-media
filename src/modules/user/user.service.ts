import fs from 'fs';
import path from 'path';
import { userRepo } from '../../db/index.js';
import { decrypt, NotFoundError } from '../../common/index.js';
import type { IMessageResponse, IProfileResponse } from './user.dto.js';
import cloudinary from '../../common/cloudinary/cloudinary.utils.js';

export class UserService {
    constructor() {}

    async getProfile(userId: string): Promise<IProfileResponse> {
        const user = await userRepo.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        return {
            message: 'User profile retrieved successfully',
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                phone: user.phone ? decrypt(user.phone) : undefined,
                age: user.age,
                gender: user.gender,
                role: user.role,
                isEmailConfirmed: user.isEmailConfirmed
            }
        };
    }

    async softDeleteUser(userId: string): Promise<IMessageResponse> {
        const user = await userRepo.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        await user.softDelete();

        return {
            message: 'User soft-deleted successfully'
        };
    }

    async hardDeleteUser(userId: string): Promise<IMessageResponse> {
        const user = await userRepo.findById(userId);
        if (!user) {
            throw new NotFoundError('User not found');
        }

        // 1. Delete Local Assets
        const localAssets = [user.profilePic, ...user.coverPics].filter(url => url && url.startsWith('uploads/'));
        for (const localPath of localAssets) {
            if (fs.existsSync(localPath!)) {
                fs.unlinkSync(localPath!);
            }
        }

        // 2. Delete Cloudinary Assets
        const folderPath = `social-media/users/${userId}`;
        try {
            // Delete all resources in the user's folder
            await cloudinary.api.delete_resources_by_prefix(folderPath);
            // Delete the empty subfolders and the main folder
            // Cloudinary doesn't have a "recursive delete folder" in one go for folders themselves, 
            // but we can try to delete the specific ones we know
            await cloudinary.api.delete_folder(`${folderPath}/profile`).catch(() => {});
            await cloudinary.api.delete_folder(`${folderPath}/covers`).catch(() => {});
            await cloudinary.api.delete_folder(folderPath).catch(() => {});
        } catch (error) {
            console.error(`Cloudinary cleanup failed for user ${userId}:`, error);
        }

        // 3. Delete user from DB
        await userRepo.findOneAndDelete({ _id: userId });

        return {
            message: 'User and all related assets hard-deleted successfully'
        };
    }

    async restoreUser(userId: string): Promise<IMessageResponse> {
        const user = await userRepo.findOne({ _id: userId }, { withDeleted: true });
        
        if (!user) {
            throw new NotFoundError('User not found');
        }

        if (user.deletedAt === null) {
            return { message: 'User is already active' };
        }

        await user.restore();

        return {
            message: 'User restored successfully'
        };
    }

    async updateProfilePic(userId: string, file: Express.Multer.File): Promise<IMessageResponse> {
        const user = await userRepo.findById(userId);
        if (!user) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            throw new NotFoundError('User not found');
        }

        const SIZE_THRESHOLD = 1 * 1024 * 1024; // 1MB

        try {
            if (file.size < SIZE_THRESHOLD) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: `social-media/users/${userId}/profile`
                });
                user.profilePic = result.secure_url;
                fs.unlinkSync(file.path);
            } else {
                user.profilePic = `${file.destination}/${file.filename}`;
            }

            await user.save();
            return { 
                message: file.size < SIZE_THRESHOLD ? 'Profile picture uploaded to Cloudinary' : 'Profile picture saved locally (large file)',
                data: {
                    url: user.profilePic,
                    storage: file.size < SIZE_THRESHOLD ? 'Cloudinary' : 'Local',
                    size: file.size,
                    mimetype: file.mimetype,
                    folder: file.size < SIZE_THRESHOLD ? `social-media/users/${userId}/profile` : 'uploads'
                }
            };
        } catch (error) {
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
            throw error;
        }
    }

    async updateCoverPics(userId: string, files: Express.Multer.File[]): Promise<IMessageResponse> {
        const user = await userRepo.findById(userId);
        if (!user) {
            files.forEach(f => { if (fs.existsSync(f.path)) fs.unlinkSync(f.path); });
            throw new NotFoundError('User not found');
        }

        const SIZE_THRESHOLD = 1 * 1024 * 1024; // 1MB
        const newUrls: string[] = [];
        const uploadDetails: any[] = [];

        try {
            for (const file of files) {
                const isSmall = file.size < SIZE_THRESHOLD;
                let url = '';
                let folder = '';

                if (isSmall) {
                    folder = `social-media/users/${userId}/covers`;
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder
                    });
                    url = result.secure_url;
                    fs.unlinkSync(file.path);
                } else {
                    folder = 'uploads';
                    url = `${file.destination}/${file.filename}`;
                }

                newUrls.push(url);
                uploadDetails.push({
                    url,
                    storage: isSmall ? 'Cloudinary' : 'Local',
                    size: file.size,
                    mimetype: file.mimetype,
                    folder
                });
            }

            user.coverPics.push(...newUrls);
            await user.save();

            return { 
                message: 'Cover pictures updated successfully',
                data: uploadDetails
            };
        } catch (error) {
            files.forEach(f => { if (fs.existsSync(f.path)) fs.unlinkSync(f.path); });
            throw error;
        }
    }

    async getDownloadInfo(userId: string, type: 'profile' | 'cover', index: number = 0): Promise<{ path: string, isLocal: boolean }> {
        const user = await userRepo.findById(userId);
        if (!user) throw new NotFoundError('User not found');

        let imageUrl = '';
        if (type === 'profile') {
            imageUrl = user.profilePic || '';
        } else {
            imageUrl = user.coverPics[index] || '';
        }

        if (!imageUrl) throw new NotFoundError(`${type} picture not found`);

        const isLocal = imageUrl.startsWith('uploads/');
        
        return {
            path: isLocal ? path.resolve(imageUrl) : imageUrl,
            isLocal
        };
    }

    async deleteImage(userId: string, type: 'profile' | 'cover', index: number = 0): Promise<IMessageResponse> {
        const user = await userRepo.findById(userId);
        if (!user) throw new NotFoundError('User not found');

        let imageUrl = '';
        if (type === 'profile') {
            imageUrl = user.profilePic || '';
        } else {
            imageUrl = user.coverPics[index] || '';
        }

        if (!imageUrl) throw new NotFoundError(`${type} picture not found`);

        const isLocal = imageUrl.startsWith('uploads/');

        if (isLocal) {
            // 1. Delete Local File
            if (fs.existsSync(imageUrl)) {
                fs.unlinkSync(imageUrl);
            }
        } else {
            // 2. Delete from Cloudinary
            // Extract public_id from URL: .../upload/v1234567/folder/id.jpg -> folder/id
            const parts = imageUrl.split('/');
            const uploadIndex = parts.indexOf('upload');
            if (uploadIndex !== -1) {
                // public_id is everything after /vXXXX/ excluding the extension
                const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
                const publicId = publicIdWithExt.split('.')[0];
                if (publicId) {
                    await cloudinary.uploader.destroy(publicId);
                }
            }
        }

        // 3. Update Database
        if (type === 'profile') {
            user.profilePic = undefined;
        } else {
            user.coverPics.splice(index, 1);
        }

        await user.save();

        return { message: `${type} picture deleted successfully` };
    }
}

export const userService = new UserService();
