/**
 * ====================================
 * REEL CARD COMPONENT
 * ====================================
 * TikTok / Instagram Reels-style full-screen video card.
 *
 * Features:
 * - Full-screen video playback via expo-av
 * - Auto-play/pause controlled by `isActive` prop
 * - Dark gradient overlay for text readability
 * - Creator avatar, username, and caption (bottom-left)
 * - Action sidebar: Like, Comment, Share, Save (bottom-right)
 * - Optimistic UI for likes (identical logic to PostCard)
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { POST_ENDPOINTS, CONTENT_REPORT_ENDPOINTS } from "../config/api";
import CommentsBottomSheet from "./CommentsBottomSheet";

// ====================================
// DIMENSIONS
// ====================================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=ccc&color=fff&name=User";

// ====================================
// COMPONENT
// ====================================
export default function ReelCard({ reel, isActive, height }) {
  // Use provided height or fallback to full screen
  const containerHeight = height || SCREEN_HEIGHT;
  const { user } = useAuth();
  const videoRef = useRef(null);

  const currentUserId = user?._id || user?.id;

  // ── Like state (optimistic UI) ──
  const [isLiked, setIsLiked] = useState(
    () => reel.likes?.some((id) => id === currentUserId) ?? false,
  );
  const [likeCount, setLikeCount] = useState(reel.likes?.length || 0);

  // ── Video loading state ──
  const [isBuffering, setIsBuffering] = useState(true);

  // ── Mute toggle ──
  const [isMuted, setIsMuted] = useState(false);

  // ── Derived data ──
  const username = reel.user?.username || "Unknown User";
  const avatarUrl = reel.user?.profilePicture || DEFAULT_AVATAR;
  const [commentCount, setCommentCount] = useState(reel.comments?.length || 0);
  const [commentsVisible, setCommentsVisible] = useState(false);

  // ====================================
  // FORMAT COUNTS (e.g., 1.2K, 3.4M)
  // ====================================
  const formatCount = (count) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
    return count.toString();
  };

  // ====================================
  // HANDLE LIKE — Optimistic UI Update
  // ====================================
  const handleLike = async () => {
    if (!user) return;

    // 1. Save previous state for rollback
    const prevLiked = isLiked;
    const prevCount = likeCount;

    // 2. Instantly update UI (optimistic)
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      // 3. Send PUT request to backend
      const response = await fetch(POST_ENDPOINTS.TOGGLE_LIKE(reel._id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to toggle like");
      }

      // 4. Sync with server truth
      setIsLiked(data.liked);
      setLikeCount(data.likes.length);
    } catch (error) {
      // 5. Revert UI on failure
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      Alert.alert("Error", "Could not update like. Please try again.");
      console.error("❌ Like toggle failed:", error);
    }
  };

  const handleReport = async () => {
    if (!user) return;
    try {
      const response = await fetch(CONTENT_REPORT_ENDPOINTS.CREATE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: reel._id,
          targetType: "Reel",
          reportedBy: currentUserId,
          reason: "Inappropriate Content",
        }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert("Reported", "Thank you for letting us know. We will review this reel.");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      Alert.alert("Error", "Could not submit report. Please try again.");
    }
  };

  const showMenu = () => {
    Alert.alert("Options", "Choose an action", [
      { text: "Report Reel", onPress: handleReport, style: "destructive" },
      { text: "Cancel", style: "cancel" }
    ]);
  };

  // ====================================
  // HANDLE COMMENT NAVIGATION
  // ====================================
  const handleComment = () => {
    setCommentsVisible(true);
  };

  // ====================================
  // HANDLE VIDEO PLAYBACK STATUS
  // ====================================
  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setIsBuffering(status.isBuffering);
    }
  };

  // ====================================
  // RENDER
  // ====================================
  return (
    <View style={[styles.container, { height: containerHeight }]}>
      {/* ========== VIDEO PLAYER ========== */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => setIsMuted(!isMuted)}
        style={styles.videoWrapper}
      >
        <Video
          ref={videoRef}
          source={{ uri: reel.media.url }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          shouldPlay={isActive}
          isMuted={isMuted}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />

        {/* Buffering Indicator */}
        {isBuffering && isActive && (
          <View style={styles.bufferingContainer}>
            <ActivityIndicator size="large" color="rgba(255,255,255,0.8)" />
          </View>
        )}

        {/* Mute Indicator (shows briefly on tap) */}
        {isMuted && (
          <View style={styles.muteIndicator}>
            <Ionicons
              name="volume-mute"
              size={16}
              color="rgba(255,255,255,0.8)"
            />
          </View>
        )}
      </TouchableOpacity>

      {/* ========== OVERLAYS (hidden when comments open) ========== */}
      {!commentsVisible && (
        <>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.gradient}
            pointerEvents="none"
          />

          <View style={styles.bottomLeft}>
            <View style={styles.creatorRow}>
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
              <Text style={styles.username} numberOfLines={1}>
                {username}
              </Text>
            </View>
            {reel.caption ? (
              <Text style={styles.caption} numberOfLines={2}>
                {reel.caption}
              </Text>
            ) : null}
          </View>

          <View style={styles.actionSidebar}>
            <TouchableOpacity
              onPress={handleLike}
              style={styles.actionItem}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isLiked ? "heart" : "heart-outline"}
                size={30}
                color={isLiked ? "#ED4956" : "#fff"}
              />
              <Text style={styles.actionCount}>{formatCount(likeCount)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleComment}
              style={styles.actionItem}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-outline" size={28} color="#fff" />
              <Text style={styles.actionCount}>
                {formatCount(commentCount)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert("Coming Soon")}
              style={styles.actionItem}
              activeOpacity={0.7}
            >
              <Ionicons name="paper-plane-outline" size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => Alert.alert("Coming Soon")}
              style={styles.actionItem}
              activeOpacity={0.7}
            >
              <Ionicons name="bookmark-outline" size={28} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={showMenu}
              style={styles.actionItem}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-vertical" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ========== COMMENTS MODAL ========== */}
      <Modal
        visible={commentsVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setCommentsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setCommentsVisible(false)}
          />
          <View style={styles.modalContent}>
            <CommentsBottomSheet
              postId={reel._id}
              onClose={() => setCommentsVisible(false)}
              onCommentAdded={() => setCommentCount((prev) => prev + 1)}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    backgroundColor: "#000",
    position: "relative",
  },

  // ── Video ──
  videoWrapper: {
    flex: 1,
  },
  video: {
    width: "100%",
    height: "100%",
  },

  // ── Buffering ──
  bufferingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Mute indicator ──
  muteIndicator: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  // ── Gradient ──
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
  },

  // ── Bottom-Left: Creator Info ──
  bottomLeft: {
    position: "absolute",
    bottom: 100,
    left: 12,
    right: 80, // Leave space for action sidebar
  },
  creatorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "#333",
  },
  username: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 10,
    textShadow: "0px 1px 3px rgba(0,0,0,0.6)",
  },
  caption: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13.5,
    lineHeight: 19,
    textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
  },

  // ── Bottom-Right: Action Sidebar ──
  actionSidebar: {
    position: "absolute",
    right: 10,
    bottom: 120,
    alignItems: "center",
  },
  actionItem: {
    alignItems: "center",
    marginBottom: 20,
  },
  actionCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 3,
    textShadow: "0px 1px 2px rgba(0,0,0,0.5)",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 0.3,
  },
  modalContent: {
    flex: 0.7,
    backgroundColor: "#fff",
  },
});
