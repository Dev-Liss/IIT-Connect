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
import { useSignIn } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * LoginVerificationScreen
 *
 * Shown after a user enters their email + password during login.
 * The password has already been verified at this point (via Clerk).
 * Now an email OTP code has been sent and the user must enter it
 * to complete sign-in.
 *
 * Props:
 *   email          — the user's email (for display)
 *   keepSignedIn   — whether "remember me" was checked
 *   onVerified     — callback after successful OTP verification + session activation
 *   onBack         — callback to go back to the login screen
 */
export default function LoginVerificationScreen({
  email,
  keepSignedIn,
  onVerified,
  onBack,
}) {
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(180); // 3 minutes
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, setActive } = useSignIn();

  // Countdown timer
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

  /**
   * Verify the OTP code entered by the user.
   * Uses Clerk's attemptFirstFactor with the email_code strategy.
   */
  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert("Invalid Code", "Please enter the 6-digit verification code");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔐 [LoginOTP] Verifying code...");

      const result = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: code,
      });

      if (result.status === "complete") {
        console.log("✅ [LoginOTP] OTP verified! Activating session...");

        await setActive({ session: result.createdSessionId });
        await AsyncStorage.setItem(
          "keepMeSignedIn",
          keepSignedIn ? "true" : "false",
        );

        console.log("✅ [LoginOTP] Session activated. Login complete.");
        setIsLoading(false);

        if (onVerified) {
          onVerified();
        }
      } else {
        console.log("⚠️ [LoginOTP] Unexpected status after OTP:", result.status);
        setIsLoading(false);
        Alert.alert(
          "Verification Issue",
          "Unable to complete verification. Please try again.",
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.log("❌ [LoginOTP] Verification error:", error.message);

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

  /**
   * Resend the OTP code via Clerk's prepareFirstFactor.
   */
  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);

    try {
      console.log("📧 [LoginOTP] Resending verification code...");

      // Find the email_code factor to get the emailAddressId
      const emailCodeFactor = signIn.supportedFirstFactors?.find(
        (f) => f.strategy === "email_code",
      );

      if (!emailCodeFactor) {
        setIsLoading(false);
        Alert.alert("Error", "Email verification is not available. Please go back and try again.");
        return;
      }

      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailCodeFactor.emailAddressId,
      });

      console.log("✅ [LoginOTP] Verification code resent!");

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
      console.error("❌ [LoginOTP] Resend error:", error);
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
          {/* Back Button */}
          {onBack && (
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          )}

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/connect-logo-full.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>Verify Your Identity</Text>

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
            We've sent a 6-digit verification code{"\n"}to{" "}
            <Text style={styles.emailHighlight}>{email}</Text>
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
              {isLoading ? "Verifying..." : "Verify and Sign In"}
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
  backButton: {
    position: "absolute",
    top: 16,
    left: 24,
    width: 40,
    height: 40,
    justifyContent: "center",
    zIndex: 10,
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
  emailHighlight: {
    fontWeight: "bold",
    color: "#E31E24",
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
