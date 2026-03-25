/**
 * ====================================
 * MORE SCREEN
 * ====================================
 * A 2-column grid of squircle feature tiles.
 * Each tile has a tinted background, themed border,
 * and a looping .webm illustration.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { useRouter } from "expo-router";

// ── Tile Data ──────────────────────────────────────
const TILES = [
  {
    label: "Anonymous\nReport",
    illustration: require("../../assets/images/annonymous-report.webm"),
    borderColor: "#EF7171",
    route: "/anonymous-report",
  },
  {
    label: "Empty Hall\nFinder",
    illustration: require("../../assets/images/empty-hall-finder.webm"),
    borderColor: "#93C5FD",
    route: null,
  },
  {
    label: "Clubs &\nCommunities",
    illustration: require("../../assets/images/clubs.webm"),
    borderColor: "#86EFAC",
    route: null,
  },
  {
    label: "Events &\nAnnouncements",
    illustration: require("../../assets/images/events-annoucements.webm"),
    borderColor: "#FDBA74",
    route: "/events",
  },
  {
    label: "Admin\nDashboard",
    illustration: require("../../assets/images/admin-dash.webm"),
    borderColor: "#C4B5FD",
    route: "/admin-dashboard",
  },
];

// ── Screen Component ───────────────────────────────
export default function MoreScreen() {
  const router = useRouter();

  const handleTilePress = (tile) => {
    if (tile.route) {
      router.push(tile.route);
    } else {
      Alert.alert("Coming Soon");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      {/* Tile Grid */}
      <View style={styles.grid}>
        {TILES.map((tile) => (
          <TouchableOpacity
            key={tile.label}
            activeOpacity={0.7}
            onPress={() => handleTilePress(tile)}
            style={styles.tileContainer}
          >
            <View style={[styles.tile, { borderColor: tile.borderColor }]}>
              <Video
                source={tile.illustration}
                style={styles.illustration}
                resizeMode={ResizeMode.COVER}
                shouldPlay
                isLooping
                isMuted
                pointerEvents="none"
              />
            </View>
            <Text style={styles.tileLabel}>{tile.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 10 : 10,
    paddingBottom: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#262626",
  },

  /* ── Grid ── */
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 16,
  },

  /* ── Individual Tile ── */
  tileContainer: {
    width: "47%",
    alignItems: "center",
    marginBottom: 20,
  },
  tile: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  tileLabel: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
    color: "#444",
  },
});
