/**
 * ====================================
 * IIT CONNECT - LOGIN/REGISTER SCREEN
 * ====================================
 * Main entry screen for the app.
 * Users can register a new account or login to existing one.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";

// Import API configuration - TEAM: Update the IP in this file!
import { AUTH_ENDPOINTS, HEALTH_CHECK_URL } from "../src/config/api";

// Import Auth Context for session management
import { useAuth } from "../src/context/AuthContext";

export default function AuthScreen() {
  // ====================================
  // HOOKS
  // ====================================
  const router = useRouter();
  const { login } = useAuth();

  // ====================================
  // STATE MANAGEMENT
  // ====================================
  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");

  // UI state
  const [isRegistering, setIsRegistering] = useState(true); // Start with register
  const [isLoading, setIsLoading] = useState(false);

  // ====================================
  // API CALL - AUTHENTICATION
  // ====================================
  const handleAuth = async () => {
    // Validate common fields
    if (!email || !password) {
      Alert.alert("Error", "Email and password are required");
      return;
    }

    // Extra validation for registration
    if (isRegistering && (!username || !studentId)) {
      Alert.alert("Error", "All fields are required for registration");
      return;
    }

    setIsLoading(true);

    try {
      // Choose endpoint based on mode
      const endpoint = isRegistering
        ? AUTH_ENDPOINTS.REGISTER
        : AUTH_ENDPOINTS.LOGIN;

      console.log(
        `📡 Attempting ${isRegistering ? "register" : "login"} at:`,
        endpoint,
      );

      // Build request body
      const body = isRegistering
        ? { username, email, password, studentId }
        : { email, password };

      // Make API call
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        if (isRegistering) {
          Alert.alert(
            "🎉 Success!",
            "Account created! Now switch to Login and sign in.",
            [{ text: "OK", onPress: () => setIsRegistering(false) }],
          );
          // Clear form for login
          setPassword("");
        } else {
          // Save user to global auth state
          await login(data.user);
          console.log("✅ Logged in user:", data.user);
          // Navigate to feed screen
          router.replace("/feed");
        }
      } else {
        Alert.alert("❌ Error", data.message);
      }
    } catch (error) {
      console.error("Network Error:", error);
      Alert.alert(
        "🔌 Connection Error",
        "Could not connect to server.\n\n" +
          "Check:\n" +
          "1. Backend is running (node server.js)\n" +
          "2. IP address in src/config/api.ts is correct\n" +
          "3. Phone and laptop on same WiFi",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ====================================
  // TEST CONNECTION (for debugging)
  // ====================================
  const testConnection = async () => {
    setIsLoading(true);
    try {
      console.log("🔍 Testing connection to:", HEALTH_CHECK_URL);
      const response = await fetch(HEALTH_CHECK_URL);
      const data = await response.json();

      if (data.status === "ok") {
        Alert.alert("✅ Connected!", "Backend is reachable!");
      }
    } catch (error) {
      Alert.alert(
        "❌ Connection Failed",
        "Cannot reach the backend server.\nCheck the IP in src/config/api.ts",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ====================================
  // RENDER UI
  // ====================================
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🎓</Text>
          <Text style={styles.title}>IIT Connect</Text>
          <Text style={styles.subtitle}>
            {isRegistering ? "Create Your Account" : "Welcome Back!"}
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Username - Only for registration */}
          {isRegistering && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          )}

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
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

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Student ID - Only for registration */}
          {isRegistering && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Student ID</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., IIT2024001"
                placeholderTextColor="#999"
                value={studentId}
                onChangeText={setStudentId}
                autoCapitalize="characters"
              />
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {isRegistering ? "Create Account" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Mode */}
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsRegistering(!isRegistering)}
          >
            <Text style={styles.switchText}>
              {isRegistering
                ? "Already have an account? Sign In"
                : "Don't have an account? Register"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Debug Button - Test Connection */}
        <TouchableOpacity style={styles.debugButton} onPress={testConnection}>
          <Text style={styles.debugText}>🔌 Test Server Connection</Text>
        </TouchableOpacity>

        {/* Create Post Link - For Phase 3 Testing */}
        <Link href={"/create-post" as any} asChild>
          <TouchableOpacity style={styles.createPostButton}>
            <Text style={styles.createPostText}>
              📸 Create a Post (Phase 3)
            </Text>
          </TouchableOpacity>
        </Link>

        {/* View Feed Link - For Phase 3 Testing */}
        <Link href={"/feed" as any} asChild>
          <TouchableOpacity style={styles.createPostButton}>
            <Text style={styles.createPostText}>📱 View Feed (Phase 3)</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ====================================
// STYLES
// ====================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#e63946",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    color: "#457b9d",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1d3557",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#e63946",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  switchButton: {
    marginTop: 20,
    alignItems: "center",
  },
  switchText: {
    color: "#457b9d",
    fontSize: 15,
  },
  debugButton: {
    marginTop: 30,
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
  },
  debugText: {
    color: "#666",
    fontSize: 14,
  },
  createPostButton: {
    marginTop: 15,
    alignItems: "center",
    padding: 15,
    backgroundColor: "#e63946",
    borderRadius: 12,
  },
  createPostText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  feedButton: {
    backgroundColor: "#457b9d",
  },
});
