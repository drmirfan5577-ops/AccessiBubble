export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt: number;
}

export interface ClipboardEntry {
  id: string;
  content: string;
  label?: string;
  type: 'text' | 'url' | 'email' | 'other';
  createdAt: number;
  pinned: boolean;
}

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  createdAt: number;
}

export interface QuickLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  color: string;
}

export type SplitMode = '1' | '2h' | '2v' | '3' | '4';

export interface SplitPane {
  id: string;
  url: string;
  title: string;
  bookmarks: { url: string; label: string }[];
  history: { url: string; visitedAt: number }[];
}

export type ToolTab = 'home' | 'passwords' | 'clipboard' | 'code' | 'split' | 'links' | 'notes' | 'reminders' | 'backup' | 'docs' | 'media' | 'cloud' | 'admin';

// ─── Lock ───
export type LockMethod = 'pin' | 'pattern' | 'none';

export interface LockConfig {
  method: LockMethod;
  pin?: string;
  pattern?: number[];
  enabled: boolean;
}

// ─── Notes ───
export interface NoteFolder {
  id: string;
  name: string;
  parentId: string | null;
  color: string;
  createdAt: number;
}

export interface Note {
  id: string;
  folderId: string | null;
  title: string;
  content: string;
  pinned: boolean;
  color: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// ─── Reminders ───
export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueAt: number;
  repeat: 'none' | 'daily' | 'weekly';
  vibrate: boolean;
  sound: boolean;
  done: boolean;
  createdAt: number;
}
