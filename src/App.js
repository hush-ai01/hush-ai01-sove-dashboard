import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { isAuthed } from './api';

export default function App() {
  const [authed, setAuthed] = useState(isAuthed());
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowBanner(true);
    });
    window.addEventListener('appinstalled', () => {
      setShowBanner(false);
      setInstalled(true);
    });
  }, []);

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    const result = await installPrompt.userChoice;
    if (result.outcome === 'accepted') setShowBanner(false);
  }

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Inter, sans-serif' }}>
      {showBanner && !installed && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: 'linear-gradient(135deg, #06111f, #030610)',
          borderBottom: '0.5px solid rgba(29,158,117,0.3)',
          boxShadow: '0 4px 40px rgba(0,0,0,0.6)',
          padding: '1rem 1.25rem',
        }}>
          <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #1D9E75, #0F6E56)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(29,158,117,0.4)',
              fontSize: 22, fontWeight: 700, color: '#fff'
            }}>S</div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 2 }}>
                Install Sove Dashboard
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                Add to your home screen for instant access to your Travel Rule compliance dashboard
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
              <button
                onClick={handleInstall}
                style={{
                  background: '#1D9E75', border: 'none', borderRadius: 8,
                  padding: '9px 18px', fontSize: 13, fontWeight: 600,
                  color: '#fff', cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(29,158,117,0.5)',
                  whiteSpace: 'nowrap'
                }}
              >
                Install app
              </button>
              <button
                onClick={() => setShowBanner(false)}
                style={{
                  background: 'transparent', border: 'none',
                  fontSize: 12, color: 'rgba(255,255,255,0.35)',
                  cursor: 'pointer', textAlign: 'center'
                }}
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ paddingTop: showBanner && !installed ? 90 : 0, transition: 'padding 0.2s' }}>
        {authed
          ? <Dashboard onSignOut={() => setAuthed(false)} />
          : <Login onLogin={() => setAuthed(true)} />
        }
      </div>
    </div>
  );
}
