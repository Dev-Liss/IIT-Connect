/**
 * ====================================
 * TAB NAVIGATION LAYOUT — Floating Pill Design
 * ====================================
 * Layout:
 *   [  Home | Academic | Messages | Profile  ]  [ + ]
 *   |<-------- White Floating Pill ---------->|  ^Red Circle
 *
 * Tab order in router:  index | academic | more | messages | profile
 * Active Color: #f9252b (Brand Red)
 * Pill BG:      #FFFFFF (White)
 */

import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Pressable,
} from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  interpolateColor,
  LinearTransition,
  FadeIn,
} from "react-native-reanimated";

// ─── Icon map ────────────────────────────────────────────────────────────────
const PILL_TABS = [
  { name: "index", label: "Home", icon: "home", iconOutline: "home-outline" },
  {
    name: "academic",
    label: "Academic",
    icon: "book",
    iconOutline: "book-outline",
  },
  {
    name: "messages",
    label: "Messages",
    icon: "chatbubble",
    iconOutline: "chatbubble-outline",
  },
  {
    name: "profile",
    label: "Profile",
    icon: "person",
    iconOutline: "person-outline",
  },
];

const ACTION_TAB = { name: "more" };

// ─── Animated Tab Item ───────────────────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnimatedTabItem = ({ tab, focused, onPress }) => {
  // Shared value for driving color interpolation
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, { duration: 250 });
  }, [focused]);

  // Interpolate the pill background smoothly
  const animatedBackground = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      ["rgba(240, 240, 240, 0)", "rgba(240, 240, 240, 1)"],
    ),
  }));

  return (
    <AnimatedPressable
      // Beautiful liquid morphing that inherently balances flex layout!
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
        {/* Render text conditionally. LayoutTransition naturally centers it without forced width limits! */}
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

// ─── Custom Tab Bar ───────────────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();

  const bottomOffset = Math.max(insets.bottom, 12);

  // Helper: navigate to a route by name key
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

  // Resolve focused state per route name
  const isFocused = (routeName) => {
    const idx = state.routes.findIndex((r) => r.name === routeName);
    return state.index === idx;
  };

  const actionFocused = isFocused(ACTION_TAB.name);

  return (
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

      {/* ──────────────────── RED ACTION CIRCLE ──────────────────── */}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="More"
        accessibilityState={actionFocused ? { selected: true } : {}}
        onPress={() => handlePress(ACTION_TAB.name, actionFocused)}
        style={[
          styles.actionButton,
          actionFocused && styles.actionButtonActive,
        ]}
        activeOpacity={0.8}
      >
        <Ionicons
          name={actionFocused ? "grid" : "grid-outline"}
          size={28}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
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
    // Lift above page content
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
    // Shadow — iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    // Shadow — Android
    elevation: 10,
  },

  // Animated container for the pill tab
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

  // Red action circle
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f9252b",
    alignItems: "center",
    justifyContent: "center",
    // Shadow — iOS
    shadowColor: "#f9252b",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    // Shadow — Android
    elevation: 12,
  },

  // Slight scale-down when focused (already on that screen)
  actionButtonActive: {
    backgroundColor: "#d41f24",
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

      {/* ── Tab 3: More (action button) ── */}
      <Tabs.Screen name="more" options={{ title: "More" }} />

      {/* ── Tab 4: Messages ── */}
      <Tabs.Screen name="messages" options={{ title: "Messages" }} />

      {/* ── Tab 5: Profile ── */}
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
