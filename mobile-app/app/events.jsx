/**
 * ====================================
 * IIT CONNECT - EVENTS & ANNOUNCEMENTS SCREEN
 * ====================================
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
    StatusBar,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { EVENTS_ENDPOINTS, ANNOUNCEMENTS_ENDPOINTS } from "../src/config/api";

// ====================================
// CATEGORY CONFIG
// ====================================
const CATEGORIES = {
    academic: { color: "#e63946", bg: "#fef2f2", icon: "school-outline" },
    career:   { color: "#f4a261", bg: "#fef9f0", icon: "briefcase-outline" },
    workshop: { color: "#2a9d8f", bg: "#eefbf9", icon: "build-outline" },
    sports:   { color: "#457b9d", bg: "#eef4f8", icon: "football-outline" },
    other:    { color: "#6c757d", bg: "#f3f4f5", icon: "ellipsis-horizontal" },
};

// ====================================
// HELPERS
// ====================================
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatDateParts = (dateString) => {
    const date = new Date(dateString);
    return {
        day: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    };
};

const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins  = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays  = Math.floor(diffHours / 24);
    if (diffMins  < 1)  return "Just now";
    if (diffMins  < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays  === 1) return "Yesterday";
    if (diffDays  < 7)  return `${diffDays}d ago`;
    return formatDate(dateString);
};

// ====================================
// SAMPLE DATA
// ====================================
const sampleEvents = [
    { _id: "1", title: "Engineering Week 2024 Opening Ceremony", description: "Join us for the grand opening ceremony of Engineering Week with keynote speakers from industry leaders.", category: "academic", eventDate: "2024-12-05", startTime: "9:00 AM", endTime: "11:00 AM", location: "Main Auditorium" },
    { _id: "2", title: "Career Fair - Tech Companies", description: "Meet with representatives from top tech companies. Bring your resumes and professional attire.", category: "career", eventDate: "2024-12-08", startTime: "10:00 AM", endTime: "4:00 PM", location: "BMICH" },
    { _id: "3", title: "Programming Workshop: React Advanced", description: "Advanced React concepts including hooks, context API, and performance optimization techniques.", category: "workshop", eventDate: "2024-12-12", startTime: "2:00 PM", endTime: "5:00 PM", location: "SP 3LA" },
    { _id: "4", title: "Sports Day Finals", description: "Final matches for all sports categories. Cheer for your faculty team!", category: "sports", eventDate: "2024-12-15", startTime: "8:00 AM", endTime: "6:00 PM", location: "St Peters College Grounds" },
];

const sampleAnnouncements = [
    { _id: "1", title: "Exam Schedule Released", content: "The final examination schedule for Semester 1 2024 has been published. Please check the student portal for your personalized exam timetable.", source: "Academic Office", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { _id: "2", title: "Library Extended Hours", content: "Starting next week, the library will be open 24/7 during the examination period. Additional study spaces have been arranged.", source: "Library Administration", createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
    { _id: "3", title: "New Course Registration Opens", content: "Registration for next semester courses is now open. Log in to the student portal to select your courses. Registration closes on December 20th.", source: "Registrar Office", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { _id: "4", title: "Campus WiFi Maintenance", content: "There will be scheduled WiFi maintenance on December 10th from 2:00 AM to 6:00 AM. We apologize for any inconvenience.", source: "IT Services", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { _id: "5", title: "Student Feedback Survey", content: "Please take 5 minutes to complete the semester feedback survey. Your input helps us improve the university experience.", source: "Student Affairs", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

// ====================================
// EVENT CARD
// ====================================
const EventCard = ({ event }) => {
    const cat = CATEGORIES[event.category] || CATEGORIES.other;
    const { day, month } = formatDateParts(event.eventDate);

    return (
        <View style={styles.eventCard}>
            {/* Colored left accent bar */}
            <View style={[styles.accentBar, { backgroundColor: cat.color }]} />

            <View style={styles.eventCardInner}>
                {/* Top row: date badge only */}
                <View style={styles.eventTopRow}>
                    <View style={styles.dateBadge}>
                        <View style={[styles.dateBadgeTop, { backgroundColor: cat.color }]}>
                            <Text style={styles.dateBadgeMon}>{month}</Text>
                        </View>
                        <View style={styles.dateBadgeBottom}>
                            <Text style={[styles.dateBadgeDay, { color: cat.color }]}>{day}</Text>
                        </View>
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.eventTitle} numberOfLines={2}>{event.title}</Text>

                {/* Description */}
                <Text style={styles.eventDescription} numberOfLines={2}>{event.description}</Text>

                {/* Detail chips */}
                <View style={styles.chipsRow}>
                    <View style={styles.chip}>
                        <Ionicons name="time-outline" size={12} color="#888" />
                        <Text style={styles.chipText}>{event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}</Text>
                    </View>
                    <View style={styles.chip}>
                        <Ionicons name="location-outline" size={12} color="#888" />
                        <Text style={styles.chipText} numberOfLines={1}>{event.location}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

