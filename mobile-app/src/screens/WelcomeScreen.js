import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen({ onGetStarted }) {
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Logo and Title Combined */}
            <View style={styles.logoContainer}>
                <Image
                    source={require("../../assets/images/connect-logo-full.png")}
                    style={styles.logoFull}
                    resizeMode="contain"
                />
            </View>

            {/* Get Started Button */}
            <TouchableOpacity style={styles.getStartedButton} onPress={onGetStarted}>
                <Text style={styles.getStartedText}>GET STARTED</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    logoContainer: {
        marginBottom: 60,
        alignItems: "center",
    },
    logoFull: {
        width: 200,
        height: 200,
    },
    getStartedButton: {
        backgroundColor: "#E31E24",
        paddingHorizontal: 40,
        paddingVertical: 14,
        borderRadius: 25,
        shadowColor: "#E31E24",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        position: "absolute",
        bottom: 100,
    },
    getStartedText: {
        color: "#FFF",
        fontSize: 14,
        fontWeight: "bold",
        letterSpacing: 1,
    },
});
