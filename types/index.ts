export interface Note {
  id: string;
  title: string;
  content: string;
  categoryId?: string;
  tags: string[];
  priority: "low" | "medium" | "high";
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  isFavorite: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  createdAt: Date;
}

export interface Reminder {
  id: string;
  noteId: string;
  title: string;
  description?: string;
  dueDate: Date;
  isCompleted: boolean;
  priority: "low" | "medium" | "high";
  notificationEnabled: boolean;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  autoSave: boolean;
  notificationsEnabled: boolean;
  syncEnabled: boolean;
  defaultView: "grid" | "list";
}

export type RootStackParamList = {
  Home: undefined;
  NoteEditor: { noteId?: string };
  Categories: undefined;
  Reminders: undefined;
  Settings: undefined;
  Search: undefined;
};

export type TabParamList = {
  Home: undefined;
  Categories: undefined;
  Reminders: undefined;
  Settings: undefined;
};
