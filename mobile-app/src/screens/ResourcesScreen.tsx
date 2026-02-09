import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    Modal,
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    Platform,
    Animated,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { RESOURCE_ENDPOINTS } from '../config/api';

const { width } = Dimensions.get('window');
const BRAND_RED = '#f9252b';

interface Resource {
    _id: string;
    title: string;
    courseCode: string;
    moduleName: string;
    description: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    originalName?: string;
    uploadedBy?: string;
    createdAt: string;
}

const getMimeType = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'pdf': return 'application/pdf';
        case 'doc': return 'application/msword';
        case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'xls': return 'application/vnd.ms-excel';
        case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        case 'ppt': return 'application/vnd.ms-powerpoint';
        case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
        case 'txt': return 'text/plain';
        case 'jpg':
        case 'jpeg': return 'image/jpeg';
        case 'png': return 'image/png';
        default: return 'application/octet-stream';
    }
};

interface ResourcesScreenProps {
    scrollY: Animated.Value;
}

export default function ResourcesScreen({ scrollY }: ResourcesScreenProps) {
    const [resources, setResources] = useState<Resource[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Upload Modal State
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadCourseCode, setUploadCourseCode] = useState('');
    const [uploadModule, setUploadModule] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [uploading, setUploading] = useState(false);

    // Details Modal State
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

    useEffect(() => {
        fetchResources();
    }, []);

    useEffect(() => {
        filterResources();
    }, [searchQuery, resources]);

    const fetchResources = async () => {
        setLoading(true);
        try {
            const response = await fetch(RESOURCE_ENDPOINTS.GET_ALL);
            const json = await response.json();
            if (json.success) {
                setResources(json.data);
            } else {
                Alert.alert('Error', 'Failed to fetch resources.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    const filterResources = () => {
        let filtered = resources;

        // Filter by Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (res) =>
                    res.title.toLowerCase().includes(query) ||
                    res.courseCode.toLowerCase().includes(query) ||
                    res.moduleName.toLowerCase().includes(query)
            );
        }

        setFilteredResources(filtered);
    };

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedFile(result.assets[0]);
            }
        } catch (err) {
            console.error('Unknown error picking file:', err);
        }
    };

    const handleUpload = async () => {
        if (!uploadTitle || !uploadCourseCode || !uploadModule || !uploadDescription || !selectedFile) {
            Alert.alert('Missing Fields', 'Please fill all fields and select a file.');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('title', uploadTitle);
        formData.append('courseCode', uploadCourseCode);
        formData.append('moduleName', uploadModule);
        formData.append('description', uploadDescription);

        // @ts-ignore
        formData.append('file', {
            uri: selectedFile.uri,
            name: selectedFile.name,
            type: selectedFile.mimeType || 'application/octet-stream',
        });
        formData.append('uploadedBy', 'Student User');

        try {
            const response = await fetch(RESOURCE_ENDPOINTS.UPLOAD, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const json = await response.json();
            if (json.success) {
                Alert.alert('Success', 'Resource uploaded successfully!');
                setUploadModalVisible(false);
                resetUploadForm();
                fetchResources();
            } else {
                Alert.alert('Upload Failed', json.message || 'Something went wrong.');
            }
        } catch (error) {
            console.error('Upload Error:', error);
            Alert.alert('Error', 'Network error during upload.');
        } finally {
            setUploading(false);
        }
    };

    const resetUploadForm = () => {
        setUploadTitle('');
        setUploadCourseCode('');
        setUploadModule('');
        setUploadDescription('');
        setSelectedFile(null);
    };

    const openDetails = (resource: Resource) => {
        setSelectedResource(resource);
        setDetailsModalVisible(true);
    };

    const handleDownload = async () => {
        if (!selectedResource?.fileUrl) return;

        try {
            // 1. Determine file name and path
            // Use originalName if available to ensure correct extension and user familiarity
            const fileName = selectedResource.originalName
                ? selectedResource.originalName
                : `${selectedResource.title.replace(/[^a-zA-Z0-9]/g, '_')}.${selectedResource.fileType}`;

            const fileUri = FileSystem.documentDirectory + fileName;

            // 2. Download file to internal cache first
            const downloadRes = await FileSystem.downloadAsync(selectedResource.fileUrl, fileUri);

            if (downloadRes.status !== 200) {
                Alert.alert('Error', 'Failed to download file.');
                return;
            }

            // 3. Determine resource type (Image/Video vs Document)
            // We check extension from the file name or fileType
            const isImageOrVideo = (fileName.match(/\.(jpg|jpeg|png|gif|mp4|mov|avi|heic)$/i)) ||
                ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi'].includes((selectedResource.fileType || '').toLowerCase());

            if (isImageOrVideo) {
                // Save to Gallery
                const { status } = await MediaLibrary.requestPermissionsAsync();

                if (status === 'granted') {
                    try {
                        const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
                        // Attempt to save to a specific album, or just create it.
                        // On Android, createAlbumAsync with false (no copy) checks if album exists or creates it.
                        // On iOS, it creates an album.
                        const albumName = 'Download';
                        const album = await MediaLibrary.getAlbumAsync(albumName);

                        if (album) {
                            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
                        } else {
                            await MediaLibrary.createAlbumAsync(albumName, asset, false);
                        }

                        Alert.alert('Success', 'Saved to Gallery!');
                    } catch (err) {
                        console.error('Gallery save error:', err);
                        Alert.alert('Error', 'Could not save to gallery.');
                    }
                } else {
                    Alert.alert('Permission Required', 'Gallery permission is needed to save media.');
                }
            } else {
                // Document handling
                if (Platform.OS === 'android') {
                    // Android: Use Storage Access Framework to save to user-selected folder
                    try {
                        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

                        if (permissions.granted) {
                            const base64 = await FileSystem.readAsStringAsync(downloadRes.uri, { encoding: FileSystem.EncodingType.Base64 });
                            const mimeType = getMimeType(fileName);

                            const createdUri = await FileSystem.StorageAccessFramework.createFileAsync(
                                permissions.directoryUri,
                                fileName,
                                mimeType
                            );

                            await FileSystem.writeAsStringAsync(createdUri, base64, { encoding: FileSystem.EncodingType.Base64 });
                            Alert.alert('Success', 'File saved successfully!');
                        }
                    } catch (err) {
                        console.error('SAF Error:', err);
                        Alert.alert('Error', 'Failed to save file to storage.');
                    }
                } else {
                    // iOS: Use Share Sheet as "Save to Files"
                    if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(downloadRes.uri, { UTI: 'public.item' });
                    } else {
                        Alert.alert('Error', 'Sharing not available.');
                    }
                }
            }

        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to download and save file.');
        }
    };

    const renderResourceItem = ({ item }: { item: Resource }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => openDetails(item)}
            activeOpacity={0.8}
        >
            <View style={styles.cardIconContainer}>
                <FontAwesome5 name="file-pdf" size={32} color={BRAND_RED} />
            </View>
            <Text style={styles.cardTitle} numberOfLines={2}>
                {item.title}
            </Text>
            <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{item.courseCode}</Text>
            </View>
            <Text style={styles.authorText}>By {item.uploadedBy || 'Unknown'}</Text>
            <TouchableOpacity style={styles.cardDownloadBtn} onPress={() => openDetails(item)}>
                <Ionicons name="download-outline" size={16} color="#fff" />
                <Text style={styles.cardDownloadText}>Download</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Search Bar - No Header here as Parent provides it */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search notes, papers, subjects..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />
            </View>



            {/* Resource Grid */}
            {loading ? (
                <ActivityIndicator size="large" color={BRAND_RED} style={{ marginTop: 20 }} />
            ) : (
                <Animated.FlatList
                    data={filteredResources}
                    renderItem={renderResourceItem}
                    keyExtractor={(item) => item._id}
                    numColumns={2}
                    columnWrapperStyle={styles.columnWrapper}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true }
                    )}
                    scrollEventThrottle={16}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No resources found.</Text>
                    }
                />
            )}

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setUploadModalVisible(true)}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            {/* Upload Modal */}
            <Modal
                visible={uploadModalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setUploadModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Add New Resource</Text>
                        <TouchableOpacity onPress={() => setUploadModalVisible(false)}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView contentContainerStyle={styles.modalContent}>
                        <Text style={styles.label}>Document Title *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Week 5 Lecture Notes"
                            value={uploadTitle}
                            onChangeText={setUploadTitle}
                        />

                        <Text style={styles.label}>Course Code *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., CS101"
                            value={uploadCourseCode}
                            onChangeText={setUploadCourseCode}
                        />

                        <Text style={styles.label}>Module *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Module 2: Data Structures"
                            value={uploadModule}
                            onChangeText={setUploadModule}
                        />

                        <Text style={styles.label}>Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe the content of this resource..."
                            value={uploadDescription}
                            onChangeText={setUploadDescription}
                            multiline
                        />

                        <Text style={styles.label}>Upload File *</Text>
                        <TouchableOpacity style={styles.uploadBox} onPress={pickFile}>
                            {selectedFile ? (
                                <View style={{ alignItems: 'center' }}>
                                    <FontAwesome5 name="file-alt" size={40} color={BRAND_RED} />
                                    <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.uploadIconCircle}>
                                        <Ionicons name="cloud-upload-outline" size={24} color={BRAND_RED} />
                                    </View>
                                    <Text style={styles.uploadBoxText}>Click to upload or drag and drop</Text>
                                    <Text style={styles.uploadBoxSubText}>PDF, DOC, DOCX (Max 10MB)</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitBtn, uploading && styles.disabledBtn]}
                            onPress={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitBtnText}>Upload Resource</Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => setUploadModalVisible(false)}
                            disabled={uploading}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Modal>

            {/* Details Modal */}
            <Modal
                visible={detailsModalVisible}
                animationType="slide"
                onRequestClose={() => setDetailsModalVisible(false)}
            >
                {selectedResource && (
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailsHeaderRow}>
                            <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                                <Ionicons name="chevron-back" size={28} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.detailsHeaderTitle}>Resource Details</Text>
                            <View style={{ width: 28 }} />
                        </View>

                        <ScrollView contentContainerStyle={styles.detailsContent}>
                            <View style={styles.detailsCard}>
                                <View style={styles.detailsIconContainer}>
                                    <FontAwesome5 name="file-pdf" size={50} color={BRAND_RED} />
                                </View>
                                <Text style={styles.detailsTitle}>{selectedResource.title}</Text>
                                <View style={styles.detailsBadge}>
                                    <Text style={styles.detailsBadgeText}>{selectedResource.courseCode}</Text>
                                </View>

                                <View style={styles.detailsInfoRow}>
                                    <Text style={styles.detailsInfoLabel}>Module</Text>
                                    <Text style={styles.detailsInfoValue}>{selectedResource.moduleName}</Text>
                                </View>
                                <View style={styles.detailsInfoRow}>
                                    <Text style={styles.detailsInfoLabel}>Uploaded by</Text>
                                    <Text style={styles.detailsInfoValue}>{selectedResource.uploadedBy || 'Unknown'}</Text>
                                </View>
                                <View style={styles.detailsInfoRow}>
                                    <Text style={styles.detailsInfoLabel}>File Type</Text>
                                    <Text style={styles.detailsInfoValue}>{selectedResource.fileType}</Text>
                                </View>
                                <View style={styles.detailsInfoRow}>
                                    <Text style={styles.detailsInfoLabel}>File Size</Text>
                                    <Text style={styles.detailsInfoValue}>{selectedResource.fileSize ? (selectedResource.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</Text>
                                </View>
                            </View>

                            <View style={styles.descriptionCard}>
                                <Text style={styles.descriptionTitle}>Description</Text>
                                <Text style={styles.descriptionText}>{selectedResource.description}</Text>
                            </View>

                            <TouchableOpacity style={styles.largeDownloadBtn} onPress={handleDownload}>
                                <Ionicons name="download-outline" size={24} color="#fff" style={{ marginRight: 8 }} />
                                <Text style={styles.largeDownloadBtnText}>Download</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                )}
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 10, // Adjusted for parent container
    },
    // Removed Header Styles
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        marginHorizontal: 20,
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },

    listContent: {
        paddingTop: 180, // Space for sticky header
        paddingHorizontal: 12,
        paddingBottom: 80,
    },
    columnWrapper: {
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: '#fff',
        width: (width / 2) - 24,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    cardIconContainer: {
        width: 60,
        height: 60,
        backgroundColor: '#FFF0F0',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
        color: '#000',
        minHeight: 40,
    },
    badgeContainer: {
        borderWidth: 1,
        borderColor: BRAND_RED,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
        marginBottom: 8,
    },
    badgeText: {
        color: BRAND_RED,
        fontSize: 10,
        fontWeight: 'bold',
    },
    authorText: {
        fontSize: 10,
        color: '#999',
        marginBottom: 12,
    },
    cardDownloadBtn: {
        flexDirection: 'row',
        backgroundColor: BRAND_RED,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
    },
    cardDownloadText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: BRAND_RED,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        color: '#999',
        fontSize: 16,
    },
    // Upload Modal Styles
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        marginBottom: 20,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    uploadBox: {
        borderWidth: 2,
        borderColor: '#eee',
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
        backgroundColor: '#fafafa',
    },
    uploadIconCircle: {
        width: 50,
        height: 50,
        backgroundColor: '#FFF0F0',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    uploadBoxText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
    },
    uploadBoxSubText: {
        fontSize: 12,
        color: '#999',
    },
    selectedFileName: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
    },
    submitBtn: {
        backgroundColor: BRAND_RED,
        paddingVertical: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
    },
    submitBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledBtn: {
        opacity: 0.7,
    },
    cancelBtn: {
        paddingVertical: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
    },
    cancelBtnText: {
        color: '#999',
        fontSize: 16,
        fontWeight: '600',
    },
    // Details Modal Styles
    detailsContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    detailsHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        backgroundColor: '#fff',
    },
    detailsHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    detailsContent: {
        padding: 20,
    },
    detailsCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    detailsIconContainer: {
        width: 100,
        height: 100,
        backgroundColor: '#FFF0F0',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    detailsTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 12,
    },
    detailsBadge: {
        borderWidth: 1,
        borderColor: BRAND_RED,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 16,
        marginBottom: 30,
    },
    detailsBadgeText: {
        color: BRAND_RED,
        fontSize: 14,
        fontWeight: 'bold',
    },
    detailsInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 12,
    },
    detailsInfoLabel: {
        color: '#999',
        fontSize: 14,
    },
    detailsInfoValue: {
        color: '#000',
        fontWeight: '600',
        fontSize: 14,
    },
    descriptionCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 30,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
    largeDownloadBtn: {
        backgroundColor: BRAND_RED,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 18,
        borderRadius: 16,
        shadowColor: BRAND_RED,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    largeDownloadBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
