/**
 * ====================================
 * IIT CONNECT - ANONYMOUS REPORT SCREEN
 * ====================================
 * Styled to match the Academic feature design language.
 * Two tab sections:
 *   1. Send Anonymous Report (form)
 *   2. My Past Reports (list + detail navigation)
 */

import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    FlatList,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REPORTS_ENDPOINTS } from "../src/config/api";

const STORAGE_KEY = "@iit_connect_my_report_ids";
const SEEN_COUNTS_KEY = "@iit_connect_seen_response_counts";

// ── Matches academic COLORS ──
const COLORS = {
    RED: "#f9252b",
    WHITE: "#f7f7f7",
    GREY: "#888",
    LIGHT_GREY: "#e0e0e0",
    TEXT_DARK: "#333",
};

const STATUS_COLORS = {
    pending: { background: "#FFF3E0", text: "#F57C00" },
    ongoing: { background: "#E3F2FD", text: "#1976D2" },
    solved: { background: "#E8F5E9", text: "#388E3C" },
    rejected: { background: "#FFEBEE", text: "#D32F2F" },
};

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

// ── Outside main component to prevent keyboard dismissal ──
const ReportItem = ({ item, onPress, hasNewResponse }) => {
    const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
    const responseCount = item.responses?.length ?? 0;
    const displayTitle = item.title || item.subject || "(No title)";

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => onPress(item._id)}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{displayTitle}</Text>
                {hasNewResponse && (
                    <View style={styles.newDot} />
                )}
            </View>

            <View style={styles.tagRow}>
                <View style={[styles.statusTag, { borderColor: statusColor.text }]}>
                    <Text style={[styles.statusTagText, { color: statusColor.text }]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                </View>
                {responseCount > 0 && (
                    <View style={styles.responseTag}>
                        <Ionicons name="chatbubble" size={11} color={COLORS.RED} />
                        <Text style={styles.responseTagText}>
                            {responseCount} {responseCount === 1 ? "response" : "responses"}
                        </Text>
                    </View>
                )}
            </View>

            <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>

            <View style={styles.cardFooter}>
                <View style={{ flex: 1 }} />
                <Ionicons name="time-outline" size={13} color={COLORS.GREY} />
                <Text style={styles.cardFooterText}>{formatTimeAgo(item.createdAt)}</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.LIGHT_GREY} />
            </View>
        </TouchableOpacity>
    );
};

