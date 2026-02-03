import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputChangeEventData,
} from "react-native";
import { AUTH_ENDPOINTS } from "../config/api";

// Type for the API response
interface AuthResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  token?: string;
}

export default function LoginScreen(): React.JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    // 1. Basic validation
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Sending data to:", AUTH_ENDPOINTS.REGISTER);

      // 2. The API Call
      const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data: AuthResponse = await response.json();

      // 3. Handle Response
      if (data.success) {
        Alert.alert("Success", "Welcome back!");
        console.log("User Info:", data.user);
        // This is where we will navigate to the Home Screen later
      } else {
        Alert.alert("Login Failed", data.message ?? "Unknown error occurred");
      }
    } catch (error) {
      Alert.alert(
        "Network Error",
        "Could not connect to server.\nCheck if your laptop server is running.",
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IIT Connect Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        value={email}
        onChangeText={(text: string) => setEmail(text)}
        autoCapitalize="none"
        keyboardType="email-address"
        editable={!isLoading}
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        value={password}
        onChangeText={(text: string) => setPassword(text)}
        secureTextEntry={true}
        editable={!isLoading}
      />

      <Button
        title={isLoading ? "Signing In..." : "Sign In"}
        onPress={handleLogin}
        disabled={isLoading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
});
