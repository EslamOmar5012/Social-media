import { v2 as cloudinary } from 'cloudinary';
import { envVars } from '../../config/index.js';

cloudinary.config({
    cloud_name: envVars.cloudinary.cloudName,
    api_key: envVars.cloudinary.apiKey,
    api_secret: envVars.cloudinary.apiSecret
});

export const uploadBufferToCloudinary = (
    fileBuffer: Buffer,
    folder: string,
    publicId: string
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};

export default cloudinary;

