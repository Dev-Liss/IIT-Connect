/**
 * ==================================== 
 * REPORT CARD COMPONENT
 * ====================================
 * Displays a summary card for a report in the admin dashboard.
 * Shows title, description, status badge, response count, and timestamp.
 */

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

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

interface Report {
    _id: string;
    title: string;
    description: string;
    status: "pending" | "ongoing" | "solved" | "rejected";
    createdAt: string;
    responses?: any[];
    responseCount?: number;
}

interface ReportCardProps {
    report: Report;
    onPress: (reportId: string) => void;
}

// Helper function to format "time ago"
const formatTimeAgo = (dateString: string): string => {
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

export default function ReportCard({ report, onPress }: ReportCardProps) {
    const statusColor = STATUS_COLORS[report.status];
    const responseCount = report.responseCount || report.responses?.length || 0;

    return (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => onPress(report._id)}
        >
            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
                {report.title}
            </Text>

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

            {/* Description (truncated) */}
            <Text style={styles.description} numberOfLines={2}>
                {report.description}
            </Text>

            {/* Footer: Response count | Time ago */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {responseCount} {responseCount === 1 ? "response" : "responses"}
                </Text>
                <Text style={styles.footerText}>•</Text>
                <Text style={styles.footerText}>{formatTimeAgo(report.createdAt)}</Text>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    title: {
        fontSize: 16,
        fontWeight: "600",
        color: "#262626",
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
        fontSize: 12,
        fontWeight: "600",
        textTransform: "lowercase",
    },
    description: {
        fontSize: 14,
        color: "#8e8e8e",
        lineHeight: 20,
        marginBottom: 12,
    },
    footer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    footerText: {
        fontSize: 13,
        color: "#8e8e8e",
    },
});
