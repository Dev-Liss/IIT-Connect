/**
 * ====================================
 * ANONYMOUS REPORT SCREEN
 * ====================================
 * Allows users to submit an anonymous report to the administration.
 * Fields: Title, Category, Description
 */

import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Platform,
    StatusBar,
    ScrollView,
    KeyboardAvoidingView,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { REPORT_ENDPOINTS } from "../src/config/api";

const CATEGORIES = [
    { value: "behavior", label: "Behavior", icon: "person-outline" },
    { value: "safety", label: "Safety", icon: "shield-outline" },
    { value: "academic", label: "Academic", icon: "school-outline" },
    { value: "technical", label: "Technical", icon: "construct-outline" },
    { value: "discrimination", label: "Discrimination", icon: "alert-circle-outline" },
    { value: "other", label: "Other", icon: "ellipsis-horizontal-circle-outline" },
];

export default function AnonymousReportScreen() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("other");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert("Required", "Please enter a report title.");
            return;
        }
        if (!description.trim()) {
            Alert.alert("Required", "Please enter a description.");
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch(REPORT_ENDPOINTS.CREATE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title.trim(), description: description.trim(), category }),
            });
            const data = await response.json();

            if (data.success) {
                Alert.alert(
                    "Report Submitted ✓",
                    "Your report has been submitted anonymously. The administration will review it shortly.",
                    [{ text: "OK", onPress: () => router.back() }]
                );
            } else {
                Alert.alert("Error", data.message || "Failed to submit report.");
            }
        } catch (error) {
            console.error("❌ Submit report error:", error);
            Alert.alert("Error", "Could not connect to server. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#262626" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Anonymous Report</Text>
                <View style={{ width: 32 }} />
            </View>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Notice */}
                    <View style={styles.noticeBox}>
                        <Ionicons name="lock-closed" size={16} color="#1976D2" />
                        <Text style={styles.noticeText}>
                            Your identity is kept completely anonymous. Only administration can view submitted reports.
                        </Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.label}>Report Title <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Safety concern in lab building"
                        placeholderTextColor="#aaa"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={200}
                        editable={!isSubmitting}
                    />
                    <Text style={styles.charCount}>{title.length}/200</Text>

                    {/* Category */}
                    <Text style={styles.label}>Category</Text>
                    <View style={styles.categoryGrid}>
                        {CATEGORIES.map((cat) => (
                            <TouchableOpacity
                                key={cat.value}
                                style={[
                                    styles.categoryChip,
                                    category === cat.value && styles.categoryChipActive,
                                ]}
                                onPress={() => setCategory(cat.value)}
                                disabled={isSubmitting}
                            >
                                <Ionicons
                                    name={cat.icon}
                                    size={15}
                                    color={category === cat.value ? "#fff" : "#555"}
                                />
                                <Text
                                    style={[
                                        styles.categoryChipText,
                                        category === cat.value && styles.categoryChipTextActive,
                                    ]}
                                >
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Description */}
                    <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe the issue in detail..."
                        placeholderTextColor="#aaa"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={6}
                        maxLength={2000}
                        textAlignVertical="top"
                        editable={!isSubmitting}
                    />
                    <Text style={styles.charCount}>{description.length}/2000</Text>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        activeOpacity={0.8}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="send" size={18} color="#fff" />
                                <Text style={styles.submitButtonText}>Submit Report</Text>
                            </>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fafafa" },
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
    backButton: { padding: 4 },
    headerTitle: { fontSize: 17, fontWeight: "600", color: "#262626" },
    scrollContent: { padding: 20, paddingBottom: 40 },

    noticeBox: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#E3F2FD",
        borderRadius: 10,
        padding: 12,
        gap: 8,
        marginBottom: 24,
    },
    noticeText: { flex: 1, fontSize: 13, color: "#1565C0", lineHeight: 18 },

    label: { fontSize: 14, fontWeight: "600", color: "#262626", marginBottom: 8, marginTop: 16 },
    required: { color: "#f9252b" },

    input: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: "#262626",
    },
    textArea: { minHeight: 130, paddingTop: 12 },
    charCount: { fontSize: 11, color: "#bbb", textAlign: "right", marginTop: 4 },

    categoryGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    categoryChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#ddd",
        backgroundColor: "#fff",
    },
    categoryChipActive: {
        backgroundColor: "#f9252b",
        borderColor: "#f9252b",
    },
    categoryChipText: { fontSize: 13, color: "#555", fontWeight: "500" },
    categoryChipTextActive: { color: "#fff" },

    submitButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#f9252b",
        paddingVertical: 15,
        borderRadius: 12,
        marginTop: 28,
    },
    submitButtonDisabled: { opacity: 0.6 },
    submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
