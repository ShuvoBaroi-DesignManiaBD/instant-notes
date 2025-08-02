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

  const handleDeleteNote = async (noteId: string | number) => {
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
              const id = typeof noteId === 'string' ? parseInt(noteId) : noteId;
              await deleteNote(id);
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
        <Card.Content style={styles.cardContent}>
          {/* Card Header with Title and Delete Button */}
          <View style={styles.noteHeader}>
            <Title style={styles.noteTitle} numberOfLines={1}>
              {note.title}
            </Title>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteNote(note.id.toString())}
              style={styles.deleteButton}
            />
          </View>

          {/* Note Content Preview */}
          <Paragraph numberOfLines={2} style={styles.noteContent}>
            {note.content}
          </Paragraph>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Bottom Card Section */}
          <View style={styles.cardFooter}>
            {/* Left Column: Category and Tags */}
            <View style={styles.leftColumn}>
              {/* Category Badge */}
              {note.category_id && (
                <View style={styles.categoryContainer}>
                  <Ionicons name="folder-outline" size={14} color="#7B1FA2" />
                  <Text style={styles.categoryText}>Category</Text>
                </View>
              )}

              {/* Tags Section */}
              {tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  <Ionicons name="pricetag-outline" size={14} color="#1976D2" />
                  <View style={styles.tagsRow}>
                    {tags.slice(0, 2).map((tag, index) => (
                      <Text 
                        key={`${note.id}-${index}`}
                        style={styles.tagText}
                      >
                        {tag}{index < Math.min(tags.length, 2) - 1 ? ', ' : ''}
                      </Text>
                    ))}
                    {tags.length > 2 && (
                      <Text style={styles.moreTagsText}>+{tags.length - 2}</Text>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Right Column: Priority and Deadline */}
            <View style={styles.rightColumn}>
              {/* Priority Badge */}
              <View 
                style={[
                  styles.priorityBadge, 
                  {backgroundColor: priorityColors.bg}
                ]}
              >
                <Ionicons 
                  name={note.priority === "high" ? "alert-circle" : note.priority === "medium" ? "alert" : "checkmark-circle"} 
                  size={12} 
                  color={priorityColors.text} 
                />
                <Text style={[styles.priorityText, {color: priorityColors.text}]}>
                  {note.priority.toUpperCase()}
                </Text>
              </View>

              {/* Deadline Badge */}
              {note.deadline && (
                <View 
                  style={[
                    styles.deadlineBadge,
                    {backgroundColor: isOverdue ? '#FFEBEE' : '#E8F5E8'}
                  ]}
                >
                  <Ionicons 
                    name="calendar-outline" 
                    size={12} 
                    color={isOverdue ? '#C62828' : '#2E7D32'} 
                  />
                  <Text 
                    style={[
                      styles.deadlineText,
                      {color: isOverdue ? '#C62828' : '#2E7D32'}
                    ]}
                  >
                    {new Date(note.deadline).toLocaleDateString()}
                  </Text>
                </View>
              )}
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
    elevation: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    fontWeight: "700",
  },
  noteContent: {
    marginBottom: 12,
    lineHeight: 20,
    opacity: 0.8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  rightColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    color: '#7B1FA2',
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  tagText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  deadlineText: {
    fontSize: 10,
    fontWeight: '600',
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
