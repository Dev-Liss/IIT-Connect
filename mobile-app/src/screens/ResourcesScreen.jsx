import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  FlatList,
  useWindowDimensions,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import {
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { RESOURCE_ENDPOINTS } from "../config/api";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const BRAND_RED = "#f9252b";

const renderFileIcon = (fileName, fileType, size = 32) => {
  let ext = "";
  if (fileName) {
    ext = fileName.split(".").pop()?.toLowerCase() || "";
  }
  if (!ext || ext === fileName) {
    if (fileType) {
      if (fileType.includes("/")) {
        ext = fileType.split("/")[1]?.toLowerCase();
      } else {
        ext = fileType.toLowerCase();
      }
    }
  }

  if (ext === "jpeg") ext = "jpg";
  if (ext === "vnd.openxmlformats-officedocument.wordprocessingml.document")
    ext = "docx";

  switch (ext) {
    case "pdf":
      return <FontAwesome5 name="file-pdf" size={size} color={BRAND_RED} />;
    case "doc":
    case "docx":
    case "msword":
      return (
        <MaterialCommunityIcons name="file-word" size={size} color="#2b5797" />
      );
    case "xls":
    case "xlsx":
    case "sheet":
    case "excel":
      return (
        <MaterialCommunityIcons name="file-excel" size={size} color="#217346" />
      );
    case "ppt":
    case "pptx":
    case "presentation":
    case "powerpoint":
      return (
        <MaterialCommunityIcons
          name="file-powerpoint"
          size={size}
          color="#d24726"
        />
      );
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "webp":
      return <Ionicons name="image" size={size} color={BRAND_RED} />;
    case "zip":
    case "rar":
    case "7z":
      return <FontAwesome5 name="file-archive" size={size} color="#f0ad4e" />;
    case "txt":
      return <FontAwesome5 name="file-alt" size={size} color="#666" />;
    default:
      return <FontAwesome5 name="file" size={size} color="#999" />;
  }
};

const getMimeType = (fileName) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "application/pdf";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "txt":
      return "text/plain";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    default:
      return "application/octet-stream";
  }
};

