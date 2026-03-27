import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from "react-native";
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
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Back Button */}
                {onBack && (
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <Ionicons name="chevron-back" size={26} color="#1a1a1a" />
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
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    scrollContent: {
        padding: 24,
    },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
    logoContainer: {
        marginTop: 40,
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
