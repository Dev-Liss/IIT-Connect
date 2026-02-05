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
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { KUPPI_ENDPOINTS } from "../../../src/config/api";

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
interface KuppiSession {
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
}

export default function KuppiScreen() {
    const router = useRouter();
    const [sessions, setSessions] = useState<KuppiSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Modal States
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedSession, setSelectedSession] = useState<KuppiSession | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        subject: "",
        date: "",
        time: "",
        location: "",
        maxAttendees: "",
        about: "",
    });

    // Mock User ID (Replace with actual auth logic)
    const CURRENT_USER_ID = "dummy_user_id"; // TODO: updates this with real user ID from context/storage

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const response = await axios.get(KUPPI_ENDPOINTS.GET_ALL);
            setSessions(response.data);
        } catch (error) {
            console.error("Error fetching sessions:", error);
            Alert.alert("Error", "Failed to load sessions");
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
        if (!formData.title || !formData.subject || !formData.date) {
            Alert.alert("Error", "Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);
            await axios.post(KUPPI_ENDPOINTS.CREATE, {
                ...formData,
                maxAttendees: parseInt(formData.maxAttendees) || 10,
                organizer: CURRENT_USER_ID, // Sending ID manually for now
            });
            setCreateModalVisible(false);
            setFormData({
                title: "",
                subject: "",
                date: "",
                time: "",
                location: "",
                maxAttendees: "",
                about: "",
            });
            fetchSessions(); // Refresh list
            Alert.alert("Success", "Session created successfully!");
        } catch (error) {
            console.error("Error creating session:", error);
            Alert.alert("Error", "Failed to create session");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinSession = async (session: KuppiSession) => {
        try {
            await axios.post(KUPPI_ENDPOINTS.JOIN(session._id), { userId: CURRENT_USER_ID });

            // Update local state immediately for responsiveness
            const updatedSessions = sessions.map(s => {
                if (s._id === session._id) {
                    // Check if user ID is already in attendees to avoid duplicates in UI logic (though backend handles it)
                    const isAlreadyIn = s.attendees.some(a => (typeof a === 'string' ? a === CURRENT_USER_ID : a._id === CURRENT_USER_ID));
                    if (!isAlreadyIn) {
                        return { ...s, attendees: [...s.attendees, CURRENT_USER_ID] };
                    }
                }
                return s;
            });
            setSessions(updatedSessions);

            // Also update selected session if open
            if (selectedSession && selectedSession._id === session._id) {
                setSelectedSession({
                    ...selectedSession,
                    attendees: [...selectedSession.attendees, CURRENT_USER_ID]
                });
            }

            Alert.alert("Success", "You have joined the session!");
        } catch (error: any) {
            console.error("Error joining session:", error);
            Alert.alert("Error", error.response?.data?.msg || "Failed to join session");
        }
    };

    const isOrganizer = (session: KuppiSession) => {
        const orgId = typeof session.organizer === 'object' ? session.organizer._id : session.organizer;
        return orgId === CURRENT_USER_ID;
    };

    const hasJoined = (session: KuppiSession) => {
        return session.attendees.some(a => {
            const id = typeof a === 'object' ? a._id : a;
            return id === CURRENT_USER_ID;
        });
    };

    const renderSessionCard = (session: KuppiSession, isMySession = false) => {
        const joined = hasJoined(session);
        const userIsOrganizer = isOrganizer(session);

        return (
            <View key={session._id} style={styles.card}>
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
                    {joined && !isMySession && ( // Show joined badge on upcoming list if joined
                        <View style={styles.joinedBadge}>
                            <Text style={styles.joinedText}>✓ Joined</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.timeText}>
                    {session.date}, {session.time} • {session.location}
                </Text>

                <View style={styles.attendeesContainer}>
                    <View style={styles.avatarRow}>
                        {[1, 2, 3].map((_, i) => (
                            <View key={i} style={[styles.avatarPlaceholder, { marginLeft: i > 0 ? -10 : 0 }]} />
                        ))}
                        <Text style={styles.attendeeCount}>+{session.attendees.length}</Text>
                    </View>

                    {isMySession ? (
                        <TouchableOpacity
                            style={styles.viewButton}
                            onPress={() => {
                                setSelectedSession(session);
                                setDetailsModalVisible(true);
                            }}
                        >
                            <Text style={styles.viewButtonText}>View</Text>
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
                            <TouchableOpacity style={styles.joinedButtonSmall} disabled>
                                <Text style={styles.joinedButtonText}>Joined</Text>
                            </TouchableOpacity>
                        )
                    )}
                </View>
            </View>
        );
    };

    const upcomingSessions = sessions.filter(s => !isOrganizer(s)); // Simplified logic: Upcoming = ones I didn't organize (or maybe future ones)
    const mySessions = sessions.filter(s => isOrganizer(s) || hasJoined(s)); // My Sessions = Organized by me OR joined by me

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Kuppi Sessions</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => setCreateModalVisible(true)}
                >
                    <Ionicons name="add" size={24} color="white" />
                    <Text style={styles.createButtonText}>Create New Session</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Upcoming Sessions Section */}
                <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                {upcomingSessions.length === 0 ? (
                    <Text style={styles.emptyText}>No upcoming sessions found.</Text>
                ) : (
                    upcomingSessions.map(s => renderSessionCard(s))
                )}

                {/* My Sessions Section */}
                <Text style={[styles.sectionTitle, { marginTop: 20 }]}>My Sessions</Text>
                {mySessions.length === 0 ? (
                    <Text style={styles.emptyText}>You haven't joined or organized any sessions yet.</Text>
                ) : (
                    mySessions.map(s => renderSessionCard(s, true))
                )}
            </ScrollView>

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
                                value={formData.title}
                                onChangeText={(text) => setFormData({ ...formData, title: text })}
                            />

                            <Text style={styles.label}>Subject</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., MATH201"
                                value={formData.subject}
                                onChangeText={(text) => setFormData({ ...formData, subject: text })}
                            />

                            <View style={styles.row}>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>Date</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. Friday"
                                        value={formData.date}
                                        onChangeText={(text) => setFormData({ ...formData, date: text })}
                                    />
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={styles.label}>Time</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="e.g. 10:00 AM"
                                        value={formData.time}
                                        onChangeText={(text) => setFormData({ ...formData, time: text })}
                                    />
                                </View>
                            </View>

                            <Text style={styles.label}>Location</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., Library Room 4A"
                                value={formData.location}
                                onChangeText={(text) => setFormData({ ...formData, location: text })}
                            />

                            <Text style={styles.label}>Max Attendees</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="e.g., 15"
                                keyboardType="numeric"
                                value={formData.maxAttendees}
                                onChangeText={(text) => setFormData({ ...formData, maxAttendees: text })}
                            />

                            <Text style={styles.label}>About this session</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Description..."
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
                                        <View style={styles.iconCircle}><Ionicons name="location-outline" size={20} color={COLORS.GREY} /></View>
                                        <View>
                                            <Text style={styles.detailLabel}>Location</Text>
                                            <Text style={styles.detailValue}>{selectedSession.location}</Text>
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
        backgroundColor: "#fff",
        paddingTop: 50, // Adjust for status bar
    },
    headerContainer: {
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        color: COLORS.TEXT_DARK, // "Kuppi Sessions"
    },
    createButton: {
        backgroundColor: COLORS.RED,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 10,
        marginBottom: 10,
    },
    createButtonText: {
        color: "white",
        fontWeight: "600",
        fontSize: 16,
        marginLeft: 5,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: COLORS.TEXT_DARK,
    },
    emptyText: {
        color: COLORS.GREY,
        fontStyle: "italic",
        marginBottom: 10,
    },
    card: {
        backgroundColor: COLORS.WHITE,
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        // Shadow for iOS/Android
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: "#f0f0f0",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 5,
        flex: 1,
    },
    organizerBadge: {
        backgroundColor: "#FFEBEB", // Light red bg
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginLeft: 5,
    },
    organizerText: {
        color: COLORS.RED,
        fontSize: 10,
        fontWeight: "bold",
    },
    tagContainer: {
        flexDirection: "row",
        marginBottom: 10,
    },
    subjectTag: {
        borderWidth: 1,
        borderColor: COLORS.RED,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 2,
        marginRight: 10,
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
    },
    joinedText: {
        color: COLORS.GREEN,
        fontSize: 12,
        fontWeight: "600",
    },
    timeText: {
        color: COLORS.GREY,
        fontSize: 13,
        marginBottom: 10,
    },
    attendeesContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    avatarRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    avatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: "#ddd",
        borderWidth: 1,
        borderColor: "#fff",
    },
    attendeeCount: {
        marginLeft: 5,
        color: COLORS.GREY,
        fontSize: 12,
    },
    joinButtonSmall: {
        backgroundColor: COLORS.RED,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    joinButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 12,
    },
    joinedButtonSmall: {
        backgroundColor: COLORS.GREEN,
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    joinedButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 12,
    },
    viewButton: {
        backgroundColor: "#e0e0e0",
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    viewButtonText: {
        color: "#333",
        fontWeight: "bold",
        fontSize: 12,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end", // Bottom sheet style or center
    },
    modalContent: {
        backgroundColor: "white",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        height: "90%", // Takes up most of screen
        marginTop: "auto",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "left",
    },
    label: {
        fontWeight: "600",
        marginBottom: 5,
        fontSize: 14,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e0e0e0",
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
        backgroundColor: "#f9f9f9",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    halfInput: {
        width: "48%",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        marginBottom: 30,
    },
    cancelButton: {
        backgroundColor: "#e0e0e0",
        flex: 1,
        marginRight: 10,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    cancelButtonText: {
        fontWeight: "bold",
        color: "#555",
    },
    createSubmitButton: {
        backgroundColor: COLORS.RED,
        flex: 1,
        marginLeft: 10,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
    },
    createSubmitButtonText: {
        fontWeight: "bold",
        color: "white",
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
        marginBottom: 15,
        alignItems: "center",
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f5f5f5",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    detailLabel: {
        fontSize: 12,
        color: COLORS.GREY,
    },
    detailValue: {
        fontSize: 14,
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
});
