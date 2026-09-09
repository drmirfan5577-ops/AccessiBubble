import { useState, useRef } from 'react';
import {
  Download, Upload, Trash2, CheckCircle2, AlertCircle, Package,
  ShieldCheck, FileJson, Send, RefreshCw, Database
} from 'lucide-react';
import { exportBackup, importBackup, getPasswords, getClipboard, getSnippets, getNotes, getReminders } from '@/lib/storage';
import { toast } from 'sonner';

const BackupManager = () => {
  const [importing, setImporting] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const stats = {
    passwords: getPasswords().length,
    clipboard: getClipboard().length,
    code: getSnippets().length,
    notes: getNotes().length,
    reminders: getReminders().length,
  };
  const total = Object.values(stats).reduce((a, b) => a + b, 0);

  const handleExport = () => {
    exportBackup();
    toast.success('Backup downloaded as JSON');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const text = ev.target?.result as string;
      const result = importBackup(text);
      if (result.ok) {
        toast.success(result.message);
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleShareExport = async () => {
    const data = {
      version: 2,
      exportedAt: Date.now(),
      passwords: getPasswords(),
      clipboard: getClipboard(),
      code: getSnippets(),
      notes: getNotes(),
      reminders: getReminders(),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const file = new File([blob], `accessibubble-backup-${Date.now()}.json`, { type: 'application/json' });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'AccessiBubble Backup' });
      } catch {
        handleExport();
      }
    } else {
      handleExport();
    }
  };

  const handleClearAll = () => {
    ['accessi_passwords', 'accessi_clipboard', 'accessi_code', 'accessi_notes', 'accessi_folders', 'accessi_reminders'].forEach(k => localStorage.removeItem(k));
    setConfirmClear(false);
    toast.success('All data cleared');
    setTimeout(() => window.location.reload(), 500);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Database size={16} className="text-indigo-400" />
        <span className="text-sm font-semibold text-white">Backup & Restore</span>
      </div>

      {/* Data summary */}
      <div className="glass rounded-2xl p-4 mb-4">
        <div className="text-xs text-white/40 mb-3 uppercase tracking-wider">Stored Data</div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { label: 'Passwords', val: stats.passwords, color: 'text-purple-400' },
            { label: 'Clips', val: stats.clipboard, color: 'text-cyan-400' },
            { label: 'Snippets', val: stats.code, color: 'text-green-400' },
            { label: 'Notes', val: stats.notes, color: 'text-yellow-400' },
            { label: 'Reminders', val: stats.reminders, color: 'text-orange-400' },
            { label: 'Total', val: total, color: 'text-white' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
              <div className="text-[10px] text-white/30">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-green-400/70">
          <ShieldCheck size={12} /> All data saved locally on your device
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
        {/* Export */}
        <div className="glass rounded-xl p-3">
          <div className="text-xs font-semibold text-white mb-1">Export / Download</div>
          <div className="text-xs text-white/40 mb-3">Save all your data as a JSON backup file.</div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 text-xs py-2 rounded-lg transition-all"
            >
              <Download size={13} /> Download JSON
            </button>
            <button
              onClick={handleShareExport}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white/60 text-xs px-3 py-2 rounded-lg transition-all"
            >
              <Send size={13} /> Share
            </button>
          </div>
        </div>

        {/* Import */}
        <div className="glass rounded-xl p-3">
          <div className="text-xs font-semibold text-white mb-1">Import / Restore</div>
          <div className="text-xs text-white/40 mb-3">Restore from a previously exported JSON backup.</div>
          <input
            type="file"
            accept=".json,application/json"
            ref={fileRef}
            onChange={handleImportFile}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 text-xs py-2 rounded-lg transition-all"
          >
            <Upload size={13} /> Choose Backup File
          </button>
          <div className="text-[10px] text-yellow-400/60 mt-2 flex items-start gap-1">
            <AlertCircle size={10} className="flex-shrink-0 mt-0.5" />
            Importing will overwrite existing data. Export first as a safety measure.
          </div>
        </div>

        {/* Manual text paste */}
        {importing && (
          <div className="glass rounded-xl p-3 fade-in">
            <div className="text-xs font-semibold text-white mb-2">Paste JSON</div>
            <textarea
              rows={4}
              placeholder="Paste backup JSON here..."
              className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-xs text-green-300 font-mono placeholder-white/20 outline-none resize-none mb-2"
              onBlur={e => {
                if (e.target.value.trim()) {
                  const r = importBackup(e.target.value);
                  if (r.ok) { toast.success(r.message); setTimeout(() => window.location.reload(), 500); }
                  else toast.error(r.message);
                }
              }}
            />
          </div>
        )}

        <button
          onClick={() => setImporting(i => !i)}
          className="w-full text-xs text-white/30 hover:text-white/50 py-1 transition-colors flex items-center justify-center gap-1"
        >
          <FileJson size={11} /> Paste JSON manually
        </button>

        {/* Danger zone */}
        <div className="glass rounded-xl p-3 border border-red-500/20">
          <div className="text-xs font-semibold text-red-400 mb-1">⚠ Danger Zone</div>
          <div className="text-xs text-white/40 mb-3">Permanently delete all stored data. This cannot be undone.</div>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="w-full flex items-center justify-center gap-1.5 bg-red-500/10 hover:bg-red-500/25 text-red-400 text-xs py-2 rounded-lg"
            >
              <Trash2 size={13} /> Clear All Data
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-red-300 text-center">Are you sure? This is irreversible.</div>
              <div className="flex gap-2">
                <button onClick={handleClearAll} className="flex-1 bg-red-500/30 hover:bg-red-500/50 text-red-200 text-xs py-1.5 rounded-lg">Yes, Delete All</button>
                <button onClick={() => setConfirmClear(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 text-xs py-1.5 rounded-lg">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackupManager;
