/**
 * ====================================
 * UPLOAD ROUTES
 * ====================================
 * REST API endpoints for uploading media files to Cloudinary
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
    uploadImage,
    uploadVideo,
    uploadDocument,
    uploadToCloudinary,
    deleteFromCloudinary
} = require('../config/cloudinary');

// Configure multer for memory storage (for processing before upload to Cloudinary)
const storage = multer.memoryStorage();

// File filter to allow specific file types
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    const allowedDocumentTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
    ];

    const allAllowedTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocumentTypes];

    if (allAllowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${file.mimetype} is not supported`), false);
    }
};

// Configure multer upload
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max file size
    },
});

/**
 * Helper function to determine file type category
 */
const getFileCategory = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'document';
};

/**
 * Helper function to format file size
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * @route   POST /api/upload/media
 * @desc    Upload a single media file (image, video, or document)
 * @access  Private
 */
router.post('/media', protect, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const { buffer, mimetype, originalname, size } = req.file;
        const fileCategory = getFileCategory(mimetype);

        let uploadResult;
        const base64File = `data:${mimetype};base64,${buffer.toString('base64')}`;

        // Upload based on file type
        switch (fileCategory) {
            case 'image':
                uploadResult = await uploadImage(base64File, {
                    public_id: `${Date.now()}_${originalname.replace(/\.[^/.]+$/, '')}`,
                });
                break;
            case 'video':
                uploadResult = await uploadVideo(base64File, {
                    public_id: `${Date.now()}_${originalname.replace(/\.[^/.]+$/, '')}`,
                });
                break;
            default:
                uploadResult = await uploadDocument(base64File, {
                    public_id: `${Date.now()}_${originalname}`,
                });
        }

        // Build response object
        const responseData = {
            success: true,
            file: {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                fileName: originalname,
                fileSize: size,
                fileSizeFormatted: formatFileSize(size),
                mimeType: mimetype,
                fileType: fileCategory,
                width: uploadResult.width || null,
                height: uploadResult.height || null,
                duration: uploadResult.duration || null,
                thumbnailUrl: fileCategory === 'video'
                    ? uploadResult.secure_url.replace(/\.[^/.]+$/, '.jpg')
                    : null,
            }
        };

        res.status(201).json(responseData);

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload file'
        });
    }
});

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple media files
 * @access  Private
 */
router.post('/multiple', protect, upload.array('files', 10), async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded'
            });
        }

        const uploadPromises = req.files.map(async (file) => {
            const { buffer, mimetype, originalname, size } = file;
            const fileCategory = getFileCategory(mimetype);
            const base64File = `data:${mimetype};base64,${buffer.toString('base64')}`;

            let uploadResult;
            switch (fileCategory) {
                case 'image':
                    uploadResult = await uploadImage(base64File, {
                        public_id: `${Date.now()}_${originalname.replace(/\.[^/.]+$/, '')}`,
                    });
                    break;
                case 'video':
                    uploadResult = await uploadVideo(base64File, {
                        public_id: `${Date.now()}_${originalname.replace(/\.[^/.]+$/, '')}`,
                    });
                    break;
                default:
                    uploadResult = await uploadDocument(base64File, {
                        public_id: `${Date.now()}_${originalname}`,
                    });
            }

            return {
                url: uploadResult.secure_url,
                publicId: uploadResult.public_id,
                fileName: originalname,
                fileSize: size,
                fileSizeFormatted: formatFileSize(size),
                mimeType: mimetype,
                fileType: fileCategory,
                width: uploadResult.width || null,
                height: uploadResult.height || null,
                duration: uploadResult.duration || null,
                thumbnailUrl: fileCategory === 'video'
                    ? uploadResult.secure_url.replace(/\.[^/.]+$/, '.jpg')
                    : null,
            };
        });

        const uploadedFiles = await Promise.all(uploadPromises);

        res.status(201).json({
            success: true,
            files: uploadedFiles,
            count: uploadedFiles.length
        });

    } catch (error) {
        console.error('Multiple upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload files'
        });
    }
});

/**
 * @route   DELETE /api/upload/:publicId
 * @desc    Delete a file from Cloudinary
 * @access  Private
 */
router.delete('/:publicId', protect, async (req, res) => {
    try {
        const { publicId } = req.params;
        const { resourceType = 'image' } = req.query;

        // Decode the publicId (it may contain slashes)
        const decodedPublicId = decodeURIComponent(publicId);

        const result = await deleteFromCloudinary(decodedPublicId, resourceType);

        res.json({
            success: true,
            message: 'File deleted successfully',
            result
        });

    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete file'
        });
    }
});

/**
 * Error handling middleware for multer errors
 */
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size exceeds the 50MB limit'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum is 10 files per upload'
            });
        }
    }

    res.status(400).json({
        success: false,
        message: error.message || 'Upload error'
    });
});

module.exports = router;
