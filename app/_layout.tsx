import React, { useState, useEffect } from "react";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { Stack } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";


import { ThemeProvider, useColorScheme } from "../contexts/ThemeContext";
import { DatabaseProvider } from "../contexts/DatabaseContext";
import AlarmScreen from "../components/AlarmScreen";
import { alarmService } from "../services/alarmService";
import { Reminder } from "../types";

const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#0072bb",
    secondary: "#34C759",
    tertiary: "#FF9500",
    error: "#FF3B30",
  },
};

const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#0072bb",
    secondary: "#34C759",
    tertiary: "#FF9500",
    error: "#FF3B30",
  },
};

function AppContent() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;
  const statusBarBgColor = colorScheme === "dark" ? darkTheme.colors.primary : lightTheme.colors.primary;
  
  const [activeAlarm, setActiveAlarm] = useState<Reminder | null>(null);

  useEffect(() => {
    // Set up alarm service callbacks
    alarmService.setAlarmCallback((reminder: Reminder) => {
      console.log('Alarm triggered for:', reminder.title);
      setActiveAlarm(reminder);
    });

    alarmService.setDismissCallback((reminder: Reminder) => {
      console.log('Alarm dismissed for:', reminder.title);
      setActiveAlarm(null);
    });

    alarmService.setSnoozeCallback((reminder: Reminder, minutes: number) => {
      console.log(`Alarm snoozed for ${minutes} minutes:`, reminder.title);
      setActiveAlarm(null);
    });

    return () => {
      // Cleanup if needed
    };
  }, []);

  const handleAlarmDismiss = async () => {
    if (activeAlarm) {
      await alarmService.dismissAlarm(activeAlarm);
      setActiveAlarm(null);
    }
  };

  const handleAlarmSnooze = async (minutes: number) => {
    if (activeAlarm) {
      await alarmService.snoozeAlarm(activeAlarm, minutes);
      setActiveAlarm(null);
    }
  };

  return (
    <PaperProvider theme={theme}>
      <SafeAreaView style={[styles.container, { backgroundColor: statusBarBgColor }]}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar
          style={"light"}
          backgroundColor={statusBarBgColor}
        />
        
        {/* Alarm Screen Overlay */}
        {activeAlarm && (
          <AlarmScreen
            reminder={activeAlarm}
            onDismiss={handleAlarmDismiss}
            onSnooze={handleAlarmSnooze}
          />
        )}
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <DatabaseProvider>
        <AppContent />
      </DatabaseProvider>
    </ThemeProvider>
  );
}
