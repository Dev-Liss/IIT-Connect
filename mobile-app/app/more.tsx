/**
 * ====================================
 * IIT CONNECT - MORE SCREEN
 * ====================================
 * Additional features and settings
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

export default function MoreScreen() {
    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>More</Text>
                <Text style={styles.headerSubtitle}>
                    Additional features and settings
                </Text>
            </View>

            {/* Options */}
            <View style={styles.optionsContainer}>
                {/* Anonymous Report */}
                <TouchableOpacity style={styles.optionCard}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="shield-outline" size={28} color="#e63946" />
                    </View>
                    <View style={styles.optionText}>
                        <Text style={styles.optionTitle}>Anonymous Report</Text>
                        <Text style={styles.optionDescription}>
                            Report incidents safely and anonymously
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
                    <Ionicons name="grid" size={24} color="#000" />
                    <Text style={styles.navTextActive}>More</Text>
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
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: "#fff",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#000",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
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
        backgroundColor: "#fef2f2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
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
    navTextActive: {
        fontSize: 11,
        color: "#000",
        fontWeight: "600",
    },
});
