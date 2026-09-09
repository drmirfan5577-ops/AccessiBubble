import { useState, useRef, useEffect } from 'react';
import {
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Upload, Music, Film, X, Repeat, Shuffle, List,
  Maximize2, Minimize2, ChevronUp, ChevronDown
} from 'lucide-react';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: 'audio' | 'video';
  duration?: number;
}

const fmt = (s: number) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const MediaPlayer = () => {
  const [playlist, setPlaylist] = useState<MediaItem[]>([]);
  const [current, setCurrent] = useState<MediaItem | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const mediaEl = current?.type === 'video' ? videoRef.current : audioRef.current;

  useEffect(() => {
    const el = mediaEl;
    if (!el) return;
    const onTime = () => setProgress(el.currentTime);
    const onDur = () => setDuration(el.duration);
    const onEnd = () => {
      if (repeat) { el.currentTime = 0; el.play(); }
      else playNext();
    };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onDur);
    el.addEventListener('ended', onEnd);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onDur);
      el.removeEventListener('ended', onEnd);
    };
  }, [current, repeat]);

  useEffect(() => {
    const el = mediaEl;
    if (!el || !current) return;
    el.src = current.url;
    el.volume = volume;
    el.muted = muted;
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, [current]);

  useEffect(() => {
    if (mediaEl) mediaEl.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (mediaEl) mediaEl.muted = muted;
  }, [muted]);

  const playCurrent = async () => {
    if (!mediaEl) return;
    if (playing) { mediaEl.pause(); setPlaying(false); }
    else { await mediaEl.play(); setPlaying(true); }
  };

  const playNext = () => {
    if (!playlist.length || !current) return;
    const idx = playlist.findIndex(m => m.id === current.id);
    const next = shuffle
      ? playlist[Math.floor(Math.random() * playlist.length)]
      : playlist[(idx + 1) % playlist.length];
    setCurrent(next);
  };

  const playPrev = () => {
    if (!playlist.length || !current) return;
    const idx = playlist.findIndex(m => m.id === current.id);
    const prev = playlist[(idx - 1 + playlist.length) % playlist.length];
    setCurrent(prev);
  };

  const seekTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = +e.target.value;
    setProgress(t);
    if (mediaEl) mediaEl.currentTime = t;
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newItems: MediaItem[] = [];
    Array.from(files).forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');
      if (!isVideo && !isAudio) return;
      const url = URL.createObjectURL(file);
      newItems.push({ id: Date.now() + file.name, name: file.name, url, type: isVideo ? 'video' : 'audio' });
    });
    setPlaylist(p => [...p, ...newItems]);
    if (!current && newItems.length) setCurrent(newItems[0]);
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    const isVideo = /\.(mp4|webm|ogg|mov|avi|mkv|m3u8)/i.test(url);
    const item: MediaItem = { id: Date.now().toString(), name: url.split('/').pop() || url, url, type: isVideo ? 'video' : 'audio' };
    setPlaylist(p => [...p, item]);
    if (!current) setCurrent(item);
    setUrlInput('');
  };

  const removeItem = (id: string) => {
    setPlaylist(p => p.filter(m => m.id !== id));
    if (current?.id === id) { setCurrent(null); setPlaying(false); }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music size={16} className="text-pink-400" />
          <span className="text-sm font-semibold text-white">Media Player</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowPlaylist(s => !s)}
            className={`p-1.5 rounded-lg text-xs transition-colors ${showPlaylist ? 'bg-white/15 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            <List size={12} />
          </button>
          <button
            onClick={() => setExpanded(e => !e)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white"
          >
            {expanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>
      </div>

      {/* Hidden audio */}
      <audio ref={audioRef} className="hidden" />

      {/* Video */}
      {current?.type === 'video' && (
        <div className={`relative mb-3 bg-black rounded-xl overflow-hidden ${expanded ? 'h-48' : 'h-32'}`}>
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls={false}
            playsInline
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {!playing && <Play size={32} className="text-white/30" />}
          </div>
        </div>
      )}

      {/* Now Playing */}
      <div className="glass rounded-xl p-3 mb-3">
        {current ? (
          <>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${current.type === 'video' ? 'bg-blue-500/20' : 'bg-pink-500/20'}`}>
                {current.type === 'video' ? <Film size={14} className="text-blue-400" /> : <Music size={14} className="text-pink-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{current.name}</div>
                <div className="text-[10px] text-white/30">{current.type === 'video' ? 'Video' : 'Audio'}</div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mb-2">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={seekTo}
                className="w-full h-1.5 accent-pink-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/30 mt-0.5">
                <span>{fmt(progress)}</span>
                <span>{fmt(duration)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-white/30 text-xs py-3 flex flex-col items-center gap-2">
            <Music size={24} className="opacity-30" />
            No media loaded
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setShuffle(s => !s)} className={`p-1 rounded transition-colors ${shuffle ? 'text-pink-400' : 'text-white/30 hover:text-white/60'}`}>
            <Shuffle size={13} />
          </button>
          <button onClick={playPrev} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white">
            <SkipBack size={16} />
          </button>
          <button
            onClick={playCurrent}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white hover:scale-105 transition-transform active:scale-95"
          >
            {playing ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button onClick={playNext} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white">
            <SkipForward size={16} />
          </button>
          <button onClick={() => setRepeat(r => !r)} className={`p-1 rounded transition-colors ${repeat ? 'text-pink-400' : 'text-white/30 hover:text-white/60'}`}>
            <Repeat size={13} />
          </button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 mt-2">
          <button onClick={() => setMuted(m => !m)} className="text-white/30 hover:text-white">
            {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
          <input
            type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
            onChange={e => { setVolume(+e.target.value); setMuted(false); }}
            className="flex-1 h-1 accent-pink-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Add media */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="Paste URL (mp4, mp3, m3u8...)"
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleUrlAdd()}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/20 outline-none focus:border-pink-500/50"
        />
        <button onClick={handleUrlAdd} className="px-2 py-1.5 bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 text-xs rounded-lg">Add</button>
        <button
          onClick={() => fileRef.current?.click()}
          className="p-1.5 bg-white/5 hover:bg-white/10 text-white/50 rounded-lg"
          title="Upload file"
        >
          <Upload size={13} />
        </button>
        <input ref={fileRef} type="file" accept="audio/*,video/*" multiple onChange={e => handleFiles(e.target.files)} className="hidden" />
      </div>

      {/* Playlist */}
      {showPlaylist && (
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          <div className="text-xs text-white/30 mb-1.5">Playlist ({playlist.length})</div>
          {playlist.length === 0 && (
            <div className="text-center text-white/20 text-xs py-4">No items in playlist</div>
          )}
          {playlist.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${current?.id === item.id ? 'bg-pink-500/20 text-pink-200' : 'hover:bg-white/5 text-white/60'}`}
              onClick={() => setCurrent(item)}
            >
              {item.type === 'video' ? <Film size={11} className="flex-shrink-0" /> : <Music size={11} className="flex-shrink-0" />}
              <span className="flex-1 text-xs truncate">{item.name}</span>
              <button
                onClick={e => { e.stopPropagation(); removeItem(item.id); }}
                className="p-0.5 text-white/20 hover:text-red-400"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaPlayer;
