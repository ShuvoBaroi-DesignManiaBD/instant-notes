import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  Menu,
  Text,
  useTheme,
  IconButton,
  Button,
  Chip,
  Surface,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

interface CategorySelectorProps {
  selectedCategory?: Category;
  onCategoryChange: (category: Category | undefined) => void;
  categories?: Category[];
  onCreateCategory?: (category: Omit<Category, 'id'>) => void;
  label?: string;
  placeholder?: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'Personal', color: '#FF6B6B', icon: 'account' },
  { id: '2', name: 'Work', color: '#4ECDC4', icon: 'briefcase' },
  { id: '3', name: 'Study', color: '#45B7D1', icon: 'school' },
  { id: '4', name: 'Health', color: '#96CEB4', icon: 'heart' },
  { id: '5', name: 'Finance', color: '#FFEAA7', icon: 'currency-usd' },
  { id: '6', name: 'Travel', color: '#DDA0DD', icon: 'airplane' },
  { id: '7', name: 'Shopping', color: '#FFB6C1', icon: 'shopping' },
  { id: '8', name: 'Ideas', color: '#F0E68C', icon: 'lightbulb' },
];

const CATEGORY_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#FFB6C1', '#F0E68C',
  '#FF8A80', '#82B1FF', '#B9F6CA', '#FFCC02',
];

const CATEGORY_ICONS = [
  'folder', 'star', 'heart', 'lightbulb', 'briefcase',
  'school', 'home', 'car', 'phone', 'email',
  'camera', 'music', 'gamepad', 'gift',
];

