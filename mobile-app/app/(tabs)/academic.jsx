/**
 * ====================================
 * ACADEMIC SCREEN
 * ====================================
 * Parent wrapper for academic features.
 * Owns the persistent "Academic" header and AcademicNavBar.
 * Renders child content: Timetable | Kuppi | Resources
 */

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AcademicNavBar from "../../src/components/AcademicNavBar";
import TimetableScreen from "../../src/screens/TimetableScreen";
import KuppiScreen from "../../src/screens/KuppiScreen";
import ResourcesScreen from "../../src/screens/ResourcesScreen";

export default function AcademicScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("Timetable");
  const [view, setView] = useState("weekly");

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Fixed Header Block */}
      <View style={[styles.headerBlock, { paddingTop: insets.top + 10 }]}>
        {/* Title Row */}
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>Academic</Text>
          {activeTab === "Timetable" ? (
            <TouchableOpacity
              style={styles.viewToggle}
              onPress={() =>
                setView(view === "weekly" ? "today" : "weekly")
              }
            >
              <Ionicons
                name={view === "weekly" ? "list-outline" : "grid-outline"}
                size={22}
                color="#555"
              />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 38 }} />
          )}
        </View>

        {/* Sub-tab Switcher */}
        <AcademicNavBar activeTab={activeTab} onTabPress={setActiveTab} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "Timetable" ? (
          <TimetableScreen view={view} />
        ) : activeTab === "Kuppi" ? (
          <KuppiScreen />
        ) : (
          <ResourcesScreen />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerBlock: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
    zIndex: 10,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#262626",
  },
  viewToggle: {
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
});
