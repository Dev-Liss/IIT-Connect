/**
 * ====================================
 * CREATE REEL SCREEN
 * ====================================
 * Modal-card style reel creation with:
 * - Video upload (required)
 * - Caption input
 * - Tags input
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

export default function CreateReelScreen() {
  const router = useRouter();
  const { user } = useAuth();

  // Form state
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Auth guard
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
            style={styles.previewButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.previewButtonText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Pick video from gallery
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
      }
    } catch (error) {
      console.error("Video pick error:", error);
      Alert.alert("Error", "Failed to pick video. Please try again.");
    }
  };

  // Handle preview - navigate to preview screen
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

          {/* Video Picker */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>
              Video <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity style={styles.videoPicker} onPress={pickVideo}>
              {selectedVideo ? (
                <View style={styles.videoPreviewContainer}>
                  <Video
                    source={{ uri: selectedVideo }}
                    style={styles.videoPreview}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={false}
                    isLooping={false}
                    isMuted
                  />
                  <View style={styles.videoOverlay}>
                    <Ionicons name="play-circle" size={48} color="#fff" />
                  </View>
                  <TouchableOpacity
                    style={styles.removeVideo}
                    onPress={() => setSelectedVideo(null)}
                  >
                    <Ionicons name="close-circle" size={24} color="#f9252b" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.videoPlaceholder}>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={36}
                    color="#999"
                  />
                  <Text style={styles.videoText}>Click to upload video</Text>
                  <Text style={styles.videoSubtext}>
                    MP4, MOV, AVI up to 100MB
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Caption Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Caption</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Write a caption..."
              placeholderTextColor="#999"
              value={caption}
              onChangeText={setCaption}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Tags Input */}
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

          {/* Action Buttons */}
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
    minHeight: 80,
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
  // Video Picker
  videoPicker: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    borderRadius: 8,
    overflow: "hidden",
  },
  videoPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  videoText: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
  videoSubtext: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
  },
  videoPreviewContainer: {
    position: "relative",
  },
  videoPreview: {
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
  removeVideo: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
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
