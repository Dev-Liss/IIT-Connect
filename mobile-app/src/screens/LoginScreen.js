import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ⚠️ YOUR SPECIFIC IP IS SET HERE
  const API_URL = "http://192.168.43.61:5000/api/auth/register";

  const handleLogin = async () => {
    // 1. Basic validation
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      console.log("Sending data to:", API_URL);

      // 2. The API Call
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      // 3. Handle Response
      if (data.success) {
        Alert.alert("Success", "Welcome back!");
        console.log("User Info:", data.user);
        // This is where we will navigate to the Home Screen later
      } else {
        Alert.alert("Login Failed", data.message);
      }
    } catch (error) {
      Alert.alert(
        "Network Error",
        "Could not connect to server.\nCheck if your laptop server is running.",
      );
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>IIT Connect Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={true}
      />

      <Button title="Sign In" onPress={handleLogin} />
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
