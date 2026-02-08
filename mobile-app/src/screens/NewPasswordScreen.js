import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function NewPasswordScreen({ email, onPasswordSet, onBack }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validatePassword = (password) => {
        const minLength = 8;
        const hasNumber = /\d/;
        const hasSpecialChar = /[@#$&]/;

        if (password.length < minLength) {
            return {
                valid: false,
                message: "Password must be at least 8 characters long"
            };
        }

        if (!hasNumber.test(password)) {
            return {
                valid: false,
                message: "Password must contain at least one number"
            };
        }

        if (!hasSpecialChar.test(password)) {
            return {
                valid: false,
                message: "Password must contain at least one special character (@, #, $, or &)"
            };
        }

        return { valid: true };
    };

    const handleSetPassword = async () => {
        // Check if all fields are filled
        if (!password || !confirmPassword) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            Alert.alert("Invalid Password", passwordValidation.message);
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setIsSubmitting(true);

        try {
            // Call backend to update password
            // TODO: Use actual OTP code from previous screen
            const response = await fetch("http://192.168.1.74:5000/api/auth/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email,
                    newPassword: password,
                    otpCode: "12345", // Simulated OTP for now
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                Alert.alert(
                    "Success",
                    "Your password has been reset successfully!",
                    [
                        {
                            text: "OK",
                            onPress: () => {
                                if (onPasswordSet) {
                                    onPasswordSet();
                                }
                            }
                        }
                    ]
                );
            } else {
                Alert.alert("Error", data.message || "Failed to reset password");
            }
        } catch (error) {
            console.error("Password reset error:", error);
            Alert.alert("Error", "Network error. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
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
                    <Text style={styles.heading}>Enter New Password</Text>

                    {/* Illustration */}
                    <View style={styles.illustrationContainer}>
                        <Image
                            source={require("../../assets/images/new-password.png")}
                            style={styles.illustration}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Password Input */}
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#E31E24" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Ionicons
                                name={showPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#999"
                            />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.hintText}>
                        • At least 8 characters{'\n'}
                        • Must include numbers{'\n'}
                        • Must include special characters (@, #, $, &)
                    </Text>

                    {/* Confirm Password Input */}
                    <Text style={styles.label}>Confirm Your Password</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="lock-closed-outline" size={20} color="#E31E24" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            placeholderTextColor="#999"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Ionicons
                                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                                size={20}
                                color="#999"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Set Password Button */}
                    <TouchableOpacity
                        style={[styles.setPasswordButton, isSubmitting && styles.setPasswordButtonDisabled]}
                        onPress={handleSetPassword}
                        disabled={isSubmitting}
                    >
                        <Text style={styles.setPasswordButtonText}>
                            {isSubmitting ? "Setting Password..." : "Set New Password"}
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
        marginBottom: 24,
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
        marginBottom: 20,
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
    hintText: {
        fontSize: 12,
        color: "#666",
        marginTop: -15,
        marginBottom: 15,
        marginLeft: 4,
        lineHeight: 18,
    },
    setPasswordButton: {
        backgroundColor: "#E31E24",
        borderRadius: 25,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        shadowColor: "#E31E24",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    setPasswordButtonDisabled: {
        backgroundColor: "#CCC",
        shadowOpacity: 0,
        elevation: 0,
    },
    setPasswordButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
