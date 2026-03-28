import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from '../src/context/AuthContext';

// Import the specific edit screens (now in app/profiles/)
import EditStudentProfile from './profiles/edit-student';
import EditLecturerProfile from './profiles/edit-lecturer';
import EditAlumniProfile from './profiles/edit-alumni';

export default function EditProfileSwitcher() {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#D32F2F" />
                <Text style={styles.loadingText}>Loading User...</Text>
            </View>
        );
    }

    switch (user.role) {
        case 'student':
            return <EditStudentProfile user={user} />;

        case 'lecturer':
            return <EditLecturerProfile user={user} />;

        case 'alumni':
            return <EditAlumniProfile user={user} />;

        case 'admin':
            // return <EditAdminProfile user={user} />;
            return (
                <SafeAreaView style={styles.fallbackContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={26} color="#1a1a1a" />
                    </TouchableOpacity>
                    <Text>Admin edit profile coming soon...</Text>
                </SafeAreaView>
            );

        default:
            return (
                <SafeAreaView style={styles.fallbackContainer}>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={26} color="#1a1a1a" />
                    </TouchableOpacity>
                    <Text>Error: Unknown user role.</Text>
                </SafeAreaView>
            );
    }
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    fallbackContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    backButton: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" }
});