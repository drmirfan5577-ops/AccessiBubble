import { useState, useEffect, useRef } from 'react';
import { Bell, Plus, Trash2, Check, X, Clock, Repeat, Volume2, Vibrate, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { Reminder } from '@/types';
import { getReminders, saveReminder, deleteReminder, genId } from '@/lib/storage';
import { toast } from 'sonner';

const ALARM_TONES = ['Bell', 'Chime', 'Alert', 'Ping', 'Buzz'];

const playTone = (name: string) => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const freq = name === 'Bell' ? 880 : name === 'Chime' ? 1047 : name === 'Alert' ? 440 : name === 'Ping' ? 1320 : 660;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch {}
};

const vibrateDevice = () => {
  if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 400]);
};

const EMPTY = {
  title: '', description: '', dueAt: '', repeat: 'none' as Reminder['repeat'],
  vibrate: true, sound: true, tone: 'Bell',
};

const RemindersManager = () => {
  const [list, setList] = useState<Reminder[]>(getReminders);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [editId, setEditId] = useState<string | null>(null);
  const [fired, setFired] = useState<Set<string>>(new Set());
  const intervalRef = useRef<number>(0);

  const reload = () => setList(getReminders());

  // ─── Check for due reminders ───
  useEffect(() => {
    intervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const all = getReminders();
      all.forEach(r => {
        if (!r.done && r.dueAt <= now && !fired.has(r.id)) {
          setFired(f => new Set([...f, r.id]));
          // Fire alarm
          if (r.sound) playTone('Bell');
          if (r.vibrate) vibrateDevice();
          toast(r.title, {
            description: r.description || 'Reminder due!',
            duration: 10000,
            icon: <Bell size={16} className="text-orange-400" />,
          });
        }
      });
    }, 15000);
    return () => clearInterval(intervalRef.current);
  }, [fired]);

  const handleSave = () => {
    if (!form.title.trim()) { toast.error('Title required'); return; }
    if (!form.dueAt) { toast.error('Due time required'); return; }
    const r: Reminder = {
      id: editId || genId(),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      dueAt: new Date(form.dueAt).getTime(),
      repeat: form.repeat,
      vibrate: form.vibrate,
      sound: form.sound,
      done: false,
      createdAt: Date.now(),
    };
    saveReminder(r);
    reload();
    setAdding(false);
    setEditId(null);
    setForm({ ...EMPTY });
    toast.success('Reminder set');
  };

  const handleToggleDone = (id: string) => {
    const r = list.find(x => x.id === id);
    if (!r) return;
    saveReminder({ ...r, done: !r.done });
    reload();
  };

  const handleEdit = (r: Reminder) => {
    const dt = new Date(r.dueAt);
    const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    setForm({ title: r.title, description: r.description || '', dueAt: local, repeat: r.repeat, vibrate: r.vibrate, sound: r.sound, tone: 'Bell' });
    setEditId(r.id);
    setAdding(true);
  };

  const upcoming = list.filter(r => !r.done && r.dueAt > Date.now()).sort((a, b) => a.dueAt - b.dueAt);
  const past = list.filter(r => r.done || r.dueAt <= Date.now()).sort((a, b) => b.dueAt - a.dueAt);

  const formatTime = (ms: number) => {
    const d = new Date(ms);
    const now = new Date();
    const diff = ms - Date.now();
    if (diff > 0 && diff < 86400000) {
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      return h > 0 ? `In ${h}h ${m}m` : `In ${m}m`;
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-orange-400" />
          <span className="text-sm font-semibold text-white">Reminders</span>
          <span className="text-xs bg-orange-500/20 text-orange-300 px-1.5 py-0.5 rounded-full">{upcoming.length}</span>
        </div>
        <button
          onClick={() => { setAdding(true); setEditId(null); setForm({ ...EMPTY }); }}
          className="flex items-center gap-1 text-xs bg-orange-500/20 hover:bg-orange-500/40 text-orange-300 px-2 py-1 rounded-lg transition-colors"
        >
          <Plus size={12} /> Add
        </button>
      </div>

      {adding && (
        <div className="glass rounded-xl p-3 mb-3 fade-in overflow-y-auto max-h-64">
          <div className="text-xs font-semibold text-orange-300 mb-2">{editId ? 'Edit Reminder' : 'New Reminder'}</div>
          <input
            type="text"
            placeholder="Reminder title"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30 mb-2 outline-none"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/30 mb-2 outline-none"
          />
          <input
            type="datetime-local"
            value={form.dueAt}
            onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white mb-2 outline-none [color-scheme:dark]"
          />
          <select
            value={form.repeat}
            onChange={e => setForm(f => ({ ...f, repeat: e.target.value as Reminder['repeat'] }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white mb-2 outline-none"
          >
            <option value="none" className="bg-[#1a1a2e]">No Repeat</option>
            <option value="daily" className="bg-[#1a1a2e]">Daily</option>
            <option value="weekly" className="bg-[#1a1a2e]">Weekly</option>
          </select>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setForm(f => ({ ...f, sound: !f.sound }))}
              className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg flex-1 transition-all ${form.sound ? 'bg-orange-500/20 text-orange-300' : 'bg-white/5 text-white/40'}`}
            >
              <Volume2 size={12} /> Sound {form.sound ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setForm(f => ({ ...f, vibrate: !f.vibrate }))}
              className={`flex items-center gap-1.5 text-xs px-2 py-1.5 rounded-lg flex-1 transition-all ${form.vibrate ? 'bg-orange-500/20 text-orange-300' : 'bg-white/5 text-white/40'}`}
            >
              <Vibrate size={12} /> Vibrate {form.vibrate ? 'ON' : 'OFF'}
            </button>
          </div>
          {/* Preview tone */}
          {form.sound && (
            <div className="flex gap-1.5 mb-2 flex-wrap">
              {ALARM_TONES.map(t => (
                <button
                  key={t}
                  onClick={() => { setForm(f => ({ ...f, tone: t })); playTone(t); }}
                  className={`text-[10px] px-2 py-1 rounded-lg transition-all ${form.tone === t ? 'bg-orange-500/30 text-orange-300' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                >
                  ♪ {t}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 flex items-center justify-center gap-1 bg-orange-500/30 hover:bg-orange-500/50 text-orange-200 text-xs py-1.5 rounded-lg">
              <Check size={12} /> Save
            </button>
            <button onClick={() => { setAdding(false); setEditId(null); }} className="bg-white/5 hover:bg-white/10 text-white/60 px-3 py-1.5 rounded-lg">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-1 space-y-1">
        {upcoming.length === 0 && past.length === 0 && (
          <div className="text-center text-white/30 text-xs py-8">
            <Bell size={28} className="mx-auto mb-2 opacity-30" />
            No reminders set
          </div>
        )}

        {upcoming.length > 0 && (
          <>
            <div className="text-xs text-white/30 uppercase tracking-wider px-1 mb-1">Upcoming</div>
            {upcoming.map(r => (
              <div key={r.id} className="glass rounded-xl p-3 fade-in border border-orange-500/20">
                <div className="flex items-start gap-2">
                  <button onClick={() => handleToggleDone(r.id)} className="mt-0.5 flex-shrink-0 text-white/30 hover:text-green-400 transition-colors">
                    <CheckCircle2 size={16} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white">{r.title}</div>
                    {r.description && <div className="text-xs text-white/40 truncate">{r.description}</div>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-orange-300 flex items-center gap-0.5">
                        <Clock size={9} /> {formatTime(r.dueAt)}
                      </span>
                      {r.repeat !== 'none' && (
                        <span className="text-[10px] text-white/30 flex items-center gap-0.5">
                          <Repeat size={8} /> {r.repeat}
                        </span>
                      )}
                      {r.sound && <Volume2 size={9} className="text-white/20" />}
                      {r.vibrate && <Vibrate size={9} className="text-white/20" />}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(r)} className="p-1 rounded bg-white/5 hover:bg-orange-500/20 text-white/30 hover:text-orange-400">
                      <Bell size={10} />
                    </button>
                    <button onClick={() => { deleteReminder(r.id); reload(); }} className="p-1 rounded bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {past.length > 0 && (
          <>
            <div className="text-xs text-white/20 uppercase tracking-wider px-1 mt-3 mb-1">Past / Done</div>
            {past.slice(0, 5).map(r => (
              <div key={r.id} className="glass rounded-xl p-2.5 opacity-50 fade-in">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleDone(r.id)} className="flex-shrink-0 text-green-400">
                    <CheckCircle2 size={14} />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/50 line-through truncate">{r.title}</div>
                    <div className="text-[10px] text-white/20">{formatTime(r.dueAt)}</div>
                  </div>
                  <button onClick={() => { deleteReminder(r.id); reload(); }} className="p-1 rounded hover:bg-red-500/20 text-white/20 hover:text-red-400">
                    <Trash2 size={9} />
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default RemindersManager;
