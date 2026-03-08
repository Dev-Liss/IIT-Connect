/**
 * ====================================
 * MEDIA PREVIEW COMPONENT
 * ====================================
 * Shows a preview of the selected media before sending.
 * Displays progress during upload.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatFileSize, getFileIcon, getFileColor } from '../services/mediaService';

const MediaPreview = ({ 
    media, 
    onRemove, 
    isUploading, 
    uploadProgress 
}) => {
    if (!media) return null;

    const renderPreview = () => {
        switch (media.type) {
            case 'image':
                return (
                    <Image
                        source={{ uri: media.uri }}
                        style={styles.imagePreview}
                        resizeMode="cover"
                    />
                );
            case 'video':
                return (
                    <View style={styles.videoPreview}>
                        <Image
                            source={{ uri: media.uri }}
                            style={styles.videoThumbnail}
                            resizeMode="cover"
                        />
                        <View style={styles.videoOverlay}>
                            <Ionicons name="videocam" size={24} color="#fff" />
                        </View>
                    </View>
                );
            case 'document':
            default:
                const iconName = getFileIcon(media.mimeType);
                const iconColor = getFileColor(media.mimeType);
                return (
                    <View style={styles.documentPreview}>
                        <View style={[styles.documentIcon, { backgroundColor: `${iconColor}20` }]}>
                            <Ionicons name={iconName} size={24} color={iconColor} />
                        </View>
                        <View style={styles.documentInfo}>
                            <Text style={styles.documentName} numberOfLines={1}>
                                {media.fileName}
                            </Text>
                            {media.fileSize > 0 && (
                                <Text style={styles.documentSize}>
                                    {formatFileSize(media.fileSize)}
                                </Text>
                            )}
                        </View>
                    </View>
                );
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.previewWrapper}>
                {renderPreview()}
                
                {/* Upload overlay */}
                {isUploading && (
                    <View style={styles.uploadOverlay}>
                        <ActivityIndicator color="#fff" size="small" />
                        {uploadProgress > 0 && (
                            <Text style={styles.progressText}>
                                {Math.round(uploadProgress)}%
                            </Text>
                        )}
                    </View>
                )}

                {/* Remove button */}
                {!isUploading && (
                    <TouchableOpacity 
                        style={styles.removeButton} 
                        onPress={onRemove}
                    >
                        <Ionicons name="close" size={18} color="#fff" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Progress bar */}
            {isUploading && uploadProgress > 0 && (
                <View style={styles.progressBarContainer}>
                    <View 
                        style={[
                            styles.progressBar, 
                            { width: `${uploadProgress}%` }
                        ]} 
                    />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    previewWrapper: {
        position: 'relative',
        alignSelf: 'flex-start',
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 10,
    },
    videoPreview: {
        width: 100,
        height: 100,
        borderRadius: 10,
        overflow: 'hidden',
    },
    videoThumbnail: {
        width: '100%',
        height: '100%',
    },
    videoOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    documentPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        padding: 10,
        maxWidth: 250,
    },
    documentIcon: {
        width: 44,
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    documentInfo: {
        flex: 1,
    },
    documentName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    documentSize: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#ff4444',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    uploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    progressText: {
        color: '#fff',
        fontSize: 12,
        marginTop: 5,
        fontWeight: '600',
    },
    progressBarContainer: {
        height: 3,
        backgroundColor: '#e0e0e0',
        borderRadius: 2,
        marginTop: 8,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#D32F2F',
        borderRadius: 2,
    },
});

export default MediaPreview;
