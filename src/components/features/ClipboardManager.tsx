import { useState } from 'react';
import { Clipboard, Plus, Trash2, Copy, Pin, Search, Check, X, Link, Mail, Type } from 'lucide-react';
import { ClipboardEntry } from '@/types';
import { getClipboard, saveClip, deleteClip, togglePinClip, genId, detectType } from '@/lib/storage';
import ClipboardAutoDetect from './ClipboardAutoDetect';
import { toast } from 'sonner';

const TYPE_ICONS = {
  url: <Link size={10} className="text-cyan-400" />,
  email: <Mail size={10} className="text-green-400" />,
  text: <Type size={10} className="text-purple-400" />,
  other: <Type size={10} className="text-white/40" />,
};

const ClipboardManager = () => {
  const [list, setList] = useState<ClipboardEntry[]>(() => {
    const all = getClipboard();
    return [...all.filter(c => c.pinned), ...all.filter(c => !c.pinned)];
  });
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  const [label, setLabel] = useState('');
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const reload = () => {
    const all = getClipboard();
    setList([...all.filter(c => c.pinned), ...all.filter(c => !c.pinned)]);
  };

  const handlePaste = async () => {
    try {
      const txt = await navigator.clipboard.readText();
      setText(txt);
    } catch {
      toast.error('Clipboard access denied');
    }
  };

  const handleSave = () => {
    if (!text.trim()) { toast.error('Content required'); return; }
    const entry: ClipboardEntry = {
      id: editId || genId(),
      content: text.trim(),
      label: label.trim() || undefined,
      type: detectType(text.trim()),
      createdAt: Date.now(),
      pinned: false,
    };
    saveClip(entry);
    reload();
    setAdding(false);
    setEditId(null);
    setText('');
    setLabel('');
    toast.success('Saved');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content).then(() => toast.success('Copied'));
  };

  const handlePin = (id: string) => {
    togglePinClip(id);
    reload();
  };

  const handleDelete = (id: string) => {
    deleteClip(id);
    reload();
  };

  const filtered = list.filter(c =>
    c.content.toLowerCase().includes(search.toLowerCase()) ||
    (c.label || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clipboard size={16} className="text-cyan-400" />
          <span className="text-sm font-semibold text-white">Clipboard</span>
          <span className="text-xs bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full">{list.length}</span>
        </div>
        <button
          onClick={() => { setAdding(true); setEditId(null); setText(''); setLabel(''); }}
          className="flex items-center gap-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 px-2 py-1 rounded-lg transition-colors"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {/* Auto-detect from clipboard */}
      <ClipboardAutoDetect onSaved={reload} />

      <div className="relative mb-3">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search clips..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-cyan-500/50"
        />
      </div>

      {adding && (
        <div className="glass rounded-xl p-3 mb-3 fade-in">
          <div className="text-xs font-semibold text-cyan-300 mb-2">{editId ? 'Edit Clip' : 'New Clip'}</div>
          <input
            type="text"
            placeholder="Label (optional)"
            value={label}
            onChange={e => setLabel(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30 mb-2 outline-none focus:border-cyan-500/50"
          />
          <textarea
            placeholder="Paste or type content here..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30 mb-2 outline-none focus:border-cyan-500/50 resize-none"
          />
          <div className="flex gap-2">
            <button onClick={handlePaste} className="flex items-center gap-1 text-xs bg-white/5 hover:bg-white/10 text-white/60 px-2 py-1.5 rounded-lg">
              <Clipboard size={11} /> Paste
            </button>
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1 bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-200 text-xs py-1.5 rounded-lg">
              <Check size={12} /> Save
            </button>
            <button onClick={() => { setAdding(false); setEditId(null); }} className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 px-2 py-1.5 rounded-lg">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 && (
          <div className="text-center text-white/30 text-xs py-8">
            <Clipboard size={28} className="mx-auto mb-2 opacity-30" />
            No clips saved yet
          </div>
        )}
        {filtered.map(entry => (
          <div key={entry.id} className={`glass rounded-xl p-2.5 fade-in ${entry.pinned ? 'border-cyan-500/30' : ''}`}>
            <div className="flex items-start gap-2">
              <div className="mt-0.5">{TYPE_ICONS[entry.type]}</div>
              <div className="flex-1 min-w-0">
                {entry.label && <div className="text-xs font-medium text-cyan-300 mb-0.5">{entry.label}</div>}
                <div className="text-xs text-white/70 break-all line-clamp-3">{entry.content}</div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => handleCopy(entry.content)} className="p-1 rounded bg-white/5 hover:bg-cyan-500/20 text-white/40 hover:text-cyan-400">
                  <Copy size={10} />
                </button>
                <button onClick={() => handlePin(entry.id)} className={`p-1 rounded bg-white/5 text-white/40 transition-colors ${entry.pinned ? 'text-yellow-400 bg-yellow-500/10' : 'hover:bg-yellow-500/10 hover:text-yellow-400'}`}>
                  <Pin size={10} />
                </button>
                <button onClick={() => handleDelete(entry.id)} className="p-1 rounded bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400">
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClipboardManager;
