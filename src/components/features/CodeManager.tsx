import { useState } from 'react';
import { Code2, Plus, Trash2, Copy, Edit2, Check, X, Search } from 'lucide-react';
import { CodeSnippet } from '@/types';
import { getSnippets, saveSnippet, deleteSnippet, genId } from '@/lib/storage';
import { toast } from 'sonner';

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'SQL', 'Bash', 'JSON', 'PHP', 'Other'];

const LANG_COLORS: Record<string, string> = {
  JavaScript: 'text-yellow-400', TypeScript: 'text-blue-400', Python: 'text-green-400',
  HTML: 'text-orange-400', CSS: 'text-pink-400', SQL: 'text-cyan-400',
  Bash: 'text-gray-400', JSON: 'text-purple-400', PHP: 'text-indigo-400', Other: 'text-white/40',
};

const EMPTY = { title: '', code: '', language: 'JavaScript', description: '' };

const CodeManager = () => {
  const [list, setList] = useState<CodeSnippet[]>(getSnippets);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const reload = () => setList(getSnippets());

  const handleSave = () => {
    if (!form.title || !form.code) { toast.error('Title and code required'); return; }
    const entry: CodeSnippet = { id: editId || genId(), createdAt: Date.now(), ...form };
    saveSnippet(entry);
    reload();
    setAdding(false);
    setEditId(null);
    setForm({ ...EMPTY });
    toast.success(editId ? 'Updated' : 'Saved');
  };

  const handleEdit = (s: CodeSnippet) => {
    setForm({ title: s.title, code: s.code, language: s.language, description: s.description || '' });
    setEditId(s.id);
    setAdding(true);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).then(() => toast.success('Code copied'));
  };

  const filtered = list.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.language.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Code2 size={16} className="text-green-400" />
          <span className="text-sm font-semibold text-white">Code Snippets</span>
          <span className="text-xs bg-green-500/20 text-green-300 px-1.5 py-0.5 rounded-full">{list.length}</span>
        </div>
        <button
          onClick={() => { setAdding(true); setEditId(null); setForm({ ...EMPTY }); }}
          className="flex items-center gap-1 text-xs bg-green-500/20 hover:bg-green-500/40 text-green-300 px-2 py-1 rounded-lg transition-colors"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      <div className="relative mb-3">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search snippets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-green-500/50"
        />
      </div>

      {adding && (
        <div className="glass rounded-xl p-3 mb-3 fade-in">
          <div className="text-xs font-semibold text-green-300 mb-2">{editId ? 'Edit Snippet' : 'New Snippet'}</div>
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30 mb-2 outline-none focus:border-green-500/50"
          />
          <select
            value={form.language}
            onChange={e => setForm(f => ({ ...f, language: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white mb-2 outline-none focus:border-green-500/50"
          >
            {LANGUAGES.map(l => <option key={l} value={l} className="bg-[#1a1a2e]">{l}</option>)}
          </select>
          <textarea
            placeholder="Paste your code here..."
            value={form.code}
            onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
            rows={4}
            className="w-full bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-green-300 font-mono placeholder-white/20 mb-2 outline-none focus:border-green-500/50 resize-none"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30 mb-2 outline-none focus:border-green-500/50"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1 bg-green-500/30 hover:bg-green-500/50 text-green-200 text-xs py-1.5 rounded-lg">
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
            <Code2 size={28} className="mx-auto mb-2 opacity-30" />
            No snippets saved yet
          </div>
        )}
        {filtered.map(entry => (
          <div key={entry.id} className="glass rounded-xl p-2.5 fade-in">
            <div className="flex items-start justify-between mb-1">
              <div>
                <span className="text-sm font-medium text-white">{entry.title}</span>
                <span className={`ml-2 text-xs font-mono ${LANG_COLORS[entry.language] || 'text-white/40'}`}>{entry.language}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => handleCopy(entry.code)} className="p-1 rounded bg-white/5 hover:bg-green-500/20 text-white/40 hover:text-green-400">
                  <Copy size={10} />
                </button>
                <button onClick={() => handleEdit(entry)} className="p-1 rounded bg-white/5 hover:bg-purple-500/20 text-white/40 hover:text-purple-400">
                  <Edit2 size={10} />
                </button>
                <button onClick={() => deleteSnippet(entry.id) || reload()} className="p-1 rounded bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400">
                  <Trash2 size={10} />
                </button>
              </div>
            </div>
            {entry.description && <div className="text-xs text-white/40 mb-1">{entry.description}</div>}
            <div
              className="bg-black/40 rounded-lg p-2 cursor-pointer overflow-hidden"
              onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
            >
              <pre className={`text-xs text-green-300 font-mono whitespace-pre-wrap break-all ${expanded === entry.id ? '' : 'line-clamp-2'}`}>
                {entry.code}
              </pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeManager;
