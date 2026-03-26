import React, { useState, useRef, useEffect } from "react";
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
  Platform,
  KeyboardAvoidingView,
  StatusBar,
  Dimensions,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { KUPPI_ENDPOINTS } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Constants
const COLORS = {
  RED: "#f9252b",
  WHITE: "#f7f7f7",
  GREEN: "#4CAF50",
  GREY: "#888",
  LIGHT_GREY: "#e0e0e0",
  TEXT_DARK: "#333",
};

export default function KuppiScreen({ autoOpenCreate, onModalOpened }) {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Date Picker State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Modal States
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  // Focus tracking for input scale animation
  const [focusedField, setFocusedField] = useState(null);

  // Animated values for each input field
  const titleScale = useSharedValue(1);
  const subjectScale = useSharedValue(1);
  const linkScale = useSharedValue(1);
  const aboutScale = useSharedValue(1);

  // Slide-up animation
  const slideAnim = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(new Date().getTime() + 60 * 60 * 1000),
    about: "",
    meetingLink: "",
  });

  const CURRENT_USER_ID = "69803c6732b6bf165d609ee0";
  const { user } = useAuth();
  const { getToken } = useClerkAuth();

  useFocusEffect(
    React.useCallback(() => {
      fetchSessions();
      const interval = setInterval(() => {
        setCurrentTime(new Date());
      }, 60000);
      return () => clearInterval(interval);
    }, []),
  );

  // Auto-open the create modal when triggered from the main Create sheet
  React.useEffect(() => {
    if (autoOpenCreate) {
      openCreateModal();
      if (onModalOpened) onModalOpened();
    }
  }, [autoOpenCreate]);

  // --- Premium Modal Animation Helpers ---
  const openCreateModal = () => {
    setCreateModalVisible(true);
    backdropOpacity.value = withTiming(1, { duration: 300 });
    slideAnim.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
      mass: 1,
    });
  };

  const closeCreateModal = () => {
    backdropOpacity.value = withTiming(0, { duration: 250 });
    slideAnim.value = withSpring(SCREEN_HEIGHT, {
      damping: 20,
      stiffness: 90,
    });
    setTimeout(() => {
      setCreateModalVisible(false);
    }, 350);
  };

  // Input focus scale animation
  const handleInputFocus = (field) => {
    setFocusedField(field);
    const scaleMap = { title: titleScale, subject: subjectScale, link: linkScale, about: aboutScale };
    if (scaleMap[field]) {
      scaleMap[field].value = withSpring(1.02, { damping: 15, stiffness: 150 });
    }
  };

  const handleInputBlur = (field) => {
    setFocusedField(null);
    const scaleMap = { title: titleScale, subject: subjectScale, link: linkScale, about: aboutScale };
    if (scaleMap[field]) {
      scaleMap[field].value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  };

  const titleInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: titleScale.value }],
  }));
  const subjectInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: subjectScale.value }],
  }));
  const linkInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: linkScale.value }],
  }));
  const aboutInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: aboutScale.value }],
  }));

  const slideUpStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: slideAnim.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  // --- End Animation Helpers ---

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

    if (formData.endTime < new Date()) {
      Alert.alert("Error", "Cannot create a session that has already ended!");
      return;
    }

    if (formData.endTime <= formData.startTime) {
      Alert.alert("Error", "End time must be after start time");
      return;
    }

    if (!formData.meetingLink) {
      Alert.alert("Error", "Please provide a meeting link");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.post(
        KUPPI_ENDPOINTS.CREATE,
        {
          ...formData,
          meetingLink: formData.meetingLink,
          startTime: formData.startTime.toISOString(),
          endTime: formData.endTime.toISOString(),
          dateTime: formData.startTime.toISOString(),
          date: formData.startTime.toLocaleDateString(),
          time: formData.startTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const newSessionWithUser = {
        ...response.data,
        organizer: response.data.organizer || user,
      };
      setSessions((prev) => Array.isArray(prev) ? [newSessionWithUser, ...prev] : [newSessionWithUser]);

      closeCreateModal();
      const now = new Date();
      setFormData({
        title: "",
        subject: "",
        date: now,
        startTime: now,
        endTime: new Date(now.getTime() + 60 * 60 * 1000),
        about: "",
        meetingLink: "",
      });
      fetchSessions();
      Alert.alert("Success", "Session created successfully!");
    } catch (error) {
      console.error("Error creating session:", error);
      const errorMessage =
        error.response?.data?.msg ||
        error.message ||
        "Failed to create session";
      Alert.alert(
        "Error",
        `Failed completely: ${errorMessage} (Status: ${error.response?.status})`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = (session) => {
    if (session.meetingLink) {
      Linking.openURL(session.meetingLink).catch((err) => {
        Alert.alert("Error", "Could not open meeting link.");
      });
    }
  };

  const isOrganizer = (session) => {
    if (!user || !session?.organizer) return false;
    const orgId = typeof session.organizer === "object" ? session.organizer?._id : session.organizer;
    return orgId === user?.id || orgId === user?._id;
  };

  const hasJoined = (session) => {
    if (!user || !session?.attendees) return false;
    return session.attendees.some((a) => {
      const id = typeof a === "object" ? a?._id : a;
      return id === user?.id || id === user?._id;
    });
  };

  const renderSessionCard = (session, isMySession = false) => {
    const userIsOrganizer = isOrganizer(session);

    return (
      <View
        key={session?._id || Math.random().toString()}
        style={[styles.card, isMySession && styles.mySessionCard]}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{session?.title}</Text>
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
        </View>

        <Text style={styles.timeText}>
          {(() => {
            if (session.startTime && session.endTime) {
              const start = new Date(session.startTime);
              const day = start.toLocaleDateString("en-US", {
                weekday: "short",
              });
              return `${day}, ${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • Online`;
            } else {
              return `${session.date}, ${session.time} • Online`;
            }
          })()}
        </Text>

        {/* Live Now Badge Logic */}
        {(() => {
          let start, end;

          if (session.startTime && session.endTime) {
            start = new Date(session.startTime);
            end = new Date(session.endTime);
          } else if (session.dateTime) {
            start = new Date(session.dateTime);
            end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
          } else {
            return null;
          }

          if (currentTime >= start && currentTime < end) {
            return (
              <View style={styles.liveBadge}>
                <Text style={styles.liveText}>● LIVE NOW</Text>
              </View>
            );
          }
          return null;
        })()}

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              setSelectedSession(session);
              setDetailsModalVisible(true);
            }}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>

          {session.meetingLink && (
            <TouchableOpacity
              style={styles.joinMeetingButton}
              onPress={() => handleJoinSession(session)}
            >
              <Text style={styles.joinMeetingText}>Join Meeting</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const mySessions = Array.isArray(sessions) ? sessions.filter((s) => s && isOrganizer(s)) : [];

  const upcomingSessions = Array.isArray(sessions) ? sessions.filter((s) => {
    if (!s || isOrganizer(s)) return false;

    let sessionEnd;
    if (s.endTime) {
      sessionEnd = new Date(s.endTime);
    } else if (s.dateTime) {
      const start = new Date(s.dateTime);
      sessionEnd = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    } else {
      sessionEnd = new Date(s.date);
    }

    if (!isNaN(sessionEnd.getTime())) {
      return sessionEnd > currentTime;
    }
    return true;
  }) : [];

  // Date Picker Handlers
  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selectedDate) {
      const updateDatePart = (base, newDate) => {
        const d = new Date(base);
        d.setFullYear(
          newDate.getFullYear(),
          newDate.getMonth(),
          newDate.getDate(),
        );
        return d;
      };

      setFormData({
        ...formData,
        date: selectedDate,
        startTime: updateDatePart(formData.startTime, selectedDate),
        endTime: updateDatePart(formData.endTime, selectedDate),
      });
    }
  };

  const onStartTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") setShowStartTimePicker(false);
    if (selectedTime) {
      const newStart = new Date(formData.startTime);
      newStart.setHours(selectedTime.getHours(), selectedTime.getMinutes());

      let newEnd = new Date(formData.endTime);
      if (newEnd <= newStart) {
        newEnd = new Date(newStart.getTime() + 60 * 60 * 1000);
      }

      setFormData({
        ...formData,
        startTime: newStart,
        endTime: newEnd,
      });
    }
  };

  const onEndTimeChange = (event, selectedTime) => {
    if (Platform.OS === "android") setShowEndTimePicker(false);
    if (selectedTime) {
      const newEnd = new Date(formData.endTime);
      newEnd.setHours(selectedTime.getHours(), selectedTime.getMinutes());

      setFormData({
        ...formData,
        endTime: newEnd,
      });
    }
  };

  // Check if form is valid for post button state
  const isFormValid = formData.title && formData.subject && formData.meetingLink;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        {upcomingSessions.length === 0 ? (
          <Text style={styles.emptyText}>No upcoming sessions found.</Text>
        ) : (
          upcomingSessions.map((s) => renderSessionCard(s))
        )}

        <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
          My Sessions
        </Text>
        {mySessions.length === 0 ? (
          <Text style={styles.emptyText}>
            You haven't joined or organized any sessions yet.
          </Text>
        ) : (
          mySessions.map((s) => renderSessionCard(s, true))
        )}
      </ScrollView>

      {/* ========== PREMIUM CREATE SESSION OVERLAY ========== */}
      <Modal
        animationType="none"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={closeCreateModal}
        statusBarTranslucent
      >
        {/* Glassmorphism Backdrop */}
        <Animated.View style={[styles.premiumBackdrop, backdropStyle]}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeCreateModal}
          />
        </Animated.View>

        {/* Slide-up Form Container */}
        <Animated.View style={[styles.premiumOverlay, slideUpStyle]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
            keyboardVerticalOffset={0}
          >
            {/* === Header Bar === */}
            <View style={styles.premiumHeader}>
              <TouchableOpacity onPress={closeCreateModal} style={styles.headerActionBtn}>
                <Text style={styles.headerCancelText}>Cancel</Text>
              </TouchableOpacity>

              <Text style={styles.headerTitle}>New Kuppi Session</Text>

              <TouchableOpacity
                onPress={handleCreateSession}
                style={[
                  styles.headerPostBtn,
                  !isFormValid && styles.headerPostBtnDisabled,
                ]}
                disabled={!isFormValid}
              >
                <Text style={[
                  styles.headerPostText,
                  !isFormValid && styles.headerPostTextDisabled,
                ]}>Create</Text>
              </TouchableOpacity>
            </View>

            {/* Subtle drag indicator */}
            <View style={styles.dragIndicator} />

            {/* === Form Body === */}
            <ScrollView
              style={styles.premiumFormScroll}
              contentContainerStyle={styles.premiumFormContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Title */}
              <Animated.View style={[styles.premiumInputRow, titleInputStyle]}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="text-outline" size={18} color={focusedField === 'title' ? COLORS.RED : '#bbb'} />
                </View>
                <View style={styles.inputFieldContainer}>
                  <TextInput
                    style={styles.premiumInput}
                    placeholder="Session title"
                    placeholderTextColor="#aaa"
                    value={formData.title}
                    onChangeText={(text) => setFormData({ ...formData, title: text })}
                    onFocus={() => handleInputFocus('title')}
                    onBlur={() => handleInputBlur('title')}
                  />
                </View>
              </Animated.View>
              <View style={styles.inputDivider} />

              {/* Subject */}
              <Animated.View style={[styles.premiumInputRow, subjectInputStyle]}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="book-outline" size={18} color={focusedField === 'subject' ? COLORS.RED : '#bbb'} />
                </View>
                <View style={styles.inputFieldContainer}>
                  <TextInput
                    style={styles.premiumInput}
                    placeholder="Subject (e.g., MATH201)"
                    placeholderTextColor="#aaa"
                    value={formData.subject}
                    onChangeText={(text) => setFormData({ ...formData, subject: text })}
                    onFocus={() => handleInputFocus('subject')}
                    onBlur={() => handleInputBlur('subject')}
                  />
                </View>
              </Animated.View>
              <View style={styles.inputDivider} />

              {/* Date & Time Row */}
              <View style={styles.dateTimeSection}>
                <TouchableOpacity
                  style={styles.premiumDateTimeBtn}
                  onPress={() => {
                    setShowDatePicker(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="calendar-outline" size={18} color={COLORS.RED} />
                  <Text style={styles.premiumDateTimeText}>
                    {formData.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.premiumDateTimeBtn}
                  onPress={() => {
                    setShowStartTimePicker(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time-outline" size={18} color={COLORS.RED} />
                  <Text style={styles.premiumDateTimeText}>
                    {formData.startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.dateTimeSeparator}>→</Text>

                <TouchableOpacity
                  style={styles.premiumDateTimeBtn}
                  onPress={() => {
                    setShowEndTimePicker(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="time-outline" size={18} color={COLORS.RED} />
                  <Text style={styles.premiumDateTimeText}>
                    {formData.endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputDivider} />

              {/* Android Pickers */}
              {Platform.OS === "android" && showDatePicker && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={formData.date}
                  mode="date"
                  display="calendar"
                  onChange={onDateChange}
                  minimumDate={new Date()}
                  accentColor={COLORS.RED}
                />
              )}
              {Platform.OS === "android" && showStartTimePicker && (
                <DateTimePicker
                  testID="startTimePicker"
                  value={formData.startTime}
                  mode="time"
                  display="clock"
                  onChange={onStartTimeChange}
                  accentColor={COLORS.RED}
                />
              )}
              {Platform.OS === "android" && showEndTimePicker && (
                <DateTimePicker
                  testID="endTimePicker"
                  value={formData.endTime}
                  mode="time"
                  display="clock"
                  onChange={onEndTimeChange}
                  accentColor={COLORS.RED}
                />
              )}

              {/* iOS Date Picker Modal */}
              {Platform.OS === "ios" && showDatePicker && (
                <Modal
                  transparent={true}
                  animationType="fade"
                  visible={showDatePicker}
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <View style={styles.iosPickerBackdrop}>
                    <View style={styles.iosPickerContainer}>
                      <View style={styles.iosPickerHeader}>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text style={styles.iosPickerCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text style={styles.iosPickerDone}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={formData.date}
                        mode="date"
                        display="inline"
                        onChange={onDateChange}
                        minimumDate={new Date()}
                        style={{ height: 320 }}
                        themeVariant="light"
                        textColor="black"
                        accentColor={COLORS.RED}
                      />
                    </View>
                  </View>
                </Modal>
              )}

              {/* iOS Start Time Picker Modal */}
              {Platform.OS === "ios" && showStartTimePicker && (
                <Modal
                  transparent={true}
                  animationType="fade"
                  visible={showStartTimePicker}
                  onRequestClose={() => setShowStartTimePicker(false)}
                >
                  <View style={styles.iosPickerBackdrop}>
                    <View style={styles.iosPickerContainer}>
                      <View style={styles.iosPickerHeader}>
                        <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                          <Text style={styles.iosPickerCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                          <Text style={styles.iosPickerDone}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={formData.startTime}
                        mode="time"
                        display="spinner"
                        onChange={onStartTimeChange}
                        style={{ height: 200 }}
                        themeVariant="light"
                        textColor="black"
                        accentColor={COLORS.RED}
                      />
                    </View>
                  </View>
                </Modal>
              )}

              {/* iOS End Time Picker Modal */}
              {Platform.OS === "ios" && showEndTimePicker && (
                <Modal
                  transparent={true}
                  animationType="fade"
                  visible={showEndTimePicker}
                  onRequestClose={() => setShowEndTimePicker(false)}
                >
                  <View style={styles.iosPickerBackdrop}>
                    <View style={styles.iosPickerContainer}>
                      <View style={styles.iosPickerHeader}>
                        <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                          <Text style={styles.iosPickerCancel}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                          <Text style={styles.iosPickerDone}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={formData.endTime}
                        mode="time"
                        display="spinner"
                        onChange={onEndTimeChange}
                        style={{ height: 200 }}
                        themeVariant="light"
                        textColor="black"
                        accentColor={COLORS.RED}
                      />
                    </View>
                  </View>
                </Modal>
              )}

              {/* Meeting Link */}
              <Animated.View style={[styles.premiumInputRow, linkInputStyle]}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="link-outline" size={18} color={focusedField === 'link' ? COLORS.RED : '#bbb'} />
                </View>
                <View style={styles.inputFieldContainer}>
                  <TextInput
                    style={styles.premiumInput}
                    placeholder="Meeting link (Zoom, Google Meet...)"
                    placeholderTextColor="#aaa"
                    value={formData.meetingLink}
                    onChangeText={(text) => setFormData({ ...formData, meetingLink: text })}
                    onFocus={() => handleInputFocus('link')}
                    onBlur={() => handleInputBlur('link')}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </Animated.View>
              <View style={styles.inputDivider} />

              {/* About (Optional) */}
              <Animated.View style={[styles.premiumInputRow, { alignItems: 'flex-start', paddingTop: 14 }, aboutInputStyle]}>
                <View style={[styles.inputIconContainer, { marginTop: 2 }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={focusedField === 'about' ? COLORS.RED : '#bbb'} />
                </View>
                <View style={styles.inputFieldContainer}>
                  <TextInput
                    style={[styles.premiumInput, styles.premiumTextArea]}
                    placeholder="Tell people about this session (optional)"
                    placeholderTextColor="#aaa"
                    multiline
                    numberOfLines={4}
                    value={formData.about}
                    onChangeText={(text) => setFormData({ ...formData, about: text })}
                    onFocus={() => handleInputFocus('about')}
                    onBlur={() => handleInputBlur('about')}
                  />
                </View>
              </Animated.View>

              {/* Bottom spacer for keyboard avoidance */}
              <View style={{ height: 80 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>

      {/* Details Modal (unchanged) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailsModalVisible}
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {(() => {
              if (!selectedSession) return null;
              return (
                <>
                  <View style={styles.detailsHeader}>
                  <Text style={styles.modalTitle}>{selectedSession.title}</Text>
                  <TouchableOpacity
                    onPress={() => setDetailsModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color={COLORS.GREY} />
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <View style={styles.subjectTag}>
                    <Text style={styles.subjectText}>
                      {selectedSession.subject}
                    </Text>
                  </View>
                </View>

                <ScrollView>
                  <View style={styles.detailRow}>
                    <View style={styles.iconCircle}>
                      <Ionicons
                        name="calendar-outline"
                        size={20}
                        color={COLORS.GREY}
                      />
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>Date & Time</Text>
                      <Text style={styles.detailValue}>
                        {selectedSession.date},{" "}
                        {selectedSession.startTime && selectedSession.endTime
                          ? `${new Date(selectedSession.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${new Date(selectedSession.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : selectedSession.time}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.iconCircle}>
                      <Ionicons
                        name="link-outline"
                        size={20}
                        color={COLORS.GREY}
                      />
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>Meeting Link</Text>
                      <Text style={styles.detailValue}>
                        {selectedSession.meetingLink
                          ? "Link provided"
                          : "No link provided"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.iconCircle}>
                      <Ionicons
                        name="person-outline"
                        size={20}
                        color={COLORS.GREY}
                      />
                    </View>
                    <View>
                      <Text style={styles.detailLabel}>Organizer</Text>
                      <Text style={styles.detailValue}>
                        {selectedSession?.organizer?.username || "Unknown User"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.separator} />

                  <Text style={styles.detailSectionTitle}>
                    About this session
                  </Text>
                  <Text style={styles.aboutText}>{selectedSession.about}</Text>
                </ScrollView>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 40,
    paddingHorizontal: 20,
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
    backgroundColor: "#FFEBEB",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  organizerText: {
    color: COLORS.RED,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
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
  timeText: {
    color: COLORS.GREY,
    fontSize: 14,
    marginBottom: 8,
  },
  liveBadge: {
    backgroundColor: "#FF0000",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  liveText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  viewButton: {
    backgroundColor: COLORS.LIGHT_GREY,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: "center",
  },
  viewButtonText: {
    color: COLORS.TEXT_DARK,
    fontWeight: "bold",
    fontSize: 14,
  },
  joinMeetingButton: {
    backgroundColor: COLORS.RED,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    alignItems: "center",
  },
  joinMeetingText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },

  // ==========================================
  // PREMIUM CREATE OVERLAY STYLES
  // ==========================================
  premiumBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  premiumOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.92,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 25,
  },
  premiumHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 16 : 14,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  headerActionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  headerCancelText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.3,
  },
  headerPostBtn: {
    backgroundColor: COLORS.RED,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    minWidth: 60,
    alignItems: "center",
  },
  headerPostBtnDisabled: {
    backgroundColor: "#ffb3b5",
  },
  headerPostText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  headerPostTextDisabled: {
    color: "rgba(255,255,255,0.7)",
  },
  dragIndicator: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginTop: 6,
    marginBottom: 4,
  },
  premiumFormScroll: {
    flex: 1,
  },
  premiumFormContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  // Minimalist Input Row
  premiumInputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  inputFieldContainer: {
    flex: 1,
  },
  premiumInput: {
    fontSize: 16,
    color: "#1a1a1a",
    paddingVertical: 12,
    fontWeight: "400",
  },
  premiumTextArea: {
    height: 100,
    textAlignVertical: "top",
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginLeft: 50,
    marginBottom: 4,
  },

  // Date/Time Section
  dateTimeSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    gap: 8,
  },
  premiumDateTimeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(249,37,43,0.12)",
  },
  premiumDateTimeText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  dateTimeSeparator: {
    fontSize: 16,
    color: "#ccc",
    fontWeight: "300",
  },

  // iOS Picker Modals
  iosPickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  iosPickerContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  iosPickerCancel: {
    color: COLORS.RED,
    fontSize: 16,
  },
  iosPickerDone: {
    color: COLORS.RED,
    fontWeight: "bold",
    fontSize: 16,
  },

  // Details Modal (unchanged)
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
});
