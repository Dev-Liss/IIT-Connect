import React, { useState, useCallback, useRef } from "react";
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
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
} from "react-native";

import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";

// Import Auth and API context
import { useAuth } from "../../src/context/AuthContext";
import { API_BASE_URL } from "../../src/config/api";

const { width, height } = Dimensions.get("window");

// ==========================================
// HELPER: Derive a thumbnail URL from a Cloudinary video URL.
// Replaces the extension with .jpg and injects `so_0` (grab frame at 0s).
// Falls back to the original URL if it doesn't look like a Cloudinary video.
// ==========================================
const getVideoThumbnailUrl = (videoUrl) => {
  if (!videoUrl) return null;
  try {
    // Cloudinary video URLs contain "/video/upload/"
    if (videoUrl.includes("/video/upload/")) {
      return videoUrl
        .replace("/video/upload/", "/video/upload/so_0/")
        .replace(/\.(mp4|mov|avi|webm|mkv)(\?.*)?$/i, ".jpg");
    }
  } catch (_) {}
  return videoUrl;
};

// Default Images if the user hasn't uploaded any
const DEFAULT_AVATAR =
  "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&clotheType=BlazerShirt&eyeType=Happy&eyebrowType=Default&mouthType=Default&skinColor=Light";
const DEFAULT_COVER = "https://placehold.co/800x300/e0e0e0/e0e0e0.png";

