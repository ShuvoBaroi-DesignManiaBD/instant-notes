import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Card,
  FAB,
  IconButton,
  Text,
  Title,
  useTheme,
  ActivityIndicator,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDatabaseContext } from "../../contexts/DatabaseContext";

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  noteCount: number;
  createdAt: Date;
}

export default function CategoriesScreen() {
  const theme = useTheme();
  const { db } = useDatabaseContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    if (!db) return;
    setLoading(true);
    try {
      const result = await db.getAllAsync('SELECT * FROM categories ORDER BY name');
      const categoriesWithCount = await Promise.all(
        result.map(async (cat: any) => {
          const countResult = await db.getFirstAsync(
            'SELECT COUNT(*) as count FROM notes WHERE category LIKE ? AND isArchived = 0',
            [`%"name":"${cat.name}"%`]
          );
          return {
            ...cat,
            noteCount: countResult?.count || 0,
            createdAt: new Date(cat.createdAt),
          };
        })
      );
      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryCard = (category: Category) => {
    return (
      <Card
        key={category.id}
        style={[
          styles.categoryCard,
          {
            backgroundColor: theme.colors.surface,
            borderLeftColor: category.color,
          },
        ]}
        onPress={() => {
          // Navigate to category notes
        }}
      >
        <Card.Content>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryInfo}>
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: category.color },
                ]}
              >
                <Ionicons name={category.icon as any} size={24} color="white" />
              </View>
              <View style={styles.categoryDetails}>
                <Title style={styles.categoryTitle}>{category.name}</Title>
                <Text style={styles.noteCount}>
                  {category.noteCount}{" "}
                  {category.noteCount === 1 ? "note" : "notes"}
                </Text>
              </View>
            </View>
            <IconButton
              icon="dots-vertical"
              size={20}
              onPress={() => {
                // Show category options
              }}
            />
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
        <Appbar.Content title="Categories" />
        <Appbar.Action
          icon="sort"
          onPress={() => {
            // Show sort options
          }}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Categories</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-outline" size={64} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.emptyText}>No categories yet</Text>
              <Text style={styles.emptySubtext}>Create your first category to organize your notes</Text>
            </View>
          ) : (
            categories.map(renderCategoryCard)
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Card
            style={[
              styles.actionCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <View style={styles.actionRow}>
                <Ionicons
                  name="archive"
                  size={24}
                  color={theme.colors.primary}
                />
                <View style={styles.actionInfo}>
                  <Title style={styles.actionTitle}>Archived Notes</Title>
                  <Text style={styles.actionSubtitle}>View archived notes</Text>
                </View>
                <IconButton icon="chevron-right" size={20} />
              </View>
            </Card.Content>
          </Card>

          <Card
            style={[
              styles.actionCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Card.Content>
              <View style={styles.actionRow}>
                <Ionicons name="heart" size={24} color={theme.colors.error} />
                <View style={styles.actionInfo}>
                  <Title style={styles.actionTitle}>Favorites</Title>
                  <Text style={styles.actionSubtitle}>Your favorite notes</Text>
                </View>
                <IconButton icon="chevron-right" size={20} />
              </View>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => {
          // Create new category
        }}
      />
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
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  categoryCard: {
    marginVertical: 8,
    elevation: 2,
    borderLeftWidth: 4,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  noteCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  actionCard: {
    marginVertical: 4,
    elevation: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.7,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
