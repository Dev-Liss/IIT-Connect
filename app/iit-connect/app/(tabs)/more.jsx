import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { styles } from '@/styles/more.styles';

const MENU_ITEMS = [
  {
    title: 'Academic',
    items: [
      { icon: 'book-outline', label: 'Notes & Papers', route: '/more/notes' },
      { icon: 'people-outline', label: 'Kuppi Sessions', route: '/more/kuppi' },
      { icon: 'calendar-outline', label: 'Timetable', route: '/more/timetable' },
      { icon: 'trophy-outline', label: 'SDGP Groups', route: '/more/sdgp' },
    ],
  },
  {
    title: 'Campus',
    items: [
      { icon: 'location-outline', label: 'Empty Halls Finder', route: '/more/empty-halls' },
      { icon: 'restaurant-outline', label: 'Canteen Menu', route: '/more/canteen' },
      { icon: 'bus-outline', label: 'Transport', route: '/more/transport' },
      { icon: 'map-outline', label: 'Campus Map', route: '/more/map' },
    ],
  },
  {
    title: 'Clubs & Societies',
    items: [
      { icon: 'globe-outline', label: 'All Clubs', route: '/more/clubs' },
      { icon: 'star-outline', label: 'My Clubs', route: '/more/my-clubs' },
      { icon: 'calendar-outline', label: 'Upcoming Events', route: '/more/events' },
    ],
  },
  {
    title: 'Payments',
    items: [
      { icon: 'card-outline', label: 'Payment Reminders', route: '/more/payments' },
      { icon: 'receipt-outline', label: 'Fee Receipts', route: '/more/receipts' },
    ],
  },
];

export default function MoreScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>Co</Text>
          <View style={styles.logoIcon}>
            <Ionicons name="wifi" size={14} color="#D32F2F" />
          </View>
          <Text style={styles.logoText}>Nect</Text>
        </View>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {MENU_ITEMS.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuGrid}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.menuItem}
                  onPress={() => router.push(item.route)}
                >
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon} size={24} color="#D32F2F" />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
