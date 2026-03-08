/**
 * ====================================
 * TAB NAVIGATION LAYOUT — Floating Pill Design
 * ====================================
 * Layout:
 *   [  Home | Academic | More | Profile  ]  [ + ]
 *   |<-------- White Floating Pill -------->|  ^Red Circle (opens Create Menu)
 *
 * Tab order in router:  index | academic | more | messages | profile
 * Active Color: #f9252b (Brand Red)
 * Pill BG:      #FFFFFF (White)
 *
 * The RED (+) FAB no longer navigates — it opens a "Create Content" bottom sheet.
 * Messages has moved to the Home screen header.
 */

import { Tabs, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
  Modal,
  Animated as RNAnimated,
  TouchableWithoutFeedback,
} from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolateColor,
  LinearTransition,
  FadeIn,
} from "react-native-reanimated";

// ─── Pill Tab Icon Map ────────────────────────────────────────────────────────
const PILL_TABS = [
  { name: "index", label: "Home", icon: "home", iconOutline: "home-outline" },
  {
    name: "academic",
    label: "Academic",
    icon: "book",
    iconOutline: "book-outline",
  },
  {
    name: "more",
    label: "More",
    icon: "grid",
    iconOutline: "grid-outline",
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person",
    iconOutline: "person-outline",
  },
];

// ─── Create Content Tiles ─────────────────────────────────────────────────────
const CREATE_TILES = [
  {
    label: "Create Post",
    description: "Share a photo or update",
    icon: "image",
    themeColor: "#f9252b",
    background: "#fff3f3",
    route: "/create-post",
  },
  {
    label: "Create Reel",
    description: "Share a short video",
    icon: "videocam",
    themeColor: "#0EA5E9",
    background: "#f0f9ff",
    route: "/create-reel",
  },
  {
    label: "Create Event",
    description: "Organize a campus event",
    icon: "calendar",
    themeColor: "#34C759",
    background: "#f2fbf4",
    route: "/create-event",
  },
  {
    label: "Announcement",
    description: "Broadcast to community",
    icon: "megaphone",
    themeColor: "#FF9500",
    background: "#fff8f0",
    route: "/create-announcement",
  },
];

// ─── Academic-Only Tiles (shown when on Academic tab) ─────────────────────────
const ACADEMIC_TILES = [
  {
    label: "Create Kuppi",
    description: "Host a study session",
    icon: "school",
    themeColor: "#007AFF",
    background: "#f0f6ff",
    action: "kuppi",
  },
  {
    label: "Add Resource",
    description: "Share notes & papers",
    icon: "document-text",
    themeColor: "#8B5CF6",
    background: "#f5f0ff",
    action: "resource",
  },
];

// ─── Animated Tab Item ───────────────────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnimatedTabItem = ({ tab, focused, onPress }) => {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: 250 });
  }, [focused]);

  const animatedBackground = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["rgba(240, 240, 240, 0)", "rgba(240, 240, 240, 1)"],
    ),
  }));

  return (
    <AnimatedPressable
      layout={LinearTransition.duration(250)}
      style={[
        styles.pillItemContainer,
        { flex: focused ? 2.2 : 1 },
        animatedBackground,
      ]}
      accessibilityRole="button"
      accessibilityLabel={tab.label}
      accessibilityState={focused ? { selected: true } : {}}
      onPress={onPress}
    >
      <View style={styles.pillItemTouch}>
        <Ionicons
          name={focused ? tab.icon : tab.iconOutline}
          size={22}
          color={focused ? "#1a1a1a" : "#888"}
        />
        {focused && (
          <Animated.Text
            entering={FadeIn.duration(250)}
            style={styles.pillLabel}
            numberOfLines={1}
          >
            {tab.label}
          </Animated.Text>
        )}
      </View>
    </AnimatedPressable>
  );
};

