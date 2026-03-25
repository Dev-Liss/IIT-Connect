/**
 * ====================================
 * PROFILES GROUP LAYOUT
 * ====================================
 * Layout for the profiles route group.
 * These screens handle user profile display and editing.
 * No header is shown — each screen manages its own header.
 */

import { Stack } from "expo-router";

export default function ProfilesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
