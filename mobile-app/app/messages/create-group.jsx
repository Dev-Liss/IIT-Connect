import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CreateGroupScreen() {
  const router = useRouter();
  const { members } = useLocalSearchParams();
  const selectedMembers = members ? JSON.parse(members) : [];

  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (groupName.trim() === '') return;

    // TODO: Create group via API
    console.log('Creating group:', {
      name: groupName,
      description,
      members: selectedMembers,
    });

    // Navigate back to messages
    router.replace('/(tabs)/messages');
  };

  const getAvatarContent = (user) => {
    const initials = user.name.split(' ').map(n => n[0]).join('');
    const colors = ['#D32F2F', '#1976D2', '#388E3C', '#7B1FA2', '#F57C00'];
    const colorIndex = user.name.length % colors.length;

    return (
      <View style={[styles.memberAvatar, { backgroundColor: colors[colorIndex] }]}>
        <Text style={styles.memberAvatarText}>{initials}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Group</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Group Icon */}
        <View style={styles.groupIconContainer}>
          <View style={styles.groupIconWrapper}>
            <View style={styles.groupIcon}>
              <Ionicons name="people" size={40} color="#D32F2F" />
            </View>
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </View>
          <Text style={styles.membersCount}>{selectedMembers.length} members selected</Text>
        </View>

        {/* Group Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Group Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter group name"
            placeholderTextColor="#999"
            value={groupName}
            onChangeText={setGroupName}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="What's the group about?"
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Members List */}
        <View style={styles.membersSection}>
          <Text style={styles.label}>Members</Text>
          {selectedMembers.map((member) => (
            <View key={member.id} style={styles.memberItem}>
              {getAvatarContent(member)}
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberEmail}>{member.email}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Create Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, groupName.trim() === '' && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={groupName.trim() === ''}
        >
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  groupIconContainer: {
    alignItems: 'center',
    paddingVertical: 25,
  },
  groupIconWrapper: {
    position: 'relative',
  },
  groupIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  membersCount: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  membersSection: {
    marginBottom: 100,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  memberEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  createButton: {
    backgroundColor: '#D32F2F',
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
