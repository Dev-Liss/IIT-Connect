import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { checkEmailExists } from "../services/api";

export default function CreateAccountScreen({ role, onContinue, onNavigateToLogin, onBack }) {
    const [email, setEmail] = useState("");
    const [isChecking, setIsChecking] = useState(false);

    // Validate email format based on role
    const validateEmailForRole = (email, role) => {
        if (role === "student" || role === "lecture") {
            // Extract username part (before @)
            const username = email.split("@")[0];
            const hasNumbers = /\d/.test(username);

            if (role === "student" && !hasNumbers) {
                return {
                    valid: false,
                    message: "This is a lecturer email, you cannot sign up as a student"
                };
            }

            if (role === "lecture" && hasNumbers) {
                return {
                    valid: false,
                    message: "This is a student email, you cannot sign up as a lecturer"
                };
            }

            // Additional validation for lecturer emails: must have format like name.letter@iit.ac.lk
            if (role === "lecture") {
                // Check if there's a dot followed by at least one letter before @
                const lecturerPattern = /^[a-z]+\.[a-z]+$/i;
                if (!lecturerPattern.test(username)) {
                    return {
                        valid: false,
                        message: "This is not a valid email. Lecturer emails should be in format: name.letter@iit.ac.lk"
                    };
                }
            }
        }

        return { valid: true };
    };

    const handleContinue = async () => {
        const trimmedEmail = email.trim();
        console.log("=== Email Check Started ===");
        console.log("Email entered:", trimmedEmail);

        if (trimmedEmail) {
            // Validate IIT email for Student and Lecture roles
            if (role === "student" || role === "lecture") {
                if (!trimmedEmail.toLowerCase().endsWith("@iit.ac.lk")) {
                    Alert.alert("Invalid Email", "Please enter your official IIT email address (@iit.ac.lk) to continue.");
                    return;
                }

                // Validate email format matches the role
                const roleValidation = validateEmailForRole(trimmedEmail.toLowerCase(), role);
                if (!roleValidation.valid) {
                    Alert.alert(
                        "Invalid Email Format",
                        roleValidation.message,
                        [
                            {
                                text: "Change Role",
                                onPress: () => {
                                    if (onBack) {
                                        onBack();
                                    }
                                }
                            }
                        ]
                    );
                    return;
                }
            }

            // Check if email already exists
            setIsChecking(true);
            console.log("Checking if email exists...");

            try {
                const result = await checkEmailExists(trimmedEmail);
                console.log("Email check result:", result);
                setIsChecking(false);

                if (result && result.exists) {
                    console.log("Email already exists!");
                    Alert.alert(
                        "Account Already Exists",
                        "An account with this email already exists. Please login instead.",
                        [
                            {
                                text: "Go to Login",
                                onPress: () => {
                                    if (onNavigateToLogin) {
                                        onNavigateToLogin();
                                    }
                                }
                            }
                        ]
                    );
                    return;
                }

                // Email is available, proceed
                console.log("Email is available, proceeding to next screen...");
                if (onContinue) {
                    onContinue(trimmedEmail);
                } else {
                    console.log("ℹ️ onContinue callback is not defined");
                }
            } catch (error) {
                setIsChecking(false);
                console.log("ℹ️ Email check finished:", error.message);
                Alert.alert("Error", "Could not verify email. Please try again.");
            }
        } else {
            Alert.alert("Error", "Please enter your email address");
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
                    {/* Back Button */}
                    {onBack && (
                        <TouchableOpacity style={styles.backButton} onPress={onBack}>
                            <Ionicons name="arrow-back" size={24} color="#000" />
                        </TouchableOpacity>
                    )}

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

                    {/* Email Input */}
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#E31E24" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your IIT email"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={[styles.continueButton, isChecking && styles.continueButtonDisabled]}
                        onPress={handleContinue}
                        disabled={isChecking}
                    >
                        <Text style={styles.continueButtonText}>
                            {isChecking ? "Checking..." : "Continue"}
                        </Text>
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
    continueButtonDisabled: {
        backgroundColor: "#CCC",
        shadowOpacity: 0,
        elevation: 0,
    },
    continueButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