// ====================================
// ANNOUNCEMENT CARD
// ====================================
const AnnouncementCard = ({ announcement }) => {
    const isRecent = new Date() - new Date(announcement.createdAt) < 6 * 60 * 60 * 1000;

    return (
        <View style={styles.announcementCard}>
            <View style={styles.announcementRow}>
                {/* Icon */}
                <View style={[styles.announcementIconWrap, isRecent && styles.announcementIconRecent]}>
                    <Ionicons name="megaphone-outline" size={18} color={isRecent ? "#e63946" : "#999"} />
                    {isRecent && <View style={styles.recentDot} />}
                </View>

                <View style={styles.announcementBody}>
                    {/* Title + time */}
                    <View style={styles.announcementTitleRow}>
                        <Text style={styles.announcementTitle} numberOfLines={1}>{announcement.title}</Text>
                        <Text style={styles.announcementTime}>{getTimeAgo(announcement.createdAt)}</Text>
                    </View>

                    {/* Source badge */}
                    {announcement.source && (
                        <View style={styles.sourceBadge}>
                            <Ionicons name="business-outline" size={10} color="#999" />
                            <Text style={styles.sourceText}>{announcement.source}</Text>
                        </View>
                    )}

                    {/* Content */}
                    <Text style={styles.announcementContent} numberOfLines={3}>{announcement.content}</Text>
                </View>
            </View>
        </View>
    );
};

