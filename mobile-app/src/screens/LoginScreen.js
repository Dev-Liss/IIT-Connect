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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSignIn, useAuth, useOAuth, useUser } from "@clerk/clerk-expo";

export default function LoginScreen({ onSignUp, onLoginSuccess, onForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, setActive } = useSignIn();
  const { isSignedIn, signOut, user } = useAuth();
  const { user: clerkUser } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const { syncGoogleUser } = require("../services/api");

  // Effect to handle syncing after successful Google Login
  React.useEffect(() => {
    const syncUser = async () => {
      if (isSignedIn && clerkUser && !isSyncing) {
        // Check if this is a Google login (or we just want to ensure sync)

        setIsSyncing(true);
        try {
          const email = clerkUser.primaryEmailAddress?.emailAddress;
          const username = clerkUser.fullName;
          const clerkId = clerkUser.id;

          if (email) {
            // We can check if it's a google account to be specific:
            const isGoogle = clerkUser.externalAccounts.some(acc => acc.verification?.strategy === "oauth_google");

            if (isGoogle) {
              console.log("🔄 Detected Google User, syncing with backend...");
              await syncGoogleUser(email, clerkId, username);
              console.log("✅ Google User Auto-Synced");

              if (onLoginSuccess) {
                onLoginSuccess();
              }
            }
          }
        } catch (error) {
          if (error.requiresSignup) {
            console.log("ℹ️ Auto-sync: Account requires signup");
            Alert.alert("Account Not Found", error.message);
            await signOut();
          } else {
            console.error("Auto-sync error:", error);
          }
        } finally {
          setIsSyncing(false);
        }
      }
    };

    syncUser();
  }, [isSignedIn, clerkUser]);


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

        console.log("✅ Login successful for:", trimmedEmail);
        setIsLoading(false);

        // No success alert - just proceed
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        // Handle other statuses if needed
        setIsLoading(false);
        Alert.alert("Error", "Login requires additional steps. Please contact support.");
      }

    } catch (error) {
      setIsLoading(false);

      // Handle Clerk errors
      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0];

        if (clerkError.code === "form_identifier_not_found") {
          // Email doesn't exist - this is an expected error, not a bug
          console.log("ℹ️ Login attempt with unregistered email:", trimmedEmail);
          Alert.alert("No Account Found", "No account exists for this email. Please sign up first.");
        } else if (clerkError.code === "form_password_incorrect") {
          // Wrong password - this is an expected error, not a bug
          console.log("ℹ️ Login attempt with incorrect password for:", trimmedEmail);
          Alert.alert("Incorrect Password", "The password you entered is incorrect. Please try again.");
        } else if (clerkError.code === "session_exists") {
          // Already logged in - we need to sign out first and retry
          console.log("⚠️ Session exists, signing out and retrying login...");
          try {
            await signOut();
            console.log("🚪 Signed out, retrying login...");

            // Retry the login
            await new Promise(resolve => setTimeout(resolve, 500));
            const retrySignIn = await signIn.create({
              identifier: trimmedEmail,
              password: password,
            });

            if (retrySignIn.status === "complete") {
              await setActive({ session: retrySignIn.createdSessionId });
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
                Alert.alert("No Account Found", "No account exists for this email. Please sign up first.");
              } else if (retryClerkError.code === "form_password_incorrect") {
                console.log("ℹ️ Retry: Login attempt with incorrect password");
                Alert.alert("Incorrect Password", "The password you entered is incorrect. Please try again.");
              } else {
                console.log("ℹ️ Retry: Login failed with error:", retryClerkError.code);
                Alert.alert("Login Failed", retryClerkError.message || "Invalid credentials. Please try again.");
              }
            } else {
              console.log("ℹ️ Retry: Login failed with unknown error");
              Alert.alert("Login Failed", "Unable to login. Please try again.");
            }
          }
        } else if (clerkError.code === "network_error") {
          Alert.alert(
            "Connection Error",
            "Unable to connect to the server. Please check your internet connection and try again."
          );
        } else {
          Alert.alert("Login Failed", clerkError.message || "Invalid credentials. Please try again.");
        }
      } else if (error.message && error.message.includes("network")) {
        Alert.alert(
          "Network Error",
          "Could not connect to server. Please check your internet connection."
        );
      } else {
        Alert.alert("Login Failed", error.message || "Invalid credentials. Please try again.");
      }
    }
  };


  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  // Import syncGoogleUser from api service

  const handleGoogleSignIn = async () => {
    try {
      // If already signed in, sign out first to ensure a fresh login flow
      if (isSignedIn) {
        await signOut();
      }

      const { createdSessionId, setActive, signUp, signIn } = await startOAuthFlow();

      if (createdSessionId) {
        // 1. Set the session active
        await setActive({ session: createdSessionId });

        // 2. Get user details from Clerk

        const userDetails = signIn?.identifier || signUp?.emailAddress;


        console.log("✅ OAuth Session created:", createdSessionId);

        // Trigger generic success. 
        let emailAddress = null;
        let username = null;
        let clerkId = null;

        if (signIn && signIn.identifier) {
          emailAddress = signIn.identifier;
          clerkId = signIn.userData?.id; // Attempt to get ID
        }


      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
      // See https://clerk.com/docs/custom-flows/oauth-connections for more info
      Alert.alert("Google Sign In Error", err.message || "Failed to sign in with Google");
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
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
            <Ionicons name="mail-outline" size={20} color="#E31E24" style={styles.icon} />
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
            <Ionicons name="lock-closed-outline" size={20} color="#E31E24" style={styles.icon} />
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
              <View style={[styles.checkbox, keepSignedIn && styles.checkboxChecked]}>
                {keepSignedIn && <Ionicons name="checkmark" size={12} color="#E31E24" />}
              </View>
              <Text style={styles.checkboxLabel}>Keep me signed in</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleForgotPassword}>
              <Text style={styles.forgotPassword}>Forgot password</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.signInButtonText}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Text>
          </TouchableOpacity>

          {/* Divider Text */}
          <Text style={styles.dividerText}>You can Connect with</Text>

          {/* Google Sign In */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignIn}>
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
