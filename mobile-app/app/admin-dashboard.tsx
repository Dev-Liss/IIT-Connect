/**
 * ====================================
 * ADMIN DASHBOARD SCREEN
 * ====================================
 * Lecturer-only screen for reviewing and managing user-submitted reports.
 * Displays reports list with filtering by status.
 */

import React, { useState, useCallback, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    Platform,
    StatusBar,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import ReportCard from "../src/components/ReportCard";
import { REPORT_ENDPOINTS } from "../src/config/api";

// Report type
interface Report {
    _id: string;
    title: string;
    description: string;
    status: "pending" | "ongoing" | "solved" | "rejected";
    createdAt: string;
    responses?: any[];
    responseCount?: number;
}

type FilterStatus = "all" | "pending" | "ongoing" | "solved" | "rejected";

export default function AdminDashboardScreen() {
    const router = useRouter();

    // State
    const [activeTab, setActiveTab] = useState<"moderation" | "reports">("reports");
    const [reports, setReports] = useState<Report[]>([]);
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [counts, setCounts] = useState({ pending: 0, ongoing: 0, solved: 0, rejected: 0 });

    // ====================================
    // FETCH REPORTS
    // ====================================
    const fetchReports = useCallback(
        async (showRefreshIndicator = false) => {
            try {
                if (showRefreshIndicator) {
                    setIsRefreshing(true);
                }
                setError(null);

                const url =
                    filterStatus === "all"
                        ? REPORT_ENDPOINTS.GET_ALL
                        : `${REPORT_ENDPOINTS.GET_ALL}?status=${filterStatus}`;

                console.log("📡 Fetching reports from:", url);

                const response = await fetch(url);
                const data = await response.json();

                console.log("📥 Received reports:", data);

                if (data.success) {
                    setReports(data.data || []);
                    setCounts(data.counts || { pending: 0, ongoing: 0, solved: 0, rejected: 0 });
                } else {
                    setError(data.message || "Failed to fetch reports");
                }
            } catch (err) {
                console.error("❌ Fetch error:", err);
                setError("Could not connect to server. Check your connection.");
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [filterStatus]
    );

    // Fetch reports when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchReports();
        }, [fetchReports])
    );

    // Fetch reports when filter status changes
    useEffect(() => {
        fetchReports();
    }, [filterStatus]);

    // Pull to refresh handler
    const onRefresh = () => {
        fetchReports(true);
    };

    // Navigate to report detail
    const handleReportPress = (reportId: string) => {
        router.push(`/report-detail?id=${reportId}`);
    };

    // ====================================
    // RENDER HEADER
    // ====================================
    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
            >
                <Ionicons name="arrow-back" size={24} color="#262626" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    // ====================================
    // RENDER TAB SELECTOR
    // ====================================
    const renderTabs = () => (
        <View style={styles.tabContainer}>
            <TouchableOpacity
                style={[
                    styles.tab,
                    activeTab === "moderation" && styles.tabInactive,
                ]}
                onPress={() => setActiveTab("moderation")}
                disabled
            >
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "moderation" && styles.tabTextInactive,
                    ]}
                >
                    Content Moderation
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.tab, activeTab === "reports" && styles.tabActive]}
                onPress={() => setActiveTab("reports")}
            >
                <Ionicons
                    name="flag"
                    size={16}
                    color={activeTab === "reports" ? "#fff" : "#262626"}
                    style={{ marginRight: 6 }}
                />
                <Text
                    style={[
                        styles.tabText,
                        activeTab === "reports" && styles.tabTextActive,
                    ]}
                >
                    Reports
                </Text>
            </TouchableOpacity>
        </View>
    );

    // ====================================
    // RENDER STATS CARDS
    // ====================================
    // RENDER STATS CARDS
    // ====================================
    const renderStats = () => (
        <View style={styles.statsContainer}>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{counts.pending}</Text>
                <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{counts.ongoing}</Text>
                <Text style={styles.statLabel}>Ongoing</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{counts.solved}</Text>
                <Text style={styles.statLabel}>Solved</Text>
            </View>
            <View style={styles.statCard}>
                <Text style={styles.statNumber}>{counts.rejected}</Text>
                <Text style={styles.statLabel}>Rejected</Text>
            </View>
        </View>
    );

    // ====================================
    // RENDER FILTER BUTTONS
    // ====================================
    const renderFilters = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollContent}
            style={styles.filterScrollView}
        >
            {(["all", "pending", "ongoing", "solved", "rejected"] as FilterStatus[]).map((status) => (
                <TouchableOpacity
                    key={status}
                    style={[
                        styles.filterButton,
                        filterStatus === status && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilterStatus(status)}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.filterText,
                            filterStatus === status && styles.filterTextActive,
                        ]}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    // ====================================
    // RENDER EMPTY STATE
    // ====================================
    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={60} color="#c7c7c7" />
            <Text style={styles.emptyTitle}>No Reports</Text>
            <Text style={styles.emptySubtitle}>
                {filterStatus === "all"
                    ? "There are no reports yet"
                    : `No ${filterStatus} reports`}
            </Text>
        </View>
    );

    // ====================================
    // RENDER ERROR STATE
    // ====================================
    const renderError = () => (
        <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline-outline" size={60} color="#8e8e8e" />
            <Text style={styles.errorTitle}>Connection Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
                style={styles.retryButton}
                onPress={() => fetchReports()}
            >
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
        </View>
    );

    // ====================================
    // RENDER LOADING STATE
    // ====================================
    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                {renderHeader()}
                {renderTabs()}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f9252b" />
                    <Text style={styles.loadingText}>Loading reports...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // ====================================
    // RENDER ERROR
    // ====================================
    if (error && reports.length === 0) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                {renderHeader()}
                {renderTabs()}
                {renderError()}
            </SafeAreaView>
        );
    }

    // ====================================
    // RENDER MAIN CONTENT
    // ====================================
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {renderHeader()}
            {renderTabs()}
            {renderStats()}
            {renderFilters()}

            <FlatList
                style={{ flex: 1 }}
                data={reports}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <ReportCard report={item} onPress={handleReportPress} />
                )}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        colors={["#f9252b"]}
                        tintColor="#f9252b"
                    />
                }
                ListHeaderComponent={null}
                ListEmptyComponent={renderEmpty}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
}

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fafafa",
    },
    // Header
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) + 10 : 10,
        paddingBottom: 12,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#efefef",
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#262626",
    },
    // Tabs
    tabContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: "#fff",
        gap: 8,
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    tabInactive: {
        backgroundColor: "#f5f5f5",
        opacity: 0.5,
    },
    tabActive: {
        backgroundColor: "#f9252b",
        borderColor: "#f9252b",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#262626",
    },
    tabTextInactive: {
        color: "#8e8e8e",
    },
    tabTextActive: {
        color: "#fff",
    },
    // Stats
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingVertical: 16,
        gap: 8,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: "700",
        color: "#f9252b",
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: "#8e8e8e",
    },
    // Filters
    filterScrollView: {
        paddingBottom: 0,
    },
    filterScrollContent: {
        paddingHorizontal: 16,
    },
    filterButton: {
        height: 36,
        paddingHorizontal: 20,
        borderRadius: 18,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e3e3e3",
        marginRight: 8,
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    filterButtonActive: {
        backgroundColor: "#f9252b",
        borderColor: "#f9252b",
    },
    filterText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#262626",
    },
    filterTextActive: {
        color: "#fff",
    },
    // List
    listContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    // Loading
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: "#8e8e8e",
    },
    // Empty State
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#262626",
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: "#8e8e8e",
        textAlign: "center",
    },
    // Error State
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#262626",
        marginTop: 16,
        marginBottom: 8,
    },
    errorText: {
        fontSize: 14,
        color: "#8e8e8e",
        textAlign: "center",
        marginBottom: 20,
    },
    retryButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#457b9d",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        gap: 6,
    },
    retryButtonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "600",
    },
});
