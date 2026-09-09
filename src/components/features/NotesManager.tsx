import { useState, useMemo } from 'react';
import {
  StickyNote, FolderPlus, Plus, Trash2, Edit2, Check, X, Search,
  ChevronRight, ChevronDown, Folder, Pin, Tag, ArrowLeft, Type
} from 'lucide-react';
import { Note, NoteFolder } from '@/types';
import { getNotes, getFolders, saveNote, deleteNote, saveFolder, deleteFolder, genId } from '@/lib/storage';
import RichTextEditor from './RichTextEditor';
import { toast } from 'sonner';

const NOTE_COLORS = [
  'border-purple-500/40 bg-purple-500/5',
  'border-cyan-500/40 bg-cyan-500/5',
  'border-yellow-500/40 bg-yellow-500/5',
  'border-green-500/40 bg-green-500/5',
  'border-pink-500/40 bg-pink-500/5',
  'border-orange-500/40 bg-orange-500/5',
];

const FOLDER_COLORS = ['text-purple-400', 'text-cyan-400', 'text-yellow-400', 'text-green-400', 'text-pink-400', 'text-orange-400'];

const NotesManager = () => {
  const [notes, setNotes] = useState<Note[]>(getNotes);
  const [folders, setFolders] = useState<NoteFolder[]>(getFolders);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null | 'all'>('all');
  const [editing, setEditing] = useState<Note | null>(null);
  const [addingFolder, setAddingFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState(0);
  const [folderParent, setFolderParent] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [useRichEditor, setUseRichEditor] = useState(false);

  const reload = () => { setNotes(getNotes()); setFolders(getFolders()); };

  const createNote = (folderId: string | null = null) => {
    const note: Note = {
      id: genId(),
      folderId: folderId ?? (selectedFolderId === 'all' ? null : selectedFolderId as string | null),
      title: '', content: '', pinned: false, color: NOTE_COLORS[0], tags: [],
      createdAt: Date.now(), updatedAt: Date.now(),
    };
    setEditing(note);
  };

  const handleSaveNote = () => {
    if (!editing) return;
    if (!editing.title.trim() && !editing.content.trim()) { toast.error('Note is empty'); return; }
    saveNote({ ...editing, updatedAt: Date.now() });
    reload();
    setEditing(null);
    toast.success('Note saved');
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    reload();
    toast.success('Deleted');
  };

  const handleSaveFolder = () => {
    if (!folderName.trim()) { toast.error('Folder name required'); return; }
    saveFolder({
      id: genId(), name: folderName.trim(), parentId: folderParent,
      color: FOLDER_COLORS[folderColor], createdAt: Date.now(),
    });
    reload();
    setAddingFolder(false);
    setFolderName('');
    toast.success('Folder created');
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const filteredNotes = useMemo(() => {
    let list = notes;
    if (search) {
      list = list.filter(n =>
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase()) ||
        n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      );
    } else if (selectedFolderId !== 'all') {
      list = list.filter(n => n.folderId === selectedFolderId);
    }
    return [...list.filter(n => n.pinned), ...list.filter(n => !n.pinned)];
  }, [notes, selectedFolderId, search]);

  // ── Note Editor ──
  if (editing) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white">
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setUseRichEditor(r => !r)}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${useRichEditor ? 'bg-purple-500/30 text-purple-300' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              <Type size={11} /> Rich
            </button>
            <button
              onClick={() => setEditing(e => e ? { ...e, pinned: !e.pinned } : e)}
              className={`p-1.5 rounded-lg text-xs transition-colors ${editing.pinned ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-white/40 hover:text-yellow-400'}`}
            >
              <Pin size={12} />
            </button>
            <button onClick={handleSaveNote} className="flex items-center gap-1 bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 text-xs px-3 py-1.5 rounded-lg">
              <Check size={12} /> Save
            </button>
          </div>
        </div>

        {/* Color picker */}
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {NOTE_COLORS.map((c, i) => (
            <button
              key={i}
              onClick={() => setEditing(e => e ? { ...e, color: c } : e)}
              className={`w-6 h-6 rounded-full border-2 transition-all ${c} ${editing.color === c ? 'scale-125 border-white/60' : 'border-transparent'}`}
            />
          ))}
        </div>

        <input
          type="text"
          placeholder="Note title..."
          value={editing.title}
          onChange={e => setEditing(ed => ed ? { ...ed, title: e.target.value } : ed)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm font-semibold text-white placeholder-white/30 mb-2 outline-none focus:border-purple-500/50"
        />

        {/* Folder selector */}
        <select
          value={editing.folderId ?? ''}
          onChange={e => setEditing(ed => ed ? { ...ed, folderId: e.target.value || null } : ed)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white mb-2 outline-none focus:border-purple-500/50"
        >
          <option value="" className="bg-[#1a1a2e]">No folder</option>
          {folders.map(f => <option key={f.id} value={f.id} className="bg-[#1a1a2e]">{f.name}</option>)}
        </select>

        {/* Editor — Rich or Plain */}
        {useRichEditor ? (
          <div className="flex-1 overflow-hidden mb-2">
            <RichTextEditor
              value={editing.content}
              onChange={html => setEditing(ed => ed ? { ...ed, content: html } : ed)}
              placeholder="Start writing your note..."
              minHeight="120px"
            />
          </div>
        ) : (
          <textarea
            placeholder="Start writing your note..."
            value={editing.content}
            onChange={e => setEditing(ed => ed ? { ...ed, content: e.target.value } : ed)}
            className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500/50 resize-none leading-relaxed mb-2"
          />
        )}

        {/* Tags */}
        <input
          type="text"
          placeholder="Tags (comma separated)"
          value={editing.tags.join(', ')}
          onChange={e => setEditing(ed => ed ? { ...ed, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } : ed)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-purple-500/50"
        />
      </div>
    );
  }

  // ── List View ──
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StickyNote size={16} className="text-yellow-400" />
          <span className="text-sm font-semibold text-white">Notes</span>
          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-1.5 py-0.5 rounded-full">{notes.length}</span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => setAddingFolder(true)} className="flex items-center gap-1 text-xs bg-white/5 hover:bg-white/10 text-white/50 px-2 py-1 rounded-lg">
            <FolderPlus size={11} />
          </button>
          <button onClick={() => createNote()} className="flex items-center gap-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-300 px-2 py-1 rounded-lg">
            <Plus size={12} /> Note
          </button>
        </div>
      </div>

      <div className="relative mb-3">
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-7 pr-3 py-2 text-xs text-white placeholder-white/30 outline-none focus:border-yellow-500/50"
        />
      </div>

      {addingFolder && (
        <div className="glass rounded-xl p-3 mb-3 fade-in">
          <div className="text-xs font-semibold text-yellow-300 mb-2">New Folder</div>
          <input
            type="text"
            placeholder="Folder name"
            value={folderName}
            onChange={e => setFolderName(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30 mb-2 outline-none"
          />
          <div className="flex gap-1.5 mb-2">
            {FOLDER_COLORS.map((c, i) => (
              <button key={i} onClick={() => setFolderColor(i)} className={`w-5 h-5 rounded-full ${c} border-2 transition-all ${folderColor === i ? 'border-white scale-125' : 'border-transparent'} flex items-center justify-center`}>
                <div className="w-3 h-3 rounded-full bg-current opacity-70" />
              </button>
            ))}
          </div>
          <select
            value={folderParent ?? ''}
            onChange={e => setFolderParent(e.target.value || null)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white mb-2 outline-none"
          >
            <option value="" className="bg-[#1a1a2e]">Root (no parent)</option>
            {folders.filter(f => f.parentId === null).map(f => (
              <option key={f.id} value={f.id} className="bg-[#1a1a2e]">{f.name}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button onClick={handleSaveFolder} className="flex-1 flex items-center justify-center gap-1 bg-yellow-500/30 hover:bg-yellow-500/50 text-yellow-200 text-xs py-1.5 rounded-lg">
              <Check size={12} /> Create
            </button>
            <button onClick={() => setAddingFolder(false)} className="bg-white/5 hover:bg-white/10 text-white/60 px-3 py-1.5 rounded-lg">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-1">
        {folders.length > 0 && !search && (
          <div className="mb-3">
            <div className="text-xs text-white/30 uppercase tracking-wider mb-1.5 px-1">Folders</div>
            <button
              onClick={() => setSelectedFolderId('all')}
              className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs mb-1 transition-colors ${selectedFolderId === 'all' ? 'bg-yellow-500/20 text-yellow-300' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <StickyNote size={12} /> All Notes
              <span className="ml-auto text-white/30">{notes.length}</span>
            </button>
            {folders.filter(f => f.parentId === null).map(folder => {
              const subFolders = folders.filter(f => f.parentId === folder.id);
              const noteCount = notes.filter(n => n.folderId === folder.id).length;
              const isExpanded = expandedFolders.has(folder.id);
              return (
                <div key={folder.id}>
                  <div className={`flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg text-xs transition-colors ${selectedFolderId === folder.id ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
                    {subFolders.length > 0 && (
                      <button onClick={() => toggleFolder(folder.id)} className="flex-shrink-0">
                        {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                      </button>
                    )}
                    <button onClick={() => setSelectedFolderId(folder.id)} className="flex items-center gap-1.5 flex-1 min-w-0">
                      <Folder size={12} className={folder.color} />
                      <span className="truncate">{folder.name}</span>
                      <span className="ml-auto text-white/30">{noteCount}</span>
                    </button>
                    <button onClick={() => { deleteFolder(folder.id); reload(); }} className="text-red-400/50 hover:text-red-400 flex-shrink-0">
                      <Trash2 size={9} />
                    </button>
                  </div>
                  {isExpanded && subFolders.map(sf => (
                    <button
                      key={sf.id}
                      onClick={() => setSelectedFolderId(sf.id)}
                      className={`flex items-center gap-1.5 w-full pl-6 pr-2 py-1.5 rounded-lg text-xs transition-colors ${selectedFolderId === sf.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                    >
                      <Folder size={10} className={sf.color} />
                      <span className="truncate">{sf.name}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {filteredNotes.length === 0 ? (
          <div className="text-center text-white/30 text-xs py-8">
            <StickyNote size={28} className="mx-auto mb-2 opacity-30" />
            No notes yet
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map(note => (
              <div key={note.id} className={`rounded-xl p-3 border fade-in ${note.color}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {note.pinned && <Pin size={9} className="text-yellow-400 flex-shrink-0" />}
                      <span className="text-sm font-semibold text-white truncate">{note.title || 'Untitled'}</span>
                    </div>
                    <div
                      className="text-xs text-white/50 line-clamp-2 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: note.content.replace(/<[^>]*>/g, ' ').slice(0, 120) }}
                    />
                    {note.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-1.5">
                        {note.tags.map(t => (
                          <span key={t} className="text-[10px] bg-white/10 text-white/50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Tag size={7} />{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => setEditing(note)} className="p-1.5 rounded-lg bg-white/5 hover:bg-yellow-500/20 text-white/40 hover:text-yellow-400 transition-colors">
                      <Edit2 size={11} />
                    </button>
                    <button onClick={() => handleDeleteNote(note.id)} className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
                <div className="text-[10px] text-white/20 mt-1.5">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesManager;
