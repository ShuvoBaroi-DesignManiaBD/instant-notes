import React, { useState } from "react";
import { ScrollView, StyleSheet, View, Alert, Linking, Pressable } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Divider,
  List,
  Switch,
  Text,
  Title,
  useTheme,
  Menu,
  IconButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme as useAppTheme } from "../../contexts/ThemeContext";

interface AppSettings {
  autoSave: boolean;
  notificationsEnabled: boolean;
  syncEnabled: boolean;
  defaultView: "grid" | "list";
}

export default function SettingsScreen() {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useAppTheme();
  const [themeMenuVisible, setThemeMenuVisible] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    autoSave: true,
    notificationsEnabled: true,
    syncEnabled: false,
    defaultView: "list",
  });

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const SettingCard = ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <Card
      style={[styles.settingCard, { backgroundColor: theme.colors.surface }]}
    >
      <Card.Content>
        <Title style={styles.cardTitle}>{title}</Title>
        {children}
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.Content title="Settings" />
        <Appbar.Action
          icon="information"
          onPress={() => {
            Alert.alert('App Information', 'Instant Notes v1.0.0\n\nA modern note-taking app developed by Shuvo Baroi');
          }}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <SettingCard title="Appearance">
          <List.Item
            title="Theme"
            description={`Current: ${themeMode}`}
            left={(props) => <List.Icon {...props} icon="palette" />}
            right={() => (
              <Menu
                visible={themeMenuVisible}
                onDismiss={() => setThemeMenuVisible(false)}
                anchor={
                  <IconButton
                    icon={
                      themeMode === "light"
                        ? "white-balance-sunny"
                        : themeMode === "dark"
                        ? "moon-waning-crescent"
                        : "brightness-auto"
                    }
                    onPress={() => setThemeMenuVisible(true)}
                  />
                }
              >
                <Menu.Item
                  onPress={() => {
                    setThemeMode("light");
                    setThemeMenuVisible(false);
                  }}
                  title="Light"
                  leadingIcon="white-balance-sunny"
                />
                <Menu.Item
                  onPress={() => {
                    setThemeMode("dark");
                    setThemeMenuVisible(false);
                  }}
                  title="Dark"
                  leadingIcon="moon-waning-crescent"
                />
                <Menu.Item
                  onPress={() => {
                    setThemeMode("system");
                    setThemeMenuVisible(false);
                  }}
                  title="Auto"
                  leadingIcon="brightness-auto"
                />
              </Menu>
            )}
          />
          <Divider />
          <List.Item
            title="Default View"
            description={`Notes display as ${settings.defaultView}`}
            left={(props) => <List.Icon {...props} icon="view-grid" />}
            right={() => (
              <Switch
                value={settings.defaultView === "grid"}
                onValueChange={(value) =>
                  updateSetting("defaultView", value ? "grid" : "list")
                }
              />
            )}
          />
        </SettingCard>

        <SettingCard title="Editor">
          <List.Item
            title="Auto-save"
            description="Automatically save notes while typing"
            left={(props) => <List.Icon {...props} icon="content-save" />}
            right={() => (
              <Switch
                value={settings.autoSave}
                onValueChange={(value) => updateSetting("autoSave", value)}
              />
            )}
          />
        </SettingCard>

        <SettingCard title="Notifications">
          <List.Item
            title="Enable Notifications"
            description="Receive reminders and alerts"
            left={(props) => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) =>
                  updateSetting("notificationsEnabled", value)
                }
              />
            )}
          />
        </SettingCard>

        <SettingCard title="Data & Sync">
          <List.Item
            title="Cloud Sync"
            description="Sync notes across devices"
            left={(props) => <List.Icon {...props} icon="cloud-sync" />}
            right={() => (
              <Switch
                value={settings.syncEnabled}
                onValueChange={(value) => updateSetting("syncEnabled", value)}
              />
            )}
          />
          <Divider />
          <List.Item
            title="Export Notes"
            description="Export all notes to file"
            left={(props) => <List.Icon {...props} icon="export" />}
            onPress={() => {
              Alert.alert('Export Notes', 'Export functionality coming soon!');
            }}
          />
          <Divider />
          <List.Item
            title="Import Notes"
            description="Import notes from file"
            left={(props) => <List.Icon {...props} icon="import" />}
            onPress={() => {
              Alert.alert('Import Notes', 'Import functionality coming soon!');
            }}
          />
        </SettingCard>

        <SettingCard title="Storage">
          <List.Item
            title="Storage Usage"
            description="View app storage details"
            left={(props) => <List.Icon {...props} icon="harddisk" />}
            onPress={() => {
              Alert.alert('Storage Usage', 'Storage usage information coming soon!');
            }}
          />
          <Divider />
          <List.Item
            title="Clear Cache"
            description="Free up storage space"
            left={(props) => <List.Icon {...props} icon="delete-sweep" />}
            onPress={() => {
              Alert.alert('Clear Cache', 'Clear cache functionality coming soon!');
            }}
          />
        </SettingCard>

        <SettingCard title="About">
          <List.Item
            title="Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
          />
          <Divider />
          <List.Item
            title="Privacy Policy"
            description="View our privacy policy"
            left={(props) => <List.Icon {...props} icon="shield-account" />}
            onPress={() => {
              Alert.alert('Privacy Policy', 'Privacy policy will be available at launch.');
            }}
          />
          <Divider />
          <List.Item
            title="Terms of Service"
            description="View terms of service"
            left={(props) => <List.Icon {...props} icon="file-document" />}
            onPress={() => {
              Alert.alert('Terms of Service', 'Terms of service will be available at launch.');
            }}
          />
          <Divider />
          <List.Item
            title="Contact Support"
            description="Get help and support"
            left={(props) => <List.Icon {...props} icon="help-circle" />}
            onPress={() => {
              Alert.alert('Contact Support', 'Support contact information coming soon!');
            }}
          />
        </SettingCard>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            An app from <Pressable onPress={() => Linking.openURL('https://designmaniabd.com')}>
              <Text style={{ color: 'skyblue', fontWeight: "bold", textDecorationLine: 'none', }}>Design Mania BD</Text>
            </Pressable>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  settingCard: {
    marginVertical: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },

  footer: {
    padding: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
});
