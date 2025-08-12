"use client";

import { useEffect, useState } from "react";
import { useUser } from "./AuthProvider";

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signIn, signUp } = useUser();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const fn = mode === 'login' ? signIn : signUp;
    const result = await fn(email, password) as { error?: unknown };
    setLoading(false);
    const error = result?.error;
    if (error) {
      if (typeof error === 'object' && error && 'message' in error && typeof (error as any).message === 'string') {
        setError((error as { message: string }).message);
      } else {
        setError('An unknown error occurred.');
      }
    } else onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.18)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ minWidth: 340, maxWidth: 380, position: 'relative' }}>
        <h2 className="section-title mb-2">{mode === 'login' ? 'Sign In' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit}>
          <input className="w-full mb-3" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="w-full mb-3" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <div style={{ color: '#ef4444', marginBottom: 8 }}>{error}</div>}
          <button className="btn-primary w-full" type="submit" disabled={loading}>{loading ? 'Loading...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}</button>
        </form>
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          {mode === 'login' ? (
            <span>New here? <button style={{ color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setMode('signup')}>Sign Up</button></span>
          ) : (
            <span>Already have an account? <button style={{ color: '#0ea5e9', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setMode('login')}>Sign In</button></span>
          )}
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 18, background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer' }} aria-label="Close">×</button>
      </div>
    </div>
  );
}
