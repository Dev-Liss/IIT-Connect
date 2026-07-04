import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// eslint-disable-next-line import/no-unresolved
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signOut } from "firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { auth } from "../../firebaseConfig";
import { syncGoogleUser } from "../../src/services/api";

// Configure Google Sign-In once at module load
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

export default function LoginScreen({
  onSignUp,
  onLoginSuccess,
  onForgotPassword,
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    // Basic validation
    if (!trimmedEmail || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, password);

      // Block login if email is not yet verified
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        setIsLoading(false);
        Alert.alert(
          "Email Not Verified",
          "Please verify your email before logging in. Check your inbox for the verification link.",
          [
            { text: "Resend Email", onPress: async () => {
                try {
                  // Re-sign in temporarily just to get the user object for resending
                  const tempCred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
                  const { sendEmailVerification } = await import("firebase/auth");
                  await sendEmailVerification(tempCred.user);
                  await signOut(auth);
                  Alert.alert("Email Sent", "Verification email sent. Check your inbox.");
                } catch (e) {
                  Alert.alert("Error", e.message);
                }
              }
            },
            { text: "OK", style: "cancel" },
          ]
        );
        return;
      }

      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      setIsLoading(false);
      if (error.code === "auth/user-not-found") {
        Alert.alert("No Account Found", "No account exists for this email.");
      } else if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        Alert.alert("Incorrect Password", "The password you entered is incorrect.");
      } else {
        Alert.alert("Login Failed", error.message || "Unable to login.");
      }
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    } else {
      router.push("/(auth)/forgot-password");
    }
  };

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
    } else {
      router.push("/(auth)/role-selection");
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Step 1: Check Google Play Services availability
      await GoogleSignin.hasPlayServices();

      // Step 2: Open the native Google account picker
      const userInfo = await GoogleSignin.signIn();
      const { idToken } = userInfo.data ?? userInfo;

      if (!idToken) throw new Error("Google Sign-In failed: no ID token returned.");

      // Step 3: Exchange the Google token for a Firebase credential
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, googleCredential);
      const { user } = userCredential;

      // Step 4: Sync Firebase UID with our MongoDB profile
      await syncGoogleUser(
        user.email,
        user.uid,
        user.displayName ?? "User"
      );

      // Step 5: Navigate — AuthContext will pick up the new Firebase session automatically
      setIsLoading(false);
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        router.replace("/(tabs)");
      }
    } catch (error) {
      setIsLoading(false);
      if (error.requiresSignup) {
        // No MongoDB profile found for this Google email — send to sign up
        Alert.alert(
          "No Account Found",
          "No IIT Connect account exists for this Google email. Please sign up first.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Sign Up", onPress: () => router.push("/(auth)/role-selection") },
          ]
        );
      } else if (error.code === "SIGN_IN_CANCELLED") {
        // User dismissed the Google picker — do nothing
      } else {
        Alert.alert("Google Sign-In Failed", error.message || "Unable to sign in with Google.");
      }
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
          {/* Logo and Title Combined */}
          <View style={styles.logoContainer}>
            <Image
              source={require("../../assets/images/connect-logo-full.png")}
              style={styles.logoFull}
              resizeMode="contain"
            />
          </View>

          {/* Welcome Text */}
          <Text style={styles.welcomeText}>Welcome Back!</Text>

          {/* Email Input */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#E31E24"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="username"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#E31E24"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCorrect={false}
              textContentType="password"
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                color="#999"
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Keep Signed In & Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[
              styles.signInButton,
              isLoading && styles.signInButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={[styles.googleButton, isLoading && styles.signInButtonDisabled]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#666" />
            ) : (
              <View style={styles.googleButtonInner}>
                <Image
                  source={require("../../assets/images/google-icon.png")}
                  style={styles.googleIcon}
                  resizeMode="contain"
                />
                <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don{"'"}t have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpLink}>Sign Up here</Text>
            </TouchableOpacity>
          </View>
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
  logoFull: {
    width: 200,
    height: 200,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 32,
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
    marginBottom: 20,
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  eyeIcon: {
    marginLeft: 10,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 24,
  },
  forgotPassword: {
    fontSize: 12,
    color: "#E31E24",
    fontWeight: "500",
  },
  signInButton: {
    backgroundColor: "#E31E24",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#E31E24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  signInButtonDisabled: {
    backgroundColor: "#CCC",
    shadowOpacity: 0,
    elevation: 0,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginHorizontal: 10,
  },
  googleButton: {
    backgroundColor: "#FFF",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  googleIcon: {
    width: 22,
    height: 22,
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signUpText: {
    fontSize: 13,
    color: "#000",
  },
  signUpLink: {
    fontSize: 13,
    color: "#E31E24",
    fontWeight: "bold",
  },
});
