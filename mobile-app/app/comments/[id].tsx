/**
 * ====================================
 * COMMENTS SCREEN
 * ====================================
 * Displays all comments for a specific post and
 * allows the logged-in user to add a new comment.
 *
 * Features:
 * - FlatList of comments (avatar, username, text, time)
 * - Bottom input bar with KeyboardAvoidingView
 * - Fetch comments on mount
 * - Optimistic append on submit
 * - Pull-to-refresh
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
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { POST_ENDPOINTS } from "../../src/config/api";

// ====================================
// TYPE DEFINITIONS
// ====================================
interface CommentUser {
  _id: string;
  username: string;
}

interface Comment {
  _id: string;
  user: CommentUser;
  text: string;
  createdAt: string;
}

// ====================================
// MAIN COMPONENT
// ====================================
export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();

  // State
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);

  // ====================================
  // FETCH COMMENTS
  // ====================================
  const fetchComments = async (showRefresh = false) => {
    try {
      if (showRefresh) setIsRefreshing(true);

      const response = await fetch(POST_ENDPOINTS.GET_COMMENTS(id!));
      const data = await response.json();

      if (data.success) {
        setComments(data.comments || []);
      } else {
        console.error("❌ Failed to fetch comments:", data.message);
      }
    } catch (error) {
      console.error("❌ Fetch comments error:", error);
      Alert.alert("Error", "Could not load comments. Please try again.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) fetchComments();
  }, [id]);

  // ====================================
  // SUBMIT COMMENT
  // ====================================
  const handleSubmit = async () => {
    if (!commentText.trim() || !user || isSubmitting) return;

    const trimmedText = commentText.trim();
    setIsSubmitting(true);
    setCommentText("");

    try {
      const response = await fetch(POST_ENDPOINTS.ADD_COMMENT(id!), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          text: trimmedText,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add comment");
      }

      // Append the populated comment returned by the server
      setComments((prev) => [...prev, data.comment]);

      // Scroll to the bottom to show the new comment
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);

      console.log("💬 Comment posted successfully");
    } catch (error) {
      console.error("❌ Submit comment error:", error);
      Alert.alert("Error", "Could not post comment. Please try again.");
      // Restore the text so user doesn't lose it
      setCommentText(trimmedText);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ====================================
  // FORMAT RELATIVE TIME
  // ====================================
  const getRelativeTime = (dateString: string): string => {
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
  const renderComment = ({ item }: { item: Comment }) => {
    const avatarUrl = `https://i.pravatar.cc/150?u=${item.user?._id || item._id}`;

    return (
      <View style={styles.commentItem}>
        <Image source={{ uri: avatarUrl }} style={styles.commentAvatar} />
        <View style={styles.commentContent}>
          <Text style={styles.commentText}>
            <Text style={styles.commentUsername}>
              {item.user?.username || "Unknown"}{" "}
            </Text>
            {item.text}
          </Text>
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
      <Ionicons name="chatbubble-outline" size={48} color="#c7c7c7" />
      <Text style={styles.emptyTitle}>No comments yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to share your thoughts!
      </Text>
    </View>
  );

  // ====================================
  // MAIN RENDER
  // ====================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ========== HEADER ========== */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#262626" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comments</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ========== COMMENTS LIST ========== */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f9252b" />
          <Text style={styles.loadingText}>Loading comments...</Text>
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
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
            refreshing={isRefreshing}
            onRefresh={() => fetchComments(true)}
          />

          {/* ========== INPUT BAR ========== */}
          <View style={styles.inputBar}>
            <Image
              source={{
                uri: `https://i.pravatar.cc/150?u=${user?.id || "default"}`,
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
                {isSubmitting ? "..." : "Post"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 10 : 10,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
    backgroundColor: "#fff",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
  },
  headerSpacer: {
    width: 32,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8e8e8e",
  },
  // Keyboard View
  keyboardView: {
    flex: 1,
  },
  // List
  listContent: {
    paddingVertical: 8,
  },
  emptyList: {
    flexGrow: 1,
  },
  // Comment Item
  commentItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentText: {
    fontSize: 14,
    color: "#262626",
    lineHeight: 18,
  },
  commentUsername: {
    fontWeight: "600",
  },
  commentTime: {
    fontSize: 12,
    color: "#8e8e8e",
    marginTop: 4,
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8e8e8e",
    marginTop: 6,
  },
  // Input Bar
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#efefef",
    backgroundColor: "#fff",
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#262626",
    maxHeight: 80,
    paddingVertical: 8,
  },
  postButton: {
    paddingLeft: 12,
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#f9252b",
  },
  postButtonDisabled: {
    color: "#f9a5a8",
  },
});
