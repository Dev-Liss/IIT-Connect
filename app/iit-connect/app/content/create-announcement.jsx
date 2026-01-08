import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 15,
    color: '#000',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  textArea: {
    minHeight: 150,
    textAlignVertical: 'top',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  prioritySelected: {
    backgroundColor: '#FFF5F5',
    borderColor: '#D32F2F',
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  priorityText: {
    fontSize: 14,
    color: '#666',
  },
  priorityTextSelected: {
    color: '#D32F2F',
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 15,
    marginBottom: 100,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    gap: 15,
  },
  backButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  createButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
