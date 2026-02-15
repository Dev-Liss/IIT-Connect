/**
 * ====================================
 * MEDIA SERVICE
 * ====================================
 * Handles media picking, uploading, and management for chat attachments.
 * Supports images, videos, and documents (PDFs, DOCs, etc.)
 */

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UPLOAD_ENDPOINTS } from '../config/api';

/**
 * Media types supported by the app
 */
export const MEDIA_TYPES = {
    IMAGE: 'image',
    VIDEO: 'video',
    DOCUMENT: 'document',
    AUDIO: 'audio',
};

/**
 * Maximum file sizes (in bytes)
 */
export const MAX_FILE_SIZES = {
    IMAGE: 10 * 1024 * 1024, // 10MB
    VIDEO: 50 * 1024 * 1024, // 50MB
    DOCUMENT: 25 * 1024 * 1024, // 25MB
};

/**
 * Request camera and media library permissions
 */
export const requestMediaPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaLibraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    return {
        camera: cameraPermission.status === 'granted',
        mediaLibrary: mediaLibraryPermission.status === 'granted',
    };
};

/**
 * Pick an image from the device gallery
 * @param {Object} options - Image picker options
 */
export const pickImage = async (options = {}) => {
    try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Media library permission not granted');
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: options.allowsEditing ?? false,
            quality: options.quality ?? 0.8,
            aspect: options.aspect,
            base64: false,
        });

        if (result.canceled) {
            return null;
        }

        const asset = result.assets[0];
        return {
            uri: asset.uri,
            type: 'image',
            mimeType: asset.mimeType || 'image/jpeg',
            width: asset.width,
            height: asset.height,
            fileName: asset.fileName || `image_${Date.now()}.jpg`,
            fileSize: asset.fileSize,
        };
    } catch (error) {
        console.error('Error picking image:', error);
        throw error;
    }
};

/**
 * Pick a video from the device gallery
 * @param {Object} options - Video picker options
 */
export const pickVideo = async (options = {}) => {
    try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Media library permission not granted');
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            allowsEditing: options.allowsEditing ?? false,
            quality: options.quality ?? 0.7,
            videoMaxDuration: options.videoMaxDuration ?? 60, // 60 seconds max by default
        });

        if (result.canceled) {
            return null;
        }

        const asset = result.assets[0];
        return {
            uri: asset.uri,
            type: 'video',
            mimeType: asset.mimeType || 'video/mp4',
            width: asset.width,
            height: asset.height,
            duration: asset.duration,
            fileName: asset.fileName || `video_${Date.now()}.mp4`,
            fileSize: asset.fileSize,
        };
    } catch (error) {
        console.error('Error picking video:', error);
        throw error;
    }
};

/**
 * Take a photo using the camera
 * @param {Object} options - Camera options
 */
export const takePhoto = async (options = {}) => {
    try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Camera permission not granted');
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: options.allowsEditing ?? false,
            quality: options.quality ?? 0.8,
            aspect: options.aspect,
        });

        if (result.canceled) {
            return null;
        }

        const asset = result.assets[0];
        return {
            uri: asset.uri,
            type: 'image',
            mimeType: asset.mimeType || 'image/jpeg',
            width: asset.width,
            height: asset.height,
            fileName: asset.fileName || `photo_${Date.now()}.jpg`,
            fileSize: asset.fileSize,
        };
    } catch (error) {
        console.error('Error taking photo:', error);
        throw error;
    }
};

/**
 * Record a video using the camera
 * @param {Object} options - Camera options
 */
export const recordVideo = async (options = {}) => {
    try {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            throw new Error('Camera permission not granted');
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['videos'],
            allowsEditing: options.allowsEditing ?? false,
            quality: options.quality ?? 0.7,
            videoMaxDuration: options.videoMaxDuration ?? 60,
        });

        if (result.canceled) {
            return null;
        }

        const asset = result.assets[0];
        return {
            uri: asset.uri,
            type: 'video',
            mimeType: asset.mimeType || 'video/mp4',
            width: asset.width,
            height: asset.height,
            duration: asset.duration,
            fileName: asset.fileName || `video_${Date.now()}.mp4`,
            fileSize: asset.fileSize,
        };
    } catch (error) {
        console.error('Error recording video:', error);
        throw error;
    }
};

/**
 * Pick a document (PDF, DOC, etc.)
 * @param {Object} options - Document picker options
 */
export const pickDocument = async (options = {}) => {
    try {
        const result = await DocumentPicker.getDocumentAsync({
            type: options.type ?? [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'text/plain',
            ],
            copyToCacheDirectory: true,
            multiple: options.multiple ?? false,
        });

        if (result.canceled) {
            return null;
        }

        const asset = result.assets[0];
        return {
            uri: asset.uri,
            type: 'document',
            mimeType: asset.mimeType || 'application/octet-stream',
            fileName: asset.name,
            fileSize: asset.size,
        };
    } catch (error) {
        console.error('Error picking document:', error);
        throw error;
    }
};

