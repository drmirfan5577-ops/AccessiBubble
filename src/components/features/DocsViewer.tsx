import { useState } from 'react';
import {
  BookOpen, ChevronDown, ChevronRight, Minimize2, Maximize2, X,
  Layers, Lock, Clipboard, Code2, Globe, LayoutGrid, Bell, StickyNote,
  Database, Zap, Shield, Move, Smartphone
} from 'lucide-react';

interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  color: string;
  content: { heading: string; body: string }[];
}

const DOCS: Section[] = [
  {
    id: 'start', icon: <Zap size={14} />, title: 'Getting Started', color: 'text-yellow-400',
    content: [
      { heading: 'Floating Bubble', body: 'The glowing purple bubble can be dragged anywhere on screen. Single-tap to open the toolkit panel. While the panel is open, use — to minimize to a dot or × to close.' },
      { heading: 'Opening the Panel', body: 'Tap the bubble once to open the full AccessiBubble panel. Drag the bottom handle upward to expand to full screen, or tap the ∨ button.' },
      { heading: 'Minimizing', body: 'When the panel is open, the bubble shows — and × buttons. Tap — to minimize the bubble to a small dot. Tap the dot to restore.' },
    ],
  },
  {
    id: 'passwords', icon: <Lock size={14} />, title: 'Password Vault', color: 'text-purple-400',
    content: [
      { heading: 'Saving Passwords', body: 'Tap "+ Add" → fill in Title (required), Username, Password, URL, and Notes → tap Save. Use the eye icon to reveal/hide passwords.' },
      { heading: 'Copy Password', body: 'Tap the copy icon on any entry to instantly copy the password to clipboard.' },
      { heading: 'Password Generator', body: 'Tap "+ Add" then use the "Generate" button to create a strong random password. Configure length (8–32), uppercase, numbers, symbols.' },
      { heading: 'Searching', body: 'Use the search bar to filter by title or username. Results update in real-time.' },
    ],
  },
  {
    id: 'clipboard', icon: <Clipboard size={14} />, title: 'Clipboard Manager', color: 'text-cyan-400',
    content: [
      { heading: 'Saving Clips', body: 'Tap "+ Add", paste or type content, add an optional label, then Save. URLs and emails are auto-detected and shown with type icons.' },
      { heading: 'Pinning', body: 'Tap the pin icon to keep important clips at the top. Pinned items show a highlighted border.' },
      { heading: 'Quick Paste', body: 'Tap "Paste" inside the add form to automatically read your device clipboard (requires permission).' },
    ],
  },
  {
    id: 'code', icon: <Code2 size={14} />, title: 'Code Snippets', color: 'text-green-400',
    content: [
      { heading: 'Adding Snippets', body: 'Tap "+ Add", choose language, enter title and paste code. The code preview supports expand/collapse — tap the code block to toggle.' },
      { heading: 'Languages', body: 'Supports JS, TypeScript, Python, HTML, CSS, SQL, Bash, JSON, PHP, and more.' },
      { heading: 'Copying Code', body: 'Tap the copy icon to copy entire code to clipboard instantly.' },
    ],
  },
  {
    id: 'split', icon: <LayoutGrid size={14} />, title: 'Split Screen', color: 'text-orange-400',
    content: [
      { heading: 'Split Modes', body: 'Choose from Single, Side by Side (2 cols), Top/Bottom (2 rows), 3 Panes, or 4 Panes using the mode bar.' },
      { heading: 'Navigating Panes', body: 'Each pane has its own URL bar. Type a URL and press Enter or tap the refresh icon. Sites that block iframes can be opened externally with ↗.' },
      { heading: 'Bookmarks & History', body: 'Each pane stores bookmarks and recently visited URLs. Tap ☆ to bookmark the current page. Access history via the clock icon.' },
    ],
  },
  {
    id: 'notes', icon: <StickyNote size={14} />, title: 'Notes', color: 'text-yellow-400',
    content: [
      { heading: 'Creating Notes', body: 'Tap "+ Note" to open the editor. Add a title, content, assign a folder, pick a color, and add comma-separated tags.' },
      { heading: 'Folders', body: 'Tap the folder-plus icon to create folders and sub-folders for organizing notes. Nested folders are supported one level deep.' },
      { heading: 'Pinning & Tags', body: 'Tap the pin button in the editor to keep notes at top. Tags allow quick filtering via search.' },
    ],
  },
  {
    id: 'reminders', icon: <Bell size={14} />, title: 'Reminders', color: 'text-orange-400',
    content: [
      { heading: 'Setting Reminders', body: 'Tap "+ Add", enter title, pick date/time, set repeat (none/daily/weekly). Enable/disable sound and vibration independently.' },
      { heading: 'Alarm Tones', body: 'Preview and select from Bell, Chime, Alert, Ping, or Buzz tones. Sounds are generated via Web Audio API — no internet needed.' },
      { heading: 'Due Alerts', body: 'The app checks reminders every 15 seconds. When due, a toast notification appears with sound/vibration per your settings.' },
    ],
  },
  {
    id: 'backup', icon: <Database size={14} />, title: 'Backup & Restore', color: 'text-indigo-400',
    content: [
      { heading: 'Exporting', body: 'Tap "Download JSON" to save all data (passwords, clips, code, notes, reminders) as a backup file to your device.' },
      { heading: 'Sharing', body: 'Tap "Share" to use your device\'s native share sheet to send the backup via email, messaging apps, or cloud storage.' },
      { heading: 'Restoring', body: 'Tap "Choose Backup File" and select a previously exported JSON file. Warning: this overwrites existing data. Export first.' },
    ],
  },
  {
    id: 'security', icon: <Shield size={14} />, title: 'Lock & Security', color: 'text-red-400',
    content: [
      { heading: 'Setting Up Lock', body: 'Open Settings tab → Security. Choose 4-digit PIN or Pattern Lock. You\'ll be asked to set and confirm your chosen method.' },
      { heading: 'PIN Lock', body: 'A 4-digit numeric PIN. Enter it on the lock screen to unlock. After 3 wrong attempts, a warning is shown.' },
      { heading: 'Pattern Lock', body: 'Draw a pattern through at least 4 dots on a 3×3 grid. The same pattern must be drawn to unlock.' },
      { heading: 'Disabling Lock', body: 'Go to Settings → Security → Change Lock → choose "Skip — no lock".' },
    ],
  },
];

