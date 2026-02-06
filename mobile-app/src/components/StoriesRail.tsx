/**
 * ====================================
 * STORIES RAIL COMPONENT
 * ====================================
 * Instagram-style stories rail with mini-poster cards.
 *
 * Features:
 * - Horizontal scrollable stories list
 * - Mini-Poster card design (vertical rectangles)
 * - Red border for unviewed, gray border for viewed
 * - "Add Story" card for current user with image picker
 * - Full-screen modal for viewing stories
 * - Auto-close after 5 seconds or on tap
 * - Real API integration with backend
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import { STORY_ENDPOINTS } from "../config/api";

// ====================================
// TYPES
// ====================================
interface StoryUser {
  _id: string;
  username: string;
  email?: string;
  profilePicture?: string;
}

interface Story {
  _id: string;
  user: StoryUser;
  mediaUrl: string;
  mediaType: string;
  viewed: boolean;
  createdAt: string;
  viewerCount?: number;
}

// ====================================
// CONSTANTS
// ====================================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = 90;
const CARD_HEIGHT = 125;
const CARD_BORDER_RADIUS = 12;
const STORY_DISPLAY_DURATION = 5000; // 5 seconds

// Default avatar for users without profile picture
const DEFAULT_AVATAR = "https://via.placeholder.com/100x100?text=User";

// ====================================
// ADD STORY CARD (Current User)
// ====================================
interface AddStoryCardProps {
  userAvatar?: string;
  onPress: () => void;
  isUploading: boolean;
}

const AddStoryCard: React.FC<AddStoryCardProps> = ({
  userAvatar,
  onPress,
  isUploading,
}) => (
  <TouchableOpacity
    style={styles.storyCard}
    activeOpacity={0.8}
    onPress={onPress}
    disabled={isUploading}
  >
    <View style={styles.addStoryContainer}>
      {/* User's avatar as background */}
      <Image
        source={{ uri: userAvatar || DEFAULT_AVATAR }}
        style={styles.addStoryBackground}
        resizeMode="cover"
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.cardGradient}
      />

      {/* Plus icon circle or loading indicator */}
      <View style={styles.addIconContainer}>
        {isUploading ? (
          <View style={styles.addIconCircle}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        ) : (
          <View style={styles.addIconCircle}>
            <Ionicons name="add" size={18} color="#fff" />
          </View>
        )}
      </View>

      {/* Username */}
      <Text style={styles.storyUsername} numberOfLines={1}>
        {isUploading ? "Uploading..." : "Add Story"}
      </Text>
    </View>
  </TouchableOpacity>
);

// ====================================
// STORY CARD
// ====================================
interface StoryCardProps {
  story: Story;
  onPress: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onPress }) => {
  const avatarUri = story.user?.profilePicture || DEFAULT_AVATAR;
  const username = story.user?.username || "Unknown";

  return (
    <TouchableOpacity
      style={[
        styles.storyCard,
        story.viewed ? styles.viewedBorder : styles.unviewedBorder,
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <ImageBackground
        source={{ uri: story.mediaUrl }}
        style={styles.storyBackground}
        imageStyle={styles.storyBackgroundImage}
        resizeMode="cover"
      >
        {/* Gradient overlay for text readability */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.cardGradient}
        />

        {/* User avatar overlay (bottom-left) */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatarUri }}
            style={[
              styles.userAvatar,
              story.viewed
                ? styles.avatarViewedBorder
                : styles.avatarUnviewedBorder,
            ]}
          />
        </View>

        {/* Username at bottom */}
        <Text style={styles.storyUsername} numberOfLines={1}>
          {username}
        </Text>
      </ImageBackground>
    </TouchableOpacity>
  );
};

// ====================================
// STORY VIEWER MODAL
// ====================================
interface StoryViewerModalProps {
  visible: boolean;
  story: Story | null;
  onClose: () => void;
}

const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  visible,
  story,
  onClose,
}) => {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible && story) {
      // Start progress animation
      setProgress(0);
      const progressInterval = 50; // Update every 50ms
      const steps = STORY_DISPLAY_DURATION / progressInterval;
      let currentStep = 0;

      progressRef.current = setInterval(() => {
        currentStep++;
        setProgress(currentStep / steps);
      }, progressInterval);

      // Auto-close timer
      timerRef.current = setTimeout(() => {
        onClose();
      }, STORY_DISPLAY_DURATION);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
    };
  }, [visible, story, onClose]);

  if (!story) return null;

  const avatarUri = story.user?.profilePicture || DEFAULT_AVATAR;
  const username = story.user?.username || "Unknown";

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="black" barStyle="light-content" />
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>

        {/* Header with user info */}
        <View style={styles.modalHeader}>
          <Image source={{ uri: avatarUri }} style={styles.modalAvatar} />
          <Text style={styles.modalUsername}>{username}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Story Image */}
        <Image
          source={{ uri: story.mediaUrl }}
          style={styles.modalImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Modal>
  );
};

