import { View, Text, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { styles } from '@/styles/welcome.styles';

export default function WelcomeScreen() {
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

      {/* Get Started Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(auth)/user-type')}
      >
        <Text style={styles.buttonText}>GET STARTED</Text>
        <Text style={styles.arrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}
