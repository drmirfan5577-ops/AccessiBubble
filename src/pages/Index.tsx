import { useState, useEffect } from 'react';
import FloatingBubble from '@/components/features/FloatingBubble';
import AccessiPanel from '@/components/features/AccessiPanel';
import LockScreen from '@/components/features/LockScreen';
import { getLockConfig } from '@/lib/storage';

const Index = () => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const cfg = getLockConfig();
    if (!cfg.enabled || cfg.method === 'none') setIsUnlocked(true);
  }, []);

  const fmt = (n: number) => String(n).padStart(2, '0');
  const hours = fmt(time.getHours());
  const minutes = fmt(time.getMinutes());
  const seconds = fmt(time.getSeconds());
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (!isUnlocked) {
    return <LockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="h-dvh w-screen overflow-hidden relative bg-background">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-between py-16 px-6">
        {/* Clock */}
        <div className="text-center">
          <div className="text-6xl font-light text-white tracking-tight font-mono mb-1">
            {hours}:{minutes}
            <span className="text-3xl text-white/30">:{seconds}</span>
          </div>
          <div className="text-sm text-white/40">{dateStr}</div>
        </div>

        {/* Center widgets */}
        <div className="w-full max-w-sm space-y-3">
          <div className="glass rounded-2xl p-4 text-center">
            <div className="text-xs text-white/30 uppercase tracking-widest mb-1">AccessiBubble</div>
            <div className="text-base font-semibold text-white mb-1">Your Floating Toolkit</div>
            <div className="text-xs text-white/40 leading-relaxed">
              Passwords · Clipboard · Notes · Reminders · Code · Split Screen & more.
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Passwords', val: JSON.parse(localStorage.getItem('accessi_passwords') || '[]').length, color: 'text-purple-400' },
              { label: 'Notes', val: JSON.parse(localStorage.getItem('accessi_notes') || '[]').length, color: 'text-yellow-400' },
              { label: 'Reminders', val: JSON.parse(localStorage.getItem('accessi_reminders') || '[]').filter((r: any) => !r.done).length, color: 'text-orange-400' },
            ].map(stat => (
              <div key={stat.label} className="glass rounded-xl p-3 text-center">
                <div className={`text-xl font-bold ${stat.color}`}>{stat.val}</div>
                <div className="text-xs text-white/30">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-white/20">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            Tap the bubble to open tools
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </div>
        </div>

        <div className="text-center">
          <div className="text-xs text-white/15">Drag bubble anywhere · Minimize or close panel freely</div>
        </div>
      </div>

      {/* Floating Bubble */}
      <FloatingBubble
        onOpen={() => setIsPanelOpen(true)}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />

      {/* Accessi Panel */}
      <AccessiPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSplitScreen={() => {}}
      />
    </div>
  );
};

export default Index;
