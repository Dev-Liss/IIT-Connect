/**
 * ====================================
 * REELS FEED COMPONENT
 * ====================================
 * TikTok-style vertical paging feed for video reels.
 *
 * Features:
 * - Fetches only video posts via GET_REELS endpoint
 * - Full-screen vertical paging with snap-to-item
 * - Viewability tracking — only the active reel plays
 * - Loading, empty, and error states
 * - Pull-to-refresh support
 */

import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  ViewToken,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ReelCard from "./ReelCard";
import { POST_ENDPOINTS } from "../config/api";

// ====================================
// DIMENSIONS
// ====================================
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Tab bar height (must match _layout.tsx)
const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 88 : 68;

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

// ====================================
// COMPONENT
// ====================================
export default function ReelsFeed() {
  const insets = useSafeAreaInsets();

  // ── State ──
  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // ── Calculated item height ──
  // Full screen minus tab bar and bottom safe area
  const ITEM_HEIGHT =
    SCREEN_HEIGHT -
    TAB_BAR_HEIGHT -
    (Platform.OS === "ios" ? 0 : insets.bottom);

  // ====================================
  // DATA FETCHING
  // ====================================
  const fetchReels = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      }
      setError(null);

      console.log("🎬 Fetching reels from:", POST_ENDPOINTS.GET_REELS());

      const response = await fetch(POST_ENDPOINTS.GET_REELS());
      const data = await response.json();

      console.log("📥 Received reels:", data.count ?? 0);

      if (data.success) {
        const reelsData = data.data || [];
        setReels(reelsData);

        // Auto-activate the first reel
        if (reelsData.length > 0 && !showRefreshIndicator) {
          setActiveVideoId(reelsData[0]._id);
        }
      } else {
        setError(data.message || "Failed to fetch reels");
      }
    } catch (err) {
      console.error("❌ Reels fetch error:", err);
      setError("Could not load reels. Check your connection.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchReels();
    }, [fetchReels]),
  );

  // ====================================
  // VIEWABILITY CONFIG (CRITICAL)
  // ====================================
  // An item is considered "viewable" when 80% of it is visible
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  // When viewable items change, set the first fully visible item as active
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const firstVisible = viewableItems[0];
        if (firstVisible.item?._id) {
          setActiveVideoId(firstVisible.item._id);
        }
      }
    },
  ).current;

  // ====================================
  // ITEM LAYOUT — Optimization for paging
  // ====================================
  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    [ITEM_HEIGHT],
  );

  // ====================================
  // RENDER ITEM
  // ====================================
  const renderItem = useCallback(
    ({ item }: { item: Reel }) => (
      <ReelCard
        reel={item}
        isActive={item._id === activeVideoId}
        height={ITEM_HEIGHT}
      />
    ),
    [activeVideoId, ITEM_HEIGHT],
  );

  // ====================================
  // KEY EXTRACTOR
  // ====================================
  const keyExtractor = useCallback((item: Reel) => item._id, []);

  // ====================================
  // LOADING STATE
  // ====================================
  if (isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading reels…</Text>
      </View>
    );
  }

  // ====================================
  // ERROR STATE
  // ====================================
  if (error && reels.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="cloud-offline-outline" size={56} color="#555" />
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // ====================================
  // EMPTY STATE
  // ====================================
  if (reels.length === 0) {
    return (
      <View style={styles.centeredContainer}>
        <Ionicons name="videocam-outline" size={72} color="#555" />
        <Text style={styles.emptyTitle}>No Reels Yet</Text>
        <Text style={styles.emptySubtitle}>
          Video posts will appear here. Be the first to upload a reel!
        </Text>
      </View>
    );
  }

  // ====================================
  // MAIN RENDER — VERTICAL PAGING FLATLIST
  // ====================================
  return (
    <View style={styles.container}>
      <FlatList
        data={reels}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        // Paging — snap to items
        pagingEnabled
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        // Layout
        getItemLayout={getItemLayout}
        showsVerticalScrollIndicator={false}
        // Viewability tracking — controls which video plays
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        // Pull to refresh
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchReels(true)}
            tintColor="#fff"
            colors={["#f9252b"]}
            progressBackgroundColor="#222"
          />
        }
        // Performance optimizations
        removeClippedSubviews={Platform.OS === "android"}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
      />
    </View>
  );
}

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  // ── Centered states (loading, error, empty) ──
  centeredContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 14,
  },

  // ── Error ──
  errorTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 6,
  },
  errorText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  // ── Empty ──
  emptyTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