export default function ResourcesScreen({ autoOpenUpload, onModalOpened }) {
  const { width } = useWindowDimensions();
  const numColumns = 2;
  const cardWidth = width / numColumns - 20;

  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);

  // Upload Modal State
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCourseCode, setUploadCourseCode] = useState("");
  const [uploadModule, setUploadModule] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Details Modal State
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);

  // Focus tracking
  const [focusedField, setFocusedField] = useState(null);

  // Animated values for input focus scale
  const titleScale = useSharedValue(1);
  const courseScale = useSharedValue(1);
  const moduleScale = useSharedValue(1);
  const descScale = useSharedValue(1);

  // Slide-up animation
  const slideAnim = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    fetchResources();
  }, []);

  // Auto-open the upload modal when triggered from the main Create sheet
  useEffect(() => {
    if (autoOpenUpload) {
      openUploadModal();
      if (onModalOpened) onModalOpened();
    }
  }, [autoOpenUpload]);

  useEffect(() => {
    filterResources();
  }, [searchQuery, resources]);

  // --- Premium Modal Animation Helpers ---
  const openUploadModal = () => {
    setUploadModalVisible(true);
    backdropOpacity.value = withTiming(1, { duration: 300 });
    slideAnim.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const closeUploadModal = () => {
    backdropOpacity.value = withTiming(0, { duration: 250 });
    slideAnim.value = withSpring(SCREEN_HEIGHT, {
      damping: 20,
      stiffness: 90,
    });
    setTimeout(() => {
      setUploadModalVisible(false);
    }, 350);
  };

  // Input focus animations
  const handleInputFocus = (field) => {
    setFocusedField(field);
    const scaleMap = { title: titleScale, course: courseScale, module: moduleScale, desc: descScale };
    if (scaleMap[field]) {
      scaleMap[field].value = withSpring(1.02, { damping: 15, stiffness: 150 });
    }
    Haptics.selectionAsync();
  };

  const handleInputBlur = (field) => {
    setFocusedField(null);
    const scaleMap = { title: titleScale, course: courseScale, module: moduleScale, desc: descScale };
    if (scaleMap[field]) {
      scaleMap[field].value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  };

  const titleInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));
  const courseInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: courseScale.value }],
  }));
  const moduleInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: moduleScale.value }],
  }));
  const descInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: descScale.value }],
  }));

  const slideUpStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // --- End Animation Helpers ---

  const fetchResources = async () => {
    setLoading(true);
    try {
      const response = await fetch(RESOURCE_ENDPOINTS.GET_ALL);
      const json = await response.json();
      if (json.success) {
        setResources(json.data);
      } else {
        Alert.alert("Error", "Failed to fetch resources.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (res) =>
          res.title.toLowerCase().includes(query) ||
          res.courseCode.toLowerCase().includes(query) ||
          res.moduleName.toLowerCase().includes(query),
      );
    }

    setFilteredResources(filtered);
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      console.error("Unknown error picking file:", err);
    }
  };

  const handleUpload = async () => {
    if (!uploadTitle || !uploadCourseCode || !uploadModule || !selectedFile) {
      Alert.alert(
        "Missing Fields",
        "Please fill all required fields and select a file.",
      );
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("title", uploadTitle);
    formData.append("courseCode", uploadCourseCode);
    formData.append("moduleName", uploadModule);
    formData.append("description", uploadDescription);

    // @ts-ignore
    formData.append("file", {
      uri: selectedFile.uri,
      name: selectedFile.name,
      type: selectedFile.mimeType || "application/octet-stream",
    });
    formData.append("uploadedBy", "Student User");

    try {
      const response = await fetch(RESOURCE_ENDPOINTS.UPLOAD, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const json = await response.json();
      if (json.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "Resource uploaded successfully!");
        closeUploadModal();
        resetUploadForm();
        fetchResources();
      } else {
        Alert.alert("Upload Failed", json.message || "Something went wrong.");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      Alert.alert("Error", "Network error during upload.");
    } finally {
      setUploading(false);
    }
  };

  const resetUploadForm = () => {
    setUploadTitle("");
    setUploadCourseCode("");
    setUploadModule("");
    setUploadDescription("");
    setSelectedFile(null);
  };

  const openDetails = (resource) => {
    setSelectedResource(resource);
    setDetailsModalVisible(true);
  };

  const handleDownload = async () => {
    if (!selectedResource?.fileUrl) return;

    try {
      const fileName = selectedResource.originalName
        ? selectedResource.originalName
        : `${selectedResource.title.replace(/[^a-zA-Z0-9]/g, "_")}.${selectedResource.fileType}`;

      const fileUri = FileSystem.documentDirectory + fileName;

      const downloadRes = await FileSystem.downloadAsync(
        selectedResource.fileUrl,
        fileUri,
      );

      if (downloadRes.status !== 200) {
        Alert.alert("Error", "Failed to download file.");
        return;
      }

      const isImageOrVideo =
        fileName.match(/\.(jpg|jpeg|png|gif|mp4|mov|avi|heic)$/i) ||
        ["jpg", "jpeg", "png", "gif", "mp4", "mov", "avi"].includes(
          (selectedResource.fileType || "").toLowerCase(),
        );

      if (isImageOrVideo) {
        const { status } = await MediaLibrary.requestPermissionsAsync();

        if (status === "granted") {
          try {
            const asset = await MediaLibrary.createAssetAsync(downloadRes.uri);
            const albumName = "Download";
            const album = await MediaLibrary.getAlbumAsync(albumName);

            if (album) {
              await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
            } else {
              await MediaLibrary.createAlbumAsync(albumName, asset, false);
            }

            Alert.alert("Success", "Saved to Gallery!");
          } catch (err) {
            console.error("Gallery save error:", err);
            Alert.alert("Error", "Could not save to gallery.");
          }
        } else {
          Alert.alert(
            "Permission Required",
            "Gallery permission is needed to save media.",
          );
        }
      } else {
        if (Platform.OS === "android") {
          try {
            const permissions =
              await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

            if (permissions.granted) {
              const base64 = await FileSystem.readAsStringAsync(
                downloadRes.uri,
                { encoding: FileSystem.EncodingType.Base64 },
              );
              const mimeType = getMimeType(fileName);

              const createdUri =
                await FileSystem.StorageAccessFramework.createFileAsync(
                  permissions.directoryUri,
                  fileName,
                  mimeType,
                );

              await FileSystem.writeAsStringAsync(createdUri, base64, {
                encoding: FileSystem.EncodingType.Base64,
              });
              Alert.alert("Success", "File saved successfully!");
            }
          } catch (err) {
            console.error("SAF Error:", err);
            Alert.alert("Error", "Failed to save file to storage.");
          }
        } else {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(downloadRes.uri, { UTI: "public.item" });
          } else {
            Alert.alert("Error", "Sharing not available.");
          }
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert("Error", "Failed to download and save file.");
    }
  };

  // Check if upload form is valid
  const isFormValid = uploadTitle && uploadCourseCode && uploadModule && selectedFile;

  const renderResourceItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }]}
      onPress={() => openDetails(item)}
      activeOpacity={0.8}
    >
      <View style={styles.cardIconContainer}>
        {renderFileIcon(item.originalName, item.fileType, 32)}
      </View>
      <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
        {item.title}
      </Text>
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>{item.courseCode}</Text>
      </View>
      <Text style={styles.authorText}>By {item.uploadedBy || "Unknown"}</Text>
      <TouchableOpacity
        style={styles.cardDownloadBtn}
        onPress={() => openDetails(item)}
      >
        <Ionicons name="download-outline" size={16} color="#fff" />
        <Text style={styles.cardDownloadText}>Download</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Resource Grid */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={BRAND_RED}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={filteredResources}
          renderItem={renderResourceItem}
          ListHeaderComponent={
            <View style={styles.searchContainer}>
              <Ionicons
                name="search"
                size={20}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                ref={inputRef}
                style={styles.searchInput}
                placeholder="Search notes, papers, subjects..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
                autoFocus={false}
                blurOnSubmit={false}
              />

              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery("");
                    inputRef.current?.focus();
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={BRAND_RED}
                    style={{ marginLeft: 8 }}
                  />
                </TouchableOpacity>
              )}
            </View>
          }
          keyExtractor={(item) => item._id}
          key={numColumns}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No resources found.</Text>
          }
        />
      )}

      {/* ========== PREMIUM UPLOAD OVERLAY ========== */}
      <Modal
        visible={uploadModalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeUploadModal}
        statusBarTranslucent
      >
        {/* Glassmorphism Backdrop */}
        <Animated.View style={[styles.premiumBackdrop, backdropStyle]}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeUploadModal}
          />
        </Animated.View>

        {/* Slide-up Form Container */}
        <Animated.View style={[styles.premiumOverlay, slideUpStyle]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={0}
          >
            {/* === Header Bar === */}
            <View style={styles.premiumHeader}>
              <TouchableOpacity onPress={closeUploadModal} style={styles.headerActionBtn}>
                <Text style={styles.headerCancelText}>Cancel</Text>
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Share Resource</Text>

              <TouchableOpacity
                onPress={handleUpload}
                style={[
                  styles.headerPostBtn,
                  (!isFormValid || uploading) && styles.headerPostBtnDisabled,
                ]}
                disabled={!isFormValid || uploading}
              >
                {uploading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={[
                    styles.headerPostText,
                    !isFormValid && styles.headerPostTextDisabled,
                  ]}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Subtle drag indicator */}
            <View style={styles.dragIndicator} />

            {/* === Form Body === */}
            <ScrollView
              style={styles.premiumFormScroll}
              contentContainerStyle={styles.premiumFormContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* ====== MEDIA UPLOAD SECTION ====== */}
              <TouchableOpacity
                style={[
                  styles.mediaUploadBox,
                  selectedFile && styles.mediaUploadBoxSelected,
                ]}
                onPress={pickFile}
                activeOpacity={0.7}
              >
                {selectedFile ? (
                  <View style={styles.mediaPreview}>
                    <View style={styles.mediaPreviewIconWrap}>
                      {renderFileIcon(selectedFile.name, selectedFile.mimeType, 40)}
                    </View>
                    <Text style={styles.mediaPreviewName} numberOfLines={2}>
                      {selectedFile.name}
                    </Text>
                    <TouchableOpacity
                      style={styles.mediaChangeBtn}
                      onPress={pickFile}
                    >
                      <Ionicons name="swap-horizontal-outline" size={14} color={BRAND_RED} />
                      <Text style={styles.mediaChangeBtnText}>Change file</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.mediaPlaceholder}>
                    <View style={styles.mediaUploadIconCircle}>
                      <Ionicons name="cloud-upload-outline" size={28} color={BRAND_RED} />
                    </View>
                    <Text style={styles.mediaUploadTitle}>
                      Tap to select a file
                    </Text>
                    <Text style={styles.mediaUploadSubtitle}>
                      PDF, DOC, DOCX, PPT, Images • Max 10MB
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              {/* Document Title */}
              <Animated.View style={[styles.premiumInputRow, titleInputStyle]}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="document-text-outline" size={18} color={focusedField === 'title' ? BRAND_RED : '#bbb'} />
                </View>
                <View style={styles.inputFieldContainer}>
                  <TextInput
                    style={styles.premiumInput}
                    placeholder="Document title"
                    placeholderTextColor="#aaa"
                    value={uploadTitle}
                    onChangeText={setUploadTitle}
                    onFocus={() => handleInputFocus('title')}
                    onBlur={() => handleInputBlur('title')}
                  />
                </View>
              </Animated.View>
              <View style={styles.inputDivider} />

              {/* Course Code */}
              <Animated.View style={[styles.premiumInputRow, courseInputStyle]}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="code-slash-outline" size={18} color={focusedField === 'course' ? BRAND_RED : '#bbb'} />
                </View>
                <View style={styles.inputFieldContainer}>
                  <TextInput
                    style={styles.premiumInput}
                    placeholder="Course code (e.g., CS101)"
                    placeholderTextColor="#aaa"
                    value={uploadCourseCode}
                    onChangeText={setUploadCourseCode}
                    onFocus={() => handleInputFocus('course')}
                    onBlur={() => handleInputBlur('course')}
                  />
                </View>
              </Animated.View>
              <View style={styles.inputDivider} />

              {/* Module */}
              <Animated.View style={[styles.premiumInputRow, moduleInputStyle]}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="layers-outline" size={18} color={focusedField === 'module' ? BRAND_RED : '#bbb'} />
                </View>
                <View style={styles.inputFieldContainer}>
                  <TextInput
                    style={styles.premiumInput}
                    placeholder="Module (e.g., Data Structures)"
                    placeholderTextColor="#aaa"
                    value={uploadModule}
                    onChangeText={setUploadModule}
                    onFocus={() => handleInputFocus('module')}
                    onBlur={() => handleInputBlur('module')}
                  />
                </View>
              </Animated.View>
              <View style={styles.inputDivider} />

              {/* Description (Optional) */}
              <Animated.View style={[styles.premiumInputRow, { alignItems: 'flex-start', paddingTop: 14 }, descInputStyle]}>
                <View style={[styles.inputIconContainer, { marginTop: 2 }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={focusedField === 'desc' ? BRAND_RED : '#bbb'} />
                </View>
                <View style={styles.inputFieldContainer}>
                  <TextInput
                    style={[styles.premiumInput, styles.premiumTextArea]}
                    placeholder="Describe this resource (optional)"
                    placeholderTextColor="#aaa"
                    multiline
                    value={uploadDescription}
                    onChangeText={setUploadDescription}
                    onFocus={() => handleInputFocus('desc')}
                    onBlur={() => handleInputBlur('desc')}
                  />
                </View>
              </Animated.View>

              {/* Bottom spacer for keyboard avoidance */}
              <View style={{ height: 80 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>

      {/* Details Modal (unchanged) */}
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
                  {renderFileIcon(
                    selectedResource.originalName,
                    selectedResource.fileType,
                    50,
                  )}
                </View>
                <Text style={styles.detailsTitle}>
                  {selectedResource.title}
                </Text>
                <View style={styles.detailsBadge}>
                  <Text style={styles.detailsBadgeText}>
                    {selectedResource.courseCode}
                  </Text>
                </View>

                <View style={styles.detailsInfoRow}>
                  <Text style={styles.detailsInfoLabel}>Module</Text>
                  <Text style={styles.detailsInfoValue}>
                    {selectedResource.moduleName}
                  </Text>
                </View>
                <View style={styles.detailsInfoRow}>
                  <Text style={styles.detailsInfoLabel}>Uploaded by</Text>
                  <Text style={styles.detailsInfoValue}>
                    {selectedResource.uploadedBy || "Unknown"}
                  </Text>
                </View>
                <View style={styles.detailsInfoRow}>
                  <Text style={styles.detailsInfoLabel}>File Type</Text>
                  <Text style={styles.detailsInfoValue}>
                    {selectedResource.fileType}
                  </Text>
                </View>
                <View style={styles.detailsInfoRow}>
                  <Text style={styles.detailsInfoLabel}>File Size</Text>
                  <Text style={styles.detailsInfoValue}>
                    {selectedResource.fileSize
                      ? (selectedResource.fileSize / 1024 / 1024).toFixed(2) +
                      " MB"
                      : "N/A"}
                  </Text>
                </View>
              </View>

              {selectedResource.description ? (
                <View style={styles.descriptionCard}>
                  <Text style={styles.descriptionTitle}>Description</Text>
                  <Text style={styles.descriptionText}>
                    {selectedResource.description}
                  </Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={styles.largeDownloadBtn}
                onPress={handleDownload}
              >
                <Ionicons
                  name="download-outline"
                  size={24}
                  color="#fff"
                  style={{ marginRight: 8 }}
                />
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
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
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
    color: "#333",
  },

  listContent: {
    paddingTop: 16,
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
    color: "#000",
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
    fontWeight: "bold",
  },
  authorText: {
    fontSize: 10,
    color: "#999",
    marginBottom: 12,
  },
  cardDownloadBtn: {
    flexDirection: "row",
    backgroundColor: BRAND_RED,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  cardDownloadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#999",
    fontSize: 16,
  },

  // ==========================================
  // PREMIUM UPLOAD OVERLAY STYLES
  // ==========================================
  premiumBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  premiumOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.92,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 25,
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 16 : 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  headerActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  headerCancelText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.3,
  },
  headerPostBtn: {
    backgroundColor: BRAND_RED,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
  },
  headerPostBtnDisabled: {
    backgroundColor: "#ffb3b5",
  },
  headerPostText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  headerPostTextDisabled: {
    color: "rgba(255,255,255,0.7)",
  },
  dragIndicator: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginTop: 6,
    marginBottom: 4,
  },
  premiumFormScroll: {
    flex: 1,
  },
  premiumFormContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  // Media Upload Section (Cover-photo style)
  mediaUploadBox: {
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.08)",
    borderStyle: "dashed",
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    backgroundColor: "#fafafa",
    minHeight: 160,
  },
  mediaUploadBoxSelected: {
    borderColor: BRAND_RED,
    borderStyle: "solid",
    backgroundColor: "#fef7f7",
  },
  mediaPlaceholder: {
    alignItems: "center",
  },
  mediaUploadIconCircle: {
    width: 60,
    height: 60,
    backgroundColor: "#FFF0F0",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  mediaUploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  mediaUploadSubtitle: {
    fontSize: 12,
    color: "#999",
  },
  mediaPreview: {
    alignItems: "center",
  },
  mediaPreviewIconWrap: {
    width: 70,
    height: 70,
    backgroundColor: "#FFF0F0",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  mediaPreviewName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
    maxWidth: 220,
  },
  mediaChangeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "rgba(249,37,43,0.15)",
  },
  mediaChangeBtnText: {
    fontSize: 12,
    color: BRAND_RED,
    fontWeight: "600",
  },

  // Minimalist Input Row
  premiumInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  inputFieldContainer: {
    flex: 1,
  },
  premiumInput: {
    fontSize: 16,
    color: "#1a1a1a",
    paddingVertical: 12,
    fontWeight: "400",
  },
  premiumTextArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginLeft: 50,
    marginBottom: 4,
  },

  // Details Modal Styles (unchanged)
  detailsContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  detailsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#fff",
  },
  detailsHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  detailsContent: {
    padding: 20,
  },
  detailsCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  detailsIconContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#FFF0F0",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
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
    fontWeight: "bold",
  },
  detailsInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 12,
  },
  detailsInfoLabel: {
    color: "#999",
    fontSize: 14,
  },
  detailsInfoValue: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
  descriptionCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 30,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  largeDownloadBtn: {
    backgroundColor: BRAND_RED,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: BRAND_RED,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  largeDownloadBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
