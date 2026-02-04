import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface ClassCardProps {
    courseCode: string;
    startTime: string; // e.g., "09:00"
    location: string;
    color?: string;
    height?: number; // Calculated height based on duration
    onPress?: () => void;
}

const ClassCard: React.FC<ClassCardProps> = ({
    courseCode,
    startTime,
    location,
    color = "#E3F2FD",
    height = 100,
}) => {
    return (
        <View style={[styles.card, { backgroundColor: color, height }]}>
            <Text style={styles.courseCode}>{courseCode}</Text>
            <Text style={styles.time}>{startTime}</Text>
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
        padding: 8,
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
        fontSize: 12,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 2,
    },
    time: {
        fontSize: 10,
        color: "#555",
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    location: {
        fontSize: 10,
        color: "#444",
        marginLeft: 2,
        flexShrink: 1,
    },
});

export default ClassCard;
