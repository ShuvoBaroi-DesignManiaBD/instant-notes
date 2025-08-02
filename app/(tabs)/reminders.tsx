import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
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
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface Reminder {
  id: string;
  noteId: string;
  title: string;
  description?: string;
  dueDate: Date;
  isCompleted: boolean;
  priority: "low" | "medium" | "high";
  notificationEnabled: boolean;
}

export default function RemindersScreen() {
  const theme = useTheme();
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      noteId: "2",
      title: "Meeting Notes Review",
      description: "Review and finalize meeting notes",
      dueDate: new Date(Date.now() + 3600000), // 1 hour from now
      isCompleted: false,
      priority: "high",
      notificationEnabled: true,
    },
    {
      id: "2",
      noteId: "1",
      title: "Welcome Note Follow-up",
      description: "Complete the tutorial tasks",
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      isCompleted: false,
      priority: "medium",
      notificationEnabled: true,
    },
    {
      id: "3",
      noteId: "3",
      title: "Project Planning",
      description: "Create project timeline",
      dueDate: new Date(Date.now() - 3600000), // 1 hour ago (overdue)
      isCompleted: true,
      priority: "low",
      notificationEnabled: false,
    },
  ]);

  const toggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id
          ? { ...reminder, isCompleted: !reminder.isCompleted }
          : reminder
      )
    );
  };

  const toggleNotification = (id: string) => {
    setReminders((prev) =>
      prev.map((reminder) =>
        reminder.id === id
          ? { ...reminder, notificationEnabled: !reminder.notificationEnabled }
          : reminder
      )
    );
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
          // Navigate to note
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
                  { backgroundColor: `${timeStatus.color}20` },
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
                  // Show reminder options
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

        {reminders.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="alarm-outline"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={styles.emptyStateText}>No reminders yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Set deadlines for your notes to see them here
            </Text>
          </View>
        )}
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => {
          // Create new reminder
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
