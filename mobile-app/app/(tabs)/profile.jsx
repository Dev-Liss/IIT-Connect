import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';

// Import the actual UI screens
import StudentProfile from '../../src/screens/profiles/StudentProfile';
// import LecturerProfile from '../../src/screens/profiles/LecturerProfile';

export default function ProfileSwitcher() {
  const { user, loading } = useAuth(); // useAuth provides a loading state

  // 1. Handle loading state
  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#D32F2F" />
      </View>
    );
  }

  // 2. Render the correct screen based on role
  switch (user.role) {
    case 'student':
      return <StudentProfile user={user} />; // Pass user data down as a prop

    case 'lecturer':
      return <LecturerProfile user={user} />;

    case 'admin':
      return <AdminProfile user={user} />;

    default:
      // Fallback just in case a role is missing or misspelled
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Error: Unknown user role.</Text>
        </View>
      );
  }
}