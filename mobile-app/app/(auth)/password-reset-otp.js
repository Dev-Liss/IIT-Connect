import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function PasswordResetOTPScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Password Reset Updated</Text>
        <Text style={styles.subtitle}>
          Firebase uses password reset links by email instead of OTP codes.
        </Text>
        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 12 },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 24 },
  button: { backgroundColor: "#E31E24", padding: 14, borderRadius: 25 },
  buttonText: { color: "#fff", textAlign: "center", fontWeight: "700" },
});
