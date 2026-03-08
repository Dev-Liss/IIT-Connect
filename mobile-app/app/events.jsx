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
// CATEGORY BADGE COLORS
// ====================================
const categoryColors = {
    academic: "#e63946",
    career: "#f4a261",
    workshop: "#2a9d8f",
    sports: "#457b9d",
    other: "#6c757d",
};

// ====================================
// HELPER FUNCTIONS
// ====================================
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
};

const getTimeAgo = (dateString) => {
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
const sampleEvents = [
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

const sampleAnnouncements = [
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
const EventCard = ({ event }) => {
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
const AnnouncementCard = ({ announcement }) => {
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
    const [activeTab, setActiveTab] = useState("events");
    const [events, setEvents] = useState(sampleEvents);
    const [announcements, setAnnouncements] = useState(sampleAnnouncements);
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
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Events & Announcements</Text>
                </View>
                <Text style={styles.headerSubtitle}>
                    Stay updated with campus activities
                </Text>
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
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    headerTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: "bold",
        color: "#000000",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
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
        boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.06)",
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
        boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.06)",
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

});
