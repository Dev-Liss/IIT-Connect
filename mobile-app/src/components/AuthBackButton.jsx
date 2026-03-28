import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AuthBackButton({ onPress, style }) {
  if (!onPress) return null;

  return (
    <TouchableOpacity style={[styles.backButton, style]} onPress={onPress}>
      <Ionicons name="chevron-back" size={26} color="#1a1a1a" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
