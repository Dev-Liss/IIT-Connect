import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from '@/styles/home.styles';

const STORIES = [
  { id: '0', name: 'Your Story', isYou: true },
  { id: '1', name: 'Drama Club', color: '#D32F2F' },
  { id: '2', name: 'Tech Society', color: '#1976D2' },
  { id: '3', name: 'Music Club', color: '#388E3C' },
  { id: '4', name: 'Sports', color: '#F57C00' },
  { id: '5', name: 'Art Club', color: '#7B1FA2' },
];

const FEED_POSTS = [
  {
    id: '1',
    type: 'post',
    author: {
      name: 'Priya Sharma',
      subtitle: 'Computer Science, Year 3',
      avatar: null,
    },
    content: 'Finally finished our Machine Learning project! 🎉\nThanks to my amazing team for all the hard work.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600',
    likes: 234,
    comments: 18,
    time: '2 hours ago',
    saved: false,
  },
  {
    id: '2',
    type: 'event',
    title: 'Annual Blood Donation Drive',
    date: 'December 5, 2024',
    time: '10:00 AM - 4:00 PM',
    location: 'Main Campus Auditorium',
    image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600',
    likes: 456,
    comments: 67,
    rsvpCount: 120,
  },
  {
    id: '3',
    type: 'announcement',
    author: {
      name: 'University Admin',
      subtitle: 'Official Announcement',
      isOfficial: true,
    },
    content: 'Winter Break Schedule Released\n\nThe university will observe winter break from December 20th to January 5th. All hostel residents must complete checkout formalities before departure. Have a great break!',
    likes: 892,
    comments: 124,
    time: '1 day ago',
  },
  {
    id: '4',
    type: 'post',
    author: {
      name: 'Rahul Verma',
      subtitle: 'Electronics, Year 4',
      avatar: null,
    },
    content: 'Beautiful sunset from the campus today 🌅',
    image: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600',
    likes: 567,
    comments: 45,
    time: '6 hours ago',
    saved: true,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Feed');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [posts, setPosts] = useState(FEED_POSTS);

  const toggleLike = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    ));
  };

  const toggleSave = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, saved: !post.saved }
        : post
    ));
  };

  const renderStory = ({ item }) => (
    <TouchableOpacity style={styles.storyItem}>
      <View style={[styles.storyRing, item.isYou && styles.storyRingYou]}>
        {item.isYou ? (
          <View style={styles.storyAvatarYou}>
            <Ionicons name="add" size={24} color="#D32F2F" />
          </View>
        ) : (
          <View style={[styles.storyAvatar, { backgroundColor: item.color }]}>
            <Text style={styles.storyInitial}>{item.name[0]}</Text>
          </View>
        )}
      </View>
      <Text style={styles.storyName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }) => {
    if (item.type === 'event') {
      return (
        <View style={styles.postCard}>
          {item.image && (
            <Image source={{ uri: item.image }} style={styles.postImage} />
          )}
          <View style={styles.eventContent}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <View style={styles.eventDetail}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.eventText}>{item.date}</Text>
            </View>
            <View style={styles.eventDetail}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.eventText}>{item.time}</Text>
            </View>
            <View style={styles.eventDetail}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.eventText}>{item.location}</Text>
            </View>
            <TouchableOpacity style={styles.rsvpButton}>
              <Text style={styles.rsvpButtonText}>RSVP to Event</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(item.id)}>
              <Ionicons name="heart-outline" size={24} color="#000" />
              <Text style={styles.actionText}>{item.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={22} color="#000" />
              <Text style={styles.actionText}>{item.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (item.type === 'announcement') {
      return (
        <View style={[styles.postCard, styles.announcementCard]}>
          <View style={styles.postHeader}>
            <View style={styles.authorAvatarAnnouncement}>
              <Ionicons name="megaphone" size={20} color="#D32F2F" />
            </View>
            <View style={styles.authorInfo}>
              <View style={styles.authorNameRow}>
                <Text style={styles.authorName}>{item.author.name}</Text>
                {item.author.isOfficial && (
                  <View style={styles.officialBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#D32F2F" />
                  </View>
                )}
              </View>
              <Text style={styles.authorSubtitle}>{item.author.subtitle}</Text>
            </View>
          </View>
          <View style={styles.postDetails}>
            <Text style={styles.postContent}>{item.content}</Text>
            <Text style={styles.postTime}>{item.time}</Text>
          </View>
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(item.id)}>
              <Ionicons name="heart-outline" size={24} color="#000" />
              <Text style={styles.actionText}>{item.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={22} color="#000" />
              <Text style={styles.actionText}>{item.comments}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="share-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Regular post
    const avatarColors = ['#D32F2F', '#1976D2', '#388E3C', '#7B1FA2', '#F57C00'];
    const colorIndex = item.author.name.length % avatarColors.length;
    
    return (
      <View style={styles.postCard}>
        <View style={styles.postHeader}>
          <View style={[styles.authorAvatar, { backgroundColor: avatarColors[colorIndex] }]}>
            <Text style={styles.authorInitial}>{item.author.name[0]}</Text>
          </View>
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{item.author.name}</Text>
            <Text style={styles.authorSubtitle}>{item.author.subtitle}</Text>
          </View>
        </View>
        {item.image && (
          <Image source={{ uri: item.image }} style={styles.postImage} />
        )}
        <View style={styles.postActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => toggleLike(item.id)}>
            <Ionicons name="heart-outline" size={24} color="#000" />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={22} color="#000" />
            <Text style={styles.actionText}>{item.comments}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#000" />
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={() => toggleSave(item.id)}>
            <Ionicons 
              name={item.saved ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={item.saved ? "#D32F2F" : "#000"} 
            />
          </TouchableOpacity>
        </View>
        <View style={styles.postDetails}>
          <Text style={styles.likesText}>{item.likes} likes</Text>
          <Text style={styles.postContent}>{item.content}</Text>
          <TouchableOpacity>
            <Text style={styles.viewComments}>View all {item.comments} comments</Text>
          </TouchableOpacity>
          <Text style={styles.postTime}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Co</Text>
          <View style={styles.logoIcon}>
            <Ionicons name="wifi" size={16} color="#D32F2F" />
          </View>
          <Text style={styles.logoText}>Nect</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={26} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed/Reels Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Feed' && styles.activeTab]}
          onPress={() => setActiveTab('Feed')}
        >
          <Text style={[styles.tabText, activeTab === 'Feed' && styles.activeTabText]}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Reels' && styles.activeTab]}
          onPress={() => setActiveTab('Reels')}
        >
          <Text style={[styles.tabText, activeTab === 'Reels' && styles.activeTabText]}>Reels</Text>
        </TouchableOpacity>
      </View>

      {/* Stories */}
      <View style={styles.storiesContainer}>
        <FlatList
          data={STORIES}
          renderItem={renderStory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesList}
        />
      </View>

      {/* Posts Feed */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContainer}
      />

      {/* Create Content Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Content</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalOptions}>
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => {
                  setShowCreateModal(false);
                  router.push('/content/create-reel');
                }}
              >
                <View style={styles.modalOptionIcon}>
                  <Ionicons name="videocam-outline" size={28} color="#666" />
                </View>
                <Text style={styles.modalOptionTitle}>Create Reel</Text>
                <Text style={styles.modalOptionSubtitle}>Share a video moment</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => {
                  setShowCreateModal(false);
                  router.push('/content/create-post');
                }}
              >
                <View style={styles.modalOptionIcon}>
                  <Ionicons name="images-outline" size={28} color="#D32F2F" />
                </View>
                <Text style={styles.modalOptionTitle}>Create Post</Text>
                <Text style={styles.modalOptionSubtitle}>Share photos and thoughts</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => {
                  setShowCreateModal(false);
                  router.push('/content/create-event');
                }}
              >
                <View style={styles.modalOptionIcon}>
                  <Ionicons name="calendar-outline" size={28} color="#666" />
                </View>
                <Text style={styles.modalOptionTitle}>Create Event</Text>
                <Text style={styles.modalOptionSubtitle}>Organize an event</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalOption}
                onPress={() => {
                  setShowCreateModal(false);
                  router.push('/content/create-announcement');
                }}
              >
                <View style={styles.modalOptionIcon}>
                  <Ionicons name="megaphone-outline" size={28} color="#666" />
                </View>
                <Text style={styles.modalOptionTitle}>Create Announcement</Text>
                <Text style={styles.modalOptionSubtitle}>Make an announcement</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  logoIcon: {
    marginHorizontal: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  headerButton: {
    padding: 5,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: '#D32F2F',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  storiesContainer: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  storiesList: {
    paddingHorizontal: 15,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 65,
  },
  storyRing: {
    padding: 3,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#D32F2F',
  },
  storyRingYou: {
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  storyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatarYou: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  storyName: {
    fontSize: 11,
    color: '#000',
    marginTop: 5,
    textAlign: 'center',
  },
  feedContainer: {
    paddingBottom: 20,
  },
  postCard: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  announcementCard: {
    backgroundColor: '#FFF9F9',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorAvatarAnnouncement: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    marginRight: 12,
  },
  authorInitial: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  authorInfo: {
    flex: 1,
  },
  authorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  officialBadge: {
    marginLeft: 5,
  },
  authorSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
  postImage: {
    width: width,
    height: width * 0.8,
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#000',
  },
  postDetails: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  likesText: {
    fontWeight: '600',
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
  },
  postContent: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    marginBottom: 5,
  },
  viewComments: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  postTime: {
    fontSize: 11,
    color: '#999',
  },
  eventContent: {
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  eventText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  rsvpButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 15,
  },
  rsvpButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width - 40,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  modalOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  modalOption: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    alignItems: 'center',
  },
  modalOptionIcon: {
    marginBottom: 10,
  },
  modalOptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  modalOptionSubtitle: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 3,
  },
});
