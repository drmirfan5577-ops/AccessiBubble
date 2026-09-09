import { useState, useEffect } from 'react';
import { Shield, Lock, Grid3X3, Eye, EyeOff, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { getLockConfig, saveLockConfig } from '@/lib/storage';
import { LockConfig, LockMethod } from '@/types';

interface LockScreenProps {
  onUnlock: () => void;
}

// ─── PIN Pad ───
const PIN_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'];

const PinPad = ({ onComplete, label = 'Enter PIN', confirmMode = false }: {
  onComplete: (pin: string) => void;
  label?: string;
  confirmMode?: boolean;
}) => {
  const [pin, setPin] = useState('');
  const [show, setShow] = useState(false);
  const [shake, setShake] = useState(false);

  const press = (d: number | null | 'del') => {
    if (d === 'del') { setPin(p => p.slice(0, -1)); return; }
    if (d === null) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        onComplete(next);
        setPin('');
      }, 100);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-sm text-white/60">{label}</div>
      {/* Dots */}
      <div className={`flex gap-4 ${shake ? 'animate-bounce' : ''}`}>
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
              i < pin.length
                ? 'bg-purple-400 border-purple-400 scale-110'
                : 'bg-transparent border-white/30'
            }`}
          />
        ))}
      </div>
      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {PIN_DIGITS.map((d, i) => (
          <button
            key={i}
            onClick={() => press(d as number | null | 'del')}
            disabled={d === null}
            className={`h-14 rounded-2xl text-lg font-semibold transition-all active:scale-95 ${
              d === null ? 'invisible' :
              d === 'del' ? 'glass text-white/50 hover:text-white text-sm' :
              'glass text-white hover:bg-purple-500/20 active:bg-purple-500/30'
            }`}
          >
            {d === 'del' ? '⌫' : d}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── Pattern Lock ───
const PATTERN_DOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const PatternLock = ({ onComplete, label = 'Draw Pattern' }: {
  onComplete: (pattern: number[]) => void;
  label?: string;
}) => {
  const [drawing, setDrawing] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);

  const handleDotEnter = (i: number) => {
    if (!drawing) return;
    if (!selected.includes(i)) setSelected(s => [...s, i]);
  };

  const handleStart = (i: number) => {
    setDrawing(true);
    setSelected([i]);
  };

  const handleEnd = () => {
    setDrawing(false);
    if (selected.length >= 4) {
      onComplete(selected);
    }
    setTimeout(() => setSelected([]), 400);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-white/60">{label}</div>
      <div className="text-xs text-white/30">Connect at least 4 dots</div>
      <div
        className="grid grid-cols-3 gap-5 p-4 select-none"
        onMouseLeave={handleEnd}
        onTouchEnd={handleEnd}
      >
        {PATTERN_DOTS.map(i => (
          <div
            key={i}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-150 ${
              selected.includes(i)
                ? 'bg-purple-500/40 border-purple-400 scale-110'
                : 'bg-white/5 border-white/20 hover:border-purple-400/50'
            }`}
            onMouseDown={() => handleStart(i)}
            onMouseEnter={() => handleDotEnter(i)}
            onTouchStart={() => handleStart(i)}
          >
            {selected.includes(i) && (
              <div className="w-3 h-3 rounded-full bg-purple-400" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Setup Screen ───
export const LockSetup = ({ onDone }: { onDone: () => void }) => {
  const [method, setMethod] = useState<LockMethod>('pin');
  const [step, setStep] = useState<'choose' | 'set' | 'confirm'>('choose');
  const [first, setFirst] = useState('');
  const [firstPattern, setFirstPattern] = useState<number[]>([]);
  const [error, setError] = useState('');

  const handlePinFirst = (pin: string) => { setFirst(pin); setStep('confirm'); };
  const handlePinConfirm = (pin: string) => {
    if (pin !== first) { setError('PINs do not match. Try again.'); setStep('set'); setFirst(''); return; }
    saveLockConfig({ method: 'pin', pin, enabled: true });
    onDone();
  };

  const handlePatternFirst = (p: number[]) => { setFirstPattern(p); setStep('confirm'); };
  const handlePatternConfirm = (p: number[]) => {
    if (p.join(',') !== firstPattern.join(',')) {
      setError('Patterns do not match. Try again.');
      setStep('set'); setFirstPattern([]);
      return;
    }
    saveLockConfig({ method: 'pattern', pattern: p, enabled: true });
    onDone();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 px-4">
      <Shield size={36} className="text-purple-400" />
      <div className="text-lg font-bold text-white">Set Up Lock</div>

      {step === 'choose' && (
        <div className="w-full space-y-3">
          {error && <div className="text-xs text-red-400 text-center">{error}</div>}
          {([
            { m: 'pin' as LockMethod, label: '🔢 4-Digit PIN', desc: 'Numeric PIN code' },
            { m: 'pattern' as LockMethod, label: '⬡ Pattern Lock', desc: 'Connect dot pattern' },
          ]).map(({ m, label, desc }) => (
            <button
              key={m}
              onClick={() => { setMethod(m); setStep('set'); setError(''); }}
              className="w-full glass rounded-2xl p-4 text-left hover:bg-white/10 transition-all"
            >
              <div className="text-sm font-semibold text-white">{label}</div>
              <div className="text-xs text-white/40">{desc}</div>
            </button>
          ))}
          <button
            onClick={() => { saveLockConfig({ method: 'none', enabled: false }); onDone(); }}
            className="w-full text-xs text-white/30 py-2 hover:text-white/50 transition-colors"
          >
            Skip — no lock
          </button>
        </div>
      )}

      {step === 'set' && error && (
        <div className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12} />{error}</div>
      )}

      {step === 'set' && method === 'pin' && <PinPad label="Create a 4-digit PIN" onComplete={handlePinFirst} />}
      {step === 'set' && method === 'pattern' && <PatternLock label="Draw your pattern" onComplete={handlePatternFirst} />}
      {step === 'confirm' && method === 'pin' && <PinPad label="Confirm your PIN" confirmMode onComplete={handlePinConfirm} />}
      {step === 'confirm' && method === 'pattern' && <PatternLock label="Confirm your pattern" onComplete={handlePatternConfirm} />}
    </div>
  );
};

// ─── Unlock Screen (shown on app open) ───
const LockScreen = ({ onUnlock }: LockScreenProps) => {
  const cfg = getLockConfig();
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  if (!cfg.enabled || cfg.method === 'none') { onUnlock(); return null; }

  const handlePin = (pin: string) => {
    if (pin === cfg.pin) { onUnlock(); }
    else {
      setAttempts(a => a + 1);
      setError(`Wrong PIN. ${attempts >= 2 ? 'Too many attempts.' : ''}`);
    }
  };

  const handlePattern = (p: number[]) => {
    if (p.join(',') === (cfg.pattern || []).join(',')) { onUnlock(); }
    else {
      setAttempts(a => a + 1);
      setError('Wrong pattern. Try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#08081a] overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-xs px-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full glass-bubble glow-purple flex items-center justify-center">
            <Lock size={24} className="text-purple-300" />
          </div>
          <div className="text-lg font-bold gradient-text">AccessiBubble</div>
          <div className="text-xs text-white/30">Locked</div>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-3 py-1.5 rounded-lg">
            <AlertCircle size={12} /> {error}
          </div>
        )}

        {cfg.method === 'pin' && <PinPad label="Enter your PIN to unlock" onComplete={handlePin} />}
        {cfg.method === 'pattern' && <PatternLock label="Draw your pattern to unlock" onComplete={handlePattern} />}
      </div>
    </div>
  );
};

export default LockScreen;
