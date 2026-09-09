import { useState } from 'react';
import { ExternalLink, Plus, Trash2, Edit2, Globe, Check, X } from 'lucide-react';
import { QuickLink } from '@/types';
import { toast } from 'sonner';

const DEFAULT_LINKS: QuickLink[] = [
  { id: '1', name: 'WhatsApp', url: 'https://web.whatsapp.com', icon: '💬', color: 'bg-green-500/20' },
  { id: '2', name: 'YouTube', url: 'https://youtube.com', icon: '▶️', color: 'bg-red-500/20' },
  { id: '3', name: 'Facebook', url: 'https://facebook.com', icon: '👤', color: 'bg-blue-500/20' },
  { id: '4', name: 'Twitter / X', url: 'https://x.com', icon: '🐦', color: 'bg-sky-500/20' },
  { id: '5', name: 'Instagram', url: 'https://instagram.com', icon: '📸', color: 'bg-pink-500/20' },
  { id: '6', name: 'Telegram', url: 'https://web.telegram.org', icon: '✈️', color: 'bg-cyan-500/20' },
  { id: '7', name: 'TikTok', url: 'https://tiktok.com', icon: '🎵', color: 'bg-purple-500/20' },
  { id: '8', name: 'LinkedIn', url: 'https://linkedin.com', icon: '💼', color: 'bg-blue-700/20' },
  { id: '9', name: 'Gmail', url: 'https://mail.google.com', icon: '📧', color: 'bg-red-400/20' },
  { id: '10', name: 'Google', url: 'https://google.com', icon: '🔍', color: 'bg-yellow-500/20' },
  { id: '11', name: 'GitHub', url: 'https://github.com', icon: '🐙', color: 'bg-gray-500/20' },
  { id: '12', name: 'Reddit', url: 'https://reddit.com', icon: '🤖', color: 'bg-orange-500/20' },
];

const LINK_KEY = 'accessi_quicklinks';

const loadLinks = (): QuickLink[] => {
  try {
    const saved = localStorage.getItem(LINK_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_LINKS;
  } catch { return DEFAULT_LINKS; }
};

const saveLinks = (links: QuickLink[]) => {
  localStorage.setItem(LINK_KEY, JSON.stringify(links));
};

const EMPTY = { name: '', url: '', icon: '🔗', color: 'bg-purple-500/20' };

const QuickLinksPanel = () => {
  const [links, setLinks] = useState<QuickLink[]>(loadLinks);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);

  const reload = () => setLinks(loadLinks());

  const handleSave = () => {
    if (!form.name || !form.url) { toast.error('Name and URL required'); return; }
    let url = form.url;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    const entry: QuickLink = { id: editId || Date.now().toString(), ...form, url };
    const current = loadLinks();
    if (editId) {
      const updated = current.map(l => l.id === editId ? entry : l);
      saveLinks(updated);
    } else {
      saveLinks([entry, ...current]);
    }
    reload();
    setAdding(false);
    setEditId(null);
    setForm({ ...EMPTY });
    toast.success('Saved');
  };

  const handleDelete = (id: string) => {
    saveLinks(loadLinks().filter(l => l.id !== id));
    reload();
  };

  const handleOpen = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-sky-400" />
          <span className="text-sm font-semibold text-white">Quick Links</span>
          <span className="text-xs bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded-full">{links.length}</span>
        </div>
        <button
          onClick={() => { setAdding(true); setEditId(null); setForm({ ...EMPTY }); }}
          className="flex items-center gap-1 text-xs bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 px-2 py-1 rounded-lg"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {adding && (
        <div className="glass rounded-xl p-3 mb-3 fade-in">
          <div className="text-xs font-semibold text-sky-300 mb-2">{editId ? 'Edit Link' : 'New Link'}</div>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Icon (emoji)"
              value={form.icon}
              onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white text-center outline-none"
            />
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-sky-500/50"
            />
          </div>
          <input
            type="url"
            placeholder="URL (e.g. https://example.com)"
            value={form.url}
            onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30 mb-2 outline-none focus:border-sky-500/50"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1 bg-sky-500/30 hover:bg-sky-500/50 text-sky-200 text-xs py-1.5 rounded-lg">
              <Check size={12} /> Save
            </button>
            <button onClick={() => { setAdding(false); setEditId(null); }} className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 px-2 py-1.5 rounded-lg">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-3 gap-2">
          {links.map(link => (
            <div key={link.id} className="glass rounded-xl p-2 flex flex-col items-center gap-1 relative group fade-in">
              <button
                onClick={() => handleOpen(link.url)}
                className="flex flex-col items-center gap-1 w-full"
              >
                <div className={`w-10 h-10 rounded-xl ${link.color} flex items-center justify-center text-lg`}>
                  {link.icon}
                </div>
                <span className="text-xs text-white/80 text-center leading-tight line-clamp-1">{link.name}</span>
              </button>
              <div className="absolute top-1 right-1 hidden group-hover:flex gap-0.5">
                <button onClick={() => { handleDelete(link.id); }} className="p-0.5 rounded bg-red-500/20 text-red-400">
                  <Trash2 size={8} />
                </button>
              </div>
              <ExternalLink size={8} className="text-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickLinksPanel;
