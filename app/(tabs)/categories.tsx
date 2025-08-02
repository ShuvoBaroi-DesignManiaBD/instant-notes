import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Card,
  FAB,
  IconButton,
  Text,
  Title,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [categories] = useState<Category[]>([
    {
      id: "1",
      name: "Work",
      color: "#007AFF",
      icon: "briefcase",
      noteCount: 5,
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Personal",
      color: "#34C759",
      icon: "person",
      noteCount: 3,
      createdAt: new Date(),
    },
    {
      id: "3",
      name: "Ideas",
      color: "#FF9500",
      icon: "bulb",
      noteCount: 8,
      createdAt: new Date(),
    },
  ]);

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
          {categories.map(renderCategoryCard)}
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
});
