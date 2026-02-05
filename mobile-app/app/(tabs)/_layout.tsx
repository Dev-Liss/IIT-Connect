/**
 * ====================================
 * TAB NAVIGATION LAYOUT
 * ====================================
 * Bottom tab bar with 5 tabs:
 * Home | Academic | More | Messages | Profile
 *
 * Active Color: #f9252b (Red)
 * Inactive Color: Black
 */

import { Tabs } from "expo-router";
import { Octicons, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";

export default function TabLayout() {
  // Get safe area insets to handle system navigation bar
  const insets = useSafeAreaInsets();

  // Calculate tab bar height based on platform and safe area
  const tabBarHeight = Platform.OS === "ios" ? 88 : 60 + insets.bottom;
  const tabBarPaddingBottom =
    Platform.OS === "ios" ? 28 : Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        // Hide the default header - we'll use custom headers
        headerShown: false,
        // Tab bar colors
        tabBarActiveTintColor: "#f9252b",
        tabBarInactiveTintColor: "black",
        // Tab bar styling with safe area handling
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#efefef",
          paddingTop: 5,
          paddingBottom: tabBarPaddingBottom,
          height: tabBarHeight,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: Platform.OS === "android" ? 4 : 0,
        },
      }}
    >
      {/* ====================================
          TAB 1: HOME
          ==================================== */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <Octicons name="home-fill" size={size} color={color} />
            ) : (
              <Octicons name="home" size={size} color={color} />
            ),
        }}
      />

      {/* ====================================
          TAB 2: ACADEMIC
          ==================================== */}
      <Tabs.Screen
        name="academic"
        options={{
          title: "Academic",
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <Ionicons name="book" size={size} color={color} />
            ) : (
              <Ionicons name="book-outline" size={size} color={color} />
            ),
        }}
      />

      {/* ====================================
          TAB 3: MORE
          ==================================== */}
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <Ionicons name="grid" size={size} color={color} />
            ) : (
              <Ionicons name="grid-outline" size={size} color={color} />
            ),
        }}
      />

      {/* ====================================
          TAB 4: MESSAGES
          ==================================== */}
      <Tabs.Screen
        name="messages"
        options={{
          title: "Messages",
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <MaterialCommunityIcons
                name="message-minus"
                size={size}
                color={color}
              />
            ) : (
              <MaterialCommunityIcons
                name="message-minus-outline"
                size={size}
                color={color}
              />
            ),
        }}
      />

      {/* ====================================
          TAB 5: PROFILE
          ==================================== */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color, size }) =>
            focused ? (
              <Octicons name="person-fill" size={size} color={color} />
            ) : (
              <Octicons name="person" size={size} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}
