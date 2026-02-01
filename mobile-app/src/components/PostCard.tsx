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
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

// Get screen width for dynamic image sizing
const SCREEN_WIDTH = Dimensions.get("window").width;

// Post type definition
interface Post {
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
  };
  likes?: string[];
  createdAt: string;
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
}

export default function PostCard({
  post,
  onLike,
  onComment,
  onShare,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  // Calculate dynamic image height based on aspect ratio
  // Formula: height = width / aspectRatio
  const aspectRatio = post.media?.aspectRatio || 1;
  const imageHeight = SCREEN_WIDTH / aspectRatio;

  // Get username with fallback
  const username = post.user?.username || "Unknown User";

  // Generate avatar URL using pravatar.cc for consistent placeholder
  const avatarUrl = `https://i.pravatar.cc/150?u=${post.user?._id || post._id}`;

  // Format relative timestamp
  const getRelativeTime = (dateString: string): string => {
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

  // Handle like press
  const handleLike = () => {
    setIsLiked(!isLiked);
    if (onLike) onLike(post._id);
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
        resizeMode="cover"
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
            onPress={() => onComment?.(post._id)}
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
      {post.likes && post.likes.length > 0 && (
        <Text style={styles.likesCount}>
          {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
        </Text>
      )}

      {/* ========== CAPTION ========== */}
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption} numberOfLines={2}>
            <Text style={styles.captionUsername}>{username} </Text>
            {post.caption}
          </Text>
        </View>
      )}

      {/* ========== TIMESTAMP ========== */}
      <Text style={styles.timestamp}>{getRelativeTime(post.createdAt)}</Text>
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
    backgroundColor: "#f5f5f5",
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
  // Timestamp
  timestamp: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    fontSize: 11,
    color: "#8e8e8e",
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
});
