import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Card,
  Chip,
  FAB,
  Paragraph,
  Searchbar,
  Text,
  Title,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Note } from "../types";
import { StatusBar } from "react-native";
import { useColorScheme } from "react-native";

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Mock data - will be replaced with actual data from storage
  const [notes] = useState<Note[]>([
    {
      id: "1",
      title: "Welcome to Instant Notes",
      content:
        "This is your first note. You can edit, organize, and set reminders for your notes.",
      tags: ["welcome", "tutorial"],
      priority: "medium",
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false,
      isFavorite: true,
    },
    {
      id: "2",
      title: "Meeting Notes",
      content: "Discuss project timeline and deliverables...",
      tags: ["work", "meeting"],
      priority: "high",
      deadline: new Date(Date.now() + 86400000), // Tomorrow
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      updatedAt: new Date(Date.now() - 3600000),
      isArchived: false,
      isFavorite: false,
    },
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const renderNoteCard = (note: Note) => {
    const isOverdue = note.deadline && new Date() > note.deadline;

    return (
      <Card
        key={note.id}
        style={[styles.noteCard, { backgroundColor: theme.colors.surface }]}
        onPress={() =>
          navigation.navigate(
            "NoteEditor" as never,
            { noteId: note.id } as never
          )
        }
      >
        <Card.Content>
          <View style={styles.noteHeader}>
            <Title style={styles.noteTitle} numberOfLines={1}>
              {note.title}
            </Title>
            {note.isFavorite && (
              <Ionicons name="heart" size={20} color={theme.colors.error} />
            )}
          </View>

          <Paragraph numberOfLines={2} style={styles.noteContent}>
            {note.content}
          </Paragraph>

          <View style={styles.noteFooter}>
            <View style={styles.tagsContainer}>
              {note.tags.slice(0, 2).map((tag) => (
                <Chip key={tag} compact style={styles.tag}>
                  {tag}
                </Chip>
              ))}
              {note.tags.length > 2 && (
                <Text style={styles.moreTagsText}>+{note.tags.length - 2}</Text>
              )}
            </View>

            <View style={styles.metaInfo}>
              {note.deadline && (
                <Chip
                  icon="alarm"
                  compact
                  style={[
                    styles.deadlineChip,
                    isOverdue && {
                      backgroundColor: theme.colors.errorContainer,
                    },
                  ]}
                >
                  {note.deadline.toLocaleDateString()}
                </Chip>
              )}
              <Chip
                compact
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
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        backgroundColor={"red"}
        barStyle="light-content"
      />
      <Appbar.Header>
        <Appbar.Content title="Notes" />
        <Appbar.Action
          icon={viewMode === "list" ? "view-grid" : "view-list"}
          onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
        />
        <Appbar.Action
          icon="magnify"
          onPress={() => navigation.navigate("Search" as never)}
        />
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search notes..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={styles.emptyStateText}>
              {searchQuery ? "No notes found" : "No notes yet"}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "Tap the + button to create your first note"}
            </Text>
          </View>
        ) : (
          filteredNotes.map(renderNoteCard)
        )}
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate("NoteEditor" as never)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchbar: {
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  noteCard: {
    marginVertical: 8,
    elevation: 2,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  noteContent: {
    marginBottom: 12,
    lineHeight: 20,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  tagsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tag: {
    marginRight: 4,
    height: 24,
  },
  moreTagsText: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 4,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  deadlineChip: {
    marginRight: 4,
    height: 24,
  },
  priorityChip: {
    height: 24,
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
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default HomeScreen;
