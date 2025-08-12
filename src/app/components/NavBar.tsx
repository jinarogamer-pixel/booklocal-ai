"use client";
import Link from 'next/link';
import { useUser } from './AuthProvider';
import { useState } from 'react';
import AuthModal from './AuthModal';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/onboarding', label: 'Onboarding' },
  { href: '/provider-analytics', label: 'Analytics' },
  { href: '/admin', label: 'Admin' },
  { href: '/payments', label: 'Payments' },
  { href: '/chat', label: 'Chat' },
  { href: '/user-profile', label: 'Profile' },
  { href: '/legal/privacy', label: 'Privacy' },
  { href: '/legal/terms', label: 'Terms' },
];

export default function NavBar() {
  const { user, signOut, loading } = useUser();
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <nav className="glass-card" style={{
      display: 'flex',
      gap: 24,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem 2rem',
      margin: '2rem auto 2.5rem auto',
      maxWidth: 900,
      borderRadius: 18,
      fontWeight: 600,
      fontSize: '1.08rem',
      position: 'relative',
      zIndex: 10,
    }}>
      {navLinks.map(link => (
        <Link key={link.href} href={link.href} className="hover:underline focus:underline" style={{ color: 'var(--foreground)' }}>
          {link.label}
        </Link>
      ))}
      <div style={{ marginLeft: 'auto' }} />
      {loading ? null : user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontWeight: 500, fontSize: '1rem' }}>{user.email}</span>
          <button className="btn-primary" style={{ padding: '0.4rem 1.1rem', fontSize: '1rem' }} onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <button className="btn-primary" style={{ padding: '0.4rem 1.1rem', fontSize: '1rem' }} onClick={() => setAuthOpen(true)}>Sign In</button>
      )}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </nav>
  );
}
