import { Image } from 'expo-image';
import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, RefreshControl, Alert, FlatList } from "react-native";
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
  const { notes, isLoading, refreshNotes, deleteNote, toggleNoteFavorite } = useDatabaseContext();

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

  const handleToggleFavorite = async (noteId: number) => {
    try {
      await toggleNoteFavorite(noteId);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorite status');
    }
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
        return { bg: theme.colors.errorContainer, text: theme.colors.error };
      case 'medium':
        return { bg: theme.colors.secondaryContainer, text: theme.colors.secondary };
      case 'low':
        return { bg: theme.colors.tertiaryContainer, text: theme.colors.tertiary };
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
        style={[
          styles.noteCard,
          viewMode === "grid" ? styles.gridCard : styles.listCard,
          {
            backgroundColor: theme.dark 
              ? theme.colors.elevation.level2 
              : '#ffffff',
            borderColor: theme.dark 
              ? theme.colors.outlineVariant 
              : '',
            
            borderRadius: 12,
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: theme.dark ? 0.15 : 0.1,
            shadowRadius: 8,
            elevation: 4,
          }
        ]}
        onPress={() => router.push(`note-editor?noteId=${note.id}`)}
      >
        <Card.Content style={viewMode === "grid" ? styles.gridCardContent : styles.cardContent}>
          {/* Card Header with Title, Favorite, and Delete Button */}
          <View style={styles.noteHeader}>
            <Title 
              style={[
                viewMode === "grid" ? styles.gridNoteTitle : styles.noteTitle, 
                { color: theme.colors.onSurface },
                note.content.length === 0 && { fontStyle: 'italic' }
              ]} 
              numberOfLines={viewMode === "grid" ? 1 : 2}
            >
              {note.title || 'Untitled Note'}
            </Title>
            <View style={styles.headerButtons}>
              <IconButton
                icon={note.is_favorite ? "heart" : "heart-outline"}
                size={20}
                iconColor={note.is_favorite ? theme.colors.error : theme.colors.onSurfaceVariant}
                onPress={() => handleToggleFavorite(note.id)}
                style={styles.favoriteButton}
              />
              <IconButton
                icon="delete"
                size={20}
                iconColor={theme.colors.onSurfaceVariant}
                onPress={() => handleDeleteNote(note.id.toString())}
                style={styles.deleteButton}
              />
            </View>
          </View>

          {/* Note Content Preview */}
          {note.content && (
            <Paragraph 
              numberOfLines={viewMode === "grid" ? 1 : 2} 
              style={[
                viewMode === "grid" ? styles.gridNoteContent : styles.noteContent,
                { color: theme.colors.onSurfaceVariant }
              ]}
            >
              {note.content}
            </Paragraph>
          )}

          {/* Divider */}
          <View style={[
            viewMode === "grid" ? styles.gridDivider : styles.divider,
            { backgroundColor: theme.colors.outlineVariant }
          ]} />

          {/* Bottom Card Section */}
          <View style={viewMode === "grid" ? styles.gridCardFooter : styles.cardFooter}>
            {/* Left Column: Category and Tags */}
            <View style={viewMode === "grid" ? styles.gridLeftColumn : styles.leftColumn}>
              {/* Category Badge */}
              {note.category_id && (
                <View style={viewMode === "grid" ? styles.gridCategoryContainer : styles.categoryContainer}>
                  <Ionicons 
                    name="folder-outline" 
                    size={14} 
                    color={theme.colors.primary} 
                  />
                  <Text style={[
                    styles.categoryText,
                    { color: theme.colors.primary }
                  ]}>
                    Category
                  </Text>
                </View>
              )}

              {/* Tags Section */}
              {tags.length > 0 && (
                <View style={viewMode === "grid" ? styles.gridTagsContainer : styles.tagsContainer}>
                  <Ionicons 
                    name="pricetag-outline" 
                    size={14} 
                    color={theme.colors.secondary} 
                  />
                  <View style={styles.tagsRow}>
                    {tags.slice(0, viewMode === "grid" ? 1 : 2).map((tag, index) => (
                      <Text 
                        key={`${note.id}-${index}`}
                        style={[
                          styles.tagText,
                          { color: theme.colors.secondary }
                        ]}
                      >
                        {tag}{index < Math.min(tags.length, viewMode === "grid" ? 1 : 2) - 1 ? ', ' : ''}
                      </Text>
                    ))}
                    {tags.length > (viewMode === "grid" ? 1 : 2) && (
                      <Text style={[
                        styles.moreTagsText,
                        { color: theme.colors.onSurfaceVariant }
                      ]}>
                        +{tags.length - (viewMode === "grid" ? 1 : 2)}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* Right Column: Priority and Deadline */}
            <View style={viewMode === "grid" ? styles.gridRightColumn : styles.rightColumn}>
              {/* Priority Badge */}
              <View 
                style={[
                  viewMode === "grid" ? styles.gridPriorityBadge : styles.priorityBadge, 
                  {
                    backgroundColor: priorityColors.bg,
                    borderColor: priorityColors.text,
                    borderWidth: 1,
                  }
                ]}
              >
                <Ionicons 
                  name={note.priority === "high" ? "alert-circle" : note.priority === "medium" ? "alert" : "checkmark-circle"} 
                  size={viewMode === "grid" ? 10 : 12} 
                  color={priorityColors.text} 
                />
                <Text style={[
                  viewMode === "grid" ? styles.gridPriorityText : styles.priorityText, 
                  {color: priorityColors.text}
                ]}>
                  {note.priority.toUpperCase()}
                </Text>
              </View>

              {/* Deadline Badge */}
              {note.deadline && (
                <View 
                  style={[
                    viewMode === "grid" ? styles.gridDeadlineBadge : styles.deadlineBadge,
                    {
                      backgroundColor: isOverdue 
                        ? theme.colors.errorContainer 
                        : theme.colors.secondaryContainer,
                      borderColor: isOverdue 
                        ? theme.colors.error 
                        : theme.colors.secondary,
                      borderWidth: 1,
                    }
                  ]}
                >
                  <Ionicons 
                    name="calendar-outline" 
                    size={viewMode === "grid" ? 10 : 12} 
                    color={isOverdue ? theme.colors.error : theme.colors.secondary} 
                  />
                  <Text 
                    style={[
                      viewMode === "grid" ? styles.gridDeadlineText : styles.deadlineText,
                      {color: isOverdue ? theme.colors.error : theme.colors.secondary}
                    ]}
                  >
                    {new Date(note.deadline).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
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
      <Appbar.Header 
        style={[
          styles.modernHeader,
          {
            backgroundColor: theme.colors.primary,
            shadowColor: theme.colors.primary,
            // borderBottomEndRadius: 60,
            // borderBottomStartRadius: 60,
          }
        ]}
        statusBarHeight={0}
      >
        <Appbar.Content 
          title="Notes" 
          titleStyle={styles.headerTitle}
        />
        <Appbar.Action
          icon={viewMode === "list" ? "view-grid" : "view-list"}
          onPress={() => setViewMode(viewMode === "list" ? "grid" : "list")}
          iconColor="#FFFFFF"
          style={styles.headerAction}
        />
        <Appbar.Action
          icon="magnify"
          onPress={() => router.push("search")}
          iconColor="#FFFFFF"
          style={styles.headerAction}
        />
      </Appbar.Header>



      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading notes...</Text>
        </View>
      ) : (
        filteredNotes.length === 0 ? (
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
          <FlatList
            data={filteredNotes}
            renderItem={({ item }) => renderNoteCard(item)}
            keyExtractor={(item) => item.id.toString()}
            numColumns={viewMode === "grid" ? 2 : 1}
            key={viewMode} // Force re-render when viewMode changes
            contentContainerStyle={styles.content}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            columnWrapperStyle={viewMode === "grid" ? styles.gridRow : undefined}
          />
        )
      )}

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        color="#fff"
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
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  noteCard: {
    borderRadius: 12,
  },
  listCard: {
    marginVertical: 8,
    marginHorizontal: 0,
  },
  gridCard: {
    flex: 1,
    marginVertical: 4,
    marginHorizontal: 4,
    maxWidth: '48%',
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  cardContent: {
    padding: 16,
  },
  gridCardContent: {
    padding: 12,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteButton: {
    margin: -4,
    padding: 4,
  },
  deleteButton: {
    margin: -4,
    padding: 4,
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
    lineHeight: 24,
  },
  noteTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
    marginRight: 12,
  },
  gridNoteTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
    marginRight: 8,
  },
  noteContent: {
    marginBottom: 16,
    lineHeight: 20,
  },
  gridNoteContent: {
    marginBottom: 12,
    lineHeight: 18,
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  gridDivider: {
    height: 1,
    marginVertical: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  gridCardFooter: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  leftColumn: {
    flex: 1,
  },
  gridLeftColumn: {
    marginBottom: 8,
  },
  rightColumn: {
    alignItems: 'flex-end',
  },
  gridRightColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  gridCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  gridTagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
  },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginLeft: 4,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  gridPriorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 0,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  gridPriorityText: {
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
  },
  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  gridDeadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  gridDeadlineText: {
    fontSize: 9,
    fontWeight: '700',
    marginLeft: 2,
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
    textAlign: "center",
    paddingHorizontal: 32,
  },
  fab: {
    position: "absolute",
    margin: 20,
    right: 0,
    bottom: 0,
  },
  modernHeader: {
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // borderBottomLeftRadius: 30,
    // borderBottomRightRadius: 30,
  },
  headerAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
