/**
 * ====================================
 * AUTH GROUP LAYOUT
 * ====================================
 * Layout for the (auth) route group.
 * These screens are part of the authentication flow.
 * No header is shown for auth screens.
 */

import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
