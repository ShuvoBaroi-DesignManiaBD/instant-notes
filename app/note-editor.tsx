import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import {
  Appbar,
  Button,
  Chip,
  Divider,
  IconButton,
  Menu,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  priority: "low" | "medium" | "high";
  deadline?: Date;
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
    createdAt: new Date(),
    updatedAt: new Date(),
    isArchived: false,
    isFavorite: false,
  });

  const [isEditing, setIsEditing] = useState(!noteId);
  const [menuVisible, setMenuVisible] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);

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
    setMenuVisible(false);
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
            leadingIcon="flag"
            onPress={() => setPriority("high")}
            title="High Priority"
          />
          <Menu.Item
            leadingIcon="flag-outline"
            onPress={() => setPriority("medium")}
            title="Medium Priority"
          />
          <Menu.Item
            leadingIcon="flag-variant"
            onPress={() => setPriority("low")}
            title="Low Priority"
          />
          <Divider />
          <Menu.Item
            leadingIcon="calendar"
            onPress={() => setMenuVisible(false)}
            title="Set Deadline"
          />
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

        {/* Priority */}
        <View style={styles.prioritySection}>
          <Text style={styles.sectionTitle}>Priority</Text>
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
          >
            {note.priority}
          </Chip>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Content</Text>
          <TextInput
            style={[
              styles.contentInput,
              {
                color: theme.colors.onSurface,
                borderColor: theme.colors.outline,
              },
            ]}
            placeholder="Start writing your note..."
            placeholderTextColor={theme.colors.onSurfaceVariant}
            value={note.content}
            onChangeText={(text) =>
              setNote((prev) => ({ ...prev, content: text }))
            }
            editable={isEditing}
            multiline
            textAlignVertical="top"
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  priorityChip: {},
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
