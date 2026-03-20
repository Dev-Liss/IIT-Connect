import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CONTENT_REPORT_ENDPOINTS } from "../config/api";

const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} ${diffMins === 1 ? "min" : "mins"} ago`;
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
    if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
    return date.toLocaleDateString();
};

export default function ContentReportCard({ report, onActionComplete }) {
    const target = report.targetId; // populated with Post/Reel data
    const reportedBy = report.reportedBy;
    const mediaUrl = target?.media?.url;

    const handleDismiss = async () => {
        try {
            const response = await fetch(CONTENT_REPORT_ENDPOINTS.DISMISS(report._id), {
                method: "DELETE"
            });
            const data = await response.json();
            if (data.success) {
                onActionComplete();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveContent = async () => {
        try {
            const response = await fetch(CONTENT_REPORT_ENDPOINTS.REMOVE_CONTENT(report._id), {
                method: "DELETE"
            });
            const data = await response.json();
            if (data.success) {
                onActionComplete();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Reported {report.targetType}</Text>
                    <Text style={styles.reportedBy}>
                        By: {reportedBy?.username || "Unknown"} • {formatTimeAgo(report.createdAt)}
                    </Text>
                </View>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{report.reason}</Text>
                </View>
            </View>

            {target ? (
                <View style={styles.contentPreview}>
                    {mediaUrl && (
                        <Image source={{ uri: mediaUrl }} style={styles.mediaPreview} />
                    )}
                    <View style={styles.captionContainer}>
                        <Text style={styles.author}>Author: {target?.user?.username || "Unknown"}</Text>
                        <Text style={styles.caption} numberOfLines={3}>
                            {target.caption || "(No caption)"}
                        </Text>
                    </View>
                </View>
            ) : (
                <Text style={styles.deletedText}>Content already deleted</Text>
            )}

            <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionButton, styles.dismissButton]} onPress={handleDismiss}>
                    <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.removeButton]} onPress={handleRemoveContent}>
                    <Text style={styles.removeButtonText}>Remove Content</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#262626",
    },
    reportedBy: {
        fontSize: 12,
        color: "#8e8e8e",
        marginTop: 2,
    },
    badge: {
        backgroundColor: "#FFEBEE",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 12,
        color: "#D32F2F",
        fontWeight: "500",
    },
    contentPreview: {
        flexDirection: "row",
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
    },
    mediaPreview: {
        width: 60,
        height: 60,
        borderRadius: 6,
        backgroundColor: "#e0e0e0",
    },
    captionContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "center",
    },
    author: {
        fontSize: 13,
        fontWeight: "600",
        color: "#262626",
    },
    caption: {
        fontSize: 13,
        color: "#555",
        marginTop: 4,
    },
    deletedText: {
        fontStyle: "italic",
        color: "#888",
        marginBottom: 16,
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
        width: "48%",
        alignItems: "center",
    },
    dismissButton: {
        backgroundColor: "#f0f0f0",
    },
    removeButton: {
        backgroundColor: "#f9252b",
    },
    dismissButtonText: {
        color: "#262626",
        fontWeight: "600",
        fontSize: 14,
    },
    removeButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
});
