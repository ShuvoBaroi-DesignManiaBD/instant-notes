import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  IconButton,
  Menu,
  Text,
  useTheme,
  Divider,
  Button,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RichTextEditorProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
}

interface TextStyle {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  fontSize: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  color: string;
}

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];
const TEXT_COLORS = [
  '#000000',
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#800080',
  '#008000',
];

const EMOJIS = ['😀', '😂', '😍', '🤔', '👍', '❤️', '🎉', '🔥', '💡', '⭐'];

export default function RichTextEditor({
  value,
  onChangeText,
  placeholder = 'Start writing...',
  editable = true,
}: RichTextEditorProps) {
  const theme = useTheme();
  const [showToolbar, setShowToolbar] = useState(false);
  const [textStyle, setTextStyle] = useState<TextStyle>({
    bold: false,
    italic: false,
    underline: false,
    fontSize: 16,
    textAlign: 'left',
    color: theme.colors.onSurface,
  });
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);

  const toggleBold = () => {
    setTextStyle(prev => ({ ...prev, bold: !prev.bold }));
  };

  const toggleItalic = () => {
    setTextStyle(prev => ({ ...prev, italic: !prev.italic }));
  };

  const toggleUnderline = () => {
    setTextStyle(prev => ({ ...prev, underline: !prev.underline }));
  };

  const setAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    setTextStyle(prev => ({ ...prev, textAlign: align }));
  };

  const insertText = (text: string) => {
    onChangeText(value + text);
  };

  const insertHeading = (level: number) => {
    const headingText = `\n${'#'.repeat(level)} Heading ${level}\n`;
    insertText(headingText);
    setShowHeadingMenu(false);
  };

  const insertList = (ordered: boolean) => {
    const listText = ordered ? '\n1. List item\n' : '\n• List item\n';
    insertText(listText);
  };

  const insertEmoji = (emoji: string) => {
    insertText(emoji);
    setShowEmojiMenu(false);
  };

  const getTextInputStyle = () => {
    return [
      styles.textInput,
      {
        color: textStyle.color,
        fontSize: textStyle.fontSize,
        textAlign: textStyle.textAlign,
        fontWeight: textStyle.bold ? 'bold' : 'normal',
        fontStyle: textStyle.italic ? 'italic' : 'normal',
        textDecorationLine: textStyle.underline ? 'underline' : 'none',
        borderColor: theme.colors.outline,
      },
    ];
  };

  if (!editable) {
    return (
      <TextInput
        style={getTextInputStyle()}
        value={value}
        editable={false}
        multiline
        textAlignVertical="top"
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Toolbar */}
      <View style={[styles.toolbar, { backgroundColor: theme.colors.surfaceVariant }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Heading Menu */}
          <Menu
            visible={showHeadingMenu}
            onDismiss={() => setShowHeadingMenu(false)}
            anchor={
              <IconButton
                icon="format-header-1"
                size={20}
                onPress={() => setShowHeadingMenu(true)}
                style={styles.toolbarButton}
              />
            }
          >
            <Menu.Item onPress={() => insertHeading(1)} title="Large Heading" />
            <Menu.Item onPress={() => insertHeading(2)} title="Medium Heading" />
            <Menu.Item onPress={() => insertHeading(3)} title="Small Heading" />
          </Menu>

          {/* Bold */}
          <IconButton
            icon="format-bold"
            size={20}
            onPress={toggleBold}
            style={[
              styles.toolbarButton,
              textStyle.bold && { backgroundColor: theme.colors.primaryContainer },
            ]}
          />

          {/* Italic */}
          <IconButton
            icon="format-italic"
            size={20}
            onPress={toggleItalic}
            style={[
              styles.toolbarButton,
              textStyle.italic && { backgroundColor: theme.colors.primaryContainer },
            ]}
          />

          {/* Underline */}
          <IconButton
            icon="format-underline"
            size={20}
            onPress={toggleUnderline}
            style={[
              styles.toolbarButton,
              textStyle.underline && { backgroundColor: theme.colors.primaryContainer },
            ]}
          />

          <Divider style={styles.divider} />

          {/* Text Alignment */}
          <IconButton
            icon="format-align-left"
            size={20}
            onPress={() => setAlignment('left')}
            style={[
              styles.toolbarButton,
              textStyle.textAlign === 'left' && { backgroundColor: theme.colors.primaryContainer },
            ]}
          />
          <IconButton
            icon="format-align-center"
            size={20}
            onPress={() => setAlignment('center')}
            style={[
              styles.toolbarButton,
              textStyle.textAlign === 'center' && { backgroundColor: theme.colors.primaryContainer },
            ]}
          />
          <IconButton
            icon="format-align-right"
            size={20}
            onPress={() => setAlignment('right')}
            style={[
              styles.toolbarButton,
              textStyle.textAlign === 'right' && { backgroundColor: theme.colors.primaryContainer },
            ]}
          />

          <Divider style={styles.divider} />

          {/* Lists */}
          <IconButton
            icon="format-list-bulleted"
            size={20}
            onPress={() => insertList(false)}
            style={styles.toolbarButton}
          />
          <IconButton
            icon="format-list-numbered"
            size={20}
            onPress={() => insertList(true)}
            style={styles.toolbarButton}
          />

          <Divider style={styles.divider} />

          {/* Font Size Menu */}
          <Menu
            visible={showFontSizeMenu}
            onDismiss={() => setShowFontSizeMenu(false)}
            anchor={
              <IconButton
                icon="format-size"
                size={20}
                onPress={() => setShowFontSizeMenu(true)}
                style={styles.toolbarButton}
              />
            }
          >
            {FONT_SIZES.map(size => (
              <Menu.Item
                key={size}
                onPress={() => {
                  setTextStyle(prev => ({ ...prev, fontSize: size }));
                  setShowFontSizeMenu(false);
                }}
                title={`${size}px`}
              />
            ))}
          </Menu>

          {/* Color Menu */}
          <Menu
            visible={showColorMenu}
            onDismiss={() => setShowColorMenu(false)}
            anchor={
              <IconButton
                icon="palette"
                size={20}
                onPress={() => setShowColorMenu(true)}
                style={styles.toolbarButton}
              />
            }
          >
            <View style={styles.colorGrid}>
              {TEXT_COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }]}
                  onPress={() => {
                    setTextStyle(prev => ({ ...prev, color }));
                    setShowColorMenu(false);
                  }}
                />
              ))}
            </View>
          </Menu>

          {/* Emoji Menu */}
          <Menu
            visible={showEmojiMenu}
            onDismiss={() => setShowEmojiMenu(false)}
            anchor={
              <IconButton
                icon="emoticon-happy"
                size={20}
                onPress={() => setShowEmojiMenu(true)}
                style={styles.toolbarButton}
              />
            }
          >
            <View style={styles.emojiGrid}>
              {EMOJIS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.emojiOption}
                  onPress={() => insertEmoji(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Menu>
        </ScrollView>
      </View>

      {/* Text Input */}
      <TextInput
        style={getTextInputStyle()}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
        multiline
        textAlignVertical="top"
        onFocus={() => setShowToolbar(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  toolbarButton: {
    margin: 2,
  },
  divider: {
    width: 1,
    height: 30,
    marginHorizontal: 4,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    minHeight: 200,
    lineHeight: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    maxWidth: 200,
  },
  colorOption: {
    width: 30,
    height: 30,
    margin: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    maxWidth: 200,
  },
  emojiOption: {
    padding: 8,
    margin: 2,
  },
  emojiText: {
    fontSize: 20,
  },
});