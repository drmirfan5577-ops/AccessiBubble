import { Lock, Clipboard, Code2, Globe, LayoutGrid, Shield, Zap, Star, StickyNote, Bell, Database, BookOpen, Music, Cloud, ShieldAlert } from 'lucide-react';
import { ToolTab } from '@/types';
import { getPasswords, getClipboard, getSnippets, getNotes, getReminders } from '@/lib/storage';

interface HomeTabProps {
  onNavigate: (tab: ToolTab) => void;
}

const HomeTab = ({ onNavigate }: HomeTabProps) => {
  const passwords = getPasswords();
  const clips = getClipboard();
  const snippets = getSnippets();
  const notes = getNotes();
  const reminders = getReminders().filter(r => !r.done && r.dueAt > Date.now());

  const tools = [
    { tab: 'passwords' as ToolTab, icon: <Lock size={18} />, label: 'Password Vault', desc: 'Secure storage + generator', count: passwords.length, color: 'from-purple-600/30 to-purple-900/20 border-purple-500/20', iconColor: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
    { tab: 'clipboard' as ToolTab, icon: <Clipboard size={18} />, label: 'Clipboard', desc: 'Auto-detect + pinned content', count: clips.length, color: 'from-cyan-600/30 to-cyan-900/20 border-cyan-500/20', iconColor: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
    { tab: 'notes' as ToolTab, icon: <StickyNote size={18} />, label: 'Notes', desc: 'Rich text + folders + tags', count: notes.length, color: 'from-yellow-600/30 to-yellow-900/20 border-yellow-500/20', iconColor: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300' },
    { tab: 'reminders' as ToolTab, icon: <Bell size={18} />, label: 'Reminders', desc: 'Alarms with sound & vibration', count: reminders.length, color: 'from-orange-600/30 to-orange-900/20 border-orange-500/20', iconColor: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
    { tab: 'code' as ToolTab, icon: <Code2 size={18} />, label: 'Code Snippets', desc: 'Reusable code library', count: snippets.length, color: 'from-green-600/30 to-green-900/20 border-green-500/20', iconColor: 'text-green-400', badge: 'bg-green-500/20 text-green-300' },
    { tab: 'media' as ToolTab, icon: <Music size={18} />, label: 'Media Player', desc: 'Audio & video, all formats', count: null, color: 'from-pink-600/30 to-pink-900/20 border-pink-500/20', iconColor: 'text-pink-400', badge: '' },
    { tab: 'split' as ToolTab, icon: <LayoutGrid size={18} />, label: 'Split Screen', desc: 'Up to 4 panes + bookmarks', count: null, color: 'from-orange-600/30 to-orange-900/20 border-orange-500/20', iconColor: 'text-orange-400', badge: '' },
    { tab: 'links' as ToolTab, icon: <Globe size={18} />, label: 'Quick Links', desc: 'Social & web shortcuts', count: null, color: 'from-sky-600/30 to-sky-900/20 border-sky-500/20', iconColor: 'text-sky-400', badge: '' },
    { tab: 'cloud' as ToolTab, icon: <Cloud size={18} />, label: 'Cloud Sync', desc: 'Sync data across devices', count: null, color: 'from-blue-600/30 to-blue-900/20 border-blue-500/20', iconColor: 'text-blue-400', badge: '' },
    { tab: 'backup' as ToolTab, icon: <Database size={18} />, label: 'Backup & Restore', desc: 'Export, import & share data', count: null, color: 'from-indigo-600/30 to-indigo-900/20 border-indigo-500/20', iconColor: 'text-indigo-400', badge: '' },
    { tab: 'docs' as ToolTab, icon: <BookOpen size={18} />, label: 'Documentation', desc: 'Full app guide & help', count: null, color: 'from-blue-600/30 to-blue-900/20 border-blue-500/20', iconColor: 'text-blue-400', badge: '' },
    { tab: 'admin' as ToolTab, icon: <ShieldAlert size={18} />, label: 'Admin Panel', desc: 'PWA, source, publishing docs', count: null, color: 'from-red-600/30 to-red-900/20 border-red-500/20', iconColor: 'text-red-400', badge: '' },
  ];

  const tips = [
    'Drag the bubble anywhere on screen',
    'Minimize to a dot with the — button',
    'Notes: toggle Rich Text editor with the "Rich" button',
    'Clipboard auto-detects content when panel opens',
    'Media player supports audio, video & URL streams',
    'Admin Panel requires password Daood5577',
    'Cloud Sync keeps data across all your devices',
    'Split screen panes have draggable dividers',
    'Set PIN or pattern lock in Settings (⚙)',
    'Export all data as JSON backup anytime',
  ];

  return (
    <div className="h-full overflow-y-auto pr-1">
      {/* Hero */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-900/40 via-blue-900/20 to-cyan-900/30 border border-purple-500/20 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">AccessiBubble v3</div>
            <div className="text-xs text-white/40">Your floating productivity hub</div>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1 text-xs">
          {[
            { v: passwords.length, l: 'Passwords', c: 'text-purple-300' },
            { v: clips.length, l: 'Clips', c: 'text-cyan-300' },
            { v: notes.length, l: 'Notes', c: 'text-yellow-300' },
            { v: snippets.length, l: 'Snippets', c: 'text-green-300' },
            { v: reminders.length, l: 'Reminders', c: 'text-orange-300' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <div className={`font-bold text-base ${s.c}`}>{s.v}</div>
              <div className="text-white/30 text-[10px]">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools grid */}
      <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">All Tools</div>
      <div className="grid grid-cols-1 gap-2 mb-4">
        {tools.map(tool => (
          <button
            key={tool.tab}
            onClick={() => onNavigate(tool.tab)}
            className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${tool.color} border text-left transition-all hover:scale-[1.01] active:scale-[0.99]`}
          >
            <div className={`${tool.iconColor} flex-shrink-0`}>{tool.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white">{tool.label}</div>
              <div className="text-xs text-white/40">{tool.desc}</div>
            </div>
            {tool.count !== null && (
              <div className={`text-xs px-2 py-0.5 rounded-full ${tool.badge} flex-shrink-0`}>
                {tool.count}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Tips */}
      <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Star size={10} /> Tips
      </div>
      <div className="space-y-1.5">
        {tips.map((tip, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-white/40">
            <span className="text-purple-400 mt-0.5">›</span>
            {tip}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-white/25 bg-white/3 rounded-xl p-3 mb-2">
        <Shield size={12} className="text-green-400/50 flex-shrink-0" />
        All data stored locally. Optionally sync to cloud. Lock with PIN or Pattern.
      </div>
    </div>
  );
};

export default HomeTab;
