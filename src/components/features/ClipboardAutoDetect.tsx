import { useState, useEffect } from 'react';
import {
  Clipboard, Plus, Check, X, Sparkles
} from 'lucide-react';
import { detectType, genId, saveClip } from '@/lib/storage';
import { toast } from 'sonner';

interface ClipboardAutoDetectProps {
  onSaved?: () => void;
}

interface DetectedClip {
  content: string;
  type: ReturnType<typeof detectType>;
}

const ClipboardAutoDetect = ({ onSaved }: ClipboardAutoDetectProps) => {
  const [detected, setDetected] = useState<DetectedClip | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [label, setLabel] = useState('');

  useEffect(() => {
    if (dismissed) return;
    const check = async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().length > 2) {
          setDetected({ content: text.trim(), type: detectType(text.trim()) });
        }
      } catch {}
    };
    check();
  }, [dismissed]);

  if (!detected || dismissed) return null;

  const handleSave = () => {
    saveClip({
      id: genId(),
      content: detected.content,
      label: label.trim() || undefined,
      type: detected.type,
      createdAt: Date.now(),
      pinned: false,
    });
    toast.success('Clip saved from clipboard');
    setDismissed(true);
    onSaved?.();
  };

  const typeColor = {
    url: 'text-cyan-400',
    email: 'text-green-400',
    text: 'text-purple-400',
    other: 'text-white/40',
  }[detected.type];

  return (
    <div className="glass rounded-xl p-3 mb-3 border border-purple-500/20 fade-in">
      <div className="flex items-center gap-1.5 mb-2">
        <Sparkles size={12} className="text-purple-400" />
        <span className="text-xs font-semibold text-purple-300">Clipboard Detected</span>
        <span className={`text-[10px] ml-auto ${typeColor}`}>{detected.type}</span>
      </div>
      <div className="bg-black/30 rounded-lg px-2 py-1.5 mb-2 max-h-16 overflow-hidden">
        <p className="text-xs text-white/70 line-clamp-2 break-all">{detected.content}</p>
      </div>
      <input
        type="text"
        placeholder="Add label (optional)"
        value={label}
        onChange={e => setLabel(e.target.value)}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white placeholder-white/30 mb-2 outline-none focus:border-purple-500/50"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-1.5 bg-purple-500/25 hover:bg-purple-500/40 text-purple-200 text-xs py-1.5 rounded-lg transition-all"
        >
          <Plus size={11} /> Save Clip
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 px-2 py-1.5 rounded-lg"
        >
          <X size={11} />
        </button>
      </div>
    </div>
  );
};

export default ClipboardAutoDetect;
