import React from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const STORIES = [
    { id: "1", name: "Your Story", image: "https://i.pravatar.cc/150?u=1", isUser: true },
    { id: "2", name: "Drama Club", image: "https://i.pravatar.cc/150?u=2" },
    { id: "3", name: "Tech Society", image: "https://i.pravatar.cc/150?u=3" },
    { id: "4", name: "Music Club", image: "https://i.pravatar.cc/150?u=4" },
    { id: "5", name: "Sports", image: "https://i.pravatar.cc/150?u=5" },
];

export default function HomeScreen() {
    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>CoNNect</Text>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Feather name="plus" size={24} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <View>
                            <Ionicons name="notifications-outline" size={24} color="#000" />
                            <View style={styles.notificationDot} />
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Feed / Reels Tabs */}
                <View style={styles.tabsContainer}>
                    <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                        <Text style={styles.activeTabText}>Feed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.tab}>
                        <Text style={styles.tabText}>Reels</Text>
                    </TouchableOpacity>
                </View>

                {/* Stories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.storiesContainer}
                    contentContainerStyle={styles.storiesContent}
                >
                    {STORIES.map((story) => (
                        <View key={story.id} style={styles.storyWrapper}>
                            <View style={[styles.storyCircle, story.isUser ? styles.userStoryCircle : styles.clubStoryCircle]}>
                                <Image source={{ uri: story.image }} style={styles.storyImage} />
                                {story.isUser && (
                                    <View style={styles.addStoryIcon}>
                                        <Ionicons name="add" size={12} color="#FFF" />
                                    </View>
                                )}
                            </View>
                            <Text style={styles.storyName} numberOfLines={1}>
                                {story.name}
                            </Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Post */}
                <View style={styles.postContainer}>
                    {/* Post Header */}
                    <View style={styles.postHeader}>
                        <Image
                            source={{ uri: "https://i.pravatar.cc/150?u=6" }}
                            style={styles.postAvatar}
                        />
                        <View style={styles.postHeaderText}>
                            <Text style={styles.postUsername}>Priya Sharma</Text>
                            <Text style={styles.postSubtext}>Computer Science, Year 3</Text>
                        </View>
                    </View>

                    {/* Post Content */}
                    <Image
                        source={{ uri: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80" }}
                        style={styles.postImage}
                        resizeMode="cover"
                    />

                    {/* Post Actions */}
                    <View style={styles.postActions}>
                        <View style={styles.postActionsLeft}>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="heart-outline" size={26} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="chatbubble-outline" size={24} color="#000" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Ionicons name="paper-plane-outline" size={24} color="#000" />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity>
                            <Ionicons name="bookmark-outline" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>

                    {/* Post Info */}
                    <View style={styles.postInfo}>
                        <Text style={styles.likesText}>234 likes</Text>
                        <Text style={styles.timeText}>2 hours ago</Text>
                        <Text style={styles.caption}>
                            Finally finished our Machine Learning project! 🥳
                            Thanks to my amazing team for all the hard work.
                        </Text>
                        <TouchableOpacity>
                            <Text style={styles.viewComments}>View all 18 comments</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home" size={26} color="#E31E24" />
                    <Text style={[styles.navText, { color: "#E31E24" }]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="book-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Academic</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <MaterialCommunityIcons name="view-grid-outline" size={24} color="#666" />
                    <Text style={styles.navText}>More</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="chatbubble-ellipses-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: "#EEE",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "800",
        color: "#000",
        fontFamily: Platform.OS === 'ios' ? 'System' : 'serif',
    },
    headerIcons: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconButton: {
        marginLeft: 15,
    },
    notificationDot: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#E31E24",
        borderWidth: 1,
        borderColor: "#FFF",
    },
    tabsContainer: {
        flexDirection: "row",
        backgroundColor: "#F0F0F0",
        borderRadius: 12,
        margin: 16,
        padding: 2,
    },
    tab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: "center",
        borderRadius: 10,
    },
    activeTab: {
        backgroundColor: "#E31E24",
    },
    tabText: {
        color: "#666",
        fontWeight: "600",
    },
    activeTabText: {
        color: "#FFF",
        fontWeight: "600",
    },
    storiesContainer: {
        marginBottom: 10,
    },
    storiesContent: {
        paddingHorizontal: 16,
    },
    storyWrapper: {
        alignItems: "center",
        marginRight: 16,
        width: 70,
    },
    storyCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        padding: 2,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    userStoryCircle: {
        borderColor: "#CCC",
    },
    clubStoryCircle: {
        borderColor: "#E31E24",
    },
    storyImage: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    addStoryIcon: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "#E31E24",
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#FFF",
    },
    storyName: {
        fontSize: 11,
        color: "#333",
        textAlign: "center",
    },
    postContainer: {
        backgroundColor: "#FFF",
        marginBottom: 20,
    },
    postHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
    },
    postAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
    },
    postUsername: {
        fontWeight: "bold",
        fontSize: 14,
        color: "#000",
    },
    postSubtext: {
        fontSize: 12,
        color: "#666",
    },
    postImage: {
        width: width,
        height: width * 0.8,
    },
    postActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    postActionsLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    actionButton: {
        marginRight: 15,
    },
    postInfo: {
        paddingHorizontal: 12,
    },
    likesText: {
        fontWeight: "bold",
        fontSize: 14,
        marginBottom: 2,
    },
    timeText: {
        fontSize: 11,
        color: "#999",
        marginBottom: 6,
    },
    caption: {
        fontSize: 13,
        lineHeight: 18,
        color: "#333",
        marginBottom: 6,
    },
    viewComments: {
        fontSize: 13,
        color: "#999",
        marginBottom: 10,
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 10,
        borderTopWidth: 0.5,
        borderTopColor: "#EEE",
        backgroundColor: "#FFF",
    },
    navItem: {
        alignItems: "center",
    },
    navText: {
        fontSize: 10,
        marginTop: 4,
        color: "#666",
    },
});
