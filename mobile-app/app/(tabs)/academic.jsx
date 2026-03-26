/**
 * ====================================
 * ACADEMIC SCREEN
 * ====================================
 * Parent wrapper for academic features.
 * Owns the persistent "Academic" header and AcademicNavBar.
 * Renders child content: Timetable | Kuppi | Resources
 *
 * Reads `openModal` search param from the Create sheet to auto-open
 * the Create Kuppi or Add Resource modal on the correct sub-tab.
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  DeviceEventEmitter,
} from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import AcademicNavBar from "../../src/components/AcademicNavBar";
import TimetableScreen from "../../src/screens/TimetableScreen";
import KuppiScreen from "../../src/screens/KuppiScreen";
import ResourcesScreen from "../../src/screens/ResourcesScreen";
import useMainTabSwipe from "../../src/hooks/useMainTabSwipe";

export default function AcademicScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { panHandlers } = useMainTabSwipe("academic");
  const { openModal } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState("Timetable");
  const [view, setView] = useState("weekly");

  // Pending modal flags — set when navigated here via Create sheet tile
  const [pendingKuppi, setPendingKuppi] = useState(false);
  const [pendingResource, setPendingResource] = useState(false);

  // When openModal param arrives, switch to the right sub-tab and set the flag
  useEffect(() => {
    const handleOpenModal = (modalType) => {
      if (modalType === "kuppi") {
        setActiveTab("Kuppi");
        setPendingKuppi(true);
      } else if (modalType === "resource") {
        setActiveTab("Resources");
        setPendingResource(true);
      }
    };

    // Handle deep links or param navigation
    if (openModal) {
      handleOpenModal(openModal);
      router.setParams({ openModal: undefined });
    }

    // Handle internal triggers via EventEmitter (fixes iOS expo-router tab bug)
    const subscription = DeviceEventEmitter.addListener(
      "openAcademicModal",
      handleOpenModal,
    );

    return () => {
      subscription.remove();
    };
  }, [openModal]);

  return (
    <View style={styles.container} {...panHandlers}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Fixed Header Block */}
      <View style={[styles.headerBlock, { paddingTop: insets.top + 10 }]}>
        {/* Title Row */}
        <View style={styles.titleRow}>
          <Text style={styles.headerTitle}>Academic</Text>
          {activeTab === "Timetable" ? (
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setView("weekly")}
              >
                <Ionicons
                  name="grid-outline"
                  size={22}
                  color={view === "weekly" ? "#f9252b" : "#aaa"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setView("today")}
              >
                <Ionicons
                  name="list-outline"
                  size={22}
                  color={view === "today" ? "#f9252b" : "#aaa"}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ width: 76 }} />
          )}
        </View>

        {/* Sub-tab Switcher */}
        <AcademicNavBar activeTab={activeTab} onTabPress={setActiveTab} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <AnimatePresence exitBeforeEnter>
          {activeTab === "Timetable" && (
            <MotiView
              key="Timetable"
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: -20 }}
              transition={{ type: "timing", duration: 250 }}
              style={{ flex: 1 }}
            >
              <TimetableScreen view={view} />
            </MotiView>
          )}

          {activeTab === "Kuppi" && (
            <MotiView
              key="Kuppi"
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: -20 }}
              transition={{ type: "timing", duration: 250 }}
              style={{ flex: 1 }}
            >
              <KuppiScreen
                autoOpenCreate={pendingKuppi}
                onModalOpened={() => setPendingKuppi(false)}
              />
            </MotiView>
          )}

          {activeTab === "Resources" && (
            <MotiView
              key="Resources"
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
              exit={{ opacity: 0, translateX: -20 }}
              transition={{ type: "timing", duration: 250 }}
              style={{ flex: 1 }}
            >
              <ResourcesScreen
                autoOpenUpload={pendingResource}
                onModalOpened={() => setPendingResource(false)}
              />
            </MotiView>
          )}
        </AnimatePresence>
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
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 4,
    alignItems: "center",
  },
  iconButton: {
    padding: 6,
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
  },
});
