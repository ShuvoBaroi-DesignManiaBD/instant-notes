import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
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
  ActivityIndicator,
} from "react-native-paper";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDatabaseContext } from "../../contexts/DatabaseContext";
import { databaseService } from "../../services/database";
import { notificationService } from "../../services/notifications";
import { Reminder } from "../../types";
import { useRouter } from "expo-router";

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
  
  // Schedule notifications for all upcoming reminders
  useEffect(() => {
    if (reminders.length > 0) {
      scheduleNotificationsForReminders();
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
      // Get notes with reminders
      const notesWithReminders = notes.filter(note => note.reminder);
      
      // Convert notes with reminders to Reminder objects
      const remindersList: Reminder[] = notesWithReminders.map(note => ({
        id: note.id.toString(),
        noteId: note.id.toString(),
        title: note.title,
        description: note.content.substring(0, 100), // First 100 chars of content as description
        dueDate: note.reminder ? new Date(note.reminder) : new Date(),
        isCompleted: false, // Default to not completed
        priority: note.priority,
        notificationEnabled: true, // Default to enabled
      }));
      
      setReminders(remindersList);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Schedule notifications for all upcoming reminders
  const scheduleNotificationsForReminders = async () => {
    try {
      // Only schedule for non-completed reminders with future due dates
      const upcomingReminders = reminders.filter(
        r => !r.isCompleted && r.notificationEnabled && r.dueDate > new Date()
      );
      
      console.log(`Scheduling notifications for ${upcomingReminders.length} reminders`);
      
      // Schedule each reminder
      for (const reminder of upcomingReminders) {
        await notificationService.scheduleNotification(reminder);
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  };

  const toggleReminder = async (id: string) => {
    try {
      // Update the reminder completion status in the local state
      const reminder = reminders.find(r => r.id === id);
      if (!reminder) return;
      
      const isCurrentlyCompleted = reminder.isCompleted;
      
      // Update local state first for immediate UI feedback
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, isCompleted: !isCurrentlyCompleted }
            : r
        )
      );
      
      if (!isCurrentlyCompleted) {
        // If marking as completed, update the database
        await databaseService.markReminderCompleted(parseInt(id));
        // Refresh notes to update the UI
        await refreshNotes();
      } else {
        // If marking as not completed, we would need to re-add the reminder
        // This would require additional implementation in the database service
        // For now, we'll just refresh the notes to revert to the actual state
        await refreshNotes();
      }
    } catch (error) {
      console.error('Error toggling reminder:', error);
      // Revert the UI change if there was an error
      loadReminders();
    }
  };

  const toggleNotification = async (id: string) => {
    try {
      // Find the reminder before updating state
      const reminder = reminders.find(r => r.id === id);
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
      
      // Find the note that corresponds to this reminder
      const noteId = parseInt(id);
      const note = notes.find(n => n.id === noteId);
      
      if (note) {
        // Handle notification scheduling/cancellation
        if (newNotificationEnabled) {
          // Schedule notification if enabled
          const updatedReminder = {
            ...reminder,
            notificationEnabled: true
          };
          await notificationService.scheduleNotification(updatedReminder);
          console.log(`Scheduled notification for reminder ${id}`);
        } else {
          // Cancel notification if disabled
          await notificationService.cancelNotification(id);
          console.log(`Cancelled notification for reminder ${id}`);
        }
        
        // In a full implementation, we would update a notification setting in the database
        // For now, we'll just log this action
        console.log(`Toggled notification for reminder ${id} to ${newNotificationEnabled}`);
        
        // Refresh notes to ensure UI is in sync with actual data
        await refreshNotes();
      }
    } catch (error) {
      console.error('Error toggling notification:', error);
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
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // If it's already rgba, extract rgb values and apply new opacity
    if (color.startsWith('rgba')) {
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return `rgba(${match[1]}, ${match[2]}, ${match[3]}, ${opacity})`;
      }
    }
    // If it's rgb, convert to rgba
    if (color.startsWith('rgb')) {
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
      <Card
        key={reminder.id}
        style={[
          styles.reminderCard,
          {
            backgroundColor: theme.colors.surface,
            opacity: reminder.isCompleted ? 0.7 : 1,
          },
        ]}
        onPress={() => {
          // Navigate to the note
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
                  },
                ]}
                numberOfLines={1}
              >
                {reminder.title}
              </Title>
              <Text style={styles.reminderTime}>
                {reminder.dueDate.toLocaleString()}
              </Text>
            </View>
            <Switch
              value={reminder.isCompleted}
              onValueChange={() => toggleReminder(reminder.id)}
            />
          </View>

          {reminder.description && (
            <Paragraph numberOfLines={2} style={styles.reminderDescription}>
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
                  { backgroundColor: getColorWithOpacity(timeStatus.color) },
                ]}
                textStyle={{ color: timeStatus.color }}
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
                        ? theme.colors.tertiaryContainer
                        : theme.colors.surfaceVariant,
                  },
                ]}
              >
                {reminder.priority}
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
                onPress={() => toggleNotification(reminder.id)}
              />
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => {
                  // Show reminder options in a future implementation
                }}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const upcomingReminders = reminders.filter((r) => !r.isCompleted);
  const completedReminders = reminders.filter((r) => r.isCompleted);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.Content title="Reminders" />
        <Appbar.Action
          icon="calendar"
          onPress={() => {
            // Show calendar view
          }}
        />
        <Appbar.Action
          icon="filter"
          onPress={() => {
            // Show filter options
          }}
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
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.emptyStateText}>Loading reminders...</Text>
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
        onPress={() => {
          // Navigate to create a new note with reminder enabled by default
          router.push('/note-editor?reminderEnabled=true');
        }}
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
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  reminderCard: {
    marginVertical: 8,
    elevation: 2,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reminderInfo: {
    flex: 1,
    marginRight: 16,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 14,
    opacity: 0.7,
  },
  reminderDescription: {
    marginBottom: 12,
    lineHeight: 20,
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
  },
  priorityChip: {
    marginRight: 8,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
