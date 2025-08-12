"use client";
import { useState } from 'react';

export default function AvatarUpload() {
  const [preview, setPreview] = useState<string | null>(null);
  return (
    <div className="glass-card" style={{ maxWidth: 500, margin: '3rem auto' }}>
      <h1 className="hero-title" style={{ marginBottom: '1.5rem' }}>Upload Avatar</h1>
      <input type="file" accept="image/*" onChange={e => {
        const file = e.target.files?.[0];
        if (file) setPreview(URL.createObjectURL(file));
      }} />
      {preview && <img src={preview} alt="Avatar Preview" style={{ marginTop: 16, borderRadius: '50%', width: 120, height: 120, objectFit: 'cover' }} />}
    </div>
  );
}
