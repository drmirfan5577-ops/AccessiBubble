import { useState, useRef, useEffect, useCallback } from 'react';
import {
  LayoutGrid, Columns, Rows, Grid2X2, Square, RefreshCw, ExternalLink,
  Bookmark, BookmarkCheck, Clock, X, Star, ArrowLeft, ArrowRight,
  ChevronDown, Plus
} from 'lucide-react';
import { SplitMode, SplitPane } from '@/types';
import { genId } from '@/lib/storage';
import { toast } from 'sonner';

const QUICK_SITES = [
  { label: 'Google', url: 'https://www.google.com/webhp?igu=1' },
  { label: 'Wikipedia', url: 'https://en.m.wikipedia.org/wiki/Main_Page' },
  { label: 'YouTube', url: 'https://m.youtube.com' },
  { label: 'News', url: 'https://news.google.com/topstories' },
  { label: 'Maps', url: 'https://maps.google.com' },
  { label: 'Translate', url: 'https://translate.google.com' },
];

const MODE_OPTIONS: { mode: SplitMode; icon: React.ReactNode; label: string }[] = [
  { mode: '1', icon: <Square size={13} />, label: 'Full' },
  { mode: '2h', icon: <Columns size={13} />, label: '2 Side' },
  { mode: '2v', icon: <Rows size={13} />, label: '2 Top' },
  { mode: '3', icon: <LayoutGrid size={13} />, label: '3 Pan' },
  { mode: '4', icon: <Grid2X2 size={13} />, label: '4 Pan' },
];

const defaultPane = (): SplitPane => ({ id: genId(), url: '', title: 'New Pane', bookmarks: [], history: [] });

const getPaneCount = (m: SplitMode) => ({ '1': 1, '2h': 2, '2v': 2, '3': 3, '4': 4 }[m]);

