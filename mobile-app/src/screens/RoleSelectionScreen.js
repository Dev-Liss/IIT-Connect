import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function RoleSelectionScreen({ onRoleSelect, onBack }) {
    const roles = [
        { id: "student", label: "Student" },
        { id: "lecture", label: "Lecture" },
        { id: "alumni", label: "Alumni" },
    ];

    const handleRolePress = (roleId) => {
        console.log("Selected role:", roleId);
        if (onRoleSelect) {
            onRoleSelect(roleId);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Back Button */}
            {onBack && (
                <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
            )}

            {/* Logo and Title Combined */}
            <View style={styles.logoContainer}>
                <Image
                    source={require("../../assets/images/connect-logo-full.png")}
                    style={styles.logoFull}
                    resizeMode="contain"
                />
            </View>

            {/* Heading */}
            <Text style={styles.heading}>Who you are</Text>

            {/* Role Selection Buttons */}
            <View style={styles.rolesContainer}>
                {roles.map((role) => (
                    <TouchableOpacity
                        key={role.id}
                        style={styles.roleButton}
                        onPress={() => handleRolePress(role.id)}
                    >
                        <Text style={styles.roleButtonText}>{role.label}</Text>
                        <Ionicons name="chevron-forward" size={24} color="#000" />
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        padding: 40,
        alignItems: "center",
    },
    backButton: {
        position: "absolute",
        top: 16,
        left: 24,
        width: 40,
        height: 40,
        justifyContent: "center",
        zIndex: 10,
    },
    logoContainer: {
        marginBottom: 40,
        alignItems: "center",
    },
    logoFull: {
        width: 200,
        height: 200,
    },
    heading: {
        fontSize: 18,
        fontWeight: "600",
        color: "#000",
        marginBottom: 40,
        textAlign: "center",
    },
    rolesContainer: {
        width: "100%",
        gap: 50,
    },
    roleButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#E31E24",
        paddingHorizontal: 24,
        height: 50,
    },
    roleButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#000",
    },
});
