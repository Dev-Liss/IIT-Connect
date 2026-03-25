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
import { useRouter } from "expo-router";
import {
  useSignIn,
  useAuth,
  useOAuth,
  useUser,
  useClerk,
} from "@clerk/clerk-expo";
import { syncGoogleUser } from "../../src/services/api";
import { useAuth as useContextAuth } from "../../src/context/AuthContext";
import * as WebBrowser from "expo-web-browser";
import { useWarmUpBrowser } from "../../src/hooks/useWarmUpBrowser";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen({
  onSignUp,
  onLoginSuccess,
  onForgotPassword,
  onLoginOTP,
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Warm up the android browser to improve UX and prevent OAuth lockups
  useWarmUpBrowser();

  const { signIn } = useSignIn();
  const { isSignedIn, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const clerk = useClerk();
  const { login: setMongoUser } = useContextAuth();

  // Always keep a ref to the latest clerkUser so async functions can read current value
  const clerkUserRef = useRef(clerkUser);
  React.useEffect(() => {
    clerkUserRef.current = clerkUser;
  }, [clerkUser]);

  // Guard ref to prevent double-runs
  const isSyncingRef = useRef(false);

  /**
   * Helper: Start a fresh sign-in with email_code OTP, then navigate to OTP screen.
   * Called after password has been successfully verified.
   */
  const startOTPVerification = async (trimmedEmail) => {
    console.log("📧 [Login] Starting OTP verification for:", trimmedEmail);

    // Sign out any session created during password verification
    try {
      await signOut();
    } catch (_) {
      // Ignore — might not have an active session
    }

    // Small delay to ensure session is cleared
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Start a fresh sign-in using identifier only (no password)
    const otpSignIn = await signIn.create({
      identifier: trimmedEmail,
    });

    if (otpSignIn.status !== "needs_first_factor") {
      console.log("⚠️ [Login] Unexpected OTP sign-in status:", otpSignIn.status);
      Alert.alert(
        "Login Issue",
        "Unable to send verification code. Please try again.",
      );
      return;
    }

    // Find the email_code strategy from supported first factors
    const emailCodeFactor = otpSignIn.supportedFirstFactors?.find(
      (f) => f.strategy === "email_code",
    );

    if (!emailCodeFactor) {
      console.log("⚠️ [Login] email_code strategy not available. Supported factors:",
        otpSignIn.supportedFirstFactors?.map(f => f.strategy));
      Alert.alert(
        "Verification Unavailable",
        "Email verification is not available for this account. Please contact support.",
      );
      return;
    }

    // Send the OTP email
    await signIn.prepareFirstFactor({
      strategy: "email_code",
      emailAddressId: emailCodeFactor.emailAddressId,
    });

    console.log("✅ [Login] OTP sent! Navigating to verification screen.");

    // Navigate to OTP screen
    if (onLoginOTP) {
      onLoginOTP(trimmedEmail);
      return;
    }

    router.push({
      pathname: "/(auth)/login-verification",
      params: {
        email: trimmedEmail,
      },
    });
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    // Basic validation
    if (!trimmedEmail || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      console.log("🔐 [Login] Step 1: Verifying password for:", trimmedEmail);

      // Step 1: Verify password by attempting sign-in with credentials
      const signInAttempt = await signIn.create({
        identifier: trimmedEmail,
        password: password,
      });

      // Password verified! (sign-in succeeded — status is "complete" or handled below)
      let passwordVerified = false;

      if (signInAttempt.status === "complete") {
        // Password is correct — Clerk completed the sign-in
        passwordVerified = true;
        console.log("✅ [Login] Password verified (complete)");
      } else if (signInAttempt.status === "needs_first_factor") {
        // Try verifying password as first factor
        console.log("🔐 [Login] Attempting password as first factor...");
        try {
          const firstFactorResult = await signIn.attemptFirstFactor({
            strategy: "password",
            password: password,
          });
          if (firstFactorResult.status === "complete" || firstFactorResult.status === "needs_second_factor") {
            passwordVerified = true;
            console.log("✅ [Login] Password verified (first factor)");
          }
        } catch (ffErr) {
          if (ffErr.errors?.[0]?.code === "form_password_incorrect") {
            setIsLoading(false);
            Alert.alert(
              "Incorrect Password",
              "The password you entered is incorrect. Please try again.",
            );
            return;
          }
          throw ffErr;
        }
      } else if (signInAttempt.status === "needs_second_factor") {
        passwordVerified = true;
        console.log("✅ [Login] Password verified (needs second factor)");
      }

      if (!passwordVerified) {
        console.log("⚠️ [Login] Unexpected status:", signInAttempt.status);
        setIsLoading(false);
        Alert.alert("Login Issue", "Unable to verify credentials. Please try again.");
        return;
      }

      // Step 2: Password is correct — now start OTP verification
      console.log("🔐 [Login] Step 2: Sending OTP...");
      await startOTPVerification(trimmedEmail);
      setIsLoading(false);

    } catch (error) {
      setIsLoading(false);

      // Handle Clerk errors
      if (error.errors && error.errors.length > 0) {
        const clerkError = error.errors[0];

        if (clerkError.code === "form_identifier_not_found") {
          console.log(
            "ℹ️ Login attempt with unregistered email:",
            trimmedEmail,
          );
          Alert.alert(
            "No Account Found",
            "No account exists for this email. Please sign up first.",
          );
        } else if (clerkError.code === "form_password_incorrect") {
          console.log(
            "ℹ️ Login attempt with incorrect password for:",
            trimmedEmail,
          );
          Alert.alert(
            "Incorrect Password",
            "The password you entered is incorrect. Please try again.",
          );
        } else if (clerkError.code === "session_exists") {
          // Already logged in — sign out and retry the entire flow
          console.log("⚠️ Session exists, signing out and retrying...");
          try {
            await signOut();
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Retry the entire login flow
            setIsLoading(true);
            const retrySignIn = await signIn.create({
              identifier: trimmedEmail,
              password: password,
            });

            let retryPasswordVerified = false;
            if (retrySignIn.status === "complete") {
              retryPasswordVerified = true;
            } else if (retrySignIn.status === "needs_first_factor") {
              try {
                const retryFF = await signIn.attemptFirstFactor({
                  strategy: "password",
                  password: password,
                });
                if (retryFF.status === "complete" || retryFF.status === "needs_second_factor") {
                  retryPasswordVerified = true;
                }
              } catch (retryFFErr) {
                if (retryFFErr.errors?.[0]?.code === "form_password_incorrect") {
                  setIsLoading(false);
                  Alert.alert("Incorrect Password", "The password you entered is incorrect.");
                  return;
                }
                throw retryFFErr;
              }
            }

            if (retryPasswordVerified) {
              await startOTPVerification(trimmedEmail);
            } else {
              Alert.alert("Login Issue", "Unable to verify credentials. Please try again.");
            }
            setIsLoading(false);
          } catch (retryError) {
            setIsLoading(false);
            if (retryError.errors && retryError.errors.length > 0) {
              const retryClerkError = retryError.errors[0];
              if (retryClerkError.code === "form_identifier_not_found") {
                Alert.alert("No Account Found", "No account exists for this email. Please sign up first.");
              } else if (retryClerkError.code === "form_password_incorrect") {
                Alert.alert("Incorrect Password", "The password you entered is incorrect. Please try again.");
              } else {
                Alert.alert("Login Failed", retryClerkError.message || "Invalid credentials. Please try again.");
              }
            } else {
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
        redirectUrl: Linking.createURL("oauth-native-callback", {
          scheme: "iitconnect",
        }),
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

      // Activate the Clerk session so we can use clerk as a last-resort fallback
      await oauthSetActive({ session: createdSessionId });
      console.log("✅ [Google] Session activated.");

      // Last-resort: wait up to 3 seconds for clerk.user to populate via the hook
      if (!googleEmail || !googleClerkId) {
        console.log(
          "⏳ [Google] Email/ClerkId not in OAuth result, polling clerk.user...",
        );
        let waited = 0;
        while (waited < 3000) {
          await new Promise((r) => setTimeout(r, 200));
          waited += 200;
          const u = clerk.user;
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
      const syncResult = await syncGoogleUser(
        googleEmail,
        googleClerkId,
        googleUsername,
      );

      if (syncResult && syncResult.user) {
        // Manually push to AuthContext to prevent the app from getting stuck if AuthContext missed it
        await setMongoUser(syncResult.user);
      }

      // Only reach here if account EXISTS in MongoDB
      console.log("✅ [Google] MongoDB account confirmed. Navigating to home.");
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
