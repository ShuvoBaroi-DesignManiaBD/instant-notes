import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Card,
  FAB,
  IconButton,
  Text,
  Title,
  useTheme,
} from "react-native-paper";

import { SafeAreaView } from "react-native-safe-area-context";
import { useDatabaseContext } from "../../contexts/DatabaseContext";

interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  noteCount?: number;
  created_at: string;
}

export default function CategoriesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { categories, isLoading, refreshCategories } = useDatabaseContext();

  useEffect(() => {
    refreshCategories();
  }, []);

  const renderCategoryCard = (category: Category) => {
    return (
      <View
        key={category.id}
      >
        <Card
          style={[
            styles.categoryCard,
            {
              backgroundColor: theme.colors.surface,
              borderLeftColor: category.color,
            },
          ]}
          onPress={() => {
            Alert.alert(
              "Category Notes",
              `Viewing notes for ${category.name} - coming soon!`
            );
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
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color="white"
                  />
                </View>
                <View style={styles.categoryDetails}>
                  <Title style={styles.categoryTitle}>{category.name}</Title>
                  <Text style={styles.noteCount}>
                    {category.noteCount || 0}{" "}
                    {(category.noteCount || 0) === 1 ? "note" : "notes"}
                  </Text>
                </View>
              </View>
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={() => {
                  Alert.alert(
                    "Category Options",
                    "Category options coming soon!"
                  );
                }}
              />
            </View>
          </Card.Content>
        </Card>
      </View>
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
          },
        ]}
        statusBarHeight={0}
      >
        <Appbar.Content title="Categories" titleStyle={styles.headerTitle} />
        <Appbar.Action
          icon="sort"
          onPress={() => {
            Alert.alert("Sort Options", "Sort options coming soon!");
          }}
          iconColor="#FFFFFF"
          style={styles.headerAction}
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Categories</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="folder-outline"
                size={64}
                color={theme.colors.onSurfaceVariant}
              />
              <Text style={styles.emptyText}>No categories yet</Text>
              <Text style={styles.emptySubtext}>
                Create your first category to organize your notes
              </Text>
            </View>
          ) : (
            categories.map(renderCategoryCard)
          )}
        </View>
      </ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        color="#fff"
        onPress={() => router.push("category-editor")}
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
  modernHeader: {
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerAction: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
