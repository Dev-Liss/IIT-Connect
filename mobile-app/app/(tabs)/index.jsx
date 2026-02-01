import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Co</Text>
          <View style={styles.logoIcon}>
            <Ionicons name="wifi" size={14} color="#D32F2F" />
          </View>
          <Text style={styles.logoText}>Nect</Text>
        </View>
        <Text style={styles.headerTitle}>Home</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          <Ionicons name="school" size={48} color="#D32F2F" />
          <Text style={styles.welcomeTitle}>Welcome to IIT Connect!</Text>
          <Text style={styles.welcomeText}>
            Connect with your university community
          </Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <Ionicons name="chatbubbles-outline" size={32} color="#D32F2F" />
            <Text style={styles.actionTitle}>Messages</Text>
            <Text style={styles.actionDescription}>Chat with friends</Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  logoIcon: {
    marginHorizontal: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 15,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 10,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#999',
  },
});
