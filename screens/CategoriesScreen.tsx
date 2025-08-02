import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import {
  Appbar,
  Button,
  Card,
  Dialog,
  FAB,
  IconButton,
  Menu,
  Paragraph,
  Portal,
  Text,
  TextInput,
  Title,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Category } from "../types";

const CategoriesScreen: React.FC = () => {
  const theme = useTheme();
  const [categories, setCategories] = useState<Category[]>([
    {
      id: "1",
      name: "Work",
      color: "#007AFF",
      icon: "briefcase",
      createdAt: new Date(),
    },
    {
      id: "2",
      name: "Personal",
      color: "#34C759",
      icon: "person",
      createdAt: new Date(),
    },
    {
      id: "3",
      name: "Ideas",
      color: "#FF9500",
      icon: "bulb",
      createdAt: new Date(),
    },
  ]);

  const [dialogVisible, setDialogVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#007AFF");
  const [categoryIcon, setCategoryIcon] = useState("folder");
  const [menuVisible, setMenuVisible] = useState<string | null>(null);

  const colorOptions = [
    "#007AFF",
    "#34C759",
    "#FF9500",
    "#FF3B30",
    "#AF52DE",
    "#FF2D92",
    "#5856D6",
    "#00C7BE",
  ];

  const iconOptions = [
    "folder",
    "briefcase",
    "person",
    "bulb",
    "heart",
    "star",
    "bookmark",
    "flag",
  ];

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryName("");
    setCategoryColor("#007AFF");
    setCategoryIcon("folder");
    setDialogVisible(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setCategoryColor(category.color);
    setCategoryIcon(category.icon || "folder");
    setDialogVisible(true);
    setMenuVisible(null);
  };

  const handleSaveCategory = () => {
    if (!categoryName.trim()) {
      Alert.alert("Error", "Please enter a category name.");
      return;
    }

    if (editingCategory) {
      // Update existing category
      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id
            ? {
                ...cat,
                name: categoryName.trim(),
                color: categoryColor,
                icon: categoryIcon,
              }
            : cat
        )
      );
    } else {
      // Create new category
      const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryName.trim(),
        color: categoryColor,
        icon: categoryIcon,
        createdAt: new Date(),
      };
      setCategories([...categories, newCategory]);
    }

    setDialogVisible(false);
  };

  const handleDeleteCategory = (categoryId: string) => {
    Alert.alert(
      "Delete Category",
      'Are you sure you want to delete this category? Notes in this category will be moved to "Uncategorized".',
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setCategories(categories.filter((cat) => cat.id !== categoryId));
            setMenuVisible(null);
          },
        },
      ]
    );
  };

  const renderCategoryCard = (category: Category) => {
    const noteCount = Math.floor(Math.random() * 20) + 1; // Mock note count

    return (
      <Card
        key={category.id}
        style={[styles.categoryCard, { backgroundColor: theme.colors.surface }]}
        onPress={() => {
          // Navigate to notes in this category
          console.log("Navigate to category:", category.name);
        }}
      >
        <Card.Content>
          <View style={styles.categoryHeader}>
            <View style={styles.categoryInfo}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: category.color + "33" },
                ]}
              >
                <Ionicons
                  name={category.icon as any}
                  size={24}
                  color={category.color}
                />
              </View>
              <View style={styles.categoryText}>
                <Title style={styles.categoryName}>{category.name}</Title>
                <Paragraph style={styles.noteCount}>
                  {noteCount} {noteCount === 1 ? "note" : "notes"}
                </Paragraph>
              </View>
            </View>

            <Menu
              visible={menuVisible === category.id}
              onDismiss={() => setMenuVisible(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setMenuVisible(category.id)}
                />
              }
            >
              <Menu.Item
                onPress={() => handleEditCategory(category)}
                title="Edit"
                leadingIcon="pencil"
              />
              <Menu.Item
                onPress={() => handleDeleteCategory(category.id)}
                title="Delete"
                leadingIcon="delete"
              />
            </Menu>
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
        <Appbar.Action icon="magnify" onPress={() => {}} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="folder-outline"
              size={64}
              color={theme.colors.onSurfaceVariant}
            />
            <Text style={styles.emptyStateText}>No categories yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Create categories to organize your notes
            </Text>
          </View>
        ) : (
          categories.map(renderCategoryCard)
        )}
      </ScrollView>

      <Portal>
        <Dialog
          visible={dialogVisible}
          onDismiss={() => setDialogVisible(false)}
        >
          <Dialog.Title>
            {editingCategory ? "Edit Category" : "Create Category"}
          </Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Category Name"
              value={categoryName}
              onChangeText={setCategoryName}
              style={styles.input}
              mode="outlined"
            />

            <Text style={styles.sectionTitle}>Color</Text>
            <View style={styles.colorOptions}>
              {colorOptions.map((color) => (
                <Button
                  key={color}
                  mode={categoryColor === color ? "contained" : "outlined"}
                  onPress={() => setCategoryColor(color)}
                  style={[
                    styles.colorOption,
                    {
                      backgroundColor:
                        categoryColor === color ? color : "transparent",
                    },
                  ]}
                  labelStyle={{
                    color: categoryColor === color ? "white" : color,
                  }}
                >
                  {" "}
                </Button>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Icon</Text>
            <View style={styles.iconOptions}>
              {iconOptions.map((icon) => (
                <Button
                  key={icon}
                  mode={categoryIcon === icon ? "contained" : "outlined"}
                  onPress={() => setCategoryIcon(icon)}
                  style={styles.iconOption}
                  icon={icon}
                >
                  {" "}
                </Button>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Cancel</Button>
            <Button onPress={handleSaveCategory}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleCreateCategory}
      />
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
  categoryCard: {
    marginVertical: 8,
    elevation: 2,
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
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  categoryText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  noteCount: {
    fontSize: 14,
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
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  input: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  colorOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    margin: 4,
    borderRadius: 20,
  },
  iconOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  iconOption: {
    margin: 4,
    minWidth: 60,
  },
});

export default CategoriesScreen;
