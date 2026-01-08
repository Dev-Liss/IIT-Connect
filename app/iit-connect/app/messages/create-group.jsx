import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { styles } from '@/styles/create-group.styles';

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
