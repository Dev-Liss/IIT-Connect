/**
 * ====================================
 * REPORT CARD COMPONENT
 * ====================================
 * Displays a summary card for a report in the admin dashboard.
 * Shows title, description, status badge, response count, and timestamp.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Status badge colors
const STATUS_COLORS = {
    pending: {
        background: "#FFF3E0",
        text: "#F57C00",
    },
    ongoing: {
        background: "#E3F2FD",
        text: "#1976D2",
    },
    solved: {
        background: "#E8F5E9",
        text: "#388E3C",
    },
    rejected: {
        background: "#FFEBEE",
        text: "#D32F2F",
    },
};

// Helper function to format "time ago"
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

export default function ReportCard({ report, onPress }) {
    const statusColor = STATUS_COLORS[report.status] || STATUS_COLORS.pending;
    const responseCount = report.responseCount || report.responses?.length || 0;
    const displayTitle = report.title || report.subject || "(No title)";

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => onPress(report._id)}
        >
            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
                {displayTitle}
            </Text>

            <View
                style={[
                    styles.statusBadge,
                    { borderColor: statusColor.text },
                ]}
            >
                <Text style={[styles.statusText, { color: statusColor.text }]}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </Text>
            </View>

            {/* Description (truncated) */}
            <Text style={styles.description} numberOfLines={2}>
                {report.description}
            </Text>

            {/* Footer */}
            <View style={styles.footer}>
                <Ionicons name="chatbubble-outline" size={13} color="#888" />
                <Text style={styles.footerText}>
                    {responseCount} {responseCount === 1 ? "response" : "responses"}
                </Text>
                <Text style={styles.footerText}>•</Text>
                <Text style={styles.footerText}>{formatTimeAgo(report.createdAt)}</Text>
                <View style={{ flex: 1 }} />
                <Ionicons name="chevron-forward" size={16} color="#e0e0e0" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#f7f7f7",
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        marginVertical: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    title: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
        lineHeight: 22,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    description: {
        fontSize: 14,
        color: "#555",
        lineHeight: 20,
        marginBottom: 12,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    footerText: {
        fontSize: 13,
        color: "#888",
    },
});
