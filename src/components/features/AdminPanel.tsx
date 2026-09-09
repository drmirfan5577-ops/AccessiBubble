import { useState, useEffect } from 'react';
import {
  Shield, Lock, Eye, EyeOff, LogIn, Settings, Download, FileCode,
  Smartphone, Book, Upload, Package, FileJson, ExternalLink,
  Terminal, CheckCircle2, Copy, Key, Globe, AlertTriangle
} from 'lucide-react';
import { exportBackup } from '@/lib/storage';
import { toast } from 'sonner';

const ADMIN_PASSWORD = 'Daood5577';

// ─── PWA HTML Content ───
const generatePWAHtml = () => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no"/>
  <title>AccessiBubble – Floating Toolkit</title>
  <meta name="description" content="Floating bubble accessibility toolkit"/>
  <link rel="manifest" href="manifest.json"/>
  <meta name="theme-color" content="#8b5cf6"/>
  <meta name="mobile-web-app-capable" content="yes"/>
  <meta name="apple-mobile-web-app-capable" content="yes"/>
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
  <link rel="apple-touch-icon" href="icon-192.png"/>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #08081a; color: #fff; font-family: -apple-system, BlinkMacSystemFont, Inter, sans-serif; 
           height: 100dvh; width: 100vw; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .loader { text-align: center; }
    .bubble { width: 80px; height: 80px; border-radius: 50%;
              background: linear-gradient(135deg,rgba(139,92,246,.5),rgba(6,182,212,.4));
              border: 2px solid rgba(255,255,255,.25); backdrop-filter: blur(16px);
              display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;
              animation: pulse 2.5s ease-in-out infinite; }
    @keyframes pulse {
      0%,100%{box-shadow:0 0 20px rgba(139,92,246,.5),0 0 40px rgba(139,92,246,.2)}
      50%{box-shadow:0 0 30px rgba(139,92,246,.7),0 0 60px rgba(139,92,246,.3)}
    }
    h1 { font-size: 20px; background: linear-gradient(135deg,#a78bfa,#06b6d4);
         -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin-bottom:8px; }
    p { color: rgba(255,255,255,.4); font-size: 13px; }
    .note { margin-top: 24px; font-size: 11px; color: rgba(255,255,255,.2); }
  </style>
</head>
<body>
  <div class="loader">
    <div class="bubble"><span style="font-size:32px">🫧</span></div>
    <h1>AccessiBubble</h1>
    <p>Loading your floating toolkit...</p>
    <p class="note">Please serve this app via a web server for full functionality.</p>
  </div>
  <script>
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').then(r => console.log('SW registered', r));
    }
  </script>
