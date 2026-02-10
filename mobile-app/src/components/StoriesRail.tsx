/**
 * ====================================
 * STORIES RAIL — Instagram-Style Circular Avatars (v3.0)
 * ====================================
 *
 * Fully rewritten to match Instagram UX:
 *   • Circular avatars (~70 px) with a colored ring
 *   • Red ring = unviewed stories, Gray ring = viewed, No ring = "My Story" with 0 stories
 *   • "My Story" supports two tap targets (center → view, badge → add)
 *   • Full-screen Story Viewer Modal with tap-left / tap-right navigation
 *   • Grouped by user — one circle per user
 *
 * Components:
 *   StoryCircle     – reusable avatar + ring
 *   MyStoryCircle   – specialized with dual tap targets & (+) badge
 *   StoryViewerModal – full-screen sequential viewer
 *   StoriesRail     – horizontal ScrollView container (default export)
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
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import { STORY_ENDPOINTS } from "../config/api";

// ─── Types ───────────────────────────────────────────────────
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

interface StoryGroup {
  user: StoryUser;
  stories: Story[];
  allViewed: boolean;
}

// ─── Constants ───────────────────────────────────────────────
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const CIRCLE_SIZE = 70; // avatar circle diameter
const RING_WIDTH = 3; // colored ring width
const RING_GAP = 2; // gap between ring and avatar
const OUTER_SIZE = CIRCLE_SIZE + (RING_WIDTH + RING_GAP) * 2; // total size with ring
const BADGE_SIZE = 24; // (+) badge size
const STORY_DURATION = 5000; // 5 s per story

const BRAND_RED = "#f9252b";
const RING_GRAY = "#e0e0e0";
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=ccc&color=fff&name=User";

// Instagram-style gradient colors for unviewed ring
const GRADIENT_COLORS: [string, string, string, string] = [
  "#f9ce34",
  "#ee2a7b",
  "#6228d7",
  "#f9ce34",
];

// ─── Helper: first unviewed or first story thumbnail ─────────
const getThumbnail = (stories: Story[], fallbackAvatar?: string): string => {
  const firstUnviewed = stories.find((s) => !s.viewed);
  if (firstUnviewed) return firstUnviewed.mediaUrl;
  if (stories.length > 0) return stories[0].mediaUrl;
  return fallbackAvatar || DEFAULT_AVATAR;
};

// =============================================================
//  StoryCircle — generic friend circle
// =============================================================
interface StoryCircleProps {
  group: StoryGroup;
  onPress: () => void;
}

const StoryCircle: React.FC<StoryCircleProps> = ({ group, onPress }) => {
  const avatar = group.user?.profilePicture || DEFAULT_AVATAR;
  const username = group.user?.username || "Unknown";
  const isViewed = group.allViewed;

  return (
    <TouchableOpacity
      style={styles.circleWrapper}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Ring */}
      {isViewed ? (
        <View style={[styles.ringOuter, styles.ringViewed]}>
          <View style={styles.ringInnerGap}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
          </View>
        </View>
      ) : (
        <LinearGradient
          colors={GRADIENT_COLORS}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.ringOuter}
        >
          <View style={styles.ringInnerGap}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
          </View>
        </LinearGradient>
      )}

      {/* Username */}
      <Text style={styles.username} numberOfLines={1}>
        {username}
      </Text>
    </TouchableOpacity>
  );
};

// =============================================================
//  MyStoryCircle — current user's circle with (+) badge
// =============================================================
interface MyStoryCircleProps {
  userAvatar?: string;
  username: string;
  hasStories: boolean;
  allViewed: boolean;
  onPressView: () => void;
  onPressAdd: () => void;
  isUploading: boolean;
}

