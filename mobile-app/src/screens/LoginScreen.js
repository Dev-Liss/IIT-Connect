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

export default function LoginScreen({ onSignUp, onLoginSuccess, onForgotPassword }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ⚠️ YOUR SPECIFIC IP IS SET HERE
  const API_URL = "http://192.168.1.74:5000/api/auth/login";

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    // 1. Basic validation
    if (!trimmedEmail || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    // Suggest IIT email if domain is common or not IIT
    if (!trimmedEmail.toLowerCase().endsWith("@iit.ac.lk")) {
      // Since we don't know if the user is a student/lecture or alumni here,
      // we should warn them but maybe allow if they are alumni?
      // User said: "doesn't go to the next page until they enter iit mail"
      // Let's implement a prompt.
      Alert.alert(
        "IIT Email Required",
        "Students and Lecturers must use their official @iit.ac.lk email. Are you an Alumni using a personal mail?",
        [
          { text: "No, I'm a Student/Lecture", onPress: () => { }, style: "cancel" },
          { text: "Yes, I'm an Alumni", onPress: () => performLogin(trimmedEmail) }
        ]
      );
      return;
    }

    performLogin(trimmedEmail);
  };

  const performLogin = async (loginEmail) => {
    try {
      console.log("Sending data to:", API_URL);

      // 2. The API Call
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: loginEmail,
          password: password,
        }),
      });

      const data = await response.json();

      // 3. Handle Response
      if (data.success) {
        Alert.alert("Success", "Welcome back!");
        console.log("User Info:", data.user);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        // Handle specific error cases
        if (data.userNotFound) {
          Alert.alert("Account Not Found", "Please sign up");
        } else if (data.wrongPassword) {
          Alert.alert("Login Failed", "Password is incorrect");
        } else {
          Alert.alert("Login Failed", data.message || "Invalid credentials");
        }
      }
    } catch (error) {
      Alert.alert(
        "Network Error",
        "Could not connect to server.\nCheck if your laptop server is running."
      );
      console.error(error);
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert("Google Sign In", "Google sign-in will be implemented soon");
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
          <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
            <Text style={styles.signInButtonText}>Sign in</Text>
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
