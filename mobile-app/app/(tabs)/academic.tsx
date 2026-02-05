/**
 * ====================================
 * ACADEMIC SCREEN (PLACEHOLDER)
 * ====================================
 * Tab for academic resources and features.
 * TODO: Implement academic features in future phases.
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AcademicScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Academic</Text>
      </View>

      {/* Placeholder Content */}
      <View style={styles.content}>
        <Ionicons name="book" size={80} color="#c7c7c7" />
        <Text style={styles.title}>Academic Hub</Text>
        <Text style={styles.subtitle}>
          Course materials, schedules, and academic resources will appear here.
        </Text>
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Coming Soon</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight! + 10 : 10,
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#262626",
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#8e8e8e",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  comingSoonBadge: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  comingSoonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
});
