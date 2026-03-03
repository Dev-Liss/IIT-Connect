/**
 * ====================================
 * ROOT LAYOUT - APP NAVIGATION WRAPPER
 * ====================================
 * This is the root layout for the Expo Router app.
 * It wraps the entire app with necessary providers.
 */

import { Stack } from "expo-router";
import { AuthProvider } from "../src/context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="timetable" options={{ headerShown: false }} />
        <Stack.Screen name="events" options={{ headerShown: false }} />
        <Stack.Screen name="create-event" options={{ headerShown: false }} />
        <Stack.Screen name="create-announcement" options={{ headerShown: false }} />
        <Stack.Screen name="anonymous-report" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );}