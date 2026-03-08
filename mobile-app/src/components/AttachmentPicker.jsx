/**
 * ====================================
 * ATTACHMENT PICKER COMPONENT
 * ====================================
 * Modal component for selecting different types of attachments.
 * Provides options for camera, gallery, video, and documents.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AttachmentOption = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
        <View style={[styles.optionIcon, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color="#fff" />
        </View>
        <Text style={styles.optionLabel}>{label}</Text>
    </TouchableOpacity>
);

const AttachmentPicker = ({ visible, onClose, onSelectOption }) => {
    const handleSelect = (type) => {
        onSelectOption(type);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
                    {/* Handle bar */}
                    <View style={styles.handleBar} />

                    <Text style={styles.title}>Share Content</Text>

                    <View style={styles.optionsGrid}>
                        <AttachmentOption
                            icon="camera"
                            label="Camera"
                            color="#F44336"
                            onPress={() => handleSelect('camera')}
                        />
                        <AttachmentOption
                            icon="image"
                            label="Photo"
                            color="#4CAF50"
                            onPress={() => handleSelect('photo')}
                        />
                        <AttachmentOption
                            icon="videocam"
                            label="Video"
                            color="#2196F3"
                            onPress={() => handleSelect('video')}
                        />
                        <AttachmentOption
                            icon="document"
                            label="Document"
                            color="#FF9800"
                            onPress={() => handleSelect('document')}
                        />
                    </View>

                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 30,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: '#ddd',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 20,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        marginBottom: 20,
    },
    option: {
        alignItems: 'center',
        width: '25%',
        marginBottom: 15,
    },
    optionIcon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    optionLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    cancelButton: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
});

export default AttachmentPicker;
