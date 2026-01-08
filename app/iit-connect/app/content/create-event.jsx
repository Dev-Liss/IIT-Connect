import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CreateEventScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [enableRSVP, setEnableRSVP] = useState(true);
  const [maxAttendees, setMaxAttendees] = useState('');

  const handleCreate = () => {
    if (title.trim() === '' || description.trim() === '' || date.trim() === '' || location.trim() === '') {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    // TODO: Create event via API
    console.log('Creating event:', {
      title,
      description,
      date,
      time,
      location,
      enableRSVP,
      maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
    });
    
    Alert.alert('Success', 'Event created successfully!', [
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
        <Text style={styles.headerTitle}>Create Event</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Event Title */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Annual Tech Fest 2024"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Tell people about your event..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Date and Time */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#999"
              value={date}
              onChangeText={setDate}
            />
          </View>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Time *</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor="#999"
              value={time}
              onChangeText={setTime}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Main Auditorium"
            placeholderTextColor="#999"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* RSVP Toggle */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Enable RSVP</Text>
            <Text style={styles.toggleDescription}>Allow registration</Text>
          </View>
          <Switch
            value={enableRSVP}
            onValueChange={setEnableRSVP}
            trackColor={{ false: '#ddd', true: '#FFCDD2' }}
            thumbColor={enableRSVP ? '#D32F2F' : '#999'}
          />
        </View>

        {/* Max Attendees */}
        {enableRSVP && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Max Attendees (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Leave empty for unlimited"
              placeholderTextColor="#999"
              value={maxAttendees}
              onChangeText={setMaxAttendees}
              keyboardType="numeric"
            />
          </View>
        )}
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
          style={[styles.createButton, (title.trim() === '' || description.trim() === '' || date.trim() === '' || location.trim() === '') && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={title.trim() === '' || description.trim() === '' || date.trim() === '' || location.trim() === ''}
        >
          <Text style={styles.createButtonText}>Preview</Text>
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
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
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
    minHeight: 100,
    textAlignVertical: 'top',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    marginBottom: 20,
  },
  toggleInfo: {
    flex: 1,
    marginRight: 15,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  toggleDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
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
