/**
 * ====================================
 * MY REPORT DETAIL SCREEN
 * ====================================
 * Read-only view of a submitted report + admin responses.
 * Styled to match the Academic feature design language.
 */

import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REPORTS_ENDPOINTS } from "../src/config/api";

const SEEN_COUNTS_KEY = "@iit_connect_seen_response_counts";

const COLORS = {
    RED: "#f9252b",
    WHITE: "#f7f7f7",
    GREY: "#888",
    TEXT_DARK: "#333",
    LIGHT_GREY: "#e0e0e0",
};

const STATUS_COLORS = {
    pending: { border: "#F57C00", text: "#F57C00" },
    ongoing: { border: "#1976D2", text: "#1976D2" },
    solved: { border: "#388E3C", text: "#388E3C" },
    rejected: { border: "#D32F2F", text: "#D32F2F" },
};

const STATUS_LABELS = {
    pending: "Waiting for admin review",
    ongoing: "Admin is looking into this",
    solved: "This report has been resolved",
    rejected: "This report was not actioned",
};

const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });

const formatTimeAgo = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    return `${diffDays} days ago`;
};

export default function MyReportDetailScreen() {
    const insets = useSafeAreaInsets();
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
            if (data.success) {
                setReport(data.data);
                // Mark responses as seen
                try {
                    const raw = await AsyncStorage.getItem(SEEN_COUNTS_KEY);
                    const seen = raw ? JSON.parse(raw) : {};
                    seen[id] = data.data.responses?.length ?? 0;
                    await AsyncStorage.setItem(SEEN_COUNTS_KEY, JSON.stringify(seen));
                } catch (e) { /* ignore storage errors */ }
            }
        } catch (err) {
            console.error("❌ MyReportDetail fetch error:", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useFocusEffect(useCallback(() => { fetchReport(); }, [fetchReport]));

    const HeaderBlock = () => (
        <View style={[styles.headerBlock, { paddingTop: insets.top + 10 }]}>
            <View style={styles.titleRow}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Report Detail</Text>
                <View style={{ width: 38 }} />
            </View>
        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <HeaderBlock />
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={COLORS.RED} />
                </View>
            </View>
        );
    }

    if (!report) {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <HeaderBlock />
                <View style={styles.centered}>
                    <Text style={styles.errorText}>Report not found</Text>
                </View>
            </View>
        );
    }

    const statusColor = STATUS_COLORS[report.status] || STATUS_COLORS.pending;
    const statusLabel = STATUS_LABELS[report.status] || "";
    const responses = report.responses || [];
    const displayTitle = report.title || report.subject || "(No title)";

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <HeaderBlock />

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentPadding}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => fetchReport(true)} colors={[COLORS.RED]} />
                }
            >
                {/* ── Report Summary card ── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>{displayTitle}</Text>
                        <View style={[styles.statusTag, { borderColor: statusColor.border }]}>
                            <Text style={[styles.statusTagText, { color: statusColor.text }]}>
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.separator} />

                    <View style={styles.detailRow}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="calendar-outline" size={18} color={COLORS.GREY} />
                        </View>
                        <View>
                            <Text style={styles.detailLabel}>Submitted</Text>
                            <Text style={styles.detailValue}>{formatDate(report.createdAt)}</Text>
                        </View>
                    </View>

                    <View style={styles.detailRow}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="information-circle-outline" size={18} color={COLORS.GREY} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.detailLabel}>Status</Text>
                            <Text style={styles.detailValue}>{statusLabel}</Text>
                        </View>
                    </View>

                    <View style={styles.separator} />

                    <Text style={styles.detailSectionTitle}>Description</Text>
                    <Text style={styles.aboutText}>{report.description}</Text>
                </View>

                {/* ── Admin Responses card ── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Admin Responses</Text>
                        {responses.length > 0 && (
                            <View style={styles.countBadge}>
                                <Text style={styles.countBadgeText}>{responses.length}</Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.separator} />

                    {responses.length === 0 ? (
                        <View style={styles.noResponseBox}>
                            <Ionicons name="chatbubble-ellipses-outline" size={28} color={COLORS.LIGHT_GREY} />
                            <Text style={styles.noResponseTitle}>No response yet</Text>
                            <Text style={styles.noResponseSub}>Pull down to refresh and check back later.</Text>
                        </View>
                    ) : (
                        responses.map((res, index) => (
                            <View key={res._id || index}>
                                {index > 0 && <View style={styles.separator} />}
                                <View style={styles.responseItem}>
                                    <View style={styles.responseHeader}>
                                        <View style={styles.responseAvatar}>
                                            <Ionicons name="shield-checkmark" size={14} color="#fff" />
                                        </View>
                                        <Text style={styles.responseAuthor}>Admin</Text>
                                        <Text style={styles.responseTime}>{formatTimeAgo(res.createdAt)}</Text>
                                    </View>
                                    <Text style={styles.responseBody}>{res.text}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>

                {/* ── Privacy note ── */}
                <View style={[styles.card, styles.privacyCard]}>
                    <View style={styles.detailRow}>
                        <View style={styles.iconCircle}>
                            <Ionicons name="lock-closed" size={18} color={COLORS.GREY} />
                        </View>
                        <Text style={styles.privacyText}>
                            Admin responses never reveal your identity. Your anonymity is fully protected at all times.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    // Header — matches academic.jsx headerBlock
    headerBlock: {
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#efefef",
        zIndex: 10,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#262626",
    },

    // Content
    content: { flex: 1 },
    contentPadding: { padding: 16, paddingBottom: 60 },

    // Card — matches KuppiScreen card
    card: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        marginVertical: 4,
        boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.08)",
        elevation: 2,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    privacyCard: { borderLeftWidth: 4, borderLeftColor: COLORS.RED },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    cardTitle: { fontSize: 18, fontWeight: "bold", color: COLORS.TEXT_DARK, flex: 1, marginRight: 8 },

    statusTag: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    statusTagText: { fontSize: 12, fontWeight: "600" },

    countBadge: {
        backgroundColor: COLORS.RED,
        borderRadius: 10,
        minWidth: 22,
        height: 22,
        paddingHorizontal: 6,
        alignItems: "center",
        justifyContent: "center",
    },
    countBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

    separator: { height: 1, backgroundColor: "#eee", marginVertical: 12 },

    // Detail rows — matches KuppiScreen detailRow
    detailRow: { flexDirection: "row", marginBottom: 16, alignItems: "center" },
    iconCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#F9F9F9",
        justifyContent: "center", alignItems: "center",
        marginRight: 14,
    },
    detailLabel: { fontSize: 13, color: COLORS.GREY, marginBottom: 2 },
    detailValue: { fontSize: 15, fontWeight: "600", color: COLORS.TEXT_DARK },

    detailSectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
        color: COLORS.TEXT_DARK,
    },
    aboutText: { lineHeight: 22, color: "#555" },

    // Response items
    responseItem: { paddingVertical: 6 },
    responseHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    responseAvatar: {
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: COLORS.RED,
        justifyContent: "center", alignItems: "center",
    },
    responseAuthor: { fontSize: 14, fontWeight: "bold", color: COLORS.TEXT_DARK, flex: 1 },
    responseTime: { fontSize: 12, color: COLORS.GREY },
    responseBody: { fontSize: 14, color: "#555", lineHeight: 21 },

    // No response
    noResponseBox: { alignItems: "center", paddingVertical: 20, gap: 8 },
    noResponseTitle: { fontSize: 15, fontWeight: "600", color: "#ccc" },
    noResponseSub: { fontSize: 13, color: "#ccc", textAlign: "center" },

    // Privacy
    privacyText: { fontSize: 14, color: "#555", lineHeight: 20, flex: 1 },

    // Loading / error
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    errorText: { fontSize: 15, color: COLORS.GREY },
});
