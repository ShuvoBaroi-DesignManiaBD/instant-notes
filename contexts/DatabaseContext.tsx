import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import * as SQLite from 'expo-sqlite';
import { databaseService } from "../services/database";
import { notificationService } from '../services/notifications';
import { alarmService } from '../services/alarmService';
import { Note, Category, Reminder } from '../types';

interface DatabaseContextType {
  db: SQLite.SQLiteDatabase | null;
  notes: Note[];
  categories: Category[];
  isLoading: boolean;
  refreshNotes: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  createNote: (
    note: Omit<Note, "id" | "created_at" | "updated_at">
  ) => Promise<number>;
  updateNote: (
    id: number,
    note: Partial<Omit<Note, "id" | "created_at">>
  ) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  searchNotes: (query: string) => Promise<Note[]>;
  createCategory: (
    category: Omit<Category, "id" | "created_at">
  ) => Promise<number>;
  deleteCategory: (id: number) => Promise<void>;
  getUpcomingReminders: () => Promise<Reminder[]>;
  markReminderCompleted: (reminderId: string) => Promise<void>;
  toggleNoteFavorite: (id: number) => Promise<void>;
  getFavoriteNotes: () => Promise<Note[]>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(
  undefined
);

export const useDatabaseContext = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error(
      "useDatabaseContext must be used within a DatabaseProvider"
    );
  }
  return context;
};

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({
  children,
}) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      setIsLoading(true);
      await databaseService.init();
      await refreshNotes();
      await refreshCategories();
    } catch (error) {
      console.error("Failed to initialize database:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNotes = async () => {
    try {
      const allNotes = await databaseService.getAllNotes();
      setNotes(allNotes);
    } catch (error) {
      console.error("Failed to refresh notes:", error);
    }
  };

  const refreshCategories = async () => {
    try {
      const allCategories = await databaseService.getAllCategories();
      
      // Add note count to each category
      const categoriesWithCount = await Promise.all(
        allCategories.map(async (category) => {
          let noteCount = 0;
          if (databaseService.isWeb) {
            noteCount = notes.filter((note: Note) => note.category_id === category.id).length;
          } else {
            try {
              // Use the existing database connection from databaseService instead of creating a new one
              if (notes && notes.length > 0) {
                noteCount = notes.filter(note => note.category_id === category.id).length;
              }
            } catch (error) {
              console.error('Error counting notes for category:', error);
            }
          }
          
          return {
            ...category,
            noteCount
          };
        })
      );
      
      setCategories(categoriesWithCount);
    } catch (error) {
      console.error("Failed to refresh categories:", error);
    }
  };

  const createNote = async (
    note: Omit<Note, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const noteId = await databaseService.createNote(note);
      await refreshNotes();
      return noteId;
    } catch (error) {
      console.error("Failed to create note:", error);
      throw error;
    }
  };

  const updateNote = async (
    id: number,
    note: Partial<Omit<Note, "id" | "created_at">>
  ) => {
    try {
      await databaseService.updateNote(id, note);
      await refreshNotes();
    } catch (error) {
      console.error("Failed to update note:", error);
      throw error;
    }
  };

  const deleteNote = async (id: number) => {
    try {
      await databaseService.deleteNote(id);
      await refreshNotes();
    } catch (error) {
      console.error("Failed to delete note:", error);
      throw error;
    }
  };

  const searchNotes = async (query: string) => {
    try {
      return await databaseService.searchNotes(query);
    } catch (error) {
      console.error("Failed to search notes:", error);
      return [];
    }
  };

  const createCategory = async (
    category: Omit<Category, "id" | "created_at">
  ) => {
    try {
      const categoryId = await databaseService.createCategory(category);
      await refreshCategories();
      return categoryId;
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await databaseService.deleteCategory(id);
      await refreshCategories();
      await refreshNotes(); // Refresh notes as category references may have changed
    } catch (error) {
      console.error("Failed to delete category:", error);
      throw error;
    }
  };

  const getUpcomingReminders = async () => {
    try {
      // Filter notes with reminders
      const notesWithReminders = notes.filter(note => note.reminder);
      
      // Convert notes with reminders to Reminder objects
      const reminders: Reminder[] = notesWithReminders.map(note => ({
        id: note.id.toString(),
        noteId: note.id.toString(),
        title: note.title,
        description: note.content.substring(0, 100), // First 100 chars of content as description
        dueDate: new Date(note.reminder),
        isCompleted: false, // Default to not completed
        priority: note.priority || 'medium',
        notificationEnabled: note.reminderEnabled !== false, // Default to true unless explicitly set to false
      }));
      
      return reminders;
    } catch (error) {
      console.error('Error getting upcoming reminders:', error);
      return [];
    }
  };

  const markReminderCompleted = async (reminderId: string) => {
    try {
      // Find the note that corresponds to this reminder
      const noteId = parseInt(reminderId);
      const note = notes.find(note => note.id === noteId);
      
      if (note) {
        // Mark the reminder as completed in the database
        await databaseService.markReminderCompleted(noteId);
        
        // Cancel any scheduled alarm for this reminder
        await alarmService.cancelAlarm(reminderId);
        
        // Refresh notes to reflect the changes
        await refreshNotes();
      }
    } catch (error) {
      console.error("Failed to mark reminder as completed:", error);
      throw error;
    }
  };

  const toggleNoteFavorite = async (id: number) => {
    try {
      await databaseService.toggleNoteFavorite(id);
      await refreshNotes();
    } catch (error) {
      console.error("Failed to toggle note favorite:", error);
      throw error;
    }
  };

  const getFavoriteNotes = async (): Promise<Note[]> => {
    try {
      return await databaseService.getFavoriteNotes();
    } catch (error) {
      console.error("Failed to get favorite notes:", error);
      return [];
    }
  };

  const value: DatabaseContextType = {
    db: databaseService.getDatabase(),
    notes,
    categories,
    isLoading,
    refreshNotes,
    refreshCategories,
    createNote,
    updateNote,
    deleteNote,
    searchNotes,
    createCategory,
    deleteCategory,
    getUpcomingReminders,
    markReminderCompleted,
    toggleNoteFavorite,
    getFavoriteNotes,
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};