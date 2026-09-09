import { PasswordEntry, ClipboardEntry, CodeSnippet, LockConfig, Note, NoteFolder, Reminder } from '@/types';

// ─── Helpers ───
export const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const detectType = (text: string): ClipboardEntry['type'] => {
  if (/^https?:\/\//i.test(text)) return 'url';
  if (/^[\w.-]+@[\w.-]+\.\w+$/.test(text)) return 'email';
  return 'text';
};

// ─── Password Vault ───
const PW_KEY = 'accessi_passwords';

export const getPasswords = (): PasswordEntry[] => {
  try { return JSON.parse(localStorage.getItem(PW_KEY) || '[]'); } catch { return []; }
};

export const savePassword = (entry: PasswordEntry) => {
  const list = getPasswords();
  const idx = list.findIndex(p => p.id === entry.id);
  if (idx >= 0) list[idx] = entry; else list.unshift(entry);
  localStorage.setItem(PW_KEY, JSON.stringify(list));
};

export const deletePassword = (id: string) => {
  localStorage.setItem(PW_KEY, JSON.stringify(getPasswords().filter(p => p.id !== id)));
};

// ─── Clipboard Manager ───
const CB_KEY = 'accessi_clipboard';

export const getClipboard = (): ClipboardEntry[] => {
  try { return JSON.parse(localStorage.getItem(CB_KEY) || '[]'); } catch { return []; }
};

export const saveClip = (entry: ClipboardEntry) => {
  const list = getClipboard();
  const idx = list.findIndex(c => c.id === entry.id);
  if (idx >= 0) list[idx] = entry; else list.unshift(entry);
  localStorage.setItem(CB_KEY, JSON.stringify(list));
};

export const deleteClip = (id: string) => {
  localStorage.setItem(CB_KEY, JSON.stringify(getClipboard().filter(c => c.id !== id)));
};

export const togglePinClip = (id: string) => {
  const list = getClipboard().map(c => c.id === id ? { ...c, pinned: !c.pinned } : c);
  localStorage.setItem(CB_KEY, JSON.stringify(list));
};

// ─── Code Snippets ───
const CODE_KEY = 'accessi_code';

export const getSnippets = (): CodeSnippet[] => {
  try { return JSON.parse(localStorage.getItem(CODE_KEY) || '[]'); } catch { return []; }
};

export const saveSnippet = (entry: CodeSnippet) => {
  const list = getSnippets();
  const idx = list.findIndex(s => s.id === entry.id);
  if (idx >= 0) list[idx] = entry; else list.unshift(entry);
  localStorage.setItem(CODE_KEY, JSON.stringify(list));
};

export const deleteSnippet = (id: string) => {
  localStorage.setItem(CODE_KEY, JSON.stringify(getSnippets().filter(s => s.id !== id)));
};

// ─── Lock ───
const LOCK_KEY = 'accessi_lock';

export const getLockConfig = (): LockConfig => {
  try {
    const v = localStorage.getItem(LOCK_KEY);
    return v ? JSON.parse(v) : { method: 'none', enabled: false };
  } catch { return { method: 'none', enabled: false }; }
};

export const saveLockConfig = (cfg: LockConfig) => {
  localStorage.setItem(LOCK_KEY, JSON.stringify(cfg));
};

// ─── Notes ───
const NOTES_KEY = 'accessi_notes';
const FOLDERS_KEY = 'accessi_folders';

export const getFolders = (): NoteFolder[] => {
  try { return JSON.parse(localStorage.getItem(FOLDERS_KEY) || '[]'); } catch { return []; }
};

export const saveFolder = (folder: NoteFolder) => {
  const list = getFolders();
  const idx = list.findIndex(f => f.id === folder.id);
  if (idx >= 0) list[idx] = folder; else list.unshift(folder);
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(list));
};

export const deleteFolder = (id: string) => {
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(getFolders().filter(f => f.id !== id)));
  // move notes out of folder
  const notes = getNotes().map(n => n.folderId === id ? { ...n, folderId: null } : n);
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
};

export const getNotes = (): Note[] => {
  try { return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]'); } catch { return []; }
};

export const saveNote = (note: Note) => {
  const list = getNotes();
  const idx = list.findIndex(n => n.id === note.id);
  if (idx >= 0) list[idx] = note; else list.unshift(note);
  localStorage.setItem(NOTES_KEY, JSON.stringify(list));
};

export const deleteNote = (id: string) => {
  localStorage.setItem(NOTES_KEY, JSON.stringify(getNotes().filter(n => n.id !== id)));
};

// ─── Reminders ───
const REMINDERS_KEY = 'accessi_reminders';

export const getReminders = (): Reminder[] => {
  try { return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]'); } catch { return []; }
};

export const saveReminder = (r: Reminder) => {
  const list = getReminders();
  const idx = list.findIndex(x => x.id === r.id);
  if (idx >= 0) list[idx] = r; else list.unshift(r);
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(list));
};

export const deleteReminder = (id: string) => {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(getReminders().filter(r => r.id !== id)));
};

// ─── Full Backup / Restore ───
export const exportBackup = () => {
  const data = {
    version: 2,
    exportedAt: Date.now(),
    passwords: getPasswords(),
    clipboard: getClipboard(),
    code: getSnippets(),
    notes: getNotes(),
    folders: getFolders(),
    reminders: getReminders(),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `accessibubble-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importBackup = (json: string): { ok: boolean; message: string } => {
  try {
    const data = JSON.parse(json);
    if (data.passwords) localStorage.setItem(PW_KEY, JSON.stringify(data.passwords));
    if (data.clipboard) localStorage.setItem(CB_KEY, JSON.stringify(data.clipboard));
    if (data.code) localStorage.setItem(CODE_KEY, JSON.stringify(data.code));
    if (data.notes) localStorage.setItem(NOTES_KEY, JSON.stringify(data.notes));
    if (data.folders) localStorage.setItem(FOLDERS_KEY, JSON.stringify(data.folders));
    if (data.reminders) localStorage.setItem(REMINDERS_KEY, JSON.stringify(data.reminders));
    return { ok: true, message: 'Backup restored successfully' };
  } catch {
    return { ok: false, message: 'Invalid backup file' };
  }
};
