import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Reminder } from "../types";

interface AlarmScreenProps {
  reminder: Reminder;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
}

const { width, height } = Dimensions.get("window");

const AlarmScreen: React.FC<AlarmScreenProps> = ({
  reminder,
  onDismiss,
  onSnooze,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    // Prevent back button from dismissing the alarm
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        return true; // Prevent default behavior
      }
    );

    // Load and play alarm sound
    loadAndPlaySound();

    // Start animations
    startAnimations();

    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      backHandler.remove();
      clearInterval(timeInterval);
      if (sound) {
        sound.unloadAsync();
      }
      // Clear beeping pattern if it exists
      if ((global as any).alarmBeepInterval) {
        clearInterval((global as any).alarmBeepInterval);
      }
    };
  }, []);

  const loadAndPlaySound = async () => {
    try {
      // Set audio mode for alarm
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      // Create a simple alarm tone using expo-av
      // This creates a continuous beeping sound
      const soundObject = new Audio.Sound();

      // Load a system sound or create a simple tone
      // Using a built-in notification sound as alarm
      await soundObject.loadAsync(
        { uri: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav" },
        {
          shouldPlay: true,
          isLooping: true,
          volume: 1.0,
        }
      );

      setSound(soundObject);
    } catch (error) {
      console.error("Error loading alarm sound:", error);
      // Create a simple beeping pattern as fallback
      createBeepingPattern();
    }
  };

  const createBeepingPattern = () => {
    // Create a repeating beep pattern using setTimeout
    const beepInterval = setInterval(() => {
      // This would ideally play a short beep sound
      // For now, we'll use vibration as feedback
      console.log("BEEP! Alarm ringing...");
    }, 1000);

    // Store the interval to clear it later
    (global as any).alarmBeepInterval = beepInterval;
  };

  const startAnimations = () => {
    // Pulsing animation for the alarm icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleDismiss = async () => {
    try {
      // Stop and unload sound immediately
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      // Clear beeping pattern if it exists
      if ((global as any).alarmBeepInterval) {
        clearInterval((global as any).alarmBeepInterval);
        (global as any).alarmBeepInterval = null;
      }

      // Clear any other potential intervals
      const highestId = setTimeout(() => {}, 0);
      for (let i = 0; i < highestId; i++) {
        clearTimeout(i);
        clearInterval(i);
      }
    } catch (error) {
      console.error("Error stopping alarm sound:", error);
    }

    // Slide out animation
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onDismiss();
    });
  };

  const handleSnooze = async (minutes: number) => {
    try {
      // Stop and unload sound immediately
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      // Clear beeping pattern if it exists
      if ((global as any).alarmBeepInterval) {
        clearInterval((global as any).alarmBeepInterval);
        (global as any).alarmBeepInterval = null;
      }

      // Clear any other potential intervals
      const highestId = setTimeout(() => {}, 0);
      for (let i = 0; i < highestId; i++) {
        clearTimeout(i);
        clearInterval(i);
      }
    } catch (error) {
      console.error("Error stopping alarm sound:", error);
    }

    // Slide out animation
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onSnooze(minutes);
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={["#0072bb", "#009BFF", "#8AD1FF"]}
        style={styles.gradient}
      >
        <BlurView intensity={20} style={styles.blurContainer}>
          {/* Header with time */}
          <View style={styles.header}>
            <Text style={styles.currentTime}>{formatTime(currentTime)}</Text>
            <Text style={styles.currentDate}>{formatDate(currentTime)}</Text>
          </View>

          {/* Alarm Icon */}
          <View style={styles.iconContainer}>
            <Animated.View
              style={[
                styles.iconWrapper,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Ionicons name="alarm" size={120} color="white" />
            </Animated.View>
          </View>

          {/* Reminder Details */}
          <View style={styles.reminderContainer}>
            <Text style={styles.reminderTitle}>{reminder.title}</Text>
            {reminder.description && (
              <Text style={styles.reminderDescription}>
                {reminder.description}
              </Text>
            )}
            <Text style={styles.reminderTime}>
              Scheduled for {formatTime(reminder.dueDate)}
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {/* Snooze Options */}
            <View style={styles.snoozeContainer}>
              <Text style={styles.snoozeLabel}>Snooze</Text>
              <View style={styles.snoozeButtons}>
                <TouchableOpacity
                  style={styles.snoozeButton}
                  onPress={() => handleSnooze(5)}
                >
                  <Text style={styles.snoozeButtonText}>5m</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.snoozeButton}
                  onPress={() => handleSnooze(10)}
                >
                  <Text style={styles.snoozeButtonText}>10m</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.snoozeButton}
                  onPress={() => handleSnooze(15)}
                >
                  <Text style={styles.snoozeButtonText}>15m</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Dismiss Button */}
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
            >
              <Ionicons name="checkmark" size={32} color="white" />
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  gradient: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  currentTime: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  currentDate: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginTop: 5,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  iconWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 100,
    padding: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reminderContainer: {
    alignItems: "center",
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  reminderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  reminderDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 22,
  },
  reminderTime: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  actionsContainer: {
    alignItems: "center",
  },
  snoozeContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  snoozeLabel: {
    fontSize: 16,
    color: "white",
    marginBottom: 15,
    fontWeight: "600",
  },
  snoozeButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    maxWidth: 250,
  },
  snoozeButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  snoozeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  dismissButton: {
    backgroundColor: "#009BFF",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  dismissButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
});

export default AlarmScreen;
