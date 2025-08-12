"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'next-i18next';
import { supabase } from '../../lib/supabaseClient';

export default function UserProfileForm({ user }: { user: any }) {
  const { t } = useTranslation('user-profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [msg, setMsg] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let uploadedUrl = avatarUrl;
    if (avatar) {
      const formData = new FormData();
      formData.append('file', avatar);
      const res = await fetch('/api/upload-avatar', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) uploadedUrl = data.url;
    }
    const res = await fetch('/api/user-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, name, email, avatar_url: uploadedUrl })
    });
    if (res.ok) setMsg(t('save') + 'd!');
    else setMsg('Error');
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
      setMsg('Passwords do not match');
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) setMsg(error.message);
    else setMsg('Password changed!');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label htmlFor="name">{t('name')}</label>
        <input id="name" value={name} onChange={e => setName(e.target.value)} className="w-full mb-2" />
        <label htmlFor="email">{t('email')}</label>
        <input id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mb-2" />
        <label htmlFor="avatar">{t('avatar')}</label>
        <input id="avatar" type="file" accept="image/*" onChange={e => setAvatar(e.target.files?.[0] || null)} className="w-full mb-2" />
        {avatarUrl && <img src={avatarUrl} alt="avatar" style={{ width: 80, height: 80, borderRadius: '50%' }} />}
        <button className="btn-primary" type="submit">{t('save')}</button>
      </form>
      <button className="btn-primary mt-6" type="button" onClick={() => setShowPw(s => !s)}>{t('change_password')}</button>
      {showPw && (
        <form onSubmit={handleChangePassword} className="space-y-2 mt-4">
          <label htmlFor="currentPw">{t('current_password')}</label>
          <input id="currentPw" type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} className="w-full mb-2" />
          <label htmlFor="newPw">{t('new_password')}</label>
          <input id="newPw" type="password" value={newPw} onChange={e => setNewPw(e.target.value)} className="w-full mb-2" />
          <label htmlFor="confirmPw">{t('confirm_password')}</label>
          <input id="confirmPw" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} className="w-full mb-2" />
          <button className="btn-primary" type="submit">{t('change_password')}</button>
        </form>
      )}
      {msg && <div className="mt-2">{msg}</div>}
    </>
  );
}
