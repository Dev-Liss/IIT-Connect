import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

let alertListener = null;

export const CustomAlertManager = {
  alert: (title, message, buttons, options) => {
    if (alertListener) {
      alertListener(title, message, buttons, options);
    } else {
      console.warn("CustomAlert not mounted. Alert:", title, message);
    }
  },
};

export default function CustomAlertContainer() {
  const [alerts, setAlerts] = useState([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    alertListener = (title, message, buttons, options) => {
      const id = Date.now().toString() + Math.random().toString();

      const lowerTitle = (title || "").toLowerCase();
      let type = "info";
      if (
        lowerTitle.includes("error") ||
        lowerTitle.includes("fail") ||
        lowerTitle.includes("incorrect")
      ) {
        type = "error";
      } else if (
        lowerTitle.includes("success") ||
        lowerTitle.includes("created")
      ) {
        type = "success";
      } else if (
        lowerTitle.includes("warning") ||
        lowerTitle.includes("required")
      ) {
        type = "warning";
      }

      setAlerts((prev) => [
        ...prev,
        {
          id,
          title,
          message,
          buttons: buttons || [{ text: "OK" }],
          type,
          options,
        },
      ]);
    };

    return () => {
      alertListener = null;
    };
  }, []);

  const closeAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const handlePress = (alert, button) => {
    closeAlert(alert.id);
    if (button && button.onPress) {
      button.onPress();
    }
  };

  if (alerts.length === 0) return null;

  const topOffset = Math.max(insets.top, Platform.OS === "ios" ? 44 : 24);

  return (
    <View
      style={[styles.container, { top: topOffset }]}
      pointerEvents="box-none"
    >
      {alerts.map((alert) => (
        <AlertItem
          key={alert.id}
          alert={alert}
          onClose={() => closeAlert(alert.id)}
          onButtonPress={(btn) => handlePress(alert, btn)}
        />
      ))}
    </View>
  );
}

function AlertItem({ alert, onClose, onButtonPress }) {
  const { title, message, buttons, type } = alert;

  let iconName = "information-circle";
  let iconColor = "#6b7280";
  let primaryBtnColor = "#f3f4f6";

  if (type === "success") {
    iconName = "checkmark-circle";
    iconColor = "#10b981";
    primaryBtnColor = "#d1fae5";
  } else if (type === "error") {
    iconName = "alert-circle";
    iconColor = "#ef4444";
    primaryBtnColor = "#fee2e2";
  } else if (type === "warning") {
    iconName = "warning";
    iconColor = "#f59e0b";
    primaryBtnColor = "#fef3c7";
  }

  const safeButtons =
    Array.isArray(buttons) && buttons.length > 0 ? buttons : [{ text: "OK" }];

  let primaryButton =
    safeButtons.find((b) => b.style !== "cancel") || safeButtons[0];
  let cancelButton = safeButtons.find((b) => b.style === "cancel");

  if (!cancelButton && safeButtons.length > 1) {
    cancelButton = safeButtons[safeButtons.length - 1];
    primaryButton = safeButtons[0];
  }

  return (
    <Animated.View entering={FadeInUp.duration(300)} style={styles.alertBox}>
      <View style={styles.header}>
        <Ionicons
          name={iconName}
          size={40}
          color={iconColor}
          style={styles.statusIcon}
        />
        <View style={styles.textContainer}>
          {!!title && <Text style={styles.title}>{title}</Text>}
          {!!message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>

      <View style={styles.actions}>
        {cancelButton && (
          <TouchableOpacity
            onPress={() => onButtonPress(cancelButton)}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>
              {cancelButton.text || "Dismiss"}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => onButtonPress(primaryButton)}
          style={[styles.primaryButton, { backgroundColor: primaryBtnColor }]}
        >
          <Text style={[styles.primaryText, { color: iconColor }]}>
            {primaryButton.text || "OK"}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  alertBox: {
    width: width * 0.95,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    paddingTop: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  closeIcon: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  statusIcon: {
    marginRight: 12,
    marginTop: 3,
  },
  textContainer: {
    flex: 1,
    paddingRight: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 16,
  },
  primaryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  primaryText: {
    fontSize: 14,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
});
