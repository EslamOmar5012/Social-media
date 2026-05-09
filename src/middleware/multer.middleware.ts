import multer, { type StorageEngine } from 'multer';

/**
 * Common MIME types for validation
 */
export const fileValidation = {
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    file: ['application/pdf', 'application/msword']
};

/**
 * Multer Host Middleware
 * Configures Multer to store uploaded files in a local 'uploads' directory.
 * Includes file type validation and size limits.
 */
export const multerHost = (allowedTypes: string[] = fileValidation.image) => {
    const storage: StorageEngine = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        }
    });

    const fileFilter = (req: any, file: any, cb: any) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file format'), false);
        }
    };

    const upload = multer({ 
        storage, 
        fileFilter,
        limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit (big files will be stored locally)
    });
    return upload;
};
