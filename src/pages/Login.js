import React, { useState } from 'react';
import { saveAuth } from '../api';

export default function Login({ onLogin }) {
  const [key, setKey] = useState('');
  const [base, setBase] = useState('https://eoniix-kyc-api.onrender.com');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleLogin() {
    if (!key.trim()) return;
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(base + '/health');
      if (!res.ok) throw new Error();
      saveAuth(key.trim(), base.trim());
      onLogin();
    } catch {
      setErr('Could not connect. Check your API key and base URL.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#030610', display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', fontFamily:'-apple-system, BlinkMacSystemFont, Inter, sans-serif' }}>
      <div style={{ width:'100%', maxWidth:400 }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:28, fontWeight:500, color:'#fff', letterSpacing:'-0.03em' }}>
            Sove <span style={{ color:'#1D9E75' }}>Dashboard</span>
          </div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.4)', marginTop:6 }}>Identity and compliance infrastructure</div>
        </div>
        <div style={{ background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:16, padding:'1.75rem' }}>
          <div style={{ marginBottom:'1rem' }}>
            <label style={{ fontSize:11, color:'rgba(255,255,255,0.4)', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>API key</label>
            <input type="password" value={key} onChange={e => setKey(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} placeholder="sove_..." style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:14, color:'#fff', outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:'1.5rem' }}>
            <label style={{ fontSize:11, color:'rgba(255,255,255,0.4)', display:'block', marginBottom:8, textTransform:'uppercase', letterSpacing:'0.08em' }}>Base URL</label>
            <input type="text" value={base} onChange={e => setBase(e.target.value)} style={{ width:'100%', padding:'10px 12px', background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:8, fontSize:13, color:'rgba(255,255,255,0.6)', outline:'none', boxSizing:'border-box' }} />
          </div>
          {err && <div style={{ fontSize:12, color:'#f09595', marginBottom:'1rem' }}>{err}</div>}
          <button onClick={handleLogin} disabled={loading} style={{ width:'100%', background:loading ? 'rgba(29,158,117,0.5)' : '#1D9E75', color:'#fff', border:'none', borderRadius:8, padding:'11px', fontSize:14, fontWeight:500, cursor:loading ? 'not-allowed' : 'pointer', boxShadow:loading ? 'none' : '0 0 24px rgba(29,158,117,0.4)', transition:'all 0.2s' }}>
            {loading ? 'Connecting...' : 'Connect'}
          </button>
        </div>
        <div style={{ textAlign:'center', marginTop:'1.5rem', fontSize:12, color:'rgba(255,255,255,0.2)' }}>
          Sove by Eoniix · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
