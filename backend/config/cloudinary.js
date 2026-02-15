/**
 * ====================================
 * CLOUDINARY CONFIGURATION
 * ====================================
 * Configuration for Cloudinary media storage.
 * Used for storing images, videos, PDFs, and documents in chats.
 */

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Default upload folder
const UPLOAD_FOLDER = process.env.CLOUDINARY_FOLDER || 'iit-connect-message-resources';

/**
 * Upload a file to Cloudinary
 * @param {Buffer|string} file - File buffer or base64 string
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
const uploadToCloudinary = async (file, options = {}) => {
    const defaultOptions = {
        folder: UPLOAD_FOLDER,
        resource_type: 'auto', // auto-detect file type (image, video, raw)
    };

    const uploadOptions = { ...defaultOptions, ...options };

    try {
        // Handle base64 or file path/buffer
        if (typeof file === 'string' && file.startsWith('data:')) {
            // Base64 string
            return await cloudinary.uploader.upload(file, uploadOptions);
        } else if (Buffer.isBuffer(file)) {
            // Buffer - convert to base64
            const base64 = `data:application/octet-stream;base64,${file.toString('base64')}`;
            return await cloudinary.uploader.upload(base64, uploadOptions);
        } else {
            // File path or URL
            return await cloudinary.uploader.upload(file, uploadOptions);
        }
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

/**
 * Upload an image to Cloudinary
 * @param {Buffer|string} file - Image file
 * @param {Object} options - Additional options
 */
const uploadImage = async (file, options = {}) => {
    return uploadToCloudinary(file, {
        ...options,
        resource_type: 'image',
        folder: `${UPLOAD_FOLDER}/images`,
        transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
        ]
    });
};

/**
 * Upload a video to Cloudinary
 * @param {Buffer|string} file - Video file
 * @param {Object} options - Additional options
 */
const uploadVideo = async (file, options = {}) => {
    return uploadToCloudinary(file, {
        ...options,
        resource_type: 'video',
        folder: `${UPLOAD_FOLDER}/videos`,
        eager: [
            { quality: 'auto:good', fetch_format: 'mp4' }
        ],
        eager_async: true
    });
};

/**
 * Upload a document (PDF, DOC, etc.) to Cloudinary
 * @param {Buffer|string} file - Document file
 * @param {Object} options - Additional options
 */
const uploadDocument = async (file, options = {}) => {
    return uploadToCloudinary(file, {
        ...options,
        resource_type: 'raw',
        folder: `${UPLOAD_FOLDER}/documents`
    });
};

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - Public ID of the file
 * @param {string} resourceType - Type of resource (image, video, raw)
 */
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        return await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw error;
    }
};

/**
 * Get optimized URL for a file
 * @param {string} publicId - Public ID of the file
 * @param {Object} options - Transformation options
 */
const getOptimizedUrl = (publicId, options = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        ...options
    });
};

module.exports = {
    cloudinary,
    uploadToCloudinary,
    uploadImage,
    uploadVideo,
    uploadDocument,
    deleteFromCloudinary,
    getOptimizedUrl,
    UPLOAD_FOLDER
};
