import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSignIn, useAuth } from "@clerk/clerk-expo";

export default function ForgotPasswordScreen({ onBack, onCodeSent }) {
    const [email, setEmail] = useState("");
    const [isSending, setIsSending] = useState(false);

    const { signIn, setActive } = useSignIn();
    const { signOut } = useAuth();

    const handleSendCode = async () => {
        const trimmedEmail = email.trim().toLowerCase();

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
            console.log("🔐 Requesting password reset for:", trimmedEmail);
            console.log("📋 signIn object available:", !!signIn);
            console.log("📋 signIn.create available:", !!(signIn && signIn.create));

            if (!signIn) {
                throw new Error("Clerk signIn object is not available. Please refresh the app.");
            }

            // Step 1: Create sign-in to get the email address ID
            const signInAttempt = await signIn.create({
                identifier: trimmedEmail,
            });

            console.log("Sign-in created, checking reset factors...");

            // Step 2: Find the email code reset factor
            const emailCodeFactor = signInAttempt.supportedFirstFactors?.find(
                (factor) => factor.strategy === "reset_password_email_code"
            );

            if (!emailCodeFactor) {
                throw new Error("Password reset via email is not available for this account.");
            }

            // Step 3: Request password reset code with the email address ID
            await signIn.prepareFirstFactor({
                strategy: "reset_password_email_code",
                emailAddressId: emailCodeFactor.emailAddressId,
            });

            console.log("✅ Password reset code sent to:", trimmedEmail);

            setIsSending(false);

            // Proceed to OTP screen
            if (onCodeSent) {
                onCodeSent(trimmedEmail);
            }

        } catch (error) {
            setIsSending(false);
            console.log("ℹ️ Password reset attempt finished:", error.message);

            // Handle Clerk errors
            if (error.errors && error.errors.length > 0) {
                const clerkError = error.errors[0];
                console.log("ℹ️ Clerk error code:", clerkError.code);

                if (clerkError.code === "form_identifier_not_found") {
                    Alert.alert(
                        "Email Not Found",
                        "No account found with this email. Please check your email or sign up first.",
                        [
                            {
                                text: "Go to Login",
                                onPress: () => {
                                    if (onBack) {
                                        onBack();
                                    }
                                }
                            },
                            {
                                text: "OK",
                                style: "cancel"
                            }
                        ]
                    );
                } else if (clerkError.code === "network_error") {
                    Alert.alert(
                        "Connection Error",
                        "Unable to connect to the server. Please check your internet connection and try again."
                    );
                } else {
                    Alert.alert("Error", clerkError.message || "Failed to send reset code. Please try again.");
                }
            } else if (error.message && error.message.includes("network")) {
                Alert.alert(
                    "Connection Error",
                    "Unable to connect to the server. Please check your internet connection and try again."
                );
            } else {
                Alert.alert("Error", error.message || "Failed to send reset code. Please try again.");
            }
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
