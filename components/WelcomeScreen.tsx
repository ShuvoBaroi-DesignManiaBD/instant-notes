import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = () => {
    // Navigate to the main app (home screen)
    router.replace('/(tabs)');
  };

  return (
    <LinearGradient
      colors={['#0072bb', '#004d7a', '#002d4a']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        {/* App Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="document-text" size={80} color="#FFFFFF" />
        </View>

        {/* App Name */}
        <Text style={styles.appName}>Instant Notes</Text>

        {/* Tagline */}
        <Text style={styles.tagline}>
          Capture your thoughts instantly.{"\n"}
          Organize your ideas effortlessly.
        </Text>

        {/* Get Started Button */}
        <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted}>
          <Text style={styles.getStartedText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#0072bb" style={styles.buttonIcon} />
        </TouchableOpacity>

        {/* Developer Credit */}
        <Text style={styles.developerCredit}>Developed by Shuvo Baroi</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  iconContainer: {
    marginBottom: 30,
    padding: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    color: '#E8F4FD',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 26,
    opacity: 0.9,
  },
  getStartedButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0072bb',
    marginRight: 8,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  developerCredit: {
    fontSize: 12,
    color: '#B8D4E8',
    textAlign: 'center',
    opacity: 0.8,
    position: 'absolute',
    bottom: -100,
  },
});