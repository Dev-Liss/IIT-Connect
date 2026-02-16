import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

interface ContentSwitcherProps {
  activeTab: "feed" | "reels";
  onTabChange: (tab: "feed" | "reels") => void;
}

const ContentSwitcher: React.FC<ContentSwitcherProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "feed" ? styles.activeTab : styles.inactiveTab,
        ]}
        onPress={() => onTabChange("feed")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "feed" ? styles.activeText : styles.inactiveText,
          ]}
        >
          Feed
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "reels" ? styles.activeTab : styles.inactiveTab,
        ]}
        onPress={() => onTabChange("reels")}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "reels" ? styles.activeText : styles.inactiveText,
          ]}
        >
          Reels
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#F2F2F2",
    borderRadius: 30,
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
  },
  activeTab: {
    backgroundColor: "#f9252b",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  inactiveTab: {
    backgroundColor: "transparent",
  },
  tabText: {
    fontSize: 15,
  },
  activeText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  inactiveText: {
    color: "#8E8E93",
    fontWeight: "600",
  },
});

export default ContentSwitcher;
