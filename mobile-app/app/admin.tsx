/**
 * ====================================
 * IIT CONNECT - ADMIN PANEL SCREEN
 * ====================================
 * Admin panel for creating events and announcements
 */

import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AdminPanelScreen() {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.replace("/events")}
                >
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Admin Panel</Text>
            </View>
            <Text style={styles.headerSubtitle}>
                Choose what you'd like to create
            </Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {/* Create Announcement */}
                <TouchableOpacity
                    style={styles.optionCard}
                    onPress={() => router.push("/create-announcement")}
                >
                    <View style={[styles.iconContainer, styles.iconRed]}>
                        <Ionicons name="megaphone" size={28} color="#fff" />
                    </View>
                    <View style={styles.optionText}>
                        <Text style={styles.optionTitle}>Create Announcement</Text>
                        <Text style={styles.optionDescription}>
                            Share important updates and notices with students
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Create Event */}
                <TouchableOpacity style={styles.optionCard}>
                    <View style={[styles.iconContainer, styles.iconBlue]}>
                        <Ionicons name="calendar" size={28} color="#fff" />
                    </View>
                    <View style={styles.optionText}>
                        <Text style={styles.optionTitle}>Create Event</Text>
                        <Text style={styles.optionDescription}>
                            Add new campus events and activities
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="book-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Academic</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="grid-outline" size={24} color="#666" />
                    <Text style={styles.navText}>More</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="chatbubble-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Message</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 5,
        backgroundColor: "#fff",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#666",
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: "#fff",
    },
    optionsContainer: {
        padding: 20,
        gap: 15,
    },
    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    iconRed: {
        backgroundColor: "#e63946",
    },
    iconBlue: {
        backgroundColor: "#3b82f6",
    },
    optionText: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#000",
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    bottomNav: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingBottom: 25,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        justifyContent: "space-around",
    },
    navItem: {
        alignItems: "center",
        gap: 4,
    },
    navText: {
        fontSize: 11,
        color: "#666",
    },
});