interface DocsViewerProps {
  onClose?: () => void;
}

const DocsViewer = ({ onClose }: DocsViewerProps) => {
  const [expanded, setExpanded] = useState<string | null>('start');
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);

  const toggle = (id: string) => setExpanded(e => e === id ? null : id);
  const toggleItem = (key: string) => setExpandedItem(e => e === key ? null : key);

  if (minimized) {
    return (
      <div className="fixed bottom-6 left-6 z-[9980] glass-bubble glow-purple rounded-full px-4 py-2 flex items-center gap-2 cursor-pointer fade-in" onClick={() => setMinimized(false)}>
        <BookOpen size={14} className="text-purple-300" />
        <span className="text-xs text-white/80">Docs</span>
        <Maximize2 size={11} className="text-white/40" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full ${maximized ? 'fixed inset-0 z-[9990] bg-[#08081a] p-4' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-blue-400" />
          <span className="text-sm font-semibold text-white">Documentation</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setMinimized(true)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
            title="Minimize"
          >
            <Minimize2 size={12} />
          </button>
          <button
            onClick={() => setMaximized(m => !m)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
            title="Maximize"
          >
            {maximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      <div className="text-xs text-white/30 mb-3 flex items-center gap-1.5">
        <Smartphone size={11} /> AccessiBubble v2.0 — Full User Guide
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {DOCS.map(section => (
          <div key={section.id} className="glass rounded-xl overflow-hidden fade-in">
            {/* Section header */}
            <button
              onClick={() => toggle(section.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className={section.color}>{section.icon}</span>
                <span className="text-sm font-medium text-white">{section.title}</span>
              </div>
              {expanded === section.id
                ? <ChevronDown size={14} className="text-white/30" />
                : <ChevronRight size={14} className="text-white/30" />}
            </button>

            {/* Section content */}
            {expanded === section.id && (
              <div className="border-t border-white/5 divide-y divide-white/5 fade-in">
                {section.content.map((item, i) => {
                  const key = `${section.id}-${i}`;
                  return (
                    <div key={i}>
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="text-xs font-semibold text-white/80">{item.heading}</span>
                        {expandedItem === key
                          ? <ChevronDown size={11} className="text-white/30 flex-shrink-0" />
                          : <ChevronRight size={11} className="text-white/30 flex-shrink-0" />}
                      </button>
                      {expandedItem === key && (
                        <div className="px-3 pb-3 text-xs text-white/50 leading-relaxed fade-in">
                          {item.body}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        <div className="text-center text-xs text-white/20 py-3">
          AccessiBubble — All data stored locally · No internet required
        </div>
      </div>
    </div>
  );
};

export default DocsViewer;
