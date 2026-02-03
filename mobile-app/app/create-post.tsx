/**
 * ====================================
 * CREATE POST SCREEN
 * ====================================
 * Allows users to:
 * - Pick an image from their gallery
 * - Add a caption
 * - Select a category
 * - Upload and share the post
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { POST_ENDPOINTS } from "../src/config/api";

// Post categories
const CATEGORIES = [
  "General",
  "Academic",
  "Events",
  "Sports",
  "Clubs",
  "Memes",
];

// Dummy user ID for testing (replace with real auth in Phase 4)
const DUMMY_USER_ID = "697e42ecc42b21e774a425de";

export default function CreatePostScreen() {
  const router = useRouter();

  // State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState("General");
  const [isUploading, setIsUploading] = useState(false);

  // ====================================
  // PICK IMAGE FROM GALLERY
  // ====================================
  const pickImage = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to upload images.",
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8, // Compress slightly for faster upload
      });

      console.log("📷 Image picker result:", result);

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image pick error:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  // ====================================
  // UPLOAD POST
  // ====================================
  const uploadPost = async () => {
    if (!selectedImage) {
      Alert.alert("No Image", "Please select an image first!");
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for multipart upload
      const formData = new FormData();

      // Append the image file
      // Extract filename from URI
      const filename = selectedImage.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      // @ts-ignore - FormData append type issue in React Native
      formData.append("media", {
        uri: selectedImage,
        name: filename,
        type: type,
      });

      // Append other fields
      formData.append("caption", caption);
      formData.append("category", category);
      formData.append("userId", DUMMY_USER_ID);

      console.log("📤 Uploading to:", POST_ENDPOINTS.CREATE);

      // Make the POST request
      const response = await fetch(POST_ENDPOINTS.CREATE, {
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type for FormData - fetch will set it automatically
          // with the correct boundary
        },
      });

      const data = await response.json();
      console.log("📥 Server response:", data);

      if (data.success) {
        Alert.alert("🎉 Success!", "Your post has been shared!", [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setSelectedImage(null);
              setCaption("");
              setCategory("General");
              // Navigate back
              router.back();
            },
          },
        ]);
      } else {
        Alert.alert("❌ Upload Failed", data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "🔌 Connection Error",
        "Could not connect to server.\n\nMake sure:\n1. Backend is running\n2. IP address is correct\n3. Same WiFi network",
      );
    } finally {
      setIsUploading(false);
    }
  };

  // ====================================
  // RENDER
  // ====================================
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Post</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Image Picker Area */}
      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.placeholderContent}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.placeholderText}>Tap to select a photo</Text>
            <Text style={styles.placeholderSubtext}>
              Choose from your gallery
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Change Photo Button (shown when image selected) */}
      {selectedImage && (
        <TouchableOpacity style={styles.changePhotoBtn} onPress={pickImage}>
          <Text style={styles.changePhotoText}>📷 Change Photo</Text>
        </TouchableOpacity>
      )}

      {/* Caption Input */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Caption</Text>
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption..."
          placeholderTextColor="#999"
          value={caption}
          onChangeText={setCaption}
          multiline
          maxLength={500}
        />
        <Text style={styles.charCount}>{caption.length}/500</Text>
      </View>

      {/* Category Selector */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                category === cat && styles.categoryChipActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Upload Button */}
      <TouchableOpacity
        style={[
          styles.uploadButton,
          (!selectedImage || isUploading) && styles.uploadButtonDisabled,
        ]}
        onPress={uploadPost}
        disabled={!selectedImage || isUploading}
      >
        {isUploading ? (
          <View style={styles.uploadingContent}>
            <ActivityIndicator color="#fff" />
            <Text style={styles.uploadButtonText}> Uploading...</Text>
          </View>
        ) : (
          <Text style={styles.uploadButtonText}>🚀 Share Post</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
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
  content: {
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  backButton: {
    padding: 5,
  },
  backText: {
    fontSize: 16,
    color: "#457b9d",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1d3557",
  },
  placeholder: {
    width: 60, // Balance the header
  },
  imagePicker: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    minHeight: 250,
    marginBottom: 15,
  },
  placeholderContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    minHeight: 250,
  },
  cameraIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  placeholderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1d3557",
    marginBottom: 5,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: "#999",
  },
  previewImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  changePhotoBtn: {
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  changePhotoText: {
    color: "#457b9d",
    fontSize: 14,
    fontWeight: "600",
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1d3557",
    marginBottom: 10,
  },
  captionInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  charCount: {
    textAlign: "right",
    color: "#999",
    fontSize: 12,
    marginTop: 5,
  },
  categoryScroll: {
    flexDirection: "row",
  },
  categoryChip: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  categoryChipActive: {
    backgroundColor: "#e63946",
    borderColor: "#e63946",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#fff",
  },
  uploadButton: {
    backgroundColor: "#e63946",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  uploadButtonDisabled: {
    backgroundColor: "#ccc",
  },
  uploadingContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  uploadButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
