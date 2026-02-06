/**
 * ====================================
 * IIT CONNECT - EVENTS & ANNOUNCEMENTS SCREEN
 * ====================================
 * Main screen showing events and announcements with tab navigation.
 * Based on Figma design with category badges and toggle buttons.
 */

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { EVENTS_ENDPOINTS, ANNOUNCEMENTS_ENDPOINTS } from "../src/config/api";

// ====================================
// TYPE DEFINITIONS
// ====================================
interface Event {
    _id: string;
    title: string;
    description: string;
    category: "academic" | "career" | "workshop" | "sports" | "other";
    eventDate: string;
    startTime: string;
    endTime: string;
    location: string;
}

interface Announcement {
    _id: string;
    title: string;
    content: string;
    source: string;
    createdAt: string;
}

// ====================================
// CATEGORY BADGE COLORS
// ====================================
const categoryColors: Record<string, string> = {
    academic: "#e63946",
    career: "#f4a261",
    workshop: "#2a9d8f",
    sports: "#457b9d",
    other: "#6c757d",
};

// ====================================
// HELPER FUNCTIONS
// ====================================
const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

const getTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
};

// ====================================
// SAMPLE DATA (for testing before backend is ready)
// ====================================
const sampleEvents: Event[] = [
    {
        _id: "1",
        title: "Engineering Week 2024 Opening Ceremony",
        description:
            "Join us for the grand opening ceremony of Engineering Week with keynote speakers from industry leaders.",
        category: "academic",
        eventDate: "2024-12-05",
        startTime: "9:00 AM",
        endTime: "11:00 AM",
        location: "Main Auditorium",
    },
    {
        _id: "2",
        title: "Career Fair - Tech Companies",
        description:
            "Meet with representatives from top tech companies. Bring your resumes and professional attire.",
        category: "career",
        eventDate: "2024-12-08",
        startTime: "10:00 AM",
        endTime: "4:00 PM",
        location: "BMICH",
    },
    {
        _id: "3",
        title: "Programming Workshop: React Advanced",
        description:
            "Advanced React concepts including hooks, context API, and performance optimization techniques.",
        category: "workshop",
        eventDate: "2024-12-12",
        startTime: "2:00 PM",
        endTime: "5:00 PM",
        location: "SP 3LA",
    },
    {
        _id: "4",
        title: "Sports Day Finals",
        description:
            "Final matches for all sports categories. Cheer for your faculty team!",
        category: "sports",
        eventDate: "2024-12-15",
        startTime: "8:00 AM",
        endTime: "6:00 PM",
        location: "St Peters College Grounds",
    },
];

const sampleAnnouncements: Announcement[] = [
    {
        _id: "1",
        title: "Exam Schedule Released",
        content:
            "The final examination schedule for Semester 1 2024 has been published. Please check the student portal for your personalized exam timetable.",
        source: "Academic Office",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: "2",
        title: "Library Extended Hours",
        content:
            "Starting next week, the library will be open 24/7 during the examination period. Additional study spaces have been arranged.",
        source: "Library Administration",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: "3",
        title: "New Course Registration Opens",
        content:
            "Registration for next semester courses is now open. Log in to the student portal to select your courses. Registration closes on December 20th.",
        source: "Registrar Office",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: "4",
        title: "Campus WiFi Maintenance",
        content:
            "There will be scheduled WiFi maintenance on December 10th from 2:00 AM to 6:00 AM. We apologize for any inconvenience.",
        source: "IT Services",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        _id: "5",
        title: "Student Feedback Survey",
        content:
            "Please take 5 minutes to complete the semester feedback survey. Your input helps us improve the university experience.",
        source: "Student Affairs",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
];

// ====================================
// EVENT CARD COMPONENT
// ====================================
const EventCard: React.FC<{ event: Event }> = ({ event }) => {
    return (
        <View style={styles.eventCard}>
            {/* Header with Icon and Title */}
            <View style={styles.eventHeader}>
                <View style={styles.eventIcon}>
                    <Ionicons name="calendar" size={20} color="#e63946" />
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
            </View>

            {/* Event Details */}
            <View style={styles.eventDetail}>
                <Ionicons name="calendar-outline" size={16} color="#666" />
                <Text style={styles.eventDetailText}>{formatDate(event.eventDate)}</Text>
            </View>

            <View style={styles.eventDetail}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.eventDetailText}>
                    {event.startTime} - {event.endTime}
                </Text>
            </View>

            <View style={styles.eventDetail}>
                <Ionicons name="location-outline" size={16} color="#666" />
                <Text style={styles.eventDetailText}>{event.location}</Text>
            </View>

            {/* Description */}
            <Text style={styles.eventDescription}>{event.description}</Text>
        </View>
    );
};

// ====================================
// ANNOUNCEMENT CARD COMPONENT
// ====================================
const AnnouncementCard: React.FC<{ announcement: Announcement }> = ({
    announcement,
}) => {
    return (
        <View style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
                {/* Blue Bell Icon */}
                <View style={styles.announcementIcon}>
                    <Ionicons name="notifications" size={20} color="#1d3557" />
                </View>

                <View style={styles.announcementHeaderText}>
                    <Text style={styles.announcementTitle}>{announcement.title}</Text>
                    <Text style={styles.announcementMeta}>
                        {getTimeAgo(announcement.createdAt)}
                    </Text>
                </View>
            </View>

            <Text style={styles.announcementContent}>{announcement.content}</Text>
        </View>
    );
};