// ─── Create Content Bottom Sheet ─────────────────────────────────────────────
function CreateContentSheet({ visible, onClose, currentTab }) {
  const router = useRouter();
  const slideAnim = useRef(new RNAnimated.Value(400)).current;
  const backdropAnim = useRef(new RNAnimated.Value(0)).current;

  // Separate internal state: Modal only unmounts AFTER exit animation completes.
  // This is the fix — the parent `visible` can go false immediately, but we keep
  // the Modal mounted until the slide-down finishes so the animation always plays.
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      // 1. Reset to starting position BEFORE making the modal visible,
      //    so every open always animates in from the bottom.
      slideAnim.setValue(400);
      backdropAnim.setValue(0);
      // 2. Mount the Modal
      setModalVisible(true);
      // 3. Play enter animation.
      //    slideAnim uses useNativeDriver: false so the JS thread tracks
      //    the current translateY value in real-time. This keeps the tiles'
      //    touch hit-test rectangles in sync with their visual position
      //    throughout the animation, making them tappable immediately.
      RNAnimated.parallel([
        RNAnimated.spring(slideAnim, {
          toValue: 0,
          damping: 22,
          stiffness: 250,
          useNativeDriver: false,
        }),
        RNAnimated.timing(backdropAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      // Play exit animation first, THEN unmount the Modal in the callback
      RNAnimated.parallel([
        RNAnimated.timing(slideAnim, {
          toValue: 400,
          duration: 200,
          useNativeDriver: false,
        }),
        RNAnimated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(({ finished }) => {
        // Only hide Modal after animation completes (or is interrupted)
        if (finished) setModalVisible(false);
      });
    }
  }, [visible]);

  const handleTilePress = (tile) => {
    onClose();
    if (tile.action) {
      // Academic tiles — navigate to academic tab with openModal param
      setTimeout(() => {
        router.push({
          pathname: "/(tabs)/academic",
          params: { openModal: tile.action },
        });
      }, 180);
    } else if (tile.route) {
      // Small delay so the sheet closes smoothly before navigating
      setTimeout(() => router.push(tile.route), 180);
    }
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <RNAnimated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.55],
              }),
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <RNAnimated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Handle bar */}
        <View style={styles.sheetHandle} />

        {/* Header row */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            {currentTab === "academic" ? "Create" : "Create Content"}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            hitSlop={10}
          >
            <Ionicons name="close" size={22} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Tile Grid — 2×2 or 3×2 depending on active tab */}
        <View style={styles.tileGrid}>
          {(currentTab === "academic"
            ? [...CREATE_TILES, ...ACADEMIC_TILES]
            : CREATE_TILES
          ).map((tile) => (
            <TouchableOpacity
              key={tile.label}
              activeOpacity={0.75}
              onPress={() => handleTilePress(tile)}
              style={[
                styles.createTile,
                {
                  backgroundColor: tile.background,
                  borderColor: tile.themeColor + "55", // 33% opacity border
                },
              ]}
            >
              <View
                style={[
                  styles.iconCircle,
                  { backgroundColor: tile.themeColor + "22" },
                ]}
              >
                <Ionicons name={tile.icon} size={30} color={tile.themeColor} />
              </View>
              <Text style={[styles.tileLabel, { color: tile.themeColor }]}>
                {tile.label}
              </Text>
              <Text style={styles.tileDescription}>{tile.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </RNAnimated.View>
    </Modal>
  );
}

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  const [sheetVisible, setSheetVisible] = useState(false);

  const bottomOffset = Math.max(insets.bottom, 12);

  const handlePress = (routeName, isFocused) => {
    const route = state.routes.find((r) => r.name === routeName);
    if (!route) return;

    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate({ name: routeName, merge: true });
    }
  };

  const isFocused = (routeName) => {
    const idx = state.routes.findIndex((r) => r.name === routeName);
    return state.index === idx;
  };

  return (
    <>
      <View
        style={[styles.outerContainer, { bottom: bottomOffset + 8 }]}
        pointerEvents="box-none"
      >
        {/* ──────────────────── WHITE PILL ──────────────────── */}
        <View style={styles.pill}>
          {PILL_TABS.map((tab) => {
            const focused = isFocused(tab.name);
            return (
              <AnimatedTabItem
                key={tab.name}
                tab={tab}
                focused={focused}
                onPress={() => handlePress(tab.name, focused)}
              />
            );
          })}
        </View>

        {/* ──────────────────── RED CREATE (+) CIRCLE ──────────────────── */}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Create Content"
          onPress={() => setSheetVisible(true)}
          style={styles.actionButton}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Create Content Bottom Sheet */}
      <CreateContentSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        currentTab={state.routes[state.index]?.name}
      />
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 999,
  },

  // White pill
  pill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 50,
    marginRight: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    boxShadow: "0px 6px 18px 0px rgba(0, 0, 0, 0.1)",
    elevation: 10,
  },

  // Animated container for each pill tab
  pillItemContainer: {
    borderRadius: 40,
    marginHorizontal: 2,
    overflow: "hidden",
  },

  // Touch area inside the animated container
  pillItemTouch: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    minHeight: 44,
  },

  // Pill tab label
  pillLabel: {
    marginLeft: 7,
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
    letterSpacing: 0.1,
  },

  // Red create (+) circle
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f9252b",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 6px 12px 0px rgba(249, 37, 43, 0.45)",
    elevation: 12,
  },

  // ── Bottom Sheet ─────────────────────────────────────
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },

  sheet: {
    position: "absolute",
    // Extend 80px BELOW the screen so spring-overshoot (negative translateY)
    // never reveals the background beneath the card.
    bottom: -80,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    // Compensate the -80 bottom offset so visible content still sits correctly.
    paddingBottom: Platform.OS === "ios" ? 140 : 128,
    paddingHorizontal: 20,
    paddingTop: 12,
    // Shadow above sheet
    boxShadow: "0px -4px 20px 0px rgba(0, 0, 0, 0.12)",
    elevation: 24,
  },

  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e0e0e0",
    alignSelf: "center",
    marginBottom: 16,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 0.2,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f4f4f4",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Tile Grid ────────────────────────────────────────
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 14,
  },

  createTile: {
    width: "47%",
    borderRadius: 24,
    borderWidth: 1.5,
    paddingVertical: 20,
    paddingHorizontal: 14,
    alignItems: "flex-start",
    justifyContent: "flex-end",
    minHeight: 130,
  },

  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  tileLabel: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
    letterSpacing: 0.1,
  },

  tileDescription: {
    fontSize: 11,
    color: "#888",
    lineHeight: 15,
  },
});

// ─── Tab Layout ───────────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {/* ── Tab 1: Home ── */}
      <Tabs.Screen name="index" options={{ title: "Home" }} />

      {/* ── Tab 2: Academic ── */}
      <Tabs.Screen name="academic" options={{ title: "Academic" }} />

      {/* ── Tab 3: More (now in pill) ── */}
      <Tabs.Screen name="more" options={{ title: "More" }} />

      {/* ── Tab 4: Messages (accessed via header) ── */}
      <Tabs.Screen name="messages" options={{ title: "Messages" }} />

      {/* ── Tab 5: Profile ── */}
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
