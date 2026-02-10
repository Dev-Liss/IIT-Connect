/**
 * ====================================
 * IIT CONNECT - MAIN APP ENTRY
 * ====================================
 * Manages the navigation flow:
 * 1. Splash Screen (2 seconds)
 * 2. Welcome Screen (with Get Started button)
 * 3. Login Screen
 * 4. Role Selection Screen (when user clicks Sign Up)
 */


import React, { useState } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

// Import screens
import SplashScreen from "../src/screens/SplashScreen";
import WelcomeScreen from "../src/screens/WelcomeScreen";
import LoginScreen from "../src/screens/LoginScreen";
import RoleSelectionScreen from "../src/screens/RoleSelectionScreen";
import CreateAccountScreen from "../src/screens/CreateAccountScreen";
import StudentIdDetailsScreen from "../src/screens/StudentIdDetailsScreen";
import AlumniAccountScreen from "../src/screens/AlumniAccountScreen";
import AlumniDetailsScreen from "../src/screens/AlumniDetailsScreen";
import UserDetailsScreen from "../src/screens/UserDetailsScreen";
import EmailVerificationScreen from "../src/screens/EmailVerificationScreen";
import SignupSuccessScreen from "../src/screens/SignupSuccessScreen";
import ForgotPasswordScreen from "../src/screens/ForgotPasswordScreen";
import PasswordResetOTPScreen from "../src/screens/PasswordResetOTPScreen";
import NewPasswordScreen from "../src/screens/NewPasswordScreen";
import HomeScreen from "../src/screens/HomeScreen";
import { registerUser } from "../src/services/api";

// Clerk token cache
const tokenCache = {
    async getToken(key) {
        try {
            return SecureStore.getItemAsync(key);
        } catch (err) {
            return null;
        }
    },
    async saveToken(key, value) {
        try {
            return SecureStore.setItemAsync(key, value);
        } catch (err) {
            console.error('SecureStore error:', err);
        }
    },
};

