/**
 * ====================================
 * POST PREVIEW SCREEN
 * ====================================
 * Shows a preview of the post before publishing.
 * Displays user info, content, media, and tags.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../src/context/AuthContext";
import { POST_ENDPOINTS } from "../src/config/api";

export default function PreviewPostScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    content: string;
    media?: string;
    tags?: string;
  }>();

  const [isUploading, setIsUploading] = useState(false);

  // Parse tags into array
  const tagsArray = params.tags
    ? params.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  // Handle post upload
  const handlePostNow = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to post.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("caption", params.content || "");
      formData.append("userId", user.id);

      if (params.tags) {
        formData.append("tags", params.tags);
      }

      // Add media if present
      if (params.media) {
        const filename = params.media.split("/").pop() || "photo.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";

        // @ts-ignore
        formData.append("media", {
          uri: params.media,
          name: filename,
          type: type,
        });
      }

      const response = await fetch(POST_ENDPOINTS.CREATE, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("🎉 Success!", "Your post has been shared!", [
          {
            text: "OK",
            onPress: () => {
              // Navigate back to home (go back multiple screens)
              router.dismissAll();
              router.replace("/(tabs)");
            },
          },
        ]);
      } else {
        Alert.alert("Upload Failed", data.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Connection Error", "Could not connect to server.");
    } finally {
      setIsUploading(false);
    }
  };

  // Get user display name and initial
  const displayName = user?.username || "Your Name";
  const userInitial = displayName.charAt(0).toUpperCase();

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
            <Text style={styles.headerTitle}>Preview Your Post</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={24} color="#262626" />
            </TouchableOpacity>
          </View>

          {/* Post Preview Card */}
          <View style={styles.postPreview}>
            {/* User Info Row */}
            <View style={styles.userRow}>
              {user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{userInitial}</Text>
                </View>
              )}
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{displayName}</Text>
                <Text style={styles.postTime}>Just now</Text>
              </View>
            </View>

            {/* Post Content */}
            <Text style={styles.postContent}>{params.content}</Text>

            {/* Media Preview (if any) */}
            {params.media && (
              <Image
                source={{ uri: params.media }}
                style={styles.mediaImage}
                resizeMode="cover"
              />
            )}

            {/* Tags */}
            {tagsArray.length > 0 && (
              <View style={styles.tagsRow}>
                {tagsArray.map((tag, index) => (
                  <Text key={index} style={styles.tag}>
                    #{tag}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            This is how your post will appear in the feed
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.back()}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.postButton, isUploading && styles.buttonDisabled]}
              onPress={handlePostNow}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.postButtonText}>Post Now</Text>
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
  },
  closeButton: {
    padding: 4,
  },
  // Post Preview
  postPreview: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 16,
    marginBottom: 16,
  },
  // User Row
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f9252b",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  userInfo: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },
  postTime: {
    fontSize: 12,
    color: "#999",
  },
  // Post Content
  postContent: {
    fontSize: 15,
    color: "#262626",
    lineHeight: 22,
    marginBottom: 12,
  },
  // Media
  mediaImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  // Tags
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    fontSize: 13,
    color: "#f9252b",
    fontWeight: "500",
  },
  // Footer
  footerText: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  // Buttons
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#262626",
  },
  postButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: "#f9252b",
    alignItems: "center",
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
  buttonDisabled: {
    backgroundColor: "#fca5a5",
  },
});
