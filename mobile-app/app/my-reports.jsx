/**
 * ====================================
 * MY REPORTS SCREEN
 * ====================================
 * Shows all anonymous reports the user has submitted
 * from this device, along with their current status
 * and whether the admin has responded.
 */

import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
    Platform,
    StatusBar,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REPORTS_ENDPOINTS } from "../src/config/api";

const STORAGE_KEY = "@iit_connect_my_report_ids";

// Status colours
const STATUS_COLORS = {
    pending: { background: "#FFF3E0", text: "#F57C00" },
    ongoing: { background: "#E3F2FD", text: "#1976D2" },
    solved: { background: "#E8F5E9", text: "#388E3C" },
    rejected: { background: "#FFEBEE", text: "#D32F2F" },
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

export default function MyReportsScreen() {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadReports = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setIsLoading(true);

        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            const ids = stored ? JSON.parse(stored) : [];

            if (ids.length === 0) {
                setReports([]);
                return;
            }

            const res = await fetch(REPORTS_ENDPOINTS.BATCH, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids }),
            });
            const data = await res.json();
            if (data.success) setReports(data.data);
        } catch (err) {
            console.error("❌ MyReports fetch error:", err);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Re-fetch every time the screen is focused (e.g. returning from detail)
    useFocusEffect(
        useCallback(() => {
            loadReports();
        }, [loadReports])
    );

    // ── EMPTY STATE ──
    const EmptyState = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
                <Ionicons name="document-text-outline" size={40} color="#e63946" />
            </View>
            <Text style={styles.emptyTitle}>No Reports Yet</Text>
            <Text style={styles.emptySubtitle}>
                Reports you submit anonymously will appear here so you can track admin responses.
            </Text>
            <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.replace("/anonymous-report")}
            >
                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                <Text style={styles.emptyButtonText}>Submit a Report</Text>
            </TouchableOpacity>
        </View>
    );

    // ── REPORT CARD ──
    const ReportItem = ({ item }) => {
        const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
        const responseCount = item.responses?.length ?? 0;
        const hasResponse = responseCount > 0;
        const displayTitle = item.title || item.subject || "(No title)";

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.75}
                onPress={() => router.push({ pathname: "/my-report-detail", params: { id: item._id } })}
            >
                {/* Has-response indicator */}
                {hasResponse && (
                    <View style={styles.responsePill}>
                        <Ionicons name="chatbubble" size={11} color="#fff" />
                        <Text style={styles.responsePillText}>
                            {responseCount} admin {responseCount === 1 ? "response" : "responses"}
                        </Text>
                    </View>
                )}

                <Text style={styles.cardTitle} numberOfLines={2}>{displayTitle}</Text>

                <View style={[styles.statusBadge, { backgroundColor: statusColor.background }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>

                <Text style={styles.cardDescription} numberOfLines={2}>
                    {item.description}
                </Text>

                <View style={styles.cardFooter}>
                    <Ionicons name="time-outline" size={13} color="#aaa" />
                    <Text style={styles.cardFooterText}>{formatTimeAgo(item.createdAt)}</Text>
                    <View style={{ flex: 1 }} />
                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={styles.headerIconCircle}>
                        <Ionicons name="time" size={18} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>My Reports</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#e63946" />
                    <Text style={styles.loadingText}>Loading your reports…</Text>
                </View>
            ) : (
                <FlatList
                    data={reports}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => <ReportItem item={item} />}
                    ListEmptyComponent={<EmptyState />}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => loadReports(true)}
                            colors={["#e63946"]}
                            tintColor="#e63946"
                        />
                    }
                    contentContainerStyle={
                        reports.length === 0
                            ? styles.listContainerEmpty
                            : styles.listContainer
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
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
    headerCenter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    headerIconCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#e63946",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111",
    },

    // List
    listContainer: { padding: 16, paddingBottom: 32 },
    listContainerEmpty: { flex: 1 },

    // Card
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        boxShadow: "0px 1px 4px 0px rgba(0, 0, 0, 0.06)",
        elevation: 2,
    },
    responsePill: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        backgroundColor: "#388E3C",
        borderRadius: 20,
        paddingHorizontal: 9,
        paddingVertical: 3,
        marginBottom: 10,
        gap: 4,
    },
    responsePillText: {
        color: "#fff",
        fontSize: 11,
        fontWeight: "700",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#111",
        marginBottom: 8,
        lineHeight: 22,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 10,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 0.5,
    },
    cardDescription: {
        fontSize: 14,
        color: "#777",
        lineHeight: 20,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    cardFooterText: {
        fontSize: 12,
        color: "#aaa",
    },

    // Loading
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 12, fontSize: 14, color: "#888" },

    // Empty state
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 36,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#fff0f0",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#111",
        marginBottom: 10,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 28,
    },
    emptyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e63946",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
        gap: 8,
    },
    emptyButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
});
