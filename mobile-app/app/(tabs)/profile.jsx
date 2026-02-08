import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";

// Get screen dimensions for responsive layout
const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  // We removed the <AuthContextType> casting here
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("Posts");

  // ==========================================
  // 🎨 PLACEHOLDER DATA (To Match Design)
  // ==========================================
  const MOCK_DATA = {
    batch: "L4 CSG24",
    position: "Batch Representative",
    profileImage: "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&clotheType=BlazerShirt&eyeType=Happy&eyebrowType=Default&mouthType=Default&skinColor=Light",
    coverImage: "https://img.freepik.com/free-vector/hand-drawn-education-pattern_23-2148107567.jpg",
    postText: "I am proud to inform that I complete course on OOP concepts",
    likes: 2434,
    shares: 26,
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 1. Header & Cover Image */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: MOCK_DATA.coverImage }}
            style={styles.coverImage}
          />
        </View>

        {/* 2. Profile Section */}
        <View style={styles.profileHeader}>
          {/* Avatar - Negative margin pulls it up over the cover */}
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: MOCK_DATA.profileImage }}
              style={styles.avatar}
            />
          </View>

          {/* Action Buttons (Settings & Edit) */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
              {/* Using Log Out icon for now since Settings isn't built */}
              <Ionicons name="log-out-outline" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3. User Details */}
        <View style={styles.infoContainer}>
          {/* Name & Role */}
          {/* Added optional chaining (?.) to prevent crash if user is null */}
          <Text style={styles.name}>
            {user?.username || "Yasindu Janapriya"}
          </Text>
          <Text style={styles.studentId}>
            Student  <Text style={styles.idNumber}>{user?.studentId || "20231866"}</Text>
          </Text>

          {/* Detail Rows */}
          <View style={styles.detailRow}>
            <Feather name="mail" size={16} color="#333" style={styles.icon} />
            <Text style={styles.detailText}>{user?.email || "email@iit.ac.lk"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Feather name="book" size={16} color="#333" style={styles.icon} />
            <Text style={styles.detailText}>{MOCK_DATA.batch}</Text>
          </View>

          <View style={styles.detailRow}>
            <Feather name="briefcase" size={16} color="#333" style={styles.icon} />
            <Text style={styles.detailText}>{MOCK_DATA.position}</Text>
          </View>
        </View>

        {/* 4. Tabs (Posts / Calendar) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Posts" && styles.activeTab]}
            onPress={() => setActiveTab("Posts")}
          >
            <Text style={[styles.tabText, activeTab === "Posts" && styles.activeTabText]}>Posts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === "Calendar" && styles.activeTab]}
            onPress={() => setActiveTab("Calendar")}
          >
            <Text style={[styles.tabText, activeTab === "Calendar" && styles.activeTabText]}>Calendar</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Feed Content (Only shows if Posts tab is active) */}
        {activeTab === "Posts" ? (
          <View style={styles.feedContainer}>
            {/* Single Post Item */}
            <View style={styles.postHeader}>
              <View style={styles.postUserRow}>
                {/* Small Avatar for post */}
                <View style={styles.smallAvatar} />
                <Text style={styles.postUsername}>{user?.username || "Yasindu Janapriya"}</Text>
              </View>
              <TouchableOpacity>
                <Feather name="trash-2" size={18} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.postBodyText}>{MOCK_DATA.postText}</Text>

            {/* Gray Placeholder for Post Image */}
            <View style={styles.postImagePlaceholder} />

            {/* Engagement Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Feather name="repeat" size={18} color="#333" />
                <Text style={styles.statText}>{MOCK_DATA.shares}</Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="heart" size={18} color="#333" />
                <Text style={styles.statText}>{MOCK_DATA.likes}</Text>
              </View>
              <View style={styles.statItem}>
                <Feather name="share" size={18} color="#333" />
              </View>
            </View>
          </View>
        ) : (
          // Calendar Placeholder
          <View style={styles.emptyState}>
            <Text style={{ color: '#999' }}>Calendar coming soon...</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 80, // Space for bottom tab bar
  },
  coverContainer: {
    height: 120,
    width: "100%",
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    opacity: 0.8,
  },
  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: -50,
  },
  avatarContainer: {
    padding: 3,
    backgroundColor: "#fff",
    borderRadius: 60,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
    gap: 10,
  },
  iconButton: {
    padding: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
  },
  editButton: {
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editButtonText: {
    fontWeight: "600",
    color: "#333",
    fontSize: 14,
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginTop: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 2,
  },
  studentId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
  },
  idNumber: {
    color: "#888",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: {
    marginRight: 10,
    width: 20,
  },
  detailText: {
    fontSize: 14,
    color: "#333",
  },
  tabContainer: {
    flexDirection: "row",
    marginTop: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#000",
  },
  tabText: {
    fontSize: 16,
    color: "#888",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#000",
    fontWeight: "bold",
  },
  feedContainer: {
    padding: 20,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  postUserRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  postUsername: {
    fontWeight: "bold",
    fontSize: 16,
  },
  postBodyText: {
    fontSize: 15,
    marginBottom: 10,
    lineHeight: 22,
    color: "#333",
  },
  postImagePlaceholder: {
    width: "100%",
    height: 200,
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  }
});