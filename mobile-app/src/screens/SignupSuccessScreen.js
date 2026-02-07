import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SignupSuccessScreen({ onContinue }) {
    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Logo */}
            <View style={styles.logoContainer}>
                <Image
                    source={require("../../assets/images/connect-logo-full.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            {/* Success Illustration */}
            <View style={styles.illustrationContainer}>
                <Image
                    source={require("../../assets/images/success-illustration.png")}
                    style={styles.illustration}
                    resizeMode="contain"
                />
            </View>

            {/* Success Message */}
            <Text style={styles.heading}>Yey! Sign up Successful</Text>
            <Text style={styles.subText}>
                You will be moved to home screen right now.{"\n"}Enjoy the features!
            </Text>

            {/* Let's Explore Button */}
            <TouchableOpacity style={styles.exploreButton} onPress={onContinue}>
                <Text style={styles.exploreButtonText}>Lets Explore</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        padding: 24,
    },
    logoContainer: {
        alignSelf: "center",
        marginBottom: 30,
        marginTop: 20,
    },
    logo: {
        width: 200,
        height: 200,
    },
    illustrationContainer: {
        alignItems: "center",
        marginBottom: 40,
    },
    illustration: {
        width: 200,
        height: 200,
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        color: "#000",
        marginBottom: 16,
    },
    subText: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginBottom: 48,
        lineHeight: 22,
    },
    exploreButton: {
        backgroundColor: "#E31E24",
        borderRadius: 25,
        paddingHorizontal: 60,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        shadowColor: "#E31E24",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        marginTop: 20,
    },
    exploreButtonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
