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
import { styles } from '@/styles/create-reel.styles';

export default function CreateReelScreen() {
  const router = useRouter();
  const [caption, setCaption] = useState('');
  const [tags, setTags] = useState('');
  const [video, setVideo] = useState(null);

  const handlePost = () => {
    if (!video) {
      Alert.alert('Error', 'Please upload a video');
      return;
    }
    
    // TODO: Create reel via API
    console.log('Creating reel:', {
      caption,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      video,
    });
    
    Alert.alert('Success', 'Reel created successfully!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleUploadVideo = () => {
    // TODO: Implement video picker
    Alert.alert('Coming Soon', 'Video upload will be available soon');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Reel</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Video *</Text>
          <TouchableOpacity style={styles.videoUpload} onPress={handleUploadVideo}>
            <Ionicons name="cloud-upload-outline" size={40} color="#999" />
            <Text style={styles.uploadText}>Click to upload video</Text>
            <Text style={styles.uploadSubtext}>MP4, MOV, AVI up to 100MB</Text>
          </TouchableOpacity>
        </View>

        {/* Caption */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Caption</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Write a caption..."
            placeholderTextColor="#999"
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Tags */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tags</Text>
          <TextInput
            style={styles.input}
            placeholder="music, dance, fun"
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
          style={[styles.postButton, !video && styles.postButtonDisabled]}
          onPress={handlePost}
          disabled={!video}
        >
          <Text style={styles.postButtonText}>Preview</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
