import React, { useCallback, useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

const SPRING_CONFIG = { stiffness: 260, damping: 22, mass: 0.8 };
const PILL_PADDING = 4;
const PILL_V_PADDING = 6;
const PILL_H_PADDING = 18;

/**
 * TikTok-style pill toggle.
 *
 * @param {string[]}  tabs         – Array of tab labels, e.g. ["For You", "Followed"]
 * @param {string}    [defaultTab] – Label of the initially active tab (defaults to first)
 * @param {function}  [onChange]   – Called with the selected tab label on change
 */
export default function PillToggle({ tabs, defaultTab, onChange }) {
  const defaultIndex = defaultTab ? Math.max(tabs.indexOf(defaultTab), 0) : 0;
  const activeIndex = useSharedValue(defaultIndex);

  // Measure tab widths dynamically so the sliding pill fits any label length
  const tabWidths = useSharedValue(tabs.map(() => 0));

  useEffect(() => {
    activeIndex.value = defaultIndex;
  }, [defaultIndex]);

  // ── Animated sliding pill ──
  const pillStyle = useAnimatedStyle(() => {
    const widths = tabWidths.value;
    const idx = activeIndex.value;
    const floorIdx = Math.floor(idx);
    const ceilIdx = Math.min(floorIdx + 1, tabs.length - 1);
    const frac = idx - floorIdx;

    // X offsets at floor and ceil tab positions
    let floorX = 0;
    for (let i = 0; i < floorIdx; i++) floorX += widths[i] || 0;
    let ceilX = 0;
    for (let i = 0; i < ceilIdx; i++) ceilX += widths[i] || 0;

    const translateX = floorX + (ceilX - floorX) * frac;
    const width =
      (widths[floorIdx] || 0) +
      ((widths[ceilIdx] || 0) - (widths[floorIdx] || 0)) * frac;

    return {
      transform: [{ translateX }],
      width,
    };
  });

  // ── Handlers ──
  const handlePress = useCallback(
    (index) => {
      activeIndex.value = withSpring(index, SPRING_CONFIG);
      onChange?.(tabs[index]);
    },
    [tabs, onChange],
  );

  const handleLayout = useCallback(
    (index, e) => {
      const w = e.nativeEvent.layout.width;
      tabWidths.modify((prev) => {
        "worklet";
        const next = [...prev];
        next[index] = w;
        return next;
      });
    },
    [],
  );

  return (
    <View style={styles.container}>
      {/* Sliding white pill behind the text */}
      <Animated.View style={[styles.activePill, pillStyle]} />

      {/* Tab labels */}
      {tabs.map((label, i) => (
        <Pressable
          key={label}
          onLayout={(e) => handleLayout(i, e)}
          onPress={() => handlePress(i)}
          style={styles.tab}
        >
          <TabLabel label={label} index={i} activeIndex={activeIndex} />
        </Pressable>
      ))}
    </View>
  );
}

// ── Animated label (color reacts to active state) ──
function TabLabel({ label, index, activeIndex }) {
  const textStyle = useAnimatedStyle(() => {
    const isActive = Math.round(activeIndex.value) === index;
    return {
      color: isActive ? "#000000" : "rgba(255,255,255,0.85)",
      fontWeight: isActive ? "600" : "500",
    };
  });

  return (
    <Animated.Text style={[styles.tabText, textStyle]}>{label}</Animated.Text>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    padding: PILL_PADDING,
    // backdrop-filter is not natively supported in RN; the semi-transparent
    // background over the dark reel already gives the frosted look.
  },
  activePill: {
    position: "absolute",
    top: PILL_PADDING,
    bottom: PILL_PADDING,
    left: PILL_PADDING,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.15)",
    elevation: 4,
  },
  tab: {
    paddingVertical: PILL_V_PADDING,
    paddingHorizontal: PILL_H_PADDING,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontSize: 14,
  },
});
