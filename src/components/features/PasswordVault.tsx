import { useState } from 'react';
import { Lock, Eye, EyeOff, Plus, Trash2, Copy, Edit2, Check, X, Globe, Wand2, RefreshCw } from 'lucide-react';
import { PasswordEntry } from '@/types';
import { getPasswords, savePassword, deletePassword, genId } from '@/lib/storage';
import { toast } from 'sonner';

const EMPTY: Omit<PasswordEntry, 'id' | 'createdAt'> = {
  title: '', username: '', password: '', url: '', notes: ''
};

// ─── Password Generator ───
interface GenOptions { length: number; upper: boolean; numbers: boolean; symbols: boolean; }

const genPassword = (opts: GenOptions): string => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const nums = '0123456789';
  const syms = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  let pool = lower;
  if (opts.upper) pool += upper;
  if (opts.numbers) pool += nums;
  if (opts.symbols) pool += syms;
  let result = '';
  for (let i = 0; i < opts.length; i++) result += pool[Math.floor(Math.random() * pool.length)];
  return result;
};

const PasswordGenerator = ({ onUse }: { onUse: (pw: string) => void }) => {
  const [opts, setOpts] = useState<GenOptions>({ length: 16, upper: true, numbers: true, symbols: true });
  const [generated, setGenerated] = useState(() => genPassword({ length: 16, upper: true, numbers: true, symbols: true }));

  const regenerate = () => setGenerated(genPassword(opts));

  const strength = () => {
    let score = 0;
    if (opts.length >= 12) score++;
    if (opts.length >= 20) score++;
    if (opts.upper) score++;
    if (opts.numbers) score++;
    if (opts.symbols) score++;
    return score;
  };
  const s = strength();
  const strengthLabel = s <= 2 ? 'Weak' : s <= 3 ? 'Fair' : s <= 4 ? 'Strong' : 'Very Strong';
  const strengthColor = s <= 2 ? 'text-red-400' : s <= 3 ? 'text-yellow-400' : s <= 4 ? 'text-green-400' : 'text-cyan-400';

  return (
    <div className="glass rounded-xl p-3 mb-3 fade-in border border-purple-500/20">
      <div className="text-xs font-semibold text-purple-300 mb-2 flex items-center gap-1"><Wand2 size={12} /> Password Generator</div>
      
      {/* Generated password display */}
      <div className="flex items-center gap-1.5 bg-black/30 rounded-lg px-2 py-2 mb-2">
        <span className="flex-1 font-mono text-xs text-green-300 break-all">{generated}</span>
        <button onClick={regenerate} className="p-1 text-white/30 hover:text-white">
          <RefreshCw size={11} />
        </button>
        <button
          onClick={() => { navigator.clipboard.writeText(generated); toast.success('Copied'); }}
          className="p-1 text-white/30 hover:text-cyan-400"
        >
          <Copy size={11} />
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-white/30">Strength:</span>
        <span className={`text-[10px] font-semibold ${strengthColor}`}>{strengthLabel}</span>
      </div>

      {/* Length slider */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-white/40 w-12">Length: {opts.length}</span>
        <input
          type="range" min={8} max={32} value={opts.length}
          onChange={e => { const v = { ...opts, length: +e.target.value }; setOpts(v); setGenerated(genPassword(v)); }}
          className="flex-1 accent-purple-500"
        />
      </div>

      {/* Options */}
      <div className="flex gap-2 flex-wrap mb-3">
        {[
          { key: 'upper' as keyof GenOptions, label: 'A-Z' },
          { key: 'numbers' as keyof GenOptions, label: '0-9' },
          { key: 'symbols' as keyof GenOptions, label: '!@#' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { const v = { ...opts, [key]: !opts[key] }; setOpts(v); setGenerated(genPassword(v)); }}
            className={`text-[10px] px-2 py-1 rounded-lg transition-all ${opts[key] ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-white/40'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={() => onUse(generated)}
        className="w-full text-xs bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 py-1.5 rounded-lg flex items-center justify-center gap-1"
      >
        <Check size={12} /> Use This Password
      </button>
    </div>
  );
};

// ─── Main Component ───
const PasswordVault = () => {
  const [list, setList] = useState<PasswordEntry[]>(getPasswords);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

  const reload = () => setList(getPasswords());

  const handleSave = () => {
    if (!form.title || !form.password) {
      toast.error('Title and password are required');
      return;
    }
    const entry: PasswordEntry = {
      id: editId || genId(),
      createdAt: Date.now(),
      ...form,
    };
    savePassword(entry);
    reload();
    setAdding(false);
    setEditId(null);
    setForm({ ...EMPTY });
    setShowGenerator(false);
    toast.success(editId ? 'Updated' : 'Saved');
  };

  const handleEdit = (e: PasswordEntry) => {
    setForm({ title: e.title, username: e.username, password: e.password, url: e.url || '', notes: e.notes || '' });
    setEditId(e.id);
    setAdding(true);
    setShowGenerator(false);
  };

  const handleDelete = (id: string) => {
    deletePassword(id);
    reload();
    toast.success('Deleted');
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copied`));
  };

  const filtered = list.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-purple-400" />
          <span className="text-sm font-semibold text-white">Password Vault</span>
          <span className="text-xs bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full">{list.length}</span>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => setShowGenerator(g => !g)}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${showGenerator ? 'bg-purple-500/40 text-purple-200' : 'bg-white/5 hover:bg-white/10 text-white/50'}`}
          >
            <Wand2 size={11} />
          </button>
          <button
            onClick={() => { setAdding(true); setEditId(null); setForm({ ...EMPTY }); setShowGenerator(false); }}
            className="flex items-center gap-1 text-xs bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 px-2 py-1 rounded-lg transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 mb-3 outline-none focus:border-purple-500/50"
      />

      {/* Password Generator */}
      {showGenerator && <PasswordGenerator onUse={pw => { setForm(f => ({ ...f, password: pw })); setAdding(true); setShowGenerator(false); }} />}

      {/* Add/Edit Form */}
      {adding && (
        <div className="glass rounded-xl p-3 mb-3 fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-purple-300">{editId ? 'Edit Entry' : 'New Entry'}</div>
            <button
              onClick={() => setShowGenerator(g => !g)}
              className="text-[10px] flex items-center gap-1 text-purple-400/70 hover:text-purple-300"
            >
              <Wand2 size={10} /> Generate
            </button>
          </div>
          <div className="space-y-2">
            {(['title', 'username', 'password', 'url', 'notes'] as const).map(field => (
              <div key={field} className="relative">
                <input
                  type={field === 'password' ? 'password' : 'text'}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  value={form[field]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-purple-500/50"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1 bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 text-xs py-1.5 rounded-lg">
              <Check size={12} /> Save
            </button>
            <button onClick={() => { setAdding(false); setEditId(null); }} className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 text-xs px-3 py-1.5 rounded-lg">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filtered.length === 0 && (
          <div className="text-center text-white/30 text-xs py-8">
            <Lock size={28} className="mx-auto mb-2 opacity-30" />
            No passwords saved yet
          </div>
        )}
        {filtered.map(entry => (
          <div key={entry.id} className="glass rounded-xl p-3 fade-in">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  {entry.url ? (
                    <img src={`https://www.google.com/s2/favicons?domain=${entry.url}&sz=16`} className="w-4 h-4 rounded" onError={e => (e.currentTarget.style.display = 'none')} />
                  ) : <Globe size={12} className="text-white/30" />}
                  <span className="text-sm font-medium text-white truncate">{entry.title}</span>
                </div>
                <div className="text-xs text-white/50 truncate">{entry.username}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs text-white/40 font-mono">
                    {shown[entry.id] ? entry.password : '••••••••'}
                  </span>
                  <button onClick={() => setShown(s => ({ ...s, [entry.id]: !s[entry.id] }))} className="text-white/30 hover:text-white/60">
                    {shown[entry.id] ? <EyeOff size={10} /> : <Eye size={10} />}
                  </button>
                </div>
              </div>
              <div className="flex gap-1 ml-2">
                <button onClick={() => copyText(entry.password, 'Password')} className="p-1.5 rounded-lg bg-white/5 hover:bg-cyan-500/20 text-white/40 hover:text-cyan-400 transition-colors">
                  <Copy size={11} />
                </button>
                <button onClick={() => handleEdit(entry)} className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 text-white/40 hover:text-purple-400 transition-colors">
                  <Edit2 size={11} />
                </button>
                <button onClick={() => handleDelete(entry.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordVault;