</body>
</html>`;

// ─── Section Components ───
const DocSection = ({ title, icon, color, children }: any) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass rounded-xl overflow-hidden mb-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 p-3 hover:bg-white/5 transition-colors"
      >
        <span className={color}>{icon}</span>
        <span className="text-sm font-semibold text-white flex-1 text-left">{title}</span>
        <span className="text-white/30 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-3 pb-3 fade-in">{children}</div>}
    </div>
  );
};

const CodeBlock = ({ code }: { code: string }) => (
  <div className="bg-black/40 rounded-lg p-3 my-2 relative">
    <pre className="text-xs text-green-300 font-mono whitespace-pre-wrap break-all overflow-x-auto">{code}</pre>
    <button
      onClick={() => { navigator.clipboard.writeText(code); toast.success('Copied'); }}
      className="absolute top-2 right-2 p-1 bg-white/10 hover:bg-white/20 rounded text-white/50"
    >
      <Copy size={10} />
    </button>
  </div>
);

// ─── Admin Panel ───
const AdminPanel = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const handleUnlock = () => {
    if (pw === ADMIN_PASSWORD) {
      setUnlocked(true);
    } else {
      setAttempt(a => a + 1);
      toast.error(attempt >= 2 ? 'Too many failed attempts' : 'Incorrect password');
    }
  };

  if (!unlocked) return (
    <div className="flex flex-col h-full items-center justify-center gap-4 px-4">
      <div className="w-16 h-16 rounded-full glass-bubble glow-purple flex items-center justify-center">
        <Shield size={28} className="text-red-400" />
      </div>
      <div className="text-lg font-bold text-white">Admin Panel</div>
      <div className="text-xs text-white/40 text-center">Restricted access. Enter admin password to continue.</div>
      <div className="w-full max-w-xs">
        <div className="relative mb-3">
          <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="Admin password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-red-500/50"
          />
          <button onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
            {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
        <button
          onClick={handleUnlock}
          className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/35 text-red-300 text-sm py-2.5 rounded-xl transition-all"
        >
          <LogIn size={14} /> Unlock Admin Panel
        </button>
      </div>
      <div className="text-[10px] text-white/15 mt-2 flex items-center gap-1">
        <AlertTriangle size={10} /> This panel is for administrators only
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Admin header */}
      <div className="flex items-center gap-2 mb-4 p-3 glass rounded-xl border border-red-500/20">
        <Shield size={16} className="text-red-400" />
        <div>
          <div className="text-sm font-bold text-white">Admin Panel</div>
          <div className="text-xs text-white/40">AccessiBubble v2.0 — Management Console</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
          <CheckCircle2 size={12} /> Authenticated
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {/* ── PWA Download ── */}
        <DocSection title="PWA Installation File" icon={<Smartphone size={14} />} color="text-purple-400">
          <p className="text-xs text-white/50 mb-2 leading-relaxed">
            Download the complete PWA-ready HTML shell file. Deploy it alongside your built app files.
            This file includes the service worker registration and PWA manifest link.
          </p>
          <button
            onClick={() => {
              const html = generatePWAHtml();
              const blob = new Blob([html], { type: 'text/html' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = 'accessibubble-pwa.html';
              a.click();
              toast.success('PWA HTML downloaded');
            }}
            className="w-full flex items-center justify-center gap-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 text-xs py-2.5 rounded-xl transition-all mb-2"
          >
            <Download size={13} /> Download PWA HTML File
          </button>
          <button
            onClick={() => {
              const sw = document.createElement('a');
              sw.href = '/sw.js';
              sw.download = 'sw.js';
              sw.click();
              toast.success('sw.js downloaded');
            }}
            className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white/60 text-xs py-2 rounded-xl transition-all"
          >
            <FileCode size={13} /> Download sw.js (Service Worker)
          </button>
          <div className="mt-3 text-xs text-white/30 leading-relaxed">
            <p className="font-semibold text-white/50 mb-1">PWA Setup Steps:</p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>Build your app: <code className="text-green-300">npm run build</code></li>
              <li>Place <code className="text-purple-300">sw.js</code> and <code className="text-purple-300">manifest.json</code> in the <code className="text-yellow-300">/public</code> folder (already included)</li>
              <li>Deploy <code className="text-cyan-300">/dist</code> folder to any static host (Vercel, Netlify, GitHub Pages)</li>
              <li>Visit your URL on Android Chrome → "Add to Home Screen"</li>
              <li>App installs as native-like PWA with offline support</li>
            </ol>
          </div>
        </DocSection>

        {/* ── Source Code ── */}
        <DocSection title="Source Code Export" icon={<FileCode size={14} />} color="text-cyan-400">
          <p className="text-xs text-white/50 mb-3 leading-relaxed">
            Download the complete source code package from the OnSpace platform. The source code includes all React components, TypeScript files, Tailwind config, and Vite build setup.
          </p>
          <div className="glass rounded-xl p-3 mb-3 border border-cyan-500/20">
            <div className="text-xs font-semibold text-cyan-300 mb-2">Project Structure</div>
            <CodeBlock code={`accessibubble/
