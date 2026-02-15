/**
 * ====================================
 * MEDIA MESSAGE COMPONENT
 * ====================================
 * Component for displaying different types of media in chat messages.
 * Supports images, videos, documents, and audio files.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Dimensions,
    Modal,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { formatFileSize, getFileIcon, getFileColor } from '../services/mediaService';

const { width: screenWidth } = Dimensions.get('window');
const maxMediaWidth = screenWidth * 0.65;
const maxMediaHeight = 300;

/**
 * Image Message Component
 */
export const ImageMessage = ({ fileUrl, isMe, onPress }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <>
            <TouchableOpacity 
                style={styles.imageContainer}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.9}
            >
                {loading && (
                    <View style={styles.imagePlaceholder}>
                        <ActivityIndicator color="#D32F2F" />
                    </View>
                )}
                {error ? (
                    <View style={styles.imageError}>
                        <Ionicons name="image-outline" size={32} color="#999" />
                        <Text style={styles.errorText}>Failed to load</Text>
                    </View>
                ) : (
                    <Image
                        source={{ uri: fileUrl }}
                        style={[styles.image, loading && styles.hidden]}
                        resizeMode="cover"
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                            setError(true);
                        }}
                    />
                )}
            </TouchableOpacity>

            {/* Full Screen Image Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity 
                        style={styles.modalClose}
                        onPress={() => setModalVisible(false)}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: fileUrl }}
                        style={styles.fullImage}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
        </>
    );
};

/**
 * Video Message Component
 */
export const VideoMessage = ({ fileUrl, thumbnailUrl, duration }) => {
    const [modalVisible, setModalVisible] = useState(false);

    const formatDuration = (seconds) => {
        if (!seconds) return '';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <TouchableOpacity 
                style={styles.videoContainer}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.9}
            >
                {thumbnailUrl ? (
                    <Image
                        source={{ uri: thumbnailUrl }}
                        style={styles.videoThumbnail}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={styles.videoPlaceholder}>
                        <Ionicons name="videocam" size={40} color="#fff" />
                    </View>
                )}
                <View style={styles.playButtonOverlay}>
                    <View style={styles.playButton}>
                        <Ionicons name="play" size={24} color="#fff" />
                    </View>
                </View>
                {duration > 0 && (
                    <View style={styles.durationBadge}>
                        <Text style={styles.durationText}>{formatDuration(duration)}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Full Screen Video Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <TouchableOpacity 
                        style={styles.modalClose}
                        onPress={() => setModalVisible(false)}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Video
                        source={{ uri: fileUrl }}
                        style={styles.fullVideo}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={true}
                        isLooping={false}
                    />
                </View>
            </Modal>
        </>
    );
};

/**
 * Document Message Component
 */
export const DocumentMessage = ({ fileUrl, fileName, fileSize, mimeType, isMe }) => {
    const [downloading, setDownloading] = useState(false);

    const handleOpenDocument = async () => {
        try {
            setDownloading(true);
            const supported = await Linking.canOpenURL(fileUrl);
            if (supported) {
                await Linking.openURL(fileUrl);
            } else {
                alert('Cannot open this file type');
            }
        } catch (error) {
            console.error('Error opening document:', error);
            alert('Failed to open document');
        } finally {
            setDownloading(false);
        }
    };

    const iconName = getFileIcon(mimeType);
    const iconColor = getFileColor(mimeType);

    return (
        <TouchableOpacity 
            style={[styles.documentContainer, isMe && styles.documentContainerMe]}
            onPress={handleOpenDocument}
            disabled={downloading}
        >
            <View style={[styles.documentIcon, { backgroundColor: `${iconColor}20` }]}>
                {downloading ? (
                    <ActivityIndicator color={iconColor} />
                ) : (
                    <Ionicons name={iconName} size={28} color={iconColor} />
                )}
            </View>
            <View style={styles.documentInfo}>
                <Text 
                    style={[styles.documentName, isMe && styles.documentNameMe]} 
                    numberOfLines={2}
                >
                    {fileName || 'Document'}
                </Text>
                {fileSize > 0 && (
                    <Text style={[styles.documentSize, isMe && styles.documentSizeMe]}>
                        {formatFileSize(fileSize)}
                    </Text>
                )}
            </View>
            <View style={styles.downloadIcon}>
                <Ionicons 
                    name="download-outline" 
                    size={20} 
                    color={isMe ? '#fff' : '#666'} 
                />
            </View>
        </TouchableOpacity>
    );
};

/**
 * Audio Message Component
 */
export const AudioMessage = ({ fileUrl, duration, isMe }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const formatDuration = (seconds) => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <TouchableOpacity 
            style={[styles.audioContainer, isMe && styles.audioContainerMe]}
            onPress={() => setIsPlaying(!isPlaying)}
        >
            <View style={styles.audioPlayButton}>
                <Ionicons 
                    name={isPlaying ? "pause" : "play"} 
                    size={20} 
                    color={isMe ? '#D32F2F' : '#fff'} 
                />
            </View>
            <View style={styles.audioWaveform}>
                {/* Simplified waveform visualization */}
                {[...Array(20)].map((_, i) => (
                    <View 
                        key={i} 
                        style={[
                            styles.waveformBar,
                            { 
                                height: Math.random() * 15 + 5,
                                backgroundColor: isMe ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.3)' 
                            }
                        ]} 
                    />
                ))}
            </View>
            <Text style={[styles.audioDuration, isMe && styles.audioDurationMe]}>
                {formatDuration(duration)}
            </Text>
        </TouchableOpacity>
    );
};