export default function StudentProfile({ user }) {
  const router = useRouter();
  const { logout, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState("Posts");
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Comments state ---
  const [commentModalPost, setCommentModalPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // --- Reel / Image viewer state ---
  const [mediaModalPost, setMediaModalPost] = useState(null);

  // expo-video player (only used when mediaModalPost has a video)
  const videoPlayer = useVideoPlayer(
    mediaModalPost?.media?.type === "video" ? mediaModalPost.media.url : null,
    (player) => {
      player.loop = true;
      player.play();
    },
  );

  // ==========================================
  // FETCH REAL DATA (Profile + Posts)
  // ==========================================
  useFocusEffect(
    useCallback(() => {
      const fetchAllData = async () => {
        if (!user || (!user._id && !user.id)) return;
        const userId = user._id || user.id;

        setLoading(true);
        try {
          const profileResponse = await fetch(
            `${API_BASE_URL}/users/profile/${userId}`,
          );
          if (profileResponse.ok) {
            const profileJson = await profileResponse.json();
            setProfileData(profileJson);
            updateUser({ profilePicture: profileJson.profilePicture });
          }

          const postsResponse = await fetch(
            `${API_BASE_URL}/posts?userId=${userId}`,
          );
          if (postsResponse.ok) {
            const postsJson = await postsResponse.json();
            const allPosts = postsJson.data || [];
            const filteredPosts = allPosts.filter((post) => {
              if (!post.user) return false;
              const postUserId =
                typeof post.user === "object"
                  ? post.user._id?.toString()
                  : post.user.toString();
              return postUserId === userId;
            });

            filteredPosts.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            );
            setUserPosts(filteredPosts);
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

      fetchAllData();
    }, [user?._id, user?.id]),
  );

  // ==========================================
  // HANDLERS
  // ==========================================
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
              const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
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

  // --- Comments ---
  const openComments = async (post) => {
    setCommentModalPost(post);
    setComments([]);
    setCommentsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${post._id}/comments`);
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
        `${API_BASE_URL}/posts/${commentModalPost._id}/comment`,
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

  // --- Share ---
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

  // --- Reel / Image viewer ---
  const openMediaModal = (post) => {
    setMediaModalPost(post);
  };

  const closeMediaModal = () => {
    if (videoPlayer) {
      try {
        videoPlayer.pause();
      } catch (_) {}
    }
    setMediaModalPost(null);
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  // ==========================================
  // MAIN RENDER
  // ==========================================
  const imagePosts = userPosts.filter(
    (post) => !post.media || post.media.type !== "video",
  );
  const reelPosts = userPosts.filter(
    (post) => post.media && post.media.type === "video",
  );

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

        {/* Profile Header */}
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

        {/* User Details */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {profileData?.username || user?.username || "Unknown User"}
          </Text>
          <Text style={styles.studentId}>
            Student{" "}
            <Text style={styles.idNumber}>
              {profileData?.studentId || user?.studentId}
            </Text>
          </Text>

          <View style={styles.detailRow}>
            <Feather name="mail" size={16} color="#333" style={styles.icon} />
            <Text style={styles.detailText}>
              {profileData?.email || user?.email}
            </Text>
          </View>

          {profileData?.batch && (
            <View style={styles.detailRow}>
              <Feather name="book" size={16} color="#333" style={styles.icon} />
              <Text style={styles.detailText}>{profileData.batch}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Feather
              name="briefcase"
              size={16}
              color="#333"
              style={styles.icon}
            />
            <Text style={styles.detailText}>
              {profileData?.bio || "Student"}
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
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
          <TouchableOpacity
            style={[styles.tab, activeTab === "Reels" && styles.activeTab]}
            onPress={() => setActiveTab("Reels")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Reels" && styles.activeTabText,
              ]}
            >
              Reels
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {activeTab === "Posts" ? (
          <View style={styles.feedContainer}>
            {imagePosts.length > 0 ? (
              imagePosts.map((post) => (
                <View key={post._id} style={styles.postCard}>
                  {/* Post Header */}
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

                  {/* Caption */}
                  {post.caption ? (
                    <Text style={styles.postBodyText}>{post.caption}</Text>
                  ) : null}

                  {/* Media */}
                  {post.media?.url ? (
                    <TouchableOpacity
                      onPress={() => openMediaModal(post)}
                      activeOpacity={0.9}
                    >
                      <Image
                        source={{ uri: post.media.url }}
                        style={styles.postImage}
                        resizeMode="cover"
                      />
                      {post.media.type === "video" && (
                        <View style={styles.videoOverlayBadge}>
                          <Feather
                            name="play-circle"
                            size={36}
                            color="rgba(255,255,255,0.9)"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : null}

                  {/* Stats Row */}
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
        ) : (
          // Reels Tab — 3-column grid
          <View style={styles.reelsGrid}>
            {reelPosts.length > 0 ? (
              reelPosts.map((post) => (
                <TouchableOpacity
                  key={post._id}
                  style={styles.reelTile}
                  onPress={() => openMediaModal(post)}
                  activeOpacity={0.85}
                >
                  {post.media?.url ? (
                    <>
                      <Image
                        source={{ uri: getVideoThumbnailUrl(post.media.url) }}
                        style={styles.reelImage}
                        resizeMode="cover"
                      />
                      <View style={styles.reelOverlay}>
                        <Feather
                          name={
                            post.media.type === "video" ? "play" : "maximize"
                          }
                          size={16}
                          color="rgba(255,255,255,0.9)"
                        />
                      </View>
                    </>
                  ) : (
                    <View style={styles.reelTextTile}>
                      <Feather
                        name="file-text"
                        size={18}
                        color="#D32F2F"
                        style={{ marginBottom: 4 }}
                      />
                      <Text style={styles.reelTextSnippet} numberOfLines={3}>
                        {post.caption || ""}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Feather
                  name="film"
                  size={40}
                  color="#ccc"
                  style={{ marginBottom: 10 }}
                />
                <Text style={{ color: "#999", fontSize: 16 }}>
                  No reels yet.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ====================== */}
      {/* COMMENTS MODAL         */}
      {/* ====================== */}
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
            {/* Header */}
            <View style={styles.commentsHeader}>
              <Text style={styles.commentsTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentModalPost(null)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Comment List */}
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

            {/* Input */}
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

      {/* ====================== */}
      {/* MEDIA VIEWER MODAL     */}
      {/* ====================== */}
      <Modal
        visible={!!mediaModalPost}
        animationType="fade"
        transparent={true}
        onRequestClose={closeMediaModal}
      >
        <View style={styles.mediaModalContainer}>
          <TouchableOpacity
            style={styles.mediaModalClose}
            onPress={closeMediaModal}
          >
            <Ionicons name="close-circle" size={36} color="#fff" />
          </TouchableOpacity>

          {mediaModalPost?.media?.type === "video" ? (
            <VideoView
              player={videoPlayer}
              style={styles.fullscreenVideo}
              allowsFullscreen
              allowsPictureInPicture={false}
              contentFit="contain"
            />
          ) : mediaModalPost?.media?.url ? (
            <Image
              source={{ uri: mediaModalPost.media.url }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.fullscreenTextCard}>
              <Text style={styles.fullscreenCaption}>
                {mediaModalPost?.caption || ""}
              </Text>
            </View>
          )}

          {/* Caption below */}
          {mediaModalPost?.caption && mediaModalPost?.media?.url ? (
            <View style={styles.mediaCaption}>
              <Text style={styles.mediaCaptionText} numberOfLines={3}>
                {mediaModalPost.caption}
              </Text>
            </View>
          ) : null}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  scrollContent: { paddingBottom: 80 },

  // Cover
  coverContainer: { height: 130, width: "100%", overflow: "hidden" },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    opacity: 0.9,
  },

  // Profile header
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

  // Info
  infoContainer: { paddingHorizontal: 20, marginTop: 10 },
  name: { fontSize: 26, fontWeight: "bold", color: "#111", marginBottom: 2 },
  studentId: { fontSize: 14, color: "#555", marginBottom: 10 },
  idNumber: { color: "#888" },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  icon: { marginRight: 8, width: 20 },
  detailText: { fontSize: 15, color: "#333", flex: 1 },

  // Tabs
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

  // Posts feed
  emptyState: { padding: 40, alignItems: "center", marginTop: 20 },
  feedContainer: { padding: 15 },
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
  videoOverlayBadge: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -18,
    marginLeft: -18,
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

  // Reels grid — 3 tiles per row
  // Each tile has margin:1 on all sides → 2px per tile × 3 tiles = 6px total horizontal space
  reelsGrid: { flexDirection: "row", flexWrap: "wrap" },
  reelTile: {
    width: (width - 6) / 3,
    height: (width - 6) / 3,
    margin: 1,
    backgroundColor: "#e0e0e0",
    overflow: "hidden",
    position: "relative",
  },
  reelImage: { width: "100%", height: "100%" },
  reelOverlay: {
    position: "absolute",
    bottom: 6,
    left: 6,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 12,
    padding: 4,
  },
  reelTextTile: {
    flex: 1,
    backgroundColor: "#fff5f5",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
  },
  reelTextSnippet: {
    fontSize: 10,
    color: "#555",
    textAlign: "center",
    lineHeight: 14,
  },

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

  // Media viewer modal
  mediaModalContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  mediaModalClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  fullscreenVideo: { width, height: height * 0.75 },
  fullscreenImage: { width, height: height * 0.75 },
  fullscreenTextCard: {
    width: width * 0.85,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
  },
  fullscreenCaption: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 28,
    textAlign: "center",
  },
  mediaCaption: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  mediaCaptionText: { color: "#fff", fontSize: 14, lineHeight: 20 },
});
