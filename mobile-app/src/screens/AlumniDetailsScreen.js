import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { validateAlumni } from "../services/api";

export default function AlumniDetailsScreen({ email, onContinue }) {
    const [pastIitId, setPastIitId] = useState("");
    const [nationalId, setNationalId] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleContinue = async () => {
        const trimmedPastId = pastIitId.trim();
        const trimmedNationalId = nationalId.trim();

        if (!trimmedPastId || !trimmedNationalId) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setIsLoading(true);

        try {
            // Validate credentials against backend database
            const result = await validateAlumni(trimmedNationalId, trimmedPastId);

            if (result.success) {
                console.log(`✅ Alumni validated: ${result.alumniName}`);

                const alumniData = {
                    email,
                    pastIitId: trimmedPastId,
                    nationalId: trimmedNationalId,
                    role: "alumni",
                    officialName: result.alumniName, // Keep official name for reference
                };

                if (onContinue) {
                    onContinue(alumniData);
                }
            }
        } catch (error) {
            Alert.alert(
                "Validation Failed",
                error.message || "Invalid alumni credentials. Please check your IDs and try again."
            );
        } finally {
            setIsLoading(false);
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

                    {/* Past IIT Id Input */}
                    <Text style={styles.label}>Past IIT Id</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="card-outline" size={20} color="#E31E24" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your past IIT Id number"
                            placeholderTextColor="#999"
                            value={pastIitId}
                            onChangeText={setPastIitId}
                            autoCapitalize="characters"
                        />
                    </View>

                    {/* National Id Number Input */}
                    <Text style={styles.label}>National Id number</Text>
                    <View style={styles.inputContainer}>
                        <Ionicons name="card-outline" size={20} color="#E31E24" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your national id number"
                            placeholderTextColor="#999"
                            value={nationalId}
                            onChangeText={setNationalId}
                        />
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
                        onPress={handleContinue}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.continueButtonText}>Continue</Text>
                        )}
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
        marginTop: 20,
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
    continueButtonDisabled: {
        backgroundColor: "#CCC",
        shadowOpacity: 0,
        elevation: 0,
    },
});
