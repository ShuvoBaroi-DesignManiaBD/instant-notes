import { Image } from 'expo-image';
import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, Alert } from "react-native";
import {
  Appbar,
  FAB,
  Card,
  Title,
  Paragraph,
  Chip,
  Searchbar,
  useTheme,
  Text,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useDatabaseContext } from '../../contexts/DatabaseContext';
import { Note } from '../../services/database';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const { notes, isLoading, refreshNotes, deleteNote } = useDatabaseContext();

  // Notes are automatically loaded by DatabaseContext

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshNotes();
    setRefreshing(false);
  }, [refreshNotes]);

  const handleDeleteNote = async (noteId: string) => {
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
              await deleteNote(parseInt(noteId));
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  const filteredNotes = notes.filter(
    (note) => {
      const tags = note.tags ? note.tags.split(',').filter(tag => tag.trim()) : [];
      return (
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  );

  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return { bg: '#FFEBEE', text: '#C62828' }; // Red
      case 'medium':
        return { bg: '#FFF3E0', text: '#F57C00' }; // Orange
      case 'low':
        return { bg: '#E8F5E8', text: '#2E7D32' }; // Green
      default:
        return { bg: theme.colors.surfaceVariant, text: theme.colors.onSurfaceVariant };
    }
  };

  const renderNoteCard = (note: Note) => {
    const isOverdue = note.deadline && new Date() > new Date(note.deadline);
    const priorityColors = getPriorityColor(note.priority);
    const tags = note.tags ? note.tags.split(',').filter(tag => tag.trim()) : [];

    return (
      <Card
        key={note.id}
        style={[styles.noteCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => router.push(`note-editor?noteId=${note.id}`)}
      >
        <Card.Content>
          <View style={styles.noteHeader}>
            <Title style={styles.noteTitle} numberOfLines={1}>
              {note.title}
            </Title>
            <View style={styles.noteActions}>
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteNote(note.id.toString())}
                style={styles.deleteButton}
              />
            </View>
          </View>

          <Paragraph numberOfLines={2} style={styles.noteContent}>
            {note.content}
          </Paragraph>

          {/* Tags Section */}
          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.slice(0, 3).map((tag, index) => (
                <Chip key={`${note.id}-${index}`} compact style={styles.tagChip}>
                  {tag}
                </Chip>
              ))}
              {tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{tags.length - 3}</Text>
              )}
            </View>
          )}

          {/* Metadata Row */}
          <View style={styles.metadataRow}>
            {/* Priority */}
            <Chip
              compact
              style={[
                styles.priorityChip,
                {
                  backgroundColor: priorityColors.bg,
                },
              ]}
              textStyle={{ color: priorityColors.text, fontWeight: '600' }}
              icon={
                note.priority === "high"
                  ? "flag"
                  : note.priority === "medium"
                  ? "flag-outline"
                  : "flag-variant"
              }
            >
              {note.priority.toUpperCase()}
            </Chip>

            {/* Deadline */}
            {note.deadline && (
              <Chip
                icon="calendar-clock"
                compact
                style={[
                  styles.deadlineChip,
                  {
                    backgroundColor: isOverdue 
                      ? theme.colors.errorContainer 
                      : theme.colors.primaryContainer,
                  },
                ]}
                textStyle={{
                  color: isOverdue 
                    ? theme.colors.onErrorContainer 
                    : theme.colors.onPrimaryContainer,
                }}
              >
                {new Date(note.deadline).toLocaleDateString()}
              </Chip>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.Content title="Notes" />
        <Appbar.Action
          icon={viewMode === "list" ? "view-grid" : "view-list"}
          onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
        />
        <Appbar.Action
          icon="magnify"
          onPress={() => router.push("search")}
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

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading notes...</Text>
        </View>
      ) : (
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
      )}

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => router.push("note-editor")}
      />
    </SafeAreaView>
  );
}

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
  noteActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    margin: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
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
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  tagChip: {
    marginRight: 6,
    marginBottom: 4,
  },
  moreTagsText: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 4,
  },
  metadataRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 8,
  },
  priorityChip: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  deadlineChip: {
    borderWidth: 1,
    borderColor: 'transparent',
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
