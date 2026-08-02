import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { isAuthed } from './api';

export default function App() {
  const [authed, setAuthed] = useState(isAuthed());
  return authed
    ? <Dashboard onSignOut={() => setAuthed(false)} />
    : <Login onLogin={() => setAuthed(true)} />;
}
