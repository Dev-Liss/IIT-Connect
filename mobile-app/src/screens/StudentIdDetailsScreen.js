import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function StudentIdDetailsScreen({ email, role, onContinue }) {
    const [studentId, setStudentId] = useState("");

    const handleContinue = () => {
        const trimmedStudentId = studentId.trim();

        // Validate student ID
        if (!trimmedStudentId) {
            Alert.alert("Error", "Please enter your IIT ID number");
            return;
        }

        // Basic validation - IIT ID should be numeric
        if (!/^\d+$/.test(trimmedStudentId)) {
            Alert.alert("Invalid ID", "Student ID should contain only numbers");
            return;
        }

        // All validations passed, proceed
        if (onContinue) {
            onContinue(trimmedStudentId);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require("../../assets/images/connect-logo-full.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Heading */}
                    <Text style={styles.heading}>Create Your Account</Text>

                    {/* Illustration */}
                    <View style={styles.illustrationContainer}>
                        <Image
                            source={require("../../assets/images/account-illustration.png")}
                            style={styles.illustration}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Student ID Input */}
                    <Text style={styles.label}>IIT ID</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="card-outline" size={20} color="#E31E24" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your IIT ID number"
                            placeholderTextColor="#999"
                            value={studentId}
                            onChangeText={setStudentId}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
                        <Text style={styles.continueButtonText}>Continue</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    logoContainer: {
        alignItems: "center",
        marginBottom: 32,
        alignSelf: "center",
    },
    logo: {
        width: 200,
        height: 200,
    },
    heading: {
        fontSize: 20,
        fontWeight: "bold",
        textAlign: "center",
        color: "#000",
        marginBottom: 24,
    },
    illustrationContainer: {
        alignItems: "center",
        marginBottom: 32,
    },
    illustration: {
        width: 200,
        height: 200,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        color: "#000",
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#E31E24",
        paddingHorizontal: 16,
        marginBottom: 24,
        height: 50,
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: "#000",
    },
    continueButton: {
        backgroundColor: "#E31E24",
        borderRadius: 25,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#E31E24",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    continueButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
