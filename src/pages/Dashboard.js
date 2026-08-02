import React, { useState, useEffect, useCallback } from 'react';
import { clearAuth } from '../api';

const BASE = () => localStorage.getItem('sove_base') || 'https://eoniix-kyc-api.onrender.com';
const KEY = () => localStorage.getItem('sove_key') || '';
const h = () => ({ 'Content-Type': 'application/json', 'x-api-key': KEY() });

const KNOWN_IDS = [
  'arc_1d0e0646-2c68-4312-9f56-39bf7becc53c',
  'arc_ba1e871e-3182-4841-92b6-3461062bf091'
];
const KNOWN_WALLETS = ['0xTestWallet123', '0xTestWallet456'];

const navItems = [
  { label: 'Overview', icon: '▣' },
  { label: 'Transmissions', icon: '⇄' },
  { label: 'CASPs', icon: '◎' },
  { label: 'Credentials', icon: '◈' },
  { label: 'Settings', icon: '⚙' },
];

const css = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .dash-layout { display: flex; min-height: 100vh; background: #030610; color: #fff; font-family: -apple-system, BlinkMacSystemFont, Inter, sans-serif; }
  .sidebar { width: 220px; min-height: 100vh; background: #06111f; border-right: 0.5px solid rgba(255,255,255,0.08); padding: 1.5rem 1rem; display: flex; flex-direction: column; justify-content: space-between; position: fixed; top: 0; left: 0; bottom: 0; z-index: 100; transition: transform 0.25s ease; }
  .sidebar.mobile-hidden { transform: translateX(-220px); }
  .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 99; }
  .sidebar-overlay.visible { display: block; }
  .main { margin-left: 220px; padding: 1.5rem 2rem; min-height: 100vh; width: 100%; }
  .topbar { display: none; }
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 1.5rem; }
  .stat-card { background: linear-gradient(135deg, rgba(29,158,117,0.08), rgba(29,158,117,0)); border: 0.5px solid rgba(29,158,117,0.2); border-radius: 10px; padding: 1rem; }
  .tables-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 1.5rem; }
  .table-wrap { background: rgba(255,255,255,0.02); border: 0.5px solid rgba(255,255,255,0.07); border-radius: 10px; overflow: hidden; }
  .data-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
  .data-table th { font-size: 10px; color: rgba(255,255,255,0.3); padding: 10px 14px; text-align: left; border-bottom: 0.5px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); text-transform: uppercase; letter-spacing: 0.06em; }
  .data-table td { padding: 10px 14px; font-size: 13px; color: rgba(255,255,255,0.8); border-bottom: 0.5px solid rgba(255,255,255,0.05); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .data-table tr:last-child td { border-bottom: none; }
  .data-table tr:hover td { background: rgba(255,255,255,0.02); }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 10px; margin-bottom: 2px; cursor: pointer; font-size: 13px; transition: all 0.15s; border-left: 2px solid transparent; }
  .nav-item.active { color: #fff; background: rgba(255,255,255,0.06); border-left-color: #1D9E75; font-weight: 500; }
  .nav-item:not(.active) { color: rgba(255,255,255,0.45); }
  .nav-item:not(.active):hover { color: rgba(255,255,255,0.7); background: rgba(255,255,255,0.03); }
  .copy-btn { background: rgba(255,255,255,0.06); border: none; border-radius: 4px; padding: 2px 6px; font-size: 10px; color: rgba(255,255,255,0.4); cursor: pointer; margin-left: 4px; }
  .copy-btn:hover { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); }
  .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 4px; }
  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  @media (max-width: 768px) {
    .sidebar { transform: translateX(-220px); }
    .sidebar.mobile-open { transform: translateX(0); }
    .main { margin-left: 0; padding: 1rem; }
    .topbar { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; background: #06111f; border-bottom: 0.5px solid rgba(255,255,255,0.08); margin: -1rem -1rem 1rem -1rem; }
    .stat-grid { grid-template-columns: repeat(2, 1fr); }
    .tables-grid { grid-template-columns: 1fr; }
    .table-wrap { overflow-x: auto; }
  }

  @media (max-width: 480px) {
    .stat-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
    .main { padding: 0.75rem; }
    .topbar { margin: -0.75rem -0.75rem 0.75rem -0.75rem; }
  }
`;

export default function Dashboard({ onSignOut }) {
  const [txs, setTxs] = useState([]);
  const [casps, setCasps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [activeNav, setActiveNav] = useState('Overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [copied, setCopied] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const txResults = [];
    for (const id of KNOWN_IDS) {
      try {
        const r = await fetch(`${BASE()}/v1/arc/status/${id}`, { headers: h() });
        if (r.ok) txResults.push(await r.json());
      } catch {}
    }
    setTxs(txResults);
    const caspResults = [];
    for (const w of KNOWN_WALLETS) {
      try {
        const r = await fetch(`${BASE()}/v1/arc/casps/lookup?wallet=${w}`, { headers: h() });
        if (r.ok) { const d = await r.json(); if (d.found) caspResults.push(d); }
      } catch {}
    }
    setCasps(caspResults);
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function copyToClipboard(text, id) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  function handleSignOut() { clearAuth(); onSignOut(); }

  const total = txs.length;
  const sent = txs.filter(t => t.status === 'sent').length;
  const received = txs.filter(t => t.status === 'received').length;
  const full = txs.filter(t => t.threshold === 'full').length;
  const keyPrefix = KEY().slice(0, 14) + '...';

  return (
    <>
      <style>{css}</style>
      <div className="dash-layout">

        {mobileOpen && <div className="sidebar-overlay visible" onClick={() => setMobileOpen(false)} />}

        <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: '-0.02em' }}>
                Sove <span style={{ color: '#1D9E75' }}>Arc</span>
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Travel Rule Compliance</div>
            </div>

            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, paddingLeft: 12 }}>Main</div>
            <nav>
              {navItems.map(item => (
                <div key={item.label} className={`nav-item ${activeNav === item.label ? 'active' : ''}`} onClick={() => { setActiveNav(item.label); setMobileOpen(false); }}>
                  <span style={{ fontSize: 14, color: activeNav === item.label ? '#1D9E75' : 'rgba(255,255,255,0.3)' }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </nav>
          </div>

          <div>
            <div style={{ background: 'rgba(29,158,117,0.06)', border: '0.5px solid rgba(29,158,117,0.2)', borderRadius: 12, padding: '1rem', marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Connected as</div>
              <div style={{ fontSize: 12, color: '#fff', fontFamily: 'monospace', wordBreak: 'break-all' }}>{keyPrefix}</div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', boxShadow: '0 0 6px rgba(29,158,117,0.8)' }}></div>
                <span style={{ fontSize: 11, color: '#1D9E75' }}>Active</span>
              </div>
            </div>
            <button onClick={handleSignOut} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px', fontSize: 12, color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
              Sign out
            </button>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>Sove <span style={{ color: '#1D9E75' }}>Arc</span></div>
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 10px', color: '#fff', cursor: 'pointer', fontSize: 16 }}>☰</button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 500, letterSpacing: '-0.02em' }}>Overview</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Monitor your Travel Rule transmissions</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {lastRefresh && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Updated {lastRefresh.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}</span>}
              <button onClick={load} style={{ fontSize: 12, background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}>Refresh</button>
            </div>
          </div>

          <div className="stat-grid">
            {[
              { label: 'Total transmissions', value: total, color: '#1D9E75' },
              { label: 'Transmitted', value: sent, color: '#378ADD' },
              { label: 'Received', value: received, color: '#5DCAA5' },
              { label: 'Full payload', value: full, color: '#EF9F27' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
                {loading
                  ? <div className="skeleton" style={{ height: 36, width: 60, marginBottom: 12 }} />
                  : <div style={{ fontSize: 32, fontWeight: 500, color: '#fff', marginBottom: 4 }}>{s.value}</div>
                }
                <Sparkline color={s.color} />
              </div>
            ))}
          </div>

          <div className="tables-grid">
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem' }}>Recent transmissions</div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '38%' }}>Transaction ID</th>
                      <th style={{ width: '18%' }}>Amount</th>
                      <th style={{ width: '18%' }}>Type</th>
                      <th style={{ width: '18%' }}>Status</th>
                      <th style={{ width: '8%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [1,2].map(i => (
                        <tr key={i}>
                          {[1,2,3,4,5].map(j => (
                            <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 3 }} /></td>
                          ))}
                        </tr>
                      ))
                    ) : txs.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '2rem' }}>No transmissions yet</td></tr>
                    ) : txs.map((t, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{t.arcTransactionId?.slice(4, 20)}...</td>
                        <td>R {Number(t.amountZar).toLocaleString('en-ZA')}</td>
                        <td><Badge type={t.threshold}>{t.threshold}</Badge></td>
                        <td><Badge type={t.status}>{t.status}</Badge></td>
                        <td>
                          <button className="copy-btn" onClick={() => copyToClipboard(t.arcTransactionId, i)}>
                            {copied === i ? '✓' : 'copy'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem' }}>Registered CASPs</div>
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40%' }}>CASP ID</th>
                      <th style={{ width: '25%' }}>Country</th>
                      <th style={{ width: '25%' }}>Status</th>
                      <th style={{ width: '10%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      [1,2].map(i => (
                        <tr key={i}>
                          {[1,2,3,4].map(j => (
                            <td key={j}><div className="skeleton" style={{ height: 14, borderRadius: 3 }} /></td>
                          ))}
                        </tr>
                      ))
                    ) : casps.length === 0 ? (
                      <tr><td colSpan={4} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.2)', padding: '2rem' }}>No CASPs registered</td></tr>
                    ) : casps.map((c, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{c.caspId}</td>
                        <td>{c.country}</td>
                        <td><Badge type="received">Active</Badge></td>
                        <td>
                          <button className="copy-btn" onClick={() => copyToClipboard(c.caspId, `casp-${i}`)}>
                            {copied === `casp-${i}` ? '✓' : 'copy'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.15)', textAlign: 'center', paddingTop: '1rem', borderTop: '0.5px solid rgba(255,255,255,0.05)' }}>
            Sove by Eoniix · Travel Rule Compliance · {new Date().getFullYear()}
          </div>
        </main>
      </div>
    </>
  );
}

function Sparkline({ color }) {
  const points = [30,45,35,60,40,70,55,80,65,90];
  const max = Math.max(...points);
  const w = 100, h = 28;
  const pts = points.map((p,i) => `${(i/(points.length-1))*w},${h-(p/max)*h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block', marginTop: 8, opacity: 0.6 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Badge({ type, children }) {
  const styles = {
    sent: { background: 'rgba(55,138,221,0.15)', color: '#85B7EB', border: '0.5px solid rgba(55,138,221,0.3)' },
    received: { background: 'rgba(29,158,117,0.15)', color: '#5DCAA5', border: '0.5px solid rgba(29,158,117,0.3)' },
    failed: { background: 'rgba(226,75,74,0.15)', color: '#F09595', border: '0.5px solid rgba(226,75,74,0.3)' },
    full: { background: 'rgba(239,159,39,0.15)', color: '#FAC775', border: '0.5px solid rgba(239,159,39,0.3)' },
    reduced: { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '0.5px solid rgba(255,255,255,0.1)' },
  };
  const s = styles[type] || styles.reduced;
  return <span style={{ ...s, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 20, display: 'inline-block' }}>{children}</span>;
}