// ====================================
// MAIN COMPONENT
// ====================================
export default function EventsAnnouncementsScreen() {
    const [activeTab, setActiveTab] = useState<"events" | "announcements">(
        "events"
    );
    const [events, setEvents] = useState<Event[]>(sampleEvents);
    const [announcements, setAnnouncements] =
        useState<Announcement[]>(sampleAnnouncements);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch events from API
    const fetchEvents = async () => {
        try {
            const response = await fetch(EVENTS_ENDPOINTS.GET_ALL);
            const data = await response.json();
            if (data.success && data.events.length > 0) {
                setEvents(data.events);
            }
        } catch (error) {
            console.log("Using sample events - Backend not available");
        }
    };

    // Fetch announcements from API
    const fetchAnnouncements = async () => {
        try {
            const response = await fetch(ANNOUNCEMENTS_ENDPOINTS.GET_ALL);
            const data = await response.json();
            if (data.success && data.announcements.length > 0) {
                setAnnouncements(data.announcements);
            }
        } catch (error) {
            console.log("Using sample announcements - Backend not available");
        }
    };

    // Initial load
    useEffect(() => {
        setIsLoading(true);
        Promise.all([fetchEvents(), fetchAnnouncements()]).finally(() => {
            setIsLoading(false);
        });
    }, []);

    // Pull to refresh
    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchEvents(), fetchAnnouncements()]);
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Events & Announcements</Text>
                    <TouchableOpacity style={styles.bellButton}>
                        <Ionicons name="notifications-outline" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
                <Text style={styles.headerSubtitle}>
                    Stay updated with campus activities
                </Text>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={styles.actionButtonActive}>
                        <Text style={styles.actionButtonTextActive}>Events</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push("/admin")}
                    >
                        <Text style={styles.actionButtonText}>Admin</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Tab Switch */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "events" && styles.tabActive]}
                    onPress={() => setActiveTab("events")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "events" && styles.tabTextActive,
                        ]}
                    >
                        Events
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "announcements" && styles.tabActive,
                    ]}
                    onPress={() => setActiveTab("announcements")}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "announcements" && styles.tabTextActive,
                        ]}
                    >
                        Announcements
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#e63946" />
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {activeTab === "events" ? (
                        events.map((event) => <EventCard key={event._id} event={event} />)
                    ) : (
                        announcements.map((announcement) => (
                            <AnnouncementCard
                                key={announcement._id}
                                announcement={announcement}
                            />
                        ))
                    )}
                </ScrollView>
            )}

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="book-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Academic</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItemCenter}>
                    <View style={styles.navCenterButton}>
                        <Ionicons name="grid" size={24} color="#fff" />
                    </View>
                    <Text style={styles.navTextActive}>More</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="chatbubble-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa",
    },
    header: {
        backgroundColor: "#fff",
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000000",
    },
    bellButton: {
        padding: 8,
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    actionButtons: {
        flexDirection: "row",
        marginTop: 15,
        gap: 10,
    },
    actionButtonActive: {
        backgroundColor: "#e63946",
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
    },
    actionButtonTextActive: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    actionButton: {
        backgroundColor: "#f0f0f0",
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
    },
    actionButtonText: {
        color: "#333",
        fontWeight: "500",
        fontSize: 14,
    },
    tabContainer: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        alignItems: "center",
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: "#1d3557",
    },
    tabText: {
        fontSize: 15,
        color: "#999",
        fontWeight: "500",
    },
    tabTextActive: {
        color: "#000000",
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 15,
        paddingBottom: 100,
    },
    // Event Card Styles
    eventCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 18,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    eventHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    eventIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fef2f2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    eventTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: "700",
        color: "#000000",
    },
    eventDetail: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        gap: 8,
    },
    eventDetailText: {
        fontSize: 14,
        color: "#666",
    },
    eventDescription: {
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
        marginTop: 10,
    },
    // Announcement Card Styles
    announcementCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 18,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    announcementHeader: {
        flexDirection: "row",
        marginBottom: 10,
    },
    announcementIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#fef2f2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    announcementHeaderText: {
        flex: 1,
    },
    announcementTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#000000",
        marginBottom: 3,
    },
    announcementMeta: {
        fontSize: 13,
        color: "#888",
    },
    announcementContent: {
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
    },
    // Bottom Navigation
    bottomNav: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        flexDirection: "row",
        paddingVertical: 10,
        paddingBottom: 25,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    navItem: {
        flex: 1,
        alignItems: "center",
    },
    navItemCenter: {
        flex: 1,
        alignItems: "center",
        marginTop: -20,
    },
    navCenterButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#e63946",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#e63946",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    navText: {
        fontSize: 11,
        color: "#666",
        marginTop: 4,
    },
    navTextActive: {
        fontSize: 11,
        color: "#e63946",
        marginTop: 4,
        fontWeight: "600",
    },
});
