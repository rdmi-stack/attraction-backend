"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOptimizedUrl = exports.deleteImage = exports.uploadBase64Image = exports.uploadImage = void 0;
const cloudinary_1 = require("cloudinary");
const env_1 = require("../config/env");
// Configure Cloudinary
if (env_1.env.cloudinaryCloudName) {
    cloudinary_1.v2.config({
        cloud_name: env_1.env.cloudinaryCloudName,
        api_key: env_1.env.cloudinaryApiKey,
        api_secret: env_1.env.cloudinaryApiSecret,
    });
}
const uploadImage = async (filePath, folder = 'attractions') => {
    if (!env_1.env.cloudinaryCloudName) {
        throw new Error('Cloudinary not configured');
    }
    const result = await cloudinary_1.v2.uploader.upload(filePath, {
        folder: `attractions-network/${folder}`,
        transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
        ],
    });
    return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
    };
};
exports.uploadImage = uploadImage;
const uploadBase64Image = async (base64Data, folder = 'attractions') => {
    if (!env_1.env.cloudinaryCloudName) {
        throw new Error('Cloudinary not configured');
    }
    const result = await cloudinary_1.v2.uploader.upload(base64Data, {
        folder: `attractions-network/${folder}`,
        transformation: [
            { width: 1200, height: 800, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
        ],
    });
    return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
    };
};
exports.uploadBase64Image = uploadBase64Image;
const deleteImage = async (publicId) => {
    if (!env_1.env.cloudinaryCloudName) {
        throw new Error('Cloudinary not configured');
    }
    await cloudinary_1.v2.uploader.destroy(publicId);
};
exports.deleteImage = deleteImage;
const getOptimizedUrl = (publicId, options = {}) => {
    if (!env_1.env.cloudinaryCloudName) {
        return '';
    }
    return cloudinary_1.v2.url(publicId, {
        transformation: [
            { width: options.width || 800, height: options.height || 600, crop: 'fill' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
        ],
    });
};
exports.getOptimizedUrl = getOptimizedUrl;
//# sourceMappingURL=upload.service.js.map