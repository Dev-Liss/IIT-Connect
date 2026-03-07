import React, { useEffect } from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

// Spring tuning for the sliding indicator and active label emphasis.
const SPRING_CONFIG = { stiffness: 200, damping: 20, mass: 0.8 };

// Static tab configuration for the two available content modes.
const TABS = [
  { key: "feed", label: "Feed" },
  { key: "reels", label: "Reels" },
];

const ContentSwitcher = ({ activeTab, onTabChange }) => {
  // Convert the external tab key into an index so animation math stays simple.
  const activeIndex = activeTab === "feed" ? 0 : 1;

  // Shared animation values live on the UI thread, which keeps the motion smooth.
  const indicatorX = useSharedValue(0);
  const feedScale = useSharedValue(activeIndex === 0 ? 1.05 : 1);
  const reelsScale = useSharedValue(activeIndex === 1 ? 1.05 : 1);

  // Whenever the active tab changes, slide the indicator and slightly enlarge
  // the active label to make the selected state more obvious.
  useEffect(() => {
    indicatorX.value = withSpring(activeIndex, SPRING_CONFIG);
    feedScale.value = withSpring(activeIndex === 0 ? 1.05 : 1, SPRING_CONFIG);
    reelsScale.value = withSpring(activeIndex === 1 ? 1.05 : 1, SPRING_CONFIG);
  }, [activeIndex]);

  // Move the red indicator horizontally by one tab width per index step.
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value * TAB_WIDTH }],
  }));

  // Independent scale animations let each label respond to selection state.
  const feedTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: feedScale.value }],
  }));

  const reelsTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: reelsScale.value }],
  }));

  // Match each rendered tab with the animated style for its label.
  const textScales = [feedTextStyle, reelsTextStyle];

  return (
    // The outer wrapper owns the border and shadow so they are not clipped.
    <View style={styles.outerWrapper}>
      {/* BlurView creates the frosted-glass background inside the pill. */}
      <BlurView intensity={50} tint="light" style={styles.blurContainer}>
        {/* Semi-transparent dark tint over the blur */}
        <View style={styles.tintOverlay} />

        {/* Sliding active indicator */}
        <Animated.View style={[styles.indicator, indicatorStyle]} />

        {/* Render one pressable per tab and forward the selected key upward. */}
        {TABS.map((tab, i) => (
          <Pressable
            key={tab.key}
            style={styles.tabButton}
            onPress={() => onTabChange(tab.key)}
          >
            <Animated.Text
              style={[
                styles.tabText,
                activeTab === tab.key ? styles.activeText : styles.inactiveText,
                textScales[i],
              ]}
            >
              {tab.label}
            </Animated.Text>
          </Pressable>
        ))}
      </BlurView>
    </View>
  );
};

// Layout constants are grouped here so sizing changes stay predictable.
const CONTAINER_PADDING = 4;
const CONTAINER_HEIGHT = 46;
const TAB_WIDTH = 100;
const CONTAINER_WIDTH = TAB_WIDTH * 2 + CONTAINER_PADDING * 2+3;

const styles = StyleSheet.create({
  // Outer wrapper carries the border and shadow without clipping them.
  outerWrapper: {
    width: CONTAINER_WIDTH,
    height: CONTAINER_HEIGHT,
    borderRadius: 999,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  // Inner container clips the blur, tint, indicator, and labels to the pill.
  blurContainer: {
    flex: 1,
    borderRadius: 999,
    overflow: "hidden",
    flexDirection: "row",
    padding: CONTAINER_PADDING,
  },
  // A dark tint offsets the light BlurView tint so the background reads neutral.
  tintOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.06)",
    borderRadius: 999,
  },
  // The red selection pill sits behind the text and slides left/right.
  indicator: {
    position: "absolute",
    top: CONTAINER_PADDING,
    bottom: CONTAINER_PADDING,
    left: CONTAINER_PADDING,
    width: TAB_WIDTH,
    borderRadius: 999,
    backgroundColor: "#ef4444",
    ...Platform.select({
      ios: {
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  // Each tab fills half the control and keeps its label centered.
  tabButton: {
    flex: 1,
    height: CONTAINER_HEIGHT - CONTAINER_PADDING * 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  // Base text sizing shared by active and inactive labels.
  tabText: {
    fontSize: 15,
  },
  // Active tab text is bright and bold because it sits on the red pill.
  activeText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  // Inactive tab text is darker because it sits directly on the glass background.
  inactiveText: {
    color: "rgba(0,0,0,0.75)",
    fontWeight: "600",
  },
});

export default ContentSwitcher;
