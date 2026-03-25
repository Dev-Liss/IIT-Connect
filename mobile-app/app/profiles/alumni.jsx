import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";

import { useAuth } from "../../src/context/AuthContext";
import { API_BASE_URL as API_URL } from "../../src/config/api";

const DEFAULT_AVATAR =
  "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&clotheType=BlazerShirt&eyeType=Happy&eyebrowType=Default&mouthType=Default&skinColor=Light";
const DEFAULT_COVER = "https://placehold.co/800x300/e0e0e0/e0e0e0.png";

const { height } = Dimensions.get("window");

export default function AlumniProfile({ user }) {
  const router = useRouter();
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState("About");
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Comments state
  const [commentModalPost, setCommentModalPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchAllData = async (silent = false) => {
        if (!user || (!user._id && !user.id)) return;
        const userId = user._id || user.id;

        if (!silent) setLoading(true);

        try {
          const [profileResponse, postsResponse] = await Promise.all([
            fetch(`${API_URL}/users/profile/${userId}`),
            fetch(`${API_URL}/posts?userId=${userId}`),
          ]);

          if (profileResponse.ok) {
            const profileJson = await profileResponse.json();
            setProfileData(profileJson);
          }

          if (postsResponse.ok) {
            const postsJson = await postsResponse.json();
            const posts = postsJson.data || [];
            posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setUserPosts(posts);
          }
        } catch (error) {
          if (error.message && error.message.includes("_id")) {
            console.log("Waiting for user ID...");
            return;
          }
          console.error("Data Fetch Error:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAllData(profileData !== null);
    }, [user?._id, user?.id]),
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDeletePost = (postId) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: "DELETE",
              });
              const result = await response.json();
              if (result.success) {
                setUserPosts((prev) => prev.filter((p) => p._id !== postId));
              } else {
                Alert.alert("Error", result.message || "Failed to delete post");
              }
            } catch (error) {
              console.error("Delete Post Error:", error);
              Alert.alert("Error", "Network error. Could not delete post.");
            }
          },
        },
      ],
    );
  };

  const openComments = async (post) => {
    setCommentModalPost(post);
    setComments([]);
    setCommentsLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts/${post._id}/comments`);
      const json = await res.json();
      if (json.success) setComments(json.comments || []);
    } catch (e) {
      console.error("Fetch comments error:", e);
    } finally {
      setCommentsLoading(false);
    }
  };

  const submitComment = async () => {
    if (!commentText.trim() || !commentModalPost) return;
    const userId = user?._id || user?.id;
    setSubmittingComment(true);
    try {
      const res = await fetch(
        `${API_URL}/posts/${commentModalPost._id}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, text: commentText.trim() }),
        },
      );
      const json = await res.json();
      if (json.success && json.comment) {
        setComments((prev) => [
          ...prev,
          {
            ...json.comment,
            user: {
              username: profileData?.username || user?.username,
              profilePicture: profileData?.profilePicture,
            },
          },
        ]);
        setCommentText("");
      }
    } catch (e) {
      console.error("Submit comment error:", e);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async (post) => {
    try {
      const message = [post.caption, post.media?.url]
        .filter(Boolean)
        .join("\n");
      await Share.share({ message: message || "Check out this post!" });
    } catch (e) {
      console.error("Share error:", e);
    }
  };

  const SkeletonBox = ({ style }) => (
    <View style={[{ backgroundColor: "#e4e4e4", borderRadius: 6 }, style]} />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />
        <ScrollView
          scrollEnabled={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View
            style={[styles.coverContainer, { backgroundColor: "#e4e4e4" }]}
          />
          <View style={styles.profileHeader}>
            <View style={[styles.avatarContainer]}>
              <SkeletonBox style={styles.avatar} />
            </View>
            <View style={styles.actionRow}>
              <SkeletonBox
                style={{ width: 38, height: 38, borderRadius: 19 }}
              />
              <SkeletonBox
                style={{ width: 95, height: 36, borderRadius: 20 }}
              />
            </View>
          </View>
          <View style={[styles.infoContainer, { gap: 8 }]}>
            <SkeletonBox style={{ width: "55%", height: 26 }} />
            <SkeletonBox style={{ width: "38%", height: 16 }} />
            <SkeletonBox style={{ width: "68%", height: 16, marginTop: 4 }} />
          </View>
          <View
            style={[styles.tabContainer, { justifyContent: "space-around" }]}
          >
            <SkeletonBox
              style={{ width: "35%", height: 14, marginVertical: 14 }}
            />
            <SkeletonBox
              style={{ width: "35%", height: 14, marginVertical: 14 }}
            />
          </View>
          <View style={styles.aboutContainer}>
            <View style={styles.card}>
              <SkeletonBox
                style={{ width: "28%", height: 13, marginBottom: 16 }}
              />
              <SkeletonBox
                style={{ width: "100%", height: 14, marginBottom: 8 }}
              />
              <SkeletonBox
                style={{ width: "92%", height: 14, marginBottom: 8 }}
              />
              <SkeletonBox style={{ width: "76%", height: 14 }} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  let careerJourney = [];
  if (profileData?.careerJourney) {
    if (Array.isArray(profileData.careerJourney)) {
      careerJourney = profileData.careerJourney;
    } else {
      try {
        careerJourney = JSON.parse(profileData.careerJourney);
      } catch {
        careerJourney = [];
      }
    }
  }

  const graduationYear = profileData?.graduationYear || "";
  const roleLabel = graduationYear
    ? `Alumni • Class of ${graduationYear}`
    : "Alumni";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cover Image */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: profileData?.coverPicture || DEFAULT_COVER }}
            style={styles.coverImage}
          />
        </View>

        {/* Avatar + Action Buttons */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: profileData?.profilePicture || DEFAULT_AVATAR }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push("/edit-profile")}
            >
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Name, Role, and Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {profileData?.username || user?.username || "Alumni Name"}
          </Text>
          <Text style={styles.roleText}>{roleLabel}</Text>

          <View style={styles.detailRow}>
            <Feather name="mail" size={16} color="#333" style={styles.icon} />
            <Text style={styles.detailText}>
              {profileData?.email || user?.email || ""}
            </Text>
          </View>

          {profileData?.currentJob || profileData?.company ? (
            <View style={styles.detailRow}>
              <Feather
                name="briefcase"
                size={16}
                color="#333"
                style={styles.icon}
              />
              <Text style={styles.detailText}>
                {[profileData?.currentJob, profileData?.company]
                  .filter(Boolean)
                  .join(" at ")}
              </Text>
            </View>
          ) : null}

          {profileData?.location ? (
            <View style={styles.detailRow}>
              <Feather
                name="map-pin"
                size={16}
                color="#333"
                style={styles.icon}
              />
              <Text style={styles.detailText}>{profileData.location}</Text>
            </View>
          ) : null}
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "About" && styles.activeTab]}
            onPress={() => setActiveTab("About")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "About" && styles.activeTabText,
              ]}
            >
              About
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Posts" && styles.activeTab]}
            onPress={() => setActiveTab("Posts")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Posts" && styles.activeTabText,
              ]}
            >
              Posts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "About" ? (
          <View style={styles.aboutContainer}>
            {/* BIO */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>BIO</Text>
              <Text style={styles.bioText}>
                {profileData?.bio ||
                  "No bio provided. Edit your profile to add a description about yourself and your career journey."}
              </Text>
            </View>

            {/* Career Journey */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Career Journey</Text>

              {careerJourney.length > 0 ? (
                careerJourney.map((entry, index) => (
                  <View
                    key={index}
                    style={[
                      styles.careerEntry,
                      index < careerJourney.length - 1 &&
                        styles.careerEntryBorder,
                    ]}
                  >
                    <Text style={styles.careerTitle}>
                      {entry.title || "Role"}
                    </Text>
                    <Text style={styles.careerSubtitle}>
                      {[
                        entry.company,
                        [entry.startYear, entry.endYear || "Present"]
                          .filter(Boolean)
                          .join(" - "),
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </Text>
                  </View>
                ))
              ) : (
                <>
                  <View style={[styles.careerEntry, styles.careerEntryBorder]}>
                    <Text style={styles.careerTitleEmpty}>
                      No career entries yet.
                    </Text>
                    <Text style={styles.careerSubtitleEmpty}>
                      Edit your profile to add your career journey.
                    </Text>
                  </View>
                  {graduationYear ? (
                    <View style={styles.careerEntry}>
                      <Text style={styles.careerTitle}>Graduate</Text>
                      <Text style={styles.careerSubtitle}>
                        IIT • {graduationYear}
                      </Text>
                    </View>
                  ) : null}
                </>
              )}

              {careerJourney.length > 0 && graduationYear ? (
                <View style={styles.careerEntry}>
                  <Text style={styles.careerTitle}>Graduate</Text>
                  <Text style={styles.careerSubtitle}>
                    IIT • {graduationYear}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.feedContainer}>
            {userPosts.length > 0 ? (
              userPosts.map((post) => (
                <View key={post._id} style={styles.postCard}>
                  <View style={styles.postHeader}>
                    <View style={styles.postUserRow}>
                      <Image
                        source={{
                          uri: profileData?.profilePicture || DEFAULT_AVATAR,
                        }}
                        style={styles.smallAvatar}
                      />
                      <View>
                        <Text style={styles.postUsername}>
                          {profileData?.username || user?.username}
                        </Text>
                        <Text style={styles.postDate}>
                          {formatDate(post.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeletePost(post._id)}
                    >
                      <Feather name="trash-2" size={20} color="#aa1111ff" />
                    </TouchableOpacity>
                  </View>

                  {post.caption ? (
                    <Text style={styles.postBodyText}>{post.caption}</Text>
                  ) : null}

                  {post.media?.url ? (
                    <Image
                      source={{ uri: post.media.url }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  ) : null}

                  <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                      <Feather name="heart" size={18} color="#D32F2F" />
                      <Text style={styles.statText}>
                        {post.likes?.length || 0}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.statItem}
                      onPress={() => openComments(post)}
                    >
                      <Feather name="message-circle" size={18} color="#333" />
                      <Text style={styles.statText}>
                        {post.comments?.length || 0} Comment
                        {post.comments?.length !== 1 ? "s" : ""}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.statItem}
                      onPress={() => handleShare(post)}
                    >
                      <Feather name="share-2" size={18} color="#333" />
                      <Text style={styles.statText}>Share</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Feather
                  name="file-text"
                  size={40}
                  color="#ccc"
                  style={{ marginBottom: 10 }}
                />
                <Text style={{ color: "#999", fontSize: 16 }}>
                  No posts yet.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Comments Modal */}
      <Modal
        visible={!!commentModalPost}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalPost(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.commentsSheet}>
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentModalPost(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            {commentsLoading ? (
              <ActivityIndicator
                size="small"
                color="#D32F2F"
                style={{ marginTop: 30 }}
              />
            ) : (
              <FlatList
                data={comments}
                keyExtractor={(item, i) => item._id || String(i)}
                contentContainerStyle={{
                  paddingHorizontal: 16,
                  paddingTop: 8,
                  paddingBottom: 16,
                }}
                ListEmptyComponent={
                  <Text style={styles.noCommentsText}>
                    No comments yet. Be the first!
                  </Text>
                }
                renderItem={({ item }) => (
                  <View style={styles.commentRow}>
                    <Image
                      source={{
                        uri: item.user?.profilePicture || DEFAULT_AVATAR,
                      }}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentBubble}>
                      <Text style={styles.commentUsername}>
                        {item.user?.username || "User"}
                      </Text>
                      <Text style={styles.commentText}>{item.text}</Text>
                    </View>
                  </View>
                )}
              />
            )}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Add a comment..."
                placeholderTextColor="#aaa"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!commentText.trim() || submittingComment) && {
                    opacity: 0.4,
                  },
                ]}
                onPress={submitComment}
                disabled={!commentText.trim() || submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={18} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  scrollContent: { paddingBottom: 80 },

  coverContainer: { height: 130, width: "100%", overflow: "hidden" },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    opacity: 0.9,
  },

  profileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: -55,
  },
  avatarContainer: { padding: 4, backgroundColor: "#f9f9f9", borderRadius: 65 },
  avatar: {
    width: 105,
    height: 105,
    borderRadius: 52.5,
    backgroundColor: "#e0e0e0",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  iconButton: { padding: 8, backgroundColor: "#eef2f5", borderRadius: 20 },
  editButton: {
    backgroundColor: "#eef2f5",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  editButtonText: { fontWeight: "700", color: "#333", fontSize: 13 },

  infoContainer: { paddingHorizontal: 20, marginTop: 10 },
  name: { fontSize: 26, fontWeight: "bold", color: "#111", marginBottom: 2 },
  roleText: { fontSize: 14, color: "#555", marginBottom: 10 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  icon: { marginRight: 8, width: 20 },
  detailText: { fontSize: 15, color: "#333", flex: 1 },

  tabContainer: {
    flexDirection: "row",
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingHorizontal: 20,
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#D32F2F" },
  tabText: { fontSize: 15, color: "#888", fontWeight: "600" },
  activeTabText: { color: "#D32F2F", fontWeight: "bold" },

  aboutContainer: { padding: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bioText: { fontSize: 15, color: "#555", lineHeight: 24 },

  careerEntry: { paddingVertical: 12 },
  careerEntryBorder: { borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  careerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111",
    marginBottom: 3,
  },
  careerSubtitle: { fontSize: 13, color: "#666" },
  careerTitleEmpty: { fontSize: 14, color: "#999" },
  careerSubtitleEmpty: { fontSize: 13, color: "#bbb", marginTop: 2 },

  feedContainer: { padding: 15 },
  emptyState: { padding: 40, alignItems: "center", marginTop: 20 },
  postCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  postUserRow: { flexDirection: "row", alignItems: "center" },
  smallAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ddd",
    marginRight: 10,
  },
  postUsername: { fontWeight: "bold", fontSize: 15, color: "#000" },
  postDate: { fontSize: 12, color: "#888", marginTop: 2 },
  postBodyText: {
    fontSize: 15,
    marginBottom: 12,
    lineHeight: 22,
    color: "#333",
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#E0E0E0",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  statItem: { flexDirection: "row", alignItems: "center" },
  statText: { marginLeft: 6, fontSize: 14, fontWeight: "500", color: "#555" },

  // Comments modal
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  commentsSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.75,
    minHeight: height * 0.45,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  commentsTitle: { fontSize: 17, fontWeight: "700", color: "#111" },
  noCommentsText: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 30,
    fontSize: 14,
  },
  commentRow: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "flex-start",
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ddd",
    marginRight: 10,
    marginTop: 2,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 10,
  },
  commentUsername: {
    fontWeight: "700",
    fontSize: 13,
    color: "#111",
    marginBottom: 3,
  },
  commentText: { fontSize: 14, color: "#333", lineHeight: 20 },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    backgroundColor: "#fff",
    gap: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    color: "#000",
    maxHeight: 80,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
  },
});
