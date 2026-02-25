/**
 * ====================================
 * CREATE REEL SCREEN
 * ====================================
 * Modal-card style reel creation with:
 * - Video upload (required) via expo-image-picker
 * - Caption input
 * - Category selector with brand-red highlight
 * - Tags input
 * - Direct "Share Reel" upload button
 * - Preview navigation button
 *
 * Matches the Create Post screen design.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
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
import { POST_ENDPOINTS } from "../src/config/api";

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

export default function CreateReelScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // ── Form state ──
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
            Please log in to create a reel
          </Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.shareButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ====================================
  // PICK VIDEO FROM GALLERY
  // ====================================
  const pickVideo = async () => {
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
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedVideo(result.assets[0].uri);
        console.log(`📎 Video selected: ${result.assets[0].uri.slice(-30)}`);
      }
    } catch (error) {
      console.error("Video pick error:", error);
      Alert.alert("Error", "Failed to pick video. Please try again.");
    }
  };

  // ====================================
  // CLEAR SELECTED VIDEO
  // ====================================
  const clearVideo = () => {
    setSelectedVideo(null);
  };

  // ====================================
  // HANDLE PREVIEW NAVIGATION
  // ====================================
  const handlePreview = () => {
    if (!selectedVideo) {
      Alert.alert("Required Field", "Please select a video before continuing.");
      return;
    }

    // Navigate to preview screen with reel data
    router.push({
      pathname: "/preview-reel",
      params: {
        video: selectedVideo,
        caption: caption,
        tags: tags,
      },
    });
  };

  // ====================================
  // HANDLE SHARE REEL (UPLOAD)
  // ====================================
  const handleShareReel = async () => {
    // Validate
    if (!user) {
      Alert.alert("Error", "You must be logged in to post.");
      return;
    }

    if (!selectedVideo) {
      Alert.alert("Video Required", "Please select a video to share.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build FormData
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("caption", caption);
      formData.append("category", category);

      // CRITICAL ANDROID FIX:
      // Android requires the file to be appended as an object with
      // uri, name, and type — not as a Blob.
      const filename = selectedVideo.split("/").pop() || "upload.mp4";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `video/${match[1]}` : "video/mp4";

      formData.append("media", {
        uri: selectedVideo,
        name: filename,
        type: type,
      });

      console.log(`📤 Uploading video: ${filename} (${type})`);

      // POST to backend
      const response = await fetch(POST_ENDPOINTS.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("🎉 Success!", "Your reel has been shared!", [
          {
            text: "OK",
            onPress: () => {
              // Clear all states
              setSelectedVideo(null);
              setCaption("");
              setCategory("General");
              setTags("");

              // Navigate back to feed
              router.replace("/");
            },
          },
        ]);
      } else {
        Alert.alert(
          "Upload Failed",
          data.message || "Something went wrong. Please try again.",
        );
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      Alert.alert(
        "Connection Error",
        "Could not connect to the server. Please check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
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
            <Text style={styles.headerTitle}>Create Reel</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={24} color="#262626" />
            </TouchableOpacity>
          </View>

          {/* ========== CAPTION INPUT ========== */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Caption</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Write a caption..."
              placeholderTextColor="#999"
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* ========== VIDEO PICKER ========== */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>
              Video <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.mediaPicker} onPress={pickVideo}>
              {selectedVideo ? (
                <View style={styles.mediaPreviewContainer}>
                  <Video
                    source={{ uri: selectedVideo }}
                    style={styles.mediaPreview}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                    isLooping={false}
                    isMuted
                  />
                  {/* Play icon overlay */}
                  <View style={styles.videoOverlay}>
                    <Ionicons name="play-circle" size={48} color="#fff" />
                  </View>

                  {/* X button to clear selection */}
                  <TouchableOpacity
                    style={styles.removeMedia}
                    onPress={clearVideo}
                  >
                    <Ionicons name="close-circle" size={26} color="#f9252b" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.mediaPlaceholder}>
                  <Ionicons name="videocam-outline" size={32} color="#999" />
                  <Text style={styles.mediaText}>Add a video</Text>
                  <Text style={styles.mediaSubtext}>
                    Tap to select from gallery (max 60s)
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
              placeholder="music, dance, fun"
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
              disabled={isSubmitting}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.previewButton,
                styles.previewButtonOutline,
                isSubmitting && styles.buttonDisabledOutline,
              ]}
              onPress={handlePreview}
              disabled={isSubmitting}
            >
              <Text style={styles.previewButtonTextOutline}>Preview</Text>
            </TouchableOpacity>
          </View>

          {/* ========== SHARE REEL BUTTON ========== */}
          <TouchableOpacity
            style={[
              styles.shareButton,
              (!selectedVideo || isSubmitting) && styles.buttonDisabled,
            ]}
            onPress={handleShareReel}
            disabled={!selectedVideo || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <View style={styles.shareButtonContent}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.shareButtonText}>Uploading...</Text>
              </View>
            ) : (
              <View style={styles.shareButtonContent}>
                <Ionicons name="paper-plane" size={18} color="#fff" />
                <Text style={styles.shareButtonText}>Share Reel</Text>
              </View>
            )}
          </TouchableOpacity>
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
  // Media Picker (matches Create Post)
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
  mediaPreview: {
    width: "100%",
    height: 200,
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeMedia: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 13,
  },
  // Category Selector (matches Create Post)
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
  // Buttons (matches Create Post)
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
  previewButtonOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f9252b",
  },
  previewButtonTextOutline: {
    fontSize: 15,
    fontWeight: "600",
    color: "#f9252b",
  },
  // Share Reel Button (matches Create Post)
  shareButton: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: "#f9252b",
    alignItems: "center",
  },
  shareButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  buttonDisabled: {
    backgroundColor: "#fca5a5",
  },
  buttonDisabledOutline: {
    borderColor: "#fca5a5",
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
