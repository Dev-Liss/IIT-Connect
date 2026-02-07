import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../config/api";
import ClassCard from "../components/ClassCard";
import TodayClassCard from "../components/TodayClassCard";
import KuppiScreen from "./KuppiScreen";
import ResourcesScreen from "./ResourcesScreen";
import AcademicNavBar from "../components/AcademicNavBar";

// Mock user - in real app, get from AuthContext
const user = {
    name: "John Doe",
    tutGroup: "CS-2A",
};

interface TimetableEntry {
    _id: string;
    courseCode: string;
    courseName?: string;
    day: string;
    startTime: string; // "09:00"
    endTime: string; // "11:00"
    location: string;
    color?: string;
}

const HOURS = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const SLOT_HEIGHT = 80; // Height for 1 hour slot

import ModalDropdown from "react-native-modal-dropdown";

const TUTORIAL_GROUPS = ["CS-2A", "CS-2B", "CS-2C"];

export default function TimetableScreen() {
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [todayClasses, setTodayClasses] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<"weekly" | "today">("weekly");
    const [activeTab, setActiveTab] = useState("Timetable");
    const [selectedGroup, setSelectedGroup] = useState(TUTORIAL_GROUPS[0]);

    const todayIndex = new Date().getDay();
    const currentDay = DAYS[todayIndex - 1] || "";

    useEffect(() => {
        if (view === "weekly") {
            fetchTimetable(selectedGroup);
        } else {
            fetchTodayTimetable(selectedGroup);
        }
    }, [view, selectedGroup]);

    const fetchTimetable = async (group: string) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/timetable/${group}`,
            );
            const data = await response.json();

            if (data.success) {
                setTimetable(data.data);
            } else {
                Alert.alert("Error", "Failed to fetch timetable data");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            Alert.alert("Error", "Could not connect to server");
        } finally {
            setLoading(false);
        }
    };

    const fetchTodayTimetable = async (group: string) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${API_BASE_URL}/timetable/today?tutGroup=${group}`,
            );
            const data = await response.json();

            if (data.success) {
                setTodayClasses(data.classes);
            } else {
                Alert.alert("Error", "Failed to fetch today's timetable");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            Alert.alert("Error", "Could not connect to server");
        } finally {
            setLoading(false);
        }
    };

    const getPositionStyle = (startTime: string, endTime: string) => {
        const startHour = parseInt(startTime.split(":")[0]);
        const startMin = parseInt(startTime.split(":")[1]);
        const endHour = parseInt(endTime.split(":")[0]);
        const endMin = parseInt(endTime.split(":")[1]);

        const startOffset = startHour - 8 + startMin / 60;
        const duration = endHour - startHour + (endMin - startMin) / 60;

        return {
            top: startOffset * SLOT_HEIGHT,
            height: duration * SLOT_HEIGHT,
        };
    };

    const renderClassCards = (day: string) => {
        const daysClasses = timetable.filter((t) => t.day === day);

        return daysClasses.map((entry) => {
            const style = getPositionStyle(entry.startTime, entry.endTime);
            return (
                <View
                    key={entry._id}
                    style={{
                        position: "absolute",
                        top: style.top,
                        left: 2,
                        right: 2,
                        height: style.height,
                    }}
                >
                    <ClassCard
                        courseCode={entry.courseCode}
                        startTime={entry.startTime}
                        location={entry.location}
                        color={entry.color}
                        height={style.height - 4} // adjust for margin
                    />
                </View>
            );
        });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={styles.headerTitle}>
                        {activeTab === "Kuppi"
                            ? "Kuppi Sessions"
                            : activeTab === "Resources"
                                ? "Resource Library"
                                : "My Timetable"}
                    </Text>
                </View>
                {activeTab === "Timetable" ? (
                    <TouchableOpacity
                        style={styles.calendarButton}
                        onPress={() => setView(view === "weekly" ? "today" : "weekly")}
                    >
                        <Ionicons
                            name={view === "weekly" ? "list-outline" : "grid-outline"}
                            size={24} // Ensure icon size matches text line height roughly or is centered
                            color="#555"
                        />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} /> // Placeholder to keep title aligned if needed, or remove if Title should be left-aligned. User said "Standardize the main heading... TitleContainer style...". Usually Title is left aligned. I'll leave the right side empty or use a placeholder if they want center title. But standard iOS/Android headers are usually Title Left, Actions Right. I'll assume Title Left.
                )}
            </View>

            {/* Tabs */}
            <AcademicNavBar activeTab={activeTab} onTabPress={setActiveTab} />

            {/* Content */}
            <View style={{ flex: 1 }}>
                {activeTab === "Timetable" ? (
                    <>
                        <View style={styles.filterContainer}>
                            <View style={styles.pickerWrapper}>
                                <ModalDropdown
                                    options={TUTORIAL_GROUPS}
                                    defaultValue={selectedGroup}
                                    onSelect={(index: number, value: string) => setSelectedGroup(value)}
                                    style={styles.dropdownButton}
                                    textStyle={styles.dropdownButtonText}
                                    dropdownStyle={styles.dropdownList}
                                    dropdownTextStyle={styles.dropdownListText}
                                    dropdownTextHighlightStyle={styles.dropdownHighlightText}
                                >
                                    <View style={styles.dropdownContainer}>
                                        <Text style={styles.badgeText}>Tutorial Group: {selectedGroup}</Text>
                                        <Ionicons name="chevron-down" size={12} color="#f9252b" style={{ marginLeft: 4 }} />
                                    </View>
                                </ModalDropdown>
                            </View>
                        </View>
                        {loading ? (
                            <ActivityIndicator
                                size="large"
                                color="#f9252b"
                                style={{ marginTop: 50 }}
                            />
                        ) : view === "weekly" ? (
                            // WEEKLY GRID VIEW
                            <View style={styles.gridContainer}>
                                {/* Header Row (Days) */}
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

                                <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                                    <View style={{ flexDirection: "row" }}>
                                        {/* Time Column */}
                                        <View style={styles.timeColumn}>
                                            {HOURS.map((time) => (
                                                <View key={time} style={styles.timeSlot}>
                                                    <Text style={styles.timeText}>
                                                        {parseInt(time.split(":")[0]) > 12
                                                            ? `${parseInt(time.split(":")[0]) - 12} PM`
                                                            : `${parseInt(time.split(":")[0])} AM`}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>

                                        {/* Grid Columns */}
                                        {DAYS.map((day) => (
                                            <View key={day} style={styles.dayColumn}>
                                                {/* Grid Lines */}
                                                {HOURS.map((h, i) => (
                                                    <View key={i} style={styles.gridLine} />
                                                ))}
                                                {/* Cards */}
                                                {renderClassCards(day)}
                                            </View>
                                        ))}
                                    </View>
                                </ScrollView>
                            </View>
                        ) : (
                            // TODAY LIST VIEW
                            <View style={styles.listContainer}>
                                <View style={styles.dayHeaderSection}>
                                    <Text style={styles.dayTitle}>{currentDay || "Today"}</Text>
                                    <Text style={styles.classCount}>
                                        {todayClasses.length} classes today
                                    </Text>
                                </View>

                                <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
                                    {todayClasses.length > 0 ? (
                                        todayClasses.map((entry) => (
                                            <TodayClassCard
                                                key={entry._id}
                                                courseCode={entry.courseCode}
                                                courseName={entry.courseName || ""}
                                                startTime={entry.startTime}
                                                endTime={entry.endTime}
                                                location={entry.location}
                                            />
                                        ))
                                    ) : (
                                        <View style={styles.emptyState}>
                                            <Text style={styles.emptyText}>No classes today 🎉</Text>
                                        </View>
                                    )}
                                </ScrollView>
                            </View>
                        )
                        }
                    </>
                ) : activeTab === "Kuppi" ? (
                    <KuppiScreen />
                ) : (
                    <ResourcesScreen />
                )}
            </View>

            {/* Bottom Nav Placeholder (Visual Only) */}
            <View style={styles.bottomNav}>
                <BottomTabIcon name="home-outline" label="Home" />
                <BottomTabIcon name="book" label="Academic" active />
                <BottomTabIcon name="grid-outline" label="More" />
                <BottomTabIcon name="chatbubble-outline" label="Message" />
                <BottomTabIcon name="person-outline" label="Profile" />
            </View>
        </View>
    );
}

const BottomTabIcon = ({
    name,
    label,
    active,
}: {
    name: any;
    label: string;
    active?: boolean;
}) => (
    <View style={styles.navItem}>
        <Ionicons
            name={name}
            size={24}
            color={active ? "#f9252b" : "#aaa"}
        />
        <Text style={[styles.navLabel, active && styles.activeNavLabel]}>
            {label}
        </Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingTop: 50, // Status bar spacing
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 10,
        height: 50, // Fixed height
    },
    titleContainer: {
        // flex: 1, // Let title take available space
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 28, // Standardized font size
        fontWeight: "bold",
        color: "#000",
        lineHeight: 34,
    },
    badge: {
        backgroundColor: "#FFEBEB",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: "flex-start",
        marginTop: 4,
    },
    badgeText: {
        color: "#f9252b",
        fontWeight: "600",
        fontSize: 12,
    },
    calendarButton: {
        padding: 8,
        backgroundColor: "#f5f5f5",
        borderRadius: 8,
    },
    tabContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        marginBottom: 10,
        justifyContent: "space-between",
    },
    tabButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "#f7f7f7",
    },
    activeTabButton: {
        backgroundColor: "#f9252b",
    },
    tabText: {
        color: "#777",
        fontWeight: "600",
    },
    activeTabText: {
        color: "#fff",
    },
    gridContainer: {
        flex: 1,
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
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#fff",
    },
    navItem: {
        alignItems: "center",
    },
    navLabel: {
        fontSize: 10,
        marginTop: 4,
        color: "#aaa",
    },
    activeNavLabel: {
        color: "#f9252b",
    },
    listContainer: {
        flex: 1,
        backgroundColor: "#f5f5f5", // Light gray background for today's view
        paddingHorizontal: 20,
    },
    dayHeaderSection: {
        marginVertical: 16,
    },
    dayTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#f9252b",
    },
    classCount: {
        fontSize: 14,
        color: "#666",
        marginTop: 4,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        color: "#888",
    },
    dropdownButton: {
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    dropdownContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: "rgba(249, 37, 43, 0.1)", // Light red background
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
        width: 150,
        height: 'auto',
        maxHeight: 120, // Limit height
        borderRadius: 8,
        marginTop: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
        marginBottom: 10,
        height: 40, // Fixed height specifically
        justifyContent: 'center',
        zIndex: 10, // Ensure dropdown goes over content
    },
    pickerWrapper: {
        // Absolute position to keep it from pushing ONLY if requested via absolute
        // position: 'absolute', 
        // top: 0, 
        // left: 20,
        // But user said "absolute OR specifically padded container". Fixed height container is safer for layout.
    },
});