// ====================================
// MAIN SCREEN
// ====================================
export default function EventsAnnouncementsScreen() {
    const [activeTab, setActiveTab] = useState("events");
    const [events, setEvents] = useState(sampleEvents);
    const [announcements, setAnnouncements] = useState(sampleAnnouncements);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchEvents = async () => {
        try {
            const response = await fetch(EVENTS_ENDPOINTS.GET_ALL);
            const data = await response.json();
            if (data.success && data.events.length > 0) setEvents(data.events);
        } catch { console.log("Using sample events"); }
    };

    const fetchAnnouncements = async () => {
        try {
            const response = await fetch(ANNOUNCEMENTS_ENDPOINTS.GET_ALL);
            const data = await response.json();
            if (data.success && data.announcements.length > 0) setAnnouncements(data.announcements);
        } catch { console.log("Using sample announcements"); }
    };

    useEffect(() => {
        setIsLoading(true);
        Promise.all([fetchEvents(), fetchAnnouncements()]).finally(() => setIsLoading(false));
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchEvents(), fetchAnnouncements()]);
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Events & Announcements</Text>
                    <Text style={styles.headerSubtitle}>Stay updated with campus activities</Text>
                </View>
            </View>

            {/* ── Pill Tab Switcher ── */}
            <View style={styles.tabWrap}>
                <View style={styles.tabPill}>
                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === "events" && styles.tabBtnActive]}
                        onPress={() => setActiveTab("events")}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="calendar-outline" size={15} color={activeTab === "events" ? "#fff" : "#999"} />
                        <Text style={[styles.tabBtnText, activeTab === "events" && styles.tabBtnTextActive]}>
                            Events
                        </Text>
                        <View style={[styles.countBadge, activeTab === "events" && styles.countBadgeActive]}>
                            <Text style={[styles.countText, activeTab === "events" && styles.countTextActive]}>
                                {events.length}
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabBtn, activeTab === "announcements" && styles.tabBtnActive]}
                        onPress={() => setActiveTab("announcements")}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="megaphone-outline" size={15} color={activeTab === "announcements" ? "#fff" : "#999"} />
                        <Text style={[styles.tabBtnText, activeTab === "announcements" && styles.tabBtnTextActive]}>
                            Announcements
                        </Text>
                        <View style={[styles.countBadge, activeTab === "announcements" && styles.countBadgeActive]}>
                            <Text style={[styles.countText, activeTab === "announcements" && styles.countTextActive]}>
                                {announcements.length}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Content ── */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#e63946" />
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#e63946"]} tintColor="#e63946" />}
                >
                    {activeTab === "events"
                        ? events.map((event) => <EventCard key={event._id} event={event} />)
                        : announcements.map((a) => <AnnouncementCard key={a._id} announcement={a} />)
                    }
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
        backgroundColor: "#F4F5F7",
    },

    // ── Header ──
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 44) + 8 : 52,
        paddingHorizontal: 18,
        paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "#F4F5F7",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1a1a1a",
        letterSpacing: 0.2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#999",
        marginTop: 2,
    },

    // ── Pill Tab ──
    tabWrap: {
        paddingHorizontal: 18,
        paddingVertical: 14,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    tabPill: {
        flexDirection: "row",
        backgroundColor: "#F4F5F7",
        borderRadius: 14,
        padding: 4,
        gap: 4,
    },
    tabBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    tabBtnActive: {
        backgroundColor: "#e63946",
    },
    tabBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#999",
    },
    tabBtnTextActive: {
        color: "#fff",
    },
    countBadge: {
        backgroundColor: "#E0E0E0",
        borderRadius: 8,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 20,
        alignItems: "center",
    },
    countBadgeActive: {
        backgroundColor: "rgba(255,255,255,0.25)",
    },
    countText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#888",
    },
    countTextActive: {
        color: "#fff",
    },

    // ── Loading ──
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    loadingText: {
        fontSize: 14,
        color: "#999",
    },

    // ── List ──
    content: { flex: 1 },
    contentContainer: {
        padding: 16,
        paddingBottom: 100,
    },

    // ── Event Card ──
    eventCard: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderRadius: 18,
        marginBottom: 14,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    accentBar: {
        width: 5,
    },
    eventCardInner: {
        flex: 1,
        padding: 14,
    },
    eventTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 10,
    },
    dateBadge: {
        width: 50,
        height: 54,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    dateBadgeTop: {
        paddingVertical: 3,
        alignItems: "center",
        justifyContent: "center",
    },
    dateBadgeBottom: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    dateBadgeDay: {
        fontSize: 20,
        fontWeight: "800",
    },
    dateBadgeMon: {
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 0.5,
        color: "#fff",
    },
    categoryTag: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        gap: 4,
    },
    categoryTagText: {
        fontSize: 11,
        fontWeight: "700",
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a1a1a",
        lineHeight: 22,
        marginBottom: 5,
    },
    eventDescription: {
        fontSize: 13,
        color: "#777",
        lineHeight: 18,
        marginBottom: 10,
    },
    chipsRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F4F5F7",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 4,
    },
    chipText: {
        fontSize: 11,
        color: "#777",
        fontWeight: "500",
        maxWidth: 120,
    },

    // ── Announcement Card ──
    announcementCard: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 14,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    announcementRow: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    announcementIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "#F4F5F7",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    announcementIconRecent: {
        backgroundColor: "#FFF1F2",
    },
    recentDot: {
        position: "absolute",
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#e63946",
        borderWidth: 1.5,
        borderColor: "#fff",
    },
    announcementBody: {
        flex: 1,
    },
    announcementTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 4,
    },
    announcementTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: "#1a1a1a",
        marginRight: 8,
    },
    announcementTime: {
        fontSize: 11,
        color: "#bbb",
        fontWeight: "500",
        flexShrink: 0,
    },
    sourceBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F4F5F7",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        alignSelf: "flex-start",
        gap: 4,
        marginBottom: 8,
    },
    sourceText: {
        fontSize: 11,
        color: "#888",
        fontWeight: "600",
    },
    announcementContent: {
        fontSize: 13,
        color: "#777",
        lineHeight: 19,
    },
});
