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
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
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
    const formatDate = (d) => {
        return d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    // Format time for display
    const formatTime = (d) => {
        return d.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Handlers
    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === "ios");
        if (selectedDate) {
            setDate(selectedDate);
            setDateSelected(true);
        }
    };

    const onStartTimeChange = (event, selectedTime) => {
        setShowStartTimePicker(Platform.OS === "ios");
        if (selectedTime) {
            setStartTime(selectedTime);
            setStartTimeSelected(true);
        }
    };

    const onEndTimeChange = (event, selectedTime) => {
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
                        <Text style={styles.headerTitle}>Create Event</Text>
                        <Text style={styles.headerSubtitle}>
                            Add new campus events and activities
                        </Text>
                    </View>
                </View>

                <ScrollView
                    style={styles.formScroll}
                    contentContainerStyle={styles.formContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* ── Section: Event Details ── */}
                    <Text style={styles.sectionTitle}>Event Details</Text>
                    <View style={styles.card}>
                        {/* Title */}
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldIconWrap}>
                                <Ionicons name="create-outline" size={18} color="#e63946" />
                            </View>
                            <View style={styles.fieldContent}>
                                <Text style={styles.label}>Event Title <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Engineering Week Opening"
                                    placeholderTextColor="#bbb"
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={100}
                                />
                            </View>
                        </View>

                        <View style={styles.fieldDivider} />

                        {/* Description */}
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldIconWrap}>
                                <Ionicons name="document-text-outline" size={18} color="#e63946" />
                            </View>
                            <View style={styles.fieldContent}>
                                <Text style={styles.label}>Description <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="What's this event about?"
                                    placeholderTextColor="#bbb"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={4}
                                    textAlignVertical="top"
                                />
                            </View>
                        </View>
                    </View>

                    {/* ── Section: Date & Time ── */}
                    <Text style={styles.sectionTitle}>Date & Time</Text>
                    <View style={styles.card}>
                        {/* Date */}
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldIconWrap}>
                                <Ionicons name="calendar-outline" size={18} color="#e63946" />
                            </View>
                            <View style={styles.fieldContent}>
                                <Text style={styles.label}>Date <Text style={styles.required}>*</Text></Text>
                                <TouchableOpacity
                                    style={styles.pickerButton}
                                    onPress={() => setShowDatePicker(true)}
                                    activeOpacity={0.6}
                                >
                                    <Text style={[styles.pickerText, dateSelected && styles.pickerTextSelected]}>
                                        {dateSelected ? formatDate(date) : "Select a date"}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {showDatePicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                                minimumDate={new Date()}
                            />
                        )}

                        <View style={styles.fieldDivider} />

                        {/* Start Time */}
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldIconWrap}>
                                <Ionicons name="time-outline" size={18} color="#e63946" />
                            </View>
                            <View style={styles.fieldContent}>
                                <Text style={styles.label}>Start Time <Text style={styles.required}>*</Text></Text>
                                <TouchableOpacity
                                    style={styles.pickerButton}
                                    onPress={() => setShowStartTimePicker(true)}
                                    activeOpacity={0.6}
                                >
                                    <Text style={[styles.pickerText, startTimeSelected && styles.pickerTextSelected]}>
                                        {startTimeSelected ? formatTime(startTime) : "Select start time"}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {showStartTimePicker && (
                            <DateTimePicker
                                value={startTime}
                                mode="time"
                                display="default"
                                onChange={onStartTimeChange}
                            />
                        )}

                        <View style={styles.fieldDivider} />

                        {/* End Time */}
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldIconWrap}>
                                <Ionicons name="time-outline" size={18} color="#e63946" />
                            </View>
                            <View style={styles.fieldContent}>
                                <Text style={styles.label}>End Time</Text>
                                <TouchableOpacity
                                    style={styles.pickerButton}
                                    onPress={() => setShowEndTimePicker(true)}
                                    activeOpacity={0.6}
                                >
                                    <Text style={[styles.pickerText, endTimeSelected && styles.pickerTextSelected]}>
                                        {endTimeSelected ? formatTime(endTime) : "Optional"}
                                    </Text>
                                    <Ionicons name="chevron-forward" size={16} color="#ccc" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {showEndTimePicker && (
                            <DateTimePicker
                                value={endTime}
                                mode="time"
                                display="default"
                                onChange={onEndTimeChange}
                            />
                        )}
                    </View>

                    {/* ── Section: Location ── */}
                    <Text style={styles.sectionTitle}>Location</Text>
                    <View style={styles.card}>
                        <View style={styles.fieldRow}>
                            <View style={styles.fieldIconWrap}>
                                <Ionicons name="location-outline" size={18} color="#e63946" />
                            </View>
                            <View style={styles.fieldContent}>
                                <Text style={styles.label}>Venue <Text style={styles.required}>*</Text></Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Main Auditorium, BMICH"
                                    placeholderTextColor="#bbb"
                                    value={location}
                                    onChangeText={setLocation}
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
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={20} color="#fff" />
                        )}
                        <Text style={styles.submitButtonText}>
                            {isLoading ? "Creating Event..." : "Create Event"}
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

    // ── Section ──
    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#999",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 10,
        marginTop: 8,
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
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#555",
        marginBottom: 6,
    },
    required: {
        color: "#e63946",
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
        height: 90,
        lineHeight: 22,
    },

    // ── Picker ──
    pickerButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    pickerText: {
        fontSize: 15,
        color: "#bbb",
        fontWeight: "400",
    },
    pickerTextSelected: {
        color: "#1a1a1a",
    },

    // ── Submit ──
    submitButton: {
        backgroundColor: "#e63946",
        borderRadius: 14,
        paddingVertical: 16,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        marginTop: 6,
        shadowColor: "#e63946",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    submitButtonDisabled: {
        opacity: 0.65,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
});
