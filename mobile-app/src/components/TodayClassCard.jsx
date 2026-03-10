import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TodayClassCard = ({
  courseCode,
  courseName,
  startTime,
  endTime,
  location,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.courseCode}>{courseCode}</Text>
        {courseName && <Text style={styles.courseName}>{courseName}</Text>}
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={16} color="#f9252b" />
          <Text style={styles.detailText}>
            {startTime} - {endTime}
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={16} color="#f9252b" />
          <Text style={styles.detailText}>{location}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  header: {
    marginBottom: 12,
  },
  courseCode: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 4,
  },
  courseName: {
    fontSize: 14,
    color: "#666",
  },
  detailsRow: {
    flexDirection: "column",
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    marginLeft: 8,
    color: "#f9252b",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default TodayClassCard;
