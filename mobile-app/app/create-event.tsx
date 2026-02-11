/**
 * ====================================
 * IIT CONNECT - CREATE EVENT SCREEN
 * ====================================
 * Form for creating new campus events
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
import { EVENTS_ENDPOINTS } from "../src/config/api";

export default function CreateEventScreen() {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        // Validation
        if (!title.trim()) {
            Alert.alert("Error", "Please enter an event title");
            return;
        }
        if (!date.trim()) {
            Alert.alert("Error", "Please enter a date");
            return;
        }
        if (!time.trim()) {
            Alert.alert("Error", "Please enter a time");
            return;
        }
        if (!location.trim()) {
            Alert.alert("Error", "Please enter a location");
            return;
        }
        if (!description.trim()) {
            Alert.alert("Error", "Please enter a description");
            return;
        }

        setIsLoading(true);
        try {
            // Parse time range (e.g., "9:00 AM - 11:00 AM")
            const timeParts = time.split("-").map((t) => t.trim());
            const startTime = timeParts[0] || time.trim();
            const endTime = timeParts[1] || "";

            const response = await fetch(EVENTS_ENDPOINTS.CREATE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    eventDate: date.trim(),
                    startTime: startTime,
                    endTime: endTime,
                    location: location.trim(),
                    category: "academic",
                    organizer: "Admin",
                }),
            });

            const data = await response.json();

            if (data.success) {
                Alert.alert("Success", "Event created successfully!", [
                    {
                        text: "OK",
                        onPress: () => {
                            // Clear form
                            setTitle("");
                            setDate("");
                            setTime("");
                            setLocation("");
                            setDescription("");
                            // Navigate to events page
                            router.replace("/events");
                        },
                    },
                ]);
            } else {
                Alert.alert("Error", data.message || "Failed to create event");
            }
        } catch (error) {
            console.error("Error creating event:", error);
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
                    <Text style={styles.headerTitle}>Create Event</Text>
                </View>
                <Text style={styles.headerSubtitle}>
                    Add new campus events and activities
                </Text>

                <ScrollView style={styles.formContainer}>
                    {/* Event Title */}
                    <Text style={styles.label}>Event Title *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter event title"
                        placeholderTextColor="#999"
                        value={title}
                        onChangeText={setTitle}
                        maxLength={100}
                    />

                    {/* Date */}
                    <Text style={styles.label}>Date *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., December 5, 2024"
                        placeholderTextColor="#999"
                        value={date}
                        onChangeText={setDate}
                    />

                    {/* Time */}
                    <Text style={styles.label}>Time *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 9:00 AM - 11:00 AM"
                        placeholderTextColor="#999"
                        value={time}
                        onChangeText={setTime}
                    />

                    {/* Location */}
                    <Text style={styles.label}>Location *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter event location"
                        placeholderTextColor="#999"
                        value={location}
                        onChangeText={setLocation}
                    />

                    {/* Description */}
                    <Text style={styles.label}>Description *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe the event..."
                        placeholderTextColor="#999"
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={5}
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
                            {isLoading ? "Creating..." : "Create Event"}
                        </Text>
                    </TouchableOpacity>

                    {/* Bottom spacing */}
                    <View style={{ height: 40 }} />
                </ScrollView>
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
});
