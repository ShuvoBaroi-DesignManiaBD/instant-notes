import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Note {
  id: number;
  title: string;
  content: string;
  category_id: number;
  priority: 'low' | 'medium' | 'high';
  deadline?: string;
  reminder?: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface Reminder {
  id: number;
  note_id: number;
  reminder_time: string;
  is_completed: boolean;
  created_at: string;
}

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  public isWeb: boolean = Platform.OS === 'web';
  private webNotes: Note[] = [];
  private webCategories: Category[] = [];
  private nextNoteId: number = 1;
  private nextCategoryId: number = 1;

  async init() {
    try {
      if (this.isWeb) {
        console.log('Using AsyncStorage fallback for web platform');
        await this.initWebFallback();
        return;
      }
      
      this.db = await SQLite.openDatabaseAsync('instant_notes.db');
      await this.createTables();
      await this.seedDefaultCategories();
    } catch (error) {
      console.error('Database initialization error:', error);
      // Fallback for web or other platforms
      if (Platform.OS === 'web') {
        await this.initWebFallback();
      } else {
        throw error;
      }
    }
  }

  private async initWebFallback() {
    try {
      // Load existing data from AsyncStorage
      const notesData = await AsyncStorage.getItem('instant_notes_notes');
      const categoriesData = await AsyncStorage.getItem('instant_notes_categories');
      const nextNoteIdData = await AsyncStorage.getItem('instant_notes_next_note_id');
      const nextCategoryIdData = await AsyncStorage.getItem('instant_notes_next_category_id');

      this.webNotes = notesData ? JSON.parse(notesData) : [];
      this.webCategories = categoriesData ? JSON.parse(categoriesData) : [];
      this.nextNoteId = nextNoteIdData ? parseInt(nextNoteIdData) : 1;
      this.nextCategoryId = nextCategoryIdData ? parseInt(nextCategoryIdData) : 1;

      // Seed default categories if none exist
      if (this.webCategories.length === 0) {
        await this.seedDefaultCategoriesWeb();
      }
    } catch (error) {
      console.error('Failed to initialize web storage:', error);
      // Initialize with empty data
      this.webNotes = [];
      this.webCategories = [];
      await this.seedDefaultCategoriesWeb();
    }
  }

  private async seedDefaultCategoriesWeb() {
    const defaultCategories = [
      { name: 'Personal', color: '#FF6B6B', icon: 'account' },
      { name: 'Work', color: '#4ECDC4', icon: 'briefcase' },
      { name: 'Study', color: '#45B7D1', icon: 'school' },
      { name: 'Ideas', color: '#96CEB4', icon: 'lightbulb' },
      { name: 'Shopping', color: '#FFEAA7', icon: 'cart' }
    ];

    for (const category of defaultCategories) {
      await this.createCategory(category);
    }
  }

  private async saveWebData() {
    if (!this.isWeb) return;
    
    try {
      await AsyncStorage.setItem('instant_notes_notes', JSON.stringify(this.webNotes));
      await AsyncStorage.setItem('instant_notes_categories', JSON.stringify(this.webCategories));
      await AsyncStorage.setItem('instant_notes_next_note_id', this.nextNoteId.toString());
      await AsyncStorage.setItem('instant_notes_next_category_id', this.nextCategoryId.toString());
    } catch (error) {
      console.error('Failed to save web data:', error);
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    // Categories table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        color TEXT NOT NULL,
        icon TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Notes table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category_id INTEGER,
        priority TEXT CHECK(priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
        deadline DATETIME,
        reminder DATETIME,
        tags TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );
    `);

    // Reminders table
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS reminders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER,
        reminder_time DATETIME NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        notification_enabled BOOLEAN DEFAULT TRUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
      );
    `);
    
    // Add notification_enabled column if it doesn't exist (for existing databases)
    try {
      await this.db.execAsync(`
        ALTER TABLE reminders ADD COLUMN notification_enabled BOOLEAN DEFAULT TRUE;
      `);
    } catch (error) {
      // Column might already exist, ignore error
    }
  }

  private async seedDefaultCategories() {
    if (!this.db) throw new Error('Database not initialized');

    const existingCategories = await this.db.getAllAsync('SELECT COUNT(*) as count FROM categories');
    if ((existingCategories[0] as any).count > 0) return;

    const defaultCategories = [
      { name: 'Personal', color: '#FF6B6B', icon: 'account' },
      { name: 'Work', color: '#4ECDC4', icon: 'briefcase' },
      { name: 'Study', color: '#45B7D1', icon: 'school' },
      { name: 'Ideas', color: '#96CEB4', icon: 'lightbulb' },
      { name: 'Shopping', color: '#FFEAA7', icon: 'cart' }
    ];

    for (const category of defaultCategories) {
      await this.db.runAsync(
        'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
        [category.name, category.color, category.icon]
      );
    }
  }

  // Notes CRUD operations
  async createNote(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    if (this.isWeb) {
      const now = new Date().toISOString();
      const newNote: Note = {
        id: this.nextNoteId++,
        title: note.title,
        content: note.content,
        category_id: note.category_id,
        priority: note.priority,
        deadline: note.deadline || '',
        reminder: note.reminder || '',
        tags: note.tags,
        created_at: now,
        updated_at: now
      };
      
      this.webNotes.push(newNote);
      await this.saveWebData();
      return newNote.id;
    }

    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      `INSERT INTO notes (title, content, category_id, priority, deadline, reminder, tags) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        note.title,
        note.content,
        note.category_id,
        note.priority,
        note.deadline || null,
        note.reminder || null,
        note.tags
      ]
    );

    return result.lastInsertRowId;
  }

  async getAllNotes(): Promise<Note[]> {
    if (this.isWeb) {
      // Add category information to notes
      const notesWithCategories = this.webNotes.map(note => {
        const category = this.webCategories.find(c => c.id === note.category_id);
        return {
          ...note,
          category_name: category?.name || '',
          category_color: category?.color || '#666666',
          category_icon: category?.icon || 'folder'
        };
      });
      
      // Sort by updated_at descending
      return notesWithCategories.sort((a, b) => 
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }

    if (!this.db) throw new Error('Database not initialized');

    const notes = await this.db.getAllAsync(`
      SELECT n.*, c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM notes n
      LEFT JOIN categories c ON n.category_id = c.id
      ORDER BY n.updated_at DESC
    `);

    return notes as Note[];
  }

  async getNoteById(id: number): Promise<Note | null> {
    if (!this.db) throw new Error('Database not initialized');

    const note = await this.db.getFirstAsync(
      `SELECT n.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM notes n
       LEFT JOIN categories c ON n.category_id = c.id
       WHERE n.id = ?`,
      [id]
    );

    return note as Note | null;
  }

  async updateNote(id: number, note: Partial<Omit<Note, 'id' | 'created_at'>>): Promise<void> {
    if (this.isWeb) {
      const noteIndex = this.webNotes.findIndex(n => n.id === id);
      if (noteIndex === -1) throw new Error('Note not found');
      
      this.webNotes[noteIndex] = {
        ...this.webNotes[noteIndex],
        ...note,
        updated_at: new Date().toISOString()
      };
      
      await this.saveWebData();
      return;
    }

    if (!this.db) throw new Error('Database not initialized');

    const fields = [];
    const values = [];

    if (note.title !== undefined) {
      fields.push('title = ?');
      values.push(note.title);
    }
    if (note.content !== undefined) {
      fields.push('content = ?');
      values.push(note.content);
    }
    if (note.category_id !== undefined) {
      fields.push('category_id = ?');
      values.push(note.category_id);
    }
    if (note.priority !== undefined) {
      fields.push('priority = ?');
      values.push(note.priority);
    }
    if (note.deadline !== undefined) {
      fields.push('deadline = ?');
      values.push(note.deadline);
    }
    if (note.reminder !== undefined) {
      fields.push('reminder = ?');
      values.push(note.reminder);
    }
    if (note.tags !== undefined) {
      fields.push('tags = ?');
      values.push(note.tags);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db.runAsync(
      `UPDATE notes SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteNote(id: number): Promise<void> {
    if (this.isWeb) {
      this.webNotes = this.webNotes.filter(note => note.id !== id);
      await this.saveWebData();
      return;
    }

    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
  }

  async searchNotes(query: string): Promise<Note[]> {
    if (!this.db) throw new Error('Database not initialized');

    const notes = await this.db.getAllAsync(
      `SELECT n.*, c.name as category_name, c.color as category_color, c.icon as category_icon
       FROM notes n
       LEFT JOIN categories c ON n.category_id = c.id
       WHERE n.title LIKE ? OR n.content LIKE ? OR n.tags LIKE ?
       ORDER BY n.updated_at DESC`,
      [`%${query}%`, `%${query}%`, `%${query}%`]
    );

    return notes as Note[];
  }

  // Categories CRUD operations
  async getAllCategories(): Promise<Category[]> {
    if (this.isWeb) {
      return [...this.webCategories].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (!this.db) throw new Error('Database not initialized');

    const categories = await this.db.getAllAsync(
      'SELECT * FROM categories ORDER BY name'
    );

    return categories as Category[];
  }

  async createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<number> {
    if (this.isWeb) {
      const newCategory: Category = {
        id: this.nextCategoryId++,
        name: category.name,
        color: category.color,
        icon: category.icon,
        created_at: new Date().toISOString()
      };
      
      this.webCategories.push(newCategory);
      await this.saveWebData();
      return newCategory.id;
    }

    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      'INSERT INTO categories (name, color, icon) VALUES (?, ?, ?)',
      [category.name, category.color, category.icon]
    );

    return result.lastInsertRowId;
  }

  async deleteCategory(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Update notes to remove category reference
    await this.db.runAsync('UPDATE notes SET category_id = NULL WHERE category_id = ?', [id]);
    
    // Delete the category
    await this.db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
  }

  // Reminders CRUD operations
  async getUpcomingReminders(): Promise<Reminder[]> {
    if (!this.db) throw new Error('Database not initialized');

    const reminders = await this.db.getAllAsync(
      `SELECT r.*, n.title as note_title
       FROM reminders r
       JOIN notes n ON r.note_id = n.id
       WHERE r.reminder_time >= datetime('now') AND r.is_completed = FALSE
       ORDER BY r.reminder_time ASC`
    );

    return reminders as Reminder[];
  }

  async getAllReminders(): Promise<any[]> {
    if (this.isWeb) {
      // For web, create reminders from notes with reminder dates
      const notesWithReminders = this.webNotes.filter(note => note.reminder);
      return notesWithReminders.map(note => ({
        id: note.id.toString(),
        noteId: note.id.toString(),
        title: note.title,
        description: note.content.substring(0, 100),
        dueDate: new Date(note.reminder!),
        isCompleted: false, // Default for web
        priority: note.priority,
        notificationEnabled: true // Default for web
      }));
    }

    if (!this.db) throw new Error('Database not initialized');

    const reminders = await this.db.getAllAsync(
      `SELECT r.*, n.title, n.content, n.priority
       FROM reminders r
       JOIN notes n ON r.note_id = n.id
       ORDER BY r.reminder_time ASC`
    );

    return reminders.map((r: any) => ({
      id: r.id.toString(),
      noteId: r.note_id.toString(),
      title: r.title,
      description: r.content.substring(0, 100),
      dueDate: new Date(r.reminder_time),
      isCompleted: r.is_completed,
      priority: r.priority,
      notificationEnabled: r.notification_enabled !== undefined ? r.notification_enabled : true
    }));
  }

  async createReminder(noteId: number, reminderTime: string): Promise<number> {
    if (this.isWeb) {
      // For web, reminders are managed through notes
      return noteId;
    }

    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.runAsync(
      'INSERT INTO reminders (note_id, reminder_time) VALUES (?, ?)',
      [noteId, reminderTime]
    );

    return result.lastInsertRowId!;
  }

  async markReminderCompleted(id: number): Promise<void> {
    if (this.isWeb) {
      // For web, we can't persist reminder completion
      return;
    }

    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      'UPDATE reminders SET is_completed = TRUE WHERE id = ?',
      [id]
    );
  }

  async toggleReminderCompletion(id: number): Promise<void> {
     if (this.isWeb) {
       // For web, we can't persist reminder completion
       return;
     }

     if (!this.db) throw new Error('Database not initialized');

     await this.db.runAsync(
       'UPDATE reminders SET is_completed = NOT is_completed WHERE id = ?',
       [id]
     );
   }

   async toggleReminderNotification(id: number): Promise<void> {
     if (this.isWeb) {
       // For web, we can't persist notification settings
       return;
     }

     if (!this.db) throw new Error('Database not initialized');

     await this.db.runAsync(
       'UPDATE reminders SET notification_enabled = NOT notification_enabled WHERE id = ?',
       [id]
     );
   }
}

export const databaseService = new DatabaseService();