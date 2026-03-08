/**
 * ====================================
 * COMMENTS BOTTOM SHEET COMPONENT
 * ====================================
 * Light-themed comments panel with floating pill input bar.
 *
 * Renders inline (for ReelCard) or inside a Modal (for PostCard).
 * Fetches and submits comments via POST_ENDPOINTS.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { POST_ENDPOINTS } from "../config/api";

export default function CommentsBottomSheet({
  postId,
  onClose,
  onCommentAdded,
}) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const DEFAULT_AVATAR =
    "https://ui-avatars.com/api/?background=ccc&color=fff&name=User";

  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");

  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const keyboardPadding = useRef(new Animated.Value(0)).current;

  // ====================================
  // KEYBOARD HANDLING
  // ====================================
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const ANDROID_GAP = 10; // extra pixels above keyboard on Android
    const IOS_GAP = 10; // extra pixels above keyboard on iOS

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const kbHeight = e.endCoordinates.height;
      const targetPadding =
        Platform.OS === "ios" ? kbHeight + IOS_GAP : kbHeight + ANDROID_GAP;
      Animated.timing(keyboardPadding, {
        toValue: targetPadding,
        duration: Platform.OS === "ios" ? e.duration || 250 : 200,
        useNativeDriver: false,
      }).start();
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      Animated.timing(keyboardPadding, {
        toValue: 0,
        duration: Platform.OS === "ios" ? 250 : 200,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ====================================
  // FETCH COMMENTS
  // ====================================
  useEffect(() => {
    if (postId) fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(POST_ENDPOINTS.GET_COMMENTS(postId));
      const data = await response.json();
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error("❌ Fetch comments error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ====================================
  // SUBMIT COMMENT
  // ====================================
  const handleSubmit = async () => {
    if (!commentText.trim() || !user || isSubmitting) return;

    const trimmedText = commentText.trim();
    setIsSubmitting(true);
    setCommentText("");
    Keyboard.dismiss();

    try {
      const response = await fetch(POST_ENDPOINTS.ADD_COMMENT(postId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, text: trimmedText }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add comment");
      }

      setComments((prev) => [...prev, data.comment]);
      onCommentAdded?.();

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (error) {
      console.error("❌ Submit comment error:", error);
      Alert.alert("Error", "Could not post comment. Please try again.");
      setCommentText(trimmedText);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====================================
  // FORMAT RELATIVE TIME
  // ====================================
  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffWeeks < 52) return `${diffWeeks}w`;
    return date.toLocaleDateString();
  };

  // ====================================
  // RENDER COMMENT ITEM
  // ====================================
  const renderComment = ({ item }) => {
    const avatarUrl = item.user?.profilePicture || DEFAULT_AVATAR;
    return (
      <View style={styles.commentItem}>
        <Image source={{ uri: avatarUrl }} style={styles.commentAvatar} />
        <View style={styles.commentContent}>
          <Text style={styles.commentUsername}>
            {item.user?.username || "Unknown"}
          </Text>
          <Text style={styles.commentText}>{item.text}</Text>
          <Text style={styles.commentTime}>
            {getRelativeTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  // ====================================
  // RENDER EMPTY STATE
  // ====================================
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="chatbubble-outline" size={40} color="#c7c7c7" />
      <Text style={styles.emptyTitle}>No comments yet</Text>
      <Text style={styles.emptySubtitle}>Be the first to comment!</Text>
    </View>
  );

  // ====================================
  // MAIN RENDER
  // ====================================
  return (
    <View style={styles.container}>
      {/* Drag Handle */}
      <View style={styles.dragHandleContainer}>
        <View style={styles.dragHandle} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#262626" />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Comments List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#888" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={comments}
          keyExtractor={(item) => item._id}
          renderItem={renderComment}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            comments.length === 0 ? styles.emptyList : styles.listContent
          }
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Floating Pill Input Bar */}
      <Animated.View
        style={[
          styles.inputBarWrapper,
          { paddingBottom: Animated.add(keyboardPadding, insets.bottom) },
        ]}
      >
        <View style={styles.inputBar}>
          <Image
            source={{
              uri: user?.profilePicture || DEFAULT_AVATAR,
            }}
            style={styles.inputAvatar}
          />
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="Add a comment..."
            placeholderTextColor="#8e8e8e"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!commentText.trim() || isSubmitting}
            style={styles.postButton}
          >
            <Text
              style={[
                styles.postButtonText,
                (!commentText.trim() || isSubmitting) &&
                  styles.postButtonDisabled,
              ]}
            >
              {isSubmitting ? "Sending" : "Post"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },

  // Drag handle
  dragHandleContainer: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d0d0d0",
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    color: "#262626",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  closeButton: {
    padding: 4,
    width: 32,
    alignItems: "center",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#efefef",
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Comments list
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  emptyList: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // Comment item
  commentItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    color: "#262626",
    fontWeight: "700",
    fontSize: 13,
    marginBottom: 2,
  },
  commentText: {
    color: "#262626",
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 4,
  },
  commentTime: {
    color: "#8e8e8e",
    fontSize: 12,
  },

  // Empty state
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: "#8e8e8e",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
  },
  emptySubtitle: {
    color: "#b0b0b0",
    fontSize: 13,
    marginTop: 4,
  },

  // Floating pill input bar
  inputBarWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 8,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: "#fff",
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#262626",
    fontSize: 14,
    minHeight: 44,
    maxHeight: 80,
  },
  postButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  postButtonText: {
    color: "#f9252b",
    fontWeight: "700",
    fontSize: 14,
  },
  postButtonDisabled: {
    color: "rgba(249,37,43,0.35)",
  },
});
