import React from "react";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { PaperProvider, MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { Stack } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";
import "react-native-reanimated";

import { ThemeProvider, useColorScheme } from "../contexts/ThemeContext";
import { DatabaseProvider } from "../contexts/DatabaseContext";

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
