import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from '@/styles/create-announcement.styles';

export default function CreateAnnouncementScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');

  const handleCreate = () => {
    if (title.trim() === '' || content.trim() === '') {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    // TODO: Create announcement via API
    console.log('Creating announcement:', {
      title,
      content,
      priority,
    });
    
    Alert.alert('Success', 'Announcement created successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Announcement</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Announcement title"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Content */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Content *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write your announcement..."
            placeholderTextColor="#999"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={6}
          />
        </View>

        {/* Priority */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityContainer}>
            <TouchableOpacity
              style={[styles.priorityOption, priority === 'low' && styles.prioritySelected]}
              onPress={() => setPriority('low')}
            >
              <View style={[styles.priorityDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={[styles.priorityText, priority === 'low' && styles.priorityTextSelected]}>Low</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.priorityOption, priority === 'normal' && styles.prioritySelected]}
              onPress={() => setPriority('normal')}
            >
              <View style={[styles.priorityDot, { backgroundColor: '#2196F3' }]} />
              <Text style={[styles.priorityText, priority === 'normal' && styles.priorityTextSelected]}>Normal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.priorityOption, priority === 'high' && styles.prioritySelected]}
              onPress={() => setPriority('high')}
            >
              <View style={[styles.priorityDot, { backgroundColor: '#FF9800' }]} />
              <Text style={[styles.priorityText, priority === 'high' && styles.priorityTextSelected]}>High</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.priorityOption, priority === 'urgent' && styles.prioritySelected]}
              onPress={() => setPriority('urgent')}
            >
              <View style={[styles.priorityDot, { backgroundColor: '#D32F2F' }]} />
              <Text style={[styles.priorityText, priority === 'urgent' && styles.priorityTextSelected]}>Urgent</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#2196F3" />
          <Text style={styles.infoText}>
            Announcements will be visible to all users. Make sure the information is accurate and appropriate.
          </Text>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.createButton, (title.trim() === '' || content.trim() === '') && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={title.trim() === '' || content.trim() === ''}
        >
          <Text style={styles.createButtonText}>Post</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