export default function CategorySelector({
  selectedCategory,
  onCategoryChange,
  categories = DEFAULT_CATEGORIES,
  onCreateCategory,
  label = 'Category',
  placeholder = 'Select a category',
}: CategorySelectorProps) {
  const theme = useTheme();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0]);
  const [newCategoryIcon, setNewCategoryIcon] = useState(CATEGORY_ICONS[0]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleCategorySelect = (category: Category) => {
    onCategoryChange(category);
    setMenuVisible(false);
  };

  const handleCreateCategory = () => {
    if (newCategoryName.trim() && onCreateCategory) {
      const newCategory = {
        name: newCategoryName.trim(),
        color: newCategoryColor,
        icon: newCategoryIcon,
      };
      onCreateCategory(newCategory);
      setNewCategoryName('');
      setNewCategoryColor(CATEGORY_COLORS[0]);
      setNewCategoryIcon(CATEGORY_ICONS[0]);
      setShowCreateForm(false);
      setMenuVisible(false);
    }
  };

  const clearCategory = () => {
    onCategoryChange(undefined);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.onSurface }]}>
        {label}
      </Text>

      <Menu
        visible={menuVisible}
        onDismiss={() => {
          setMenuVisible(false);
          setShowCreateForm(false);
        }}
        anchor={
          <TouchableOpacity
            style={[
              styles.selector,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.outline,
              },
            ]}
            onPress={() => setMenuVisible(true)}
          >
            {selectedCategory ? (
              <View style={styles.selectedCategory}>
                <View
                  style={[
                    styles.categoryIndicator,
                    { backgroundColor: selectedCategory.color },
                  ]}
                >
                  {selectedCategory.icon && (
                    <MaterialCommunityIcons
                      name={selectedCategory.icon as any}
                      size={16}
                      color="white"
                    />
                  )}
                </View>
                <Text style={[styles.categoryName, { color: theme.colors.onSurface }]}>
                  {selectedCategory.name}
                </Text>
                <IconButton
                  icon="close"
                  size={16}
                  onPress={clearCategory}
                  style={styles.clearButton}
                />
              </View>
            ) : (
              <View style={styles.placeholder}>
                <MaterialCommunityIcons
                  name="folder-outline"
                  size={20}
                  color={theme.colors.onSurfaceVariant}
                  style={styles.placeholderIcon}
                />
                <Text style={[styles.placeholderText, { color: theme.colors.onSurfaceVariant }]}>
                  {placeholder}
                </Text>
              </View>
            )}
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color={theme.colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        }
      >
        <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
          {/* Existing Categories */}
          {categories.map((category) => (
            <Menu.Item
              key={category.id}
              onPress={() => handleCategorySelect(category)}
              title={
                <View style={styles.menuItem}>
                  <View
                    style={[
                      styles.categoryIndicator,
                      { backgroundColor: category.color },
                    ]}
                  >
                    {category.icon && (
                      <MaterialCommunityIcons
                        name={category.icon as any}
                        size={16}
                        color="white"
                      />
                    )}
                  </View>
                  <Text style={styles.menuItemText}>{category.name}</Text>
                </View>
              }
            />
          ))}

          <Divider style={styles.divider} />

          {/* Create New Category */}
          {!showCreateForm ? (
            <Menu.Item
              onPress={() => setShowCreateForm(true)}
              title={
                <View style={styles.menuItem}>
                  <MaterialCommunityIcons
                    name="plus"
                    size={20}
                    color={theme.colors.primary}
                    style={styles.addIcon}
                  />
                  <Text style={[styles.menuItemText, { color: theme.colors.primary }]}>
                    Create New Category
                  </Text>
                </View>
              }
            />
          ) : (
            <View style={styles.createForm}>
              <TextInput
                style={[
                  styles.nameInput,
                  {
                    color: theme.colors.onSurface,
                    borderColor: theme.colors.outline,
                  },
                ]}
                placeholder="Category name"
                placeholderTextColor={theme.colors.onSurfaceVariant}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus
              />

              {/* Color Picker */}
              <View style={styles.pickerRow}>
                <Text style={styles.pickerLabel}>Color:</Text>
                <TouchableOpacity
                  style={[
                    styles.colorPreview,
                    { backgroundColor: newCategoryColor },
                  ]}
                  onPress={() => setShowColorPicker(!showColorPicker)}
                />
              </View>

              {showColorPicker && (
                <View style={styles.colorGrid}>
                  {CATEGORY_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        newCategoryColor === color && styles.selectedColorOption,
                      ]}
                      onPress={() => {
                        setNewCategoryColor(color);
                        setShowColorPicker(false);
                      }}
                    />
                  ))}
                </View>
              )}

              {/* Icon Picker */}
              <View style={styles.pickerRow}>
                <Text style={styles.pickerLabel}>Icon:</Text>
                <TouchableOpacity
                  style={[
                    styles.iconPreview,
                    { backgroundColor: newCategoryColor },
                  ]}
                  onPress={() => setShowIconPicker(!showIconPicker)}
                >
                  <MaterialCommunityIcons
                    name={newCategoryIcon as any}
                    size={16}
                    color="white"
                  />
                </TouchableOpacity>
              </View>

              {showIconPicker && (
                <View style={styles.iconGrid}>
                  {CATEGORY_ICONS.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        newCategoryIcon === icon && {
                          backgroundColor: theme.colors.primaryContainer,
                        },
                      ]}
                      onPress={() => {
                        setNewCategoryIcon(icon);
                        setShowIconPicker(false);
                      }}
                    >
                      <MaterialCommunityIcons
                        name={icon as any}
                        size={20}
                        color={theme.colors.onSurface}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.formActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setShowCreateForm(false);
                    setNewCategoryName('');
                  }}
                  style={styles.formButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleCreateCategory}
                  disabled={!newCategoryName.trim()}
                  style={styles.formButton}
                >
                  Create
                </Button>
              </View>
            </View>
          )}
        </ScrollView>
      </Menu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 48,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    flex: 1,
  },
  clearButton: {
    margin: 0,
  },
  placeholder: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  placeholderIcon: {
    marginRight: 8,
  },
  placeholderText: {
    fontSize: 16,
  },
  menuContent: {
    maxHeight: 400,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
  },
  addIcon: {
    marginRight: 8,
  },
  divider: {
    marginVertical: 8,
  },
  createForm: {
    padding: 16,
    minWidth: 280,
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 12,
    minWidth: 40,
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  iconPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  colorOption: {
    width: 28,
    height: 28,
    borderRadius: 14,
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#000',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  iconOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  formButton: {
    flex: 1,
  },
});