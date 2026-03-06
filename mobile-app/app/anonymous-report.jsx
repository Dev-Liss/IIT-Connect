/**
 * ====================================
 * IIT CONNECT - ANONYMOUS REPORT SCREEN
 * ====================================
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
    SafeAreaView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    FlatList,
    ActivityIndicator,
    StatusBar,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { REPORTS_ENDPOINTS } from "../src/config/api";

const STORAGE_KEY = "@iit_connect_my_report_ids";

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
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
};

// ── Defined OUTSIDE the main component so React never remounts it ──
const ReportItem = ({ item, onPress }) => {
    const statusColor = STATUS_COLORS[item.status] || STATUS_COLORS.pending;
    const responseCount = item.responses?.length ?? 0;
    const hasResponse = responseCount > 0;
    const displayTitle = item.title || item.subject || "(No title)";

    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.75} onPress={() => onPress(item._id)}>
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
            <Text style={styles.cardDescription} numberOfLines={2}>{item.description}</Text>
            <View style={styles.cardFooter}>
                <Ionicons name="time-outline" size={13} color="#aaa" />
                <Text style={styles.cardFooterText}>{formatTimeAgo(item.createdAt)}</Text>
                <View style={{ flex: 1 }} />
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </View>
        </TouchableOpacity>
    );
};

export default function AnonymousReportScreen() {
    const [activeTab, setActiveTab] = useState("send");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [reports, setReports] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

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
        } catch (err) {
            console.error("❌ History fetch error:", err);
        } finally {
            setHistoryLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => { loadHistory(); }, [loadHistory])
    );

    const handleSubmit = async () => {
        if (!subject.trim()) { Alert.alert("Error", "Please enter a subject"); return; }
        if (!description.trim()) { Alert.alert("Error", "Please enter a detailed description"); return; }

        setIsLoading(true);
        try {
            const response = await fetch(REPORTS_ENDPOINTS.CREATE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: subject.trim(), description: description.trim() }),
            });
            const data = await response.json();

            if (data.success) {
                try {
                    const existing = await AsyncStorage.getItem(STORAGE_KEY);
                    const ids = existing ? JSON.parse(existing) : [];
                    ids.push(data.data._id);
                    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
                } catch (e) {
                    console.warn("Could not save report ID locally:", e);
                }
                setSubject("");
                setDescription("");
                Alert.alert(
                    "Report Submitted",
                    "Your anonymous report has been submitted. Track the admin's response under \"My Past Reports\".",
                    [
                        { text: "View My Reports", onPress: () => { loadHistory(); setActiveTab("history"); } },
                        { text: "OK" },
                    ]
                );
            } else {
                Alert.alert("Error", data.message || "Failed to submit report");
            }
        } catch (error) {
            Alert.alert("Error", "Could not connect to server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReportPress = useCallback((id) => {
        router.push({ pathname: "/my-report-detail", params: { id } });
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* ── Header ── */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={styles.headerIconCircle}>
                        <Ionicons name="shield-checkmark" size={18} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>Anonymous Report</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* ── Tab Switcher ── */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "send" && styles.tabActive]}
                    onPress={() => setActiveTab("send")}
                    activeOpacity={0.8}
                >
                    <Ionicons name="send-outline" size={16} color={activeTab === "send" ? "#fff" : "#888"} />
                    <Text style={[styles.tabText, activeTab === "send" && styles.tabTextActive]}>
                        Send Report
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === "history" && styles.tabActive]}
                    onPress={() => { setActiveTab("history"); loadHistory(); }}
                    activeOpacity={0.8}
                >
                    <Ionicons name="time-outline" size={16} color={activeTab === "history" ? "#fff" : "#888"} />
                    <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>
                        My Past Reports
                    </Text>
                    {reports.length > 0 && (
                        <View style={styles.tabBadge}>
                            <Text style={styles.tabBadgeText}>{reports.length}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            {/* ── Section 1: Send Report ── */}
            {activeTab === "send" && (
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        style={styles.sectionScroll}
                        contentContainerStyle={styles.sectionContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Anonymity info */}
                        <View style={styles.infoCard}>
                            <View style={styles.infoHeader}>
                                <Ionicons name="lock-closed-outline" size={20} color="#1d4ed8" />
                                <Text style={styles.infoTitle}>Complete Anonymity Guaranteed</Text>
                                <Ionicons name="eye-off-outline" size={20} color="#1d4ed8" />
                            </View>
                            <View style={styles.infoBullets}>
                                {[
                                    "No personal data is collected or stored",
                                    "Reports are encrypted end-to-end",
                                    "Your IP address is not logged",
                                ].map((txt) => (
                                    <View key={txt} style={styles.bulletRow}>
                                        <Text style={styles.bullet}>•</Text>
                                        <Text style={styles.bulletText}>{txt}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Subject */}
                        <Text style={styles.label}>Subject *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Brief description of the incident"
                            placeholderTextColor="#999"
                            value={subject}
                            onChangeText={setSubject}
                            maxLength={100}
                        />

                        {/* Description */}
                        <Text style={styles.label}>Detailed Description *</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Provide as much detail as you're comfortable sharing. Remember, this is completely anonymous."
                            placeholderTextColor="#999"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={8}
                            textAlignVertical="top"
                        />
                        <Text style={styles.charCount}>{description.length} characters</Text>

                        {/* Submit */}
                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && { opacity: 0.7 }]}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            <Ionicons name="send" size={20} color="#fff" />
                            <Text style={styles.submitButtonText}>
                                {isLoading ? "Submitting…" : "Submit Report Anonymously"}
                            </Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            )}

            {/* ── Section 2: My Past Reports ── */}
            {activeTab === "history" && (
                <>
                    {historyLoading ? (
                        <View style={styles.centeredBox}>
                            <ActivityIndicator size="large" color="#e63946" />
                            <Text style={styles.loadingText}>Loading your reports…</Text>
                        </View>
                    ) : reports.length === 0 ? (
                        <View style={styles.centeredBox}>
                            <View style={styles.emptyIconCircle}>
                                <Ionicons name="document-text-outline" size={36} color="#e63946" />
                            </View>
                            <Text style={styles.emptyTitle}>No Reports Yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Reports you submit will appear here so you can track admin responses.
                            </Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => setActiveTab("send")}
                            >
                                <Ionicons name="add-circle-outline" size={18} color="#fff" />
                                <Text style={styles.emptyButtonText}>Submit a Report</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <FlatList
                            data={reports}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <ReportItem item={item} onPress={handleReportPress} />
                            )}
                            contentContainerStyle={styles.sectionContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={refreshing}
                                    onRefresh={() => loadHistory(true)}
                                    colors={["#e63946"]}
                                    tintColor="#e63946"
                                />
                            }
                        />
                    )}
                </>
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
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center", alignItems: "center",
    },
    headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
    headerIconCircle: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: "#e63946",
        justifyContent: "center", alignItems: "center",
    },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#111" },

    // Tab bar
    tabBar: {
        flexDirection: "row",
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingBottom: 14,
        paddingTop: 10,
        gap: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#efefef",
    },
    tab: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 11,
        borderRadius: 10,
        backgroundColor: "#f0f0f0",
        gap: 6,
    },
    tabActive: { backgroundColor: "#e63946" },
    tabText: { fontSize: 13, fontWeight: "600", color: "#888" },
    tabTextActive: { color: "#fff" },
    tabBadge: {
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 1,
        minWidth: 20,
        alignItems: "center",
    },
    tabBadgeText: { fontSize: 11, fontWeight: "700", color: "#e63946" },

    // Scroll / content
    sectionScroll: { flex: 1 },
    sectionContent: { padding: 16, paddingBottom: 32 },

    // Info card
    infoCard: {
        backgroundColor: "#eff6ff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#bfdbfe",
    },
    infoHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
    infoTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: "#1e3a5f" },
    infoBullets: { gap: 6 },
    bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, paddingLeft: 4 },
    bullet: { fontSize: 14, color: "#1e3a5f", lineHeight: 20 },
    bulletText: { fontSize: 13, color: "#1e3a5f", lineHeight: 20, flex: 1 },

    // Form
    label: { fontSize: 15, fontWeight: "600", color: "#000", marginBottom: 8 },
    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        fontSize: 15,
        color: "#000",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    textArea: { height: 180, textAlignVertical: "top", marginBottom: 5 },
    charCount: { fontSize: 12, color: "#999", marginBottom: 20 },

    submitButton: {
        backgroundColor: "#e63946",
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

    // History cards
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
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
    responsePillText: { color: "#fff", fontSize: 11, fontWeight: "700" },
    cardTitle: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 8, lineHeight: 22 },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginBottom: 10,
    },
    statusText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
    cardDescription: { fontSize: 14, color: "#777", lineHeight: 20, marginBottom: 12 },
    cardFooter: { flexDirection: "row", alignItems: "center", gap: 4 },
    cardFooterText: { fontSize: 12, color: "#aaa" },

    // Loading / empty
    centeredBox: { flex: 1, justifyContent: "center", alignItems: "center", padding: 32 },
    loadingText: { marginTop: 12, fontSize: 14, color: "#888" },
    emptyIconCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: "#fff0f0",
        justifyContent: "center", alignItems: "center",
        marginBottom: 16,
    },
    emptyTitle: { fontSize: 18, fontWeight: "700", color: "#111", marginBottom: 8 },
    emptySubtitle: { fontSize: 13, color: "#888", textAlign: "center", lineHeight: 20, marginBottom: 24 },
    emptyButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#e63946",
        borderRadius: 12,
        paddingVertical: 13,
        paddingHorizontal: 22,
        gap: 8,
    },
    emptyButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
