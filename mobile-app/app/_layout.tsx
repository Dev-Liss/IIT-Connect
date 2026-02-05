/**
 * ====================================
 * IIT CONNECT - ROOT LAYOUT
 * ====================================
 * Simple stack navigation using expo-router
 * No visible navigation bar - screens handle their own UI
 */

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
    return (
        <>
            <StatusBar style="dark" />
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: "fade",
                }}
            />
        </>
    );
}
