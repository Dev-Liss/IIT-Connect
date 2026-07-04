import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { sendEmailVerification, reload, signOut, auth } from "../../firebaseConfig";

export default function EmailVerificationScreen({ onVerify, onBack }) {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Re-send the verification email
  const handleResend = async () => {
    setIsResending(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user session found.");
      await sendEmailVerification(user);
      Alert.alert("Email Sent", "Verification email resent. Please check your inbox and spam folder.");
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        Alert.alert("Too Many Requests", "Please wait a few minutes before requesting another email.");
      } else {
        Alert.alert("Error", err.message);
      }
    } finally {
      setIsResending(false);
    }
  };

  // Poll Firebase to check if user has verified since screen opened
  const handleContinue = async () => {
    setIsChecking(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user session found.");

      // Reload refreshes the user token + emailVerified flag from Firebase servers
      await reload(user);

      if (auth.currentUser.emailVerified) {
        if (onVerify) {
          onVerify();
        } else {
          router.replace("/(auth)/signup-success");
        }
      } else {
        Alert.alert(
          "Not Verified Yet",
          "Your email hasn't been verified yet. Please click the link in your inbox first.",
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setIsChecking(false);
    }
  };

  // Let user cancel and go back — sign them out to clean up the unverified session
  const handleCancel = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    if (onBack) {
      onBack();
    } else {
      router.replace("/(auth)/login");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../../assets/images/otp-verification.jpg")}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Heading */}
        <Text style={styles.title}>Verify Your Email</Text>

        {/* Description */}
        <Text style={styles.subtitle}>
          We sent a verification link to your email address.{"\n"}
          Please click the link in your inbox, then tap the button below.
        </Text>

        <Text style={styles.hint}>
          Don{"'"}t see it? Check your spam or junk folder.
        </Text>

        {/* Primary CTA */}
        <TouchableOpacity
          style={[styles.button, isChecking && styles.buttonDisabled]}
          onPress={handleContinue}
          disabled={isChecking}
        >
          <Text style={styles.buttonText}>
            {isChecking ? "Checking..." : "I've Verified — Continue"}
          </Text>
        </TouchableOpacity>

        {/* Resend */}
        <TouchableOpacity
          style={[styles.resendButton, isResending && styles.buttonDisabled]}
          onPress={handleResend}
          disabled={isResending}
        >
          <Text style={styles.resendText}>
            {isResending ? "Sending..." : "Resend Verification Email"}
          </Text>
        </TouchableOpacity>

        {/* Cancel / Back */}
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel — Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  illustration: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#000",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    backgroundColor: "#E31E24",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#E31E24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#CCC",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  resendButton: {
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E31E24",
    marginBottom: 12,
  },
  resendText: {
    color: "#E31E24",
    fontSize: 15,
    fontWeight: "600",
  },
  cancelButton: {
    padding: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#999",
    fontSize: 13,
  },
});
