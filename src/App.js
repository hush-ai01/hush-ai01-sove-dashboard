import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { isAuthed } from './api';

export default function App() {
  const [authed, setAuthed] = useState(isAuthed());
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowBanner(true);
    });
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowBanner(false);
    }
  }

  return (
    <>
      {showBanner && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#06111f', border: '0.5px solid rgba(29,158,117,0.4)',
          borderRadius: 16, padding: '1rem 1.25rem', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: '0 0 40px rgba(29,158,117,0.15)',
          width: 'calc(100% - 2rem)', maxWidth: 420,
          fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginBottom: 2 }}>
              Install Sove Dashboard
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              Add to your home screen for quick access
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShowBanner(false)}
              style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 12px', fontSize: 12, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              style={{ background: '#1D9E75', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 500, color: '#fff', cursor: 'pointer', boxShadow: '0 0 16px rgba(29,158,117,0.4)' }}
            >
              Install
            </button>
          </div>
        </div>
      )}
      {authed
        ? <Dashboard onSignOut={() => setAuthed(false)} />
        : <Login onLogin={() => setAuthed(true)} />
      }
    </>
  );
}
