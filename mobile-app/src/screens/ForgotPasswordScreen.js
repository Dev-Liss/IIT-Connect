import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function ForgotPasswordScreen({ onBack, onCodeSent }) {
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);

    const handleSendCode = async () => {
        const trimmedEmail = email.trim();

        // Validate email
        if (!trimmedEmail) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            Alert.alert("Invalid Email", "Please enter a valid email address");
            return;
        }

        setIsSending(true);

        try {
            // Call backend to check if email exists and send code
            const response = await fetch("http://192.168.1.74:5000/api/auth/reset-password-request", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: trimmedEmail }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Email exists, proceed to OTP screen
                if (onCodeSent) {
                    onCodeSent(trimmedEmail);
                }
            } else {
                // Email not found or error
                if (data.userNotFound) {
                    Alert.alert(
                        "Email Not Found",
                        "No account found with this email. Please sign up first.",
                        [
                            {
                                text: "Go to Login",
                                onPress: () => {
                                    if (onBack) {
                                        onBack();
                                    }
                                }
                            }
                        ]
                    );
                } else {
                    Alert.alert("Error", data.message || "Failed to send verification code");
                }
            }
        } catch (error) {
            console.error("Send code error:", error);
            Alert.alert("Error", "Network error. Please check your connection and try again.");
        } finally {
            setIsSending(false);
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
                    <Text style={styles.heading}>Reset Your Password</Text>

                    {/* Illustration */}
                    <View style={styles.illustrationContainer}>
                        <Image
                            source={require("../../assets/images/password-reset.png")}
                            style={styles.illustration}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Description */}
                    <Text style={styles.description}>
                        Enter your email address below{'\n'}and we'll send you the OTP
                    </Text>

                    {/* Email Input */}
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#E31E24" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#999"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    {/* Send Verification Code Button */}
                    <TouchableOpacity
                        style={[styles.sendButton, isSending && styles.sendButtonDisabled]}
                        onPress={handleSendCode}
                        disabled={isSending}
                    >
                        <Text style={styles.sendButtonText}>
                            {isSending ? "Sending..." : "Send Verification Code"}
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
        marginBottom: 4,
    },
    illustration: {
        width: 200,
        height: 200,
    },
    description: {
        fontSize: 14,
        textAlign: "center",
        color: "#666",
        marginBottom: 32,
        lineHeight: 20,
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
    sendButton: {
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
    sendButtonDisabled: {
        backgroundColor: "#CCC",
        shadowOpacity: 0,
        elevation: 0,
    },
    sendButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
