import { useState } from 'react';
import {
  X, Lock, Clipboard, Code2, Globe, LayoutGrid, Home, ChevronDown,
  StickyNote, Bell, Database, BookOpen, Shield, Settings, ChevronRight,
  Cloud, Music, Type, ShieldAlert
} from 'lucide-react';
import { ToolTab } from '@/types';
import PasswordVault from './PasswordVault';
import ClipboardManager from './ClipboardManager';
import CodeManager from './CodeManager';
import QuickLinksPanel from './QuickLinksPanel';
import SplitScreenManager from './SplitScreenManager';
import HomeTab from './HomeTab';
import NotesManager from './NotesManager';
import RemindersManager from './RemindersManager';
import BackupManager from './BackupManager';
import DocsViewer from './DocsViewer';
import MediaPlayer from './MediaPlayer';
import CloudSync from './CloudSync';
import AdminPanel from './AdminPanel';
import { LockSetup } from './LockScreen';

interface AccessiPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSplitScreen: () => void;
}

// Primary tabs (visible in main tab bar)
const PRIMARY_TABS: { id: ToolTab; icon: React.ReactNode; label: string; color: string }[] = [
  { id: 'home', icon: <Home size={13} />, label: 'Home', color: 'text-white' },
  { id: 'passwords', icon: <Lock size={13} />, label: 'Vault', color: 'text-purple-400' },
  { id: 'clipboard', icon: <Clipboard size={13} />, label: 'Clips', color: 'text-cyan-400' },
  { id: 'code', icon: <Code2 size={13} />, label: 'Code', color: 'text-green-400' },
  { id: 'notes', icon: <StickyNote size={13} />, label: 'Notes', color: 'text-yellow-400' },
  { id: 'split', icon: <LayoutGrid size={13} />, label: 'Split', color: 'text-orange-400' },
];

// More menu tabs
const MORE_TABS: { id: ToolTab; icon: React.ReactNode; label: string; color: string }[] = [
  { id: 'media', icon: <Music size={14} />, label: 'Media', color: 'text-pink-400' },
  { id: 'reminders', icon: <Bell size={14} />, label: 'Reminders', color: 'text-orange-400' },
  { id: 'links', icon: <Globe size={14} />, label: 'Quick Links', color: 'text-sky-400' },
  { id: 'cloud', icon: <Cloud size={14} />, label: 'Cloud Sync', color: 'text-blue-400' },
  { id: 'backup', icon: <Database size={14} />, label: 'Backup', color: 'text-indigo-400' },
  { id: 'docs', icon: <BookOpen size={14} />, label: 'Docs', color: 'text-blue-400' },
  { id: 'admin', icon: <ShieldAlert size={14} />, label: 'Admin', color: 'text-red-400' },
];

