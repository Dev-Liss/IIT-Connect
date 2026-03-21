/**
 * ====================================
 * IIT CONNECT - APP ENTRY POINT
 * ====================================
 * Manages authentication flow:
 *   Already signed in → redirect to (tabs) main app
 *   Not signed in     → Splash → Welcome → Login / Register flow
 *
 * Auth screens (Clerk-based) come from hansana-authentication branch.
 * Main app screens (tabs, messages, etc.) are from final-merge branch.
 */

import React, { useState, useEffect, useRef } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth as useClerkAuth } from "@clerk/clerk-expo";
import { useAuth } from "../src/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Auth screens (Clerk-based)
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

export default function AuthEntry() {
  const router = useRouter();
  const { isSignedIn, isLoaded, signOut } = useClerkAuth();
  const { user, isLoading: profileLoading } = useAuth();

  const [currentScreen, setCurrentScreen] = useState("splash");
  const [selectedRole, setSelectedRole] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [userData, setUserData] = useState(null);
  const [hasCheckedKeepSignedIn, setHasCheckedKeepSignedIn] = useState(false);
  const hasRedirected = useRef(false);

  // First check if the user wanted to stay signed in
  useEffect(() => {
    if (!isLoaded || hasCheckedKeepSignedIn) return;

    const checkKeepSignedIn = async () => {
      try {
        const keep = await AsyncStorage.getItem("keepMeSignedIn");
        if (keep === "false" && isSignedIn) {
          console.log("🚪 App launched but keepMeSignedIn is false. Signing out.");
          await signOut();
        }
      } catch (err) {
        console.warn("Storage check failed", err);
      } finally {
        setHasCheckedKeepSignedIn(true);
      }
    };

    checkKeepSignedIn();
  }, [isLoaded, isSignedIn, hasCheckedKeepSignedIn, signOut]);

  // Once Clerk confirms sign-in AND MongoDB profile is loaded, go to main app
  useEffect(() => {
    if (currentScreen === "signupSuccess" || !hasCheckedKeepSignedIn) return;
    if (hasRedirected.current) return;

    if (isLoaded && isSignedIn && user && !profileLoading) {
      hasRedirected.current = true;
      router.replace("/(tabs)");
    }
  }, [isLoaded, isSignedIn, user, profileLoading, currentScreen, hasCheckedKeepSignedIn]);

  // While Clerk is loading, show a spinner so we don't flash the auth screens
  if (!isLoaded || profileLoading || !hasCheckedKeepSignedIn) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  // Already authenticated — redirecting above, render nothing meanwhile
  if (isSignedIn && user && currentScreen !== "signupSuccess") {
    return null;
  }

  // =========================================================
  // AUTH SCREEN ROUTING
  // =========================================================

  if (currentScreen === "splash") {
    return <SplashScreen onComplete={() => setCurrentScreen("welcome")} />;
  }

  if (currentScreen === "welcome") {
    return (
      <WelcomeScreen
        onGetStarted={() => {
          setCurrentScreen("login");
          // Non-blocking health check
          try {
            const { checkHealth } = require("../src/services/api");
            checkHealth()
              .then((h) => console.log("Backend health:", h))
              .catch((e) => console.warn("Backend connectivity:", e));
          } catch (e) {
            console.warn("Health check error:", e);
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
          setUserData(data);
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
          setUserData((prev) => ({ ...prev, ...data, studentId }));
          setCurrentScreen("emailVerification");
        }}
      />
    );
  }

  if (currentScreen === "emailVerification") {
    return (
      <EmailVerificationScreen
        email={userEmail}
        userData={userData}
        onVerify={async () => {
          // Clerk verification and MongoDB sync already done inside the screen
          setCurrentScreen("signupSuccess");
        }}
      />
    );
  }

  if (currentScreen === "signupSuccess") {
    return (
      <SignupSuccessScreen
        onContinue={() => {
          router.replace("/(tabs)");
        }}
      />
    );
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
        onVerify={() => setCurrentScreen("newPassword")}
      />
    );
  }

  if (currentScreen === "newPassword") {
    return (
      <NewPasswordScreen
        email={resetEmail}
        onBack={() => setCurrentScreen("passwordResetOTP")}
        onPasswordSet={() => setCurrentScreen("login")}
      />
    );
  }

  // Default: Login screen
  return (
    <LoginScreen
      onSignUp={() => setCurrentScreen("roleSelection")}
      onLoginSuccess={() => {
        // AuthContext detects the Clerk sign-in and redirects to (tabs)
      }}
      onForgotPassword={() => setCurrentScreen("forgotPassword")}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
});
