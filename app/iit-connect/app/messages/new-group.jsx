import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from '@/styles/new-group.styles';

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

export default function NewGroupScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const filteredUsers = DUMMY_USERS.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.department.toLowerCase().includes(query)
    );
  });

  const toggleUserSelection = (user) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const isUserSelected = (userId) => {
    return selectedUsers.some(u => u.id === userId);
  };

  const handleNext = () => {
    if (selectedUsers.length < 2) {
      // Show alert - need at least 2 members
      return;
    }
    router.push({
      pathname: '/messages/create-group',
      params: { members: JSON.stringify(selectedUsers) },
    });
  };

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

  const renderUser = ({ item }) => {
    const selected = isUserSelected(item.id);
    
    return (
      <TouchableOpacity 
        style={styles.userItem}
        onPress={() => toggleUserSelection(item)}
      >
        {getAvatarContent(item)}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.userDepartment}>{item.department}</Text>
        </View>
        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Members</Text>
        <TouchableOpacity 
          onPress={handleNext}
          disabled={selectedUsers.length < 2}
        >
          <Text style={[styles.nextButton, selectedUsers.length < 2 && styles.nextButtonDisabled]}>
            Next
          </Text>
        </TouchableOpacity>
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

      {/* Selected Count */}
      <View style={styles.selectedInfo}>
        <Text style={styles.selectedCount}>{selectedUsers.length} selected</Text>
        <Text style={styles.minimumText}>Minimum 2 members</Text>
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
