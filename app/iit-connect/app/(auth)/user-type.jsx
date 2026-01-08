import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { styles } from '@/styles/user-type.styles';

export default function UserTypeScreen() {
  const handleUserTypeSelect = (type) => {
    // Store user type and navigate to login
    router.push('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/assets/images/Gemini_Generated_Image_x13xnbx13xnbx13x.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>CoNNect</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Who you are</Text>

      {/* User Type Options */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => handleUserTypeSelect('student')}
        >
          <Text style={styles.optionText}>Student</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => handleUserTypeSelect('lecture')}
        >
          <Text style={styles.optionText}>Lecture</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => handleUserTypeSelect('alumni')}
        >
          <Text style={styles.optionText}>Alumni</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
