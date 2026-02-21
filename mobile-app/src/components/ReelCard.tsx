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
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { POST_ENDPOINTS } from "../config/api";

// ====================================
// DIMENSIONS
// ====================================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ====================================
// TYPE DEFINITIONS
// ====================================
interface Reel {
  _id: string;
  user?: {
    _id: string;
    username: string;
    email?: string;
  };
  caption?: string;
  category?: string;
  media: {
    url: string;
    aspectRatio?: number;
    width?: number;
    height?: number;
    type?: string;
  };
  likes?: string[];
  comments?: any[];
  createdAt: string;
}

interface ReelCardProps {
  reel: Reel;
  isActive: boolean;
  height?: number;
}

// ====================================
// COMPONENT
// ====================================
export default function ReelCard({ reel, isActive, height }: ReelCardProps) {
  // Use provided height or fallback to full screen
  const containerHeight = height || SCREEN_HEIGHT;
  const { user } = useAuth();
  const router = useRouter();
  const videoRef = useRef<Video>(null);

  // ── Like state (optimistic UI) ──
  const [isLiked, setIsLiked] = useState(
    () => reel.likes?.some((id) => id === user?.id) ?? false,
  );
  const [likeCount, setLikeCount] = useState(reel.likes?.length || 0);

  // ── Video loading state ──
  const [isBuffering, setIsBuffering] = useState(true);

  // ── Mute toggle ──
  const [isMuted, setIsMuted] = useState(false);

  // ── Derived data ──
  const username = reel.user?.username || "Unknown User";
  const avatarUrl = `https://i.pravatar.cc/150?u=${reel.user?._id || reel._id}`;
  const commentCount = reel.comments?.length || 0;

  // ====================================
  // FORMAT COUNTS (e.g., 1.2K, 3.4M)
  // ====================================
  const formatCount = (count: number): string => {
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
        body: JSON.stringify({ userId: user.id }),
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

  // ====================================
  // HANDLE COMMENT NAVIGATION
  // ====================================
  const handleComment = () => {
    router.push(`/comments/${reel._id}` as any);
  };

  // ====================================
  // HANDLE VIDEO PLAYBACK STATUS
  // ====================================
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
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
          resizeMode={ResizeMode.COVER}
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

      {/* ========== BOTTOM GRADIENT OVERLAY ========== */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.gradient}
        pointerEvents="none"
      />

      {/* ========== BOTTOM-LEFT: CREATOR INFO ========== */}
      <View style={styles.bottomLeft}>
        {/* Username Row */}
        <View style={styles.creatorRow}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <Text style={styles.username} numberOfLines={1}>
            {username}
          </Text>
        </View>

        {/* Caption */}
        {reel.caption ? (
          <Text style={styles.caption} numberOfLines={2}>
            {reel.caption}
          </Text>
        ) : null}
      </View>

      {/* ========== BOTTOM-RIGHT: ACTION SIDEBAR ========== */}
      <View style={styles.actionSidebar}>
        {/* Like Button */}
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

        {/* Comment Button */}
        <TouchableOpacity
          onPress={handleComment}
          style={styles.actionItem}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubble-outline" size={28} color="#fff" />
          <Text style={styles.actionCount}>{formatCount(commentCount)}</Text>
        </TouchableOpacity>

        {/* Share Button */}
        <TouchableOpacity
          onPress={() => Alert.alert("Coming Soon")}
          style={styles.actionItem}
          activeOpacity={0.7}
        >
          <Ionicons name="paper-plane-outline" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Save/Bookmark Button */}
        <TouchableOpacity
          onPress={() => Alert.alert("Coming Soon")}
          style={styles.actionItem}
          activeOpacity={0.7}
        >
          <Ionicons name="bookmark-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
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
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  caption: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 13.5,
    lineHeight: 19,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
