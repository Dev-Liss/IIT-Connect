import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    RefreshControl,
    Linking,
    Animated, // Add Animated
    Platform,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { KUPPI_ENDPOINTS } from "../config/api";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Constants
const COLORS = {
    RED: "#f9252b",
    WHITE: "#f7f7f7",
    GREEN: "#4CAF50",
    GREY: "#888",
    LIGHT_GREY: "#e0e0e0",
    TEXT_DARK: "#333",
};

// Types
export interface KuppiSession {
    _id: string;
    title: string;
    subject: string;
    date: string;
    time: string;
    location: string;
    maxAttendees: number;
    about: string;
    organizer: { _id: string; username: string } | string;
    attendees: (string | { _id: string })[];
    createdAt: string;
    sessionMode: "Online" | "Physical";
    meetingLink?: string;
    dateTime: string; // ISO Date string from backend
}

interface KuppiScreenProps {
    scrollY: Animated.Value;
}

export default function KuppiScreen({ scrollY }: KuppiScreenProps) {
    // Removed snapToHeader logic as header is now fixed
    const [sessions, setSessions] = useState<KuppiSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date()); // For live updates

    // Date Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Modal States
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedSession, setSelectedSession] = useState<KuppiSession | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        subject: "",
        date: "", // Display string
        time: "", // Display string
        dateTime: new Date(), // Actual Date object
        location: "",
        maxAttendees: "",
        about: "",
        sessionMode: "Physical" as "Online" | "Physical",
        meetingLink: "",
    });

    // Mock User ID (Using a valid MongoDB ObjectId to prevent CastErrors)
    const CURRENT_USER_ID = "69803c6732b6bf165d609ee0"; // TODO: updates this with real user ID from context/storage

    const { user } = useAuth(); // Get user from context

    useFocusEffect(
        React.useCallback(() => {
            fetchSessions();
            // Update time every minute to trigger re-renders for expiration
            const interval = setInterval(() => {
                setCurrentTime(new Date());
            }, 60000); // 1 minute
            return () => clearInterval(interval);
        }, [])
    );

    const fetchSessions = async () => {
        try {
            const response = await axios.get(KUPPI_ENDPOINTS.GET_ALL);
            setSessions(response.data);
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchSessions();
    }, []);

    const handleCreateSession = async () => {
        if (!formData.title || !formData.subject) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        // Validate Date is in future
        if (formData.dateTime <= new Date()) {
            Alert.alert("Error", "Cannot create a session in the past!");
            return;
        }

        if (formData.sessionMode === "Online" && !formData.meetingLink) {
            Alert.alert("Error", "Please provide a meeting link for online sessions");
            return;
        }
        if (formData.sessionMode === "Physical" && !formData.location) {
            Alert.alert("Error", "Please provide a location for physical sessions");
            return;
        }

        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('token');
            await axios.post(KUPPI_ENDPOINTS.CREATE, {
                ...formData,
                maxAttendees: parseInt(formData.maxAttendees) || 10,
                // organizer: CURRENT_USER_ID, -- Handled by backend from token
                sessionMode: formData.sessionMode,
                meetingLink: formData.meetingLink,
                dateTime: formData.dateTime.toISOString(), // Send ISO string
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCreateModalVisible(false);
            setFormData({
                title: "",
                subject: "",
                date: "",
                time: "",
                dateTime: new Date(),
                location: "",
                maxAttendees: "",
                about: "",
                sessionMode: "Physical",
                meetingLink: "",
            });
            fetchSessions(); // Refresh list
            Alert.alert("Success", "Session created successfully!");
        } catch (error: any) {
            console.error("Error creating session:", error);
            const errorMessage = error.response?.data?.msg || error.message || "Failed to create session";
            Alert.alert("Error", `Failed completely: ${errorMessage} (Status: ${error.response?.status})`);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSession = async (session: KuppiSession) => {
        if (!user) {
            Alert.alert("Error", "You must be logged in to join.");
            return;
        }
        try {
            const token = await AsyncStorage.getItem('token');
            // Endpoint handles adding user via token or body. sending body just in case if backend legacy
            // But main thing is updated backend uses param id and token user.
            // Backend route: router.post("/join/:id", ... which uses req.user or req.body.userId)
            // Wait, I didn't update "join" route in backend to use "protect". 
            // The user didn't ask me to update "join" route in backend, only "create" and "my-sessions".
            // But I should probably send userId in body as fallback if I didn't protect it, 
            // OR best practice: use token. 
            // Existing backend join: router.post("/join/:id", ...) checks req.user ? req.user.id : req.body.userId.
            // So if I don't use protect middleware on join route, req.user is undefined.
            // So I MUST send userId in body.

            await axios.post(KUPPI_ENDPOINTS.JOIN(session._id), { userId: user.id }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update local state immediately
            const updatedSessions = sessions.map(s => {
                if (s._id === session._id) {
                    const isAlreadyIn = s.attendees.some(a => (typeof a === 'string' ? a === user.id : a._id === user.id));
                    if (!isAlreadyIn) {
                        return { ...s, attendees: [...s.attendees, user.id] };
                    }
                }
                return s;
            });
            setSessions(updatedSessions);

            if (selectedSession && selectedSession._id === session._id) {
                setSelectedSession({
                    ...selectedSession,
                    attendees: [...selectedSession.attendees, user.id]
                });
            }

            Alert.alert("Success", "You have joined the session!");
        } catch (error: any) {
            console.error("Error joining session:", error);
            Alert.alert("Error", error.response?.data?.msg || "Failed to join session");
        }
    };

    const isOrganizer = (session: KuppiSession) => {
        if (!user) return false;
        const orgId = typeof session.organizer === 'object' ? session.organizer._id : session.organizer;
        return orgId === user.id;
    };

    const hasJoined = (session: KuppiSession) => {
        if (!user) return false;
        return session.attendees.some(a => {
            const id = typeof a === 'object' ? a._id : a;
            return id === user.id;
        });
    };

    const renderSessionCard = (session: KuppiSession, isMySession = false) => {
        const joined = hasJoined(session);
        const userIsOrganizer = isOrganizer(session);

        return (
            <View key={session._id} style={[styles.card, isMySession && styles.mySessionCard]}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{session.title}</Text>
                    {userIsOrganizer && isMySession && (
                        <View style={styles.organizerBadge}>
                            <Text style={styles.organizerText}>ORGANIZER</Text>
                        </View>
                    )}
                </View>

                <View style={styles.tagContainer}>
                    <View style={styles.subjectTag}>
                        <Text style={styles.subjectText}>{session.subject}</Text>
                    </View>
                    {/* Fix: If I am organizer, I don't see joined badge usually, but if I am organizer, I am automatically joined.
                        User requested: "If a user is already in the attendees array of an upcoming session, change the 'Join' button to a green 'Joined' badge". 
                        This refers to UPCOMING sessions (where I am NOT organizer).
                        So check joined && !isMySession is correct for upcoming.
                    */}
                    {joined && !isMySession && (
                        <View style={styles.joinedBadge}>
                            <Text style={styles.joinedText}>✓ Joined</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.timeText}>
                    {session.date}, {session.time} • {session.sessionMode === 'Online' ? 'Online' : session.location}
                </Text>

                {/* Live Now Badge Logic */}
                {(() => {
                    if (session.dateTime) {
                        const start = new Date(session.dateTime);
                        // Assuming 2 hour duration for "Live Now" status
                        const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
                        if (currentTime >= start && currentTime < end) {
                            return (
                                <View style={styles.liveBadge}>
                                    <Text style={styles.liveText}>● LIVE NOW</Text>
                                </View>
                            );
                        }
                    }
                    return null;
                })()}

                <View style={styles.attendeesContainer}>
                    <View style={styles.avatarRow}>
                        {[1, 2, 3].map((_, i) => (
                            <View key={i} style={[styles.avatarPlaceholder, { marginLeft: i > 0 ? -10 : 0 }]} />
                        ))}
                        <Text style={styles.attendeeCount}>+{session.attendees.length}</Text>
                    </View>

                    {isMySession ? (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => {
                                setSelectedSession(session);
                                setDetailsModalVisible(true);
                            }}
                        >
                            <Text style={styles.actionButtonText}>View</Text>
                        </TouchableOpacity>
                    ) : (
                        !joined ? (
                            <TouchableOpacity
                                style={styles.joinButtonSmall}
                                onPress={() => handleJoinSession(session)}
                            >
                                <Text style={styles.joinButtonText}>Join</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity style={[styles.joinButtonSmall, { backgroundColor: COLORS.GREEN }]} disabled>
                                <Text style={styles.joinButtonText}>Joined</Text>
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </View>
        );
    };

    // Filter Logic
    // My Sessions: session.organizer === currentUserId
    const mySessions = sessions.filter(s => isOrganizer(s));

    // Upcoming Sessions: 
    // 1. Organizer is NOT currentUserId
    // 2. Session date is in the future
    const upcomingSessions = sessions.filter(s => {
        if (isOrganizer(s)) return false;

        // Date check using dateTime from backend (preferred) or date string parsing
        let sessionDate: Date;
        if (s.dateTime) {
            sessionDate = new Date(s.dateTime);
        } else {
            // Fallback for old data without dateTime
            sessionDate = new Date(s.date);
        }

        if (!isNaN(sessionDate.getTime())) {
            // Filter: Show if it's in the future OR if it's "Live Now" (within last 2 hours)
            // But user said: "The moment the scheduled time passes, they should be removed from that list automatically."
            // Wait, "Sessions should only be visible in 'Upcoming' if they haven't happened yet."
            // But typically "Upcoming" usually transitions to "Live/Ongoing". 
            // If I remove them EXACTLY at start time, user won't see "Live Now" badge in "Upcoming" list!
            // "Upcoming Sessions" list usually contains current/future.
            // Requirement 4: "If a session is happening right now, show a 'Live Now' badge" implies it should be IN the list.
            // Requirement 3: "a filter that compares... dateTime with new Date()... so a session disappears... moment it expires".
            // "Expire" usually means end time. 
            // So logic: Show if session has NOT ended yet. 
            // Assuming 2 hrs duration: Show if now < startTime + 2hrs.

            // However, user stated logic: "Update the GET /upcoming route to fetch only sessions where dateTime is greater than new Date()."
            // That strict logic means: if now > startTime, it's GONE. 
            // Contradiction? "If a session is happening right now, show a 'Live Now' badge".
            // If it's gone from the list, how can we show the badge?
            // Interpret "Visible in Upcoming" as "Visible in the list titled Upcoming".
            // If the user wants "Live Now" badge, the session MUST be in the return list.
            // So "Expires" likely means "Finished".
            // I will use `now < startTime + 2 hours` for visibility.
            const twoHoursAfterStart = new Date(sessionDate.getTime() + 2 * 60 * 60 * 1000);
            return twoHoursAfterStart > currentTime;

            // Strict interpretation of "dateTime greater than new Date()" (User point 1) would hide it at start.
            // I will err on side of "Live Now" requirement and use a grace period (e.g. duration).
        }
        return true;
    });

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }

        if (selectedDate) {
            setFormData({
                ...formData,
                dateTime: selectedDate,
                date: selectedDate.toLocaleDateString(),
                time: selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }

        if (selectedDate) {
            setFormData({
                ...formData,
                dateTime: selectedDate,
                date: selectedDate.toLocaleDateString(),
                time: selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                {/* Header logic removed as per request */}
            </View>

            <Animated.ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                )}
                scrollEventThrottle={16}
            >
                <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                {upcomingSessions.length === 0 ? (
                    <Text style={styles.emptyText}>No upcoming sessions found.</Text>
                ) : (
                    upcomingSessions.map(s => renderSessionCard(s))
                )}

                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>My Sessions</Text>
                {mySessions.length === 0 ? (
                    <Text style={styles.emptyText}>You haven't joined or organized any sessions yet.</Text>
                ) : (
                    mySessions.map(s => renderSessionCard(s, true))
                )}
            </Animated.ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setCreateModalVisible(true)}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

            {/* Create Session Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={createModalVisible}
                onRequestClose={() => setCreateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create Kuppi</Text>

                        <ScrollView>
                            <Text style={styles.label}>Title</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Study for MATH201 Quiz"
                                placeholderTextColor="#888"
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                            />

                            <Text style={styles.label}>Subject</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., MATH201"
                                placeholderTextColor="#888"
                                value={formData.subject}
                                onChangeText={(text) => setFormData({ ...formData, subject: text })}
                            />

                            <Text style={styles.label}>Session Mode</Text>
                            <View style={styles.row}>
                                <TouchableOpacity
                                    style={[styles.modeButton, formData.sessionMode === 'Physical' && styles.modeButtonActive]}
                                    onPress={() => setFormData({ ...formData, sessionMode: 'Physical' })}
                                >
                                    <Text style={[styles.modeButtonText, formData.sessionMode === 'Physical' && styles.modeButtonTextActive]}>Physical</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modeButton, formData.sessionMode === 'Online' && styles.modeButtonActive]}
                                    onPress={() => setFormData({ ...formData, sessionMode: 'Online' })}
                                >
                                    <Text style={[styles.modeButtonText, formData.sessionMode === 'Online' && styles.modeButtonTextActive]}>Online</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>Date</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeInput}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={[
                                            styles.dateTimeText,
                                            !formData.date && styles.dateTimePlaceholder
                                        ]}>
                                            {formData.date || "Select Date"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>Time</Text>
                                    <TouchableOpacity
                                        style={styles.dateTimeInput}
                                        onPress={() => setShowTimePicker(true)}
                                    >
                                        <Text style={[
                                            styles.dateTimeText,
                                            !formData.time && styles.dateTimePlaceholder
                                        ]}>
                                            {formData.time || "Select Time"}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Android Pickers */}
                            {Platform.OS === 'android' && showDatePicker && (
                                <DateTimePicker
                                    testID="dateTimePicker"
                                    value={formData.dateTime}
                                    mode="date"
                                    display="calendar"
                                    onChange={onDateChange}
                                    minimumDate={new Date()}
                                    // @ts-ignore
                                    accentColor={COLORS.RED}
                                />
                            )}
                            {Platform.OS === 'android' && showTimePicker && (
                                <DateTimePicker
                                    testID="timePicker"
                                    value={formData.dateTime}
                                    mode="time"
                                    display="clock"
                                    onChange={onTimeChange}
                                    // @ts-ignore
                                    accentColor={COLORS.RED}
                                />
                            )}

                            {/* iOS Date Picker Modal */}
                            {Platform.OS === 'ios' && showDatePicker && (
                                <Modal
                                    transparent={true}
                                    animationType="fade"
                                    visible={showDatePicker}
                                    onRequestClose={() => setShowDatePicker(false)}
                                >
                                    <View style={styles.modalOverlay}>
                                        <View style={{ backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                    <Text style={{ color: COLORS.RED, fontSize: 16 }}>Cancel</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                                    <Text style={{ color: COLORS.RED, fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <DateTimePicker
                                                value={formData.dateTime}
                                                mode="date"
                                                display="inline"
                                                onChange={onDateChange}
                                                minimumDate={new Date()}
                                                style={{ height: 320 }}
                                                themeVariant="light"
                                                textColor="black"
                                                // @ts-ignore
                                                accentColor={COLORS.RED}
                                            />
                                        </View>
                                    </View>
                                </Modal>
                            )}

                            {/* iOS Time Picker Modal */}
                            {Platform.OS === 'ios' && showTimePicker && (
                                <Modal
                                    transparent={true}
                                    animationType="fade"
                                    visible={showTimePicker}
                                    onRequestClose={() => setShowTimePicker(false)}
                                >
                                    <View style={styles.modalOverlay}>
                                        <View style={{ backgroundColor: 'white', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                                                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                                    <Text style={{ color: COLORS.RED, fontSize: 16 }}>Cancel</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                                    <Text style={{ color: COLORS.RED, fontWeight: 'bold', fontSize: 16 }}>Done</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <DateTimePicker
                                                value={formData.dateTime}
                                                mode="time"
                                                display="spinner"
                                                onChange={onTimeChange}
                                                style={{ height: 200 }}
                                                themeVariant="light"
                                                textColor="black"
                                                // @ts-ignore
                                                accentColor={COLORS.RED}
                                            />
                                        </View>
                                    </View>
                                </Modal>
                            )}

                            {formData.sessionMode === 'Physical' ? (
                                <>
                                    <Text style={styles.label}>Location</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g., Library Room 4A"
                                        placeholderTextColor="#888"
                                        value={formData.location}
                                        onChangeText={(text) => setFormData({ ...formData, location: text })}
                                    />
                                </>
                            ) : (
                                <>
                                    <Text style={styles.label}>Meeting Link</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g., https://zoom.us/j/..."
                                        placeholderTextColor="#888"
                                        value={formData.meetingLink}
                                        onChangeText={(text) => setFormData({ ...formData, meetingLink: text })}
                                        autoCapitalize="none"
                                    />
                                </>
                            )}

                            <Text style={styles.label}>Max Attendees</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 15"
                                placeholderTextColor="#888"
                                keyboardType="numeric"
                                value={formData.maxAttendees}
                                onChangeText={(text) => setFormData({ ...formData, maxAttendees: text })}
                            />

                            <Text style={styles.label}>About this session</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Description..."
                                placeholderTextColor="#888"
                                multiline
                                numberOfLines={4}
                                value={formData.about}
                                onChangeText={(text) => setFormData({ ...formData, about: text })}
                            />
                        </ScrollView>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setCreateModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.createSubmitButton}
                                onPress={handleCreateSession}
                            >
                                <Text style={styles.createSubmitButtonText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Details Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={detailsModalVisible}
                onRequestClose={() => setDetailsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedSession && (
                            <>
                                <View style={styles.detailsHeader}>
                                    <Text style={styles.modalTitle}>{selectedSession.title}</Text>
                                    <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={COLORS.GREY} />
                                    </TouchableOpacity>
                                </View>

                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                                    <View style={styles.subjectTag}>
                                        <Text style={styles.subjectText}>{selectedSession.subject}</Text>
                                    </View>
                                    {hasJoined(selectedSession) && (
                                        <View style={[styles.joinedBadge, { marginLeft: 10 }]}>
                                            <Text style={styles.joinedText}>✓ Joined</Text>
                                        </View>
                                    )}
                                </View>

                                <ScrollView>
                                    <View style={styles.detailRow}>
                                        <View style={styles.iconCircle}><Ionicons name="calendar-outline" size={20} color={COLORS.GREY} /></View>
                                        <View>
                                            <Text style={styles.detailLabel}>Date & Time</Text>
                                            <Text style={styles.detailValue}>{selectedSession.date}, {selectedSession.time}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <View style={styles.iconCircle}>
                                            <Ionicons
                                                name={selectedSession.sessionMode === 'Online' ? "link-outline" : "location-outline"}
                                                size={20}
                                                color={COLORS.GREY}
                                            />
                                        </View>
                                        <View>
                                            <Text style={styles.detailLabel}>{selectedSession.sessionMode === 'Online' ? "Meeting Link" : "Location"}</Text>
                                            <Text style={styles.detailValue}>
                                                {selectedSession.sessionMode === 'Online' ? (selectedSession.meetingLink || "No link provided") : selectedSession.location}
                                            </Text>
                                            {selectedSession.sessionMode === 'Online' && selectedSession.meetingLink && (
                                                <TouchableOpacity onPress={() => Linking.openURL(selectedSession.meetingLink!)}>
                                                    <Text style={{ color: COLORS.RED, marginTop: 5, fontWeight: 'bold' }}>Open Link</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <View style={styles.iconCircle}><Ionicons name="person-outline" size={20} color={COLORS.GREY} /></View>
                                        <View>
                                            <Text style={styles.detailLabel}>Organizer</Text>
                                            <Text style={styles.detailValue}>
                                                {typeof selectedSession.organizer === 'object' ? selectedSession.organizer.username : "Organizer"}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <View style={styles.iconCircle}><Ionicons name="people-outline" size={20} color={COLORS.GREY} /></View>
                                        <View>
                                            <Text style={styles.detailLabel}>Attendees</Text>
                                            <Text style={styles.detailValue}>{selectedSession.attendees.length} / {selectedSession.maxAttendees} members</Text>
                                        </View>
                                    </View>

                                    <View style={styles.separator} />

                                    <Text style={styles.detailSectionTitle}>About this session</Text>
                                    <Text style={styles.aboutText}>{selectedSession.about}</Text>

                                </ScrollView>

                                {!hasJoined(selectedSession) ? (
                                    <TouchableOpacity
                                        style={styles.confirmJoinButton}
                                        onPress={() => {
                                            handleJoinSession(selectedSession);
                                            setDetailsModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.confirmJoinText}>Confirm Join</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={[styles.confirmJoinButton, { backgroundColor: COLORS.GREEN }]}
                                        disabled
                                    >
                                        <Text style={styles.confirmJoinText}>Already Joined</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "#fff", -- let parent handle bg
    },
    headerContainer: {
        marginBottom: 10,
    },
    // headerTitle: { -- removed
    //     fontSize: 24,
    //     fontWeight: "bold",
    //     marginBottom: 10,
    //     color: COLORS.TEXT_DARK, 
    // },
    createButton: {
        backgroundColor: COLORS.RED,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
        marginBottom: 20,
        marginHorizontal: 20,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        backgroundColor: COLORS.RED,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    createButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
        marginLeft: 5,
    },
    scrollContent: {
        paddingTop: 200, // Matched updated header height
        paddingBottom: 40,
        paddingHorizontal: 20, // Align text and cards with page margins
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: COLORS.TEXT_DARK,
    },
    emptyText: {
        color: COLORS.GREY,
        fontStyle: "italic",
        marginBottom: 10,
    },
    card: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        marginVertical: 4,
        // Light Shadow
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    mySessionCard: {
        borderLeftWidth: 4,
        borderLeftColor: COLORS.RED,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
        color: COLORS.TEXT_DARK,
    },
    organizerBadge: {
        backgroundColor: "#FFEBEB", // Light pink
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    organizerText: {
        color: COLORS.RED,
        fontSize: 10,
        fontWeight: "bold",
        textTransform: 'uppercase',
    },
    tagContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    subjectTag: {
        borderWidth: 1,
        borderColor: COLORS.RED,
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    subjectText: {
        color: COLORS.RED,
        fontSize: 12,
        fontWeight: "600",
    },
    joinedBadge: {
        borderWidth: 1,
        borderColor: COLORS.GREEN,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 2,
        marginLeft: 8,
    },
    joinedText: {
        color: COLORS.GREEN,
        fontSize: 12,
        fontWeight: "600",
    },
    timeText: {
        color: COLORS.GREY,
        fontSize: 14,
        marginBottom: 8, // reduced margin to fit badge
    },
    liveBadge: {
        backgroundColor: "#FF0000",
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    liveText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    attendeesContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    avatarRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "#eee",
        borderWidth: 2,
        borderColor: "#fff",
    },
    attendeeCount: {
        marginLeft: 8,
        color: COLORS.GREY,
        fontSize: 13,
    },
    actionButton: {
        backgroundColor: "#e0e0e0",
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    joinButtonSmall: {
        backgroundColor: COLORS.RED,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 20,
    },
    joinButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
    },
    disabledButton: {
        backgroundColor: COLORS.LIGHT_GREY,
    },
    actionButtonText: {
        color: COLORS.TEXT_DARK,
        fontWeight: "bold",
        fontSize: 14,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        height: "90%",
        marginTop: "auto",
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 24,
        textAlign: "left",
        color: COLORS.TEXT_DARK,
    },
    label: {
        fontWeight: "600",
        marginBottom: 8,
        fontSize: 15,
        color: "#1a1a1a",
    },
    input: {
        borderWidth: 1,
        borderColor: "#E5E5E5", // Light grey border
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        backgroundColor: "#FFFFFF",
        fontSize: 16,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    halfInput: {
        flex: 1,
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        marginBottom: 30,
        gap: 12, // Modern gap property for equal spacing
    },
    cancelButton: {
        backgroundColor: "#F5F5F5",
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: 'center',
        // Removed margins, using gap
    },
    cancelButtonText: {
        fontWeight: "bold",
        color: "#666",
        fontSize: 16,
    },
    createSubmitButton: {
        backgroundColor: COLORS.RED,
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: 'center',
        // Removed margins, using gap
    },
    createSubmitButtonText: {
        fontWeight: "bold",
        color: "white",
        fontSize: 16,
    },
    // Details specific
    detailsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: "row",
        marginBottom: 20,
        alignItems: "center",
    },
    iconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#F9F9F9",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    detailLabel: {
        fontSize: 13,
        color: COLORS.GREY,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 15,
        fontWeight: "600",
        color: COLORS.TEXT_DARK,
    },
    separator: {
        height: 1,
        backgroundColor: "#eee",
        marginVertical: 15,
    },
    detailSectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 10,
    },
    aboutText: {
        lineHeight: 22,
        color: "#555",
        marginBottom: 30,
    },
    confirmJoinButton: {
        backgroundColor: COLORS.RED,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
        marginBottom: 30,
    },
    confirmJoinText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    modeButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.WHITE,
    },
    modeButtonActive: {
        backgroundColor: COLORS.RED,
        borderColor: COLORS.RED,
    },
    modeButtonText: {
        color: COLORS.GREY,
        fontWeight: '600',
        fontSize: 15,
    },
    modeButtonTextActive: {
        color: 'white',
        fontWeight: 'bold',
    },
    dateTimeInput: {
        backgroundColor: "#2C2C2C", // Darker Gray
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#444",
        alignItems: "center",
        justifyContent: "center",
    },
    dateTimeText: {
        color: "#f9252b", // Bright Red for visibility
        fontSize: 16,
        fontWeight: "bold",
    },
    dateTimePlaceholder: {
        color: "#888", // Light enough to read
        fontWeight: "normal",
    },
});
