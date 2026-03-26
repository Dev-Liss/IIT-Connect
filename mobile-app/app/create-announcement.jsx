/**
 * ====================================
 * IIT CONNECT - CREATE ANNOUNCEMENT SCREEN
 * ====================================
 * Form for creating new announcements
 */

import React, { useState } from "react";
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
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ANNOUNCEMENTS_ENDPOINTS } from "../src/config/api";

export default function CreateAnnouncementScreen() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert("Error", "Please enter a title");
            return;
        }
        if (!content.trim()) {
            Alert.alert("Error", "Please enter content");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(ANNOUNCEMENTS_ENDPOINTS.CREATE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    source: "Admin",
                }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert("Success", "Announcement created successfully!", [
                    {
                        text: "OK",
                        onPress: () => {
                            setTitle("");
                            setContent("");
                            router.replace("/events");
                        },
                    },
                ]);
            } else {
                Alert.alert("Error", data.message || "Failed to create announcement");
            }
        } catch (error) {
            console.error("Error creating announcement:", error);
            Alert.alert("Error", "Could not connect to server. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                {/* ── Header ── */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={22} color="#1a1a1a" />
                    </TouchableOpacity>
                    <View style={styles.headerTextWrap}>
                        <Text style={styles.headerTitle}>New Announcement</Text>
                        <Text style={styles.headerSubtitle}>
                            Share important updates with students
                        </Text>
                    </View>
                </View>

                <ScrollView
                    style={styles.formScroll}
                    contentContainerStyle={styles.formContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Info Banner ── */}
                    <View style={styles.infoBanner}>
                        <Ionicons name="information-circle" size={18} color="#e63946" />
                        <Text style={styles.infoBannerText}>
                            This announcement will be visible to all students on campus.
                        </Text>
                    </View>

                    {/* ── Section: Announcement Details ── */}
                    <Text style={styles.sectionTitle}>Announcement Details</Text>
                    <View style={styles.card}>
                        {/* Title */}
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldIconWrap}>
                                <Ionicons name="megaphone-outline" size={18} color="#e63946" />
                            </View>
                            <View style={styles.fieldContent}>
                                <View style={styles.labelRow}>
                                    <Text style={styles.label}>Title <Text style={styles.required}>*</Text></Text>
                                    <Text style={styles.charCount}>{title.length}/100</Text>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Exam Schedule Released"
                                    placeholderTextColor="#bbb"
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={100}
                                />
                            </View>
                        </View>

                        <View style={styles.fieldDivider} />

                        {/* Content */}
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldIconWrap}>
                                <Ionicons name="document-text-outline" size={18} color="#e63946" />
                            </View>
                            <View style={styles.fieldContent}>
                                <View style={styles.labelRow}>
                                    <Text style={styles.label}>Content <Text style={styles.required}>*</Text></Text>
                                    <Text style={styles.charCount}>{content.length} chars</Text>
                                </View>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Write your announcement here..."
                                    placeholderTextColor="#bbb"
                                    value={content}
                                    onChangeText={setContent}
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>
                    </View>

                    {/* ── Submit Button ── */}
                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                        activeOpacity={0.85}
                    >
                        {isLoading && (
                            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />
                        )}
                        <Text style={styles.submitButtonText}>
                            {isLoading ? "Sending..." : "Send Announcement"}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: 50 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    keyboardView: {
        flex: 1,
    },

    // ── Header ──
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 44) + 8 : 8,
        paddingHorizontal: 18,
        paddingBottom: 18,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    backButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "#F4F5F7",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 14,
    },
    headerTextWrap: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 21,
        fontWeight: "700",
        color: "#1a1a1a",
        letterSpacing: 0.2,
    },
    headerSubtitle: {
        fontSize: 13,
        color: "#999",
        marginTop: 2,
    },

    // ── Form ──
    formScroll: {
        flex: 1,
    },
    formContainer: {
        padding: 18,
    },

    // ── Info Banner ──
    infoBanner: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#FFF1F2",
        borderRadius: 12,
        padding: 12,
        marginBottom: 20,
        gap: 8,
    },
    infoBannerText: {
        flex: 1,
        fontSize: 13,
        color: "#e63946",
        lineHeight: 18,
        fontWeight: "500",
    },

    // ── Section ──
    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#999",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 10,
        marginTop: 4,
        marginLeft: 4,
    },

    // ── Card ──
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 6,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },

    // ── Field Row ──
    fieldRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        paddingVertical: 12,
        paddingHorizontal: 12,
    },
    fieldIconWrap: {
        width: 34,
        height: 34,
        borderRadius: 10,
        backgroundColor: "#FFF1F2",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
        marginTop: 2,
    },
    fieldContent: {
        flex: 1,
    },
    fieldDivider: {
        height: 1,
        backgroundColor: "#F5F5F5",
        marginLeft: 58,
    },

    // ── Labels ──
    labelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 6,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#555",
    },
    required: {
        color: "#e63946",
    },
    charCount: {
        fontSize: 11,
        color: "#bbb",
        fontWeight: "500",
    },

    // ── Input ──
    input: {
        fontSize: 15,
        color: "#1a1a1a",
        padding: 0,
        margin: 0,
        fontWeight: "400",
    },
    textArea: {
        height: 130,
        lineHeight: 22,
    },

    // ── Submit ──
    submitButton: {
        backgroundColor: "#e63946",
        borderRadius: 50,
        paddingVertical: 18,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#e63946",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 14,
        elevation: 8,
    },
    submitButtonDisabled: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.6,
    },
});