/**
 * Pick any type of media (shows options for image, video, or document)
 */
export const pickMedia = async () => {
    try {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: false,
            quality: 0.8,
        });

        if (result.canceled) {
            return null;
        }

        const asset = result.assets[0];
        const isVideo = asset.type === 'video' || (asset.mimeType && asset.mimeType.startsWith('video'));

        return {
            uri: asset.uri,
            type: isVideo ? 'video' : 'image',
            mimeType: asset.mimeType || (isVideo ? 'video/mp4' : 'image/jpeg'),
            width: asset.width,
            height: asset.height,
            duration: asset.duration,
            fileName: asset.fileName || `media_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`,
            fileSize: asset.fileSize,
        };
    } catch (error) {
        console.error('Error picking media:', error);
        throw error;
    }
};

/**
 * Get file info from URI
 */
export const getFileInfo = async (uri) => {
    try {
        const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
        return fileInfo;
    } catch (error) {
        console.error('Error getting file info:', error);
        return null;
    }
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Upload a file to the server
 * @param {Object} file - File object with uri, type, mimeType, fileName
 * @param {Function} onProgress - Progress callback
 */
export const uploadFile = async (file, onProgress = null) => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            throw new Error('Not authenticated');
        }

        // Create form data
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            type: file.mimeType,
            name: file.fileName,
        });

        // Upload using fetch with XMLHttpRequest for progress tracking
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = (event.loaded / event.total) * 100;
                    onProgress(progress);
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response);
                    } catch (_e) {
                        reject(new Error('Invalid server response'));
                    }
                } else {
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        reject(new Error(errorResponse.message || 'Upload failed'));
                    } catch (_e) {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Network error during upload'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload cancelled'));
            });

            xhr.open('POST', UPLOAD_ENDPOINTS.UPLOAD_MEDIA);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.send(formData);
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

/**
 * Upload multiple files to the server
 * @param {Array} files - Array of file objects
 * @param {Function} onProgress - Progress callback
 */
export const uploadMultipleFiles = async (files, onProgress = null) => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
            throw new Error('Not authenticated');
        }

        const formData = new FormData();
        files.forEach((file, index) => {
            formData.append('files', {
                uri: file.uri,
                type: file.mimeType,
                name: file.fileName,
            });
        });

        const response = await fetch(UPLOAD_ENDPOINTS.UPLOAD_MULTIPLE, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Upload failed');
        }

        return data;
    } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
    }
};

/**
 * Get the icon name for a file type
 */
export const getFileIcon = (mimeType) => {
    if (!mimeType) return 'document-outline';

    if (mimeType.startsWith('image/')) return 'image-outline';
    if (mimeType.startsWith('video/')) return 'videocam-outline';
    if (mimeType.startsWith('audio/')) return 'musical-notes-outline';
    if (mimeType.includes('pdf')) return 'document-text-outline';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document-outline';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'grid-outline';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'easel-outline';

    return 'document-outline';
};

/**
 * Get the color for a file type
 */
export const getFileColor = (mimeType) => {
    if (!mimeType) return '#666666';

    if (mimeType.startsWith('image/')) return '#4CAF50';
    if (mimeType.startsWith('video/')) return '#2196F3';
    if (mimeType.startsWith('audio/')) return '#9C27B0';
    if (mimeType.includes('pdf')) return '#F44336';
    if (mimeType.includes('word') || mimeType.includes('document')) return '#2196F3';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '#4CAF50';
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '#FF9800';

    return '#666666';
};

/**
 * Check if file size is within limits
 */
export const validateFileSize = (file) => {
    const maxSize = file.type === 'video'
        ? MAX_FILE_SIZES.VIDEO
        : file.type === 'image'
            ? MAX_FILE_SIZES.IMAGE
            : MAX_FILE_SIZES.DOCUMENT;

    if (file.fileSize && file.fileSize > maxSize) {
        return {
            valid: false,
            message: `File size exceeds ${formatFileSize(maxSize)} limit`,
        };
    }

    return { valid: true };
};

export default {
    MEDIA_TYPES,
    MAX_FILE_SIZES,
    requestMediaPermissions,
    pickImage,
    pickVideo,
    takePhoto,
    recordVideo,
    pickDocument,
    pickMedia,
    getFileInfo,
    formatFileSize,
    uploadFile,
    uploadMultipleFiles,
    getFileIcon,
    getFileColor,
    validateFileSize,
};
