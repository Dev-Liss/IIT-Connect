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
import { styles } from '@/styles/create-post.styles';

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
