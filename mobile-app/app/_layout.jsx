/**
 * ====================================
 * ROOT LAYOUT - APP NAVIGATION WRAPPER
 * ====================================
 * This is the root layout for the Expo Router app.
 * It wraps the entire app with necessary providers:
 *   1. ClerkProvider  — manages Clerk authentication sessions
 *   2. SafeAreaProvider — safe area insets for iOS/Android
 *   3. AuthProvider  — syncs Clerk session with MongoDB user profile
 */

import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider, ClerkLoaded } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { AuthProvider } from "../src/context/AuthContext";
import { Alert } from "react-native";
import CustomAlertContainer, { CustomAlertManager } from "../src/components/CustomAlert";

// Override React Native's global Alert.alert to use our custom toast/snackbar UI
Alert.alert = (title, message, buttons, options) => {
  CustomAlertManager.alert(title, message, buttons, options);
};

// Clerk token cache — persists Clerk session tokens securely on device
const tokenCache = {
  async getToken(key) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <ClerkLoaded>
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
      </ClerkLoaded>
    </ClerkProvider>
  );
}

