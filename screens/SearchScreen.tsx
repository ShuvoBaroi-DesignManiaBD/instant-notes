import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Chip,
  Divider,
  Menu,
  Paragraph,
  Searchbar,
  Text,
  Title,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Note } from "../types";

const SearchScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "title">(
    "relevance"
  );
  const [dateRange, setDateRange] = useState<
    "all" | "today" | "week" | "month"
  >("all");

  // Mock data - replace with actual search implementation
  const allNotes: Note[] = [
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
      title: "Meeting Notes - Project Alpha",
      content:
        "Discussed project timeline, deliverables, and team responsibilities. Next meeting scheduled for Friday.",
      tags: ["work", "meeting", "project"],
      priority: "high",
      deadline: new Date(Date.now() + 86400000),
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
      isArchived: false,
      isFavorite: false,
    },
    {
      id: "3",
      title: "Shopping List",
      content:
        "Groceries: milk, bread, eggs, fruits. Don't forget to check expiry dates.",
      tags: ["personal", "shopping"],
      priority: "low",
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000),
      isArchived: false,
      isFavorite: false,
    },
    {
      id: "4",
      title: "Book Ideas",
      content:
        "Collection of interesting book recommendations from friends and online reviews.",
      tags: ["personal", "books", "ideas"],
      priority: "medium",
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 172800000),
      isArchived: false,
      isFavorite: true,
    },
  ];

  useEffect(() => {
    performSearch();
  }, [searchQuery, selectedCategory, selectedPriority, sortBy, dateRange]);

  const performSearch = () => {
    setIsLoading(true);

    // Simulate search delay
    setTimeout(() => {
      let results = allNotes;

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        results = results.filter(
          (note) =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query) ||
            note.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      // Filter by category (mock implementation)
      if (selectedCategory) {
        results = results.filter((note) =>
          note.tags.includes(selectedCategory.toLowerCase())
        );
      }

      // Filter by priority
      if (selectedPriority) {
        results = results.filter((note) => note.priority === selectedPriority);
      }

      // Filter by date range
      if (dateRange !== "all") {
        const now = new Date();
        const filterDate = new Date();

        switch (dateRange) {
          case "today":
            filterDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            filterDate.setDate(now.getDate() - 7);
            break;
          case "month":
            filterDate.setMonth(now.getMonth() - 1);
            break;
        }

        results = results.filter((note) => note.createdAt >= filterDate);
      }

      // Sort results
      results.sort((a, b) => {
        switch (sortBy) {
          case "date":
            return b.updatedAt.getTime() - a.updatedAt.getTime();
          case "title":
            return a.title.localeCompare(b.title);
          case "relevance":
          default:
            // Simple relevance scoring based on query matches
            if (!searchQuery.trim())
              return b.updatedAt.getTime() - a.updatedAt.getTime();

            const scoreA = getRelevanceScore(a, searchQuery);
            const scoreB = getRelevanceScore(b, searchQuery);
            return scoreB - scoreA;
        }
      });

      setSearchResults(results);
      setIsLoading(false);
    }, 300);
  };

  const getRelevanceScore = (note: Note, query: string): number => {
    const lowerQuery = query.toLowerCase();
    let score = 0;

    // Title matches get higher score
    if (note.title.toLowerCase().includes(lowerQuery)) score += 10;

    // Content matches
    if (note.content.toLowerCase().includes(lowerQuery)) score += 5;

    // Tag matches
    note.tags.forEach((tag) => {
      if (tag.toLowerCase().includes(lowerQuery)) score += 3;
    });

    // Favorite notes get slight boost
    if (note.isFavorite) score += 1;

    return score;
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedPriority(null);
    setDateRange("all");
    setSortBy("relevance");
  };

  const hasActiveFilters =
    selectedCategory ||
    selectedPriority ||
    dateRange !== "all" ||
    sortBy !== "relevance";

  const renderSearchResult = (note: Note) => {
    const isOverdue = note.deadline && new Date() > note.deadline;

    return (
      <Card
        key={note.id}
        style={[styles.resultCard, { backgroundColor: theme.colors.surface }]}
        onPress={() =>
          navigation.navigate(
            "NoteEditor" as never,
            { noteId: note.id } as never
          )
        }
      >
        <Card.Content>
          <View style={styles.resultHeader}>
            <Title style={styles.resultTitle} numberOfLines={1}>
              {note.title}
            </Title>
            {note.isFavorite && (
              <Ionicons name="heart" size={20} color={theme.colors.error} />
            )}
          </View>

          <Paragraph numberOfLines={3} style={styles.resultContent}>
            {note.content}
          </Paragraph>

          <View style={styles.resultFooter}>
            <View style={styles.tagsContainer}>
              {note.tags.slice(0, 3).map((tag) => (
                <Chip key={tag} compact style={styles.tag}>
                  {tag}
                </Chip>
              ))}
              {note.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{note.tags.length - 3}</Text>
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

          <Text style={styles.dateText}>
            Updated {note.updatedAt.toLocaleDateString()}
          </Text>
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Search" />
        <Menu
          visible={filterMenuVisible}
          onDismiss={() => setFilterMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="filter"
              onPress={() => setFilterMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setSelectedPriority(selectedPriority === "high" ? null : "high");
              setFilterMenuVisible(false);
            }}
            title="High Priority"
            leadingIcon={selectedPriority === "high" ? "check" : "flag"}
          />
          <Menu.Item
            onPress={() => {
              setSelectedPriority(
                selectedPriority === "medium" ? null : "medium"
              );
              setFilterMenuVisible(false);
            }}
            title="Medium Priority"
            leadingIcon={selectedPriority === "medium" ? "check" : "flag"}
          />
          <Menu.Item
            onPress={() => {
              setSelectedPriority(selectedPriority === "low" ? null : "low");
              setFilterMenuVisible(false);
            }}
            title="Low Priority"
            leadingIcon={selectedPriority === "low" ? "check" : "flag"}
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setDateRange(dateRange === "today" ? "all" : "today");
              setFilterMenuVisible(false);
            }}
            title="Today"
            leadingIcon={dateRange === "today" ? "check" : "calendar-today"}
          />
          <Menu.Item
            onPress={() => {
              setDateRange(dateRange === "week" ? "all" : "week");
              setFilterMenuVisible(false);
            }}
            title="This Week"
            leadingIcon={dateRange === "week" ? "check" : "calendar-week"}
          />
          <Menu.Item
            onPress={() => {
              setDateRange(dateRange === "month" ? "all" : "month");
              setFilterMenuVisible(false);
            }}
            title="This Month"
            leadingIcon={dateRange === "month" ? "check" : "calendar-month"}
          />
        </Menu>

        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="sort"
              onPress={() => setSortMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setSortBy("relevance");
              setSortMenuVisible(false);
            }}
            title="Relevance"
            leadingIcon={sortBy === "relevance" ? "check" : "star"}
          />
          <Menu.Item
            onPress={() => {
              setSortBy("date");
              setSortMenuVisible(false);
            }}
            title="Date Modified"
            leadingIcon={sortBy === "date" ? "check" : "calendar"}
          />
          <Menu.Item
            onPress={() => {
              setSortBy("title");
              setSortMenuVisible(false);
            }}
            title="Title"
            leadingIcon={sortBy === "title" ? "check" : "alphabetical"}
          />
        </Menu>
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search notes, tags, content..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          loading={isLoading}
        />
      </View>

      {hasActiveFilters && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedPriority && (
              <Chip
                onClose={() => setSelectedPriority(null)}
                style={styles.filterChip}
              >
                {selectedPriority} priority
              </Chip>
            )}
            {dateRange !== "all" && (
              <Chip
                onClose={() => setDateRange("all")}
                style={styles.filterChip}
              >
                {dateRange}
              </Chip>
            )}
            {sortBy !== "relevance" && (
              <Chip
                onClose={() => setSortBy("relevance")}
                style={styles.filterChip}
              >
                Sort: {sortBy}
              </Chip>
            )}
            <Button
              mode="text"
              onPress={clearFilters}
              style={styles.clearButton}
            >
              Clear All
            </Button>
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.content}>
        {searchQuery.trim() === "" && searchResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={styles.emptyStateText}>Search your notes</Text>
            <Text style={styles.emptyStateSubtext}>
              Enter keywords to find notes, tags, or content
            </Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={styles.emptyStateText}>No results found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search terms or filters
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {searchResults.length}{" "}
                {searchResults.length === 1 ? "result" : "results"}
                {searchQuery.trim() && ` for "${searchQuery}"`}
              </Text>
            </View>
            {searchResults.map(renderSearchResult)}
          </>
        )}
      </ScrollView>
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
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  clearButton: {
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  resultsHeader: {
    paddingVertical: 8,
  },
  resultsCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  resultCard: {
    marginVertical: 8,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  resultTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
  },
  resultContent: {
    marginBottom: 12,
    lineHeight: 20,
  },
  resultFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
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
  dateText: {
    fontSize: 12,
    opacity: 0.7,
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

export default SearchScreen;
