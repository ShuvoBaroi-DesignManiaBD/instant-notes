import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Appbar,
  List,
  Switch,
  useTheme,
  Divider,
  Button,
  Dialog,
  Portal,
  RadioButton,
  Text,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppSettings } from '../types';

const SettingsScreen: React.FC = () => {
  const theme = useTheme();
  const [themeDialogVisible, setThemeDialogVisible] = useState(false);
  const [viewDialogVisible, setViewDialogVisible] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'system',
    autoSave: true,
    notificationsEnabled: true,
    syncEnabled: false,
    defaultView: 'list',
  });

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Choose export format:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'JSON', onPress: () => exportAsJSON() },
        { text: 'PDF', onPress: () => exportAsPDF() },
        { text: 'Text', onPress: () => exportAsText() },
      ]
    );
  };

  const exportAsJSON = () => {
    // Implement JSON export
    Alert.alert('Success', 'Notes exported as JSON file');
  };

  const exportAsPDF = () => {
    // Implement PDF export
    Alert.alert('Success', 'Notes exported as PDF file');
  };

  const exportAsText = () => {
    // Implement text export
    Alert.alert('Success', 'Notes exported as text file');
  };

  const handleImportData = () => {
    Alert.alert(
      'Import Data',
      'Select a file to import notes from other apps.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Choose File', onPress: () => importData() },
      ]
    );
  };

  const importData = () => {
    // Implement file picker and import logic
    Alert.alert('Coming Soon', 'Import functionality will be implemented');
  };

  const handleBackup = () => {
    Alert.alert(
      'Backup Data',
      'Create a backup of all your notes and settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create Backup', onPress: () => createBackup() },
      ]
    );
  };

  const createBackup = () => {
    // Implement backup logic
    Alert.alert('Success', 'Backup created successfully');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your notes, categories, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearAllData(),
        },
      ]
    );
  };

  const clearAllData = () => {
    // Implement data clearing logic
    Alert.alert('Success', 'All data has been cleared');
  };

  const getThemeDisplayName = (themeValue: string) => {
    switch (themeValue) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System Default';
      default:
        return 'System Default';
    }
  };

  const getViewDisplayName = (viewValue: string) => {
    switch (viewValue) {
      case 'list':
        return 'List View';
      case 'grid':
        return 'Grid View';
      default:
        return 'List View';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Appearance Section */}
        <List.Section>
          <List.Subheader>Appearance</List.Subheader>
          
          <List.Item
            title="Theme"
            description={getThemeDisplayName(settings.theme)}
            left={props => <List.Icon {...props} icon="palette" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => setThemeDialogVisible(true)}
          />
          
          <List.Item
            title="Default View"
            description={getViewDisplayName(settings.defaultView)}
            left={props => <List.Icon {...props} icon="view-list" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => setViewDialogVisible(true)}
          />
        </List.Section>

        <Divider />

        {/* Behavior Section */}
        <List.Section>
          <List.Subheader>Behavior</List.Subheader>
          
          <List.Item
            title="Auto-save"
            description="Automatically save notes while typing"
            left={props => <List.Icon {...props} icon="content-save" />}
            right={() => (
              <Switch
                value={settings.autoSave}
                onValueChange={(value) => updateSetting('autoSave', value)}
              />
            )}
          />
          
          <List.Item
            title="Notifications"
            description="Enable reminder notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={(value) => updateSetting('notificationsEnabled', value)}
              />
            )}
          />
        </List.Section>

        <Divider />

        {/* Sync & Backup Section */}
        <List.Section>
          <List.Subheader>Sync & Backup</List.Subheader>
          
          <List.Item
            title="Cloud Sync"
            description="Sync notes across devices"
            left={props => <List.Icon {...props} icon="cloud-sync" />}
            right={() => (
              <Switch
                value={settings.syncEnabled}
                onValueChange={(value) => updateSetting('syncEnabled', value)}
              />
            )}
          />
          
          <List.Item
            title="Create Backup"
            description="Backup all notes and settings"
            left={props => <List.Icon {...props} icon="backup-restore" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={handleBackup}
          />
        </List.Section>

        <Divider />

        {/* Data Management Section */}
        <List.Section>
          <List.Subheader>Data Management</List.Subheader>
          
          <List.Item
            title="Export Data"
            description="Export notes to file"
            left={props => <List.Icon {...props} icon="export" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={handleExportData}
          />
          
          <List.Item
            title="Import Data"
            description="Import notes from other apps"
            left={props => <List.Icon {...props} icon="import" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={handleImportData}
          />
        </List.Section>

        <Divider />

        {/* About Section */}
        <List.Section>
          <List.Subheader>About</List.Subheader>
          
          <List.Item
            title="App Version"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
          
          <List.Item
            title="Privacy Policy"
            description="View our privacy policy"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => Alert.alert('Coming Soon', 'Privacy policy will be available')}
          />
          
          <List.Item
            title="Terms of Service"
            description="View terms of service"
            left={props => <List.Icon {...props} icon="file-document" />}
            right={() => <List.Icon icon="chevron-right" />}
            onPress={() => Alert.alert('Coming Soon', 'Terms of service will be available')}
          />
        </List.Section>

        <Divider />

        {/* Danger Zone */}
        <List.Section>
          <List.Subheader style={{ color: theme.colors.error }}>Danger Zone</List.Subheader>
          
          <List.Item
            title="Clear All Data"
            description="Permanently delete all notes and settings"
            left={props => <List.Icon {...props} icon="delete-forever" color={theme.colors.error} />}
            right={() => <List.Icon icon="chevron-right" color={theme.colors.error} />}
            onPress={handleClearData}
            titleStyle={{ color: theme.colors.error }}
          />
        </List.Section>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Theme Selection Dialog */}
      <Portal>
        <Dialog visible={themeDialogVisible} onDismiss={() => setThemeDialogVisible(false)}>
          <Dialog.Title>Choose Theme</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => updateSetting('theme', value as 'light' | 'dark' | 'system')}
              value={settings.theme}
            >
              <RadioButton.Item label="Light" value="light" />
              <RadioButton.Item label="Dark" value="dark" />
              <RadioButton.Item label="System Default" value="system" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setThemeDialogVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* View Selection Dialog */}
      <Portal>
        <Dialog visible={viewDialogVisible} onDismiss={() => setViewDialogVisible(false)}>
          <Dialog.Title>Default View</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => updateSetting('defaultView', value as 'list' | 'grid')}
              value={settings.defaultView}
            >
              <RadioButton.Item label="List View" value="list" />
              <RadioButton.Item label="Grid View" value="grid" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setViewDialogVisible(false)}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  bottomSpacing: {
    height: 32,
  },
});

export default SettingsScreen;