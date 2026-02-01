import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const DUMMY_USERS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.j@university.edu',
    department: 'Computer Science',
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.c@university.edu',
    department: 'Mathematics',
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily.d@university.edu',
    department: 'Computer Science',
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james.w@university.edu',
    department: 'Engineering',
  },
  {
    id: '5',
    name: 'Olivia Brown',
    email: 'olivia.b@university.edu',
    department: 'Business',
  },
  {
    id: '6',
    name: 'Daniel Martinez',
    email: 'daniel.m@university.edu',
    department: 'Computer Science',
  },
  {
    id: '7',
    name: 'Sophia Taylor',
    email: 'sophia.t@university.edu',
    department: 'Mathematics',
  },
  {
    id: '8',
    name: 'William Anderson',
    email: 'william.a@university.edu',
    department: 'Engineering',
  },
];

export default function NewChatScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = DUMMY_USERS.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.department.toLowerCase().includes(query)
    );
  });

  const getAvatarContent = (user) => {
    const initials = user.name.split(' ').map(n => n[0]).join('');
    const colors = ['#D32F2F', '#1976D2', '#388E3C', '#7B1FA2', '#F57C00'];
    const colorIndex = user.name.length % colors.length;

    return (
      <View style={[styles.avatarPlaceholder, { backgroundColor: colors[colorIndex] }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
    );
  };

  const handleUserSelect = (user) => {
    router.push({
      pathname: '/messages/chat',
      params: { id: user.id, name: user.name, type: 'direct' },
    });
  };

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserSelect(item)}
    >
      {getAvatarContent(item)}
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
        <Text style={styles.userDepartment}>{item.department}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Chat</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or department..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 34,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 20,
    marginVertical: 15,
    borderRadius: 25,
    paddingHorizontal: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 1,
  },
  userDepartment: {
    fontSize: 12,
    color: '#999',
  },
});
