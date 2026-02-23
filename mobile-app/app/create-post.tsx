/**
 * ====================================
 * CREATE POST SCREEN
 * ====================================
 * Modal-card style post creation with:
 * - Caption text input
 * - Media picker (image or video) via expo-image-picker
 * - Category selector with brand-red highlight
 * - Video/Image preview with clear button
 * - Navigation to preview-post screen
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode } from "expo-av";
import { useAuth } from "../src/context/AuthContext";

// ====================================
// CONSTANTS
// ====================================
const CATEGORIES = [
  "General",
  "Academic",
  "Events",
  "Sports",
  "Clubs",
  "Memes",
];

export default function CreatePostNewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const videoRef = useRef<Video>(null);

  // ── Form state ──
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // ====================================
  // AUTH GUARD
  // ====================================
  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guardContainer}>
          <Text style={styles.guardIcon}>🔒</Text>
          <Text style={styles.guardTitle}>Not Logged In</Text>
          <Text style={styles.guardSubtitle}>
            Please log in to create a post
          </Text>
          <TouchableOpacity
            style={styles.previewButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.previewButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ====================================
  // PICK MEDIA FROM GALLERY
  // ====================================
  const pickMedia = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setMedia(asset.uri);

        // Detect media type from the picker result
        // expo-image-picker returns asset.type as "image" or "video"
        if (asset.type === "video") {
          setMediaType("video");
        } else {
          setMediaType("image");
        }

        console.log(
          `📎 Media selected: ${asset.type || "image"} — ${asset.uri.slice(-30)}`,
        );
      }
    } catch (error) {
      console.error("Media pick error:", error);
      Alert.alert("Error", "Failed to pick media. Please try again.");
    }
  };

  // ====================================
  // CLEAR SELECTED MEDIA
  // ====================================
  const clearMedia = () => {
    setMedia(null);
    setMediaType("image");
  };

  // ====================================
  // HANDLE PREVIEW NAVIGATION
  // ====================================
  const handlePreview = () => {
    if (!caption.trim() && !media) {
      Alert.alert(
        "Required",
        "Please add a caption or select media before continuing.",
      );
      return;
    }

    // Navigate to preview screen with post data
    router.push({
      pathname: "/preview-post",
      params: {
        content: caption,
        media: media || "",
        mediaType: mediaType,
        category: category,
        tags: tags,
      },
    });
  };

  // ====================================
  // RENDER
  // ====================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Modal Card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Post</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={24} color="#262626" />
            </TouchableOpacity>
          </View>

          {/* ========== CAPTION INPUT ========== */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>
              What's on your mind? <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="Share your thoughts..."
              placeholderTextColor="#999"
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* ========== MEDIA PICKER ========== */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Media (Optional)</Text>
            <TouchableOpacity style={styles.mediaPicker} onPress={pickMedia}>
              {media ? (
                <View style={styles.mediaPreviewContainer}>
                  {/* Show Image or Video preview based on mediaType */}
                  {mediaType === "video" ? (
                    <View style={styles.videoPreviewWrapper}>
                      <Video
                        ref={videoRef}
                        source={{ uri: media }}
                        style={styles.mediaPreview}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={false}
                        isMuted
                      />
                      {/* Video badge overlay */}
                      <View style={styles.videoBadge}>
                        <Ionicons name="videocam" size={14} color="#fff" />
                        <Text style={styles.videoBadgeText}>Video</Text>
                      </View>
                    </View>
                  ) : (
                    <Image
                      source={{ uri: media }}
                      style={styles.mediaPreview}
                    />
                  )}

                  {/* X button to clear selection */}
                  <TouchableOpacity
                    style={styles.removeMedia}
                    onPress={clearMedia}
                  >
                    <Ionicons name="close-circle" size={26} color="#f9252b" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.mediaPlaceholder}>
                  <Ionicons name="images-outline" size={32} color="#999" />
                  <Text style={styles.mediaText}>Add photos or videos</Text>
                  <Text style={styles.mediaSubtext}>
                    Tap to select from gallery
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ========== CATEGORY SELECTOR ========== */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipActive,
                    ]}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        isSelected && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ========== TAGS INPUT ========== */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Tags</Text>
            <TextInput
              style={styles.input}
              placeholder="campus, events, community"
              placeholderTextColor="#999"
              value={tags}
              onChangeText={setTags}
            />
            <Text style={styles.hint}>Separate tags with commas</Text>
          </View>

          {/* ========== ACTION BUTTONS ========== */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.previewButton,
                isUploading && styles.buttonDisabled,
              ]}
              onPress={handlePreview}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.previewButtonText}>Preview</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 20 : 20,
  },
  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
  },
  closeButton: {
    padding: 4,
  },
  // Form
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#262626",
    marginBottom: 8,
  },
  required: {
    color: "#f9252b",
  },
  textArea: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top",
    color: "#262626",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#262626",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
  },
  // Media Picker
  mediaPicker: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    borderRadius: 8,
    overflow: "hidden",
  },
  mediaPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  mediaText: {
    fontSize: 14,
    color: "#666",
    marginTop: 8,
  },
  mediaSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  mediaPreviewContainer: {
    position: "relative",
  },
  videoPreviewWrapper: {
    position: "relative",
  },
  mediaPreview: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  videoBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  videoBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  removeMedia: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 13,
  },
  // Category Selector
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  categoryChipActive: {
    backgroundColor: "#f9252b",
    borderColor: "#f9252b",
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
  },
  categoryChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  // Buttons
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 12,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#262626",
  },
  previewButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#f9252b",
    alignItems: "center",
  },
  previewButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  buttonDisabled: {
    backgroundColor: "#fca5a5",
  },
  // Auth Guard
  guardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  guardIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  guardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 8,
  },
  guardSubtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 24,
  },
});
