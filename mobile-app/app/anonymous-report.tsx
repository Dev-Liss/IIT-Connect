/**
 * ====================================
 * IIT CONNECT - ANONYMOUS REPORT SCREEN
 * ====================================
 * Form for submitting anonymous reports
 * Frontend only - backend to be added later
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function AnonymousReportScreen() {
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = () => {
        if (!subject.trim()) {
            Alert.alert("Error", "Please enter a subject");
            return;
        }
        if (!description.trim()) {
            Alert.alert("Error", "Please enter a detailed description");
            return;
        }

        // TODO: Connect to backend API in next commit
        Alert.alert(
            "Report Submitted",
            "Your anonymous report has been submitted successfully.",
            [
                {
                    text: "OK",
                    onPress: () => {
                        setSubject("");
                        setDescription("");
                        router.back();
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.headerIcon}>
                        <Ionicons name="shield-checkmark" size={24} color="#fff" />
                    </View>
                    <Text style={styles.headerTitle}>Anonymous Report</Text>
                </View>
                <Text style={styles.headerSubtitle}>
                    Report incidents safely and anonymously
                </Text>

                <ScrollView style={styles.formContainer}>
                    {/* Anonymity Info Card */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoHeader}>
                            <Ionicons name="lock-closed-outline" size={20} color="#1d4ed8" />
                            <Text style={styles.infoTitle}>Complete Anonymity Guaranteed</Text>
                            <Ionicons name="eye-off-outline" size={20} color="#1d4ed8" />
                        </View>
                        <View style={styles.infoBullets}>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>No personal data is collected or stored</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Reports are encrypted end-to-end</Text>
                            </View>
                            <View style={styles.bulletRow}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.bulletText}>Your IP address is not logged</Text>
                            </View>
                        </View>
                    </View>

                    {/* Subject Field */}
                    <Text style={styles.label}>Subject *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Brief description of the incident"
                        placeholderTextColor="#999"
                        value={subject}
                        onChangeText={setSubject}
                        maxLength={100}
                    />

                    {/* Detailed Description Field */}
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

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={handleSubmit}
                    >
                        <Ionicons name="send" size={20} color="#fff" />
                        <Text style={styles.submitButtonText}>Submit Report Anonymously</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>

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
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    keyboardView: {
        flex: 1,
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
        marginRight: 12,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#e63946",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
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
        paddingBottom: 15,
        backgroundColor: "#fff",
    },
    formContainer: {
        flex: 1,
        padding: 20,
    },
    infoCard: {
        backgroundColor: "#eff6ff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#bfdbfe",
    },
    infoHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        gap: 8,
    },
    infoTitle: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: "#1e3a5f",
    },
    infoBullets: {
        gap: 6,
    },
    bulletRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 8,
        paddingLeft: 4,
    },
    bullet: {
        fontSize: 14,
        color: "#1e3a5f",
        lineHeight: 20,
    },
    bulletText: {
        fontSize: 14,
        color: "#1e3a5f",
        lineHeight: 20,
        flex: 1,
    },
    label: {
        fontSize: 15,
        fontWeight: "600",
        color: "#000",
        marginBottom: 8,
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        color: "#000",
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    textArea: {
        height: 200,
        textAlignVertical: "top",
        marginBottom: 5,
    },
    charCount: {
        fontSize: 12,
        color: "#999",
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: "#e63946",
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    bottomNav: {
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