/**
 * Main MediaMessage component that renders the appropriate media type
 */
const MediaMessage = ({ message, isMe }) => {
    const { messageType, fileUrl, fileName, fileSize, fileMimeType, thumbnailUrl, mediaMetadata } = message;

    switch (messageType) {
        case 'image':
            return <ImageMessage fileUrl={fileUrl} isMe={isMe} />;
        case 'video':
            return (
                <VideoMessage 
                    fileUrl={fileUrl} 
                    thumbnailUrl={thumbnailUrl}
                    duration={mediaMetadata?.duration}
                    isMe={isMe} 
                />
            );
        case 'document':
        case 'file':
            return (
                <DocumentMessage 
                    fileUrl={fileUrl}
                    fileName={fileName}
                    fileSize={fileSize}
                    mimeType={fileMimeType}
                    isMe={isMe}
                />
            );
        case 'audio':
            return (
                <AudioMessage 
                    fileUrl={fileUrl}
                    duration={mediaMetadata?.duration}
                    isMe={isMe}
                />
            );
        default:
            return null;
    }
};

const styles = StyleSheet.create({
    // Image styles
    imageContainer: {
        borderRadius: 12,
        overflow: 'hidden',
        maxWidth: maxMediaWidth,
        maxHeight: maxMediaHeight,
    },
    image: {
        width: maxMediaWidth,
        height: 200,
        borderRadius: 12,
    },
    hidden: {
        opacity: 0,
    },
    imagePlaceholder: {
        width: maxMediaWidth,
        height: 200,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    imageError: {
        width: maxMediaWidth,
        height: 120,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    errorText: {
        color: '#999',
        fontSize: 12,
        marginTop: 5,
    },

    // Modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalClose: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    fullImage: {
        width: '100%',
        height: '80%',
    },
    fullVideo: {
        width: '100%',
        height: '100%',
    },

    // Video styles
    videoContainer: {
        width: maxMediaWidth,
        height: 180,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
    },
    videoThumbnail: {
        width: '100%',
        height: '100%',
    },
    videoPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButtonOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    durationBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    durationText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '500',
    },

    // Document styles
    documentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 12,
        maxWidth: maxMediaWidth,
    },
    documentContainerMe: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    documentIcon: {
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    documentInfo: {
        flex: 1,
    },
    documentName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    documentNameMe: {
        color: '#fff',
    },
    documentSize: {
        fontSize: 12,
        color: '#888',
        marginTop: 3,
    },
    documentSizeMe: {
        color: 'rgba(255,255,255,0.7)',
    },
    downloadIcon: {
        padding: 5,
    },

    // Audio styles
    audioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        padding: 10,
        paddingHorizontal: 12,
        minWidth: 200,
    },
    audioContainerMe: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    audioPlayButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#D32F2F',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    audioWaveform: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 30,
        marginRight: 10,
    },
    waveformBar: {
        width: 3,
        borderRadius: 2,
    },
    audioDuration: {
        fontSize: 12,
        color: '#666',
    },
    audioDurationMe: {
        color: 'rgba(255,255,255,0.8)',
    },
});

export default MediaMessage;
