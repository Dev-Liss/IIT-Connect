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

export default function CreatePostScreen() {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [media, setMedia] = useState([]);

  const handlePost = () => {
    if (content.trim() === '') {
      Alert.alert('Error', 'Please add some content to your post');
      return;
    }
    
    // TODO: Create post via API
    console.log('Creating post:', {
      content,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      media,
    });
    
    Alert.alert('Success', 'Post created successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleAddMedia = () => {
    // TODO: Implement image/video picker
    Alert.alert('Coming Soon', 'Media upload will be available soon');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Content Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{"What's on your mind?"} *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Share your thoughts..."
            placeholderTextColor="#999"
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={5}
          />
        </View>

        {/* Media Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Media (Optional)</Text>
          <TouchableOpacity style={styles.mediaUpload} onPress={handleAddMedia}>
            <Ionicons name="images-outline" size={32} color="#999" />
            <Text style={styles.mediaUploadText}>Add photos or videos</Text>
            <Text style={styles.mediaUploadSubtext}>Click to select files</Text>
          </TouchableOpacity>
        </View>

        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags</Text>
          <TextInput
            style={styles.input}
            placeholder="campus, events, community"
            placeholderTextColor="#999"
            value={tags}
            onChangeText={setTags}
          />
          <Text style={styles.helperText}>Separate tags with commas</Text>
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
          style={[styles.postButton, content.trim() === '' && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={content.trim() === ''}
        >
          <Text style={styles.postButtonText}>Preview</Text>
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
    minHeight: 120,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  mediaUpload: {
    borderWidth: 2,
    borderColor: '#E8E8E8',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 30,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  mediaUploadText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  mediaUploadSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 3,
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
  postButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 25,
    backgroundColor: '#D32F2F',
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#ccc',
  },
  postButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
