import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View, Switch, Alert } from "react-native";
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
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import RichTextEditor from "../../components/RichTextEditor";
import DateTimePickerComponent from "../../components/DateTimePicker";
import CategorySelector from "../../components/CategorySelector";
import { useDatabaseContext } from "../../contexts/DatabaseContext";
import { Note } from "../../services/database";

interface LocalNote {
  id: number | null;
  title: string;
  content: string;
  tags: string[];
  priority: "low" | "medium" | "high";
  deadline?: Date;
  reminder?: Date;
  reminderEnabled: boolean;
  deadlineEnabled: boolean;
  category?: {
    id: number;
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
  const { notes, categories, createNote, updateNote, deleteNote, createCategory, refreshNotes } = useDatabaseContext();

  const [note, setNote] = useState<LocalNote>({
    id: noteId ? parseInt(noteId as string) : null,
    title: "",
    content: "",
    tags: [],
    priority: "medium",
    reminderEnabled: false,
    deadlineEnabled: false,
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (noteId) {
      loadNote();
    } else {
      // Reset note state for new note creation
      setNote({
        id: null,
        title: "",
        content: "",
        tags: [],
        priority: "medium",
        reminderEnabled: false,
        deadlineEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        isFavorite: false,
      });
    }
  }, [noteId, notes]);

  const loadNote = async () => {
    if (!noteId) return;
    
    setLoading(true);
    try {
      const existingNote = notes.find(n => n.id === parseInt(noteId as string));
      
      if (existingNote) {
        const tags = existingNote.tags ? existingNote.tags.split(',').filter(tag => tag.trim()) : [];
        const category = categories.find(c => c.id === existingNote.category_id);
        
        const loadedNote: LocalNote = {
          id: existingNote.id,
          title: existingNote.title,
          content: existingNote.content,
          tags: tags,
          priority: existingNote.priority,
          deadline: existingNote.deadline ? new Date(existingNote.deadline) : undefined,
          reminder: existingNote.reminder ? new Date(existingNote.reminder) : undefined,
          reminderEnabled: Boolean(existingNote.reminder),
          deadlineEnabled: Boolean(existingNote.deadline),
          category: category ? {
            id: category.id,
            name: category.name,
            color: category.color,
            icon: category.icon
          } : undefined,
          createdAt: new Date(existingNote.created_at),
          updatedAt: new Date(existingNote.updated_at),
          isArchived: false,
          isFavorite: existingNote.is_favorite || false,
        };
        setNote(loadedNote);
      }
    } catch (error) {
      console.error('Error loading note:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    setSaving(true);
    try {
      if (!note.title.trim()) {
        Alert.alert('Error', 'Please enter a title for your note.');
        setSaving(false);
        return;
      }

      const noteData = {
        title: note.title,
        content: note.content,
        category_id: note.category?.id || 1, // Default to first category if none selected
        priority: note.priority,
        deadline: note.deadlineEnabled && note.deadline ? note.deadline.toISOString() : '',
        reminder: note.reminderEnabled && note.reminder ? note.reminder.toISOString() : '',
        tags: note.tags.join(','),
        is_favorite: note.isFavorite,
      };
      
      try {
        if (note.id) {
          // Update existing note
          await updateNote(note.id, noteData);
          Alert.alert('Success', 'Note updated successfully!', [
            { text: 'OK', onPress: () => router.replace('/') }
          ]);
        } else {
          // Create new note
          await createNote(noteData);
          Alert.alert('Success', 'Note created successfully!', [
            { text: 'OK', onPress: () => router.replace('/') }
          ]);
        }
      } catch (innerError) {
        console.error('Database operation failed:', innerError);
        Alert.alert('Error', 'Database operation failed. Please try again.');
        setSaving(false);
        return;
      }
    } catch (error) {
      console.error('Error saving note:', error);
      Alert.alert('Error', 'Failed to save note. Please try again.');
    } finally {
      setSaving(false);
    }
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

  const toggleDeadline = () => {
    setNote((prev) => ({ ...prev, deadlineEnabled: !prev.deadlineEnabled }));
  };

  const handleCategoryChange = (category: any) => {
    setNote((prev) => ({ ...prev, category }));
  };

  const handleDeleteNote = async () => {
    if (!note.id) return;
    
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteNote(note.id!);
              Alert.alert('Success', 'Note deleted successfully!', [
                { text: 'OK', onPress: () => router.replace('/') }
              ]);
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleCreateCategory = async (newCategory: any) => {
    try {
      if (!newCategory.name || !newCategory.color) {
        Alert.alert('Error', 'Category name and color are required.');
        return;
      }

      const categoryId = await createCategory({
        name: newCategory.name,
        color: newCategory.color,
        icon: newCategory.icon || 'folder',
      });
      
      const categoryWithId = {
        id: categoryId,
        name: newCategory.name,
        color: newCategory.color,
        icon: newCategory.icon || 'folder',
      };
      
      setNote((prev) => ({ ...prev, category: categoryWithId }));
    } catch (error) {
      console.error('Error creating category:', error);
      Alert.alert('Error', 'Failed to create category. Please try again.');
    }
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
      <Appbar.Header 
        style={[
          styles.modernHeader,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
          }
        ]}
        statusBarHeight={0}
      >
        <Appbar.BackAction 
          onPress={() => router.back()} 
          iconColor="#FFFFFF"
          style={styles.headerAction}
        />
        <Appbar.Content
          title={
            isEditing
              ? !noteId
                ? "Add Note"
                : "Edit Note"
              : note.title || "Untitled"
          }
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action
          icon={note.isFavorite ? "heart" : "heart-outline"}
          iconColor={note.isFavorite ? "#FF6B6B" : "#FFFFFF"}
          onPress={toggleFavorite}
          style={styles.headerAction}
        />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              iconColor="#FFFFFF"
              onPress={() => setMenuVisible(true)}
              style={styles.headerAction}
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
            onPress={() => {
              setMenuVisible(false);
              handleDeleteNote();
            }}
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

        {/* Deadline Section */}
        {isEditing && (
          <View style={styles.deadlineSection}>
            <View style={styles.deadlineHeader}>
              <Text style={styles.sectionTitle}>Deadline</Text>
              <Switch
                value={note.deadlineEnabled}
                onValueChange={toggleDeadline}
              />
            </View>
            
            {note.deadlineEnabled && (
              <DateTimePickerComponent
                value={note.deadline}
                onChange={handleDeadlineChange}
                label=""
                placeholder="Set a deadline for this note"
              />
            )}
          </View>
        )}

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
              label=""
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
        
        {!isEditing && note.deadlineEnabled && note.deadline && (
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
            loading={saving}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
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
  modernHeader: {
    elevation: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderBottomWidth: 0,
    paddingHorizontal: 4,
  },
  headerAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginHorizontal: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
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
    marginBottom: 12,
  },
  metadataText: {
    fontSize: 12,
    opacity: 0.7,
  },
  tagsSection: {
    marginBottom: 12,
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
    marginBottom: 12,
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
    marginBottom: 6,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  deadlineSection: {
    marginBottom: 6,
  },
  deadlineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
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
    marginBottom: 12,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  contentSection: {
    marginBottom: 12,
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