const AccessiPanel = ({ isOpen, onClose, onSplitScreen }: AccessiPanelProps) => {
  const [activeTab, setActiveTab] = useState<ToolTab>('home');
  const [height, setHeight] = useState<'half' | 'full'>('half');
  const [showMore, setShowMore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingTab, setSettingTab] = useState<'security' | null>(null);

  if (!isOpen) return null;

  const isSplit = activeTab === 'split';
  const allTabs = [...PRIMARY_TABS, ...MORE_TABS];
  const currentTab = allTabs.find(t => t.id === activeTab);

  const isMoreActive = MORE_TABS.some(t => t.id === activeTab);

  const handleTabClick = (id: ToolTab) => {
    setActiveTab(id);
    setShowMore(false);
    if (id === 'split' || id === 'docs' || id === 'media' || id === 'admin') setHeight('full');
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9990] bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-[9995] glass-dark rounded-t-3xl panel-slide-up flex flex-col transition-all duration-300 ${
          height === 'full' || isSplit ? 'h-[95dvh]' : 'h-[72dvh]'
        }`}
        style={{ maxHeight: '95dvh' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <button
            onClick={() => setHeight(h => h === 'half' ? 'full' : 'half')}
            className="w-12 h-1 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-sm font-bold gradient-text">AccessiBubble</span>
            {currentTab && (
              <span className={`text-xs ${currentTab.color} opacity-70`}>· {currentTab.label}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setShowSettings(s => !s); setShowMore(false); }}
              className={`p-1.5 rounded-lg text-white/40 hover:text-white transition-colors ${showSettings ? 'bg-white/15' : 'bg-white/5 hover:bg-white/10'}`}
            >
              <Settings size={13} />
            </button>
            <button
              onClick={() => setHeight(h => h === 'half' ? 'full' : 'half')}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
            >
              <ChevronDown size={13} className={`transition-transform ${height === 'full' ? 'rotate-180' : ''}`} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white">
              <X size={13} />
            </button>
          </div>
        </div>

        {/* Settings overlay */}
        {showSettings && (
          <div className="mx-3 mb-2 glass rounded-2xl p-3 fade-in">
            <div className="text-xs font-semibold text-white mb-2 flex items-center gap-1.5"><Settings size={12} /> Settings</div>
            <button
              onClick={() => { setSettingTab('security'); setShowSettings(false); setActiveTab('home'); }}
              className="w-full flex items-center justify-between px-2 py-2 rounded-xl hover:bg-white/10 text-xs text-white/70 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2"><Shield size={13} className="text-red-400" /> Security & Lock</div>
              <ChevronRight size={12} className="text-white/30" />
            </button>
            <button
              onClick={() => { handleTabClick('cloud'); setShowSettings(false); }}
              className="w-full flex items-center justify-between px-2 py-2 rounded-xl hover:bg-white/10 text-xs text-white/70 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2"><Cloud size={13} className="text-blue-400" /> Cloud Sync Account</div>
              <ChevronRight size={12} className="text-white/30" />
            </button>
            <button
              onClick={() => { handleTabClick('admin'); setShowSettings(false); }}
              className="w-full flex items-center justify-between px-2 py-2 rounded-xl hover:bg-white/10 text-xs text-white/70 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2"><ShieldAlert size={13} className="text-red-400" /> Admin Panel</div>
              <ChevronRight size={12} className="text-white/30" />
            </button>
          </div>
        )}

        {/* Security settings */}
        {settingTab === 'security' && (
          <div className="flex-1 overflow-hidden px-3 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setSettingTab(null)} className="text-xs text-white/40 hover:text-white flex items-center gap-1">
                ← Back
              </button>
              <span className="text-sm font-semibold text-white">Security & Lock</span>
            </div>
            <LockSetup onDone={() => { setSettingTab(null); }} />
          </div>
        )}

        {/* Tab bar */}
        {!settingTab && (
          <div className="flex items-center gap-1 px-3 pb-2 overflow-x-auto">
            {PRIMARY_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                <span className={activeTab === tab.id ? tab.color : ''}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}

            {/* More button */}
            <div className="relative">
              <button
                onClick={() => setShowMore(m => !m)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  showMore || isMoreActive
                    ? 'bg-white/15 text-white border border-white/20'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                ••• More
              </button>
              {showMore && (
                <div className="absolute bottom-full left-0 mb-1 glass-dark rounded-xl p-1.5 min-w-[150px] z-10 fade-in">
                  {MORE_TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all ${
                        activeTab === tab.id ? 'bg-white/15 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <span className={tab.color}>{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab content */}
        {!settingTab && (
          <div className="flex-1 overflow-hidden px-3 pb-4">
            {activeTab === 'home' && <HomeTab onNavigate={id => handleTabClick(id as ToolTab)} />}
            {activeTab === 'passwords' && <PasswordVault />}
            {activeTab === 'clipboard' && <ClipboardManager />}
            {activeTab === 'code' && <CodeManager />}
            {activeTab === 'notes' && <NotesManager />}
            {activeTab === 'split' && <SplitScreenManager />}
            {activeTab === 'media' && <MediaPlayer />}
            {activeTab === 'reminders' && <RemindersManager />}
            {activeTab === 'links' && <QuickLinksPanel />}
            {activeTab === 'cloud' && <CloudSync />}
            {activeTab === 'backup' && <BackupManager />}
            {activeTab === 'docs' && <DocsViewer />}
            {activeTab === 'admin' && <AdminPanel />}
          </div>
        )}
      </div>
    </>
  );
};

export default AccessiPanel;
