import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View, Switch } from "react-native";
import {
  Appbar,
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  Text,
  useTheme,
  Surface,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import RichTextEditor from "../../components/RichTextEditor";
import DateTimePickerComponent from "../../components/DateTimePicker";
import CategorySelector from "../../components/CategorySelector";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  priority: "low" | "medium" | "high";
  deadline?: Date;
  reminder?: Date;
  reminderEnabled: boolean;
  category?: {
    id: string;
    name: string;
    color: string;
    icon?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  isFavorite: boolean;
}

export default function NoteEditorScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { noteId } = useLocalSearchParams();

  const [note, setNote] = useState<Note>({
    id: (noteId as string) || "new",
    title: "",
    content: "",
    tags: [],
    priority: "medium",
    reminderEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    isArchived: false,
    isFavorite: false,
  });

  const [isEditing, setIsEditing] = useState(!noteId);
  const [menuVisible, setMenuVisible] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
  const [categories, setCategories] = useState([
    { id: '1', name: 'Personal', color: '#FF6B6B', icon: 'account' },
    { id: '2', name: 'Work', color: '#4ECDC4', icon: 'briefcase' },
    { id: '3', name: 'Study', color: '#45B7D1', icon: 'school' },
  ]);

  useEffect(() => {
    if (noteId && noteId !== "new") {
      // Load existing note - in real app, this would fetch from storage
      const mockNote: Note = {
        id: noteId as string,
        title: "Welcome to Instant Notes",
        content:
          "This is your first note. You can edit, organize, and set reminders for your notes.\n\nFeatures:\n• Rich text editing\n• Categories and tags\n• Reminders and deadlines\n• Search functionality\n• Dark/light themes",
        tags: ["welcome", "tutorial"],
        priority: "medium",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reminderEnabled: true,
        reminder: new Date(Date.now() + 24 * 60 * 60 * 1000),
        category: { id: '1', name: 'Personal', color: '#FF6B6B', icon: 'account' },
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(),
        isArchived: false,
        isFavorite: true,
      };
      setNote(mockNote);
    }
  }, [noteId]);

  const saveNote = () => {
    // In real app, save to storage
    setNote((prev) => ({ ...prev, updatedAt: new Date() }));
    setIsEditing(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !note.tags.includes(tagInput.trim())) {
      setNote((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
      setShowTagInput(false);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNote((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const toggleFavorite = () => {
    setNote((prev) => ({ ...prev, isFavorite: !prev.isFavorite }));
  };

  const setPriority = (priority: "low" | "medium" | "high") => {
    setNote((prev) => ({ ...prev, priority }));
    setPriorityMenuVisible(false);
  };

  const handleDeadlineChange = (deadline: Date | undefined) => {
    setNote((prev) => ({ ...prev, deadline }));
  };

  const handleReminderChange = (reminder: Date | undefined) => {
    setNote((prev) => ({ ...prev, reminder }));
  };

  const toggleReminder = () => {
    setNote((prev) => ({ ...prev, reminderEnabled: !prev.reminderEnabled }));
  };

  const handleCategoryChange = (category: any) => {
    setNote((prev) => ({ ...prev, category }));
  };

  const handleCreateCategory = (newCategory: any) => {
    const categoryWithId = {
      ...newCategory,
      id: Date.now().toString(),
    };
    setCategories((prev) => [...prev, categoryWithId]);
    setNote((prev) => ({ ...prev, category: categoryWithId }));
  };

  const getCategoryBackgroundColor = (color: string) => {
    // Convert hex color to rgba with opacity
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    // If already rgba, return as is
    return color;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content
          title={
            isEditing
              ? noteId === "new"
                ? "New Note"
                : "Edit Note"
              : note.title || "Untitled"
          }
        />
        <Appbar.Action
          icon={note.isFavorite ? "heart" : "heart-outline"}
          iconColor={note.isFavorite ? theme.colors.error : undefined}
          onPress={toggleFavorite}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            leadingIcon="share"
            onPress={() => setMenuVisible(false)}
            title="Share Note"
          />
          <Divider />
          <Menu.Item
            leadingIcon="archive"
            onPress={() => setMenuVisible(false)}
            title="Archive"
          />
          <Menu.Item
            leadingIcon="delete"
            onPress={() => setMenuVisible(false)}
            title="Delete"
          />
        </Menu>
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Title Input */}
        <TextInput
          style={[
            styles.titleInput,
            {
              color: theme.colors.onSurface,
              borderBottomColor: theme.colors.outline,
            },
          ]}
          placeholder="Note title..."
          placeholderTextColor={theme.colors.onSurfaceVariant}
          value={note.title}
          onChangeText={(text) => setNote((prev) => ({ ...prev, title: text }))}
          editable={isEditing}
          multiline
        />

        {/* Metadata */}
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            Created: {note.createdAt.toLocaleDateString()}
          </Text>
          <Text style={styles.metadataText}>
            Updated: {note.updatedAt.toLocaleDateString()}
          </Text>
        </View>

        {/* Deadline Picker */}
        {isEditing && (
          <DateTimePickerComponent
            value={note.deadline}
            onChange={handleDeadlineChange}
            label="Deadline"
            placeholder="Set a deadline for this note"
          />
        )}

        {!isEditing && note.deadline && (
          <Surface style={[styles.infoCard, { backgroundColor: theme.colors.errorContainer }]}>
            <View style={styles.infoRow}>
              <IconButton icon="calendar-clock" size={20} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Deadline</Text>
                <Text style={styles.infoValue}>
                  {note.deadline.toLocaleDateString()} at {note.deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          </Surface>
        )}

        {/* Category Selector - Moved to top after deadline */}
        {isEditing && (
          <CategorySelector
            selectedCategory={note.category}
            onCategoryChange={handleCategoryChange}
            categories={categories}
            onCreateCategory={handleCreateCategory}
            label="Category"
            placeholder="Select or create a category"
          />
        )}

        {!isEditing && note.category && (
          <View style={styles.categorySection}>
            <Text style={styles.sectionTitle}>Category</Text>
            <Chip
              style={[
                styles.categoryChip,
                { backgroundColor: getCategoryBackgroundColor(note.category.color) },
              ]}
              icon={note.category.icon}
              textStyle={{ color: note.category.color }}
            >
              {note.category.name}
            </Chip>
          </View>
        )}

        {/* Tags */}
        <View style={styles.tagsSection}>
          <View style={styles.tagsHeader}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <IconButton
              icon="plus"
              size={20}
              onPress={() => setShowTagInput(true)}
            />
          </View>
          <View style={styles.tagsContainer}>
            {note.tags.map((tag) => (
              <Chip
                key={tag}
                style={styles.tag}
                onClose={isEditing ? () => removeTag(tag) : undefined}
                closeIcon={isEditing ? "close" : undefined}
              >
                {tag}
              </Chip>
            ))}
            {showTagInput && (
              <View style={styles.tagInputContainer}>
                <TextInput
                  style={[
                    styles.tagInput,
                    {
                      color: theme.colors.onSurface,
                      borderColor: theme.colors.outline,
                    },
                  ]}
                  placeholder="Add tag..."
                  placeholderTextColor={theme.colors.onSurfaceVariant}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  autoFocus
                />
                <IconButton icon="check" size={20} onPress={addTag} />
                <IconButton
                  icon="close"
                  size={20}
                  onPress={() => {
                    setShowTagInput(false);
                    setTagInput("");
                  }}
                />
              </View>
            )}
          </View>
        </View>

        {/* Priority Dropdown */}
        <View style={styles.prioritySection}>
          <Text style={styles.sectionTitle}>Priority</Text>
          {isEditing ? (
            <Menu
              visible={priorityMenuVisible}
              onDismiss={() => setPriorityMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setPriorityMenuVisible(true)}
                  icon={
                    note.priority === "high"
                      ? "flag"
                      : note.priority === "medium"
                      ? "flag-outline"
                      : "flag-variant"
                  }
                  style={[
                    styles.priorityButton,
                    {
                      borderColor:
                        note.priority === "high"
                          ? theme.colors.error
                          : note.priority === "medium"
                          ? theme.colors.primary
                          : theme.colors.outline,
                    },
                  ]}
                >
                  {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
                </Button>
              }
            >
              <Menu.Item
                leadingIcon="flag"
                onPress={() => setPriority("high")}
                title="High Priority"
                titleStyle={{ color: theme.colors.error }}
              />
              <Menu.Item
                leadingIcon="flag-outline"
                onPress={() => setPriority("medium")}
                title="Medium Priority"
                titleStyle={{ color: theme.colors.primary }}
              />
              <Menu.Item
                leadingIcon="flag-variant"
                onPress={() => setPriority("low")}
                title="Low Priority"
              />
            </Menu>
          ) : (
            <Chip
              style={[
                styles.priorityChip,
                {
                  backgroundColor:
                    note.priority === "high"
                      ? theme.colors.errorContainer
                      : note.priority === "medium"
                      ? theme.colors.tertiaryContainer
                      : theme.colors.surfaceVariant,
                },
              ]}
              icon={
                note.priority === "high"
                  ? "flag"
                  : note.priority === "medium"
                  ? "flag-outline"
                  : "flag-variant"
              }
            >
              {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
            </Chip>
          )}
        </View>

        {/* Reminder Section */}
        <View style={styles.reminderSection}>
          <View style={styles.reminderHeader}>
            <Text style={styles.sectionTitle}>Reminder</Text>
            {isEditing && (
              <Switch
                value={note.reminderEnabled}
                onValueChange={toggleReminder}
              />
            )}
          </View>
          
          {isEditing && note.reminderEnabled && (
            <DateTimePickerComponent
              value={note.reminder}
              onChange={handleReminderChange}
              label="Reminder Time"
              placeholder="Set a reminder time"
            />
          )}
          
          {!isEditing && note.reminderEnabled && note.reminder && (
            <Surface style={[styles.infoCard, { backgroundColor: theme.colors.primaryContainer }]}>
              <View style={styles.infoRow}>
                <IconButton icon="bell" size={20} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Reminder</Text>
                  <Text style={styles.infoValue}>
                    {note.reminder.toLocaleDateString()} at {note.reminder.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            </Surface>
          )}
        </View>

        {/* Rich Text Content */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Content</Text>
          <RichTextEditor
            value={note.content}
            onChangeText={(text) =>
              setNote((prev) => ({ ...prev, content: text }))
            }
            placeholder="Start writing your note..."
            editable={isEditing}
          />
        </View>


      </ScrollView>

      {/* Action Buttons */}
      {isEditing && (
        <View
          style={[styles.actionBar, { backgroundColor: theme.colors.surface }]}
        >
          <Button
            mode="outlined"
            onPress={() => {
              setIsEditing(false);
              // Reset changes if needed
            }}
            style={styles.actionButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={saveNote}
            style={styles.actionButton}
          >
            Save
          </Button>
        </View>
      )}

      {!isEditing && (
        <View
          style={[styles.actionBar, { backgroundColor: theme.colors.surface }]}
        >
          <Button
            mode="contained"
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
            icon="pencil"
          >
            Edit Note
          </Button>
        </View>
      )}
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
  titleInput: {
    fontSize: 24,
    fontWeight: "600",
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metadataText: {
    fontSize: 12,
    opacity: 0.7,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  tagInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    minWidth: 100,
  },
  prioritySection: {
    marginBottom: 24,
  },
  priorityButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  priorityChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  reminderSection: {
    marginBottom: 24,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCard: {
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    marginLeft: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.8,
  },
  infoValue: {
    fontSize: 14,
    marginTop: 2,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  contentSection: {
    marginBottom: 24,
  },
  contentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    minHeight: 200,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  editButton: {
    flex: 1,
  },
});
