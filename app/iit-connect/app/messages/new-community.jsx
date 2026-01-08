import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from '@/styles/new-community.styles';

export default function NewCommunityScreen() {
  const router = useRouter();
  const [communityName, setCommunityName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [category, setCategory] = useState('');

  const CATEGORIES = ['Academic', 'Sports', 'Arts', 'Technology', 'Social', 'Other'];

  const handleCreate = () => {
    if (communityName.trim() === '') return;
    
    // TODO: Create community via API
    console.log('Creating community:', {
      name: communityName,
      description,
      isPublic,
      category,
    });
    
    router.replace('/(tabs)/messages');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Community</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Community Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconWrapper}>
            <View style={styles.icon}>
              <Ionicons name="globe" size={40} color="#D32F2F" />
            </View>
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </View>
        </View>

        {/* Community Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Community Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter community name"
            placeholderTextColor="#999"
            value={communityName}
            onChangeText={setCommunityName}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your community..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Category */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryChip, category === cat && styles.categoryChipSelected]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryText, category === cat && styles.categoryTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Public/Private Toggle */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Public Community</Text>
            <Text style={styles.toggleDescription}>
              Anyone can find and join this community
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: '#ddd', true: '#FFCDD2' }}
            thumbColor={isPublic ? '#D32F2F' : '#999'}
          />
        </View>
      </ScrollView>

      {/* Create Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, communityName.trim() === '' && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={communityName.trim() === ''}
        >
          <Text style={styles.createButtonText}>Create Community</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
