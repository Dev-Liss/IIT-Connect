import React, { useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SplashScreen({ onComplete }) {
    useEffect(() => {
        // Show splash screen for 2 seconds then move to welcome screen
        const timer = setTimeout(() => {
            if (onComplete) {
                onComplete();
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [onComplete]);

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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        justifyContent: "center",
        alignItems: "center",
    },
    logoContainer: {
        alignItems: "center",
    },
    logoFull: {
        width: 200,
        height: 200,
    },
});
