/**
 * ====================================
 * STORIES RAIL COMPONENT (v2.0)
 * ====================================
 * Instagram-style stories rail with grouped stories and sequential playback.
 *
 * Features:
 * - Horizontal scrollable stories list
 * - Stories GROUPED by user (one card per user)
 * - "My Story" card shows preview of uploaded content
 * - Red border for unviewed, NO border for viewed
 * - Sequential playback with multiple progress bars
 * - Auto-advance through all stories from a user
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
  mediaUrl: string;
  mediaType?: string;
  viewed: boolean;
  createdAt: string;
}

// New grouped story type from backend
interface StoryGroup {
  user: StoryUser;
  stories: Story[];
  allViewed: boolean;
}

// ====================================
// CONSTANTS
// ====================================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CARD_WIDTH = 90;
const CARD_HEIGHT = 125;
const CARD_BORDER_RADIUS = 12;
const STORY_DISPLAY_DURATION = 5000; // 5 seconds per story

// Default avatar for users without profile picture
const DEFAULT_AVATAR = "https://via.placeholder.com/100x100?text=User";

// ====================================
// MY STORY CARD (Current User)
// ====================================
interface MyStoryCardProps {
  userAvatar?: string;
  myStories: Story[];
  allViewed: boolean;
  onPressAdd: () => void;
  onPressView: () => void;
  isUploading: boolean;
}

const MyStoryCard: React.FC<MyStoryCardProps> = ({
  userAvatar,
  myStories,
  allViewed,
  onPressAdd,
  onPressView,
  isUploading,
}) => {
  const hasStories = myStories.length > 0;
  // Use the most recent story as the preview background
  const previewImage = hasStories
    ? myStories[myStories.length - 1].mediaUrl
    : userAvatar || DEFAULT_AVATAR;

  const handlePress = () => {
    if (hasStories) {
      onPressView();
    } else {
      onPressAdd();
    }
  };

  // Border logic: red if has stories and not all viewed, no border otherwise
  const showUnviewedBorder = hasStories && !allViewed;

  return (
    <TouchableOpacity
      style={[styles.storyCard, showUnviewedBorder && styles.unviewedBorder]}
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={isUploading}
    >
      <View style={styles.addStoryContainer}>
        {/* Background: Story preview if exists, otherwise avatar */}
        <Image
          source={{ uri: previewImage }}
          style={styles.addStoryBackground}
          resizeMode="cover"
        />

        {/* Gradient overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.cardGradient}
        />

        {/* Plus icon or loading indicator */}
        <View style={styles.addIconContainer}>
          {isUploading ? (
            <View style={styles.addIconCircle}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addIconCircle}
              onPress={onPressAdd}
              disabled={isUploading}
            >
              <Ionicons name="add" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Story count badge removed from thumbnail - only show in modal */}

        {/* Username */}
        <Text style={styles.storyUsername} numberOfLines={1}>
          {isUploading
            ? "Uploading..."
            : hasStories
              ? "Your Story"
              : "Add Story"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ====================================
// STORY GROUP CARD (Friend's Stories)
// ====================================
interface StoryGroupCardProps {
  group: StoryGroup;
  onPress: () => void;
}

const StoryGroupCard: React.FC<StoryGroupCardProps> = ({ group, onPress }) => {
  const avatarUri = group.user?.profilePicture || DEFAULT_AVATAR;
  const username = group.user?.username || "Unknown";
  // Use the most recent story as the preview
  const previewImage = group.stories[group.stories.length - 1]?.mediaUrl;

  return (
    <TouchableOpacity
      style={[
        styles.storyCard,
        // Red border for unviewed, NO border for viewed
        !group.allViewed && styles.unviewedBorder,
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Story thumbnail as background */}
      <Image
        source={{ uri: previewImage }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Gradient overlay for text readability */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.cardGradient}
      />

      {/* Content container */}
      <View style={styles.storyContentContainer}>
        {/* User avatar overlay (bottom-left) */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: avatarUri }}
            style={[
              styles.userAvatar,
              !group.allViewed && styles.avatarUnviewedBorder,
            ]}
          />
        </View>

        {/* Story count badge removed from thumbnail - only show in modal */}

        {/* Username at bottom */}
        <Text style={styles.storyUsername} numberOfLines={1}>
          {username}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// ====================================
// STORY VIEWER MODAL (Sequential Playback)
// ====================================
interface StoryViewerModalProps {
  visible: boolean;
  group: StoryGroup | null;
  onClose: () => void;
  onStoryViewed: (storyId: string) => void;
}

const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  visible,
  group,
  onClose,
  onStoryViewed,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset to first story when opening a new group
  useEffect(() => {
    if (visible && group) {
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [visible, group]);

  // Store stable references to callbacks to avoid useEffect re-triggers
  const onCloseRef = useRef(onClose);
  const onStoryViewedRef = useRef(onStoryViewed);

  // Keep refs updated with latest callbacks
  useEffect(() => {
    onCloseRef.current = onClose;
    onStoryViewedRef.current = onStoryViewed;
  }, [onClose, onStoryViewed]);

  // Handle story timing and auto-advance
  useEffect(() => {
    if (visible && group && group.stories.length > 0) {
      const currentStory = group.stories[currentIndex];

      // Mark story as viewed
      if (currentStory && !currentStory.viewed) {
        onStoryViewedRef.current(currentStory._id);
      }

      // Start progress animation
      setProgress(0);
      const progressInterval = 50; // Update every 50ms
      const steps = STORY_DISPLAY_DURATION / progressInterval;
      let currentStep = 0;

      progressRef.current = setInterval(() => {
        currentStep++;
        setProgress(currentStep / steps);
      }, progressInterval);

      // Capture group length for closure
      const storiesLength = group.stories.length;

      // Auto-advance or close timer
      timerRef.current = setTimeout(() => {
        if (currentIndex < storiesLength - 1) {
          // Move to next story
          setCurrentIndex((prev) => prev + 1);
        } else {
          // Close modal after last story
          onCloseRef.current();
        }
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
    // Only depend on stable values - callbacks are accessed via refs
  }, [visible, group, currentIndex]);

  // Handle tap to go next/previous
  const handleTap = (event: { nativeEvent: { locationX: number } }) => {
    const tapX = event.nativeEvent.locationX;
    const screenThird = SCREEN_WIDTH / 3;

    // Clear current timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);

    if (tapX < screenThird) {
      // Left third - go to previous story
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    } else if (tapX > screenThird * 2) {
      // Right third - go to next story or close
      if (group && currentIndex < group.stories.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        onClose();
      }
    } else {
      // Middle - close
      onClose();
    }
  };

  if (!group || group.stories.length === 0) return null;

  // Ensure currentIndex is within bounds
  const safeIndex = Math.min(currentIndex, group.stories.length - 1);
  const currentStory = group.stories[safeIndex];

  // Extra safety check - if story is undefined, close modal
  if (!currentStory) {
    return null;
  }

  const avatarUri = group.user?.profilePicture || DEFAULT_AVATAR;
  const username = group.user?.username || "Unknown";

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
        onPress={handleTap}
      >
        {/* Multiple Progress Bars */}
        <View style={styles.progressBarContainer}>
          {group.stories.map((_, index) => (
            <View key={index} style={styles.progressBarWrapper}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width:
                        index < safeIndex
                          ? "100%"
                          : index === safeIndex
                            ? `${progress * 100}%`
                            : "0%",
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Header with user info and story count */}
        <View style={styles.modalHeader}>
          <Image source={{ uri: avatarUri }} style={styles.modalAvatar} />
          <View style={styles.modalUserInfo}>
            <Text style={styles.modalUsername}>{username}</Text>
            {group.stories.length > 1 && (
              <Text style={styles.modalStoryCount}>
                {safeIndex + 1} / {group.stories.length}
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Story Image */}
        <Image
          source={{ uri: currentStory.mediaUrl }}
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
  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [myStoryGroup, setMyStoryGroup] = useState<StoryGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StoryGroup | null>(null);
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
        const groups: StoryGroup[] = data.data;

        // Separate current user's stories from others
        const myGroup = groups.find((g) => g.user?._id === user?.id) || null;
        const otherGroups = groups.filter((g) => g.user?._id !== user?.id);

        setMyStoryGroup(myGroup);
        setStoryGroups(otherGroups);
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

      // Launch image picker - disabled editing to preserve original aspect ratio
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
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
      // Note: Don't set Content-Type header manually for multipart/form-data
      // Let fetch auto-generate it with the correct boundary
      const response = await fetch(STORY_ENDPOINTS.CREATE, {
        method: "POST",
        body: formData,
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
  // VIEW STORIES
  // ====================================
  const handleViewStories = (group: StoryGroup) => {
    setSelectedGroup(group);
    setIsModalVisible(true);
  };

  const handleViewMyStories = () => {
    if (myStoryGroup) {
      setSelectedGroup(myStoryGroup);
      setIsModalVisible(true);
    }
  };

  const handleStoryViewed = useCallback(
    async (storyId: string) => {
      if (!user) return;

      try {
        // Fire and forget - don't await to prevent blocking
        fetch(STORY_ENDPOINTS.MARK_VIEWED(storyId), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        }).catch((error) => {
          console.error("❌ Failed to mark story as viewed:", error);
        });

        // Update local state to mark as viewed - preserve all story data
        setStoryGroups((prevGroups) =>
          prevGroups.map((group) => {
            // Update stories with viewed status
            const updatedStories = group.stories.map((s) =>
              s._id === storyId ? { ...s, viewed: true } : s,
            );
            // Recalculate allViewed based on updated stories
            const allViewed = updatedStories.every((s) => s.viewed);
            return {
              ...group,
              stories: updatedStories,
              allViewed,
            };
          }),
        );

        // Also update myStoryGroup if viewing own stories
        setMyStoryGroup((prevMyGroup) => {
          if (!prevMyGroup) return null;
          const updatedStories = prevMyGroup.stories.map((s) =>
            s._id === storyId ? { ...s, viewed: true } : s,
          );
          const allViewed = updatedStories.every((s) => s.viewed);
          return {
            ...prevMyGroup,
            stories: updatedStories,
            allViewed,
          };
        });

        // Update the selected group as well to keep modal in sync
        setSelectedGroup((prevSelected) => {
          if (!prevSelected) return null;
          const updatedStories = prevSelected.stories.map((s) =>
            s._id === storyId ? { ...s, viewed: true } : s,
          );
          const allViewed = updatedStories.every((s) => s.viewed);
          return {
            ...prevSelected,
            stories: updatedStories,
            allViewed,
          };
        });
      } catch (error) {
        console.error("❌ Failed to mark story as viewed:", error);
      }
    },
    [user],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    // Don't set selectedGroup to null immediately - let the modal animate out
    // The state is already updated locally, no need to refetch
    // Only clear selectedGroup after a brief delay
    setTimeout(() => {
      setSelectedGroup(null);
    }, 100);
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
        {/* My Story Card (First) */}
        <MyStoryCard
          userAvatar={user?.profilePicture}
          myStories={myStoryGroup?.stories || []}
          allViewed={myStoryGroup?.allViewed ?? true}
          onPressAdd={handleAddStory}
          onPressView={handleViewMyStories}
          isUploading={isUploading}
        />

        {/* Other Users' Story Groups */}
        {storyGroups.map((group) => (
          <StoryGroupCard
            key={group.user._id}
            group={group}
            onPress={() => handleViewStories(group)}
          />
        ))}
      </ScrollView>

      {/* Story Viewer Modal */}
      <StoryViewerModal
        visible={isModalVisible}
        group={selectedGroup}
        onClose={handleCloseModal}
        onStoryViewed={handleStoryViewed}
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

  // Unviewed border (red) - viewed stories have NO border
  unviewedBorder: {
    borderWidth: 3,
    borderColor: "#f9252b",
  },

  // Story Content Container (for proper z-index layering)
  storyContentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 2,
  },

  // Gradient Overlay
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_BORDER_RADIUS - 2,
    zIndex: 1,
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

  // Story count badge
  storyCountBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 3,
  },
  storyCountText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
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
    flexDirection: "row",
    gap: 4,
    zIndex: 10,
  },
  progressBarWrapper: {
    flex: 1,
  },
  progressBarBackground: {
    height: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
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
  modalUserInfo: {
    flex: 1,
    marginLeft: 10,
  },
  modalUsername: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalStoryCount: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginTop: 2,
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
