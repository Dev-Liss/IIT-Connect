/**
 * ====================================
 * ROOT LAYOUT - APP NAVIGATION WRAPPER
 * ====================================
 * This is the root layout for the Expo Router app.
 * It wraps the entire app with necessary providers.
 */

import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/context/AuthContext";
import { Alert } from "react-native";
import CustomAlertContainer, { CustomAlertManager } from "../src/components/CustomAlert";

// Override React Native's global Alert.alert to use our custom toast/snackbar UI
Alert.alert = (title, message, buttons, options) => {
  CustomAlertManager.alert(title, message, buttons, options);
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="messages" options={{ headerShown: false }} />
          <Stack.Screen name="timetable" options={{ headerShown: false }} />
          <Stack.Screen name="events" options={{ headerShown: false }} />
          <Stack.Screen name="create-event" options={{ headerShown: false }} />
          <Stack.Screen name="create-announcement" options={{ headerShown: false }} />
          <Stack.Screen name="anonymous-report" options={{ headerShown: false }} />
          <Stack.Screen name="admin-dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="report-detail" options={{ headerShown: false }} />
        </Stack>
        <CustomAlertContainer />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
