/**
 * ====================================
 * HOME SCREEN (FEED)
 * ====================================
 * Main home tab displaying the social feed.
 *
 * Features:
 * - Custom Header with IIT CoNNect logo image
 * - Create post & notification icons
 * - Fetches posts from API on mount
 * - Pull-to-refresh functionality
 * - Loading, empty, and error states
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import PostCard from "../../src/components/PostCard";
import StoriesRail from "../../src/components/StoriesRail";
import { POST_ENDPOINTS } from "../../src/config/api";

// Post type (matches backend response)
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
  };
  likes?: string[];
  createdAt: string;
}

export default function HomeScreen() {
  const router = useRouter();

  // State
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ====================================
  // FETCH POSTS
  // ====================================
  const fetchPosts = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      }
      setError(null);

      console.log("📡 Fetching posts from:", POST_ENDPOINTS.GET_ALL);

      const response = await fetch(POST_ENDPOINTS.GET_ALL);
      const data = await response.json();

      console.log("📥 Received posts:", data);

      if (data.success) {
        setPosts(data.data || []);
      } else {
        setError(data.message || "Failed to fetch posts");
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError("Could not connect to server. Check your connection.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch posts when screen comes into focus (fixes stale data issue)
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [fetchPosts]),
  );

  // Pull to refresh handler
  const onRefresh = () => {
    fetchPosts(true);
  };

  // ====================================
  // RENDER CUSTOM HEADER
  // ====================================
  const renderHeader = () => (
    <View style={styles.header}>
      {/* Left: IIT CoNNect Logo Image */}
      <Image
        source={require("../../src/assets/images/iit-connect-logo.png")}
        style={styles.headerLogo}
        resizeMode="contain"
      />

      {/* Right: Action Icons */}
      <View style={styles.headerActions}>
        {/* Create Post Button */}
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.push("/create-menu")}
        >
          <Feather name="plus" size={24} color="#262626" />
        </TouchableOpacity>

        {/* Notifications Button */}
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="notifications-outline" size={24} color="#262626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ====================================
  // RENDER EMPTY STATE
  // ====================================
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="images-outline" size={80} color="#c7c7c7" />
      <Text style={styles.emptyTitle}>No Posts Yet</Text>
      <Text style={styles.emptySubtitle}>
        Be the first to share something with the IIT community!
      </Text>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push("/create-post")}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.createButtonText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );

  // ====================================
  // RENDER ERROR STATE
  // ====================================
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Ionicons name="cloud-offline-outline" size={60} color="#8e8e8e" />
      <Text style={styles.errorTitle}>Connection Error</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => fetchPosts()}>
        <Ionicons name="refresh" size={18} color="#fff" />
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // ====================================
  // RENDER LOADING STATE
  // ====================================
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        {renderHeader()}
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#f9252b" />
          <Text style={styles.loadingText}>Loading feed...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ====================================
  // RENDER ERROR
  // ====================================
  if (error && posts.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        {renderHeader()}
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  // ====================================
  // RENDER FEED
  // ====================================
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {renderHeader()}

      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={(id) => console.log("Like:", id)}
            onShare={(id) => console.log("Share:", id)}
          />
        )}
        ListHeaderComponent={<StoriesRail />}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={["#f9252b"]}
            tintColor="#f9252b"
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          posts.length === 0 ? styles.emptyList : undefined
        }
      />
    </SafeAreaView>
  );
}

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  // Custom Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight! + 10 : 10,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
  },

  headerLogo: {
    height: 40,
    width: 140,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 18,
    padding: 4,
  },
  // Loading
  loadingContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#8e8e8e",
  },
  // Empty State
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#262626",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#8e8e8e",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9252b",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#262626",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#8e8e8e",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#457b9d",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
});
