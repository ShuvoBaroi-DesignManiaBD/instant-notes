import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Chip,
  Searchbar,
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

interface Category {
  id: string;
  name: string;
  color: string;
  noteCount: number;
}

const mockNotes: Note[] = [
  {
    id: "1",
    title: "Welcome to Instant Notes",
    content:
      "This is your first note. You can edit, organize, and set reminders for your notes.",
    tags: ["welcome", "tutorial"],
    priority: "medium",
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(),
    isArchived: false,
    isFavorite: true,
  },
  {
    id: "2",
    title: "Meeting Notes - Q4 Planning",
    content:
      "Discussed quarterly goals, budget allocation, and team restructuring.",
    tags: ["work", "meeting", "planning"],
    priority: "high",
    deadline: new Date(Date.now() + 604800000),
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 86400000),
    isArchived: false,
    isFavorite: false,
  },
  {
    id: "3",
    title: "Recipe: Chocolate Chip Cookies",
    content:
      "Ingredients: flour, butter, sugar, chocolate chips, eggs, vanilla...",
    tags: ["recipe", "baking", "dessert"],
    priority: "low",
    createdAt: new Date(Date.now() - 259200000),
    updatedAt: new Date(Date.now() - 172800000),
    isArchived: false,
    isFavorite: true,
  },
  {
    id: "4",
    title: "Book Ideas",
    content: "Collection of story concepts and character development notes.",
    tags: ["creative", "writing", "ideas"],
    priority: "medium",
    createdAt: new Date(Date.now() - 345600000),
    updatedAt: new Date(Date.now() - 259200000),
    isArchived: false,
    isFavorite: false,
  },
  {
    id: "5",
    title: "Travel Itinerary - Japan",
    content: "Day-by-day plan for Tokyo, Kyoto, and Osaka visit.",
    tags: ["travel", "japan", "itinerary"],
    priority: "high",
    deadline: new Date(Date.now() + 2592000000),
    createdAt: new Date(Date.now() - 432000000),
    updatedAt: new Date(Date.now() - 345600000),
    isArchived: false,
    isFavorite: true,
  },
];

