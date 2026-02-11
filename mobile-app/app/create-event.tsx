/**
 * ====================================
 * IIT CONNECT - CREATE EVENT SCREEN
 * ====================================
 * Form for creating new campus events
 * Uses native date/time pickers
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
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { EVENTS_ENDPOINTS } from "../src/config/api";

export default function CreateEventScreen() {
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(new Date());
    const [startTime, setStartTime] = useState(new Date());
    const [endTime, setEndTime] = useState(new Date(Date.now() + 2 * 60 * 60 * 1000)); // +2 hours
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Picker visibility states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    // Track if user has selected values
    const [dateSelected, setDateSelected] = useState(false);
    const [startTimeSelected, setStartTimeSelected] = useState(false);
    const [endTimeSelected, setEndTimeSelected] = useState(false);

    // Format date for display
    const formatDate = (d: Date) => {
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Format time for display
    const formatTime = (d: Date) => {
        return d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Handlers
    const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === "ios");
        if (selectedDate) {
            setDate(selectedDate);
            setDateSelected(true);
        }
    };

    const onStartTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
        setShowStartTimePicker(Platform.OS === "ios");
        if (selectedTime) {
            setStartTime(selectedTime);
            setStartTimeSelected(true);
        }
    };

    const onEndTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
        setShowEndTimePicker(Platform.OS === "ios");
        if (selectedTime) {
            setEndTime(selectedTime);
            setEndTimeSelected(true);
        }
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert("Error", "Please enter an event title");
            return;
        }
        if (!dateSelected) {
            Alert.alert("Error", "Please select a date");
            return;
        }
        if (!startTimeSelected) {
            Alert.alert("Error", "Please select a start time");
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
            const response = await fetch(EVENTS_ENDPOINTS.CREATE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    eventDate: formatDate(date),
                    startTime: formatTime(startTime),
                    endTime: endTimeSelected ? formatTime(endTime) : "",
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
                            setTitle("");
                            setLocation("");
                            setDescription("");
                            setDateSelected(false);
                            setStartTimeSelected(false);
                            setEndTimeSelected(false);
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

                    {/* Date Picker */}
                    <Text style={styles.label}>Date *</Text>
                    <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar-outline" size={20} color="#666" />
                        <Text style={[styles.pickerText, dateSelected && styles.pickerTextSelected]}>
                            {dateSelected ? formatDate(date) : "Select a date"}
                        </Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                            minimumDate={new Date()}
                        />
                    )}

                    {/* Start Time Picker */}
                    <Text style={styles.label}>Start Time *</Text>
                    <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowStartTimePicker(true)}
                    >
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <Text style={[styles.pickerText, startTimeSelected && styles.pickerTextSelected]}>
                            {startTimeSelected ? formatTime(startTime) : "Select start time"}
                        </Text>
                    </TouchableOpacity>
                    {showStartTimePicker && (
                        <DateTimePicker
                            value={startTime}
                            mode="time"
                            display="default"
                            onChange={onStartTimeChange}
                        />
                    )}

                    {/* End Time Picker */}
                    <Text style={styles.label}>End Time</Text>
                    <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => setShowEndTimePicker(true)}
                    >
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <Text style={[styles.pickerText, endTimeSelected && styles.pickerTextSelected]}>
                            {endTimeSelected ? formatTime(endTime) : "Select end time (optional)"}
                        </Text>
                    </TouchableOpacity>
                    {showEndTimePicker && (
                        <DateTimePicker
                            value={endTime}
                            mode="time"
                            display="default"
                            onChange={onEndTimeChange}
                        />
                    )}

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
    pickerButton: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    pickerText: {
        fontSize: 16,
        color: "#999",
    },
    pickerTextSelected: {
        color: "#000",
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
