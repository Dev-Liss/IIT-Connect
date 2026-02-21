import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useAuth } from "../../../src/context/AuthContext";
import { API_BASE_URL as API_URL } from "../../../src/config/api";

const DEFAULT_AVATAR = "https://avataaars.io/?avatarStyle=Circle&topType=ShortHairShortFlat&accessoriesType=Prescription02&hairColor=Black&facialHairType=BeardLight&clotheType=BlazerShirt&eyeType=Happy&eyebrowType=Default&mouthType=Default&skinColor=Light";
const DEFAULT_COVER = "https://img.freepik.com/free-vector/hand-drawn-education-pattern_23-2148107567.jpg";

export default function LecturerProfile({ user }) {
    const router = useRouter();
    const { logout } = useAuth();

    const [activeTab, setActiveTab] = useState("About");
    const [profileData, setProfileData] = useState(null);
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            const userId = user?.id || user?._id;
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const profileResponse = await fetch(`${API_URL}/users/profile/${userId}`);
                if (profileResponse.ok) {
                    const profileJson = await profileResponse.json();
                    setProfileData(profileJson);
                }

                const postsResponse = await fetch(`${API_URL}/posts`);
                if (postsResponse.ok) {
                    const allPosts = await postsResponse.json();

                    const filteredPosts = allPosts.filter(post => {
                        const postUserId = typeof post.user === 'object' ? post.user._id : post.user;
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
    }, [user]);

    const handleLogout = async () => {
        await logout();
        router.replace("/");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const options = { month: 'short', day: 'numeric', year: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9' }}>
                <ActivityIndicator size="large" color="#D32F2F" />
            </View>
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
                                        <TouchableOpacity>
                                            <Feather name="more-horizontal" size={20} color="#666" />
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
    card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#eee' },
    cardTitle: { fontSize: 13, fontWeight: "bold", color: "#111", marginBottom: 15, textTransform: "uppercase", letterSpacing: 0.5 },
    bioText: { fontSize: 15, color: "#555", lineHeight: 24 },
    moduleRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    moduleIcon: { marginRight: 12 },
    moduleText: { fontSize: 15, color: "#444" },
    feedContainer: { padding: 15 },
    postCard: { backgroundColor: "#fff", borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
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