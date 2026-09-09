import { useState } from 'react';
import { Cloud, Mail, KeyRound, LogOut, RefreshCw, CheckCircle2, AlertCircle, User, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Step = 'idle' | 'otp_sent' | 'set_password' | 'login';

const CloudSync = () => {
  const { user, loading, sendOtp, verifyOtp, signIn, signOut } = useAuth();
  const [step, setStep] = useState<Step>('idle');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) { toast.error('Enter email'); return; }
    setBusy(true);
    try {
      await sendOtp(email.trim());
      setStep('otp_sent');
      toast.success('OTP sent to ' + email);
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(false); }
  };

  const handleVerify = async () => {
    if (!otp || !password) { toast.error('Fill all fields'); return; }
    setBusy(true);
    try {
      await verifyOtp(email, otp, password);
      toast.success('Account created & signed in!');
      setStep('idle');
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(false); }
  };

  const handleLogin = async () => {
    if (!email || !password) { toast.error('Fill all fields'); return; }
    setBusy(true);
    try {
      await signIn(email, password);
      toast.success('Signed in!');
      setStep('idle');
    } catch (e: any) {
      toast.error(e.message);
    } finally { setBusy(false); }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="animate-spin text-purple-400" size={24} />
    </div>
  );

  if (user) return (
    <div className="space-y-3">
      <div className="glass rounded-xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
          <User size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-white truncate">{user.username}</div>
          <div className="text-xs text-white/40 truncate">{user.email}</div>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
      </div>

      <div className="glass rounded-xl p-3">
        <div className="text-xs font-semibold text-green-400 flex items-center gap-1.5 mb-2">
          <CheckCircle2 size={13} /> Cloud Sync Active
        </div>
        <div className="text-xs text-white/40 leading-relaxed">
          Your passwords, notes, clips, code snippets and reminders are synced to the cloud. Access them from any device.
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/25 text-red-400 text-xs py-2.5 rounded-xl transition-all"
      >
        <LogOut size={13} /> Sign Out
      </button>
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="glass rounded-xl p-4 text-center mb-2">
        <Cloud size={28} className="text-purple-400 mx-auto mb-2" />
        <div className="text-sm font-bold text-white mb-1">Cloud Sync</div>
        <div className="text-xs text-white/40">Sign in to sync data across all your devices securely.</div>
      </div>

      {step === 'idle' && (
        <>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500/50"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleSendOtp}
              disabled={busy}
              className="flex items-center justify-center gap-1.5 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 text-xs py-2.5 rounded-xl disabled:opacity-50"
            >
              {busy ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
              Register
            </button>
            <button
              onClick={() => setStep('login')}
              className="flex items-center justify-center gap-1.5 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 text-xs py-2.5 rounded-xl"
            >
              <KeyRound size={12} /> Login
            </button>
          </div>
        </>
      )}

      {step === 'otp_sent' && (
        <>
          <div className="text-xs text-white/40 text-center bg-white/5 rounded-xl p-2">
            OTP sent to <span className="text-purple-300">{email}</span>
          </div>
          <input
            type="text"
            placeholder="4-digit OTP code"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            maxLength={4}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500/50 text-center tracking-widest font-mono"
          />
          <input
            type="password"
            placeholder="Create a password (min 6 chars)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-purple-500/50"
          />
          <button
            onClick={handleVerify}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-purple-500/30 hover:bg-purple-500/50 text-purple-200 text-xs py-2.5 rounded-xl disabled:opacity-50"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
            Verify & Create Account
          </button>
          <button onClick={() => setStep('idle')} className="w-full text-xs text-white/30 hover:text-white/50 py-1">
            ← Back
          </button>
        </>
      )}

      {step === 'login' && (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-500/50"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={handleLogin}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-200 text-xs py-2.5 rounded-xl disabled:opacity-50"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <KeyRound size={12} />}
            Sign In
          </button>
          <button onClick={() => setStep('idle')} className="w-full text-xs text-white/30 hover:text-white/50 py-1">
            ← Back
          </button>
        </>
      )}
    </div>
  );
};

export default CloudSync;
