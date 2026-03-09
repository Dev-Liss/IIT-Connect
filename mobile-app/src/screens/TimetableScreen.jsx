import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import ClassCard from "../components/ClassCard";
import TodayClassCard from "../components/TodayClassCard";
import ModalDropdown from "../components/ModalDropdown";

const HOURS = [
  "08:30", "09:30", "10:30", "11:30", "12:30",
  "13:30", "14:30", "15:30", "16:30", "17:30",
  "18:30", "19:30",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const SLOT_HEIGHT = 80;
const DEFAULT_GROUP = "L5 SE -G1";

export default function TimetableScreen({ view = "weekly" }) {
  const [timetable, setTimetable] = useState([]);
  const [todayClasses, setTodayClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);

  const todayIndex = new Date().getDay();
  const currentDay = DAYS[todayIndex - 1] || "";

  const selectedLevelMatch = selectedGroup ? selectedGroup.match(/L[4-7]/) : null;
  const activeUnsupportedLevel = selectedLevelMatch && ["L4", "L6", "L7"].includes(selectedLevelMatch[0]) ? selectedLevelMatch[0] : null;

  const groupMatch = selectedGroup ? selectedGroup.match(/(CS|SE)\s*-\s*G(\d+)/) : null;
  const invalidCourseDetails = groupMatch ? 
    (groupMatch[1] === 'SE' && parseInt(groupMatch[2], 10) > 10 ? { course: 'SE', max: 10 } :
     groupMatch[1] === 'CS' && parseInt(groupMatch[2], 10) > 29 ? { course: 'CS', max: 29 } : null) 
    : null;

  const router = useRouter();

  const { user } = useAuth();
  const [profileLoaded, setProfileLoaded] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
      if (user) {
        fetchUserProfile();
      } else {
        setSelectedGroup(DEFAULT_GROUP);
        setIsUsingFallback(true);
        setLoading(false);
      }
    }, [user])
  );

  useEffect(() => {
    if (!selectedGroup) return;

    if (activeUnsupportedLevel || invalidCourseDetails) {
      setTimetable([]);
      setTodayClasses([]);
      setLoading(false);
      return;
    }

    if (view === "weekly") {
      fetchTimetable(selectedGroup);
    } else {
      fetchTodayTimetable(selectedGroup);
    }
  }, [view, selectedGroup, activeUnsupportedLevel, invalidCourseDetails]);

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/timetable/groups/all`);
      const result = await response.json();
      if (result.success && result.data.length > 0) {
        setGroups(result.data);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const userId = user?.id || user?._id;
      const response = await fetch(`${API_BASE_URL}/users/profile/${userId}`);
      const data = await response.json();
      if (response.ok && data.tutorialGroup) {
        setSelectedGroup(data.tutorialGroup);
        setIsUsingFallback(false);
      } else {
        setSelectedGroup(DEFAULT_GROUP);
        setIsUsingFallback(true);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setSelectedGroup(DEFAULT_GROUP);
      setIsUsingFallback(true);
    } finally {
      setProfileLoaded(true);
      setLoading(false);
    }
  };

  const fetchTimetable = async (group) => {
    setLoading(true);
    try {
      const encodeGroup = encodeURIComponent(group);
      const response = await fetch(
        `${API_BASE_URL}/timetable?tutGroup=${encodeGroup}`,
      );
      const result = await response.json();
      if (result.success) {
        setTimetable(result.data);
      } else {
        setTimetable([]);
        Alert.alert("Notice", result.message || "No timetable found for this group");
      }
    } catch (error) {
      console.error("Network error:", error);
      setTimetable([]);
      Alert.alert("Error", "No timetable found for this group");
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayTimetable = async (group) => {
    setLoading(true);
    try {
      const encodeGroup = encodeURIComponent(group);
      const response = await fetch(
        `${API_BASE_URL}/timetable/today?tutGroup=${encodeGroup}`,
      );
      const result = await response.json();
      if (result.success) {
        setTodayClasses(result.classes);
      } else {
        setTodayClasses([]);
        Alert.alert("Notice", result.message || "No timetable found for this group");
      }
    } catch (error) {
      console.error("Network error:", error);
      setTodayClasses([]);
      Alert.alert("Error", "No timetable found for this group");
    } finally {
      setLoading(false);
    }
  };

  const getPositionStyle = (startTime, endTime) => {
    const startHour = parseInt(startTime.split(":")[0]);
    const startMin = parseInt(startTime.split(":")[1]);
    const endHour = parseInt(endTime.split(":")[0]);
    const endMin = parseInt(endTime.split(":")[1]);

    const startOffset = startHour - 8 + (startMin - 30) / 60;
    const duration = endHour - startHour + (endMin - startMin) / 60;

    return {
      top: startOffset * SLOT_HEIGHT,
      height: duration * SLOT_HEIGHT,
    };
  };

  const renderClassCards = (day) => {
    const daysClasses = timetable.filter((t) => t.day === day);
    return daysClasses.map((entry) => {
      const style = getPositionStyle(entry.startTime, entry.endTime);
      return (
        <TouchableOpacity
          key={entry._id}
          style={{
            position: "absolute",
            top: style.top,
            left: 2,
            right: 2,
            height: style.height,
          }}
          onPress={() => setSelectedLecture(entry)}
          activeOpacity={0.8}
        >
          <ClassCard
            courseCode={entry.courseCode}
            type={entry.type}
            startTime={entry.startTime}
            endTime={entry.endTime}
            lecturer={entry.lecturer}
            location={entry.location}
            color={entry.color}
            height={style.height - 4}
          />
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#f9252b"
          style={{ marginTop: 50 }}
        />
      ) : (
        <>
          {isUsingFallback && (
            <View style={styles.fallbackBanner}>
              <Ionicons name="information-circle" size={20} color="#0277bd" />
              <Text style={styles.fallbackText}>
                Showing default timetable ({DEFAULT_GROUP}). Update your profile to see your specific schedule.
              </Text>
            </View>
          )}
          {view === "weekly" ? (
        /* WEEKLY GRID VIEW */
        <View style={styles.gridContainer}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            {/* Group Filter */}
            <View style={[styles.filterContainer, { marginBottom: 10 }]}>
              <View style={styles.pickerWrapper}>
                <ModalDropdown
                  options={(activeUnsupportedLevel || invalidCourseDetails) ? [] : groups}
                  defaultValue={(activeUnsupportedLevel || invalidCourseDetails) ? "No groups available for this selection" : (selectedGroup || "Select Your Group")}
                  onSelect={(index, value) => {
                    setSelectedGroup(value);
                    setIsUsingFallback(false);
                  }}
                  showSearch={true}
                  searchPlaceholder="Search Group..."
                  style={styles.dropdownButton}
                  textStyle={styles.dropdownButtonText}
                  dropdownStyle={styles.dropdownList}
                  dropdownTextStyle={styles.dropdownListText}
                  dropdownTextHighlightStyle={styles.dropdownHighlightText}
                >
                  <View style={styles.dropdownContainer}>
                    <Text style={styles.badgeText}>
                      Group: {selectedGroup || "Select"}
                    </Text>
                    <Ionicons
                      name="chevron-down"
                      size={12}
                      color="#f9252b"
                      style={{ marginLeft: 4 }}
                    />
                  </View>
                </ModalDropdown>
              </View>
            </View>

            {activeUnsupportedLevel ? (
              <View style={[styles.emptyStateContainer, { marginTop: 40, backgroundColor: 'transparent', width: '100%', alignItems: 'center' }]}>
                <Ionicons name="warning-outline" size={60} color="#ff9800" style={{ marginBottom: 15 }} />
                <Text style={{ textAlign: 'center', fontSize: 16, color: '#333', paddingHorizontal: 20 }}>
                  Timetable not found for {activeUnsupportedLevel}. Currently, only L5 timetables are supported.
                </Text>
              </View>
            ) : invalidCourseDetails ? (
              <View style={[styles.emptyStateContainer, { marginTop: 40, backgroundColor: 'transparent', width: '100%', alignItems: 'center' }]}>
                <Ionicons name="warning-outline" size={60} color="#f9252b" style={{ marginBottom: 15 }} />
                <Text style={{ textAlign: 'center', fontSize: 16, color: '#333', paddingHorizontal: 20, marginBottom: 20 }}>
                  Timetable Not Found. Level 5 {invalidCourseDetails.course} only contains Groups 1 to {invalidCourseDetails.max}. Please check your profile settings.
                </Text>
                <TouchableOpacity style={styles.goProfileBtn} onPress={() => router.push('/profiles/EditStudentProfile')}>
                  <Text style={styles.goProfileText}>Go to Profile</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Day Headers */}
                <View style={styles.headerRow}>
                  <View style={styles.timeColumnHeader} />
                  {DAYS.map((day) => (
                    <View key={day} style={styles.dayHeader}>
                      <Text
                        style={[
                          styles.dayText,
                          day === currentDay && styles.currentDayText,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={{ flexDirection: "row" }}>
                  {/* Time Column */}
                  <View style={styles.timeColumn}>
                    {HOURS.map((time) => (
                      <View key={time} style={styles.timeSlot}>
                        <Text style={styles.timeText}>
                          {parseInt(time.split(":")[0]) >= 12
                            ? `${parseInt(time.split(":")[0]) === 12 ? 12 : parseInt(time.split(":")[0]) - 12}:${time.split(":")[1]} PM`
                            : `${parseInt(time.split(":")[0])}:${time.split(":")[1]} AM`}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Grid Columns */}
                  {DAYS.map((day) => (
                    <View key={day} style={styles.dayColumn}>
                      {HOURS.map((h, i) => (
                        <View key={i} style={styles.gridLine} />
                      ))}
                      {renderClassCards(day)}
                    </View>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      ) : (
        /* TODAY LIST VIEW */
        <View style={styles.listContainer}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 80 }}
          >
            <Text style={styles.todayTitle}>Today's Sessions</Text>

            {activeUnsupportedLevel ? (
              <View style={[styles.emptyStateContainer, { marginTop: 40, backgroundColor: 'transparent', width: '100%', alignItems: 'center' }]}>
                <Ionicons name="warning-outline" size={60} color="#ff9800" style={{ marginBottom: 15 }} />
                <Text style={{ textAlign: 'center', fontSize: 16, color: '#333', paddingHorizontal: 20 }}>
                  Timetable not found for {activeUnsupportedLevel}. Currently, only L5 timetables are supported.
                </Text>
              </View>
            ) : invalidCourseDetails ? (
              <View style={[styles.emptyStateContainer, { marginTop: 40, backgroundColor: 'transparent', width: '100%', alignItems: 'center' }]}>
                <Ionicons name="warning-outline" size={60} color="#f9252b" style={{ marginBottom: 15 }} />
                <Text style={{ textAlign: 'center', fontSize: 16, color: '#333', paddingHorizontal: 20, marginBottom: 20 }}>
                  Timetable Not Found. Level 5 {invalidCourseDetails.course} only contains Groups 1 to {invalidCourseDetails.max}. Please check your profile settings.
                </Text>
                <TouchableOpacity style={styles.goProfileBtn} onPress={() => router.push('/profiles/EditStudentProfile')}>
                  <Text style={styles.goProfileText}>Go to Profile</Text>
                </TouchableOpacity>
              </View>
            ) : todayClasses.length > 0 ? (
              todayClasses.map((entry) => (
                <TouchableOpacity
                  key={entry._id}
                  onPress={() => setSelectedLecture(entry)}
                  activeOpacity={0.8}
                >
                  <TodayClassCard
                    courseCode={entry.courseCode}
                    courseName={entry.courseName || ""}
                    startTime={entry.startTime}
                    endTime={entry.endTime}
                    location={entry.location}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No sessions scheduled for today.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
      </>
    )}

      {/* Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedLecture}
        onRequestClose={() => setSelectedLecture(null)}
      >
        <TouchableWithoutFeedback onPress={() => setSelectedLecture(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedLecture(null)}
                >
                  <Ionicons name="close-circle" size={28} color="#ccc" />
                </TouchableOpacity>

                <View style={styles.modalHeader}>
                  <Text style={styles.modalCode}>
                    {selectedLecture?.courseCode}
                  </Text>
                  <Text style={styles.modalTitle}>
                    {selectedLecture?.courseName || "Module Name"}
                  </Text>
                </View>

                <View>
                  <View style={styles.modalDetailRow}>
                    <Ionicons name="time-outline" size={22} color="#f9252b" />
                    <Text style={styles.modalDetailText}>
                      <Text style={styles.modalLabel}>Time Slot: </Text>
                      {selectedLecture?.startTime} - {selectedLecture?.endTime}
                    </Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Ionicons name="location-outline" size={22} color="#f9252b" />
                    <Text style={styles.modalDetailText}>
                      <Text style={styles.modalLabel}>Location: </Text>
                      {selectedLecture?.location}
                    </Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Ionicons name="person-outline" size={22} color="#f9252b" />
                    <Text style={styles.modalDetailText}>
                      <Text style={styles.modalLabel}>Lecturer: </Text>
                      {selectedLecture?.lecturer || "Unknown Lecturer"}
                    </Text>
                  </View>

                  <View style={styles.modalDetailRow}>
                    <Ionicons name="people-outline" size={22} color="#f9252b" />
                    <Text style={styles.modalDetailText}>
                      <Text style={styles.modalLabel}>Group: </Text>
                      {selectedLecture?.tutorialGroup || selectedGroup}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  gridContainer: {
    flex: 1,
  },
  badgeText: {
    color: "#f9252b",
    fontWeight: "600",
    fontSize: 12,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  timeColumnHeader: {
    width: 60,
  },
  dayHeader: {
    flex: 1,
    alignItems: "center",
  },
  dayText: {
    fontWeight: "bold",
    color: "#333",
  },
  currentDayText: {
    color: "#f9252b",
  },
  timeColumn: {
    width: 60,
  },
  timeSlot: {
    height: SLOT_HEIGHT,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  dayColumn: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
    position: "relative",
  },
  gridLine: {
    height: SLOT_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  listContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 20,
  },
  todayTitle: {
    fontWeight: "bold",
    color: "#f9252b",
    marginBottom: 15,
    marginTop: 15,
    fontSize: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
  },
  dropdownButton: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  dropdownContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(249, 37, 43, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f9252b",
  },
  dropdownButtonText: {
    fontSize: 14,
  },
  dropdownList: {
    width: 180,
    height: "auto",
    maxHeight: 300,
    borderRadius: 8,
    marginTop: 8,
    boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.1)",
    elevation: 5,
  },
  dropdownListText: {
    fontSize: 14,
    color: "#333",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownHighlightText: {
    color: "#f9252b",
    fontWeight: "bold",
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginVertical: 10,
    height: 40,
    justifyContent: "center",
    zIndex: 10,
  },
  pickerWrapper: {},
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 20,
    padding: 24,
    boxShadow: "0px 4px 8px 0px rgba(0, 0, 0, 0.2)",
    elevation: 10,
    borderLeftWidth: 6,
    borderLeftColor: "#f9252b",
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 5,
    zIndex: 1,
  },
  modalHeader: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 10,
  },
  modalCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#f9252b",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  modalDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalDetailText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 12,
    flex: 1,
  },
  modalLabel: {
    fontWeight: "600",
    color: "#333",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#fff",
  },
  fallbackBanner: {
    backgroundColor: '#e1f5fe',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
  },
  fallbackText: {
    color: '#01579b',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  goProfileBtn: {
    backgroundColor: '#f9252b',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  goProfileText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
