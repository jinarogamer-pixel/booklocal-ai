"use client";
import { useState } from 'react';
import { getSupabase } from '../../lib/supabaseClient';

interface User {
  id: string;
  email: string;
  email_confirmed?: boolean;
}
export default function AccountSecurity({ user }: { user: User }) {
  const [msg, setMsg] = useState('');
  const [mfaUrl, setMfaUrl] = useState('');
  const [showDelete, setShowDelete] = useState(false);


  const supabase = getSupabase();

  async function resendVerification() {
    const { error } = await supabase.auth.resend({ type: 'signup', email: user.email });
    if (error) setMsg(error.message);
    else setMsg('Verification email sent!');
  }

  async function setupMfa() {
    setMsg('');
    const res = await fetch(`/api/mfa-totp?email=${encodeURIComponent(user.email)}`);
    const data = await res.json();
    setMfaUrl(data.qr);
    setMsg('Scan this QR code in your Authenticator app.');
  }

  async function deleteAccount() {
    setMsg('');
    const res = await fetch('/api/delete-account', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id })
    });
    if (res.ok) setMsg('Account deleted.');
    else setMsg('Error deleting account.');
  }

  return (
    <div className="mt-8">
      <h2 className="section-title mb-2">Account Security</h2>
      <div className="mb-2">
        Email verified: <b>{user.email_confirmed ? 'Yes' : 'No'}</b>
        {!user.email_confirmed && (
          <button className="btn-primary ml-2" onClick={resendVerification} type="button">Resend Verification</button>
        )}
      </div>
      <div className="mb-2">
        <button className="btn-primary" onClick={setupMfa} type="button">Enable MFA</button>
        {mfaUrl && <div className="mt-2"><img src={mfaUrl} alt="MFA QR" style={{ width: 180, height: 180 }} /></div>}
      </div>
      <div className="mb-2">
        <button className="btn-primary" style={{ background: '#ef4444' }} onClick={() => setShowDelete(true)} type="button">Delete Account</button>
        {showDelete && (
          <div className="mt-2">
            <b>Are you sure?</b>
            <button className="btn-primary ml-2" style={{ background: '#ef4444' }} onClick={deleteAccount} type="button">Yes, Delete</button>
            <button className="btn-primary ml-2" onClick={() => setShowDelete(false)} type="button">Cancel</button>
          </div>
        )}
      </div>
      {msg && <div className="mt-2">{msg}</div>}
    </div>
  );
}
