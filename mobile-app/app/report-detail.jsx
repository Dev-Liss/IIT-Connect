/**
 * ====================================
 * REPORT DETAIL SCREEN
 * ====================================
 * Shows details of a specific report including status update controls
 * and a response submission form for the admin.
 */

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    Platform,
    StatusBar,
    KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { REPORT_ENDPOINTS } from "../src/config/api";

// Status badge colors
const STATUS_COLORS = {
    pending: { background: "#FFF3E0", text: "#F57C00" },
    ongoing: { background: "#E3F2FD", text: "#1976D2" },
    solved: { background: "#E8F5E9", text: "#388E3C" },
    rejected: { background: "#FFEBEE", text: "#D32F2F" },
};

export default function ReportDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [responseText, setResponseText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null); // chosen status before submit

    // FETCH REPORT DETAILS
    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await fetch(REPORT_ENDPOINTS.GET_BY_ID(id));
                const data = await response.json();
                if (data.success) {
                    setReport(data.data);
                } else {
                    Alert.alert("Error", data.message || "Failed to load report");
                }
            } catch (error) {
                console.error("❌ Fetch error:", error);
                Alert.alert("Error", "Could not connect to server");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchReport();
    }, [id]);

    // When report loads, pre-select its current status
    useEffect(() => {
        if (report && !selectedStatus) {
            setSelectedStatus(report.status);
        }
    }, [report]);

    // SUBMIT — updates status then adds response in one action
    const submitResponse = async () => {
        if (!selectedStatus) {
            Alert.alert("Required", "Please select a status for this report.");
            return;
        }
        if (!responseText.trim()) {
            Alert.alert("Required", "Please enter a response message.");
            return;
        }
        try {
            setIsSubmitting(true);
            const userId = "000000000000000000000001"; // Placeholder

            // 1. Update status
            const statusRes = await fetch(REPORT_ENDPOINTS.UPDATE_STATUS(id), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: selectedStatus }),
            });
            const statusData = await statusRes.json();
            if (!statusData.success) {
                Alert.alert("Error", statusData.message || "Failed to update status");
                return;
            }

            // 2. Add response
            const responseRes = await fetch(REPORT_ENDPOINTS.ADD_RESPONSE(id), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, text: responseText }),
            });
            const responseData = await responseRes.json();
            if (responseData.success) {
                // Go back — admin dashboard re-fetches on focus
                router.back();
            } else {
                Alert.alert("Error", responseData.message || "Failed to send response");
            }
        } catch (error) {
            Alert.alert("Error", "Could not connect to server");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    const headerBlock = (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="#262626" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Report Detail</Text>
            <View style={{ width: 24 }} />
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                {headerBlock}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#f9252b" />
                    <Text style={styles.loadingText}>Loading report...</Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!report) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                {headerBlock}
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Report not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusColor = STATUS_COLORS[report.status] || STATUS_COLORS.pending;
    const responses = report.responses || [];
    const displayTitle = report.title || report.subject || "(No title)";

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {headerBlock}

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* ── Title & Status ── */}
                    <Text style={styles.reportTitle}>{displayTitle}</Text>

                    <View style={[styles.statusBadge, { backgroundColor: statusColor.background }]}>
                        <Text style={[styles.statusText, { color: statusColor.text }]}>
                            {report.status.toUpperCase()}
                        </Text>
                    </View>

                    <Text style={styles.timestamp}>Reported {formatTimeAgo(report.createdAt)}</Text>

                    {/* ── Description ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Description</Text>
                        <Text style={styles.description}>{report.description}</Text>
                    </View>

                    {/* ── Status Selector ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Status <Text style={{ color: "#f9252b" }}>*</Text></Text>
                        <View style={styles.actionsContainer}>
                            {[
                                { value: "ongoing", label: "Ongoing", icon: "play-circle", color: "#1976D2" },
                                { value: "solved", label: "Solved", icon: "checkmark-circle", color: "#388E3C" },
                                { value: "rejected", label: "Reject", icon: "close-circle", color: "#f9252b" },
                                { value: "pending", label: "Pending", icon: "time-outline", color: "#F57C00" },
                            ].map((opt) => {
                                const isSelected = selectedStatus === opt.value;
                                return (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[
                                            styles.actionButton,
                                            {
                                                backgroundColor: isSelected ? opt.color : "#f5f5f5",
                                                borderWidth: 2,
                                                borderColor: isSelected ? opt.color : "#e0e0e0"
                                            },
                                        ]}
                                        onPress={() => setSelectedStatus(opt.value)}
                                        disabled={isSubmitting}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={opt.icon}
                                            size={18}
                                            color={isSelected ? "#fff" : opt.color}
                                        />
                                        <Text style={[
                                            styles.actionButtonText,
                                            { color: isSelected ? "#fff" : opt.color },
                                        ]}>
                                            {opt.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* ── Response History ── */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeaderRow}>
                            <Text style={styles.sectionLabel}>Response History</Text>
                            <View style={styles.responseBadge}>
                                <Text style={styles.responseBadgeText}>{responses.length}</Text>
                            </View>
                        </View>

                        {responses.length === 0 ? (
                            <View style={styles.emptyHistory}>
                                <Ionicons name="chatbubble-outline" size={28} color="#c7c7c7" />
                                <Text style={styles.emptyHistoryText}>No responses yet</Text>
                            </View>
                        ) : (
                            responses.map((res, index) => (
                                <View key={res._id || index} style={styles.responseItem}>
                                    <View style={styles.responseAvatar}>
                                        <Ionicons name="shield-checkmark" size={16} color="#fff" />
                                    </View>
                                    <View style={styles.responseBubble}>
                                        <View style={styles.responseHeader}>
                                            <Text style={styles.responseAuthor}>
                                                {res.user?.username || "Admin"}
                                            </Text>
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

                    {/* ── Add Response ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Add Response</Text>
                        <TextInput
                            style={styles.responseInput}
                            placeholder="Type your response here..."
                            placeholderTextColor="#8e8e8e"
                            multiline
                            numberOfLines={4}
                            value={responseText}
                            onChangeText={setResponseText}
                            editable={!isSubmitting}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!selectedStatus || !responseText.trim() || isSubmitting) && styles.sendButtonDisabled,
                            ]}
                            onPress={submitResponse}
                            disabled={!selectedStatus || !responseText.trim() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="send" size={18} color="#fff" />
                                    <Text style={styles.sendButtonText}>Send Response</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },
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
        padding: 8,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
    },
    headerTitle: { fontSize: 22, fontWeight: "bold", color: "#262626" },
    scrollContent: { padding: 16, paddingBottom: 40 },

    // Report summary card
    reportTitle: { fontSize: 20, fontWeight: "700", color: "#262626", marginBottom: 12, lineHeight: 28 },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 8,
    },
    statusText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
    timestamp: { fontSize: 13, color: "#888", marginBottom: 20 },

    // Card sections — matches KuppiScreen card
    section: {
        backgroundColor: "#f7f7f7",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#f0f0f0",
        boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.08)",
        elevation: 2,
    },
    sectionHeaderRow: { flexDirection: "row", alignItems: "center", marginBottom: 12, gap: 8 },
    sectionLabel: { fontSize: 15, fontWeight: "600", color: "#1a1a1a", marginBottom: 10 },
    responseBadge: {
        backgroundColor: "#f9252b",
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    responseBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

    description: {
        fontSize: 14,
        color: "#555",
        lineHeight: 22,
    },

    // Status action buttons — borderRadius:12 like Kuppi
    actionsContainer: { flexDirection: "row", gap: 8 },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
        gap: 6,
    },
    actionButtonOngoing: { backgroundColor: "#1976D2" },
    actionButtonSolved: { backgroundColor: "#388E3C" },
    actionButtonReject: { backgroundColor: "#f9252b" },
    actionButtonText: { color: "#fff", fontSize: 13, fontWeight: "600" },

    // Response History
    emptyHistory: {
        alignItems: "center",
        paddingVertical: 24,
        borderRadius: 12,
        gap: 8,
    },
    emptyHistoryText: { fontSize: 13, color: "#aaa" },
    responseItem: {
        flexDirection: "row",
        marginBottom: 12,
        gap: 10,
    },
    responseAvatar: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#f9252b",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 2,
    },
    responseBubble: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 12,
        boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.05)",
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
    responseAuthor: { fontSize: 13, fontWeight: "600", color: "#262626" },
    responseTime: { fontSize: 11, color: "#aaa" },
    responseText: { fontSize: 14, color: "#444", lineHeight: 20 },

    // Add Response Input — matches Kuppi modal input
    responseInput: {
        borderWidth: 1,
        borderColor: "#E5E5E5",
        borderRadius: 12,
        padding: 16,
        fontSize: 14,
        color: "#262626",
        backgroundColor: "#fff",
        minHeight: 100,
        textAlignVertical: "top",
        marginBottom: 12,
    },
    sendButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9252b",
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    sendButtonDisabled: { opacity: 0.6 },
    sendButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },

    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 12, fontSize: 14, color: "#888" },
    errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
    errorText: { fontSize: 16, color: "#888" },
});
