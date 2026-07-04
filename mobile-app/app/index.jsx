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
import { useAuth } from "../src/context/AuthContext";

// Auth screens (now in app/(auth)/ for Expo Router)
import SplashScreen from "./(auth)/splash";
import WelcomeScreen from "./(auth)/welcome";
import LoginScreen from "./(auth)/login";
import RoleSelectionScreen from "./(auth)/role-selection";
import CreateAccountScreen from "./(auth)/create-account";
import StudentIdDetailsScreen from "./(auth)/student-id-details";
import AlumniAccountScreen from "./(auth)/alumni-account";
import AlumniDetailsScreen from "./(auth)/alumni-details";
import UserDetailsScreen from "./(auth)/user-details";
import EmailVerificationScreen from "./(auth)/email-verification";
import SignupSuccessScreen from "./(auth)/signup-success";
import ForgotPasswordScreen from "./(auth)/forgot-password";

export default function AuthEntry() {
  const router = useRouter();
  const { user, isLoading: profileLoading } = useAuth();

  const [currentScreen, setCurrentScreen] = useState("splash");
  const [selectedRole, setSelectedRole] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [userData, setUserData] = useState(null);
  const hasRedirected = useRef(false);

  const resetSignUpFlowState = () => {
    setSelectedRole(null);
    setUserEmail("");
    setStudentId("");
    setUserData(null);
  };

  useEffect(() => {
    if (!user) {
      hasRedirected.current = false;
      return;
    }

    if (currentScreen === "signupSuccess") return;
    if (hasRedirected.current) return;

    if (user && !profileLoading) {
      // #region agent log
              fetch('http://127.0.0.1:7530/ingest/4d139bb6-1183-43a7-8e4c-e6e413a25815',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ad0f79'},body:JSON.stringify({sessionId:'ad0f79',runId:'pre-fix',hypothesisId:'H2',location:'app/index.jsx:redirectToTabs',message:'AuthEntry redirecting to /(tabs)',data:{hasUser:!!user,profileLoading,currentScreen},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      hasRedirected.current = true;
      router.replace("/(tabs)");
    }
  }, [
    user,
    profileLoading,
    currentScreen,
  ]);

  if (profileLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  // Already authenticated — redirecting above, render nothing meanwhile
  if (user && currentScreen !== "signupSuccess") {
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
        onBack={() => {
          resetSignUpFlowState();
          setCurrentScreen("login");
        }}
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
        onBack={() => setCurrentScreen("createAccount")}
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
        onBack={() => setCurrentScreen("alumniAccount")}
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
        onBack={() => {
          if (selectedRole === "alumni") {
            setCurrentScreen("alumniDetails");
            return;
          }
          if (selectedRole === "student") {
            setCurrentScreen("studentIdDetails");
            return;
          }
          setCurrentScreen("createAccount");
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
          // Firebase signup and MongoDB sync already done inside the screen
          setCurrentScreen("signupSuccess");
        }}
        onBack={() => setCurrentScreen("userDetails")}
      />
    );
  }

  if (currentScreen === "signupSuccess") {
    return (
      <SignupSuccessScreen
        onContinue={() => {
          router.replace("/(tabs)");
        }}
        onBack={() => setCurrentScreen("emailVerification")}
      />
    );
  }

  if (currentScreen === "forgotPassword") {
    return (
      <ForgotPasswordScreen
        onBack={() => setCurrentScreen("login")}
        onCodeSent={() => setCurrentScreen("login")}
      />
    );
  }

  // Default: Login screen
  return (
    <LoginScreen
      onSignUp={() => {
        resetSignUpFlowState();
        setCurrentScreen("roleSelection");
      }}
      onLoginSuccess={() => {
        hasRedirected.current = true;
        router.replace("/(tabs)");
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
