import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ImageBackground,
} from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    const iitEmailRegex = /^[a-zA-Z0-9._%+-]+@iit\.ac\.lk$/;

    if (!iitEmailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please use your IIT email (example@iit.ac.lk)');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    // TODO: Connect to your backend or Firebase authentication here
    Alert.alert('Login Successful', Welcome, ${email}!);
  };

  return (
    <ImageBackground
      source={require('../../assets/background.png')} // optional background
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* App Logo */}
        <Image
          source={require('../../assets/iit_logo.png')}
          style={styles.logo}
        />

        {/* Title and Subtitle */}
        <Text style={styles.title}>IIT Connect</Text>
        <Text style={styles.subtitle}>Sign in with your IIT account</Text>

        {/* Email Field */}
        <TextInput
          style={styles.input}
          placeholder="Email (example@iit.ac.lk)"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Password Field */}
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Login Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Signup Link */}
        <TouchableOpacity>
          <Text style={styles.signupText}>Don’t have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    width: '85%',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    marginBottom: 18,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#003366',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  signupText: {
    marginTop: 25,
    color: '#003366',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});