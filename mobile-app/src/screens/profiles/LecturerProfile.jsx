import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";

import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL as API_URL } from "../../config/api";

const DEFAULT_AVATAR = "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&clotheType=BlazerShirt&eyeType=Happy&eyebrowType=Default&mouthType=Default&skinColor=Light";
const DEFAULT_COVER = "https://img.freepik.com/free-vector/hand-drawn-education-pattern_23-2148107567.jpg";

export default function LecturerProfile({ user }) {
    const router = useRouter();
    const { logout } = useAuth();

    const [activeTab, setActiveTab] = useState("About");
    const [profileData, setProfileData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // useFocusEffect re-runs every time this screen comes into focus.
    // This ensures that after saving in Edit Profile and navigating back,
    // the latest profile data and posts are always shown.
    useFocusEffect(
        useCallback(() => {
            const fetchAllData = async (silent = false) => {
                if (!user || (!user._id && !user.id)) return;
                const userId = user._id || user.id;

                // First load shows skeleton; subsequent tab-focus refreshes silently
                if (!silent) setLoading(true);

                try {
                    // Fetch profile and user-specific posts in parallel
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
                    if (error.message && error.message.includes('_id')) {
                         console.log('Waiting for user ID...');
                         return;
                    }
                    console.error("Data Fetch Error:", error);
                } finally {
                    setLoading(false);
                }
            };

            // If data already loaded, refresh silently in the background
            fetchAllData(profileData !== null);
        }, [user?._id, user?.id])
    );

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
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
            ]
        );
    };

    const SkeletonBox = ({ style }) => (
        <View style={[{ backgroundColor: "#e4e4e4", borderRadius: 6 }, style]} />
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />
                <ScrollView scrollEnabled={false} contentContainerStyle={styles.scrollContent}>
                    {/* Cover skeleton */}
                    <View style={[styles.coverContainer, { backgroundColor: "#e4e4e4" }]} />

                    {/* Avatar + action buttons skeleton */}
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <SkeletonBox style={styles.avatar} />
                        </View>
                        <View style={styles.actionRow}>
                            <SkeletonBox style={{ width: 38, height: 38, borderRadius: 19 }} />
                            <SkeletonBox style={{ width: 95, height: 36, borderRadius: 20 }} />
                        </View>
                    </View>

                    {/* Name / role / detail rows skeleton */}
                    <View style={[styles.infoContainer, { gap: 8 }]}>
                        <SkeletonBox style={{ width: "55%", height: 26 }} />
                        <SkeletonBox style={{ width: "38%", height: 16 }} />
                        <SkeletonBox style={{ width: "68%", height: 16, marginTop: 4 }} />
                    </View>

                    {/* Tab bar skeleton */}
                    <View style={[styles.tabContainer, { justifyContent: "space-around" }]}>
                        <SkeletonBox style={{ width: "35%", height: 14, marginVertical: 14 }} />
                        <SkeletonBox style={{ width: "35%", height: 14, marginVertical: 14 }} />
                    </View>

                    {/* Content card skeleton */}
                    <View style={styles.aboutContainer}>
                        <View style={styles.card}>
                            <SkeletonBox style={{ width: "28%", height: 13, marginBottom: 16 }} />
                            <SkeletonBox style={{ width: "100%", height: 14, marginBottom: 8 }} />
                            <SkeletonBox style={{ width: "92%", height: 14, marginBottom: 8 }} />
                            <SkeletonBox style={{ width: "76%", height: 14 }} />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f9f9f9" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <View style={styles.coverContainer}>
                    <Image
                        source={{ uri: profileData?.coverPicture || DEFAULT_COVER }}
                        style={styles.coverImage}
                    />
                </View>

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

                <View style={styles.infoContainer}>
                    <Text style={styles.name}>
                        {profileData?.username || user?.username || "Lecturer Name"}
                    </Text>
                    <Text style={styles.roleText}>Senior Lecturer</Text>

                    <View style={styles.detailRow}>
                        <Feather name="mail" size={16} color="#333" style={styles.icon} />
                        <Text style={styles.detailText}>{profileData?.email || user?.email}</Text>
                    </View>
                </View>

                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, activeTab === "About" && styles.activeTab]}
                        onPress={() => setActiveTab("About")}
                    >
                        <Text style={[styles.tabText, activeTab === "About" && styles.activeTabText]}>About</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tab, activeTab === "Posts" && styles.activeTab]}
                        onPress={() => setActiveTab("Posts")}
                    >
                        <Text style={[styles.tabText, activeTab === "Posts" && styles.activeTabText]}>Posts</Text>
                    </TouchableOpacity>
                </View>

                {activeTab === "About" ? (
                    <View style={styles.aboutContainer}>
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>BIO</Text>
                            <Text style={styles.bioText}>
                                {profileData?.bio || "No bio provided. Edit your profile to add a brief description of your background and research interests."}
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Teaching Modules</Text>
                            <View style={styles.moduleRow}>
                                <Feather name="book-open" size={18} color="#555" style={styles.moduleIcon} />
                                <Text style={styles.moduleText}>Object Oriented Programming</Text>
                            </View>
                            <View style={styles.moduleRow}>
                                <Feather name="book-open" size={18} color="#555" style={styles.moduleIcon} />
                                <Text style={styles.moduleText}>Software Development I</Text>
                            </View>
                            <View style={styles.moduleRow}>
                                <Feather name="book-open" size={18} color="#555" style={styles.moduleIcon} />
                                <Text style={styles.moduleText}>Database Systems</Text>
                            </View>
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
                                                source={{ uri: profileData?.profilePicture || DEFAULT_AVATAR }}
                                                style={styles.smallAvatar}
                                            />
                                            <View>
                                                <Text style={styles.postUsername}>{profileData?.username || user?.username}</Text>
                                                <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDeletePost(post._id)}>
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
                                            <Text style={styles.statText}>{post.likes?.length || 0}</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Feather name="message-circle" size={18} color="#333" />
                                            <Text style={styles.statText}>Comment</Text>
                                        </View>
                                        <View style={styles.statItem}>
                                            <Feather name="share" size={18} color="#333" />
                                            <Text style={styles.statText}>Share</Text>
                                        </View>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Feather name="file-text" size={40} color="#ccc" style={{ marginBottom: 10 }} />
                                <Text style={{ color: '#999', fontSize: 16 }}>No posts yet.</Text>
                            </View>
                        )}
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f9f9f9" },
    scrollContent: { paddingBottom: 80 },
    coverContainer: { height: 130, width: "100%", overflow: "hidden" },
    coverImage: { width: "100%", height: "100%", resizeMode: "cover", opacity: 0.9 },
    profileHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: 20, marginTop: -55 },
    avatarContainer: { padding: 4, backgroundColor: "#f9f9f9", borderRadius: 65 },
    avatar: { width: 105, height: 105, borderRadius: 52.5, backgroundColor: "#e0e0e0" },
    actionRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 10 },
    iconButton: { padding: 8, backgroundColor: "#eef2f5", borderRadius: 20 },
    editButton: { backgroundColor: "#eef2f5", paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
    editButtonText: { fontWeight: "700", color: "#333", fontSize: 13 },
    infoContainer: { paddingHorizontal: 20, marginTop: 10 },
    name: { fontSize: 26, fontWeight: "bold", color: "#111", marginBottom: 2 },
    roleText: { fontSize: 14, color: "#555", marginBottom: 10 },
    detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    icon: { marginRight: 8, width: 20 },
    detailText: { fontSize: 15, color: "#333" },
    tabContainer: { flexDirection: "row", marginTop: 20, borderBottomWidth: 1, borderBottomColor: "#ddd", paddingHorizontal: 20 },
    tab: { flex: 1, alignItems: "center", paddingVertical: 12 },
    activeTab: { borderBottomWidth: 2, borderBottomColor: "#111" },
    tabText: { fontSize: 15, color: "#888", fontWeight: "600" },
    activeTabText: { color: "#111", fontWeight: "bold" },
    aboutContainer: { padding: 20 },
    card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 20, boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.05)", elevation: 2, borderWidth: 1, borderColor: '#eee' },
    cardTitle: { fontSize: 13, fontWeight: "bold", color: "#111", marginBottom: 15, textTransform: "uppercase", letterSpacing: 0.5 },
    bioText: { fontSize: 15, color: "#555", lineHeight: 24 },
    moduleRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    moduleIcon: { marginRight: 12 },
    moduleText: { fontSize: 15, color: "#444" },
    feedContainer: { padding: 15 },
    postCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 15, boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.1)", elevation: 2 },
    postHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    postUserRow: { flexDirection: "row", alignItems: "center" },
    smallAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#ddd", marginRight: 10 },
    postUsername: { fontWeight: "bold", fontSize: 15, color: "#000" },
    postDate: { fontSize: 12, color: "#888", marginTop: 2 },
    postBodyText: { fontSize: 15, marginBottom: 12, lineHeight: 22, color: "#333" },
    postImage: { width: "100%", height: 250, borderRadius: 12, marginBottom: 15, backgroundColor: "#E0E0E0" },
    statsRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
    statItem: { flexDirection: "row", alignItems: "center" },
    statText: { marginLeft: 6, fontSize: 14, fontWeight: "500", color: "#555" },
    emptyState: { padding: 40, alignItems: "center", marginTop: 20 },
});