const MyStoryCircle: React.FC<MyStoryCircleProps> = ({
  userAvatar,
  username,
  hasStories,
  allViewed,
  onPressView,
  onPressAdd,
  isUploading,
}) => {
  const avatar = userAvatar || DEFAULT_AVATAR;

  // ── State 1: No stories — entire circle taps to add ──
  if (!hasStories) {
    return (
      <TouchableOpacity
        style={styles.circleWrapper}
        activeOpacity={0.8}
        onPress={onPressAdd}
        disabled={isUploading}
      >
        {/* No ring — just avatar */}
        <View style={styles.ringOuter}>
          <View style={styles.ringInnerGap}>
            <Image source={{ uri: avatar }} style={styles.avatar} />
          </View>
        </View>

        {/* (+) badge */}
        <View style={styles.badgeContainer}>
          {isUploading ? (
            <View style={styles.badge}>
              <ActivityIndicator size={10} color="#fff" />
            </View>
          ) : (
            <View style={styles.badge}>
              <Ionicons name="add" size={16} color="#fff" />
            </View>
          )}
        </View>

        <Text style={styles.username} numberOfLines={1}>
          {isUploading ? "Posting…" : "Your story"}
        </Text>
      </TouchableOpacity>
    );
  }

  // ── State 2: Has stories — center = view, badge = add ──
  return (
    <View style={styles.circleWrapper}>
      {/* Center tap → view */}
      <TouchableOpacity activeOpacity={0.8} onPress={onPressView}>
        {allViewed ? (
          <View style={[styles.ringOuter, styles.ringViewed]}>
            <View style={styles.ringInnerGap}>
              <Image source={{ uri: avatar }} style={styles.avatar} />
            </View>
          </View>
        ) : (
          <LinearGradient
            colors={GRADIENT_COLORS}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.ringOuter}
          >
            <View style={styles.ringInnerGap}>
              <Image source={{ uri: avatar }} style={styles.avatar} />
            </View>
          </LinearGradient>
        )}
      </TouchableOpacity>

      {/* Badge tap → add */}
      <TouchableOpacity
        style={styles.badgeContainer}
        activeOpacity={0.7}
        onPress={onPressAdd}
        disabled={isUploading}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        {isUploading ? (
          <View style={styles.badge}>
            <ActivityIndicator size={10} color="#fff" />
          </View>
        ) : (
          <View style={styles.badge}>
            <Ionicons name="add" size={16} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      <Text style={styles.username} numberOfLines={1}>
        {isUploading ? "Posting…" : "Your story"}
      </Text>
    </View>
  );
};

// =============================================================
//  StoryViewerModal — full-screen sequential viewer
// =============================================================
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

  // Stable callback refs to avoid useEffect re-triggers
  const onCloseRef = useRef(onClose);
  const onStoryViewedRef = useRef(onStoryViewed);
  useEffect(() => {
    onCloseRef.current = onClose;
    onStoryViewedRef.current = onStoryViewed;
  }, [onClose, onStoryViewed]);

  // Reset index when a new group opens
  useEffect(() => {
    if (visible && group) {
      setCurrentIndex(0);
      setProgress(0);
    }
  }, [visible, group]);

  // Timer + progress bar logic
  useEffect(() => {
    if (!visible || !group || group.stories.length === 0) return;

    const currentStory = group.stories[currentIndex];
    if (!currentStory) return;

    // Mark viewed
    if (!currentStory.viewed) {
      onStoryViewedRef.current(currentStory._id);
    }

    // Progress animation
    setProgress(0);
    const interval = 50;
    const steps = STORY_DURATION / interval;
    let step = 0;

    progressRef.current = setInterval(() => {
      step++;
      setProgress(step / steps);
    }, interval);

    // Auto-advance / close
    const storiesLength = group.stories.length;
    timerRef.current = setTimeout(() => {
      if (currentIndex < storiesLength - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        onCloseRef.current();
      }
    }, STORY_DURATION);

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
  }, [visible, group, currentIndex]);

  // Tap handler: left half = previous, right half = next
  const handleTap = (event: { nativeEvent: { locationX: number } }) => {
    const tapX = event.nativeEvent.locationX;
    const half = SCREEN_WIDTH / 2;

    // Clear running timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);

    if (tapX < half) {
      // Left → previous
      if (currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    } else {
      // Right → next or close
      if (group && currentIndex < group.stories.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        onClose();
      }
    }
  };

  if (!group || group.stories.length === 0) return null;

  const safeIndex = Math.min(currentIndex, group.stories.length - 1);
  const currentStory = group.stories[safeIndex];
  if (!currentStory) return null;

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
        {/* Progress bars */}
        <View style={styles.progressBarContainer}>
          {group.stories.map((_, idx) => (
            <View key={idx} style={styles.progressBarWrapper}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width:
                        idx < safeIndex
                          ? "100%"
                          : idx === safeIndex
                            ? `${progress * 100}%`
                            : "0%",
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Header */}
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

        {/* Full-screen image */}
        <Image
          source={{ uri: currentStory.mediaUrl }}
          style={styles.modalImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Modal>
  );
};

// =============================================================
//  StoriesRail — main exported component
// =============================================================
const StoriesRail: React.FC = () => {
  const { user } = useAuth();

  const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
  const [myStoryGroup, setMyStoryGroup] = useState<StoryGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StoryGroup | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // ── Fetch stories ──────────────────────────────────────────
  const fetchStories = useCallback(async () => {
    try {
      const url = user
        ? `${STORY_ENDPOINTS.GET_ALL}?userId=${user.id}`
        : STORY_ENDPOINTS.GET_ALL;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        const groups: StoryGroup[] = data.data;
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

  // ── Upload story ───────────────────────────────────────────
  const handlePostStory = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to add a story.");
      return;
    }

    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photos to add a story.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) return;

      const selectedImage = result.assets[0];
      setIsUploading(true);

      // Build multipart form
      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("media", {
        uri: selectedImage.uri,
        type: selectedImage.mimeType || "image/jpeg",
        name: `story_${Date.now()}.jpg`,
      } as unknown as Blob);

      const response = await fetch(STORY_ENDPOINTS.CREATE, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        console.log("✅ Story uploaded successfully");
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

  // ── View stories ───────────────────────────────────────────
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

      // Fire-and-forget API call
      fetch(STORY_ENDPOINTS.MARK_VIEWED(storyId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      }).catch((err) => console.error("❌ Failed to mark viewed:", err));

      // Optimistic local update
      const updateStories = (stories: Story[]) =>
        stories.map((s) => (s._id === storyId ? { ...s, viewed: true } : s));

      const recalcAllViewed = (stories: Story[]) =>
        stories.every((s) => s.viewed);

      setStoryGroups((prev) =>
        prev.map((g) => {
          const updated = updateStories(g.stories);
          return {
            ...g,
            stories: updated,
            allViewed: recalcAllViewed(updated),
          };
        }),
      );

      setMyStoryGroup((prev) => {
        if (!prev) return null;
        const updated = updateStories(prev.stories);
        return {
          ...prev,
          stories: updated,
          allViewed: recalcAllViewed(updated),
        };
      });

      setSelectedGroup((prev) => {
        if (!prev) return null;
        const updated = updateStories(prev.stories);
        return {
          ...prev,
          stories: updated,
          allViewed: recalcAllViewed(updated),
        };
      });
    },
    [user],
  );

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    setTimeout(() => setSelectedGroup(null), 150);
  }, []);

  // ── Render ─────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="small" color={BRAND_RED} />
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
        {/* My Story (always first) */}
        <MyStoryCircle
          userAvatar={user?.profilePicture}
          username={user?.username || "You"}
          hasStories={(myStoryGroup?.stories.length ?? 0) > 0}
          allViewed={myStoryGroup?.allViewed ?? true}
          onPressView={handleViewMyStories}
          onPressAdd={handlePostStory}
          isUploading={isUploading}
        />

        {/* Friend stories */}
        {storyGroups.map((group) => (
          <StoryCircle
            key={group.user._id}
            group={group}
            onPress={() => handleViewStories(group)}
          />
        ))}
      </ScrollView>

      {/* Viewer modal */}
      <StoryViewerModal
        visible={isModalVisible}
        group={selectedGroup}
        onClose={handleCloseModal}
        onStoryViewed={handleStoryViewed}
      />
    </View>
  );
};

