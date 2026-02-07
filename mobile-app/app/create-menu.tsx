/**
 * ====================================
 * CREATE MENU SCREEN
 * ====================================
 * Intermediate menu screen that shows a grid of
 * content creation options (Reel, Post, Event, Announcement).
 */

import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2; // 2 columns with padding

// Menu options configuration
const MENU_OPTIONS = [
  {
    id: "reel",
    title: "Create Reel",
    subtitle: "Share a short video",
    icon: "videocam-outline",
    iconType: "ionicons",
    action: "coming-soon",
  },
  {
    id: "post",
    title: "Create Post",
    subtitle: "Share a photo or update",
    icon: "image-outline",
    iconType: "ionicons",
    action: "create-post",
  },
  {
    id: "event",
    title: "Create Event",
    subtitle: "Organize a campus event",
    icon: "calendar-outline",
    iconType: "ionicons",
    action: "coming-soon",
  },
  {
    id: "announcement",
    title: "Announcement",
    subtitle: "Broadcast to community",
    icon: "megaphone-outline",
    iconType: "ionicons",
    action: "coming-soon",
  },
];

export default function CreateMenuScreen() {
  const router = useRouter();

  // Handle option press
  const handleOptionPress = (option: (typeof MENU_OPTIONS)[0]) => {
    if (option.action === "create-post") {
      router.push("/create-post");
    } else {
      Alert.alert(
        "Coming Soon",
        `${option.title} feature will be available soon!`,
        [{ text: "OK" }],
      );
    }
  };

  // Render a single menu option card
  const renderOptionCard = (option: (typeof MENU_OPTIONS)[0]) => (
    <TouchableOpacity
      key={option.id}
      style={styles.card}
      onPress={() => handleOptionPress(option)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={option.icon as any} size={36} color="#f9252b" />
      </View>
      <Text style={styles.cardTitle}>{option.title}</Text>
      <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Content</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={28} color="#262626" />
        </TouchableOpacity>
      </View>

      {/* Grid of Options */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>{MENU_OPTIONS.map(renderOptionCard)}</View>
      </View>
    </SafeAreaView>
  );
}

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 15 : 15,
    paddingBottom: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#262626",
  },
  closeButton: {
    padding: 4,
  },
  // Grid Container
  gridContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  // Card
  card: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eee",
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Shadow for Android
    elevation: 2,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff5f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#262626",
    marginBottom: 4,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#8e8e8e",
    textAlign: "center",
    lineHeight: 16,
  },
});
