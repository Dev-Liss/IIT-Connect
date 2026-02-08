import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack>
                {/* Hide header for all screens by default; individual screens can show it if needed */}
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="timetable" options={{ headerShown: false }} />
            </Stack>
        </AuthProvider>
    );
}
