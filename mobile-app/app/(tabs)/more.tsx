/**
 * ====================================
 * MORE SCREEN
 * ====================================
 * A 2-column grid of squircle feature tiles.
 * Each tile has a tinted background, themed border,
 * and a Feather line-style icon.
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
import { Feather } from "@expo/vector-icons";

// ── Tile Data ──────────────────────────────────────
interface TileItem {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  themeColor: string;
  background: string;
}

const TILES: TileItem[] = [
  {
    label: "Anonymous\nReport",
    icon: "flag",
    themeColor: "#f9252b",
    background: "#fff3f3",
  },
  {
    label: "Empty Hall\nFinder",
    icon: "map-pin",
    themeColor: "#007AFF",
    background: "#f0f6ff",
  },
  {
    label: "Clubs",
    icon: "users",
    themeColor: "#34C759",
    background: "#f2fbf4",
  },
];

// ── Screen Component ───────────────────────────────
export default function MoreScreen() {
  const handleTilePress = () => {
    Alert.alert("Coming Soon");
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
            onPress={handleTilePress}
            style={[
              styles.tile,
              {
                backgroundColor: tile.background,
                borderColor: tile.themeColor,
              },
            ]}
          >
            <Feather name={tile.icon} size={36} color={tile.themeColor} />
            <Text style={[styles.tileLabel, { color: tile.themeColor }]}>
              {tile.label}
            </Text>
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
    backgroundColor: "#fafafa",
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
  tile: {
    width: "47%",
    aspectRatio: 1,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  tileLabel: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 20,
  },
});