// ─── Individual Web Pane ───
const WebPane = ({
  pane,
  onUrlChange,
  onUpdatePane,
}: {
  pane: SplitPane;
  onUrlChange: (url: string) => void;
  onUpdatePane: (updated: SplitPane) => void;
}) => {
  const [inputUrl, setInputUrl] = useState(pane.url);
  const [loaded, setLoaded] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => { setInputUrl(pane.url); }, [pane.url]);

  const navigate = (url?: string) => {
    let target = (url ?? inputUrl).trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
    setInputUrl(target);
    onUrlChange(target);
    setLoaded(false);
    setShowBookmarks(false);
    setShowHistory(false);
    // Add to history
    const history = [{ url: target, visitedAt: Date.now() }, ...pane.history.filter(h => h.url !== target)].slice(0, 20);
    onUpdatePane({ ...pane, url: target, history });
  };

  const addBookmark = () => {
    if (!pane.url) return;
    const label = pane.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    const exists = pane.bookmarks.some(b => b.url === pane.url);
    if (exists) {
      onUpdatePane({ ...pane, bookmarks: pane.bookmarks.filter(b => b.url !== pane.url) });
      toast.success('Bookmark removed');
    } else {
      onUpdatePane({ ...pane, bookmarks: [{ url: pane.url, label }, ...pane.bookmarks].slice(0, 20) });
      toast.success('Bookmarked');
    }
  };

  const isBookmarked = pane.bookmarks.some(b => b.url === pane.url);

  return (
    <div className="flex flex-col h-full bg-black/40 rounded-xl overflow-hidden border border-white/5">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-1.5 bg-black/40 border-b border-white/5">
        <input
          type="text"
          value={inputUrl}
          onChange={e => setInputUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && navigate()}
          placeholder="Enter URL or search..."
          className="flex-1 bg-white/5 rounded-lg px-2 py-1 text-[11px] text-white placeholder-white/20 outline-none"
        />
        <button onClick={() => navigate()} className="p-1 bg-purple-500/20 hover:bg-purple-500/40 rounded text-purple-300 transition-colors">
          <RefreshCw size={9} />
        </button>
        <button
          onClick={addBookmark}
          className={`p-1 rounded transition-colors ${isBookmarked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 hover:bg-white/10 text-white/30 hover:text-yellow-400'}`}
          title="Bookmark"
        >
          {isBookmarked ? <BookmarkCheck size={9} /> : <Bookmark size={9} />}
        </button>
        <button
          onClick={() => { setShowHistory(h => !h); setShowBookmarks(false); }}
          className={`p-1 rounded transition-colors ${showHistory ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-white/30 hover:text-cyan-400'}`}
          title="History"
        >
          <Clock size={9} />
        </button>
        <button
          onClick={() => { setShowBookmarks(b => !b); setShowHistory(false); }}
          className={`p-1 rounded transition-colors ${showBookmarks ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/5 text-white/30 hover:text-yellow-400'}`}
          title="Bookmarks"
        >
          <Star size={9} />
        </button>
        <button
          onClick={() => pane.url && window.open(pane.url, '_blank', 'noopener,noreferrer')}
          className="p-1 bg-white/5 hover:bg-white/10 rounded text-white/30 hover:text-white"
          title="Open in browser"
        >
          <ExternalLink size={9} />
        </button>
      </div>

      {/* Bookmarks dropdown */}
      {showBookmarks && pane.bookmarks.length > 0 && (
        <div className="bg-black/60 border-b border-white/5 p-2 max-h-32 overflow-y-auto fade-in">
          <div className="text-[10px] text-yellow-400/70 mb-1.5 flex items-center gap-1"><Star size={9} /> Bookmarks</div>
          <div className="space-y-1">
            {pane.bookmarks.map((b, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <button
                  onClick={() => navigate(b.url)}
                  className="flex-1 text-left text-[10px] text-white/60 hover:text-white truncate"
                >
                  {b.label}
                </button>
                <button
                  onClick={() => onUpdatePane({ ...pane, bookmarks: pane.bookmarks.filter((_, idx) => idx !== i) })}
                  className="text-red-400/50 hover:text-red-400"
                >
                  <X size={8} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History dropdown */}
      {showHistory && pane.history.length > 0 && (
        <div className="bg-black/60 border-b border-white/5 p-2 max-h-32 overflow-y-auto fade-in">
          <div className="text-[10px] text-cyan-400/70 mb-1.5 flex items-center gap-1"><Clock size={9} /> Recent</div>
          <div className="space-y-1">
            {pane.history.slice(0, 10).map((h, i) => (
              <button
                key={i}
                onClick={() => navigate(h.url)}
                className="block w-full text-left text-[10px] text-white/50 hover:text-white truncate"
              >
                {h.url.replace(/^https?:\/\//, '')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick sites (when no URL) */}
      {!pane.url && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-3">
          <div className="text-xs text-white/30 mb-1">Quick Open</div>
          <div className="grid grid-cols-3 gap-1.5 w-full">
            {QUICK_SITES.map(s => (
              <button
                key={s.label}
                onClick={() => navigate(s.url)}
                className="glass rounded-lg py-2 text-[11px] text-white/60 hover:text-white transition-colors hover:bg-white/10"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* iframe */}
      {pane.url && (
        <div className="flex-1 relative">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
              <div className="text-xs text-white/40 flex flex-col items-center gap-2">
                <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                Loading...
              </div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={pane.url}
            className="w-full h-full border-0"
            onLoad={() => setLoaded(true)}
            onError={() => { setLoaded(true); }}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-pointer-lock"
            title={`Pane: ${pane.url}`}
          />
        </div>
      )}
    </div>
  );
};

// ─── Resizable Divider ───
const HDivider = ({ onDrag }: { onDrag: (delta: number) => void }) => {
  const dragging = useRef(false);
  const lastX = useRef(0);

  return (
    <div
      className="w-2 flex-shrink-0 cursor-col-resize flex items-center justify-center group"
      onPointerDown={e => { dragging.current = true; lastX.current = e.clientX; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
      onPointerMove={e => { if (!dragging.current) return; onDrag(e.clientX - lastX.current); lastX.current = e.clientX; }}
      onPointerUp={() => { dragging.current = false; }}
    >
      <div className="w-0.5 h-8 bg-white/10 group-hover:bg-purple-400/50 rounded-full transition-colors" />
    </div>
  );
};

const VDivider = ({ onDrag }: { onDrag: (delta: number) => void }) => {
  const dragging = useRef(false);
  const lastY = useRef(0);

  return (
    <div
      className="h-2 flex-shrink-0 cursor-row-resize flex justify-center items-center group w-full"
      onPointerDown={e => { dragging.current = true; lastY.current = e.clientY; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
      onPointerMove={e => { if (!dragging.current) return; onDrag(e.clientY - lastY.current); lastY.current = e.clientY; }}
      onPointerUp={() => { dragging.current = false; }}
    >
      <div className="h-0.5 w-8 bg-white/10 group-hover:bg-purple-400/50 rounded-full transition-colors" />
    </div>
  );
};

// ─── Main Manager ───
const SplitScreenManager = () => {
  const [mode, setMode] = useState<SplitMode>('2h');
  const [panes, setPanes] = useState<SplitPane[]>([defaultPane(), defaultPane(), defaultPane(), defaultPane()]);
  // sizes[0] = left col %, sizes[1] = top row % for 2v
  const [hSplit, setHSplit] = useState(50); // left column %
  const [vSplit, setVSplit] = useState(50); // top row %
  const containerRef = useRef<HTMLDivElement>(null);

  const updatePane = (id: string, updated: Partial<SplitPane>) => {
    setPanes(ps => ps.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const count = getPaneCount(mode);
  const activePanes = panes.slice(0, count);

  const handleHDrag = (delta: number) => {
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    setHSplit(s => Math.max(20, Math.min(80, s + (delta / w) * 100)));
  };

  const handleVDrag = (delta: number) => {
    if (!containerRef.current) return;
    const h = containerRef.current.offsetHeight;
    setVSplit(s => Math.max(20, Math.min(80, s + (delta / h) * 100)));
  };

  const renderPanes = () => {
    const p = activePanes;

    if (mode === '1') {
      return (
        <WebPane pane={p[0]} onUrlChange={u => updatePane(p[0].id, { url: u })} onUpdatePane={up => setPanes(ps => ps.map(x => x.id === up.id ? up : x))} />
      );
    }

    if (mode === '2h') {
      return (
        <div className="flex h-full gap-0">
          <div style={{ width: `${hSplit}%` }} className="flex-shrink-0 h-full">
            <WebPane pane={p[0]} onUrlChange={u => updatePane(p[0].id, { url: u })} onUpdatePane={up => setPanes(ps => ps.map(x => x.id === up.id ? up : x))} />
          </div>
          <HDivider onDrag={handleHDrag} />
          <div className="flex-1 h-full">
            <WebPane pane={p[1]} onUrlChange={u => updatePane(p[1].id, { url: u })} onUpdatePane={up => setPanes(ps => ps.map(x => x.id === up.id ? up : x))} />
          </div>
        </div>
      );
    }

    if (mode === '2v') {
      return (
        <div className="flex flex-col h-full gap-0">
          <div style={{ height: `${vSplit}%` }} className="flex-shrink-0 w-full">
            <WebPane pane={p[0]} onUrlChange={u => updatePane(p[0].id, { url: u })} onUpdatePane={up => setPanes(ps => ps.map(x => x.id === up.id ? up : x))} />
          </div>
          <VDivider onDrag={handleVDrag} />
          <div className="flex-1 w-full">
            <WebPane pane={p[1]} onUrlChange={u => updatePane(p[1].id, { url: u })} onUpdatePane={up => setPanes(ps => ps.map(x => x.id === up.id ? up : x))} />
          </div>
        </div>
      );
    }

    if (mode === '3') {
      return (
        <div className="flex flex-col h-full gap-0">
          <div style={{ height: `${vSplit}%` }} className="flex flex-shrink-0 w-full gap-0">
            <div style={{ width: `${hSplit}%` }} className="flex-shrink-0 h-full">
              <WebPane pane={p[0]} onUrlChange={u => updatePane(p[0].id, { url: u })} onUpdatePane={up => setPanes(ps => ps.map(x => x.id === up.id ? up : x))} />
            </div>
            <HDivider onDrag={handleHDrag} />
            <div className="flex-1 h-full">
              <WebPane pane={p[1]} onUrlChange={u => updatePane(p[1].id, { url: u })} onUpdatePane={up => setPanes(ps => ps.map(x => x.id === up.id ? up : x))} />
            </div>
          </div>
          <VDivider onDrag={handleVDrag} />
          <div className="flex-1 w-full">
            <WebPane pane={p[2]} onUrlChange={u => updatePane(p[2].id, { url: u })} onUpdatePane={up => setPanes(ps => ps.map(x => x.id === up.id ? up : x))} />
          </div>
        </div>
      );
    }

    // 4 panes
    return (
      <div className="flex flex-col h-full gap-0">
        <div style={{ height: `${vSplit}%` }} className="flex flex-shrink-0 w-full gap-0">
          <div style={{ width: `${hSplit}%` }} className="h-full flex-shrink-0">
            <WebPane pane={p[0]} onUrlChange={u => updatePane(p[0].id, { url: u })} onUpdatePane={up => setPanes(ps => ps.map(x => x.id === up.id ? up : x))} />
          </div>
          <HDivider onDrag={handleHDrag} />
          <div className="flex-1 h-full">
            <WebPane pane={p[1]} onUrlChange={u => updatePane(p[1].id, { url: u })} onUpdatePane={up => setPanes(ps => ps.map(x => x.id === up.id ? up : x))} />
          </div>
        </div>
        <VDivider onDrag={handleVDrag} />
        <div className="flex-1 w-full flex gap-0">
          <div style={{ width: `${hSplit}%` }} className="flex-shrink-0 h-full">
            <WebPane pane={p[2]} onUrlChange={u => updatePane(p[2].id, { url: u })} onUpdatePane={up => setPanes(ps => ps.map(x => x.id === up.id ? up : x))} />
          </div>
          <HDivider onDrag={handleHDrag} />
          <div className="flex-1 h-full">
            <WebPane pane={p[3]} onUrlChange={u => updatePane(p[3].id, { url: u })} onUpdatePane={up => setPanes(ps => ps.map(x => x.id === up.id ? up : x))} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mode selector */}
      <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1">
        {MODE_OPTIONS.map(opt => (
          <button
            key={opt.mode}
            onClick={() => setMode(opt.mode)}
            className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              mode === opt.mode
                ? 'bg-purple-500/40 text-purple-200 border border-purple-500/50'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            }`}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
        <div className="ml-auto text-[10px] text-white/20 whitespace-nowrap">Drag ↔ divider to resize</div>
      </div>

      {/* Pane grid */}
      <div ref={containerRef} className="flex-1 overflow-hidden touch-none">
        {renderPanes()}
      </div>

      <div className="mt-1.5 text-[10px] text-white/15 text-center">
        Some sites block embedding · Tap ↗ to open in browser
      </div>
    </div>
  );
};

export default SplitScreenManager;
