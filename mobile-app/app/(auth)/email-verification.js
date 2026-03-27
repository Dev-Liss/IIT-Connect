import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSignUp } from "@clerk/clerk-expo";
import { syncUserProfile } from "../../src/services/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import AuthBackButton from "../../src/components/AuthBackButton";

export default function EmailVerificationScreen({ email, userData, onVerify, onBack }) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const resolvedEmail = email ?? (typeof params.email === "string" ? params.email : "");
  const resolvedUserData = userData ?? {
    email: resolvedEmail,
    firstName: typeof params.firstName === "string" ? params.firstName : "",
    lastName: typeof params.lastName === "string" ? params.lastName : "",
    role: typeof params.role === "string" ? params.role : "",
    studentId: typeof params.studentId === "string" ? params.studentId : "",
    pastIitId: typeof params.pastIitId === "string" ? params.pastIitId : "",
    nationalId: typeof params.nationalId === "string" ? params.nationalId : "",
  };
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(180); // 3 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, setActive } = useSignUp();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the 6-digit verification code");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔐 Verifying OTP code...");

      // Verify the email with Clerk
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: code,
      });

      if (completeSignUp.status === "complete") {
        console.log("✅ Email verified successfully!");

        // Get the Clerk user ID
        const clerkId = completeSignUp.createdUserId;

        console.log("📤 Syncing profile to MongoDB...");

        // Prepare sync data
        const syncData = {
          clerkId: clerkId,
          email: resolvedUserData.email,
          username: `${resolvedUserData.firstName} ${resolvedUserData.lastName}`,
          role: resolvedUserData.role,
        };

        // Add role-specific fields
        if (resolvedUserData.role === "student" && resolvedUserData.studentId) {
          syncData.studentId = resolvedUserData.studentId;
        } else if (resolvedUserData.role === "alumni") {
          if (resolvedUserData.nationalId) {
            syncData.nationalId = resolvedUserData.nationalId;
          }
          if (resolvedUserData.pastIitId) {
            syncData.pastIitId = resolvedUserData.pastIitId;
          }
        }

        console.log("📤 Sync data:", syncData);

        // Sync profile to MongoDB backend
        await syncUserProfile(syncData);

        console.log("✅ Profile synced to MongoDB!");

        // Set the session as active AFTER syncing to DB
        // This prevents AuthContext from fetching the profile before it's created
        await setActive({ session: completeSignUp.createdSessionId });

        setIsLoading(false);

        // Call the onVerify callback
        if (onVerify) {
          onVerify(code);
        }
      } else {
        setIsLoading(false);
        Alert.alert("Verification Incomplete", "Please try again.");
      }
    } catch (error) {
      setIsLoading(false);
      console.log("ℹ️ Verification attempt finished:", error.message);

      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0];

        if (clerkError.code === "form_code_incorrect") {
          Alert.alert(
            "Incorrect Code",
            "The verification code you entered is incorrect. Please try again.",
          );
        } else if (clerkError.code === "verification_expired") {
          Alert.alert(
            "Code Expired",
            "The verification code has expired. Please request a new one.",
          );
        } else {
          Alert.alert(
            "Verification Failed",
            clerkError.message || "Failed to verify code",
          );
        }
      } else {
        Alert.alert(
          "Error",
          error.message || "Failed to verify code. Please try again.",
        );
      }
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);

    try {
      console.log("📧 Resending verification code...");

      // Resend verification email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      console.log("✅ Verification code resent!");

      setTimer(180);
      setCanResend(false);
      setCode("");
      setIsLoading(false);

      Alert.alert(
        "Code Sent",
        "A new verification code has been sent to your email.",
      );
    } catch (error) {
      setIsLoading(false);
      console.error("❌ Resend error:", error);
      Alert.alert("Error", "Failed to resend code. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AuthBackButton onPress={onBack ?? (() => router.back())} />
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/connect-logo-full.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>Confirm Your Email</Text>

          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require("../../assets/images/otp-verification.jpg")}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* Info Text */}
          <Text style={styles.infoText}>
            We've sent a 6-digit verification code{"\n"}to your email
          </Text>

          {/* Verification Code Input */}
          <Text style={styles.label}>Enter Verification Code</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#E31E24"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit code"
              placeholderTextColor="#999"
              value={code}
              onChangeText={(text) =>
                setCode(text.replace(/[^0-9]/g, "").slice(0, 6))
              }
              keyboardType="number-pad"
              maxLength={6}
              editable={!isLoading}
            />
            {!canResend && (
              <Text style={styles.timerText}>
                Resend in {formatTime(timer)}
              </Text>
            )}
            {canResend && (
              <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                <Text
                  style={[styles.resendText, isLoading && { opacity: 0.5 }]}
                >
                  Resend
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Verify Button */}
          <TouchableOpacity
            style={[styles.verifyButton, isLoading && { opacity: 0.7 }]}
            onPress={handleVerify}
            disabled={isLoading}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? "Verifying..." : "Verify and Create Account"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
    alignSelf: "center",
  },
  logo: {
    width: 200,
    height: 200,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 24,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  illustration: {
    width: 250,
    height: 200,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#000",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E31E24",
    paddingHorizontal: 16,
    marginBottom: 24,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    letterSpacing: 4,
    fontWeight: "600",
  },
  timerText: {
    fontSize: 12,
    color: "#999",
    marginLeft: 10,
  },
  resendText: {
    fontSize: 12,
    color: "#E31E24",
    fontWeight: "600",
    marginLeft: 10,
  },
  verifyButton: {
    backgroundColor: "#E31E24",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#E31E24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  verifyButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