├── src/
│   ├── components/features/   # All feature components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Storage + Supabase utilities
│   ├── pages/                 # Route pages
│   ├── types/                 # TypeScript types
│   └── App.tsx
├── public/
│   ├── sw.js                  # Service Worker
│   └── manifest.json          # PWA manifest
├── supabase/                  # Edge functions (if any)
├── tailwind.config.ts
├── vite.config.ts
└── package.json`} />
          </div>
          <a
            href="#"
            onClick={e => { e.preventDefault(); toast.info('Use the Download button in the top toolbar (↓) to export full source code'); }}
            className="w-full flex items-center justify-center gap-2 bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 text-xs py-2.5 rounded-xl transition-all"
          >
            <Terminal size={13} /> How to Export Source Code
          </a>
          <div className="mt-2 text-xs text-white/30 leading-relaxed">
            Click the <strong className="text-white/50">Download ↓</strong> button in the top-right toolbar of the OnSpace editor to download the complete source code as a ZIP file.
          </div>
        </DocSection>

        {/* ── Backup ── */}
        <DocSection title="Data Backup Management" icon={<FileJson size={14} />} color="text-indigo-400">
          <p className="text-xs text-white/50 mb-3">Export all app data as a JSON backup. This includes passwords, notes, clipboard, code snippets, and reminders.</p>
          <button
            onClick={() => { exportBackup(); toast.success('Full backup downloaded'); }}
            className="w-full flex items-center justify-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 text-xs py-2.5 rounded-xl transition-all mb-2"
          >
            <Download size={13} /> Download Full Data Backup
          </button>
          <div className="text-xs text-white/30 leading-relaxed">
            <p className="font-semibold text-white/50 mb-1">Backup Format (JSON v2):</p>
            <CodeBlock code={`{
  "version": 2,
  "exportedAt": 1722470400000,
  "passwords": [...],
  "clipboard": [...],
  "code": [...],
  "notes": [...],
  "folders": [...],
  "reminders": [...]
}`} />
          </div>
        </DocSection>

        {/* ── App Stores ── */}
        <DocSection title="App Store Publishing Guide" icon={<Package size={14} />} color="text-green-400">
          <div className="space-y-3 text-xs text-white/50 leading-relaxed">
            <div className="glass rounded-lg p-3 border border-green-500/15">
              <div className="font-semibold text-green-400 mb-2">🤖 Google Play Store (Android)</div>
              <ol className="space-y-1.5 list-decimal list-inside">
                <li>Convert PWA to Android APK using <a href="https://bubblewrap.glitch.me" target="_blank" rel="noopener" className="text-cyan-400 underline">Bubblewrap</a> or <a href="https://pwabuilder.com" target="_blank" rel="noopener" className="text-cyan-400 underline">PWABuilder</a></li>
                <li>Register at <a href="https://play.google.com/console" target="_blank" rel="noopener" className="text-cyan-400 underline">Google Play Console</a> ($25 one-time)</li>
                <li>Create new app → Upload AAB/APK file</li>
                <li>Fill app details, screenshots (min 2, 1080×1920)</li>
                <li>Set content rating → Submit for review (1-3 days)</li>
              </ol>
            </div>
            <div className="glass rounded-lg p-3 border border-blue-500/15">
              <div className="font-semibold text-blue-400 mb-2">🍎 Apple App Store (iOS)</div>
              <ol className="space-y-1.5 list-decimal list-inside">
                <li>Enroll in <a href="https://developer.apple.com/programs/" target="_blank" rel="noopener" className="text-cyan-400 underline">Apple Developer Program</a> ($99/year)</li>
                <li>Use <a href="https://pwabuilder.com" target="_blank" rel="noopener" className="text-cyan-400 underline">PWABuilder</a> to generate iOS package</li>
                <li>Open in Xcode, set Bundle ID, signing certificate</li>
                <li>Archive → Upload to <a href="https://appstoreconnect.apple.com" target="_blank" rel="noopener" className="text-cyan-400 underline">App Store Connect</a></li>
                <li>Fill metadata, screenshots (iPhone 6.7" required)</li>
                <li>Submit for App Review (1-7 days)</li>
              </ol>
            </div>
            <div className="glass rounded-lg p-3 border border-orange-500/15">
              <div className="font-semibold text-orange-400 mb-2">🌐 Web Deployment (Recommended)</div>
              <ol className="space-y-1.5 list-decimal list-inside">
                <li>Run <code className="text-green-300">npm run build</code> to generate <code className="text-yellow-300">/dist</code></li>
                <li>Deploy to <strong>Vercel</strong>: Connect GitHub → Auto-deploy</li>
                <li>Or use <strong>Netlify</strong>: Drag-drop /dist folder</li>
                <li>Or use OnSpace Publish button (top toolbar)</li>
                <li>PWA install prompt will appear on Android Chrome automatically</li>
              </ol>
            </div>
          </div>
        </DocSection>

        {/* ── Ownership & Licensing ── */}
        <DocSection title="Ownership & Licensing" icon={<Key size={14} />} color="text-yellow-400">
          <div className="space-y-3 text-xs text-white/50 leading-relaxed">
            <div className="glass rounded-lg p-3 border border-yellow-500/15">
              <div className="font-semibold text-yellow-400 mb-1">📄 Project Ownership</div>
              <p>This application was developed using the OnSpace AI platform. All generated code, assets, and components are owned by the project creator upon export.</p>
            </div>
            <div className="glass rounded-lg p-3 border border-purple-500/15">
              <div className="font-semibold text-purple-400 mb-1">🔑 Admin Credentials</div>
              <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2 mt-1">
                <code className="flex-1 text-purple-300 font-mono text-xs">Admin Password: Daood5577</code>
                <button onClick={() => { navigator.clipboard.writeText('Daood5577'); toast.success('Copied'); }} className="p-1 text-white/30 hover:text-white">
                  <Copy size={10} />
                </button>
              </div>
              <p className="mt-2 text-red-400/70">⚠ Change this password in AdminPanel.tsx before publishing.</p>
            </div>
            <div className="glass rounded-lg p-3 border border-cyan-500/15">
              <div className="font-semibold text-cyan-400 mb-1">📋 Third-Party Licenses</div>
              <ul className="space-y-1">
                {[
                  ['React', 'MIT License'],
                  ['Tailwind CSS', 'MIT License'],
                  ['Supabase', 'Apache 2.0'],
                  ['Lucide Icons', 'ISC License'],
                  ['Vite', 'MIT License'],
                  ['TypeScript', 'Apache 2.0'],
                ].map(([lib, lic]) => (
                  <li key={lib} className="flex justify-between">
                    <span className="text-white/60">{lib}</span>
                    <span className="text-green-400/70">{lic}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass rounded-lg p-3 border border-green-500/15">
              <div className="font-semibold text-green-400 mb-1">🌐 Deployment URLs</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe size={10} className="text-white/30" />
                  <span>OnSpace Publish: <code className="text-cyan-300">*.onspace.app</code></span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={10} className="text-white/30" />
                  <span>Custom Domain: configurable in OnSpace settings</span>
                </div>
              </div>
            </div>
          </div>
        </DocSection>

        {/* ── Settings ── */}
        <DocSection title="Admin Settings" icon={<Settings size={14} />} color="text-red-400">
          <div className="space-y-2 text-xs text-white/50">
            <div className="glass rounded-lg p-3">
              <div className="font-semibold text-white/70 mb-2">Change Admin Password</div>
              <p>To change the admin password, edit <code className="text-yellow-300">AdminPanel.tsx</code> and update the <code className="text-purple-300">ADMIN_PASSWORD</code> constant at the top of the file.</p>
              <CodeBlock code={`// In src/components/features/AdminPanel.tsx
const ADMIN_PASSWORD = 'YourNewPassword';`} />
            </div>
            <div className="glass rounded-lg p-3 border border-red-500/15">
              <div className="font-semibold text-red-400 mb-1">⚠ Security Note</div>
              <p>The admin panel uses client-side password check only. For production, implement server-side authentication via OnSpace Cloud with a separate admin role.</p>
            </div>
          </div>
        </DocSection>
      </div>
    </div>
  );
};

export default AdminPanel;
