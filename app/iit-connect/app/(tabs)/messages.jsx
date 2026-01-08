import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from '@/styles/messages.styles';

const TABS = ['All', 'Direct', 'Groups', 'Clubs'];

const DUMMY_CONVERSATIONS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    type: 'direct',
    avatar: null,
    lastMessage: 'Hey! Did you finish the assignment?',
    time: '10:30 AM',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'CS101 - Tutorial Group 3',
    type: 'group',
    avatar: null,
    lastMessage: 'Meeting tomorrow at 2 PM',
    time: '9:45 AM',
    unread: 0,
    members: 24,
    isOfficial: true,
  },
  {
    id: '3',
    name: 'Tech Club',
    type: 'club',
    avatar: null,
    lastMessage: "Don't forget about the Hackathon!",
    time: '2 hours ago',
    unread: 5,
    members: 156,
  },
  {
    id: '4',
    name: 'Michael Chen',
    type: 'direct',
    avatar: null,
    lastMessage: 'Thanks for the notes!',
    time: 'Yesterday',
    unread: 0,
    online: false,
  },
  {
    id: '5',
    name: 'MATH201 - Tutorial Group 1',
    type: 'group',
    avatar: null,
    lastMessage: 'Quiz next week, lets study together',
    time: 'Yesterday',
    unread: 0,
    members: 18,
    isOfficial: true,
  },
  {
    id: '6',
    name: 'Drama Society',
    type: 'club',
    avatar: null,
    lastMessage: 'Auditions are open!',
    time: '2 days ago',
    unread: 0,
    members: 89,
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMenu, setShowNewMenu] = useState(false);

  const filteredConversations = DUMMY_CONVERSATIONS.filter((conv) => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'All') return matchesSearch;
    if (activeTab === 'Direct') return conv.type === 'direct' && matchesSearch;
    if (activeTab === 'Groups') return conv.type === 'group' && matchesSearch;
    if (activeTab === 'Clubs') return conv.type === 'club' && matchesSearch;
    return matchesSearch;
  });

  const getAvatarContent = (item) => {
    if (item.avatar) {
      return <Image source={{ uri: item.avatar }} style={styles.avatar} />;
    }
    
    const initials = item.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    const colors = ['#D32F2F', '#1976D2', '#388E3C', '#7B1FA2', '#F57C00'];
    const colorIndex = item.name.length % colors.length;
    
    return (
      <View style={[styles.avatarPlaceholder, { backgroundColor: colors[colorIndex] }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const getTypeIcon = (item) => {
    if (item.type === 'group' && item.isOfficial) {
      return (
        <View style={styles.officialBadge}>
          <Text style={styles.officialText}>TG</Text>
        </View>
      );
    }
    if (item.type === 'club') {
      return (
        <View style={styles.clubBadge}>
          <Ionicons name="people" size={10} color="#fff" />
        </View>
      );
    }
    return null;
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity 
      style={styles.conversationItem}
      onPress={() => router.push({ pathname: '/messages/chat', params: { id: item.id, name: item.name, type: item.type } })}
    >
      <View style={styles.avatarContainer}>
        {getAvatarContent(item)}
        {item.online && <View style={styles.onlineIndicator} />}
        {getTypeIcon(item)}
      </View>
      
      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.conversationTime}>{item.time}</Text>
        </View>
        <View style={styles.conversationFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Co</Text>
          <View style={styles.logoIcon}>
            <Ionicons name="wifi" size={14} color="#D32F2F" />
          </View>
          <Text style={styles.logoText}>Nect</Text>
        </View>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB for New Message */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => setShowNewMenu(true)}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* New Message Menu Modal */}
      <Modal
        visible={showNewMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowNewMenu(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNewMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowNewMenu(false);
                router.push('/messages/new-chat');
              }}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="chatbubble-outline" size={24} color="#D32F2F" />
              </View>
              <Text style={styles.menuText}>New Chat</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowNewMenu(false);
                router.push('/messages/new-group');
              }}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="people-outline" size={24} color="#D32F2F" />
              </View>
              <Text style={styles.menuText}>New Group</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowNewMenu(false);
                router.push('/messages/new-community');
              }}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="globe-outline" size={24} color="#D32F2F" />
              </View>
              <Text style={styles.menuText}>New Community</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowNewMenu(false)}
          >
            <Ionicons name="close" size={28} color="#D32F2F" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
