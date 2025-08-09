import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Card,
  Chip,
  FAB,
  IconButton,
  Paragraph,
  Switch,
  Text,
  Title,
  useTheme,
} from "react-native-paper";

import { SafeAreaView } from "react-native-safe-area-context";
import { useDatabaseContext } from "../../contexts/DatabaseContext";
import { alarmService } from "../../services/alarmService";
import { databaseService } from "../../services/database";
import { Reminder } from "../../types";

// Using the Reminder interface from types/index.ts

export default function RemindersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { notes, refreshNotes } = useDatabaseContext();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReminders();
  }, [notes]);

  // Schedule alarms for all upcoming reminders
  useEffect(() => {
    if (reminders.length > 0) {
      scheduleAlarmsForReminders();
    }
  }, [reminders]);

  // Refresh reminders when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      refreshNotes();
    }, [])
  );

  const loadReminders = async () => {
    setLoading(true);
    try {
      // First, ensure reminders exist in database for notes with reminder dates
      await syncRemindersWithNotes();

      // Get all reminders from database
      const remindersList = await databaseService.getAllReminders();
      setReminders(remindersList);
    } catch (error) {
      console.error("Error loading reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Sync reminders table with notes that have reminder dates
  const syncRemindersWithNotes = async () => {
    try {
      const notesWithReminders = notes.filter((note as Note) => note?.reminder);

      for (const note of notesWithReminders) {
        // Check if reminder already exists for this note
        const existingReminders = await databaseService.getAllReminders();
        const reminderExists = existingReminders.some(
          (r) => r.noteId === note.id.toString()
        );

        if (!reminderExists && note.reminder) {
          // Ensure reminder is converted to string format
          const reminderTime =
            typeof note.reminder === "string"
              ? note.reminder
              : new Date(note.reminder).toISOString();
          await databaseService.createReminder(note.id, reminderTime);
        }
      }
    } catch (error) {
      console.error("Error syncing reminders:", error);
    }
  };

  // Schedule alarms for all upcoming reminders
  const scheduleAlarmsForReminders = async () => {
    try {
      // Cancel all existing alarms first to prevent duplicates
      for (const reminder of reminders) {
        await alarmService.cancelAlarm(reminder.id);
      }

      // Only schedule for non-completed reminders with future due dates
      const upcomingReminders = reminders.filter(
        (r) => !r.isCompleted && r.notificationEnabled && r.dueDate > new Date()
      );

      console.log(
        `Scheduling alarms for ${upcomingReminders.length} reminders`
      );

      // Schedule each reminder as an alarm with a small delay to prevent conflicts
      for (let i = 0; i < upcomingReminders.length; i++) {
        const reminder = upcomingReminders[i];
        // Add a small delay between scheduling to prevent race conditions
        setTimeout(async () => {
          await alarmService.scheduleAlarm(reminder);
        }, i * 100);
      }
    } catch (error) {
      console.error("Error scheduling alarms:", error);
    }
  };

  const toggleReminder = async (id: string) => {
    try {
      // Update the reminder completion status in the local state
      const reminder = reminders.find((r) => r.id === id);
      if (!reminder) return;

      const isCurrentlyCompleted = reminder.isCompleted;

      // Update local state first for immediate UI feedback
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, isCompleted: !isCurrentlyCompleted } : r
        )
      );

      // Toggle completion status in database
      await databaseService.toggleReminderCompletion(parseInt(id));

      // Refresh notes to update the UI
      await refreshNotes();
    } catch (error) {
      console.error("Error toggling reminder:", error);
      // Revert the UI change if there was an error
      loadReminders();
    }
  };

  const toggleNotification = async (id: string) => {
    try {
      // Find the reminder before updating state
      const reminder = reminders.find((r) => r.id === id);
      if (!reminder) return;

      const newNotificationEnabled = !reminder.notificationEnabled;

      // Update the notification status in the local state for immediate feedback
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, notificationEnabled: newNotificationEnabled }
            : r
        )
      );

      // Update notification setting in database
      await databaseService.toggleReminderNotification(parseInt(id));

      // Handle alarm scheduling/cancellation
      if (
        newNotificationEnabled &&
        !reminder.isCompleted &&
        reminder.dueDate > new Date()
      ) {
        // Schedule alarm if enabled and reminder is not completed and is in the future
        const updatedReminder = {
          ...reminder,
          notificationEnabled: true,
        };
        await alarmService.scheduleAlarm(updatedReminder);
        console.log(`Scheduled alarm for reminder ${id}`);
      } else {
        // Cancel alarm if disabled, completed, or past due
        await alarmService.cancelAlarm(id);
        console.log(`Cancelled alarm for reminder ${id}`);
      }

      console.log(
        `Toggled notification for reminder ${id} to ${newNotificationEnabled}`
      );

      // Refresh reminders to ensure UI is in sync with database
      await loadReminders();
    } catch (error) {
      console.error("Error toggling notification:", error);
      // Revert the UI change if there was an error
      loadReminders();
    }
  };

  const getTimeStatus = (dueDate: Date, isCompleted: boolean) => {
    const now = new Date();
    const timeDiff = dueDate.getTime() - now.getTime();

    if (isCompleted) return { text: "Completed", color: theme.colors.primary };
    if (timeDiff < 0) return { text: "Overdue", color: theme.colors.error };
    if (timeDiff < 3600000)
      return { text: "Due soon", color: theme.colors.tertiary };
    return { text: "Upcoming", color: theme.colors.onSurfaceVariant };
  };

  const getColorWithOpacity = (color: string, opacity: number = 0.2) => {
    // Convert hex color to rgba with opacity
    if (color.startsWith("#")) {
      const hex = color.replace("#", "");
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // If it's already rgba, extract rgb values and apply new opacity
    if (color.startsWith("rgba")) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
      }
    }
    // If it's rgb, convert to rgba
    if (color.startsWith("rgb")) {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
      }
    }
    // For theme colors or other formats, use a safe fallback
    return `rgba(128, 128, 128, ${opacity})`;
  };

  const renderReminderCard = (reminder: Reminder) => {
    const timeStatus = getTimeStatus(reminder.dueDate, reminder.isCompleted);
    const isOverdue = !reminder.isCompleted && new Date() > reminder.dueDate;

    return (
      <View
        key={reminder.id}
      >
        <Card
          style={[
            styles.reminderCard,
            {
              backgroundColor: theme.dark
                ? theme.colors.elevation.level2
                : "#ffffff",
              // borderColor: theme.dark
              //   ? theme.colors.outlineVariant
              //   : theme.colors.outline,
              // borderWidth: 1,
              opacity: reminder.isCompleted ? 0.6 : 1,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: theme.dark ? 0.15 : 0.1,
              shadowRadius: 8,
              elevation: 4,
            },
          ]}
          onPress={() => {
            router.push(`/note-editor?noteId=${reminder.noteId}`);
          }}
        >
          <Card.Content>
            <View style={styles.reminderHeader}>
              <View style={styles.reminderInfo}>
                <Title
                  style={[
                    styles.reminderTitle,
                    reminder.isCompleted && {
                      textDecorationLine: "line-through",
                      color: theme.colors.onSurfaceVariant,
                    },
                  ]}
                  numberOfLines={2}
                >
                  {reminder.title}
                </Title>
                <Text
                  style={[
                    styles.reminderTime,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {reminder.dueDate.toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <Switch
                value={reminder.isCompleted}
                onValueChange={() => toggleReminder(reminder.id)}
                color={theme.colors.primary}
              />
            </View>

            {reminder.description && (
              <Paragraph
                numberOfLines={2}
                style={[
                  styles.reminderDescription,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                {reminder.description}
              </Paragraph>
            )}

            <View style={styles.reminderFooter}>
              <View style={styles.statusContainer}>
                <Chip
                  icon="clock"
                  compact
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: getColorWithOpacity(
                        timeStatus.color,
                        0.15
                      ),
                      borderWidth: 1,
                      borderColor: getColorWithOpacity(timeStatus.color, 0.3),
                    },
                  ]}
                  textStyle={{
                    color: timeStatus.color,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  {timeStatus.text}
                </Chip>
                <Chip
                  compact
                  style={[
                    styles.priorityChip,
                    {
                      backgroundColor:
                        reminder.priority === "high"
                          ? theme.colors.errorContainer
                          : reminder.priority === "medium"
                          ? theme.colors.secondaryContainer
                          : theme.colors.surfaceVariant,
                      borderWidth: 1,
                      borderColor: theme.colors.outlineVariant,
                    },
                  ]}
                  textStyle={{
                    fontSize: 12,
                    fontWeight: "600",
                    color:
                      reminder.priority === "high"
                        ? theme.colors.onErrorContainer
                        : reminder.priority === "medium"
                        ? theme.colors.onSecondaryContainer
                        : theme.colors.onSurfaceVariant,
                  }}
                >
                  {reminder.priority.toUpperCase()}
                </Chip>
              </View>
              <View style={styles.actionsContainer}>
                <IconButton
                  icon={reminder.notificationEnabled ? "bell" : "bell-off"}
                  size={20}
                  iconColor={
                    reminder.notificationEnabled
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant
                  }
                  style={{
                    margin: 0,
                    padding: 4,
                  }}
                  onPress={() => toggleNotification(reminder.id)}
                />
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  iconColor={theme.colors.onSurfaceVariant}
                  style={{
                    margin: 0,
                    padding: 4,
                  }}
                  onPress={() => {
                    // Navigate to the note editor for this reminder
                    router.push(`../note-editor?noteId=${reminder.noteId}`);
                  }}
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const upcomingReminders = reminders.filter((r) => !r.isCompleted);
  const completedReminders = reminders.filter((r) => r.isCompleted);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header
        style={[
          styles.modernHeader,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
          },
        ]}
        statusBarHeight={0}
      >
        <Appbar.Content title="Reminders" titleStyle={styles.headerTitle} />
        <Appbar.Action
          icon="calendar"
          onPress={() => {
            // Show calendar view - for now, show alert
            Alert.alert("Calendar View", "Calendar view is coming soon!");
          }}
          iconColor="#FFFFFF"
          style={styles.headerAction}
        />
        <Appbar.Action
          icon="filter"
          onPress={() => {
            // Filter functionality
          }}
          iconColor="#FFFFFF"
          style={styles.headerAction}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {upcomingReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming & Overdue</Text>
            {upcomingReminders.map(renderReminderCard)}
          </View>
        )}

        {completedReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Completed</Text>
            {completedReminders.map(renderReminderCard)}
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading reminders...</Text>
          </View>
        ) : reminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="alarm-outline"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={styles.emptyStateText}>No reminders yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Add reminders to your notes to see them here
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        color="#fff"
        onPress={() => router.push("note-editor")}
      />
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
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  reminderCard: {
    marginVertical: 12,
    borderRadius: 12,
    elevation: 4,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  reminderInfo: {
    flex: 1,
    marginRight: 12,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.8,
  },
  reminderDescription: {
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  reminderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusChip: {
    marginRight: 8,
    borderRadius: 6,
  },
  priorityChip: {
    marginRight: 8,
    borderRadius: 6,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 22,
  },
  fab: {
    position: "absolute",
    margin: 20,
    right: 0,
    bottom: 0,
  },
  modernHeader: {
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerAction: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
