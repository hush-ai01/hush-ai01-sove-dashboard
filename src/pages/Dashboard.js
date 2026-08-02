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

export default function Dashboard({ onSignOut }) {
  const [txs, setTxs] = useState([]);
  const [casps, setCasps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [activeNav, setActiveNav] = useState('Overview');

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

  const total = txs.length;
  const sent = txs.filter(t => t.status === 'sent').length;
  const received = txs.filter(t => t.status === 'received').length;
  const full = txs.filter(t => t.threshold === 'full').length;
  const keyPrefix = KEY().slice(0, 14) + '...';

  return (
    <div style={{ minHeight:'100vh', background:'#030610', color:'#fff', fontFamily:'-apple-system, BlinkMacSystemFont, Inter, sans-serif', display:'flex' }}>
      <aside style={{ width:220, minHeight:'100vh', background:'#06111f', borderRight:'0.5px solid rgba(255,255,255,0.08)', padding:'1.5rem 1rem', display:'flex', flexDirection:'column', justifyContent:'space-between', position:'fixed', top:0, left:0, bottom:0 }}>
        <div>
          <div style={{ marginBottom:'2rem' }}>
            <div style={{ fontSize:16, fontWeight:500, color:'#fff', letterSpacing:'-0.02em' }}>Sove <span style={{ color:'#1D9E75' }}>Arc</span></div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:2 }}>Travel Rule Compliance</div>
          </div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:8, paddingLeft:12 }}>Main</div>
          <nav>
            {navItems.map(item => (
              <div key={item.label} onClick={() => setActiveNav(item.label)} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:10, marginBottom:2, cursor:'pointer', fontSize:13, fontWeight:activeNav === item.label ? 500 : 400, color:activeNav === item.label ? '#fff' : 'rgba(255,255,255,0.45)', background:activeNav === item.label ? 'rgba(255,255,255,0.06)' : 'transparent', borderLeft:activeNav === item.label ? '2px solid #1D9E75' : '2px solid transparent', transition:'all 0.15s' }}>
                <span style={{ fontSize:14, color:activeNav === item.label ? '#1D9E75' : 'rgba(255,255,255,0.3)' }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </nav>
        </div>
        <div>
          <div style={{ background:'rgba(29,158,117,0.06)', border:'0.5px solid rgba(29,158,117,0.2)', borderRadius:12, padding:'1rem', marginBottom:12 }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.4)', marginBottom:4 }}>Connected as</div>
            <div style={{ fontSize:12, color:'#fff', fontFamily:'monospace', wordBreak:'break-all' }}>{keyPrefix}</div>
            <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#1D9E75', boxShadow:'0 0 6px rgba(29,158,117,0.8)' }}></div>
              <span style={{ fontSize:11, color:'#1D9E75' }}>Active</span>
            </div>
          </div>
          <button onClick={() => { clearAuth(); onSignOut(); }} style={{ width:'100%', background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'8px', fontSize:12, color:'rgba(255,255,255,0.5)', cursor:'pointer' }}>Sign out</button>
        </div>
      </aside>

      <main style={{ marginLeft:220, padding:'1.5rem 2rem', minHeight:'100vh', width:'100%' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem' }}>
          <div>
            <div style={{ fontSize:20, fontWeight:500, letterSpacing:'-0.02em' }}>Overview</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginTop:2 }}>Monitor your Travel Rule transmissions</div>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {lastRefresh && <span style={{ fontSize:12, color:'rgba(255,255,255,0.3)' }}>Updated {lastRefresh.toLocaleTimeString('en-ZA', { hour:'2-digit', minute:'2-digit' })}</span>}
            <button onClick={load} style={{ fontSize:12, background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 14px', cursor:'pointer', color:'rgba(255,255,255,0.6)' }}>Refresh</button>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:12, marginBottom:'1.5rem' }}>
          {[
            { label:'Total transmissions', value:total, color:'#1D9E75' },
            { label:'Transmitted', value:sent, color:'#378ADD' },
            { label:'Received', value:received, color:'#5DCAA5' },
            { label:'Full payload', value:full, color:'#EF9F27' },
          ].map(s => (
            <div key={s.label} style={{ background:'linear-gradient(135deg, rgba(29,158,117,0.08), rgba(29,158,117,0))', border:'0.5px solid rgba(29,158,117,0.2)', borderRadius:10, padding:'0.875rem 1rem' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
              <div style={{ fontSize:28, fontWeight:500, color:'#fff' }}>{loading ? '—' : s.value}</div>
              <Sparkline color={s.color} />
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:'1.5rem' }}>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.7)', marginBottom:'0.75rem' }}>Recent transmissions</div>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:10, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width:'40%', fontSize:10, color:'rgba(255,255,255,0.3)', padding:'10px 14px', textAlign:'left', borderBottom:'0.5px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Transaction</th>
                    <th style={{ width:'20%', fontSize:10, color:'rgba(255,255,255,0.3)', padding:'10px 14px', textAlign:'left', borderBottom:'0.5px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Amount</th>
                    <th style={{ width:'20%', fontSize:10, color:'rgba(255,255,255,0.3)', padding:'10px 14px', textAlign:'left', borderBottom:'0.5px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Type</th>
                    <th style={{ width:'20%', fontSize:10, color:'rgba(255,255,255,0.3)', padding:'10px 14px', textAlign:'left', borderBottom:'0.5px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={4} style={{ padding:'2rem', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13 }}>Loading...</td></tr>
                  : txs.length === 0 ? <tr><td colSpan={4} style={{ padding:'2rem', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13 }}>No transmissions yet</td></tr>
                  : txs.map((t, i) => (
                    <tr key={i}>
                      <td style={{ padding:'10px 14px', fontSize:11, color:'rgba(255,255,255,0.8)', borderBottom:'0.5px solid rgba(255,255,255,0.05)', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.arcTransactionId?.slice(4,20)}...</td>
                      <td style={{ padding:'10px 14px', fontSize:13, color:'rgba(255,255,255,0.8)', borderBottom:'0.5px solid rgba(255,255,255,0.05)' }}>R {Number(t.amountZar).toLocaleString('en-ZA')}</td>
                      <td style={{ padding:'10px 14px', fontSize:13, borderBottom:'0.5px solid rgba(255,255,255,0.05)' }}><Badge type={t.threshold}>{t.threshold}</Badge></td>
                      <td style={{ padding:'10px 14px', fontSize:13, borderBottom:'0.5px solid rgba(255,255,255,0.05)' }}><Badge type={t.status}>{t.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div style={{ fontSize:13, fontWeight:500, color:'rgba(255,255,255,0.7)', marginBottom:'0.75rem' }}>Registered CASPs</div>
            <div style={{ background:'rgba(255,255,255,0.02)', border:'0.5px solid rgba(255,255,255,0.07)', borderRadius:10, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', tableLayout:'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width:'40%', fontSize:10, color:'rgba(255,255,255,0.3)', padding:'10px 14px', textAlign:'left', borderBottom:'0.5px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', textTransform:'uppercase', letterSpacing:'0.06em' }}>CASP ID</th>
                    <th style={{ width:'30%', fontSize:10, color:'rgba(255,255,255,0.3)', padding:'10px 14px', textAlign:'left', borderBottom:'0.5px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Country</th>
                    <th style={{ width:'30%', fontSize:10, color:'rgba(255,255,255,0.3)', padding:'10px 14px', textAlign:'left', borderBottom:'0.5px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <tr><td colSpan={3} style={{ padding:'2rem', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13 }}>Loading...</td></tr>
                  : casps.length === 0 ? <tr><td colSpan={3} style={{ padding:'2rem', textAlign:'center', color:'rgba(255,255,255,0.2)', fontSize:13 }}>No CASPs registered</td></tr>
                  : casps.map((c, i) => (
                    <tr key={i}>
                      <td style={{ padding:'10px 14px', fontSize:11, color:'rgba(255,255,255,0.8)', borderBottom:'0.5px solid rgba(255,255,255,0.05)', fontFamily:'monospace' }}>{c.caspId}</td>
                      <td style={{ padding:'10px 14px', fontSize:13, color:'rgba(255,255,255,0.8)', borderBottom:'0.5px solid rgba(255,255,255,0.05)' }}>{c.country}</td>
                      <td style={{ padding:'10px 14px', fontSize:13, borderBottom:'0.5px solid rgba(255,255,255,0.05)' }}><Badge type="received">Active</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ fontSize:12, color:'rgba(255,255,255,0.15)', textAlign:'center', paddingTop:'1rem', borderTop:'0.5px solid rgba(255,255,255,0.05)' }}>
          Sove by Eoniix · Travel Rule Compliance · {new Date().getFullYear()}
        </div>
      </main>
    </div>
  );
}

function Sparkline({ color }) {
  const points = [30,45,35,60,40,70,55,80,65,90];
  const max = Math.max(...points);
  const w = 120, h = 32;
  const pts = points.map((p,i) => `${(i/(points.length-1))*w},${h-(p/max)*h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display:'block', marginTop:12, opacity:0.7 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Badge({ type, children }) {
  const styles = {
    sent: { background:'rgba(55,138,221,0.15)', color:'#85B7EB', border:'0.5px solid rgba(55,138,221,0.3)' },
    received: { background:'rgba(29,158,117,0.15)', color:'#5DCAA5', border:'0.5px solid rgba(29,158,117,0.3)' },
    failed: { background:'rgba(226,75,74,0.15)', color:'#F09595', border:'0.5px solid rgba(226,75,74,0.3)' },
    full: { background:'rgba(239,159,39,0.15)', color:'#FAC775', border:'0.5px solid rgba(239,159,39,0.3)' },
    reduced: { background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)', border:'0.5px solid rgba(255,255,255,0.1)' },
  };
  const s = styles[type] || styles.reduced;
  return <span style={{ ...s, fontSize:11, fontWeight:500, padding:'2px 8px', borderRadius:20, display:'inline-block' }}>{children}</span>;
}
