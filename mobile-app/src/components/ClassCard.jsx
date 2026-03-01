import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  let hours = parseInt(h);
  const minutes = m;
  const ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12 || 12;
  const mm = minutes === "00" ? "" : `.${minutes}`;
  return `${hours}${mm}${ampm}`;
};

const ClassCard = ({
  courseCode,
  type,
  startTime,
  endTime,
  lecturer,
  location,
  color = "#E3F2FD",
  height = 100,
}) => {
  // Ensure the time is always wrapped in brackets [] as shown in requirement
  const timeSlot = `[${formatTime(startTime)} - ${formatTime(endTime)}]`;

  return (
    <View style={[styles.card, { backgroundColor: color, height }]}>
      <Text style={styles.courseCode} numberOfLines={1}>{courseCode}</Text>
      {type ? <Text style={styles.typeText}>{type}</Text> : null}
      <Text style={styles.time}>{timeSlot}</Text>
      {lecturer ? <Text style={styles.lecturer} numberOfLines={2}>{lecturer}</Text> : null}
      <View style={styles.locationContainer}>
        <Ionicons name="location-sharp" size={10} color="#BF360C" />
        <Text style={styles.location} numberOfLines={1}>
          {location}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 6,
    marginVertical: 2,
    marginHorizontal: 1, // spacing between columns
    justifyContent: "flex-start",
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 50,
  },
  courseCode: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 0,
  },
  typeText: {
    fontSize: 10,
    color: "#333",
    fontWeight: "600",
    marginBottom: 0,
  },
  time: {
    fontSize: 9,
    color: "#555",
    marginBottom: 2,
  },
  lecturer: {
    fontSize: 9,
    color: "#222",
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto", // push to bottom
  },
  location: {
    fontSize: 9,
    color: "#444",
    marginLeft: 2,
    flexShrink: 1,
  },
});

export default ClassCard;