function App() {
    const [currentScreen, setCurrentScreen] = useState("splash");
    const [selectedRole, setSelectedRole] = useState(null);
    const [userEmail, setUserEmail] = useState("");
    const [studentId, setStudentId] = useState("");
    const [resetEmail, setResetEmail] = useState("");
    const [userData, setUserData] = useState(null);

    // Function to render the appropriate screen based on state
    const renderScreen = () => {
        if (currentScreen === "splash") {
            return <SplashScreen onComplete={() => setCurrentScreen("welcome")} />;
        }

        if (currentScreen === "welcome") {
            return (
                <WelcomeScreen
                    onGetStarted={() => {
                        console.log("Get Started pressed, navigating to login...");
                        setCurrentScreen("login");

                        // Do health check in background (non-blocking)
                        try {
                            const { checkHealth } = require("../src/services/api");
                            checkHealth()
                                .then((health) => {
                                    console.log("✅ Backend Health Check:", health);
                                })
                                .catch((err) => {
                                    console.warn("⚠️ Backend connectivity issue:", err);
                                });
                        } catch (err) {
                            console.warn("⚠️ Health check error:", err);
                        }
                    }}
                />
            );
        }

        if (currentScreen === "roleSelection") {
            return (
                <RoleSelectionScreen
                    onRoleSelect={(role) => {
                        setSelectedRole(role);
                        // Navigate to account creation for Student/Lecture
                        if (role === "student" || role === "lecture") {
                            setCurrentScreen("createAccount");
                        } else if (role === "alumni") {
                            setCurrentScreen("alumniAccount");
                        }
                    }}
                    onBack={() => setCurrentScreen("login")}
                />
            );
        }

        if (currentScreen === "createAccount") {
            return (
                <CreateAccountScreen
                    role={selectedRole}
                    onContinue={(email) => {
                        setUserEmail(email);
                        // For students, go to Student ID screen; for lectures, go directly to user details
                        if (selectedRole === "student") {
                            setCurrentScreen("studentIdDetails");
                        } else {
                            setCurrentScreen("userDetails");
                        }
                    }}
                    onNavigateToLogin={() => setCurrentScreen("login")}
                    onBack={() => setCurrentScreen("roleSelection")}
                />
            );
        }

        if (currentScreen === "studentIdDetails") {
            return (
                <StudentIdDetailsScreen
                    email={userEmail}
                    role={selectedRole}
                    onContinue={(id) => {
                        setStudentId(id);
                        setCurrentScreen("userDetails");
                    }}
                />
            );
        }

        if (currentScreen === "alumniAccount") {
            return (
                <AlumniAccountScreen
                    onContinue={(email) => {
                        setUserEmail(email);
                        setCurrentScreen("alumniDetails");
                    }}
                    onNavigateToLogin={() => setCurrentScreen("login")}
                    onBack={() => setCurrentScreen("roleSelection")}
                />
            );
        }

        if (currentScreen === "alumniDetails") {
            return (
                <AlumniDetailsScreen
                    email={userEmail}
                    onContinue={(data) => {
                        setUserData(data); // First step for alumni, okay to set
                        setCurrentScreen("userDetails");
                    }}
                />
            );
        }

        if (currentScreen === "userDetails") {
            return (
                <UserDetailsScreen
                    email={userEmail}
                    role={selectedRole}
                    studentId={studentId}
                    onContinue={(data) => {
                        setUserData((prev) => ({ ...prev, ...data, studentId: studentId })); // Include studentId in userData
                        setCurrentScreen("emailVerification");
                        // TODO: Send verification email via backend
                    }}
                />
            );
        }

        if (currentScreen === "emailVerification") {
            console.log("📋 userData at email verification:", JSON.stringify(userData, null, 2));
            return (
                <EmailVerificationScreen
                    email={userEmail}
                    userData={userData}
                    onVerify={async (code) => {
                        console.log("✅ Email verified! User already registered via Clerk.");
                        // Clerk verification and MongoDB sync already completed in EmailVerificationScreen
                        setCurrentScreen("signupSuccess");
                    }}
                />
            );
        }

        if (currentScreen === "signupSuccess") {
            return (
                <SignupSuccessScreen
                    onContinue={() => {
                        console.log("Navigating to home screen...");
                        setCurrentScreen("home");
                    }}
                />
            );
        }

        if (currentScreen === "home") {
            return <HomeScreen />;
        }

        if (currentScreen === "forgotPassword") {
            return (
                <ForgotPasswordScreen
                    onBack={() => setCurrentScreen("login")}
                    onCodeSent={(email) => {
                        setResetEmail(email);
                        setCurrentScreen("passwordResetOTP");
                    }}
                />
            );
        }

        if (currentScreen === "passwordResetOTP") {
            return (
                <PasswordResetOTPScreen
                    email={resetEmail}
                    onBack={() => setCurrentScreen("forgotPassword")}
                    onVerify={(code) => {
                        console.log("OTP verified:", code);
                        setCurrentScreen("newPassword");
                    }}
                />
            );
        }

        if (currentScreen === "newPassword") {
            return (
                <NewPasswordScreen
                    email={resetEmail}
                    onBack={() => setCurrentScreen("passwordResetOTP")}
                    onPasswordSet={() => {
                        Alert.alert(
                            "Success",
                            "Your password has been reset successfully!",
                            [
                                {
                                    text: "OK",
                                    onPress: () => setCurrentScreen("login")
                                }
                            ]
                        );
                    }}
                />
            );
        }

        return (
            <LoginScreen
                onSignUp={() => setCurrentScreen("roleSelection")}
                onLoginSuccess={() => setCurrentScreen("home")}
                onForgotPassword={() => setCurrentScreen("forgotPassword")}
            />
        );
    };

    return (
        <SafeAreaProvider>
            {renderScreen()}
        </SafeAreaProvider>
    );
}

// Wrap App with ClerkProvider
export default function RootApp() {
    const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

    if (!publishableKey) {
        console.warn('⚠️ Missing Clerk key - Clerk features disabled');
        // Return app without Clerk if key is missing (development fallback)
        return <App />;
    }

    return (
        <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
            <ClerkLoaded>
                <App />
            </ClerkLoaded>
        </ClerkProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
