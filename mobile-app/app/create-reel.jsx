/**
 * ====================================
 * CREATE REEL SCREEN — Social-media style
 * ====================================
 * Clean, minimal reel creation matching Create Post design:
 * - Top bar  (back arrow + "Share" button)
 * - User avatar + username
 * - Caption + body text inputs
 * - Inline video preview
 * - Fixed bottom action bar (Video / Category / Tags)
 * - Animated drop-up category menu & expanding tags input
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
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
  Dimensions,
  KeyboardAvoidingView,
  Pressable,
  Keyboard,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Video, ResizeMode } from "expo-av";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInUp,
  SlideOutDown,
} from "react-native-reanimated";
import { useAuth } from "../src/context/AuthContext";
import { POST_ENDPOINTS } from "../src/config/api";

// ────────────────────────────────────────────
// CONSTANTS
// ────────────────────────────────────────────
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CATEGORIES = [
  { label: "Memes", icon: "happy-outline" },
  { label: "Clubs", icon: "people-outline" },
  { label: "Sports", icon: "football-outline" },
  { label: "Events", icon: "calendar-outline" },
  { label: "Academic", icon: "school-outline" },
  { label: "General", icon: "stats-chart" },
];

const TAG_SPRING = { damping: 30, stiffness: 300 };

// ────────────────────────────────────────────
// MAIN COMPONENT
// ────────────────────────────────────────────
export default function CreateReelScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  // ── Form state ──
  const [caption, setCaption] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Bottom bar panel state ──
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showTagsInput, setShowTagsInput] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const tagsCloseTimeoutRef = useRef(null);

  // ── Reanimated values for tags box ──
  const tagsHeight = useSharedValue(0);

  const tagsAnimatedStyle = useAnimatedStyle(() => ({
    height: tagsHeight.value,
    opacity: tagsHeight.value > 10 ? 1 : 0,
    overflow: "hidden",
  }));

  const clearTagsCloseTimeout = useCallback(() => {
    if (tagsCloseTimeoutRef.current) {
      clearTimeout(tagsCloseTimeoutRef.current);
      tagsCloseTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return undefined;

    const keyboardShowSub = Keyboard.addListener("keyboardDidShow", (event) => {
      const nextHeight = Math.max(0, event.endCoordinates.height - insets.bottom);
      setKeyboardHeight(nextHeight);
    });

    const keyboardHideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardShowSub.remove();
      keyboardHideSub.remove();
    };
  }, [insets.bottom]);

  useEffect(() => {
    return () => {
      clearTagsCloseTimeout();
    };
  }, [clearTagsCloseTimeout]);

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
            style={styles.loginButton}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.loginButtonText}>Go to Login</Text>
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
        videoMaxDuration: 60,
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
  const clearVideo = () => setSelectedVideo(null);

  // ====================================
  // HANDLE SHARE REEL (UPLOAD)
  // ====================================
  const handleShareReel = async () => {
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
      const fullCaption = caption.trim();

      const formData = new FormData();
      formData.append("userId", user.id);
      formData.append("caption", fullCaption);
      formData.append("category", category);

      const filename = selectedVideo.split("/").pop() || "upload.mp4";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `video/${match[1]}` : "video/mp4";

      formData.append("media", {
        uri: selectedVideo,
        name: filename,
        type: type,
      });

      console.log(`📤 Uploading video: ${filename} (${type})`);

      const response = await fetch(POST_ENDPOINTS.CREATE, {
        method: "POST",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("🎉 Success!", "Your reel has been shared!", [
          {
            text: "OK",
            onPress: () => {
              setCaption("");
              setSelectedVideo(null);
              setCategory("General");
              setTags("");
              router.replace("/(tabs)");
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
  // BOTTOM BAR TAB HANDLERS
  // ====================================
  const handleVideoTab = () => {
    setShowCategoryMenu(false);
    closeTags();
    pickVideo();
  };

  const handleCategoryTab = () => {
    closeTags();
    setShowCategoryMenu((prev) => !prev);
  };

  const handleTagsTab = () => {
    setShowCategoryMenu(false);
    if (showTagsInput) {
      closeTags();
    } else {
      clearTagsCloseTimeout();
      setShowTagsInput(true);
      tagsHeight.value = withSpring(110, TAG_SPRING);
    }
  };

  const closeTags = () => {
    clearTagsCloseTimeout();
    Keyboard.dismiss();
    tagsHeight.value = withSpring(0, TAG_SPRING);
    tagsCloseTimeoutRef.current = setTimeout(() => {
      setShowTagsInput(false);
      tagsCloseTimeoutRef.current = null;
    }, 250);
  };

  const selectCategory = (cat) => {
    setCategory(cat);
    setShowCategoryMenu(false);
  };

  // ====================================
  // HELPERS
  // ====================================
  const displayName = user?.username || "Your Name";
  const userInitial = displayName.charAt(0).toUpperCase();

  // ====================================
  // RENDER
  // ====================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <KeyboardAvoidingView
        style={[
          styles.keyboardContainer,
          Platform.OS === "android" && { paddingBottom: keyboardHeight },
        ]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        enabled={Platform.OS === "ios"}
      >
        {/* ═══════════════ TOP BAR ═══════════════ */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => router.replace("/(tabs)")}
            style={styles.backBtn}
            hitSlop={12}
          >
            <Ionicons name="chevron-back" size={26} color="#1a1a1a" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.postBtn, isSubmitting && styles.postBtnDisabled]}
            onPress={handleShareReel}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.postBtnText}>Share</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ═══════════════ SCROLLABLE CONTENT ═══════════════ */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── User Info ── */}
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
            <Text style={styles.userName}>{displayName}</Text>
          </View>

          {/* ── Caption Input ── */}
          <TextInput
            style={styles.captionInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#b0b0b0"
            value={caption}
            onChangeText={setCaption}
            multiline
            textAlignVertical="top"
          />

          {/* ── Inline Video Preview ── */}
          {selectedVideo && (
            <View style={styles.inlineMediaContainer}>
              <Video
                source={{ uri: selectedVideo }}
                style={styles.inlineMedia}
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
                isLooping={false}
                isMuted
              />
              <View style={styles.videoOverlay}>
                <Ionicons name="play-circle" size={48} color="#fff" />
              </View>
              <TouchableOpacity
                style={styles.removeMediaBtn}
                onPress={clearVideo}
              >
                <Ionicons name="close-circle" size={26} color="#f9252b" />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Selected Category Badge ── */}
          <View style={styles.metaRow}>
            <View style={styles.categoryBadge}>
              <Ionicons
                name={
                  CATEGORIES.find((c) => c.label === category)?.icon ||
                  "pricetag"
                }
                size={14}
                color="#f9252b"
              />
              <Text style={styles.categoryBadgeText}>{category}</Text>
            </View>

            {tags.trim().length > 0 && (
              <View style={styles.tagsBadge}>
                <Ionicons name="pricetags-outline" size={14} color="#666" />
                <Text style={styles.tagsBadgeText} numberOfLines={1}>
                  {tags}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* ═══════════════ CATEGORY DROP-UP MENU ═══════════════ */}
        {showCategoryMenu && (
          <>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setShowCategoryMenu(false)}
            />
            <Animated.View
              style={styles.categoryMenuContainer}
              exiting={SlideOutDown.duration(200)}
            >
              <View style={styles.categoryMenuInner}>
                {CATEGORIES.map((cat, index) => {
                  const isSelected = category === cat.label;
                  return (
                    <Animated.View
                      key={cat.label}
                      entering={FadeInUp.springify()
                        .damping(30)
                        .stiffness(300)
                        .delay((CATEGORIES.length - 1 - index) * 25)}
                    >
                      <TouchableOpacity
                        style={[
                          styles.categoryMenuItem,
                          isSelected && styles.categoryMenuItemSelected,
                        ]}
                        onPress={() => selectCategory(cat.label)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={cat.icon}
                          size={20}
                          color={isSelected ? "#2e7d32" : "#666"}
                        />
                        <Text
                          style={[
                            styles.categoryMenuLabel,
                            isSelected && styles.categoryMenuLabelSelected,
                          ]}
                        >
                          {cat.label}
                        </Text>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#2e7d32"
                            style={{ marginLeft: "auto" }}
                          />
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            </Animated.View>
          </>
        )}

        {/* ═══════════════ TAGS EXPANDING INPUT ═══════════════ */}
        {showTagsInput && (
          <Animated.View
            style={[styles.tagsExpandContainer, tagsAnimatedStyle]}
          >
            <TextInput
              style={styles.tagsTextInput}
              placeholder="campus, events, community"
              placeholderTextColor="#b0b0b0"
              value={tags}
              onChangeText={setTags}
              autoFocus
            />
            <Text style={styles.tagsHelper}>Separate tags with commas</Text>
          </Animated.View>
        )}

        {/* ═══════════════ BOTTOM ACTION BAR ═══════════════ */}
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          {/* Video */}
          <TouchableOpacity
            style={styles.bottomTab}
            onPress={handleVideoTab}
            activeOpacity={0.7}
          >
            <Ionicons name="videocam-outline" size={20} color="#666" />
            <Text style={styles.bottomTabLabel}>Video</Text>
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.bottomSeparator} />

          {/* Category */}
          <TouchableOpacity
            style={styles.bottomTab}
            onPress={handleCategoryTab}
            activeOpacity={0.7}
          >
            <Ionicons
              name="folder-outline"
              size={20}
              color={showCategoryMenu ? "#f9252b" : "#666"}
            />
            <Text
              style={[
                styles.bottomTabLabel,
                showCategoryMenu && { color: "#f9252b" },
              ]}
            >
              Category
            </Text>
          </TouchableOpacity>

          {/* Separator */}
          <View style={styles.bottomSeparator} />

          {/* Tags */}
          <TouchableOpacity
            style={styles.bottomTab}
            onPress={handleTagsTab}
            activeOpacity={0.7}
          >
            <Ionicons
              name="pricetags-outline"
              size={20}
              color={showTagsInput ? "#f9252b" : "#666"}
            />
            <Text
              style={[
                styles.bottomTabLabel,
                showTagsInput && { color: "#f9252b" },
              ]}
            >
              Tags
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
  // ── Layout ──
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardContainer: {
    flex: 1,
  },

  // ── Top Bar ──
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 12 : 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  postBtn: {
    backgroundColor: "#f9252b",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    minWidth: 80,
    alignItems: "center",
  },
  postBtnDisabled: {
    backgroundColor: "#fca5a5",
  },
  postBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // ── Scroll ──
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // ── User Row ──
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f9252b",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  userName: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: 0.1,
  },

  // ── Caption Input ──
  captionInput: {
    fontSize: 16,
    color: "#1a1a1a",
    lineHeight: 22,
    minHeight: 120,
    paddingVertical: 4,
  },

  // ── Inline Media Preview ──
  inlineMediaContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
  },
  inlineMedia: {
    width: "100%",
    height: 200,
    borderRadius: 12,
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
  removeMediaBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 13,
    boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.15)",
    elevation: 4,
  },

  // ── Meta Row (category badge + tags badge) ──
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 20,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fff3f3",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f9252b20",
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#f9252b",
  },
  tagsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagsBadgeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#666",
    maxWidth: 150,
  },

  // ── Category Drop-Up Menu ──
  categoryMenuContainer: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: "#fff",
    borderRadius: 16,
    boxShadow: "0px -4px 16px 0px rgba(0, 0, 0, 0.12)",
    elevation: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  categoryMenuInner: {
    overflow: "hidden",
    borderRadius: 16,
    paddingVertical: 8,
  },
  categoryMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 14,
  },
  categoryMenuItemSelected: {
    backgroundColor: "#f0faf0",
  },
  categoryMenuLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  categoryMenuLabelSelected: {
    fontWeight: "700",
    color: "#2e7d32",
  },

  // ── Tags Expanding Input ──
  tagsExpandContainer: {
    paddingHorizontal: 20,
    backgroundColor: "#fafafa",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e8e8e8",
  },
  tagsTextInput: {
    fontSize: 15,
    color: "#333",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  tagsHelper: {
    fontSize: 12,
    color: "#999",
    marginTop: 6,
    paddingHorizontal: 4,
  },

  // ── Bottom Action Bar ──
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e8e8e8",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  bottomTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
  },
  bottomTabLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  bottomSeparator: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: "#e0e0e0",
  },

  // ── Auth Guard ──
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
    color: "#1a1a1a",
    marginBottom: 8,
  },
  guardSubtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 24,
  },
  loginButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    backgroundColor: "#f9252b",
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },
});
