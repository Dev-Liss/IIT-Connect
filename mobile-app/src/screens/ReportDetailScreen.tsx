/**
 * REPORT DETAIL SCREEN
 * Lecturer screen for reviewing a specific report,
 * updating its status, and submitting responses.
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
import { REPORT_ENDPOINTS } from "../config/api";

// Status badge colors
const STATUS_COLORS = {
    pending: { background: "#FFF3E0", text: "#F57C00" },
    ongoing: { background: "#E3F2FD", text: "#1976D2" },
    solved: { background: "#E8F5E9", text: "#388E3C" },
    rejected: { background: "#FFEBEE", text: "#D32F2F" },
};

interface Report {
    _id: string;
    title: string;
    description: string;
    status: "pending" | "ongoing" | "solved" | "rejected";
    createdAt: string;
    responses?: any[];
}

export default function ReportDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // State
    const [report, setReport] = useState<Report | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [responseText, setResponseText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // FETCH REPORT DETAILS

    useEffect(() => {
        const fetchReport = async () => {
            try {
                console.log("📡 Fetching report:", id);
                const response = await fetch(REPORT_ENDPOINTS.GET_BY_ID(id as string));
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

        if (id) {
            fetchReport();
        }
    }, [id]);

    // UPDATE REPORT STATUS

    const updateStatus = async (newStatus: "ongoing" | "solved" | "rejected") => {
        try {
            setIsSubmitting(true);

            const response = await fetch(REPORT_ENDPOINTS.UPDATE_STATUS(id as string), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (data.success) {
                setReport(data.data);
                Alert.alert("Success", `Report marked as ${newStatus}`);
            } else {
                Alert.alert("Error", data.message || "Failed to update status");
            }
        } catch (error) {
            console.error("❌ Update status error:", error);
            Alert.alert("Error", "Could not update status");
        } finally {
            setIsSubmitting(false);
        }
    };

    // SUBMIT RESPONSE

    const submitResponse = async () => {
        if (!responseText.trim()) {
            Alert.alert("Error", "Please enter a response message");
            return;
        }

        try {
            setIsSubmitting(true);

            // TODO: Get actual user ID from auth context
            const userId = "000000000000000000000001"; // Placeholder

            const response = await fetch(REPORT_ENDPOINTS.ADD_RESPONSE(id as string), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    text: responseText,
                }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert("Success", "Response sent successfully", [
                    {
                        text: "OK",
                        onPress: () => router.back(),
                    },
                ]);
                setResponseText("");
            } else {
                Alert.alert("Error", data.message || "Failed to send response");
            }
        } catch (error) {
            console.error("❌ Submit response error:", error);
            Alert.alert("Error", "Could not send response");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format time ago
    const formatTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffHours < 1) return "just now";
        if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
        return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    };

    // LOADING STATE

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
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
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Report not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    const statusColor = STATUS_COLORS[report.status];

    // RENDER MAIN CONTENT

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
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

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Report Title */}
                    <Text style={styles.reportTitle}>{report.title}</Text>

                    {/* Status Badge */}
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: statusColor.background },
                        ]}
                    >
                        <Text style={[styles.statusText, { color: statusColor.text }]}>
                            {report.status}
                        </Text>
                    </View>

                    {/* Timestamp */}
                    <Text style={styles.timestamp}>
                        Reported {formatTimeAgo(report.createdAt)}
                    </Text>

                    {/* Description Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Description</Text>
                        <Text style={styles.description}>{report.description}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonOngoing]}
                            onPress={() => updateStatus("ongoing")}
                            disabled={isSubmitting}
                        >
                            <Ionicons name="play-circle" size={18} color="#fff" />
                            <Text style={styles.actionButtonText}>Mark Ongoing</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonSolved]}
                            onPress={() => updateStatus("solved")}
                            disabled={isSubmitting}
                        >
                            <Ionicons name="checkmark-circle" size={18} color="#fff" />
                            <Text style={styles.actionButtonText}>Mark Solved</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.actionButtonReject]}
                            onPress={() => updateStatus("rejected")}
                            disabled={isSubmitting}
                        >
                            <Ionicons name="close-circle" size={18} color="#fff" />
                            <Text style={styles.actionButtonText}>Reject</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Response Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>
                            Add Response (Anonymous to Reporter)
                        </Text>
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
                                isSubmitting && styles.sendButtonDisabled,
                            ]}
                            onPress={submitResponse}
                            disabled={isSubmitting}
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

// STYLES

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
    // Content
    scrollContent: {
        padding: 16,
    },
    reportTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#262626",
        marginBottom: 12,
        lineHeight: 28,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        marginBottom: 8,
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
        textTransform: "lowercase",
    },
    timestamp: {
        fontSize: 13,
        color: "#8e8e8e",
        marginBottom: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#262626",
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: "#8e8e8e",
        lineHeight: 22,
        backgroundColor: "#f5f5f5",
        padding: 16,
        borderRadius: 8,
    },
    // Action Buttons
    actionsContainer: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 24,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 8,
        gap: 6,
    },
    actionButtonOngoing: {
        backgroundColor: "#1976D2",
    },
    actionButtonSolved: {
        backgroundColor: "#388E3C",
    },
    actionButtonReject: {
        backgroundColor: "#f9252b",
    },
    actionButtonText: {
        color: "#fff",
        fontSize: 13,
        fontWeight: "600",
    },
    // Response Input
    responseInput: {
        backgroundColor: "#fff",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        fontSize: 14,
        color: "#262626",
        minHeight: 100,
        textAlignVertical: "top",
        marginBottom: 12,
    },
    sendButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9252b",
        paddingVertical: 14,
        borderRadius: 8,
        gap: 8,
    },
    sendButtonDisabled: {
        opacity: 0.6,
    },
    sendButtonText: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "600",
    },
    // Loading/Error
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
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        fontSize: 16,
        color: "#8e8e8e",
    },
});
