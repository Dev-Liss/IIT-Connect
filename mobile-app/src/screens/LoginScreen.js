import React, { useState, useRef } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useSignIn, useAuth, useOAuth, useUser } from "@clerk/clerk-expo";
import { syncGoogleUser } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from "../hooks/useWarmUpBrowser";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({
  onSignUp,
  onLoginSuccess,
  onForgotPassword,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Warm up the android browser to improve UX and prevent OAuth lockups
  useWarmUpBrowser();

  const { signIn, setActive } = useSignIn();
  const { isSignedIn, signOut } = useAuth();
  const { user: clerkUser } = useUser();

  // Always keep a ref to the latest clerkUser so async functions can read current value
  const clerkUserRef = useRef(clerkUser);
  React.useEffect(() => {
    clerkUserRef.current = clerkUser;
  }, [clerkUser]);

  // Guard ref to prevent double-runs
  const isSyncingRef = useRef(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    // Basic validation
    if (!trimmedEmail || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔐 Attempting Clerk sign-in for:", trimmedEmail);

      // Sign in with Clerk
      const signInAttempt = await signIn.create({
        identifier: trimmedEmail,
        password: password,
      });

      // If sign-in is complete, set the session as active
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        await AsyncStorage.setItem(
          "keepMeSignedIn",
          keepSignedIn ? "true" : "false",
        );

        console.log("✅ Login successful for:", trimmedEmail);
        setIsLoading(false);

        // No success alert - just proceed
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        // Handle other statuses if needed
        setIsLoading(false);
        Alert.alert(
          "Error",
          "Login requires additional steps. Please contact support.",
        );
      }
    } catch (error) {
      setIsLoading(false);

      // Handle Clerk errors
      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0];

        if (clerkError.code === "form_identifier_not_found") {
          // Email doesn't exist - this is an expected error, not a bug
          console.log(
            "ℹ️ Login attempt with unregistered email:",
            trimmedEmail,
          );
          Alert.alert(
            "No Account Found",
            "No account exists for this email. Please sign up first.",
          );
        } else if (clerkError.code === "form_password_incorrect") {
          // Wrong password - this is an expected error, not a bug
          console.log(
            "ℹ️ Login attempt with incorrect password for:",
            trimmedEmail,
          );
          Alert.alert(
            "Incorrect Password",
            "The password you entered is incorrect. Please try again.",
          );
        } else if (clerkError.code === "session_exists") {
          // Already logged in - we need to sign out first and retry
          console.log("⚠️ Session exists, signing out and retrying login...");
          try {
            await signOut();
            console.log("🚪 Signed out, retrying login...");

            // Retry the login
            await new Promise((resolve) => setTimeout(resolve, 500));
            const retrySignIn = await signIn.create({
              identifier: trimmedEmail,
              password: password,
            });

            if (retrySignIn.status === "complete") {
              await setActive({ session: retrySignIn.createdSessionId });
              await AsyncStorage.setItem(
                "keepMeSignedIn",
                keepSignedIn ? "true" : "false",
              );
              console.log("✅ Login successful after retry");
              if (onLoginSuccess) {
                onLoginSuccess();
              }
            }
          } catch (retryError) {
            // Now show proper validation errors
            if (retryError.errors && retryError.errors.length > 0) {
              const retryClerkError = retryError.errors[0];
              if (retryClerkError.code === "form_identifier_not_found") {
                console.log("ℹ️ Retry: Login attempt with unregistered email");
                Alert.alert(
                  "No Account Found",
                  "No account exists for this email. Please sign up first.",
                );
              } else if (retryClerkError.code === "form_password_incorrect") {
                console.log("ℹ️ Retry: Login attempt with incorrect password");
                Alert.alert(
                  "Incorrect Password",
                  "The password you entered is incorrect. Please try again.",
                );
              } else {
                console.log(
                  "ℹ️ Retry: Login failed with error:",
                  retryClerkError.code,
                );
                Alert.alert(
                  "Login Failed",
                  retryClerkError.message ||
                    "Invalid credentials. Please try again.",
                );
              }
            } else {
              console.log("ℹ️ Retry: Login failed with unknown error");
              Alert.alert("Login Failed", "Unable to login. Please try again.");
            }
          }
        } else if (clerkError.code === "network_error") {
          Alert.alert(
            "Connection Error",
            "Unable to connect to the server. Please check your internet connection and try again.",
          );
        } else {
          Alert.alert(
            "Login Failed",
            clerkError.message || "Invalid credentials. Please try again.",
          );
        }
      } else if (error.message && error.message.includes("network")) {
        Alert.alert(
          "Network Error",
          "Could not connect to server. Please check your internet connection.",
        );
      } else {
        Alert.alert(
          "Login Failed",
          error.message || "Invalid credentials. Please try again.",
        );
      }
    }
  };

  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleSignIn = async () => {
    if (isSyncingRef.current) return;

    try {
      setIsLoading(true);
      isSyncingRef.current = true;

      // Sign out any existing session first
      if (isSignedIn) {
        await signOut();
      }

      console.log("🔵 [Google] Starting OAuth flow...");
      const oauthResult = await startOAuthFlow({
        redirectUrl: Linking.createURL("/", { scheme: "iitconnect" }),
      });
      const {
        createdSessionId,
        setActive: oauthSetActive,
        signIn: oauthSignIn,
        signUp: oauthSignUp,
      } = oauthResult;

      // User cancelled the Google picker
      if (!createdSessionId) {
        console.log("ℹ️ Google OAuth cancelled.");
        isSyncingRef.current = false;
        setIsLoading(false);
        return;
      }

      // --- Extract email & clerkId from the OAuth result BEFORE activating the session ---
      // This is the most reliable source — doesn't depend on hook timing.
      let googleEmail = null;
      let googleClerkId = null;
      let googleUsername = "User";

      // Try from signIn object (returning user)
      if (oauthSignIn) {
        console.log(
          "🔍 [Google] oauthSignIn data:",
          JSON.stringify(oauthSignIn, null, 2),
        );
        const si = oauthSignIn;
        googleEmail =
          si.identifier ||
          si.userData?.emailAddresses?.[0]?.emailAddress ||
          null;
        googleClerkId = si.userData?.id || null;
        googleUsername = si.userData?.firstName || googleUsername;
      }

      // Try from signUp object (new Clerk user created via Google)
      if (oauthSignUp && (!googleEmail || !googleClerkId)) {
        console.log(
          "🔍 [Google] oauthSignUp data:",
          JSON.stringify(oauthSignUp, null, 2),
        );
        const su = oauthSignUp;
        googleEmail = su.emailAddress || su.identifier || null;
        googleClerkId = su.createdUserId || null;
        googleUsername = su.firstName || googleUsername;
      }

      // Activate the Clerk session so we can use clerkUserRef as a last-resort fallback
      await oauthSetActive({ session: createdSessionId });
      console.log("✅ [Google] Session activated.");

      // Last-resort: wait up to 3 seconds for clerkUser to populate via the hook
      if (!googleEmail || !googleClerkId) {
        console.log(
          "⏳ [Google] Email/ClerkId not in OAuth result, polling clerkUserRef...",
        );
        let waited = 0;
        while (waited < 3000) {
          await new Promise((r) => setTimeout(r, 200));
          waited += 200;
          const u = clerkUserRef.current;
          if (u && u.id) {
            googleEmail =
              u.primaryEmailAddress?.emailAddress ||
              u.emailAddresses?.[0]?.emailAddress ||
              null;
            googleClerkId = u.id;
            googleUsername = u.fullName || u.firstName || googleUsername;
            if (googleEmail && googleClerkId) break;
          }
        }
      }

      console.log(
        "📧 [Google] Final email:",
        googleEmail,
        " clerkId:",
        googleClerkId,
      );

      if (!googleEmail || !googleClerkId) {
        console.error(
          "❌ [Google] Could not resolve email or clerkId. Signing out.",
        );
        try {
          await signOut();
        } catch (_) {}
        Alert.alert(
          "Sign In Error",
          "Could not retrieve your Google account details. Please try again.",
        );
        return;
      }

      // --- Verify against MongoDB — this is the gatekeeper ---
      console.log("📡 [Google] Checking MongoDB for:", googleEmail);
      await syncGoogleUser(googleEmail, googleClerkId, googleUsername);

      // Only reach here if account EXISTS in MongoDB
      console.log("✅ [Google] MongoDB account confirmed. Navigating to home.");
      await AsyncStorage.setItem(
        "keepMeSignedIn",
        keepSignedIn ? "true" : "false",
      );
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      console.log(
        "❌ [Google] Error:",
        err.message,
        " requiresSignup:",
        err.requiresSignup,
      );
      if (err.requiresSignup) {
        // Backend found no MongoDB account and deleted the Clerk user
        try {
          await signOut();
        } catch (_) {}
        Alert.alert(
          "No Account Found",
          "There is no account linked to this Google email.\nPlease sign up first.",
        );
      } else {
        try {
          await signOut();
        } catch (_) {}
        Alert.alert(
          "Google Sign In Error",
          err.message || "Failed to sign in with Google. Please try again.",
        );
      }
    } finally {
      isSyncingRef.current = false;
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (onForgotPassword) {
      onForgotPassword();
    }
  };

  const handleSignUp = () => {
    if (onSignUp) {
      onSignUp();
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
              keyboardType="email-address"
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
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setKeepSignedIn(!keepSignedIn)}
            >
              <View
                style={[
                  styles.checkbox,
                  keepSignedIn && styles.checkboxChecked,
                ]}
              >
                {keepSignedIn && (
                  <Ionicons name="checkmark" size={12} color="#E31E24" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>Remember me</Text>
            </TouchableOpacity>
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

          {/* Divider Text */}
          <Text style={styles.dividerText}>Or Sign In With</Text>

          {/* Google Sign In */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <Image
              source={{ uri: "https://www.google.com/favicon.ico" }}
              style={styles.googleIcon}
            />
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 3,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  checkboxChecked: {
    borderColor: "#E31E24",
    backgroundColor: "#FFF",
  },
  checkboxLabel: {
    fontSize: 12,
    color: "#666",
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
  dividerText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginBottom: 16,
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
  },
  googleIcon: {
    width: 24,
    height: 24,
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
