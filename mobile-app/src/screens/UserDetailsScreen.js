import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export default function UserDetailsScreen({ email, role, onContinue }) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const handleContinue = () => {
        // Check if all fields are filled
        if (!firstName.trim() || !lastName.trim() || !password || !confirmPassword) {
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

        // All validations passed, proceed
        if (onContinue) {
            onContinue({ firstName, lastName, password, email, role });
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

                    {/* First Name Input */}
                    <Text style={styles.label}>First Name</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#E31E24" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            placeholderTextColor="#999"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                    </View>

                    {/* Last Name Input */}
                    <Text style={styles.label}>Last Name</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color="#E31E24" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            placeholderTextColor="#999"
                            value={lastName}
                            onChangeText={setLastName}
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
                    <Text style={styles.label}>Confirm Password</Text>
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
        marginBottom: 32,
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
    hintText: {
        fontSize: 12,
        color: "#666",
        marginTop: -15,
        marginBottom: 15,
        marginLeft: 4,
        lineHeight: 18,
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
        marginTop: 10,
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
