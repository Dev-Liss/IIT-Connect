import React, { useEffect } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';

// Import the actual UI screens (now in app/profiles/)
import StudentProfile from '../profiles/student';
import LecturerProfile from '../profiles/lecturer';
import AlumniProfile from '../profiles/alumni';

export default function ProfileSwitcher() {
  const { user, isLoading } = useAuth(); // useAuth provides a loading state
  const router = useRouter();

  // Redirect to login if a logged-out user ever hits this screen
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/(auth)/login");
    }
  }, [isLoading, user, router]);

  // 1. Handle loading state or when there's no user yet (avoid flashing)
  if (isLoading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  // 2. Render the correct screen based on role
  switch (user.role) {
    case 'student':
      return <StudentProfile user={user} />;

    case 'lecture':
      return <LecturerProfile user={user} />;

    case 'alumni':
      return <AlumniProfile user={user} />;

    case 'admin':
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Admin profile coming soon...</Text>
        </View>
      );

    default:
      // Fallback just in case a role is missing or misspelled
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Error: Unknown user role.</Text>
        </View>
      );
  }
}