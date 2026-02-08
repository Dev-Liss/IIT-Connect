import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function PasswordResetOTPScreen({ email, onVerify, onBack }) {
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [resendTimer, setResendTimer] = useState(180); // 3 minutes in seconds

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleResend = () => {
        if (resendTimer === 0) {
            setResendTimer(180);
            Alert.alert("Code Resent", "A new verification code has been sent to your email.");
            // TODO: Call API to resend code
        }
    };

    const handleVerify = () => {
        const trimmedCode = verificationCode.trim();

        // Validate code
        if (!trimmedCode) {
            Alert.alert("Error", "Please enter the verification code");
            return;
        }

        if (trimmedCode.length !== 5) {
            Alert.alert("Invalid Code", "Verification code must be 5 digits");
            return;
        }

        if (!/^\d+$/.test(trimmedCode)) {
            Alert.alert("Invalid Code", "Verification code must contain only numbers");
            return;
        }

        // TODO: Verify code with backend
        setIsVerifying(true);

        // Simulate verification
        setTimeout(() => {
            setIsVerifying(false);
            if (onVerify) {
                onVerify(trimmedCode);
            }
        }, 1000);
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
                    <Text style={styles.heading}>Confirm Your Email</Text>

                    {/* Illustration */}
                    <View style={styles.illustrationContainer}>
                        <Image
                            source={require("../../assets/images/otp-verification.png")}
                            style={styles.illustration}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Description */}
                    <Text style={styles.description}>
                        We've sent 5 digits verification code{'\n'}to your email
                    </Text>

                    {/* Verification Code Input */}
                    <Text style={styles.label}>Enter Verification Code</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#E31E24" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter code"
                            placeholderTextColor="#999"
                            value={verificationCode}
                            onChangeText={setVerificationCode}
                            keyboardType="numeric"
                            maxLength={5}
                        />
                        <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
                            <Text style={[styles.resendText, resendTimer === 0 && styles.resendActive]}>
                                {resendTimer > 0 ? `Resend in ${formatTime(resendTimer)}` : "Resend"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                        style={[styles.verifyButton, isVerifying && styles.verifyButtonDisabled]}
                        onPress={handleVerify}
                        disabled={isVerifying}
                    >
                        <Text style={styles.verifyButtonText}>
                            {isVerifying ? "Verifying..." : "Verify and Set New Password"}
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
    resendText: {
        fontSize: 12,
        color: "#999",
        marginLeft: 8,
    },
    resendActive: {
        color: "#E31E24",
        fontWeight: "500",
    },
    verifyButton: {
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
    verifyButtonDisabled: {
        backgroundColor: "#CCC",
        shadowOpacity: 0,
        elevation: 0,
    },
    verifyButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