export default function AnonymousReportScreen() {
    const insets = useSafeAreaInsets();

    const [activeTab, setActiveTab] = useState("send");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [reports, setReports] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [seenCounts, setSeenCounts] = useState({});

    const loadHistory = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setHistoryLoading(true);
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            const ids = stored ? JSON.parse(stored) : [];
            if (ids.length === 0) { setReports([]); return; }
            const res = await fetch(REPORTS_ENDPOINTS.BATCH, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids }),
            });
            const data = await res.json();
            if (data.success) setReports(data.data);
            // Load seen counts
            try {
                const raw = await AsyncStorage.getItem(SEEN_COUNTS_KEY);
                if (raw) setSeenCounts(JSON.parse(raw));
            } catch (e) { /* ignore */ }
        } catch (err) {
            console.error("❌ History fetch error:", err);
        } finally {
            setHistoryLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(useCallback(() => { loadHistory(); }, [loadHistory]));

    const handleSubmit = async () => {
        if (!subject.trim()) { Alert.alert("Error", "Please enter a subject"); return; }
        if (!description.trim()) { Alert.alert("Error", "Please enter a detailed description"); return; }

        setIsLoading(true);
        try {
            const res = await fetch(REPORTS_ENDPOINTS.CREATE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: subject.trim(), description: description.trim() }),
            });
            const data = await res.json();

            if (data.success) {
                try {
                    const existing = await AsyncStorage.getItem(STORAGE_KEY);
                    const ids = existing ? JSON.parse(existing) : [];
                    ids.push(data.data._id);
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
                } catch (e) { console.warn("Could not save report ID:", e); }

                setSubject("");
                setDescription("");
                Alert.alert(
                    "Report Submitted",
                    "Your anonymous report has been submitted successfully.",
                    [
                        { text: "View My Reports", onPress: () => { loadHistory(); setActiveTab("history"); } },
                        { text: "OK" },
                    ]
                );
            } else {
                Alert.alert("Error", data.message || "Failed to submit report");
            }
        } catch {
            Alert.alert("Error", "Could not connect to server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReportPress = useCallback((id) => {
        router.push({ pathname: "/my-report-detail", params: { id } });
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* ── Header Block (matches academic.jsx headerBlock) ── */}
            <View style={[styles.headerBlock, { paddingTop: insets.top + 10 }]}>
                <View style={styles.titleRow}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={22} color={COLORS.TEXT_DARK} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Anonymous Report</Text>
                    <View style={{ width: 38 }} />
                </View>

                {/* ── Tab Pills (matches AcademicNavBar exactly) ── */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        onPress={() => setActiveTab("send")}
                        activeOpacity={0.8}
                        style={[styles.tabButton, activeTab === "send" ? styles.tabButtonActive : styles.tabButtonInactive]}
                    >
                        <Text style={[styles.tabText, activeTab === "send" ? styles.tabTextActive : styles.tabTextInactive]}>
                            Send Report
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { setActiveTab("history"); loadHistory(); }}
                        activeOpacity={0.8}
                        style={[styles.tabButton, activeTab === "history" ? styles.tabButtonActive : styles.tabButtonInactive]}
                    >
                        <Text style={[styles.tabText, activeTab === "history" ? styles.tabTextActive : styles.tabTextInactive]}>
                            My Past Reports
                        </Text>
                        {reports.length > 0 && (
                            <View style={styles.tabCount}>
                                <Text style={styles.tabCountText}>{reports.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* ══════════════════════════════════════
                SECTION 1 — Send Report
            ══════════════════════════════════════ */}
            {activeTab === "send" && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        style={styles.content}
                        contentContainerStyle={styles.contentPadding}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Info card */}
                        <View style={styles.infoCard}>
                            <View style={styles.infoCardRow}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="lock-closed" size={20} color={COLORS.GREY} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.infoTitle}>Complete Anonymity Guaranteed</Text>
                                    <Text style={styles.infoSub}>Your identity is fully protected</Text>
                                </View>
                            </View>
                            <View style={styles.separator} />
                            {[
                                { icon: "shield-checkmark-outline", text: "No personal data is collected or stored" },
                                { icon: "key-outline", text: "Reports are encrypted end-to-end" },
                                { icon: "eye-off-outline", text: "Your IP address is not logged" },
                            ].map(({ icon, text }) => (
                                <View key={text} style={styles.bulletRow}>
                                    <Ionicons name={icon} size={15} color={COLORS.GREY} />
                                    <Text style={styles.bulletText}>{text}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Subject */}
                        <Text style={styles.label}>Subject</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Brief description of the incident"
                            placeholderTextColor={COLORS.GREY}
                            value={subject}
                            onChangeText={setSubject}
                            maxLength={100}
                        />

                        {/* Description */}
                        <Text style={styles.label}>Detailed Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Provide as much detail as you're comfortable sharing. This is completely anonymous."
                            placeholderTextColor={COLORS.GREY}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={7}
                            textAlignVertical="top"
                        />
                        <Text style={styles.charCount}>{description.length} characters</Text>

                        {/* Submit */}
                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            <Ionicons name="send" size={16} color="#fff" />
                            <Text style={styles.submitButtonText}>
                                {isLoading ? "Submitting…" : "Submit Report Anonymously"}
                            </Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            )}

            {/* ══════════════════════════════════════
                SECTION 2 — My Past Reports
            ══════════════════════════════════════ */}
            {activeTab === "history" && (
                <>
                    {historyLoading ? (
                        <View style={styles.centered}>
                            <ActivityIndicator size="large" color={COLORS.RED} />
                        </View>
                    ) : reports.length === 0 ? (
                        <ScrollView
                            contentContainerStyle={styles.emptyContainer}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={() => loadHistory(true)} colors={[COLORS.RED]} />
                            }
                        >
                            <View style={styles.iconCircleLarge}>
                                <Ionicons name="document-text-outline" size={36} color={COLORS.GREY} />
                            </View>
                            <Text style={styles.emptyTitle}>No Reports Yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Reports you submit will appear here so you can track admin responses.
                            </Text>
                            <TouchableOpacity style={styles.emptyButton} onPress={() => setActiveTab("send")}>
                                <Text style={styles.emptyButtonText}>Submit a Report</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    ) : (
                        <FlatList
                            data={reports}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => {
                                const currentCount = item.responses?.length ?? 0;
                                const lastSeen = seenCounts[item._id] ?? 0;
                                return <ReportItem item={item} onPress={handleReportPress} hasNewResponse={currentCount > lastSeen} />;
                            }}
                            style={styles.content}
                            contentContainerStyle={styles.contentPadding}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={() => loadHistory(true)} colors={[COLORS.RED]} />
                            }
                        />
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    // Header block — mirrors academic.jsx headerBlock
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
        paddingBottom: 8,
    },
    backButton: {
        padding: 8,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#262626",
    },

    // Tab bar — mirrors AcademicNavBar exactly
    tabBar: {
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: 16,
        marginTop: 10,
        marginBottom: 10,
        height: 50,
        alignItems: "center",
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 4,
        flexDirection: "row",
        gap: 6,
    },
    tabButtonActive: { backgroundColor: COLORS.RED },
    tabButtonInactive: { backgroundColor: COLORS.WHITE },
    tabText: { fontWeight: "600", fontSize: 14 },
    tabTextActive: { color: "#fff" },
    tabTextInactive: { color: "#777" },
    tabCount: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 1,
        minWidth: 20,
        alignItems: "center",
    },
    tabCountText: { fontSize: 11, fontWeight: "700", color: COLORS.RED },

    // Content
    content: { flex: 1, backgroundColor: "#fff" },
    contentPadding: { padding: 16, paddingBottom: 60 },

    // Info card — matches KuppiScreen card style
    infoCard: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#f0f0f0",
        boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.08)",
        elevation: 2,
    },
    infoCardRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
    iconCircle: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: "#F9F9F9",
        justifyContent: "center", alignItems: "center",
    },
    infoTitle: { fontSize: 15, fontWeight: "bold", color: COLORS.TEXT_DARK, marginBottom: 2 },
    infoSub: { fontSize: 13, color: COLORS.GREY },
    separator: { height: 1, backgroundColor: "#eee", marginBottom: 12 },
    bulletRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
    bulletText: { fontSize: 14, color: "#555", flex: 1 },

    // Form
    label: {
        fontWeight: "600",
        marginBottom: 8,
        fontSize: 15,
        color: "#1a1a1a",
    },
    input: {
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        backgroundColor: "#FFFFFF",
        fontSize: 16,
        color: COLORS.TEXT_DARK,
    },
    textArea: { height: 160, textAlignVertical: "top", marginBottom: 6 },
    charCount: { fontSize: 12, color: COLORS.GREY, marginBottom: 20, textAlign: "right" },

    // Submit button — matches createSubmitButton
    submitButton: {
        backgroundColor: COLORS.RED,
        flexDirection: "row",
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
    },
    submitButtonText: { fontWeight: "bold", color: "#fff", fontSize: 16 },

    // Report card — matches KuppiScreen card
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
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: "bold",
        color: COLORS.TEXT_DARK,
        flex: 1,
        marginRight: 8,
    },
    newDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.RED,
        position: "absolute",
        top: 12,
        right: 12,
    },
    tagRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
    statusTag: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    statusTagText: { fontSize: 12, fontWeight: "600" },
    responseTag: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: COLORS.RED,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
        gap: 4,
    },
    responseTagText: { color: COLORS.RED, fontSize: 12, fontWeight: "600" },
    cardDescription: { fontSize: 14, color: "#555", lineHeight: 20, marginBottom: 12 },
    cardFooter: { flexDirection: "row", alignItems: "center", gap: 5 },
    cardFooterText: { fontSize: 13, color: COLORS.GREY },

    // Loading / empty
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 40, minHeight: 400 },
    iconCircleLarge: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: COLORS.WHITE,
        justifyContent: "center", alignItems: "center",
        borderWidth: 1, borderColor: "#f0f0f0",
        marginBottom: 16,
    },
    emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#262626", marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: COLORS.GREY, textAlign: "center", lineHeight: 22, marginBottom: 24 },
    emptyButton: {
        backgroundColor: COLORS.RED,
        borderRadius: 20,
        paddingVertical: 13,
        paddingHorizontal: 28,
    },
    emptyButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});
