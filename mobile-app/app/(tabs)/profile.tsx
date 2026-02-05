/**
 * ====================================
 * PROFILE SCREEN (PLACEHOLDER)
 * ====================================
 * Tab for user profile and settings.
 * TODO: Implement profile features in future phases.
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
} from "react-native";
import { Octicons, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Profile Content */}
      <View style={styles.content}>
        {/* Avatar Placeholder */}
        <View style={styles.avatarContainer}>
          <Octicons name="person" size={50} color="#666" />
        </View>

        {/* User Info */}
        {user ? (
          <View style={styles.userInfo}>
            <Text style={styles.username}>@{user.username}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {user.studentId && (
              <Text style={styles.studentId}>ID: {user.studentId}</Text>
            )}
          </View>
        ) : (
          <Text style={styles.notLoggedIn}>Not logged in</Text>
        )}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Coming Soon Features */}
        <View style={styles.comingSoonSection}>
          <Text style={styles.comingSoonLabel}>More features coming soon:</Text>
          <Text style={styles.featureList}>
            • Edit Profile{"\n"}• Your Posts{"\n"}• Saved Posts{"\n"}• Settings
          </Text>
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 30,
  },
  username: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#262626",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#8e8e8e",
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  notLoggedIn: {
    fontSize: 16,
    color: "#8e8e8e",
    marginBottom: 30,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9252b",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 40,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  comingSoonSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    borderWidth: 1,
    borderColor: "#efefef",
  },
  comingSoonLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 10,
  },
  featureList: {
    fontSize: 14,
    color: "#8e8e8e",
    lineHeight: 24,
  },
});
