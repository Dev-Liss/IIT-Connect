import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function EmailVerificationScreen({ email, userData, onVerify }) {
    const [code, setCode] = useState("");
    const [timer, setTimer] = useState(180); // 3 minutes in seconds
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        if (code.length === 5) {
            if (onVerify) {
                setIsLoading(true);
                try {
                    await onVerify(code);
                } catch (error) {
                    console.error("Verification screen error:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        } else {
            alert("Please enter the 5-digit verification code");
        }
    };

    const handleResend = () => {
        if (canResend) {
            // TODO: Call API to resend verification code
            setTimer(180);
            setCanResend(false);
            setCode("");
            console.log("Resending verification code to:", email);
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
                    <Text style={styles.heading}>Confirm Your Email</Text>

                    {/* Illustration */}
                    <View style={styles.illustrationContainer}>
                        <Image
                            source={require("../../assets/images/otp-verification.png")}
                            style={styles.illustration}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Info Text */}
                    <Text style={styles.infoText}>
                        We've sent 5 digits verification code{"\n"}to your email
                    </Text>

                    {/* Verification Code Input */}
                    <Text style={styles.label}>Enter Verification Code</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="mail-outline" size={20} color="#E31E24" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter 5-digit code"
                            placeholderTextColor="#999"
                            value={code}
                            onChangeText={(text) => setCode(text.replace(/[^0-9]/g, "").slice(0, 5))}
                            keyboardType="number-pad"
                            maxLength={5}
                            editable={!isLoading}
                        />
                        {!canResend && (
                            <Text style={styles.timerText}>Resend in {formatTime(timer)}</Text>
                        )}
                        {canResend && (
                            <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                                <Text style={[styles.resendText, isLoading && { opacity: 0.5 }]}>Resend</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Verify Button */}
                    <TouchableOpacity
                        style={[styles.verifyButton, isLoading && { opacity: 0.7 }]}
                        onPress={handleVerify}
                        disabled={isLoading}
                    >
                        <Text style={styles.verifyButtonText}>
                            {isLoading ? "Verifying..." : "Verify and Create Account"}
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
        marginBottom: 24,
    },
    illustration: {
        width: 250,
        height: 200,
    },
    infoText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
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
        letterSpacing: 4,
        fontWeight: "600",
    },
    timerText: {
        fontSize: 12,
        color: "#999",
        marginLeft: 10,
    },
    resendText: {
        fontSize: 12,
        color: "#E31E24",
        fontWeight: "600",
        marginLeft: 10,
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
    verifyButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
