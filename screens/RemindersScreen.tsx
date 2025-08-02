import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Card,
  Chip,
  Divider,
  IconButton,
  Menu,
  Paragraph,
  Text,
  Title,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Reminder } from "../types";

const RemindersScreen: React.FC = () => {
  const theme = useTheme();
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      noteId: "1",
      title: "Review meeting notes",
      description: "Go through the action items from today's meeting",
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      isCompleted: false,
      priority: "high",
      notificationEnabled: true,
    },
    {
      id: "2",
      noteId: "2",
      title: "Submit project proposal",
      description: "Final review and submission deadline",
      dueDate: new Date(Date.now() + 172800000), // Day after tomorrow
      isCompleted: false,
      priority: "high",
      notificationEnabled: true,
    },
    {
      id: "3",
      noteId: "3",
      title: "Call dentist",
      description: "Schedule annual checkup appointment",
      dueDate: new Date(Date.now() + 604800000), // Next week
      isCompleted: true,
      priority: "medium",
      notificationEnabled: false,
    },
  ]);

  const filteredReminders = reminders.filter((reminder) => {
    switch (filter) {
      case "pending":
        return !reminder.isCompleted;
      case "completed":
        return reminder.isCompleted;
      default:
        return true;
    }
  });

  const toggleReminderCompletion = (reminderId: string) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === reminderId
          ? { ...reminder, isCompleted: !reminder.isCompleted }
          : reminder
      )
    );
  };

  const toggleNotification = (reminderId: string) => {
    setReminders(
      reminders.map((reminder) =>
        reminder.id === reminderId
          ? { ...reminder, notificationEnabled: !reminder.notificationEnabled }
          : reminder
      )
    );
  };

  const deleteReminder = (reminderId: string) => {
    Alert.alert(
      "Delete Reminder",
      "Are you sure you want to delete this reminder?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setReminders(
              reminders.filter((reminder) => reminder.id !== reminderId)
            );
            setMenuVisible(null);
          },
        },
      ]
    );
  };

  const isOverdue = (dueDate: Date) => {
    return new Date() > dueDate;
  };

  const formatDueDate = (dueDate: Date) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Tomorrow";
    } else if (diffDays === -1) {
      return "Yesterday";
    } else if (diffDays < 0) {
      return `${Math.abs(diffDays)} days ago`;
    } else if (diffDays <= 7) {
      return `In ${diffDays} days`;
    } else {
      return dueDate.toLocaleDateString();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return theme.colors.error;
      case "medium":
        return theme.colors.tertiary;
      case "low":
        return theme.colors.surfaceVariant;
      default:
        return theme.colors.surfaceVariant;
    }
  };

  const renderReminderCard = (reminder: Reminder) => {
    const overdue = isOverdue(reminder.dueDate) && !reminder.isCompleted;

    return (
      <Card
        key={reminder.id}
        style={[
          styles.reminderCard,
          {
            backgroundColor: reminder.isCompleted
              ? theme.colors.surfaceVariant
              : theme.colors.surface,
            opacity: reminder.isCompleted ? 0.7 : 1,
          },
        ]}
        onPress={() => {
          // Navigate to the associated note
          console.log("Navigate to note:", reminder.noteId);
        }}
      >
        <Card.Content>
          <View style={styles.reminderHeader}>
            <View style={styles.reminderInfo}>
              <IconButton
                icon={reminder.isCompleted ? "check-circle" : "circle-outline"}
                size={24}
                iconColor={
                  reminder.isCompleted
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant
                }
                onPress={() => toggleReminderCompletion(reminder.id)}
                style={styles.checkButton}
              />
              <View style={styles.reminderText}>
                <Title
                  style={[
                    styles.reminderTitle,
                    reminder.isCompleted && styles.completedText,
                  ]}
                  numberOfLines={1}
                >
                  {reminder.title}
                </Title>
                {reminder.description && (
                  <Paragraph
                    style={[
                      styles.reminderDescription,
                      reminder.isCompleted && styles.completedText,
                    ]}
                    numberOfLines={2}
                  >
                    {reminder.description}
                  </Paragraph>
                )}
              </View>
            </View>

            <Menu
              visible={menuVisible === reminder.id}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(reminder.id)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  // Edit reminder
                  setMenuVisible(null);
                }}
                title="Edit"
                leadingIcon="pencil"
              />
              <Menu.Item
                onPress={() => toggleNotification(reminder.id)}
                title={
                  reminder.notificationEnabled
                    ? "Disable Notifications"
                    : "Enable Notifications"
                }
                leadingIcon={reminder.notificationEnabled ? "bell-off" : "bell"}
              />
              <Divider />
              <Menu.Item
                onPress={() => deleteReminder(reminder.id)}
                title="Delete"
                leadingIcon="delete"
              />
            </Menu>
          </View>

          <View style={styles.reminderFooter}>
            <View style={styles.reminderMeta}>
              <Chip
                icon="calendar"
                compact
                style={[
                  styles.dueDateChip,
                  overdue && { backgroundColor: theme.colors.errorContainer },
                ]}
                textStyle={
                  overdue ? { color: theme.colors.onErrorContainer } : {}
                }
              >
                {formatDueDate(reminder.dueDate)}
              </Chip>

              <Chip
                icon="flag"
                compact
                style={[
                  styles.priorityChip,
                  {
                    backgroundColor: getPriorityColor(reminder.priority) + "33",
                  },
                ]}
                textStyle={{ color: getPriorityColor(reminder.priority) }}
              >
                {reminder.priority}
              </Chip>
            </View>

            <View style={styles.notificationIndicator}>
              {reminder.notificationEnabled && (
                <Ionicons
                  name="notifications"
                  size={16}
                  color={theme.colors.primary}
                />
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const pendingCount = reminders.filter((r) => !r.isCompleted).length;
  const overdueCount = reminders.filter(
    (r) => !r.isCompleted && isOverdue(r.dueDate)
  ).length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.Content title="Reminders" />
        <Appbar.Action
          icon="plus"
          onPress={() => {
            // Create new reminder
            Alert.alert(
              "Coming Soon",
              "Create reminder functionality will be implemented"
            );
          }}
        />
      </Appbar.Header>

      <View style={styles.statsContainer}>
        <Card
          style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: theme.colors.error }]}>
                {overdueCount}
              </Text>
              <Text style={styles.statLabel}>Overdue</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.filterContainer}>
        <Chip
          selected={filter === "all"}
          onPress={() => setFilter("all")}
          style={styles.filterChip}
        >
          All ({reminders.length})
        </Chip>
        <Chip
          selected={filter === "pending"}
          onPress={() => setFilter("pending")}
          style={styles.filterChip}
        >
          Pending ({pendingCount})
        </Chip>
        <Chip
          selected={filter === "completed"}
          onPress={() => setFilter("completed")}
          style={styles.filterChip}
        >
          Completed ({reminders.length - pendingCount})
        </Chip>
      </View>

      <ScrollView style={styles.content}>
        {filteredReminders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="alarm-outline"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={styles.emptyStateText}>
              {filter === "all" ? "No reminders yet" : `No ${filter} reminders`}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {filter === "all"
                ? "Create reminders to stay on top of your tasks"
                : `Switch to "All" to see other reminders`}
            </Text>
          </View>
        ) : (
          filteredReminders.map(renderReminderCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statsCard: {
    elevation: 2,
  },
  statsContent: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 8,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  reminderCard: {
    marginVertical: 8,
    elevation: 2,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  reminderInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
  },
  checkButton: {
    margin: 0,
    marginRight: 8,
  },
  reminderText: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  reminderDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  reminderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  reminderMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  dueDateChip: {
    marginRight: 8,
    height: 24,
  },
  priorityChip: {
    height: 24,
  },
  notificationIndicator: {
    marginLeft: 8,
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
  },
});

export default RemindersScreen;