const mockCategories: Category[] = [
  { id: "1", name: "Work", color: "#2196F3", noteCount: 8 },
  { id: "2", name: "Personal", color: "#4CAF50", noteCount: 12 },
  { id: "3", name: "Ideas", color: "#FF9800", noteCount: 5 },
  { id: "4", name: "Recipes", color: "#E91E63", noteCount: 3 },
];

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchType, setSearchType] = useState<"all" | "notes" | "categories">(
    "all"
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "meeting",
    "recipe",
    "travel",
  ]);

  // Get all unique tags from notes
  const allTags = Array.from(new Set(mockNotes.flatMap((note) => note.tags)));

  useEffect(() => {
    if (searchQuery.trim() === "" && selectedTags.length === 0) {
      setFilteredNotes([]);
      setFilteredCategories([]);
      return;
    }

    // Filter notes
    const noteResults = mockNotes.filter((note) => {
      const matchesQuery =
        searchQuery.trim() === "" ||
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => note.tags.includes(tag));

      return matchesQuery && matchesTags;
    });

    // Filter categories
    const categoryResults = mockCategories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredNotes(noteResults);
    setFilteredCategories(categoryResults);
  }, [searchQuery, selectedTags]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !recentSearches.includes(query.trim())) {
      setRecentSearches((prev) => [query.trim(), ...prev.slice(0, 4)]);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };

  const renderNoteItem = ({ item }: { item: Note }) => (
    <TouchableOpacity
      onPress={() => router.push(`/note-editor?noteId=${item.id}`)}
    >
      <Card style={styles.noteCard}>
        <Card.Content>
          <View style={styles.noteHeader}>
            <Text style={styles.noteTitle} numberOfLines={1}>
              {item.title || "Untitled"}
            </Text>
            {item.isFavorite && (
              <Ionicons name="heart" size={16} color={theme.colors.error} />
            )}
          </View>
          <Text style={styles.noteContent} numberOfLines={2}>
            {item.content}
          </Text>
          <View style={styles.noteFooter}>
            <View style={styles.noteTags}>
              {item.tags.slice(0, 2).map((tag) => (
                <Chip key={tag} style={styles.noteTag} compact>
                  {tag}
                </Chip>
              ))}
              {item.tags.length > 2 && (
                <Text style={styles.moreTagsText}>+{item.tags.length - 2}</Text>
              )}
            </View>
            <Text style={styles.noteDate}>
              {item.updatedAt.toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity>
      <Card style={styles.categoryCard}>
        <Card.Content style={styles.categoryContent}>
          <View
            style={[styles.categoryIcon, { backgroundColor: item.color }]}
          />
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.categoryCount}>{item.noteCount} notes</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderRecentSearch = (search: string) => (
    <TouchableOpacity
      key={search}
      style={styles.recentSearchItem}
      onPress={() => setSearchQuery(search)}
    >
      <Ionicons
        name="time-outline"
        size={16}
        color={theme.colors.onSurfaceVariant}
      />
      <Text style={styles.recentSearchText}>{search}</Text>
    </TouchableOpacity>
  );

  const showResults = searchQuery.trim() !== "" || selectedTags.length > 0;
  const hasResults = filteredNotes.length > 0 || filteredCategories.length > 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Search" />
        {(searchQuery.trim() !== "" || selectedTags.length > 0) && (
          <Appbar.Action icon="close" onPress={clearFilters} />
        )}
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search notes, categories, tags..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          icon="magnify"
        />
      </View>

      {/* Filter Tags */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filtersTitle}>Filter by tags:</Text>
        <FlatList
          horizontal
          data={allTags}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Chip
              style={[
                styles.filterTag,
                selectedTags.includes(item) && {
                  backgroundColor: theme.colors.primaryContainer,
                },
              ]}
              selected={selectedTags.includes(item)}
              onPress={() => toggleTag(item)}
              compact
            >
              {item}
            </Chip>
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTagsList}
        />
      </View>

      {/* Search Type Selector */}
      <View style={styles.searchTypeContainer}>
        <Button
          mode={searchType === "all" ? "contained" : "outlined"}
          onPress={() => setSearchType("all")}
          style={styles.searchTypeButton}
          compact
        >
          All
        </Button>
        <Button
          mode={searchType === "notes" ? "contained" : "outlined"}
          onPress={() => setSearchType("notes")}
          style={styles.searchTypeButton}
          compact
        >
          Notes ({filteredNotes.length})
        </Button>
        <Button
          mode={searchType === "categories" ? "contained" : "outlined"}
          onPress={() => setSearchType("categories")}
          style={styles.searchTypeButton}
          compact
        >
          Categories ({filteredCategories.length})
        </Button>
      </View>

      {/* Results or Recent Searches */}
      <View style={styles.resultsContainer}>
        {!showResults ? (
          <View style={styles.recentSearchesContainer}>
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            {recentSearches.map(renderRecentSearch)}
          </View>
        ) : hasResults ? (
          <FlatList
            data={[
              ...(searchType === "all" || searchType === "categories"
                ? filteredCategories.map((cat) => ({
                    type: "category",
                    data: cat,
                  }))
                : []),
              ...(searchType === "all" || searchType === "notes"
                ? filteredNotes.map((note) => ({ type: "note", data: note }))
                : []),
            ]}
            keyExtractor={(item, index) =>
              `${item.type}-${item.data.id}-${index}`
            }
            renderItem={({ item }) => {
              if (item.type === "category") {
                return renderCategoryItem({ item: item.data as Category });
              } else {
                return renderNoteItem({ item: item.data as Note });
              }
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={styles.resultsList}
          />
        ) : (
          <View style={styles.noResultsContainer}>
            <Ionicons
              name="search-outline"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={styles.noResultsText}>No results found</Text>
            <Text style={styles.noResultsSubtext}>
              Try adjusting your search terms or filters
            </Text>
          </View>
        )}
      </View>
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
  searchBar: {
    elevation: 2,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  filterTagsList: {
    paddingRight: 16,
  },
  filterTag: {
    marginRight: 8,
  },
  searchTypeContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  searchTypeButton: {
    flex: 1,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  recentSearchesContainer: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  recentSearchText: {
    fontSize: 16,
  },
  resultsList: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  separator: {
    height: 8,
  },
  noteCard: {
    marginVertical: 4,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  noteContent: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
    lineHeight: 20,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noteTags: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  noteTag: {
    marginRight: 4,
  },
  moreTagsText: {
    fontSize: 12,
    opacity: 0.6,
    marginLeft: 4,
  },
  noteDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  categoryCard: {
    marginVertical: 4,
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
  },
  categoryCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
  },
});
