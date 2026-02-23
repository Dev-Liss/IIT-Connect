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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ANNOUNCEMENTS_ENDPOINTS } from "../src/config/api";

export default function CreateAnnouncementScreen() {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        // Validation
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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    source: "Admin", // Default source
                }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert("Success", "Announcement created successfully!", [
                    {
                        text: "OK",
                        onPress: () => {
                            // Clear form
                            setTitle("");
                            setContent("");
                            // Navigate to events page
                            router.replace("/events");
                        }
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
                    <Text style={styles.headerTitle}>Create Announcement</Text>
                </View>
                <Text style={styles.headerSubtitle}>
                    Share important updates with students
                </Text>

                <ScrollView style={styles.formContainer}>
                    {/* Title Field */}
                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter announcement title"
                        placeholderTextColor="#999"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />

                    {/* Content Field */}
                    <Text style={styles.label}>Content *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Write your announcement here..."
                        placeholderTextColor="#999"
                        value={content}
                        onChangeText={setContent}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                    />

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        <Ionicons name="send" size={20} color="#fff" />
                        <Text style={styles.submitButtonText}>
                            {isLoading ? "Sending..." : "Send Announcement"}
                        </Text>
                    </TouchableOpacity>
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
    formContainer: {
        flex: 1,
        padding: 20,
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
        height: 150,
        textAlignVertical: "top",
    },
    submitButton: {
        backgroundColor: "#e63946",
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        marginTop: 10,
    },
    submitButtonDisabled: {
        opacity: 0.7,
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
