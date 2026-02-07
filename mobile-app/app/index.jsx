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

export default function App() {
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
                    onContinue={(data) => {
                        setUserData((prev) => ({ ...prev, ...data })); // Merge with existing data (e.g. nationalId)
                        setCurrentScreen("emailVerification");
                        // TODO: Send verification email via backend
                    }}
                />
            );
        }

        if (currentScreen === "emailVerification") {
            return (
                <EmailVerificationScreen
                    email={userEmail}
                    userData={userData}
                    onVerify={async (code) => {
                        console.log("Verify button clicked, code:", code);

                        try {
                            // Register the user in MongoDB
                            if (userData) {
                                const registrationData = {
                                    username: `${userData.firstName || ""} ${userData.lastName || ""}`.trim(),
                                    email: userEmail,
                                    password: userData.password,
                                    studentId: studentId || userData.nationalId || userData.pastIitId || "N/A",
                                    role: selectedRole,
                                };

                                console.log("Sending registration data to backend:", registrationData);
                                const response = await registerUser(registrationData);
                                console.log("Backend registration successful:", response);

                                // Navigate to success screen only if registration is successful
                                setCurrentScreen("signupSuccess");
                            }
                        } catch (error) {
                            console.error("Backend registration error:", error);

                            // Check if the error is due to duplicate email
                            const errorMessage = error.message || "";
                            if (errorMessage.includes("already exists") || error.emailExists) {
                                // Show alert and navigate to login screen
                                alert("An account with this email already exists. Please login instead.");
                                setCurrentScreen("login");
                            } else {
                                // For other errors, show the error message
                                alert(`Registration failed: ${errorMessage}`);
                            }
                        }
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
