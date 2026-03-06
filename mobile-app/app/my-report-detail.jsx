/**
 * ====================================
 * MY REPORT DETAIL SCREEN
 * ====================================
 * Read-only view of an anonymous report the user submitted.
 * Shows the report's current status and all admin responses.
 */

import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Platform,
    StatusBar,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { REPORTS_ENDPOINTS } from "../src/config/api";

// Status colours
const STATUS_COLORS = {
    pending: { background: "#FFF3E0", text: "#F57C00", icon: "time-outline" },
    ongoing: { background: "#E3F2FD", text: "#1976D2", icon: "play-circle-outline" },
    solved: { background: "#E8F5E9", text: "#388E3C", icon: "checkmark-circle-outline" },
    rejected: { background: "#FFEBEE", text: "#D32F2F", icon: "close-circle-outline" },
};

const STATUS_LABELS = {
    pending: "Pending – your report is waiting for review",
    ongoing: "Ongoing – admin is looking into this",
    solved: "Solved – this report has been resolved",
    rejected: "Rejected – this report was not actioned",
};

// Time-ago helper
const formatTimeAgo = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
};

// Format as readable date
const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
};

export default function MyReportDetailScreen() {
    const { id } = useLocalSearchParams();
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchReport = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else if (!report) setIsLoading(true);

        try {
            const res = await fetch(REPORTS_ENDPOINTS.GET_BY_ID(id));
            const data = await res.json();
            if (data.success) setReport(data.data);
        } catch (err) {
            console.error("❌ MyReportDetail fetch error:", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useFocusEffect(
        useCallback(() => {
            fetchReport();
        }, [fetchReport])
    );

    // ── HEADER ──
    const HeaderBlock = () => (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
                <View style={styles.headerIconCircle}>
                    <Ionicons name="document-text" size={18} color="#fff" />
                </View>
                <Text style={styles.headerTitle}>Report Detail</Text>
            </View>
            <View style={{ width: 40 }} />
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <HeaderBlock />
                <View style={styles.centeredBox}>
                    <ActivityIndicator size="large" color="#e63946" />
                    <Text style={styles.loadingText}>Loading report…</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!report) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <HeaderBlock />
                <View style={styles.centeredBox}>
                    <Ionicons name="alert-circle-outline" size={40} color="#ccc" />
                    <Text style={styles.errorText}>Report not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusColor = STATUS_COLORS[report.status] || STATUS_COLORS.pending;
    const statusLabel = STATUS_LABELS[report.status] || "";
    const responses = report.responses || [];
    const displayTitle = report.title || report.subject || "(No title)";

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <HeaderBlock />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchReport(true)}
                        colors={["#e63946"]}
                        tintColor="#e63946"
                    />
                }
            >
                {/* ── Title ── */}
                <Text style={styles.reportTitle}>{displayTitle}</Text>

                {/* ── Status ── */}
                <View style={[styles.statusBadge, { backgroundColor: statusColor.background }]}>
                    <Ionicons name={statusColor.icon} size={14} color={statusColor.text} />
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                        {report.status.toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.statusLabel}>{statusLabel}</Text>

                <Text style={styles.timestamp}>
                    Submitted {formatDate(report.createdAt)}
                </Text>

                {/* ── Description ── */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Your Report</Text>
                    <View style={styles.descriptionBox}>
                        <Text style={styles.descriptionText}>{report.description}</Text>
                    </View>
                </View>

                {/* ── Admin Responses ── */}
                <View style={styles.section}>
                    <View style={styles.sectionHeaderRow}>
                        <Text style={styles.sectionLabel}>Admin Responses</Text>
                        {responses.length > 0 && (
                            <View style={styles.countBadge}>
                                <Text style={styles.countBadgeText}>{responses.length}</Text>
                            </View>
                        )}
                    </View>

                    {responses.length === 0 ? (
                        <View style={styles.noResponseBox}>
                            <Ionicons name="chatbubble-ellipses-outline" size={32} color="#ddd" />
                            <Text style={styles.noResponseTitle}>No response yet</Text>
                            <Text style={styles.noResponseSubtitle}>
                                The admin hasn't responded yet. Pull down to refresh and check back later.
                            </Text>
                        </View>
                    ) : (
                        responses.map((res, index) => (
                            <View key={res._id || index} style={styles.responseItem}>
                                {/* Avatar */}
                                <View style={styles.responseAvatar}>
                                    <Ionicons name="shield-checkmark" size={16} color="#fff" />
                                </View>

                                {/* Bubble */}
                                <View style={styles.responseBubble}>
                                    <View style={styles.responseHeader}>
                                        <Text style={styles.responseAuthor}>Admin</Text>
                                        <Text style={styles.responseTime}>
                                            {formatTimeAgo(res.createdAt)}
                                        </Text>
                                    </View>
                                    <Text style={styles.responseText}>{res.text}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* ── Privacy reminder ── */}
                <View style={styles.privacyNote}>
                    <Ionicons name="lock-closed-outline" size={14} color="#1d4ed8" />
                    <Text style={styles.privacyNoteText}>
                        Admin responses never reveal your identity. Your anonymity is fully protected.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5" },

    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 10 : 10,
        paddingBottom: 14,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#efefef",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
    headerIconCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: "#e63946",
        justifyContent: "center", alignItems: "center",
    },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#111" },

    // Scroll
    scrollContent: { padding: 16, paddingBottom: 32 },

    // Title
    reportTitle: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111",
        lineHeight: 30,
        marginBottom: 12,
    },

    // Status
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 8,
        gap: 6,
        marginBottom: 6,
    },
    statusText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
    statusLabel: { fontSize: 13, color: "#888", marginBottom: 4 },
    timestamp: { fontSize: 12, color: "#bbb", marginBottom: 20 },

    // Sections
    section: { marginBottom: 24 },
    sectionHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
    sectionLabel: { fontSize: 15, fontWeight: "700", color: "#111" },
    countBadge: {
        backgroundColor: "#e63946",
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    countBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

    // Description
    descriptionBox: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    descriptionText: { fontSize: 14, color: "#444", lineHeight: 22 },

    // No-response
    noResponseBox: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 24,
        alignItems: "center",
        gap: 8,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    noResponseTitle: { fontSize: 15, fontWeight: "600", color: "#999", marginTop: 4 },
    noResponseSubtitle: { fontSize: 13, color: "#bbb", textAlign: "center", lineHeight: 20 },

    // Response items
    responseItem: { flexDirection: "row", marginBottom: 16, gap: 10 },
    responseAvatar: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: "#e63946",
        justifyContent: "center", alignItems: "center",
        marginTop: 2,
        flexShrink: 0,
    },
    responseBubble: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    responseHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    responseAuthor: { fontSize: 13, fontWeight: "700", color: "#e63946" },
    responseTime: { fontSize: 11, color: "#bbb" },
    responseText: { fontSize: 14, color: "#333", lineHeight: 21 },

    // Privacy note
    privacyNote: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#eff6ff",
        borderRadius: 10,
        padding: 12,
        gap: 8,
        borderWidth: 1,
        borderColor: "#bfdbfe",
    },
    privacyNoteText: { flex: 1, fontSize: 12, color: "#1e3a5f", lineHeight: 18 },

    // Loading / error
    centeredBox: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 12, fontSize: 14, color: "#888" },
    errorText: { marginTop: 12, fontSize: 15, color: "#aaa" },
});
