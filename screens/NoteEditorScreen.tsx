import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Chip,
  Divider,
  Menu,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Note } from "../types";

interface RouteParams {
  noteId?: string;
}

const NoteEditorScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { noteId } = (route.params as RouteParams) || {};

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [deadline, setDeadline] = useState<Date | undefined>();
  const [isFavorite, setIsFavorite] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Auto-save timer
  useEffect(() => {
    if (hasChanges) {
      const timer = setTimeout(() => {
        handleAutoSave();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(timer);
    }
  }, [title, content, tags, priority, deadline, isFavorite, hasChanges]);

  // Load existing note if editing
  useEffect(() => {
    if (noteId) {
      // Mock loading existing note - replace with actual data loading
      const mockNote: Note = {
        id: noteId,
        title: "Sample Note",
        content: "This is sample content for editing...",
        tags: ["sample", "edit"],
        priority: "medium",
        createdAt: new Date(),
        updatedAt: new Date(),
        isArchived: false,
        isFavorite: false,
      };

      setTitle(mockNote.title);
      setContent(mockNote.content);
      setTags(mockNote.tags);
      setPriority(mockNote.priority);
      setDeadline(mockNote.deadline);
      setIsFavorite(mockNote.isFavorite);
    }
  }, [noteId]);

  const handleAutoSave = () => {
    // Implement auto-save logic here
    console.log("Auto-saving note...");
    setHasChanges(false);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title for your note.");
      return;
    }

    const noteData: Partial<Note> = {
      title: title.trim(),
      content: content.trim(),
      tags,
      priority,
      deadline,
      isFavorite,
      updatedAt: new Date(),
    };

    if (!noteId) {
      noteData.id = Date.now().toString();
      noteData.createdAt = new Date();
      noteData.isArchived = false;
    }

    // Save note logic here
    console.log("Saving note:", noteData);

    Alert.alert("Success", "Note saved successfully!", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      setHasChanges(true);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
    setHasChanges(true);
  };

  const handleDelete = () => {
    Alert.alert("Delete Note", "Are you sure you want to delete this note?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          // Delete note logic here
          console.log("Deleting note:", noteId);
          navigation.goBack();
        },
      },
    ]);
  };

  const getPriorityColor = (priorityLevel: string) => {
    switch (priorityLevel) {
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={noteId ? "Edit Note" : "New Note"} />
        <Appbar.Action
          icon={isFavorite ? "heart" : "heart-outline"}
          onPress={() => {
            setIsFavorite(!isFavorite);
            setHasChanges(true);
          }}
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
          <Menu.Item onPress={() => {}} title="Export" leadingIcon="export" />
          <Menu.Item onPress={() => {}} title="Share" leadingIcon="share" />
          <Divider />
          {noteId && (
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                handleDelete();
              }}
              title="Delete"
              leadingIcon="delete"
            />
          )}
        </Menu>
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <TextInput
          label="Title"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            setHasChanges(true);
          }}
          style={styles.titleInput}
          mode="outlined"
        />

        <TextInput
          label="Content"
          value={content}
          onChangeText={(text) => {
            setContent(text);
            setHasChanges(true);
          }}
          multiline
          numberOfLines={10}
          style={styles.contentInput}
          mode="outlined"
        />

        <View style={styles.metaSection}>
          <View style={styles.prioritySection}>
            <Menu
              visible={priorityMenuVisible}
              onDismiss={() => setPriorityMenuVisible(false)}
              anchor={
                <Button
                  mode="outlined"
                  onPress={() => setPriorityMenuVisible(true)}
                  icon="flag"
                  style={[
                    styles.priorityButton,
                    { borderColor: getPriorityColor(priority) },
                  ]}
                >
                  Priority: {priority}
                </Button>
              }
            >
              <Menu.Item
                onPress={() => {
                  setPriority("high");
                  setPriorityMenuVisible(false);
                  setHasChanges(true);
                }}
                title="High"
                leadingIcon="flag"
              />
              <Menu.Item
                onPress={() => {
                  setPriority("medium");
                  setPriorityMenuVisible(false);
                  setHasChanges(true);
                }}
                title="Medium"
                leadingIcon="flag"
              />
              <Menu.Item
                onPress={() => {
                  setPriority("low");
                  setPriorityMenuVisible(false);
                  setHasChanges(true);
                }}
                title="Low"
                leadingIcon="flag"
              />
            </Menu>
          </View>

          <Button
            mode="outlined"
            onPress={() => {
              // Open date picker - implement later
              Alert.alert("Coming Soon", "Date picker will be implemented");
            }}
            icon="calendar"
            style={styles.deadlineButton}
          >
            {deadline ? deadline.toLocaleDateString() : "Set Deadline"}
          </Button>
        </View>

        <View style={styles.tagsSection}>
          <View style={styles.tagInputContainer}>
            <TextInput
              label="Add Tag"
              value={newTag}
              onChangeText={setNewTag}
              style={styles.tagInput}
              mode="outlined"
              right={<TextInput.Icon icon="plus" onPress={handleAddTag} />}
              onSubmitEditing={handleAddTag}
            />
          </View>

          <View style={styles.tagsContainer}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                onClose={() => handleRemoveTag(tag)}
                style={styles.tag}
              >
                {tag}
              </Chip>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomActions}>
        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          icon="content-save"
        >
          Save Note
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  titleInput: {
    marginVertical: 8,
  },
  contentInput: {
    marginVertical: 8,
    minHeight: 200,
  },
  metaSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  prioritySection: {
    flex: 1,
    marginRight: 8,
  },
  priorityButton: {
    flex: 1,
  },
  deadlineButton: {
    flex: 1,
    marginLeft: 8,
  },
  tagsSection: {
    marginVertical: 16,
  },
  tagInputContainer: {
    marginBottom: 12,
  },
  tagInput: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    margin: 4,
  },
  bottomActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  saveButton: {
    paddingVertical: 8,
  },
});

export default NoteEditorScreen;
