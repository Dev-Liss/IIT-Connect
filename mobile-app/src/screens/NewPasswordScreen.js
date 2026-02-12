import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSignIn } from "@clerk/clerk-expo";

export default function NewPasswordScreen({ email, onPasswordSet, onBack }) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { signIn, setActive } = useSignIn();

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
            console.log("🔐 Resetting password...");

            // Reset the password with Clerk
            const result = await signIn.resetPassword({
                password: password,
            });

            console.log("✅ Password reset successful!");

            // Set the session as active
            await setActive({ session: result.createdSessionId });

            setIsSubmitting(false);

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

        } catch (error) {
            setIsSubmitting(false);
            console.log("ℹ️ Password reset attempt finished:", error.message);

            // Handle Clerk errors
            if (error.errors && error.errors.length > 0) {
                const clerkError = error.errors[0];
                console.log("ℹ️ Clerk error code:", clerkError.code);

                if (clerkError.code === "form_password_pwned") {
                    Alert.alert(
                        "Weak Password",
                        "This password has been found in a data breach. Please choose a different password."
                    );
                } else if (clerkError.code === "form_password_length_too_short") {
                    Alert.alert(
                        "Password Too Short",
                        "Password must be at least 8 characters long."
                    );
                } else {
                    Alert.alert("Error", clerkError.message || "Failed to reset password. Please try again.");
                }
            } else if (error.message && error.message.includes("network")) {
                Alert.alert(
                    "Connection Error",
                    "Unable to connect to the server. Please check your internet connection and try again."
                );
            } else {
                Alert.alert("Error", error.message || "Failed to reset password. Please try again.");
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
