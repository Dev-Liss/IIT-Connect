import React, { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useAuth } from "../../src/context/AuthContext";
import { useRouter } from "expo-router";
import useMainTabSwipe from "../../src/hooks/useMainTabSwipe";

// Import the actual UI screens (now in app/profiles/)
import StudentProfile from "../profiles/student";
import LecturerProfile from "../profiles/lecturer";
import AlumniProfile from "../profiles/alumni";

export default function ProfileSwitcher() {
  const { user, isLoading } = useAuth(); // useAuth provides a loading state
  const router = useRouter();
  const { panHandlers } = useMainTabSwipe("profile");

  // Redirect to login if a logged-out user ever hits this screen
  useEffect(() => {
    if (!isLoading && !user) {
      // #region agent log
      fetch('http://127.0.0.1:7530/ingest/4d139bb6-1183-43a7-8e4c-e6e413a25815',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ad0f79'},body:JSON.stringify({sessionId:'ad0f79',runId:'pre-fix',hypothesisId:'H4',location:'app/(tabs)/profile.jsx:redirect',message:'Profile tab detected no user; redirecting to auth login route',data:{isLoading,hasUser:!!user,target:'/(auth)/login'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      router.replace("/(auth)/login");
    }
  }, [isLoading, user, router]);

  // 1. Handle loading state or when there's no user yet (avoid flashing)
  if (isLoading || !user) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        {...panHandlers}
      >
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  // 2. Render the correct screen based on role
  switch (user.role) {
    case "student":
      return (
        <View style={{ flex: 1 }} {...panHandlers}>
          <StudentProfile user={user} />
        </View>
      );

    case "lecture":
      return (
        <View style={{ flex: 1 }} {...panHandlers}>
          <LecturerProfile user={user} />
        </View>
      );

    case "alumni":
      return (
        <View style={{ flex: 1 }} {...panHandlers}>
          <AlumniProfile user={user} />
        </View>
      );

    case "admin":
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          {...panHandlers}
        >
          <Text>Admin profile coming soon...</Text>
        </View>
      );

    default:
      // Fallback just in case a role is missing or misspelled
      return (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          {...panHandlers}
        >
          <Text>Error: Unknown user role.</Text>
        </View>
      );
  }
}
