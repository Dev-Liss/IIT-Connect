/**
 * ====================================
 * STORIES RAIL COMPONENT
 * ====================================
 * Instagram-style stories rail with mini-poster cards.
 *
 * Features:
 * - Horizontal scrollable stories list
 * - Mini-Poster card design (vertical rectangles)
 * - Red border for unviewed, gray border for viewed
 * - "Add Story" card for current user
 * - User avatar overlay on each story
 */

import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// ====================================
// TYPES
// ====================================
interface Story {
  id: string;
  username: string;
  userAvatar: string;
  storyImage: string;
  viewed: boolean;
}

// ====================================
// MOCK DATA
// ====================================
const CURRENT_USER = {
  id: "current-user",
  username: "You",
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
};

const MOCK_STORIES: Story[] = [
  {
    id: "1",
    username: "priya_iit",
    userAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    storyImage:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&h=300&fit=crop",
    viewed: false,
  },
  {
    id: "2",
    username: "rahul_dev",
    userAvatar:
      "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100&h=100&fit=crop",
    storyImage:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&h=300&fit=crop",
    viewed: false,
  },
  {
    id: "3",
    username: "campus_life",
    userAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    storyImage:
      "https://images.unsplash.com/photo-1562774053-701939374585?w=200&h=300&fit=crop",
    viewed: true,
  },
  {
    id: "4",
    username: "tech_club",
    userAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    storyImage:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&h=300&fit=crop",
    viewed: false,
  },
  {
    id: "5",
    username: "sports_iit",
    userAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    storyImage:
      "https://images.unsplash.com/photo-1461896836934-68b42dc6d4f7?w=200&h=300&fit=crop",
    viewed: true,
  },
  {
    id: "6",
    username: "fest_2024",
    userAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    storyImage:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=200&h=300&fit=crop",
    viewed: false,
  },
];

// ====================================
// ADD STORY CARD (Current User)
// ====================================
const AddStoryCard = () => (
  <TouchableOpacity style={styles.storyCard} activeOpacity={0.8}>
    <View style={styles.addStoryContainer}>
      {/* User's avatar as background */}
      <Image
        source={{ uri: CURRENT_USER.avatar }}
        style={styles.addStoryBackground}
        resizeMode="cover"
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.cardGradient}
      />

      {/* Plus icon circle */}
      <View style={styles.addIconContainer}>
        <View style={styles.addIconCircle}>
          <Ionicons name="add" size={18} color="#fff" />
        </View>
      </View>

      {/* Username */}
      <Text style={styles.storyUsername} numberOfLines={1}>
        Add Story
      </Text>
    </View>
  </TouchableOpacity>
);

// ====================================
// STORY CARD
// ====================================
interface StoryCardProps {
  story: Story;
  onPress?: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onPress }) => (
  <TouchableOpacity
    style={[
      styles.storyCard,
      story.viewed ? styles.viewedBorder : styles.unviewedBorder,
    ]}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <ImageBackground
      source={{ uri: story.storyImage }}
      style={styles.storyBackground}
      imageStyle={styles.storyBackgroundImage}
      resizeMode="cover"
    >
      {/* Gradient overlay for text readability */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.cardGradient}
      />

      {/* User avatar overlay (bottom-left) */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: story.userAvatar }}
          style={[
            styles.userAvatar,
            story.viewed
              ? styles.avatarViewedBorder
              : styles.avatarUnviewedBorder,
          ]}
        />
      </View>

      {/* Username at bottom */}
      <Text style={styles.storyUsername} numberOfLines={1}>
        {story.username}
      </Text>
    </ImageBackground>
  </TouchableOpacity>
);

// ====================================
// MAIN COMPONENT
// ====================================
const StoriesRail: React.FC = () => {
  const handleStoryPress = (story: Story) => {
    console.log("📖 Opening story:", story.username);
    // TODO: Navigate to story viewer
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Add Story Card (First) */}
        <AddStoryCard />

        {/* Other Stories */}
        {MOCK_STORIES.map((story) => (
          <StoryCard
            key={story.id}
            story={story}
            onPress={() => handleStoryPress(story)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

// ====================================
// STYLES
// ====================================
const CARD_WIDTH = 90;
const CARD_HEIGHT = 125;
const CARD_BORDER_RADIUS = 12;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#efefef",
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 10,
  },

  // Story Card Base
  storyCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_BORDER_RADIUS,
    overflow: "hidden",
  },

  // Border States
  unviewedBorder: {
    borderWidth: 2.5,
    borderColor: "#f9252b",
  },
  viewedBorder: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },

  // Story Background
  storyBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  storyBackgroundImage: {
    borderRadius: CARD_BORDER_RADIUS - 2,
  },

  // Gradient Overlay
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_BORDER_RADIUS - 2,
  },

  // Avatar (Bottom-left corner)
  avatarContainer: {
    position: "absolute",
    bottom: 22,
    left: 4,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  avatarUnviewedBorder: {
    borderColor: "#f9252b",
  },
  avatarViewedBorder: {
    borderColor: "#e0e0e0",
  },

  // Username Text
  storyUsername: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "600",
    paddingHorizontal: 4,
    paddingBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // Add Story Card
  addStoryContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#262626",
    borderRadius: CARD_BORDER_RADIUS,
  },
  addStoryBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: CARD_BORDER_RADIUS,
    opacity: 0.6,
  },
  addIconContainer: {
    position: "absolute",
    bottom: 22,
    left: 4,
  },
  addIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f9252b",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
});

export default StoriesRail;