// =============================================================
//  Styles
// =============================================================
const styles = StyleSheet.create({
  /* ── Container ─────────────────────────────────── */
  container: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#dbdbdb",
  },
  loadingContainer: {
    minHeight: OUTER_SIZE + 30,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 10,
    gap: 14,
  },

  /* ── Circle wrapper ────────────────────────────── */
  circleWrapper: {
    alignItems: "center",
    width: OUTER_SIZE + 4,
  },

  /* ── Ring ───────────────────────────────────────── */
  ringOuter: {
    width: OUTER_SIZE,
    height: OUTER_SIZE,
    borderRadius: OUTER_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  ringViewed: {
    borderWidth: RING_WIDTH,
    borderColor: RING_GRAY,
  },
  ringInnerGap: {
    width: CIRCLE_SIZE + RING_GAP * 2,
    height: CIRCLE_SIZE + RING_GAP * 2,
    borderRadius: (CIRCLE_SIZE + RING_GAP * 2) / 2,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },

  /* ── Avatar ────────────────────────────────────── */
  avatar: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "#efefef",
  },

  /* ── Username label ────────────────────────────── */
  username: {
    marginTop: 4,
    fontSize: 11,
    color: "#262626",
    textAlign: "center",
    width: OUTER_SIZE + 4,
  },

  /* ── (+) Badge ─────────────────────────────────── */
  badgeContainer: {
    position: "absolute",
    bottom: 20, // sits above the username label
    right: 2,
    zIndex: 10,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: BADGE_SIZE / 2,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },

  /* ── Modal ─────────────────────────────────────── */
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    position: "absolute",
    top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 10 : 54,
    left: 8,
    right: 8,
    flexDirection: "row",
    gap: 4,
    zIndex: 10,
  },
  progressBarWrapper: {
    flex: 1,
  },
  progressBarBg: {
    height: 2.5,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  modalHeader: {
    position: "absolute",
    top: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) + 20 : 64,
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
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  modalStoryCount: {
    color: "rgba(255,255,255,0.7)",
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