// ====================================
// MAIN COMPONENT
// ====================================
const StoriesRail: React.FC = () => {
  // Auth context for current user
  const { user } = useAuth();

  // State
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // ====================================
  // FETCH STORIES
  // ====================================
  const fetchStories = useCallback(async () => {
    try {
      const url = user
        ? `${STORY_ENDPOINTS.GET_ALL}?userId=${user.id}`
        : STORY_ENDPOINTS.GET_ALL;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        // Filter out current user's stories from the main list
        // (they'll be handled separately via "Add Story" card)
        const otherStories = data.data.filter(
          (story: Story) => story.user?._id !== user?.id,
        );
        setStories(otherStories);
      }
    } catch (error) {
      console.error("❌ Failed to fetch stories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  // ====================================
  // UPLOAD STORY
  // ====================================
  const handleAddStory = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to add a story.");
      return;
    }

    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos to add a story.",
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [9, 16], // Story aspect ratio
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const selectedImage = result.assets[0];
      setIsUploading(true);

      // Prepare form data
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("media", {
        uri: selectedImage.uri,
        type: selectedImage.mimeType || "image/jpeg",
        name: `story_${Date.now()}.jpg`,
      } as unknown as Blob);

      // Upload to backend
      const response = await fetch(STORY_ENDPOINTS.CREATE, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Story uploaded successfully");
        // Refresh stories list
        fetchStories();
      } else {
        Alert.alert("Upload Failed", data.message || "Failed to upload story");
      }
    } catch (error) {
      console.error("❌ Story upload error:", error);
      Alert.alert("Error", "Failed to upload story. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // ====================================
  // VIEW STORY
  // ====================================
  const handleViewStory = async (story: Story) => {
    setSelectedStory(story);
    setIsModalVisible(true);

    // Mark as viewed in the backend
    if (user && !story.viewed) {
      try {
        await fetch(STORY_ENDPOINTS.MARK_VIEWED(story._id), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        });

        // Update local state to mark as viewed
        setStories((prevStories) =>
          prevStories.map((s) =>
            s._id === story._id ? { ...s, viewed: true } : s,
          ),
        );
      } catch (error) {
        console.error("❌ Failed to mark story as viewed:", error);
      }
    }
  };

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    setSelectedStory(null);
  }, []);

  // ====================================
  // RENDER
  // ====================================
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color="#f9252b" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Add Story Card (First) */}
        <AddStoryCard
          userAvatar={user?.profilePicture}
          onPress={handleAddStory}
          isUploading={isUploading}
        />

        {/* Other Users' Stories */}
        {stories.map((story) => (
          <StoryCard
            key={story._id}
            story={story}
            onPress={() => handleViewStory(story)}
          />
        ))}
      </ScrollView>

      {/* Story Viewer Modal */}
      <StoryViewerModal
        visible={isModalVisible}
        story={selectedStory}
        onClose={handleCloseModal}
      />
    </View>
  );
};

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
  },
  loadingContainer: {
    minHeight: CARD_HEIGHT + 24,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 10,
  },

  // Story Card Base
  storyCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_BORDER_RADIUS,
    overflow: "hidden",
  },

  // Border States
  unviewedBorder: {
    borderWidth: 2.5,
    borderColor: "#f9252b",
  },
  viewedBorder: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  // Story Background
  storyBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  storyBackgroundImage: {
    borderRadius: CARD_BORDER_RADIUS - 2,
  },

  // Gradient Overlay
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_BORDER_RADIUS - 2,
  },

  // Avatar (Bottom-left corner)
  avatarContainer: {
    position: "absolute",
    bottom: 22,
    left: 4,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  avatarUnviewedBorder: {
    borderColor: "#f9252b",
  },
  avatarViewedBorder: {
    borderColor: "#e0e0e0",
  },

  // Username Text
  storyUsername: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
    paddingHorizontal: 4,
    paddingBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Add Story Card
  addStoryContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#262626",
    borderRadius: CARD_BORDER_RADIUS,
  },
  addStoryBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_BORDER_RADIUS,
    opacity: 0.6,
  },
  addIconContainer: {
    position: "absolute",
    bottom: 22,
    left: 4,
  },
  addIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f9252b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    position: "absolute",
    top: 50,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    zIndex: 10,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  modalHeader: {
    position: "absolute",
    top: 60,
    left: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  modalAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
  },
  modalUsername: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
    flex: 1,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  closeButton: {
    padding: 4,
  },
  modalImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});

export default StoriesRail;
