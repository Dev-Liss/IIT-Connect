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
    Dimensions,
    ActivityIndicator,
    Alert,
} from "react-native";

import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";

// Import Auth and API context
import { useAuth } from "../../../src/context/AuthContext";
import { API_BASE_URL } from "../../../src/config/api";

const { width } = Dimensions.get("window");

// Default Images if the user hasn't uploaded any
const DEFAULT_AVATAR = "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&clotheType=BlazerShirt&eyeType=Happy&eyebrowType=Default&mouthType=Default&skinColor=Light";
const DEFAULT_COVER = "https://img.freepik.com/free-vector/hand-drawn-education-pattern_23-2148107567.jpg";

export default function StudentProfile({ user }) {
    const router = useRouter();
    const { logout } = useAuth();

    const [activeTab, setActiveTab] = useState("Posts");
    const [profileData, setProfileData] = useState(null);

    // --- State for Posts ---
    const [userPosts, setUserPosts] = useState([]);

    const [loading, setLoading] = useState(true);

    // ==========================================
    // FETCH REAL DATA (Profile + Posts)
    // ==========================================
    // useFocusEffect re-runs every time this screen comes into focus.
    // This ensures that after saving in Edit Profile and navigating back,
    // the latest profile data and posts are always shown.
    useFocusEffect(
        useCallback(() => {
            const fetchAllData = async () => {
                const userId = user?._id || user?.id;
                if (!userId) {
                    setLoading(false);
                    return;
                }

                setLoading(true);
                try {
                    // 1. Fetch Profile Data
                    const profileResponse = await fetch(`${API_BASE_URL}/users/profile/${userId}`);
                    if (profileResponse.ok) {
                        const profileJson = await profileResponse.json();
                        setProfileData(profileJson);
                    }

                    // 2. Fetch Posts Data
                    const postsResponse = await fetch(`${API_BASE_URL}/posts`);
                    if (postsResponse.ok) {
                        const postsJson = await postsResponse.json();
                        const allPosts = postsJson.data || [];

                        const filteredPosts = allPosts.filter(post => {
                            const postUserId = typeof post.user === 'object' ? post.user._id?.toString() : post.user?.toString();
                            return postUserId === userId;
                        });

                        filteredPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        setUserPosts(filteredPosts);
                    }

                } catch (error) {
                    console.error("Data Fetch Error:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchAllData();
        }, [user])
    );

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    };

    // Helper to format date cleanly
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Delete a post — shows confirmation dialog first
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
                                // Remove the deleted post from local state immediately
                                setUserPosts(prev => prev.filter(p => p._id !== postId));
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

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
                <ActivityIndicator size="large" color="#D32F2F" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* 1. Header & Cover Image */}
                <View style={styles.coverContainer}>
                    <Image
                        source={{ uri: profileData?.coverPicture || DEFAULT_COVER }}
                        style={styles.coverImage}
                    />
                </View>

                {/* 2. Profile Section */}
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

                {/* 3. User Details */}
                <View style={styles.infoContainer}>
                    <Text style={styles.name}>
                        {profileData?.username || user?.username || "Unknown User"}
                    </Text>
                    <Text style={styles.studentId}>
                        Student  <Text style={styles.idNumber}>{profileData?.studentId || user?.studentId}</Text>
                    </Text>

                    <View style={styles.detailRow}>
                        <Feather name="mail" size={16} color="#333" style={styles.icon} />
                        <Text style={styles.detailText}>{profileData?.email || user?.email}</Text>
                    </View>

                    {profileData?.batch && (
                        <View style={styles.detailRow}>
                            <Feather name="book" size={16} color="#333" style={styles.icon} />
                            <Text style={styles.detailText}>{profileData.batch}</Text>
                        </View>
                    )}

                    <View style={styles.detailRow}>
                        <Feather name="briefcase" size={16} color="#333" style={styles.icon} />
                        <Text style={styles.detailText}>{profileData?.bio || "Student"}</Text>
                    </View>
                </View>

                {/* 4. Tabs */}
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

                {/* 5. Feed Content */}
                {activeTab === "Posts" ? (
                    <View style={styles.feedContainer}>
                        {userPosts.length > 0 ? (
                            userPosts.map((post) => (
                                <View key={post._id} style={styles.postCard}>

                                    {/* Post Header */}
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

                                    {/* Post Caption */}
                                    {post.caption ? (
                                        <Text style={styles.postBodyText}>{post.caption}</Text>
                                    ) : null}

                                    {/* Post Media (Image) */}
                                    {post.media?.url ? (
                                        <Image
                                            source={{ uri: post.media.url }}
                                            style={styles.postImage}
                                            resizeMode="cover"
                                        />
                                    ) : null}

                                    {/* Engagement Stats */}
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
                            /* Empty State */
                            <View style={styles.emptyState}>
                                <Feather name="file-text" size={40} color="#ccc" style={{ marginBottom: 10 }} />
                                <Text style={{ color: '#999', fontSize: 16 }}>No posts yet.</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <Feather name="calendar" size={40} color="#ccc" style={{ marginBottom: 10 }} />
                        <Text style={{ color: '#999', fontSize: 16 }}>Calendar coming soon...</Text>
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
        paddingBottom: 80,
    },
    coverContainer: {
        height: 180,
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
    emptyState: {
        padding: 40,
        alignItems: "center",
        marginTop: 20,
    },
    feedContainer: {
        padding: 15,
        backgroundColor: "#f9f9f9",
    },
    postCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
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
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#ddd",
        marginRight: 10,
    },
    postUsername: {
        fontWeight: "bold",
        fontSize: 15,
        color: "#000",
    },
    postDate: {
        fontSize: 12,
        color: "#888",
        marginTop: 2,
    },
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
    statItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    statText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: "500",
        color: "#555",
    },

});