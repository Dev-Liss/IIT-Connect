/**
 * ====================================
 * POST CARD COMPONENT
 * ====================================
 * Instagram-style post card for the social feed.
 *
 * Features:
 * - Dynamic image height based on aspectRatio
 * - User avatar with fallback
 * - Like, Comment, Share actions
 * - Caption with truncation
 * - Relative timestamp
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Modal,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { POST_ENDPOINTS } from "../config/api";
import CommentsBottomSheet from "./CommentsBottomSheet";

// Get screen width for dynamic image sizing
const SCREEN_WIDTH = Dimensions.get("window").width;
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=ccc&color=fff&name=User";

export default function PostCard({ post, onLike, onShare }) {
  const { user } = useAuth();

  // Initialize state from real data
  const [isLiked, setIsLiked] = useState(
    () => post.likes?.some((id) => id === user?.id) ?? false,
  );
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);

  // Calculate dynamic image height based on aspect ratio
  // Formula: height = width / aspectRatio
  // Clamp to reasonable bounds so images don't overflow the card
  const aspectRatio = post.media?.aspectRatio || 1;
  const rawHeight = SCREEN_WIDTH / aspectRatio;
  const MAX_IMAGE_HEIGHT = SCREEN_WIDTH * 1.25; // Cap portrait images
  const MIN_IMAGE_HEIGHT = SCREEN_WIDTH * 0.5; // Floor for very wide images
  const imageHeight = Math.min(
    Math.max(rawHeight, MIN_IMAGE_HEIGHT),
    MAX_IMAGE_HEIGHT,
  );

  // Get username with fallback
  const username = post.user?.username || "Unknown User";

  // Get avatar URL from user profile or fallback
  const avatarUrl = post.user?.profilePicture || DEFAULT_AVATAR;

  // Format relative timestamp
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Handle like press — Optimistic UI Update
  const handleLike = async () => {
    if (!user) return;

    // 1. Save previous state for rollback
    const prevLiked = isLiked;
    const prevCount = likeCount;

    // 2. Instantly update the UI (optimistic)
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      // 3. Send the PUT request to the backend
      const response = await fetch(POST_ENDPOINTS.TOGGLE_LIKE(post._id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to toggle like");
      }

      // Optionally sync with server truth
      setIsLiked(data.liked);
      setLikeCount(data.likes.length);
    } catch (error) {
      // 4. Revert UI on failure
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      Alert.alert("Error", "Could not update like. Please try again.");
      console.error("❌ Like toggle failed:", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* ========== HEADER ========== */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <View style={styles.userText}>
            <Text style={styles.username}>{username}</Text>
            {post.category && post.category !== "General" && (
              <Text style={styles.category}>{post.category}</Text>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#262626" />
        </TouchableOpacity>
      </View>

      {/* ========== IMAGE ========== */}
      <Image
        source={{ uri: post.media.url }}
        style={[styles.postImage, { height: imageHeight }]}
        resizeMode="contain"
      />

      {/* ========== ACTION BAR ========== */}
      <View style={styles.actionBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={26}
              color={isLiked ? "#ED4956" : "#262626"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setCommentsVisible(true)}
            style={styles.actionButton}
          >
            <Ionicons name="chatbubble-outline" size={24} color="#262626" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onShare?.(post._id)}
            style={styles.actionButton}
          >
            <Feather name="send" size={22} color="#262626" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={24} color="#262626" />
        </TouchableOpacity>
      </View>

      {/* ========== LIKES COUNT ========== */}
      {likeCount > 0 && (
        <Text style={styles.likesCount}>
          {likeCount} {likeCount === 1 ? "like" : "likes"}
        </Text>
      )}

      {/* ========== COMMENT COUNT ========== */}
      {commentCount > 0 && (
        <TouchableOpacity onPress={() => setCommentsVisible(true)}>
          <Text style={styles.commentCount}>
            View all {commentCount}{" "}
            {commentCount === 1 ? "comment" : "comments"}
          </Text>
        </TouchableOpacity>
      )}

      {/* ========== CAPTION ========== */}
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text
            style={styles.caption}
            numberOfLines={isExpanded ? undefined : 2}
            onTextLayout={(e) => {
              if (!isTruncated && e.nativeEvent.lines.length > 2) {
                setIsTruncated(true);
              }
            }}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={styles.captionUsername}>{username} </Text>
            {post.caption}
          </Text>
          {!isExpanded && isTruncated && (
            <TouchableOpacity onPress={() => setIsExpanded(true)}>
              <Text style={styles.readMoreText}>more</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ========== TIMESTAMP ========== */}
      <Text style={styles.timestamp}>{getRelativeTime(post.createdAt)}</Text>

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
              postId={post._id}
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
    backgroundColor: "#fff",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
  },
  // Header styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  userText: {
    marginLeft: 10,
  },
  username: {
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
  },
  category: {
    fontSize: 11,
    color: "#8e8e8e",
    marginTop: 1,
  },
  menuButton: {
    padding: 4,
  },
  // Image styles
  postImage: {
    width: SCREEN_WIDTH,
    backgroundColor: "#1a1a1a",
  },
  // Action bar styles
  actionBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginRight: 16,
  },
  // Likes count
  likesCount: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 6,
  },
  // Comment count
  commentCount: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#8e8e8e",
    marginBottom: 6,
  },
  // Caption styles
  captionContainer: {
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  caption: {
    fontSize: 14,
    color: "#262626",
    lineHeight: 18,
  },
  captionUsername: {
    fontWeight: "600",
  },
  readMoreText: {
    color: "#8e8e8e",
    marginTop: 2,
  },
  // Timestamp
  timestamp: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 11,
    color: "#8e8e8e",
    textTransform: "uppercase",
    letterSpacing: 0.2,
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
