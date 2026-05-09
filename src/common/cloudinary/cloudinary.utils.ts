import { v2 as cloudinary } from 'cloudinary';
import { envVars } from '../../config/index.js';

cloudinary.config({
    cloud_name: envVars.cloudinary.cloudName,
    api_key: envVars.cloudinary.apiKey,
    api_secret: envVars.cloudinary.apiSecret
});

export default cloudinary;
